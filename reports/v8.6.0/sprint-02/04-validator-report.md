---
agent: validator
version: v8.6.0
date: 2026-07-06
status: complete
task: Validate Sprint 02 (install-sync) — apply-global-claude-setup.sh --fix-hooks and session-start.js drift guard
---

# @validator Report — Sprint 02: Install Sync & Drift Guard

## Scope Reviewed
- `git diff HEAD -- scripts/apply-global-claude-setup.sh scripts/session-start.js`
- `reports/v8.6.0/sprint-02/03-builder-report.md`
- Binding sprint file: `plans/v8.6.0/sprint-02-install-sync.md`

All probes run against isolated fixture `$HOME` directories under the session scratchpad. The real `~/.claude` was never touched.

## Findings

### 1. [CRITICAL] Canonical `PostToolUse` wiring not fully argument-free / not `~/.claude/scripts/`-anchored

`config/claude-settings.json` (the canonical source `fix_hooks()` merges from) wires `PostToolUse` as:
```
"command": "node scripts/check-api-impact.js"
```
This is a **relative** path (`scripts/check-api-impact.js`), not `~/.claude/scripts/check-api-impact.js` like the other four canonical events (`SessionStart`, `SubagentStop`, `TaskCompleted`, `TeammateIdle`, all wired as `node ~/.claude/scripts/<basename>`).

`adjustCommand()` in the embedded `node -e` block only rewrites strings matching the regex `/(\S*)~\/\.claude\/scripts\/(\S+)/` — i.e., it only fixes commands that already contain the literal `~/.claude/scripts/` prefix. Since the canonical `PostToolUse` source string never contains that prefix, it passes through **unmodified** into the target `settings.json`.

**Fixture reproduction:**
```
HOME=<fixture> bash scripts/apply-global-claude-setup.sh --fix-hooks
```
Result for `PostToolUse` in the merged output:
```json
"PostToolUse": [{ "matcher": "Write|Edit", "hooks": [{ "type": "command", "command": "node scripts/check-api-impact.js", "timeout": 30 }] }]
```
vs. the other four canonical events, correctly rewritten to the fixture's absolute `$HOME`, e.g.:
```json
"SessionStart": [{ "hooks": [{ "type": "command", "command": "node /.../fixture1-home/.claude/scripts/session-start.js", "timeout": 15 }] }]
```

This fails the fixture instruction's explicit assertion: "five canonical events argument-free pointing at `~/.claude/scripts/<basename>` (`$HOME`-expanded)". `PostToolUse` is argument-free (good) but is **not** anchored to `~/.claude/scripts/` — it depends on the invoking shell's `cwd`, which is not a safe invariant for a hook that Claude Code may invoke from any working directory. This is the same class of bug the sprint is meant to fix (silent env-dependent breakage), just reintroduced via the canonical source file rather than the repair logic.

**Root cause location:** `config/claude-settings.json`, `hooks.PostToolUse[0].hooks[0].command` — should be `node ~/.claude/scripts/check-api-impact.js` to match the other four canonical entries and to be correctly rewritten by `fix_hooks()`.

Note: `node scripts/test-hooks-contract.js` does not catch this because it only checks "no forbidden `$CLAUDE_*` var" and "repo script exists," not command-path anchoring/portability — so this gap is currently untested by the existing regression suite too.

### 2. [LOW] Untracked stray file outside sprint scope

`conversation-tomevault-lizenz-beratung.md` is untracked in `git status` but is unrelated to Sprint 02's write scope (not one of the two scripts, not the sprint plan, not the report folder). Not a sprint-02 regression — flagging only because the Acceptance Criteria's write-scope conformance check asks for confirmation that only sprint-owned paths changed. Recommend orchestrator/user confirm this file is intentional leftover from unrelated work and not accidentally staged.

### 3. [INFO] `--fix-hooks` step failure inside a full install run is non-fatal by design

