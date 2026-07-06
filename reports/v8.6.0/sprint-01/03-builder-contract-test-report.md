---
agent: builder
version: v8.6.0
date: 2026-07-06
status: complete
task: sprint-01 hook-repair — @builder-B (scripts/test-hooks-contract.js, package.json script, CI step)
---

# Builder Report — Hook Contract Test (@builder-B)

## Design Decisions

- **Plain Node, no deps.** `scripts/test-hooks-contract.js` uses only `fs`, `path`, `os`,
  `child_process.spawnSync` — no test framework, matching the repo's existing
  `scripts/*.js` self-testing pattern (e.g. `release-check.js`, `sync-version.js`).
- **Hard-coded regression assertion.** The `$CLAUDE_*` substring check on every wired
  hook command is a dedicated, first assertion — it directly encodes the outage's root
  cause (Core Rule 4's auto-trigger silently dead for months) so this exact regression
  class cannot recur unnoticed.
- **Repo-copy resolution, not `~/.claude` resolution.** Per task spec, every wired
  command is resolved to `scripts/<basename>` regardless of whether the config points
  at `~/.claude/scripts/...` or `scripts/...` — CI has no `~/.claude` install. This
  intentionally tests the repo source of truth, not the live user install (that's
  sprint 02 per the plan's Non-Goals).
- **Fixture isolation via `fs.mkdtempSync(os.tmpdir())`.** Every behavioral probe gets
  its own throwaway cwd; each is cleaned up in a `finally` block immediately after use
  so no probe ever touches real repo state (e.g. `reports/`, `src/`) and no leftover
  temp dirs accumulate even on assertion failure.
- **`spawnSync` without a shell.** Args are passed as an argv array, not a shell string,
  so `"$CLAUDE_FILE_PATH"` in a wired command is deliberately NOT expanded — it is
  passed through exactly as Claude Code itself would pass it (Claude Code hooks do not
  invoke a shell with env-var interpolation either; the literal token is what a broken
  wiring actually looks like at runtime). This is what makes the check-api-impact.js
  probe faithfully reproduce the original outage instead of masking it.
- **Command tokenizer.** A small regex-based tokenizer (`(?:[^\s"]+|"[^"]*")+`) splits
  wired commands into argv tokens, respecting simple double-quoted segments (sufficient
  for the command shapes actually used in `claude-settings.json`; not a general shell
  parser, and doesn't need to be — no nested quoting or escaping is used in the config).
- **`validate-agent-output.js` fixtures crafted from source, not from real repo
  reports.** Read `runHookMode` (lines ~727-759), `detectAgentName` (filename must match
  `/builder/i`), and `VALIDATION_RULES_CORE.builder` (requiredSections: Files
  Created/Files Modified/Quality Gates/Tests; requiredPatterns: three `###` headers;
  minLength 500) to build a synthetic `03-builder-report.md` fixture that passes on
  purpose, plus a trivially short one that fails. Both live under
  `reports/v0.0.0/sprint-99/` inside the temp fixture cwd — never inside the real repo
  `reports/` tree — so the probe cannot pick up or interfere with any genuine sprint
  report, including this one.
- **"No recent report" probe relies on `findLatestReport`'s 15-minute freshness window**
  and an empty fixture `reports/` tree (none created) — confirmed exit 0.
- **Usage-error guard applied uniformly.** Every probe result (across all three scripts,
  all payload variants) is checked for the literal substring `"Usage:"` in combined
  stdout+stderr — this is the generic tripwire for "hook is receiving the wrong args."
- **`package.json` left version-free** per its existing header comment — only the new
  `hooks:test` script entry was added, no version field introduced.
- **CI step matches the task spec exactly** — appended after the two existing steps,
  `permissions: contents: read` untouched, no other changes to the workflow file (it's
  a security surface reviewed separately by @ci-security-guardian).

## Test Output Transcript

Command: `node scripts/test-hooks-contract.js`

```
======================================================================
Hook Contract Test — CC_GodMode v8.6.0 (sprint-01 hook-repair)
======================================================================

[PASS] config/claude-settings.json parses as JSON
[PASS] at least one hook is wired
       found 5 hook command(s)
[FAIL] no hook command references a $CLAUDE_* variable (the v8.0.0 regression)
       offending: [PostToolUse] node scripts/check-api-impact.js "$CLAUDE_FILE_PATH"
[PASS] SessionStart: repo script exists for session-start.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/session-start.js
[PASS] PostToolUse: repo script exists for check-api-impact.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/check-api-impact.js
[PASS] SubagentStop: repo script exists for validate-agent-output.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/validate-agent-output.js
[PASS] TaskCompleted: repo script exists for validate-agent-output.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/validate-agent-output.js
[PASS] TeammateIdle: repo script exists for validate-agent-output.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/validate-agent-output.js

----------------------------------------------------------------------
Behavioral probes
----------------------------------------------------------------------
[PASS] session-start.js: exits 0 with no stdin
[PASS] session-start.js: no "Usage:" output (wiring passes correct args)
[PASS] check-api-impact.js: API-file stdin payload -> exit 0
[FAIL] check-api-impact.js: API-file stdin payload -> stdout mentions file or API-impact marker
       stdout did not reference "src/api/users.ts" or an impact marker — likely still argv-only (stdin port not yet landed): (empty)
[PASS] check-api-impact.js (API payload): no "Usage:" output (wiring passes correct args)
[PASS] check-api-impact.js: non-API stdin payload -> exit 0
[PASS] check-api-impact.js: non-API stdin payload -> no impact warning printed
[PASS] check-api-impact.js (non-API payload): no "Usage:" output (wiring passes correct args)
[PASS] check-api-impact.js: garbage stdin -> exit 0 (never breaks unrelated work)
[PASS] check-api-impact.js (garbage stdin): no "Usage:" output (wiring passes correct args)
[PASS] validate-agent-output.js: fresh PASSING builder report -> exit 0
[PASS] validate-agent-output.js (passing report): no "Usage:" output (wiring passes correct args)
[PASS] validate-agent-output.js: critically incomplete report -> exit 2 (blocking)
[PASS] validate-agent-output.js (incomplete report): no "Usage:" output (wiring passes correct args)
[PASS] validate-agent-output.js: no recent report -> exit 0 (never breaks unrelated work)
[PASS] validate-agent-output.js (no report): no "Usage:" output (wiring passes correct args)

======================================================================
Summary: 22/24 checks passed
======================================================================

FAILED checks:
  - no hook command references a $CLAUDE_* variable (the v8.0.0 regression)
  - check-api-impact.js: API-file stdin payload -> stdout mentions file or API-impact marker

EXIT: 1
```

### Root-cause confirmation for the 2 failures (both expected mid-sprint, both attributable to @builder-A's in-progress work, not to this test)

1. **`$CLAUDE_*` assertion fails** — `config/claude-settings.json` still contains
   `node scripts/check-api-impact.js "$CLAUDE_FILE_PATH"` in `PostToolUse`. This is
   exactly the file @builder-A owns (per sprint file's ownership table) and is
   currently mid-port. Will pass once the config is rewired to argument-free
   `node scripts/check-api-impact.js`.

2. **API-file stdin probe: no output** — verified this is not a test bug. Since
   `spawnSync` passes argv directly (no shell), the wired token `"$CLAUDE_FILE_PATH"`
   is passed to the script literally, unexpanded, as `argv[2]`. `check-api-impact.js`'s
   dispatcher (`const cliFile = process.argv[2]; if (!cliFile) { ...stdin path... }`)
   sees a truthy string and takes the **CLI path** with `changedFile = "$CLAUDE_FILE_PATH"`
   — a string that doesn't match any `apiPaths`/`typeFilePatterns`/`schemaFiles`, so
   `analyzeAndReport` returns immediately with **no output**, exit 0. This is a
   byte-for-byte reproduction of the original outage (silent no-op on every real
   invocation) and confirms the sprint's premise. Manually verified in isolation:
   ```
   $ echo '{}' | node scripts/check-api-impact.js '$CLAUDE_FILE_PATH'
   exit=0
   ```
   (no output). Once @builder-A drops the `"$CLAUDE_FILE_PATH"` argv token from the
   config, the same hook fires the stdin-mode branch already implemented in
   `check-api-impact.js` (confirmed present at lines 42-83, `runHookMode`), and this
   probe is expected to pass without any change needed on my side.

All other assertions — settings JSON parse, hook enumeration, repo-script resolution
for all 4 distinct script basenames across 5 wired hook entries, `session-start.js`
behavior, `check-api-impact.js` non-API-path and garbage-stdin behavior, and all three
`validate-agent-output.js` sub-probes (passing report / critically incomplete report /
no report) — pass today, independently of @builder-A's remaining work, because
`validate-agent-output.js`'s stdin hook mode was already shipped in an earlier fix
(module header says "v8.5 fix") and `check-api-impact.js`'s non-blocking exit-0 paths
don't depend on the config rewire.

## Files Changed

### Created
- `scripts/test-hooks-contract.js` — hook contract test (plain Node, no deps); see
  design decisions above for coverage.

### Modified
- `package.json:5-11` — added `"hooks:test": "node scripts/test-hooks-contract.js"` to
  `scripts`; no other change (file remains intentionally version-free).
- `.github/workflows/release-consistency.yml` — added a "Hook contract check" step
  (`run: node scripts/test-hooks-contract.js`) after the existing "Release invariant
  check" step; `permissions: contents: read` and all other content left untouched.

### Not touched (out of write scope, confirmed unmodified)
- `scripts/check-api-impact.js` — @builder-A's scope; already contains the stdin
  `runHookMode` port (verified present, lines 42-83) at time of this test run.
- `config/claude-settings.json` — @builder-A's scope; still contains
  `"$CLAUDE_FILE_PATH"` at time of this test run (confirmed above).
- `scripts/analyze-prompt.js`, `CC-GodMode-Prompts/**`, `docs/**` — @builder-A's scope,
  not inspected beyond confirming they weren't touched by me.

## Open Items For Orchestrator Re-Run

- [ ] **Re-run `npm run hooks:test`** (or `node scripts/test-hooks-contract.js`) after
  @builder-A lands the `config/claude-settings.json` rewire (drop
  `"$CLAUDE_FILE_PATH"` from the PostToolUse command). Expected: the `$CLAUDE_*`
  assertion flips to PASS.
- [ ] **Same re-run** should also flip the "API-file stdin payload -> stdout mentions
  file or API-impact marker" check to PASS once the config no longer passes the stale
  argv token, causing the script to take the stdin hook-mode path on the real
  PostToolUse-shaped payload.
- [ ] If, after @builder-A's changes land, either assertion still fails, that is a
  genuine regression (not an ordering artifact) and should route back through
  @builder-A / this test rather than being waved through.
- [ ] No changes needed to `scripts/test-hooks-contract.js`, `package.json`, or
  `.github/workflows/release-consistency.yml` are anticipated from @builder-A's
  remaining work — these three files are believed final for sprint-01 pending the
  orchestrator's re-run confirming exit 0.
- [ ] `.github/workflows/release-consistency.yml` is a security surface per the sprint
  file's Risks section — routes to @ci-security-guardian per Full-Gates before merge.

---

## Addendum — Coordinator Follow-Up (same-day, extended regression coverage)

**Trigger:** coordinator reported @builder-A found the same broken-wiring class in two
more files — `.claude-plugin/plugin.json` (PostToolUse command carried
`"$CLAUDE_FILE_PATH"`) and `templates/settings.local.json.template` (same) — and fixed
both by hand. Directed to extend the hard-assert in `scripts/test-hooks-contract.js`
(my sole write-scope file for this follow-up) to catch regressions in these two files
going forward, while explicitly allowing `${CLAUDE_PLUGIN_ROOT}` (a legitimate,
runtime-populated Claude Code plugin path variable, unlike the never-populated
`$CLAUDE_FILE_PATH` / `$CLAUDE_USER_PROMPT` / `$CLAUDE_SUBAGENT_TYPE` /
`$CLAUDE_SUBAGENT_OUTPUT` input vars that caused the original outage).

### Design decisions (addendum)

- **Regex generalized to a forbidden-vars pattern**, not a blanket `$CLAUDE_` substring
  match: `FORBIDDEN_CLAUDE_VAR_RE = /\$CLAUDE_(?!PLUGIN_ROOT\b)/` — matches any
  `$CLAUDE_*` token except one immediately followed by `PLUGIN_ROOT` at a word
  boundary. Verified against the coordinator's exact examples plus a negative-control
  case (`$CLAUDE_PLUGIN_ROOTX`, which is NOT a real Claude Code variable and correctly
  still matches as forbidden, since the lookahead only guards the literal `PLUGIN_ROOT`
  token boundary, not an extended token like `ROOTX`). Confirmed with a standalone
  regex smoke test (see transcript below) before wiring it into the suite.
- **Existing `config/claude-settings.json` check reused the same regex** (previously a
  blunter `.includes('$CLAUDE_')` check) so all three files are governed by one
  single source of truth for "what's forbidden," not three copy-pasted rules that
  could drift.
- **New `checkExtraHookFile(label, filePath)` helper** reuses the existing
  `collectHookCommands()` parser (works for both `claude-settings.json` and
  `plugin.json`'s hooks object shape — both are `{ EventName: [ { hooks: [ {
  command } ] } ] }`) rather than writing a second parser.
- **Missing file = soft skip**, per instruction: `templates/settings.local.json.template`
  may not exist in every checkout; a missing file logs a PASS with a "not found —
  skipped" note rather than failing the suite. A parse failure (malformed JSON) on a
  file that DOES exist is still a hard FAIL, since that would silently defeat the
  whole check.
- **No changes to any other file** — this follow-up stayed strictly inside my sole
  write-scope file, `scripts/test-hooks-contract.js`, as instructed. I did not touch
  `.claude-plugin/plugin.json` or `templates/settings.local.json.template` — I only
  read them to confirm the coordinator's fix is already in place (both files use
  `${CLAUDE_PLUGIN_ROOT}` only / no `$CLAUDE_*` at all, respectively — read and
  verified, not edited).

### Regex smoke test (before wiring into the suite)

```
$ node -e '
const re = /\$CLAUDE_(?!PLUGIN_ROOT\b)/;
console.log("plugin_root allowed:", !re.test("node ${CLAUDE_PLUGIN_ROOT}/scripts/x.js"));
console.log("file_path forbidden:", re.test("node scripts/x.js \"$CLAUDE_FILE_PATH\""));
console.log("user_prompt forbidden:", re.test("echo $CLAUDE_USER_PROMPT"));
console.log("subagent_type forbidden:", re.test("echo $CLAUDE_SUBAGENT_TYPE"));
console.log("plugin_root_extra forbidden (not a real var, similar prefix):", re.test("$CLAUDE_PLUGIN_ROOTX"));
'
plugin_root allowed: true
file_path forbidden: true
user_prompt forbidden: true
subagent_type forbidden: true
plugin_root_extra forbidden (not a real var, similar prefix): true
```

All five expected outcomes matched.

### Full suite re-run (post-extension)

Command: `node scripts/test-hooks-contract.js`

```
======================================================================
Hook Contract Test — CC_GodMode v8.6.0 (sprint-01 hook-repair)
======================================================================

