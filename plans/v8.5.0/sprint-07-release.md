---
sprint: 7
slug: release
plan: plans/v8.5.0/PLAN.md
status: done
execution: sequential
owner: orchestrator
---

# Sprint 07 — Release Candidate & GitHub Release

## Goal
Resolve the inherited release drift, then ship v8.5.0 through the new release process itself
(the release is the first execution of the new law).

## Scope
1. **Backfill v8.0.1**: annotated tag `v8.0.1` on merge commit `114346e` + GitHub Release from
   the CHANGELOG [8.0.1] section (marked as backfilled). Decide with maintainer whether v7.1.1
   gets the same treatment or a CHANGELOG "released as part of v8.0.0" note.
2. Clean up local orphan tags v1.0.0/v1.1.0 (document; delete locally or push — maintainer call).
3. Final validation: `sync-version.js --check`, `release-check.js`, structural greps, full
   sprint-file review (all `done`).
4. Version decision: aggregate sprint version-relevance fields → **major** → 8.5.0.
5. `node scripts/version-bump.js major` (bump + [Unreleased] promotion + sync).
6. Release PR `release/v8.5.0` → main with full changelog entry; CI must pass.
7. Optional RC: `v8.5.0-rc.1` pre-release if maintainer wants a soak period.
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
- Backfill tag could confuse the auto-tag workflow → backfill BEFORE merging the v8.5 PR;
  workflow only reacts to VERSION changes in pushes after it exists on main.

## Acceptance Criteria
- [ ] `release-check.js` green after backfill (8.0.1 reconciled)
- [ ] VERSION=8.5.0 == top CHANGELOG == release PR
- [ ] CI green on the release PR
- [ ] GitHub Release v8.5.0 published, ROADMAP flipped to released

## Test / Validation Strategy
The new checks themselves + manual verification of tag/release objects via `gh`.

## Changelog Note
(the v8.5.0 entry itself)

## Version Relevance
This sprint executes the bump: **8.5.0 (major)**.

## Maintainer decisions (2026-07-06, second review round)
- Release version is **8.5.0** (maintainer designation; semver-MAJOR content, migration notes retained in the entry).
- Model positioning: optimized for Opus 4.8 + ultracode; higher tiers optional-only.
- `reports/` becomes TRACKED: all agent AND subagent reports persist as markdown in the repo
  (Core Rule 8 rewritten; .gitignore, VERSIONING.md, REPORT_TEMPLATES.md, sprint-planning skill,
  CLAUDE.md Parallelization updated; audit digests committed under reports/v8.5.0/sprint-00/).
- Official release explicitly authorized by maintainer ("erstell ein offizielles Release").

## Result (as of 2026-07-06 — releases executed after maintainer authorization; see below)
Completed locally:
- Backfill tags created: `v8.0.1` @ 114346e (PR #32 state), `v7.1.1` @ bf7853a (PR #25 merge) —
  both annotated with a "backfilled" note. NOT pushed yet.
- v8.5.0 bump executed via `node scripts/version-bump.js major`: VERSION, [Unreleased]→[8.5.0]
  promotion, all 12 touchpoints synced in one command. Codename block added ("The Sprint-Native
  Release"). `sync-version --check` green; `release-check` clean except the expected
  "tag without published GitHub release" (resolves when backfill releases are published).
- Local orphan tags v1.0.0/v1.1.0: recommendation = delete locally (never pushed; v1.1.0 has no
  CHANGELOG entry). Left untouched — maintainer's call.

Awaiting explicit permission (single batch):
1. Push branch `release/v8.5.0` + open PR to main (CI release-consistency runs there for the first time).
2. Push backfill tags `v7.1.1`, `v8.0.1` + publish their GitHub Releases from the CHANGELOG sections (marked backfilled).
3. After PR merge (merge commit): release-tag workflow tags v8.5.0 + drafts the release → publish.
Optional: v8.5.0-rc.1 pre-release soak before the final publish; branch-protection required check
"Release Consistency" (manual GitHub settings step).