When `--fix-hooks` is combined with a normal install run and the fix step fails (e.g., broken JSON), the script prints a warning to stderr and continues (`fix_hooks || echo "Warning..." >&2`), returning overall exit 0 for the install. This matches the sprint's intent ("rest of install unaffected") but means a caller relying solely on the script's exit code will not detect a failed hook repair in composed-mode; only the standalone `--fix-hooks` invocation (`$# -eq 1`) returns the fix step's own exit code. Documented behavior, not a defect, but worth calling out for anyone scripting around this.

## Per-Criterion Evidence

### Probe 1 — Fixture fix-hooks success path
- Five canonical events merged: `SessionStart`, `SubagentStop`, `TaskCompleted`, `TeammateIdle` correctly rewritten to `$HOME`-expanded `~/.claude/scripts/<basename>`, argument-free. **`PostToolUse` FAILS** — argument-free but not `~/.claude/scripts/`-anchored (see Finding 1).
- `analyze-prompt.js` / `UserPromptSubmit` entry removed: **PASS** (`UserPromptSubmit` key entirely absent from output; console reported `offending hook entries removed: 1`).
- Custom top-level key (`customTopLevelKey`) preserved byte-equivalent: **PASS** (`JSON.stringify` comparison identical).
- Custom hook event (`CustomHookEvent`) preserved byte-equivalent: **PASS**.
- Backup file created: **PASS** — `~/.claude/backups/install-archives/<timestamp>/settings/settings.json`, byte-identical to pre-fix input.
- Output JSON parses: **PASS** — `node -e "require(...)"` succeeded post-fix.

### Probe 2 — Abort path (broken JSON)
- Fixture with syntactically invalid `settings.json` → `fix_hooks()` returns 1, prints `Error: ... is not valid JSON ... Repair or remove it manually first.`, **no write occurs** (SHA-1 of file before/after identical), **no backup directory created** (backup-first semantics honored — abort happens before backup, so nothing is left half-done). **PASS**.

### Probe 3 — session-start.js drift/degradation
- (a) Missing `~/.cc-godmode-version`: exit 0, banner renders, no Drift Guard section (no marker → no comparison possible, silent). **PASS**.
- (b) Mismatched marker vs `~/.claude/VERSION` and repo `VERSION`: exit 0, `Drift Guard` section renders both warnings ("Install v8.0.0 behind repo v8.5.0" and "~/.claude/VERSION (v8.6.0) != install marker (v8.0.0)"). **PASS**.
- (c) Unparseable `settings.json`: exit 0, no crash, no warning printed (`detectBrokenHookWiring` swallows the parse error and returns `false`, i.e., silent degradation as specified). **PASS**.
- Zero new output lines when healthy: diffed pre-change (`git stash`) vs post-change banner against an identical healthy fixture — only the health-check timing digits differ (`398ms` vs `468ms`); line count identical (30 vs 30), no new lines. **PASS**.

### Probe 4 — Shell quality
- `bash -n scripts/apply-global-claude-setup.sh`: **PASS** (no syntax errors).
- `grep -n "/Users/" scripts/apply-global-claude-setup.sh scripts/session-start.js`: **PASS** (no hardcoded `/Users/` paths).
- Embedded `node -e` uses `JSON.parse` / `JSON.stringify` round-trip exclusively; `grep -n "sed \|awk "` on the shell script found no matches. **PASS**.

### Probe 5 — Regression suite
- `node scripts/test-hooks-contract.js`: **28/28 checks passed**, exit 0. **PASS** (note: this suite does not currently assert canonical command path-anchoring, which is how Finding 1 slipped through — recommend @builder/@quality-operations consider adding that assertion in a follow-up).

### Probe 6 — Write-scope conformance
`git status --short`:
```
 M plans/v8.6.0/sprint-02-install-sync.md
 M scripts/apply-global-claude-setup.sh
 M scripts/session-start.js
?? conversation-tomevault-lizenz-beratung.md
?? reports/v8.6.0/sprint-02/
```
Matches the sprint's write scope (two scripts + sprint plan status edit + sprint-02 report folder), plus one unrelated untracked file (Finding 2, informational).

