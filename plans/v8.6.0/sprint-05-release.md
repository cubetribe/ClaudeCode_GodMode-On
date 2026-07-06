---
sprint: 05
slug: release
plan: plans/v8.6.0/PLAN.md
status: planned
execution: sequential
owner: orchestrator
---

# Sprint 05 — Release v8.6.0 "Fable 5 Light"

## Goal
Cut the release per the v8.5 release law: aggregate Version Relevance (highest = minor
⇒ 8.5.0 → 8.6.0), promote the changelog, sync all touchpoints, verify the invariant,
prepare the release PR. Codename "Fable 5 Light" in CHANGELOG title block and GitHub
Release title only.

## Scope
- @scribe: finalize `[Unreleased]` — codename title block ("Fable 5 Light" — hook
  repair, install sync, routing audit, scoped compensation), consolidated entries from
  sprints 01–04.
- Run `node scripts/version-bump.js minor` (writes VERSION once, promotes
  [Unreleased] to `[8.6.0] - <date>`, syncs all 12 touchpoints).
- Verify: `node scripts/sync-version.js --check`, `node scripts/release-check.js`
  (ahead-of-tag tolerated on release/* branch), `npm run hooks:test`.
- `ROADMAP.md`: add/flip v8.6.0 entry to released.
- Commit; prepare PR `release/v8.6.0` → `main`. **STOP before push — push/PR/publish
  only with explicit maintainer permission (Core Rule 9).**

## Non-Goals
- No pushing, no PR creation, no tag, no GitHub Release without explicit permission.
- No new features.

## Files / Write Scope (ownership)
| Path / Glob | Writer | Notes |
|---|---|---|
| `CHANGELOG.md` | @scribe → version-bump.js | codename block + promotion |
| `VERSION` + 12 touchpoints | `scripts/version-bump.js` only | single write |
| `ROADMAP.md` | orchestrator | status flip |
| `plans/v8.6.0/**` | orchestrator | Result sections, status=done |

## Risks
- Invariant failure on branch → release-check tolerates ahead-of-tag on release/*.
- Touchpoint drift → sync-version --check is the gate.

## Acceptance Criteria
- [ ] VERSION == 8.6.0 == top CHANGELOG heading; all touchpoints green (`sync-version.js --check`).
- [ ] `release-check.js` passes on the branch.
- [ ] `hooks:test` green.
- [ ] All sprint files status=done with filled Result sections; reports committed.
- [ ] Branch ready for PR; NOT pushed.

## Test / Validation Strategy
The three scripted checks above + @validator final diff review of the release commit.

## Changelog Note
(this sprint produces the release heading itself)

## Version Relevance
none — release mechanics; aggregate of plan = minor.

## Preflight (checked at sprint start)
- [ ] Sprints 01–04 status = done
- [ ] `git status` clean except release artifacts

## Result (filled at completion)
_pending_
