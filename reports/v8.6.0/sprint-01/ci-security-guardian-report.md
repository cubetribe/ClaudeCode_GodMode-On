---
agent: ci-security-guardian
version: v8.6.0
date: 2026-07-06
status: complete
task: Review release-consistency.yml new "Hook contract check" step and scripts/test-hooks-contract.js for CI security implications (sprint-01-hook-repair)
---

# CI Security Review — Sprint 01 Hook Repair

## Scope

- `.github/workflows/release-consistency.yml` — one new step, "Hook contract check", running `node scripts/test-hooks-contract.js`
- `scripts/test-hooks-contract.js` — new script, executed by CI, spawns child node processes with stdin payloads against `os.tmpdir()` fixtures
- `config/claude-settings.json`, `.claude-plugin/plugin.json`, `templates/settings.local.json.template` — hook wiring changes this sprint

## Findings

### BLOCKER
None.

### WARNING
None.

### SUGGESTION

1. **`scripts/test-hooks-contract.js` — bound the `spawnSync` timeout more tightly per-probe.**
   Current default is `timeoutMs = 15000` per probed script, with up to ~7 probes in the file (session-start, 3x check-api-impact, 3x validate-agent-output). Worst case is roughly 105s of spawn time before CI's own job-level timeout intervenes. This is a robustness/CI-cost suggestion, not a security gap — `spawnSync`'s `timeout` option reliably kills the child on expiry (SIGTERM), so a hung child cannot hang the job indefinitely. Consider a lower per-probe timeout (e.g. 5000ms) since these are local, dependency-free `node` invocations that should return in milliseconds.

2. **Document the intentional-failure window in the script's own header or a code comment near the `check-api-impact.js` "Probe (a)"** — the comment at lines 238-241 already explains this is expected to fail mid-sprint pending builder-A's stdin port. This is good practice already present; just flagging it so a future maintainer doesn't mistake an expected-red CI run for a security regression. No action required if the sprint's acceptance criteria track this explicitly (recommend confirming against `plans/v8.6.0/sprint-01-hook-repair.md`).

3. **Consider asserting `resolveRepoScript` only ever matches a path under `scripts/` with no `..` traversal.** Currently `path.join(REPO_ROOT, 'scripts', basename)` uses only `path.basename(scriptToken)`, which already strips any directory components (including `../`) from the resolved token before joining — this is correct and already closes the traversal vector. No change required; noting the mechanism explicitly for the audit trail since a naive reviewer might otherwise flag `resolveRepoScript` as unsafe.

## Analysis — Attack Surface Question (mandatory conclusion)

**Question:** Does spawning hook-wired scripts from `scripts/test-hooks-contract.js` in CI expand the attack surface beyond what any PR already has, given a malicious PR could point a hook command in `config/claude-settings.json` at an arbitrary repo file?

**Conclusion: No material expansion of attack surface.**

Reasoning:

- `resolveRepoScript()` extracts only `path.basename(scriptToken)` from the wired command and joins it against a hardcoded `path.join(REPO_ROOT, 'scripts', basename)`. A malicious PR editing `config/claude-settings.json` to point at `../../etc/passwd.js` or any path outside `scripts/` cannot escape this join — `path.basename` strips all directory components, so the worst a hostile edit can do is redirect the *filename component* to another file that must still physically exist inside `scripts/` in the same PR. That file's content is under the same PR's control regardless, since the PR can just as easily edit `.github/workflows/*.yml` directly, or edit any `scripts/*.js` file directly, or add a new workflow step outright.
- On `pull_request` (not `pull_request_target`), GitHub Actions checks out and runs the PR's own merge-ref code with a **read-only** `GITHUB_TOKEN` and no access to repository secrets from protected contexts. A malicious PR author already has full read/write over every file in the PR — including the workflow file itself — so being able to make a hook command spawn `scripts/whatever-they-added.js` grants zero privilege beyond what direct edits to `.yml` or `.js` files already grant them. There is no secret, no elevated token, no cross-repo/cross-branch write, and no privilege boundary crossed that a plain "add a `run:` step" PR could not already cross.
- Fork PRs run with the fork's own workflow file (GitHub uses the base repo's *trigger* config but the *fork's* file content for `pull_request`, and always issues a scoped, read-only token with no secrets) — consistent with the above: no elevation.
- The test script does not fetch, curl, or otherwise reach the network from any probe; it only spawns `process.execPath` (node) against a resolved local path with fixture stdin. No environment-variable leakage: `spawnSync` in this file does not pass `env` overrides, so children inherit the CI runner's default environment, which for `pull_request` workflows already excludes repository secrets.
- Temp fixtures are created exclusively via `os.tmpdir()` (`fs.mkdtempSync(path.join(os.tmpdir(), 'ccgm-hooks-contract-'))`), never inside the repo checkout, and are removed in `finally` blocks after each probe — no persistent write surface, no repo-tree pollution risk.

**Net assessment:** the new workflow step does not introduce a new privilege boundary, does not touch secrets, does not add network egress, and does not allow path traversal outside `scripts/`. The described "weaponization" scenario collapses to "a malicious PR can run arbitrary code it already committed to the repo," which is already true of every `pull_request`-triggered CI job on GitHub, mitigated the standard way (read-only token, no secrets, required review before merge).

## Workflow Review (`.github/workflows/release-consistency.yml`)

| Check | Result |
|---|---|
| `permissions: contents: read` at workflow level, no job-level override | PASS — unchanged, least-privilege |
| Trigger surface | PASS — still only `pull_request:`, no new triggers added |
| `pull_request_target` usage | PASS — not used anywhere in this diff |
| Secrets in YAML | PASS — no `secrets.*` references added; new step has no `env:` block at all |
| Shell injection from PR-controlled data | PASS — new step is `run: node scripts/test-hooks-contract.js` with no argument interpolation, no `${{ github.event.* }}` substitution into the shell command |
| Actions pinning | INFO (pre-existing, out of diff scope) — `actions/checkout@v4` and `actions/setup-node@v4` are tag-pinned, not SHA-pinned. This predates the current diff and is not part of the reviewed change; flagging as a pre-existing item for a future dedicated pinning pass, not a blocker for this sprint. |

## Hook Wiring Files (this sprint)

- `config/claude-settings.json`: all five hook commands are static strings (`node ~/.claude/scripts/session-start.js`, `node scripts/check-api-impact.js`, `node ~/.claude/scripts/validate-agent-output.js` x3). No variable interpolation, no `$()`/backtick command substitution, no untrusted-input concatenation. PASS.
- `.claude-plugin/plugin.json`: diff removes `\"$CLAUDE_FILE_PATH\"` argument from the `check-api-impact.js` invocation, leaving `node ${CLAUDE_PLUGIN_ROOT}/scripts/check-api-impact.js` with no user-controlled argv. `${CLAUDE_PLUGIN_ROOT}` is a runtime-populated Claude Code plugin path variable (explicitly allow-listed by the sprint's own `FORBIDDEN_CLAUDE_VAR_RE` regex), not PR- or attacker-controlled. PASS — this is a net risk reduction (removal of an argv-interpolated variable that never worked anyway).
- `templates/settings.local.json.template`: same pattern — `\"$CLAUDE_FILE_PATH\"` removed from `check-api-impact.js` invocation. PASS, same reasoning.

No command injection surface was added by any of the three hook wiring files; the sprint's change is strictly a removal of a dead/broken variable reference, which also happens to close off a (non-exploitable, since it was never populated) interpolation point.

## Files Changed

none — review only