## Required Actions
- [ ] @builder: Fix `config/claude-settings.json` — change `PostToolUse` command from `node scripts/check-api-impact.js` to `node ~/.claude/scripts/check-api-impact.js` so it is rewritten consistently with the other four canonical events by `fix_hooks()`, and re-run Probe 1 to confirm all five canonical events are `$HOME`-anchored and argument-free.
- [ ] Consider (non-blocking, follow-up): extend `scripts/test-hooks-contract.js` to assert canonical hook commands are anchored to `~/.claude/scripts/` (not just argument-free / no forbidden vars), so this class of drift is caught automatically going forward.

## Files Changed
None — review only.

---

## Re-Validation Addendum (2026-07-06)

### Delta Reviewed
Builder's fix to `adjustCommand()` in `scripts/apply-global-claude-setup.sh`. The function now has two rewrite passes:
1. Form 1 (unchanged): `~/.claude/scripts/<name>.js` → `${claudeHome}/scripts/<name>.js`.
2. Form 2 (new): repo-relative `scripts/<name>.js` (bare, not already `~/.claude`- or absolute-prefixed) → `${claudeHome}/scripts/<name>.js`.

`config/claude-settings.json` itself was **not** modified — the fix lives entirely in the repair logic, which is the more robust place for it (handles any future canonical entry authored with either path style).

### Re-run of Fixture 1 (broken settings.json → `--fix-hooks`)
Same fixture as the original probe (broken env-var `PostToolUse` wiring, `analyze-prompt.js`/`UserPromptSubmit` entry, custom top-level key, custom hook event). Result:

- All **five** canonical events now `$HOME`-anchored and argument-free, including `PostToolUse`:
  ```
  "PostToolUse": "node <fixtureHOME>/.claude/scripts/check-api-impact.js"   (timeout 30, matcher preserved)
  "SessionStart": "node <fixtureHOME>/.claude/scripts/session-start.js"
  "SubagentStop": "node <fixtureHOME>/.claude/scripts/validate-agent-output.js"
  "TaskCompleted": "node <fixtureHOME>/.claude/scripts/validate-agent-output.js"
  "TeammateIdle": "node <fixtureHOME>/.claude/scripts/validate-agent-output.js"
  ```
  Previously, `PostToolUse` passed through as the un-anchored relative `node scripts/check-api-impact.js`. **RESOLVED.**
- `UserPromptSubmit` / `analyze-prompt.js` entry removed: **PASS** (key absent, `offending hook entries removed: 1`).
- `customTopLevelKey` preserved byte-equivalent: **PASS**.
- `CustomHookEvent` preserved byte-equivalent: **PASS**.
- Backup created under `~/.claude/backups/install-archives/<timestamp>/settings/settings.json`: **PASS**.
- Output JSON parses (`node -e "require(...)"`): **PASS**.

### Spot-Checks
- `bash -n scripts/apply-global-claude-setup.sh`: **PASS**, still clean.
- `grep -n "/Users/" scripts/apply-global-claude-setup.sh scripts/session-start.js`: **PASS**, no hardcoded paths introduced by the fix.
- `node scripts/test-hooks-contract.js`: **28/28 PASS**, no regressions from the Form 2 regex addition.
- `git status --short`: unchanged from prior validation — only `scripts/apply-global-claude-setup.sh`, `scripts/session-start.js`, `plans/v8.6.0/sprint-02-install-sync.md` (modified) and `reports/v8.6.0/sprint-02/` (new report dir) are in scope. The pre-existing unrelated untracked file `conversation-tomevault-lizenz-beratung.md` is still present (informational only, not sprint-02 scope — same as originally noted, not introduced by this fix).

### Verdict Update
Original CRITICAL finding (canonical `PostToolUse` command not `$HOME`-anchored) is **RESOLVED**. No new issues introduced by the fix. Probe 2 (abort path) and Probe 3 (session-start.js drift guard scenarios) were not part of this delta and were already fully passing in the original validation — re-checked here only indirectly via the unchanged `test-hooks-contract.js` and `git status` results, which show no regressions in files outside the touched `adjustCommand` function.

**Full sprint status: APPROVED.**
