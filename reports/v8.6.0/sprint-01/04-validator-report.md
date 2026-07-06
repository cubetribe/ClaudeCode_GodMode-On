---
agent: validator
version: v8.6.0
date: 2026-07-06
status: complete
task: Validate Sprint 01 (hook-repair) acceptance criteria against uncommitted working tree, branch release/v8.6.0
---

# @validator Report — Sprint 01 Hook Repair

## Review Scope

Uncommitted working-tree diff vs HEAD on `release/v8.6.0` in
`/Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON`:

```
 M .claude-plugin/plugin.json
 M .github/workflows/release-consistency.yml
 M CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md
 M CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md
 M CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md
 M agents/tester.md
 M agents/validator.md
 M config/claude-settings.json
 M docs/orchestrator/META-DECISIONS.md
 M package.json
 M plans/v8.6.0/sprint-01-hook-repair.md
 M scripts/analyze-prompt.js
 M scripts/check-api-impact.js
 M templates/settings.local.json.template
?? reports/v8.6.0/sprint-01/
?? scripts/test-hooks-contract.js
```

(Untracked `.claude/` and `conversation-tomevault-lizenz-beratung.md` are pre-existing
workspace artifacts unrelated to this sprint's write scope — noted, not reviewed.)

## Per-Criterion Results

### AC1 — check-api-impact.js hook mode: PASS

```
$ echo '{"tool_input":{"file_path":"src/api/x.ts"},"cwd":"'"$PWD"'"}' | node scripts/check-api-impact.js
```
Produces the full API-impact banner ("API/TYPE FILE CHANGE DETECTED"), breaking-change
analysis, consumer discovery (found `src/api/hook-test.ts` references), and the
@api-guardian call-to-action. Exit code 0.

```
$ echo '{"tool_input":{"file_path":"docs/foo.md"}}' | node scripts/check-api-impact.js
```
Silent, exit 0. Confirmed no output, no stall (no `cwd` key in payload — falls back
correctly).

```
$ node scripts/check-api-impact.js src/api/x.ts
```
CLI mode intact — identical banner output via argv path. **PASS**

### AC2 — no `$CLAUDE_*` variables in `config/claude-settings.json`: PASS

```
$ grep -c 'CLAUDE_' config/claude-settings.json
0
```

Confirmed via diff: `"command": "node scripts/check-api-impact.js \"$CLAUDE_FILE_PATH\""`
→ `"command": "node scripts/check-api-impact.js"`. **PASS**

### AC3 — `node scripts/test-hooks-contract.js` passes locally: PASS

```
Summary: 28/28 checks passed
All hook contract checks passed.
$?=0
```

All 28 checks green, including the config/plugin.json/template `$CLAUDE_*` var scan,
script-existence resolution for all 5 wired hook commands, and behavioral probes for
`session-start.js`, `check-api-impact.js` (API payload / non-API payload / garbage
stdin), and `validate-agent-output.js` (passing report / incomplete report exit-2 /
no-report). **PASS**

### AC4 — `release-consistency.yml` runs the hook contract check: PASS

Diff confirms a new step appended to the existing job:
```yaml
      - name: Hook contract check
        run: node scripts/test-hooks-contract.js
```
Follows the existing `Release invariant check` step pattern. **PASS**
(Note: this is a CI/security surface per sprint file risk note — @ci-security-guardian
report is present at `reports/v8.6.0/sprint-01/ci-security-guardian-report.md`, confirming
the required gate ran.)

### AC5 — no active doc/prompt presents `analyze-prompt.js` as a wired hook: **FAIL**

Grep sweep (excluding `.git`, `node_modules`, `archive`, `.claude/` worktree copies,
`CHANGELOG`, `reports/`, `plans/`) shows the deprecation sweep was mostly done well
(`DECISIONS.md`, `docs/orchestrator/META-DECISIONS.md`, `skills/meta-decisions/SKILL.md`,
`scripts/analyze-prompt.js` self-references, `scripts/test-phase2-integration.js` internal
require, and the corrected passages in `CCGM_Prompt_01-SystemInstall-Manual.md` /
`CCGM_Prompt_99-ContextRestore.md` all read fine — either historical/ADR context or
explicit "deprecated since v8.6.0, not wired" language).

However, **`CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` still contains two
stale live-hook references that the sweep missed, in the exact file that was otherwise
fixed**:

1. Line 490 — "Hook Explanations" bullet list, immediately below the corrected JSON
   config block and the new deprecation note (line ~483-485):
   ```
   - **UserPromptSubmit**: Analyzes user prompts for task type, complexity, and workflow suggestions
   ```
   This directly contradicts the sentence three lines above it
   ("...`analyze-prompt.js` is deprecated since v8.6.0 and intentionally not wired
   here (no `UserPromptSubmit` hook)...").

2. Line 792 — "Hooks (4):" summary list (this heading count is itself now wrong —
   there are only 3 wired hooks post-fix):
   ```
   **Hooks (4):**
   - PostToolUse (Write|Edit) - API Impact Check
   - UserPromptSubmit - Prompt Analysis
   - SessionStart - MCP Health & Diagnostics
   - SubagentStop - Agent Output Validation
   ```

Both bullets present `UserPromptSubmit` as a currently-installed, active hook doing
"Prompt Analysis" — the exact regression class AC5 exists to catch, and it survives in
the same document whose JSON hook blocks were correctly edited a few lines above.
**BLOCKING.**

## Code Quality — check-api-impact.js hook-mode port

- Tolerant JSON parse: `try { payload = JSON.parse(raw || '{}'); } catch { /* tolerate non-JSON */ }`
  — matches `validate-agent-output.js runHookMode` pattern. Good.
- Always exits 0 in hook mode (never blocks unrelated work) — confirmed by garbage-stdin
  probe and code inspection (`process.exit(0)` at end of `runHookMode`, no `process.exit(2)`
  path exists in this script at all, consistent with sprint file's "non-blocking, exit 0
  with warning output" requirement).
- `cwd` handling: `process.chdir(payload.cwd)` wrapped in try/catch, degrades gracefully.
  Verified working via the AC1 stdin probe with the `cwd` field set.
- CLI path unchanged: `cliFile = process.argv[2]` branch is untouched and still calls
  `analyzeAndReport(cliFile)` directly — confirmed via CLI probe output being identical
  banner to hook-mode output.
- Minor style note (non-blocking): the mode-detection `if (!cliFile) { ...; return; }` at
  module top level is a bare `return` outside a function — this only works because Node
  wraps CommonJS modules in an implicit function wrapper; it is legal but slightly
  surprising style compared to `validate-agent-output.js`, which gates the same logic
  inside an explicit function. Not a defect, purely a readability nit — no action required.

## test-hooks-contract.js Review

- All fixtures created via `fs.mkdtempSync(path.join(os.tmpdir(), 'ccgm-hooks-contract-'))`
  — confirmed `os.tmpdir()`-scoped only, no repo-tree pollution.
- Cleanup: every fixture block wraps its `runScript` call in `try { ... } finally { fs.rmSync(fixture, { recursive: true, force: true }); }` — verified for all 3 check-api-impact.js
  probes and all 3 validate-agent-output.js probes. No leaked temp dirs after the run
  (spot-checked: no `ccgm-hooks-contract-*` dirs left in `os.tmpdir()` post-run).
- No false-green paths: `spawnSync` result is captured with `status`/`error`/`signal`;
  a thrown/timed-out child process yields `res.status === null`, which fails the
  `res.status === 0` (or `=== 2`) assertions rather than being silently treated as pass.
  The top-level script itself is plain synchronous top-to-bottom execution (no
  swallowed exceptions around the main logic) — an uncaught exception during setup
  would propagate and crash the process with a non-zero exit, not report 28/28.
  **PASS**

## JSON Validity

```
$ node -e "JSON.parse(fs.readFileSync('config/claude-settings.json'))" → OK
$ node -e "JSON.parse(fs.readFileSync('.claude-plugin/plugin.json'))" → OK
```
Both PASS (also independently re-verified by `test-hooks-contract.js` checks 1 and 4).

## Write-Scope Conformance

Sprint file ownership table (builder-A: check-api-impact.js, claude-settings.json,
analyze-prompt.js, CC-GodMode-Prompts/**+docs/** reference sweep; builder-B:
test-hooks-contract.js, package.json, release-consistency.yml) plus the orchestrator-noted
additions (.claude-plugin/plugin.json, templates/settings.local.json.template,
removal of `isolation: worktree` from agents/validator.md + agents/tester.md) —
cross-checked against `git status --short`:

| File | In scope? |
|---|---|
| scripts/check-api-impact.js | yes (builder-A) |
| config/claude-settings.json | yes (builder-A) |
| scripts/analyze-prompt.js | yes (builder-A) |
| CC-GodMode-Prompts/*.md | yes (builder-A sweep) |
| docs/orchestrator/META-DECISIONS.md | yes (builder-A sweep, doc reference) |
| scripts/test-hooks-contract.js | yes (builder-B, new file) |
| package.json | yes (builder-B) |
| .github/workflows/release-consistency.yml | yes (builder-B, CI surface — ci-security-guardian report present) |
| .claude-plugin/plugin.json | yes (orchestrator-noted) |
| templates/settings.local.json.template | yes (orchestrator-noted) |
| agents/tester.md, agents/validator.md | yes (orchestrator-noted, `isolation: worktree` removal only — confirmed single-line removal in each, no other changes) |
| plans/v8.6.0/sprint-01-hook-repair.md | in-flight sprint status bookkeeping — expected |

No file outside the declared write scope was modified. **PASS**

## Findings Summary

| # | Severity | Finding |
|---|---|---|
| 1 | HIGH | `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md:490` still lists `UserPromptSubmit` in "Hook Explanations" as an active hook ("Analyzes user prompts...") — contradicts the fix 3 lines above and violates AC5. |
| 2 | MEDIUM | Same file, line 792, "Hooks (4):" summary still lists `UserPromptSubmit - Prompt Analysis` as one of 4 installed hooks; the count itself is now wrong (should be 3). |
| 3 | none | All other criteria (AC1-AC4), code quality, fixture hygiene, JSON validity, and write-scope conformance are clean — no other blocking issues found. |

## Required Actions

- [ ] @builder-A: Remove/replace the `UserPromptSubmit` bullet at
      `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md:490` (Hook Explanations
      section) — either drop the line or replace with a note that it is not installed.
- [ ] @builder-A: Fix `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md:792` —
      change "Hooks (4):" to "Hooks (3):" and remove the `UserPromptSubmit - Prompt
      Analysis` bullet.
- [ ] Re-run the AC5 grep sweep after the fix to confirm no other stale references
      remain in this file.

## Files Changed

None — review only.

---

## Addendum — Re-validation (r2)

**Date:** 2026-07-06
**Scope:** Delta-only re-check of the two BLOCKING findings from the initial pass,
per coordinator relay that @builder-A addressed them in
`CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md`.

### 1. Finding #1 (Hook Explanations bullet) — RESOLVED

Lines 483-493 now read:

```
`check-api-impact.js` now reads the changed file from the PostToolUse stdin
payload (`tool_input.file_path`) — no `$CLAUDE_FILE_PATH` env var is needed or
exists. `analyze-prompt.js` is deprecated since v8.6.0 and intentionally not
wired here (no `UserPromptSubmit` hook); the orchestrator performs
meta-decision analysis natively (`skills/meta-decisions/`).

**Hook Explanations:**
- **PostToolUse (Write|Edit)**: Checks for API impact after file changes
- **SessionStart**: MCP health checks and system diagnostics
- **SubagentStop**: Validates agent output quality and completeness

(`UserPromptSubmit` is intentionally not installed — `analyze-prompt.js` is
deprecated since v8.6.0; the orchestrator performs meta-decision analysis
natively.)
```

The stale `UserPromptSubmit` bullet is gone; the section now lists exactly the 3
hooks actually wired in the Step 10 JSON above it, and adds an explicit
parenthetical confirming `UserPromptSubmit` is intentionally absent. Internally
consistent with the JSON config block. **PASS**

### 2. Finding #2 (Hooks (4) summary) — RESOLVED

Line 793 area now reads:

```
**Hooks (3):**
- PostToolUse (Write|Edit) - API Impact Check
- SessionStart - MCP Health & Diagnostics
- SubagentStop - Agent Output Validation
```

plus a new parenthetical at line 798:
```
(`UserPromptSubmit` is not installed by Step 10 above — `analyze-prompt.js`
...)
```

Count corrected from "(4)" to "(3)", `UserPromptSubmit - Prompt Analysis` bullet
removed, and list now matches the 3 hooks actually declared in Step 10's JSON.
**PASS**

### 3. Re-run grep sweep over CC-GodMode-Prompts/ (analyze-prompt / UserPromptSubmit)

```
$ grep -rn -e "analyze-prompt" -e "UserPromptSubmit" CC-GodMode-Prompts/
```

Remaining hits, all reviewed:
- `CCGM_Prompt_99-ContextRestore.md:247,352` — explicit "deprecated since v8.6.0
  ... not wired to any hook" language. Fine.
- `CCGM_Prompt_01-SystemInstall-Manual.md:324,345` — uninstall/cleanup `rm` /
  `Remove-Item` script listings that remove `analyze-prompt.js` alongside all
  other legacy scripts by filename only (no claim it is an active hook). Fine —
  this is cleanup tooling, not hook-wiring documentation.
- `CCGM_Prompt_01-SystemInstall-Auto.md:307` — "Expected scripts" file-inventory
  bullet (`analyze-prompt.js` listed as a script file that ships in the repo,
  not as a wired hook). Fine — the script file itself still exists and is
  correctly still distributed (deprecated-in-place, not deleted, per sprint
  Non-Goals).
- `CCGM_Prompt_01-SystemInstall-Auto.md:484,485,493` — the corrected deprecation
  notes reviewed above. Fine.
- `CCGM_Prompt_01-SystemInstall-Auto.md:772,798` — script-inventory bullet and
  the corrected parenthetical reviewed above. Fine.
- `CCGM_Prompt_01-SystemInstall-Auto.md:819,866` — uninstall `rm` / `Remove-Item`
  listings, same pattern as the Manual doc. Fine.

**No live-hook presentation of `analyze-prompt.js` / `UserPromptSubmit` remains
anywhere in `CC-GodMode-Prompts/`.** AC5 now fully satisfied.

### 4. Working-tree drift check

```
$ git status --short
```
Output is byte-identical in file-list terms to the initial review pass (same 14
modified files, `reports/v8.6.0/sprint-01/` and `scripts/test-hooks-contract.js`
untracked, plus the pre-existing unrelated `conversation-tomevault-lizenz-beratung.md`).
No file outside the sprint's declared write scope was touched by this fix.
**PASS**

### Re-validation Verdict

Both prior BLOCKING findings are resolved and internally consistent with the
rest of the file. Combined with the unchanged PASS results for AC1-AC4, code
quality, fixture hygiene, JSON validity, and write-scope conformance from the
initial pass, Sprint 01 now meets all Acceptance Criteria.

**Final Status: APPROVED**
