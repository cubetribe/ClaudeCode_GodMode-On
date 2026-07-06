---
sprint: 7
slug: release
plan: plans/v9.0.0/PLAN.md
status: planned
execution: sequential
owner: orchestrator
---

# Sprint 07 — Release Candidate & GitHub Release

## Goal
Resolve the inherited release drift, then ship v9.0.0 through the new release process itself
(the release is the first execution of the new law).

## Scope
1. **Backfill v8.0.1**: annotated tag `v8.0.1` on merge commit `114346e` + GitHub Release from
   the CHANGELOG [8.0.1] section (marked as backfilled). Decide with maintainer whether v7.1.1
   gets the same treatment or a CHANGELOG "released as part of v8.0.0" note.
2. Clean up local orphan tags v1.0.0/v1.1.0 (document; delete locally or push — maintainer call).
3. Final validation: `sync-version.js --check`, `release-check.js`, structural greps, full
   sprint-file review (all `done`).
4. Version decision: aggregate sprint version-relevance fields → **major** → 9.0.0.
5. `node scripts/version-bump.js major` (bump + [Unreleased] promotion + sync).
6. Release PR `release/v9.0.0` → main with full changelog entry; CI must pass.
7. Optional RC: `v9.0.0-rc.1` pre-release if maintainer wants a soak period.
8. After merge: tag + GitHub Release (auto-draft via new workflow, publish manually).

## Non-Goals
- No new features or fixes in this sprint — release mechanics only.

## Files / Write Scope
| Path | Writer |
|---|---|
| `VERSION`, `CHANGELOG.md` (promotion), all sync-manifest touchpoints, `ROADMAP.md` (status flip) | release tooling (this sprint only) |

## Risks
- **Push/tag/release require explicit maintainer permission — hard stop before any remote
  operation.** Everything is prepared locally; a single approval executes the tail.
- Backfill tag could confuse the auto-tag workflow → backfill BEFORE merging the v9 PR;
  workflow only reacts to VERSION changes in pushes after it exists on main.

## Acceptance Criteria
- [ ] `release-check.js` green after backfill (8.0.1 reconciled)
- [ ] VERSION=9.0.0 == top CHANGELOG == release PR
- [ ] CI green on the release PR
- [ ] GitHub Release v9.0.0 published, ROADMAP flipped to released

## Test / Validation Strategy
The new checks themselves + manual verification of tag/release objects via `gh`.

## Changelog Note
(the v9.0.0 entry itself)

## Version Relevance
This sprint executes the bump: **9.0.0 (major)**.

## Result
(filled at completion)
