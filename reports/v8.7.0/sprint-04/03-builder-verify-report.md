---
agent: builder-2 (verify)
sprint: v8.7.0/sprint-04
date: 2026-07-29
status: blocked-quality
---

# Sprint 04 — Builder Report (verify track)

## Scope

Write scope: `scripts/verify-install.js` (new), `scripts/test-hooks-contract.js`, `package.json`
(`scripts` block only). Did not touch `scripts/apply-global-claude-setup.sh` / `.ps1`
(builder-1's scope, parallel), `README.md`, `docs/**`, `CC-GodMode-Prompts/**`, `archive/**`,
`reports/**` beyond this file, `plans/**`, `CHANGELOG.md`, `VERSION`.

Preflight: `git status` on assigned paths clean before first write; `plans/v8.7.0/sprint-04-*.md`
was the only pre-existing modification in the tree (frontmatter/status edits by the orchestrator,
not a conflict with my write scope).

## Files Created

- `scripts/verify-install.js` — new executable check. Resolves `CLAUDE_HOME` (env var, default
  `~/.claude`), detects whether it is running with a repo next to it (`agents/`, `skills/`,
  `VERSION`, `config/claude-settings.json` all present) or standalone from an installed copy, and
  reports six categories: agents, skills, hooks (wired + referenced script exists), orchestrator
  template, version marker vs. repo `VERSION` (warning only), LICENSE/NOTICE. Exit 0 = clean, exit
  1 = concrete file-level errors listed. Never crashes when no repo is present — falls back to
  best-effort checks against `CLAUDE_HOME` alone and says plainly what it could not verify.
  License header matches `scripts/release-check.js`; has the `require.main === module` guard.

## Files Modified

- `scripts/test-hooks-contract.js:756-960` (approx.) — added a new block covering the installer
  hook-merge contract and `verify-install.js`, all against disposable `os.tmpdir()` fixtures via
  the shared `makeFixtureCwd()` helper:
  1. Merge into a `settings.json` carrying `model`, `effortLevel`, `permissions`, and a foreign
     `SessionStart` hook — asserts the three foreign top-level keys survive unchanged and the
     GodMode `session-start.js` hook is added.
  2. Same scenario, asserts the foreign hook entry itself survives — **this one currently FAILS**
     (see Quality Gates below; root cause is in `apply-global-claude-setup.sh`, outside my scope).
  3. Two consecutive installer runs — asserts no duplicate `session-start.js` entries.
  4. No `settings.json` present — asserts one is created containing every hook event from
     `config/claude-settings.json`.
  5. `verify-install.js` against a full installer run — asserts exit 0.
  6. Same fixture with `agents/builder.md` removed — asserts exit 1 and that `builder.md` is named
     in the output.
- `package.json:20-21` — added `"install:verify": "node scripts/verify-install.js"` to the
  `scripts` block. No other change to the file.

## Quality Gates

- [x] `node scripts/verify-install.js` — exit 0 against a full install fixture, exit 1 with the
  concrete missing filename against a fixture with one agent removed, exit 0 (with plain "cannot
  verify" notes) when run from an installed copy with no repo nearby.
- [x] `node scripts/release-check.js` — passes (`VERSION=8.6.0` matches top CHANGELOG and latest
  tag).
- [x] `node scripts/sync-version.js --check` — 14/14 touchpoints consistent.
- [ ] `node scripts/test-hooks-contract.js` — **63/64** (was 48/48 before this sprint's additions;
  I added 16 new checks, 15 pass). The one failure:
  `installer merge: foreign SessionStart hook entry ("echo foreign-hook") survives` — the
  installer's `wire_hooks()` (builder-1's file, `scripts/apply-global-claude-setup.sh`) replaces
  the canonical events (`SessionStart`, `PostToolUse`, `SubagentStop`, `TaskCompleted`,
  `TeammateIdle`) **wholesale** rather than appending to them. A foreign hook placed on the same
  event name as a GodMode canonical hook is destroyed by the merge. Foreign top-level keys
  (`model`, `effortLevel`, `permissions`) and foreign hooks on *non-canonical* event names are
  unaffected — only same-event foreign hooks are at risk. This directly contradicts the sprint's
  Auftrag-3 requirement #1 ("ein fremder Hook … überlebt unverändert") and I did not weaken the
  test to make it pass — the test reflects the sprint's binding text as dispatched to me. No fix
  applied: `apply-global-claude-setup.sh` is outside my write scope.
- [x] No TypeScript/lint tooling in this repo (plain Node scripts) — n/a.

## Tests

- `scripts/test-hooks-contract.js` extended in place (see Files Modified). Ran the full suite
  standalone: **63/64 passed**. All 48 pre-existing checks still pass — no regression.
- Confirmed `scripts/verify-install.js` is read-only: a run against the maintainer's real
  `~/.claude` (no `CLAUDE_HOME` override) only reads and reports, never writes. It surfaced a
  pre-existing, out-of-scope finding worth flagging to the orchestrator: the maintainer's actual
  installed runtime is missing `LICENSE-CC_GodMode.txt` / `NOTICE-CC_GodMode.txt` (exit 1 on that
  machine today). Not caused by this sprint; not fixed here (outside write scope, and fixing it
  would mean writing into the maintainer's real `~/.claude`, which I will not do without an
  explicit re-run of the installer by the maintainer or the orchestrator).
- Every new test case creates and tears down its own `os.tmpdir()`-based fixture directory; none
  reference or touch the real `~/.claude`.

## Open Item For Orchestrator / Builder-1

`apply-global-claude-setup.sh`'s `wire_hooks()` needs to merge canonical *events* additively
(append/replace only entries whose hook `command` matches a GodMode script, keep other entries in
the same event's array) instead of replacing the whole event array. This is a one-function change
in a file outside my write scope — flagging, not fixing.
