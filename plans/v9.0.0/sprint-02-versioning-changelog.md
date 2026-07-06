---
sprint: 2
slug: versioning-changelog
plan: plans/v9.0.0/PLAN.md
status: planned
execution: sequential
owner: orchestrator
---

# Sprint 02 — Versioning & Changelog Mechanics

## Goal
One canonical version source, one complete touchpoint manifest, one composed bump command, an
`[Unreleased]` changelog flow, and a machine-checkable release invariant.

## Scope
- Rewrite `scripts/sync-version.js`: full touchpoint manifest (VERSION, plugin.json, CLAUDE.md
  header+footer, templates/CLAUDE-ORCHESTRATOR.md, README badge+footer, all 6 prompt files,
  docs/AGENT_MODEL_SELECTION.md), codename-agnostic patterns, `--check` exits 1 on any
  mismatch/unknown.
- Extend `scripts/version-bump.js`: verify uniqueness against **git tags** (not just CHANGELOG),
  promote `[Unreleased]` → `[X.Y.Z] - date`, then run sync; keep `--dry-run`.
- New `scripts/release-check.js`: invariant `VERSION == top CHANGELOG version == latest tag ==
  latest GitHub release`, tolerating `VERSION > latest tag` only on `release/*` branches or when
  `[Unreleased]` promotion is in flight; also flags CHANGELOG versions without tags.
- `CHANGELOG.md`: add `[Unreleased]` section; fix the 8.0.1 codename conflict in
  CLAUDE.md/README/template (defer actual edits of those files to their owning sprints if
  needed — codename fix allowed here as it is version-tooling-adjacent: single line each).
- `package.json`: real manifest (name, version synced, scripts: `version:check`, `version:bump`,
  `release:check`, `pre-push`).

## Non-Goals
- No CI wiring (Sprint 3). No agent prompt changes (Sprint 4). No VERSION bump (Sprint 7).

## Files / Write Scope
| Path | Writer |
|---|---|
| `scripts/sync-version.js`, `scripts/version-bump.js`, `scripts/release-check.js`, `scripts/pre-push-check.js` | orchestrator |
| `CHANGELOG.md` (structure only: add [Unreleased]), `package.json`, `.claude-plugin/plugin.json` (name/desc untouched) | orchestrator |
| One-line codename fixes: `CLAUDE.md:178`, `README.md`, `templates/CLAUDE-ORCHESTRATOR.md` | orchestrator |

## Risks
- Regex sweeps touching historical strings → patterns anchored to current-state contexts only;
  verify with `--check` + git diff review.
- CHANGELOG is history → only ADD [Unreleased]; no rewriting of released entries here.

## Acceptance Criteria
- [ ] `node scripts/sync-version.js --check` passes and covers all ~14 touchpoints
- [ ] `node scripts/version-bump.js patch --dry-run` shows bump+promotion+sync plan
- [ ] `node scripts/release-check.js` correctly reports today's drift (8.0.1 vs v8.0.0)
- [ ] `npm run version:check` etc. work

## Test / Validation Strategy
Run all three scripts against the live repo; verify expected failures (current drift) and
expected passes; `--dry-run` snapshots reviewed in diff.

## Changelog Note
Changed: version tooling unified — full touchpoint manifest, composed bump command,
`[Unreleased]` flow, new release-consistency check.

## Version Relevance
major (part of the release-law change).

## Result
(filled at completion)