[PASS] config/claude-settings.json parses as JSON
[PASS] at least one hook is wired
       found 5 hook command(s)
[PASS] config/claude-settings.json: no hook command references a forbidden $CLAUDE_* var (the v8.0.0 regression)
[PASS] .claude-plugin/plugin.json: parses as JSON
[PASS] .claude-plugin/plugin.json: no hook command references a forbidden $CLAUDE_* var (${CLAUDE_PLUGIN_ROOT} allowed)
       checked 4 hook command(s)
[PASS] templates/settings.local.json.template: parses as JSON
[PASS] templates/settings.local.json.template: no hook command references a forbidden $CLAUDE_* var (${CLAUDE_PLUGIN_ROOT} allowed)
       checked 1 hook command(s)
[PASS] SessionStart: repo script exists for session-start.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/session-start.js
[PASS] PostToolUse: repo script exists for check-api-impact.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/check-api-impact.js
[PASS] SubagentStop: repo script exists for validate-agent-output.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/validate-agent-output.js
[PASS] TaskCompleted: repo script exists for validate-agent-output.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/validate-agent-output.js
[PASS] TeammateIdle: repo script exists for validate-agent-output.js
       /Volumes/2TB_CodingProjekte/Coding_Projekte/CC_GodMode-Lokal/cc--god_mode/ON/scripts/validate-agent-output.js

