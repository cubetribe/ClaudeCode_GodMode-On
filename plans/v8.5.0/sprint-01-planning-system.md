---
sprint: 1
slug: planning-system
plan: plans/v8.5.0/PLAN.md
status: done
execution: sequential
owner: orchestrator
---

# Sprint 01 — Planning System & Sprint Structure

## Goal
Create the artifact layer that makes plan-first, sprint-based orchestration possible: a living
roadmap, a plans/ directory with a master plan, a reusable sprint template, and the ADR that
records the doctrine change.

## Scope
- `ROADMAP.md` (living roadmap, repo root)
- `plans/v8.5.0/PLAN.md` + all sprint files 01–07
- `docs/templates/SPRINT_TEMPLATE.md`
- ADR-004 in `DECISIONS.md` (Plan-First & version-at-release) + index row

## Non-Goals
- No changes to CLAUDE.md, agents, skills, scripts, or version tooling (Sprints 2–5).
- No VERSION/CHANGELOG release writes.

## Files / Write Scope
| Path | Writer |
|---|---|
| `ROADMAP.md`, `plans/v8.5.0/**`, `docs/templates/SPRINT_TEMPLATE.md`, `DECISIONS.md` | orchestrator |

## Risks
- Template over-engineering → keep it one page; extend only when a real sprint needs it.

## Acceptance Criteria
- [x] ROADMAP.md exists with v8.5.0 in-progress entry
- [x] PLAN.md documents audit findings, target architecture, sprint index, ownership
- [x] SPRINT_TEMPLATE.md contains all 9 mandatory fields + preflight + result section
- [x] ADR-004 recorded with status ACCEPTED and index row

## Test / Validation Strategy
Structural review: every sprint file parses (frontmatter), every mandatory field present.

## Changelog Note
Added: plan-first artifact layer (`ROADMAP.md`, `plans/`, sprint template, ADR-004).

## Version Relevance
major — introduces the artifact layer that replaces Version-First orchestration.

## Result
Delivered as scoped. Audit digests tracked under `reports/v8.5.0/sprint-00/` (reports are
repo artifacts since the 2026-07-06 maintainer rule); condensed audit summary lives in PLAN.md.
