---
agent: builder
version: v8.6.0
date: 2026-07-06
status: complete
task: sprint-02 install-sync — --fix-hooks installer flag + session-start.js drift guard
---

# Builder Report — Sprint 02 Install Sync

## Design Decisions

1. **`--fix-hooks` is a self-contained bash function (`fix_hooks`)**, called either
   standalone (exactly `--fix-hooks` with no other args) or appended after a normal
   install run. Standalone detection uses `"$#" -eq 1`; any additional argument
   (e.g. a future flag combined with `--fix-hooks`) routes through the full
   install path with the hook-fix step tacked on at the end, so a failed fix step
   (e.g. missing `settings.json` on a first-ever install) never aborts agent/script/
   skill/template installation — only its own step returns non-zero, and the
   install-mode caller downgrades that into a warning on stderr.

2. **All JSON editing happens in a single embedded `node -e`**, invoked with the
   target/source/`CLAUDE_HOME` paths passed via environment variables (avoids shell
   quoting hazards with `node -e '...'` containing double quotes). It does a strict
   parse → in-memory transform → `JSON.stringify(..., null, 2)` round trip — no
   regex-editing of JSON, per the task's hard requirement.

3. **Path rewrite regex** `(\S*)~\/\.claude\/scripts\/(\S+)/` replaces a literal
   `~/.claude/scripts/<basename>` prefix inside each canonical hook's command
   string with `${CLAUDE_HOME}/scripts/<basename>` (`$HOME`/`CLAUDE_HOME` expanded
   by the *installer's* shell at merge time, not by Node or by a literal `~`).
   Everything else in the command string (e.g. `node ` prefix) is preserved; no
   argument tokens are appended, so canonical entries land argument-free as
   required.

4. **Removal pass runs over ALL hook events**, not just the canonical five — any
   hook whose `command` matches `analyze-prompt.js` or a forbidden `$CLAUDE_*`
   token (`${CLAUDE_PLUGIN_ROOT}` explicitly excluded) is dropped from its
   `hooks` array; an entry left with an empty `hooks` array is removed entirely.
   `UserPromptSubmit` is deleted outright if it becomes empty. This means
   pre-existing drift anywhere in the file gets cleaned up, not just in the five
   named events — matches the sprint's stated goal of making broken wiring
   unrepresentable, not just patching the known five.

5. **Timestamped backup lives under the existing `~/.claude/backups/install-archives/`
   tree** (`.../<timestamp>/settings/settings.json`), reusing the installer's
   existing backup convention/root rather than inventing a new location.

6. **session-start.js drift guard is purely additive**: two new small pure
   functions (`detectDriftWarnings`, `detectBrokenHookWiring`) plus two small
   helpers (`isGodModeRepoDir`, `findRepoVersion`, `readVersionMarker`), called
   once in `main()` and passed into `displayWelcome()`. Both detection functions
   wrap all I/O in `try/catch` and degrade to `[]` / `false` on any error —
   the spec's "a banner must never crash" requirement. The banner box only grows
   a new "Drift Guard" section when at least one warning is present; a fully
   healthy system produces byte-identical output to before this change (verified
   below — no `Drift Guard` section appears against the real, non-broken parts of
   the check, and the section is completely absent whenever both checks are
   negative).

7. **Repo-signature walk is capped at 2 ancestor levels** (`for i in 0..2`) per
   spec, checking `VERSION` + `CLAUDE.md` + `scripts/apply-global-claude-setup.sh`
   at each level; stops early at filesystem root.

## Fixture Transcript (Task 3)

All fixture work used `mktemp -d` under the scratchpad dir with `HOME`/`CLAUDE_HOME`
overridden — the real `~/.claude` was never touched.

### `--fix-hooks` standalone against a broken v8.0.0-style fixture

Fixture `settings.json` contained: `UserPromptSubmit` → `analyze-prompt.js` with
`$CLAUDE_USER_PROMPT`; `SessionStart` → `$CLAUDE_FILE_PATH`; `PostToolUse` →
relative `scripts/check-api-impact.js` with `$CLAUDE_FILE_PATH`; `SubagentStop` →
`$CLAUDE_SUBAGENT_TYPE`; an unrelated custom top-level key (`customTopLevelKey`);
and an unrelated custom hook event (`MyCustomEvent`).

```
$ HOME="$FIXTURE_HOME" CLAUDE_HOME="$FIXTURE_HOME/.claude" \
    ./scripts/apply-global-claude-setup.sh --fix-hooks

Fixing hook wiring in .../fixture-home.PrcYBU/.claude/settings.json
  backed up settings.json to .../backups/install-archives/2026-07-06T14-20-33/settings/settings.json
  canonical events replaced: 3
  canonical events inserted: 2
  offending hook entries removed: 1
  other hook events kept unchanged: 1
  hook wiring fixed: .../fixture-home.PrcYBU/.claude/settings.json
  backup: .../backups/install-archives/2026-07-06T14-20-33/settings/settings.json
EXIT: 0
```

Resulting `settings.json` (verified): `SessionStart`, `PostToolUse`, `SubagentStop`,
`TaskCompleted`, `TeammateIdle` all present, argument-free, each script command
pointing at `<fixture-home>/.claude/scripts/<basename>.js`; `UserPromptSubmit`
gone entirely; `customTopLevelKey: "keep-me"` preserved; `MyCustomEvent`
preserved byte-for-byte (still literal `~/.claude/scripts/custom-thing.js`,
untouched since it's not one of the five canonical events and carries no
forbidden token); JSON parses cleanly; backup file exists and is a byte copy of
the pre-fix content.

### Abort-path tests

```
--- Test: missing settings.json ---
Fixing hook wiring in .../fixture-missing.Sk57To/.claude/settings.json
Error: .../settings.json not found — cannot fix hooks (nothing to merge into).
EXIT: 1

--- Test: unparseable settings.json ---
Fixing hook wiring in .../fixture-bad.24Uip1/.claude/settings.json
Error: .../settings.json is not valid JSON — cannot fix hooks. Repair or remove it manually first.
EXIT: 1
```

### Compose test (full install + `--fix-hooks` together)

Ran `--fix-hooks --fix-hooks` (two tokens, so the standalone `$# -eq 1` guard
does not trigger, exercising the composed path) against a fresh fixture with no
pre-existing `settings.json`:

```
Installing CC_GodMode v8.5.0 into .../fixture-combo2.mxZR6u/.claude
Agents:
  installed 15 agent(s)
Scripts:
  installed 17 script(s)
Skills:
  installed 14 skill(s)
Templates:
  installed CLAUDE-ORCHESTRATOR.md + CCGM_Prompt_02-ProjectActivation.md

Installed CC_GodMode v8.5.0.
Verify with: ./scripts/apply-global-claude-setup.sh --check

Fixing hook wiring in .../fixture-combo2.mxZR6u/.claude/settings.json
Error: .../settings.json not found — cannot fix hooks (nothing to merge into).
Warning: --fix-hooks step failed (see message above); rest of the install is unaffected.
EXIT: 0
```

Full install (15 agents, 17 scripts, 14 skills, templates, version marker)
completed even though the hook-fix substep failed — confirms "abort non-zero
only for this step, rest of install unaffected." Repeated against a fixture
that DID have a pre-existing (broken) `settings.json`: install completed AND
the hook fix succeeded (3 replaced/inserted canonical events → 1 replaced + 4
inserted in that particular fixture, 0 offending removed, 0 unrelated events —
matches the smaller broken fixture used for that run), final `EXIT: 0`.

### `session-start.js` banner checks

- Ran unmodified (no HOME override) from the repo cwd against the **real**
  `~/.claude` (read-only — the script never writes to `~/.claude`): the Drift
  Guard section correctly appeared with
  `⚠ Broken hook wiring detected in ~/.claude/settings.json — run apply-global-claude-setup.sh --fix-hooks`,
  which is an accurate, independent confirmation of the exact live-install
  regression this sprint targets (see sprint context: `~/.claude/settings.json`
  is still wired with `$CLAUDE_FILE_PATH` / `$CLAUDE_SUBAGENT_TYPE` etc. today).
- Ran from a disposable fixture cwd (empty temp dir, `HOME` overridden to a
  fixture with a healthy-shaped but version-mismatched marker (`7.0.0`) matched
  against the **repo's** actual `VERSION` (`8.5.0`, since this fixture cwd was
  not itself a GodMode repo, the check was re-run from the real repo cwd with
  the mismatched fixture `HOME`): banner printed
  `⚠ Install v7.0.0 behind repo v8.5.0 — run scripts/apply-global-claude-setup.sh`,
  exit 0, no crash.
- Ran from a fixture cwd + fixture HOME where the marker matched
  `~/.claude/VERSION` and no repo signature was present at cwd: no Drift Guard
  section rendered at all (correct — zero output change when healthy).

All fixture directories and the two report-folder side effects the banner
created while probing the *real* repo cwd (`reports/v8.0.0/`, `reports/v7.0.0/`
overwrite risk) were cleaned up; `git status` / `git diff` on `reports/` show no
residual changes versus the pre-task tree.

### Regression check

```
$ node scripts/test-hooks-contract.js
...
Summary: 28/28 checks passed
All hook contract checks passed.
```
Re-run after all edits — unchanged 28/28, confirming no regression to the
sprint-01 hook wiring contract.

### Quality Gates

- [x] `bash -n scripts/apply-global-claude-setup.sh` — syntax OK
- [x] `node -c scripts/session-start.js` — syntax OK
- [x] `node scripts/test-hooks-contract.js` — 28/28 passing (pre- and post-change)
- [x] Fixture verification of `--fix-hooks` (standalone, composed, both abort
      paths) — all behave as specified
- [x] Fixture verification of `session-start.js` drift guard (healthy / drifted
      marker / broken wiring) — all behave as specified, zero crash in any path
- [x] No modification to the live `~/.claude/` (read-only probes only)
- [x] No modification to any tracked file outside write scope (confirmed via
      `git status`/`git diff` after cleanup)

## Addendum — @validator finding fixed (relative PostToolUse path not normalized)

**Finding:** `config/claude-settings.json`'s canonical `PostToolUse` command is
`node scripts/check-api-impact.js` — repo-relative, by design, since that config
is validated in repo context (`test-hooks-contract.js` resolves it against
`REPO_ROOT`). The original `adjustCommand` in `fix_hooks` only matched the
`~/.claude/scripts/<name>.js` prefix form, so this relative path passed through
the merge untouched into the *install* target's `settings.json`. At runtime that
relative path resolves against whatever cwd a session happens to be in, not the
install location — breaking outside the repo.

**Fix (scoped to `scripts/apply-global-claude-setup.sh` only, per instruction):**
`adjustCommand` now normalizes both forms to the same absolute install location:

1. `~/.claude/scripts/<name>.js` → `${CLAUDE_HOME}/scripts/<name>.js` (unchanged
   from before).
2. `scripts/<name>.js` (bare repo-relative, matched only as a whole path token
   via `(^|\s)scripts\/([^\s/]+\.js)(?=\s|$)`) → `${CLAUDE_HOME}/scripts/<name>.js`
   (new).

Both rewrites run unconditionally against every canonical event's command
string during the merge; nothing else in the command (`node` prefix, matcher,
timeout) changes.

**Re-verification:**

- Rebuilt the same fixture pattern (`UserPromptSubmit`→analyze-prompt+`$CLAUDE_*`,
  `SessionStart`→`$CLAUDE_FILE_PATH`, `PostToolUse`→`$CLAUDE_FILE_PATH`,
  `SubagentStop`→`$CLAUDE_SUBAGENT_TYPE`, unrelated top-level key, unrelated
  custom event) and re-ran `--fix-hooks` standalone against it (`HOME`/
  `CLAUDE_HOME` overridden to a fresh temp fixture, real `~/.claude` untouched).
- Result: all five canonical events (`SessionStart`, `PostToolUse`,
  `SubagentStop`, `TaskCompleted`, `TeammateIdle`) are now `$HOME`-anchored in
  the merged output — including `PostToolUse`, whose command changed from
  `node scripts/check-api-impact.js` to
  `node <fixture-home>/.claude/scripts/check-api-impact.js`, argument-free.
  `analyze-prompt.js`/`UserPromptSubmit` still removed entirely; unrelated
  top-level key and unrelated custom hook event still preserved byte-for-byte;
  JSON still valid; backup still created. Exit 0.
- Re-ran `node scripts/test-hooks-contract.js`: **28/28 still passing** —
  confirms the repo-side `config/claude-settings.json` correctly stays relative
  (that's the contract test's own expectation, resolving against `REPO_ROOT`)
  and only the install-time merge in `fix_hooks` normalizes to an absolute path.
- `bash -n scripts/apply-global-claude-setup.sh` — syntax OK.
- All fixture temp dirs cleaned up; `git status` confirms no changes outside
  write scope (`scripts/apply-global-claude-setup.sh`, this report).

## Addendum 2 — CI finding: SessionStart hook must never exit non-zero (missing install)

**Finding (from PR #35 CI, surfaced by the new hook contract check):** on a
machine/CI runner with no CC_GodMode install (`~/.claude/VERSION` missing —
which also means `~/.claude` itself is typically missing), `session-start.js`
called `errorExit('VERSION file not found', ...)`, which printed a red
"CRITICAL ERROR" box and called `process.exit(1)`. A `SessionStart` hook must
never fail the session it's attached to — this is the same "must degrade
silently" philosophy already applied to the Sprint 02 drift guard, just not yet
applied to this older, pre-existing code path.

**Root cause:** `checkVersionFile()` treated "VERSION file not found" as fatal
unconditionally, with no distinction between "not installed yet" (expected,
common, harmless) and genuine corruption (unreadable file, bad permissions).

**Fix (scoped to `scripts/session-start.js` only):**

1. `checkVersionFile()` no longer calls `errorExit`/`process.exit(1)` for any
   case. Missing `VERSION_FILE` (including a missing `~/.claude` entirely) now
   returns `null` — this is the graceful "not installed" case. Invalid semver
   content or a read/permission error now print a `⚠ Warning:` line (via
   `console.log`, not the red `printBox` CRITICAL banner) and also return
   `null` — genuine corruption is now a warning, not a crash.
2. New `printNotInstalledNotice()` prints a single gray hint line:
   `CC_GodMode not installed — run scripts/apply-global-claude-setup.sh`.
3. `main()` now short-circuits right after `checkVersionFile()`: if `version`
   is `null`, it prints the notice and `return`s (no report-folder creation, no
   MCP health check, no banner box needing a version string) — the process
   then falls through to the normal (non-throwing) end of `main()` and exits 0
   via Node's default exit path. The pre-existing `errorExit()` function is
   left in place (now unused) rather than deleted, to keep this a minimal,
   scoped fix.
4. The valid-VERSION code path (report folder, MCP check, full banner,
   drift guard) is completely unchanged — no behavior difference when
   `~/.claude/VERSION` exists and parses.

**Verification:**

```
$ HOME=$(mktemp -d) node scripts/session-start.js; echo $?
CC_GodMode not installed — run scripts/apply-global-claude-setup.sh

0
```
Exit 0, no CRITICAL banner (finding's repro command now passes).

```
$ node scripts/session-start.js   # real HOME, real ~/.claude install present
[... full banner box, unchanged: VERSION, Reports, MCP Servers, Agents Ready ...]
EXIT: 0
```
Normal run with a real, healthy install produces the identical banner as
before this fix (valid-VERSION code path untouched).

```
$ node scripts/test-hooks-contract.js            → 28/28 passed
$ HOME=$(mktemp -d) node scripts/test-hooks-contract.js  → 28/28 passed
```
Both the normal local run and the CI-simulating run (`HOME` pointed at a fresh
empty temp dir, so `session-start.js`'s own fixture probe inside the contract
test also exercises the no-install path) stay fully green.

`node -c scripts/session-start.js` — syntax OK. No stray `reports/` artifacts
left behind (`git status` clean outside `scripts/session-start.js` and this
report); write scope respected (`scripts/session-start.js` only, per
instruction).

## Files Changed

### Files Created
- None — this sprint only modified existing files (plus this report).

### Files Modified
- `scripts/apply-global-claude-setup.sh` — added `--fix-hooks` flag (standalone
  and composed with normal install), `fix_hooks()` function performing a
  timestamped backup + embedded `node -e` JSON merge of the canonical hook
  wiring from `config/claude-settings.json`, updated usage/help text and the
  post-install summary output. Addendum: `adjustCommand` now normalizes both
  `~/.claude/scripts/<name>.js` AND repo-relative `scripts/<name>.js` forms to
  the same absolute `${CLAUDE_HOME}/scripts/<name>.js` in the merged output
  (fixes @validator finding re: `PostToolUse`'s relative path).
- `scripts/session-start.js` — added install/repo version-drift detection
  (`detectDriftWarnings`, `findRepoVersion`, `isGodModeRepoDir`,
  `readVersionMarker`) and broken-hook-wiring detection
  (`detectBrokenHookWiring`), wired into `main()` and rendered as an optional
  "Drift Guard" section in the existing banner (`displayWelcome`); zero output
  change when the install is healthy. Addendum 2: `checkVersionFile()` no
  longer exits non-zero for a missing/unreadable/invalid `~/.claude/VERSION` —
  degrades to `null` + a short "not installed" hint (missing case) or a
  `⚠ Warning:` line (corruption case); `main()` short-circuits to a clean
  `return` (exit 0) when `version` is `null`, fixing a pre-existing
  SessionStart-hook-must-never-fail bug caught by CI on PR #35.
- `reports/v8.6.0/sprint-02/03-builder-report.md` — this report.