----------------------------------------------------------------------
Behavioral probes
----------------------------------------------------------------------
[PASS] session-start.js: exits 0 with no stdin
[PASS] session-start.js: no "Usage:" output (wiring passes correct args)
[PASS] check-api-impact.js: API-file stdin payload -> exit 0
[PASS] check-api-impact.js: API-file stdin payload -> stdout mentions file or API-impact marker
[PASS] check-api-impact.js (API payload): no "Usage:" output (wiring passes correct args)
[PASS] check-api-impact.js: non-API stdin payload -> exit 0
[PASS] check-api-impact.js: non-API stdin payload -> no impact warning printed
[PASS] check-api-impact.js (non-API payload): no "Usage:" output (wiring passes correct args)
[PASS] check-api-impact.js: garbage stdin -> exit 0 (never breaks unrelated work)
[PASS] check-api-impact.js (garbage stdin): no "Usage:" output (wiring passes correct args)
[PASS] validate-agent-output.js: fresh PASSING builder report -> exit 0
[PASS] validate-agent-output.js (passing report): no "Usage:" output (wiring passes correct args)
[PASS] validate-agent-output.js: critically incomplete report -> exit 2 (blocking)
[PASS] validate-agent-output.js (incomplete report): no "Usage:" output (wiring passes correct args)
[PASS] validate-agent-output.js: no recent report -> exit 0 (never breaks unrelated work)
[PASS] validate-agent-output.js (no report): no "Usage:" output (wiring passes correct args)

