---
sprint: 01
slug: hook-repair
plan: plans/v8.6.0/PLAN.md
status: planned
execution: parallel
owner: orchestrator
---

# Sprint 01 — Hook Repair & Contract Tests

## Goal
Restore the deterministic enforcement layer: make the PostToolUse API-impact hook
actually fire (it is a silent no-op today — Core Rule 4's automatic @api-guardian
trigger is dead), formally retire the zombie `analyze-prompt.js`, and add a hook
contract test so hook wiring can never silently break again. This is the highest-ROI
lever of the Fable-parity analysis (~1.05× token cost).

## Scope
- Port `scripts/check-api-impact.js` to the Claude Code hook contract: when invoked
  with no argv and stdin is not a TTY, read the JSON payload from stdin and extract
  `tool_input.file_path` (PostToolUse payload for Write/Edit) and `cwd`; keep the
  existing argv path as CLI mode (pattern: `validate-agent-output.js` runHookMode,
  lines 697–759). Empty/irrelevant payload ⇒ exit 0 (hooks must never break unrelated
  work). API-file match ⇒ existing consumer/breaking-change analysis output; exit 2
  only where the current design intends blocking (keep current non-blocking behavior,
  exit 0 with warning output).
- Rewire `config/claude-settings.json` PostToolUse to argument-free
  `node scripts/check-api-impact.js` (drop `"$CLAUDE_FILE_PATH"`).
- Deprecate `scripts/analyze-prompt.js` (v8.5 precedent workflow-state.js): header
  deprecation notice, no hook wiring anywhere, sweep active docs/prompts for
  references presenting it as a live hook (grep `analyze-prompt` outside CHANGELOG/
  reports/archive) and correct them.
- New `scripts/test-hooks-contract.js`: for every hook wired in
  `config/claude-settings.json`, spawn the target script exactly as wired (same argv)
  with a realistic simulated stdin payload; assert: no usage-error output, exit code
  ∈ {0,2}, and for `check-api-impact.js` that a synthetic API-file payload
  (e.g. `src/api/foo.ts`) produces the impact warning while a non-API payload exits 0
  silently; for `validate-agent-output.js` that a fresh valid report passes and a
  malformed one exits 2.
- Add `"hooks:test": "node scripts/test-hooks-contract.js"` to `package.json` scripts.
- Add a "Hook contract check" step to `.github/workflows/release-consistency.yml`.

## Non-Goals
- No rewrite of analyze-prompt.js functionality (deprecation only — PLAN.md D3).
- No changes to the live install (`~/.claude/`) — that is sprint 02.
- No new hook events.

## Files / Write Scope (ownership)
| Path / Glob | Writer | Notes |
|---|---|---|
| `scripts/check-api-impact.js` | @builder-A | stdin hook mode |
| `config/claude-settings.json` | @builder-A | argument-free PostToolUse wiring |
| `scripts/analyze-prompt.js` | @builder-A | deprecation header only |
| `CC-GodMode-Prompts/**`, `docs/**` (analyze-prompt refs only) | @builder-A | reference sweep |
| `scripts/test-hooks-contract.js` | @builder-B | new file |
| `package.json` | @builder-B | hooks:test script entry |
| `.github/workflows/release-consistency.yml` | @builder-B | CI step (security surface ⇒ @ci-security-guardian gate) |

## Risks
- Claude Code hook payload shape differs per event → mitigation: contract test uses the
  documented payload fields (`tool_input.file_path`, `cwd`) and tolerates extras;
  hook mode must degrade to exit 0 on unparseable payloads.
- CI edit is a security surface → mandatory @ci-security-guardian review (Full-Gates).

## Acceptance Criteria
- [ ] `echo '{"tool_input":{"file_path":"src/api/x.ts"},"cwd":"'$PWD'"}' | node scripts/check-api-impact.js` produces API-impact output; non-API path exits 0 silently.
- [ ] `config/claude-settings.json` contains no `$CLAUDE_*` variables.
- [ ] `node scripts/test-hooks-contract.js` passes locally.
- [ ] `release-consistency.yml` runs the hook contract check.
- [ ] No active doc/prompt presents analyze-prompt.js as a wired hook.

## Test / Validation Strategy
`node scripts/test-hooks-contract.js` (self-testing deliverable); manual stdin probes
per acceptance criteria; @validator diff review; @ci-security-guardian on the CI file.

## Changelog Note
Fixed: PostToolUse API-impact hook was a silent no-op (env-var wiring); now reads the
hook stdin payload — Core Rule 4's auto-trigger works again. Added hook contract test
(local + CI). Deprecated analyze-prompt.js.

## Version Relevance
patch — bug fixes + internal test tooling, no contract change.

## Preflight (checked at sprint start)
- [ ] `git status` clean (or only expected files from previous sprint)
- [ ] Plan/base assumptions still valid
- [ ] No other in-progress sprint owns overlapping files

## Result (filled at completion)
_pending_
