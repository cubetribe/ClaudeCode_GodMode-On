---
agent: builder
version: v8.6.0
date: 2026-07-06
status: complete
task: Port check-api-impact.js to Claude Code hook stdin contract, rewire settings, deprecate analyze-prompt.js, sweep active docs/prompts for stale wiring references
---

## What Was Done

### Task 1 — `scripts/check-api-impact.js` hook mode
Ported the script to the Claude Code hook contract following the
`validate-agent-output.js` `runHookMode` pattern (lines ~697-759):

- CLI mode unchanged: `node scripts/check-api-impact.js <file>` still works
  exactly as before (argv[2] path).
- New hook mode: when `process.argv[2]` is absent and `process.stdin.isTTY`
  is falsy, the script reads all of stdin, parses it as JSON tolerantly
  (bad/empty JSON → exit 0, no crash), extracts the changed file from
  `payload.tool_input.file_path` (PostToolUse payload shape), `chdir`s to
  `payload.cwd` when present (so the consumer `grep`s over relative `src/`
  paths resolve correctly), then runs the existing analysis.
- TTY with no argv → exit 0 as before (no-op).
- The existing single top-level analysis body was extracted into a named
  function `analyzeAndReport(changedFile)` so both the CLI path and the hook
  path can call the same logic without duplicating ~180 lines of
  console.log output.
- Non-blocking philosophy preserved: purely informational output, the
  script never calls `process.exit(1)` or `process.exit(2)` — always 0.
  No new dependencies; plain Node (`child_process`, `fs`, `path`) as before.

### Task 2 — `config/claude-settings.json`
Line 29's PostToolUse command changed from
`node scripts/check-api-impact.js "$CLAUDE_FILE_PATH"` to
`node scripts/check-api-impact.js` (argument-free). No other hook entries
touched.

### Task 3 — `scripts/analyze-prompt.js` deprecation
Added a deprecation header block immediately after the shebang, following
the `scripts/workflow-state.js` precedent style (⚠ DEPRECATED marker +
rationale + explicit "do not re-wire without an ADR" note). No logic
changed.

### Task 4 — Reference sweep
Ran `grep -rn "analyze-prompt" --exclude-dir=.git --exclude-dir=node_modules
--exclude-dir=archive .` and reviewed every hit. Corrected active
docs/prompts that presented `analyze-prompt.js` as a live/wired hook, or
that showed `check-api-impact.js` wired with `$CLAUDE_FILE_PATH`:

- `docs/orchestrator/META-DECISIONS.md` — the "Script:
  `scripts/analyze-prompt.js` (META_DECISION_LAYER)" line and the RARE
  matrix's "analyze-prompt.js suggests" cell both implied a live hook;
  reworded to point at the orchestrator's native meta-decision handling
  (`skills/meta-decisions/`) with an explicit deprecation note.
