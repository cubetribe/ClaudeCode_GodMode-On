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
ux_gate: human             # auto | human | skip — see rule below
---

# Sprint NN — <Title>

## Goal
One paragraph: what this sprint achieves and why.

## Scope
- Concrete task 1
- Concrete task 2

## UX Gate (`ux_gate: auto | human | skip`)
Decided **once, at sprint planning**, in writing, before execution starts. The loop is never
interrupted mid-run to ask again.
- Asked **only** if this sprint's Write Scope table below touches UI paths. Otherwise the
  Orchestrator sets `skip` silently — no question raised.
- Default when unclear: `human`.
- `auto` requires a reachable `playwright` MCP. If it is unreachable, the sprint falls back to
  `human` and logs the fallback in the Routing Log below instead of blocking.
- `auto` is what triggers @tester (3 viewports — 375×667 / 768×1024 / 1920×1080 —, console
  errors, Core Web Vitals). `human` and `skip` mean no @tester run for this sprint; that skip is
  still a Routing Log line, not a silent omission.

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

## Routing Log
**Canonical definition** (`skills/cost-efficiency/SKILL.md` references this section). Under
Core Rule 7 ("Skips are logged, not forbidden"), this is where every agent Smart Routing leaves
out — including a `ux_gate` value of `human`/`skip`, or an `auto` that fell back to `human`
because `playwright` was unreachable — lands with its reason. The unlogged skip is the defect,
not the skip itself. One line per routing decision or agent skip, logged **before dispatch**:

```
- <date> | path: smart-routing|full-gates | signals: <risk signals seen or "none"> | skipped: <agents skipped + one-line justification, or "none"> | ux_gate: <auto|human|skip> (+ fallback note if auto→human)
```

Example:
- 2026-07-06 | path: smart-routing | signals: none | skipped: @architect (small doc-only change, no new module) | ux_gate: skip (no UI paths in write scope)
- 2026-07-07 | path: full-gates | signals: src/api/routes.ts, VERSION | skipped: none | ux_gate: human (UI touched, default — not asked otherwise)
- 2026-07-08 | path: smart-routing | signals: src/components/Card.tsx | skipped: none | ux_gate: auto→human (playwright MCP unreachable, fell back per rule)

Rules:
- Every routing choice AND every agent skip MUST be logged before dispatch, including the
  sprint's `ux_gate` value and any `auto`→`human` fallback.
- A skip without a matching log line is a contract violation — reviewers return `BLOCKED (quality)`.
- Implicit sprints (`sprint-00`, no sprint file) put the same line in the report header instead of a sprint file section.

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
