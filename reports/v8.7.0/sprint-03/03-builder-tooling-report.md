---
agent: builder-5 (tooling)
sprint: v8.7.0/sprint-03
date: 2026-07-28
status: complete
task: coherence sweep — version-header drift made mechanically enforced
---

# Builder Report — @builder-5 (tooling)

## Scope

Write scope: `scripts/sync-version.js`, `scripts/test-hooks-contract.js`, mirrored to
`~/.claude/scripts/`. No other files touched.

## Summary

Extended `sync-version.js`'s MANIFEST with the two headers the sprint identified as silently
drifted (`docs/orchestrator/VERSIONING.md`, `skills/release/SKILL.md`), both expecting full
three-part SemVer per the sprint instruction. `docs/orchestrator/MODES.md` deliberately gets no
entry — its "Updated: <date>" line is being removed entirely by @builder-2, not tracked.

Added a contract test to `test-hooks-contract.js` that proves the mechanism: applies the new
VERSIONING.md manifest pattern to a synthetic consistent header (must report "ok", i.e. `--check`
would pass) and to a synthetic drifted header (`v8.5` vs `VERSION=8.6.0`, must NOT report "ok",
i.e. `--check` would exit non-zero).

While building the test I found requiring `sync-version.js` for its exported `MANIFEST` was
unconditionally re-running `main()` (and thus a real `--check` with `process.exit()` side effects)
on load, because `main()` was called unguarded at module scope. Added a
`require.main === module` guard so the CLI behavior is unchanged but requiring the module for its
exports (as the new test does) no longer executes it. This is a correctness fix required to make
the new test deterministic and safe to run in-process; no other behavior changed.

## Files Created

None.

## Files Modified

- `scripts/sync-version.js` — MANIFEST gained two entries (`docs/orchestrator/VERSIONING.md`,
  `skills/release/SKILL.md`), both matching only full three-part SemVer headers; `main()` call
  guarded with `require.main === module` so `require()`-ing the module for `MANIFEST`/`getVersion`
  no longer triggers a live `--check` side effect.
- `scripts/test-hooks-contract.js` — added an in-process probe (2 checks) that exercises the new
  VERSIONING.md manifest pattern against a consistent and a drifted synthetic header, proving the
  drift-detection mechanism works without depending on the live repo's transient mid-sprint state.
- Both files mirrored byte-for-byte to `~/.claude/scripts/` (`diff` confirmed identical).

## Quality Gates

- [x] `node scripts/sync-version.js --check` — **GREEN** (14/14 touchpoints consistent,
      VERSION=8.6.0). At an earlier point in this sprint it was red on
      `skills/release/SKILL.md` only, because @builder-3 had not yet landed the header fix on that
      file — expected, transient, per the sprint's own Auftrag 2 framing ("kein Fehler"). Re-checked
      after @builder-3's parallel work landed: now green.
- [x] `node scripts/test-hooks-contract.js` — **47/47 PASS** (was 43/43 before this sprint; +4 new
      checks: `sync-version.js` exists, MANIFEST includes the new entry, consistent-header "ok",
      drifted-header "not ok"). No pre-existing check broken.

## Tests

- `node scripts/sync-version.js --check` (manual run, see above).
- `node scripts/test-hooks-contract.js` (full suite, 47/47 green, see above).

## Notes for integration

- Final abnance state at report time: `sync-version.js --check` is **green**; both new manifest
  touchpoints (`docs/orchestrator/VERSIONING.md`, `skills/release/SKILL.md`) are consistent with
  `VERSION=8.6.0` because the parallel builders assigned to those files landed their fixes before
  this report was written.
- `docs/orchestrator/MODES.md` intentionally has no manifest entry (its date line is removed, not
  version-tracked) — confirmed no "Updated:" line remains in that file at report time.