- `CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md` — two mentions
  ("Meta-Decision Logic ... `scripts/analyze-prompt.js`" and "Trust the
  meta-layer ... **Script:** `scripts/analyze-prompt.js`") corrected to
  state the logic is applied natively and the script is deprecated/unwired.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` — Step 10's
  `settings.json` hook-config JSON blocks (macOS/Linux + Windows) wired
  `UserPromptSubmit → analyze-prompt.js "$CLAUDE_USER_PROMPT"` and
  `PostToolUse → check-api-impact.js "$CLAUDE_FILE_PATH"`. Removed the
  `UserPromptSubmit` block entirely (no hook should be installed for a
  deprecated script) and dropped the `$CLAUDE_FILE_PATH` argument from both
  the macOS/Linux and Windows `check-api-impact.js` commands. Added a note
  explaining the stdin payload contract and the analyze-prompt deprecation.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md` — Step 9's
  hook config passed `"$CLAUDE_FILE_PATH"` to `check-api-impact.js` (both
  macOS/Linux and Windows command strings); dropped the argument and added
  the same explanatory note. (This file had no `analyze-prompt.js` wiring
  instruction to begin with — only file-copy/removal listings, which are
  not "live hook" claims and were left untouched.)

Left untouched (correctly out of scope):
- `CHANGELOG.md`, `DECISIONS.md`, `plans/**`, `reports/**` — immutable
  history, explicitly excluded by the task.
- `scripts/analyze-prompt.js` file-listing/removal instructions in the
  install prompts (copy-all-scripts and uninstall lists) — these list the
  script as installed/removable, not as a wired live hook; no correction
  needed.
- `skills/meta-decisions/SKILL.md` — references analyze-prompt.js but is
  outside my write scope (`docs/**`, `CC-GodMode-Prompts/**`,
  `config/CLAUDE-*.md` only); flagged below for the orchestrator.
- `.claude-plugin/plugin.json` and `templates/settings.local.json.template`
  — both still wire `check-api-impact.js` with `"$CLAUDE_FILE_PATH"`, and
  `.claude-plugin/plugin.json` also still references `$CLAUDE_USER_PROMPT`
  in other hooks presumably. Neither file is in my write scope (only
  `config/claude-settings.json` is listed); flagged below for the
  orchestrator/sprint-02.

## Verification Transcript

```
$ node -c scripts/check-api-impact.js && echo SYNTAX_OK
SYNTAX_OK

$ echo '{"tool_input":{"file_path":"src/api/x.ts"},"cwd":"'"$PWD"'"}' | node scripts/check-api-impact.js
[... full API-impact report printed: file info, breaking-change analysis,
consumer discovery (7 hits in src/api/hook-test.ts), required actions,
orchestrator workflow hint ...]
EXIT=0

$ echo '{"tool_input":{"file_path":"docs/foo.md"}}' | node scripts/check-api-impact.js
(no output)
EXIT=0

$ echo 'garbage' | node scripts/check-api-impact.js
(no output)
EXIT=0

$ node scripts/check-api-impact.js src/api/x.ts
[... same API-impact report as CLI mode ...]
EXIT=0

$ node -e "JSON.parse(require('fs').readFileSync('config/claude-settings.json','utf8'))"
(no error -> valid JSON)

$ grep -c 'CLAUDE_' config/claude-settings.json
0
```

All five acceptance probes from the dispatch prompt pass exactly as
specified.

## Files Changed

- `scripts/check-api-impact.js` — added stdin hook mode (`runHookMode`),
  extracted `analyzeAndReport(changedFile)`, mode dispatch (CLI / hook /
  no-op TTY); CLI behavior unchanged, always exits 0.
- `config/claude-settings.json` — PostToolUse `check-api-impact.js` command
  now argument-free (line 29 area); no other hooks touched.
- `scripts/analyze-prompt.js` — added deprecation header block after the
  shebang; no logic changes.
- `docs/orchestrator/META-DECISIONS.md` — corrected two references
  presenting analyze-prompt.js as a live wired script.
- `CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md` — corrected two
  references presenting analyze-prompt.js as a live wired script.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` — removed
  `UserPromptSubmit`/`analyze-prompt.js` hook block, dropped
  `$CLAUDE_FILE_PATH` from `check-api-impact.js` wiring (macOS/Linux +
  Windows), added explanatory note.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md` — dropped
  `$CLAUDE_FILE_PATH` from `check-api-impact.js` wiring (macOS/Linux +
  Windows), added explanatory note.
- `reports/v8.6.0/sprint-01/03-builder-hook-stdin-report.md` — this report.

## Deviations / Notes

- The task description said "chdir/base analysis on payload.cwd" — I chose
  `process.chdir(payload.cwd)` wrapped in try/catch (falls back silently to
  current cwd on failure) rather than threading a `cwd` parameter through
  every helper, since all downstream `execSync`/`grep` calls in this script
  are relative-path shell commands that inherit the process cwd. This
  matches the script's existing plain-Node, no-new-deps style.
- Found two additional files outside my write scope that still wire
  `check-api-impact.js` with `"$CLAUDE_FILE_PATH"` and (for plugin.json)
  likely still reference `analyze-prompt.js`/`$CLAUDE_USER_PROMPT`:
  `.claude-plugin/plugin.json` (line 80) and
  `templates/settings.local.json.template` (line 21). These are real,
  active wiring files (not docs) — recommend the orchestrator route them to
  the appropriate owner (sprint-02 / builder-B write scope) since they are
  functionally identical to the `config/claude-settings.json` fix in Task 2
  but sit outside this sprint's Task-1-owner write scope.
- `skills/meta-decisions/SKILL.md` line 25 ("analyze-prompt.js evaluates:")
  also presents the script as live; it is outside my declared write scope
  (`docs/**`, `CC-GodMode-Prompts/**`, `config/CLAUDE-*.md`) so I left it
  untouched and am flagging it here.
- No changes made to `scripts/test-phase2-integration.js` (it
  `require()`s `./analyze-prompt.js` directly) — out of scope per the
  sprint file (builder-B owns `scripts/test-hooks-contract.js`; this test
  file wasn't listed for either builder and touching it would be a logic
  change, not a reference/doc correction).

## Addendum — @validator BLOCKED fixes (round 2)

@validator flagged two leftovers missed in the first reference sweep, both
in `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` (in write
scope). Both are now fixed:

1. **Line ~490 "Hook Explanations" list** still had a
   `**UserPromptSubmit**: Analyzes user prompts...` bullet directly
   contradicting the deprecation note three lines above it. Removed the
   bullet and added a parenthetical: `UserPromptSubmit` is intentionally
   not installed because `analyze-prompt.js` is deprecated since v8.6.0.

2. **Line ~793 "Hooks (4):" installed-summary** still listed
   `UserPromptSubmit - Prompt Analysis` as an installed hook, and the count
   was stale. Investigated the correct count two ways:
   - This document's own Step 10 config JSON (the walkthrough the user
     actually follows) only ever configures 3 hooks:
     `PostToolUse`, `SessionStart`, `SubagentStop`. It never included
     `TaskCompleted`/`TeammateIdle` even before this fix — those are not a
     regression I introduced, they were simply never part of this manual
     walkthrough.
   - The repo's `config/claude-settings.json` (verified via
     `grep -n '"\(SessionStart\|PostToolUse\|SubagentStop\|TaskCompleted\|TeammateIdle\|UserPromptSubmit\)"'`)
     wires **5** events: `SessionStart`, `PostToolUse`, `SubagentStop`,
     `TaskCompleted`, `TeammateIdle`. No `UserPromptSubmit`.

   Decision: corrected this doc's summary to **"Hooks (3):"** — matching
   what this document's own Step 10 JSON example actually installs, since
   inflating the count to 5 here would silently add two hooks
   (`TaskCompleted`, `TeammateIdle`) to the walkthrough's promised output
   without adding the corresponding JSON to Step 10, which would be a scope
   expansion beyond a reference correction. Added an explanatory
   parenthetical noting the repo's reference `claude-settings.json` wires
   two additional events (`TaskCompleted`, `TeammateIdle`) not covered by
   this manual walkthrough, so a reader chasing full parity knows where to
   look. Expanding Step 10 itself to add those two hooks would be a content
   addition beyond this task's "reference correction" scope — flagged for
   the orchestrator/@docs-dx to decide if this walkthrough should be
   brought to full parity with the repo's settings file.

Then re-ran a full directory sweep,
`grep -rn "UserPromptSubmit\|analyze-prompt" CC-GodMode-Prompts/`, including
the Manual sibling file (`CCGM_Prompt_01-SystemInstall-Manual.md`). Confirmed
that file never had a `UserPromptSubmit` hook block or hook-count summary
to begin with (verified via targeted grep — no matches), so no fix was
needed there. All remaining hits across the directory are: my own corrected
explanatory notes, the copy-all-scripts listing (line 307, lists
`analyze-prompt.js` as a file present in `scripts/`, not as a wired hook),
and uninstall/removal command lists (lines ~772, ~819, ~866 in Auto; ~324,
~345 in Manual) — none of these present the script as a live/wired hook, so
none required changes.

### Updated Files Changed (this addendum)

- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` — removed the
  stale `UserPromptSubmit` bullet from "Hook Explanations"; corrected
  "Hooks (4):" to "Hooks (3):" and removed the
  `UserPromptSubmit - Prompt Analysis` line from the installed-hooks
  summary; added explanatory parentheticals in both spots.

No other files required changes for this addendum.
