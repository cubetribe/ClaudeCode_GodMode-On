# Sprint Template

> Copy this file to `plans/vX.Y.Z/sprint-NN-<slug>.md` when planning a sprint.
> The sprint file is the single source of truth for the sprint's scope, status, and file ownership.
> Only the Orchestrator changes `status`; agents read the sprint file but never edit it.

```markdown
---
sprint: NN
slug: <short-slug>
plan: plans/vX.Y.Z/PLAN.md
status: planned            # planned | in-progress | review | done | blocked
execution: sequential      # sequential | parallel (parallel requires disjoint write scopes)
owner: orchestrator
---

# Sprint NN — <Title>

## Goal
One paragraph: what this sprint achieves and why.

## Scope
- Concrete task 1
- Concrete task 2

## Non-Goals
- Explicitly out of scope (prevents scope creep and cross-sprint collisions).

## Files / Write Scope (ownership)
| Path / Glob | Writer | Notes |
|---|---|---|
| `path/to/file` | @builder | |

Rules:
- Every file this sprint may WRITE is listed here. Writing outside this list = STOP, report `STATUS: BLOCKED (scope)`.
- Hot files (`VERSION`, `CHANGELOG.md`, `ROADMAP.md`, `README.md`, plan files) have exactly ONE writer and are never edited in parallel phases.
- Before parallelizing sprints, the Orchestrator verifies write scopes are disjoint. Overlap ⇒ sequential.

## Risks
- Risk → mitigation.

## Acceptance Criteria
- [ ] Verifiable criterion 1
- [ ] Verifiable criterion 2

## Test / Validation Strategy
How the result is verified (commands, checks, review type). Prefer runnable checks
(`node scripts/sync-version.js --check`, `node scripts/release-check.js`, targeted grep).

## Changelog Note
One draft bullet for `CHANGELOG.md` `[Unreleased]` (added at sprint integration, by the single changelog writer).

## Version Relevance
none | patch | minor | major — with one-line justification.
The release sprint aggregates these fields to decide the actual bump (highest wins).
VERSION itself is NEVER touched inside a normal sprint.

## Preflight (checked at sprint start)
- [ ] `git status` clean (or only expected files from previous sprint)
- [ ] Plan/base assumptions still valid (re-read PLAN.md delta section)
- [ ] No other in-progress sprint owns overlapping files

## Result (filled at completion)
Summary of what was done, deviations from plan, follow-ups.
```