======================================================================
Summary: 28/28 checks passed
======================================================================

All hook contract checks passed.
EXIT: 0
```

Confirms: (a) @builder-A's `config/claude-settings.json` rewire landed (the previously
FAILing `$CLAUDE_*` and API-file-stdin-marker checks are now both PASS, exactly as
anticipated in the earlier "Open Items" section); (b) the coordinator's manual fixes to
`.claude-plugin/plugin.json` and `templates/settings.local.json.template` are both
clean under the new, stricter assertion; (c) the new assertion correctly distinguishes
`${CLAUDE_PLUGIN_ROOT}` (allowed) from all other `$CLAUDE_*` tokens (forbidden). Suite
is green end-to-end: 28/28, exit 0.

## Files Changed (addendum)

### Modified
- `scripts/test-hooks-contract.js` — added `FORBIDDEN_CLAUDE_VAR_RE`, generalized the
  `config/claude-settings.json` check to use it, and added a new
  `checkExtraHookFile(label, filePath)` helper invoked for both
  `.claude-plugin/plugin.json` and `templates/settings.local.json.template` (soft-skip
  on missing file, hard-fail on parse error or forbidden-var match). No other file in
  this follow-up.

### Read only (not modified — verified coordinator's fix already in place)
- `.claude-plugin/plugin.json` — confirmed all 4 wired hook commands use
  `${CLAUDE_PLUGIN_ROOT}` only, no forbidden `$CLAUDE_*` tokens.
- `templates/settings.local.json.template` — confirmed its single wired hook command
  (`node scripts/check-api-impact.js`) carries no arguments at all, forbidden or
  otherwise.

## Open Items For Orchestrator Re-Run (addendum)

- [ ] None outstanding for this follow-up — suite is green (28/28) with both new files
  covered and the previously-pending @builder-A dependency now confirmed landed.
- [ ] Recommend orchestrator treat this as the new baseline for future CI runs of
  `npm run hooks:test`.
