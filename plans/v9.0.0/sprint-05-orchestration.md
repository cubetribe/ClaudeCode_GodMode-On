---
sprint: 5
slug: orchestration
plan: plans/v9.0.0/PLAN.md
status: done
execution: sequential
owner: orchestrator
---

# Sprint 05 — Orchestration Rules & Conflict Avoidance

## Goal
Rewrite the orchestrator law for plan-first sprint execution and resolve the documented
contradictions between CLAUDE.md, skills, and orchestrator docs.

## Scope
- `CLAUDE.md` v9: Core Rule 1 becomes **Plan-First** (plan + sprints before dispatch for
  non-trivial work; trivial single-sprint fast path stays Smart-Routed); Rule 8 reports path
  gains sprint namespace; new **Sprint Execution** section (preflight, integration, single-writer
  hot files); Parallelization section gains the ownership/disjoint-scope rule; Start checklist
  rewritten (no VERSION bump at start); version footer via sync manifest.
- New `skills/sprint-planning/SKILL.md`: how to write PLAN.md + sprint files, ownership matrix,
  preflight, integration steps, when to parallelize sprints, release-sprint procedure.
- `skills/release/SKILL.md` + `docs/orchestrator/VERSIONING.md`: rewritten to the new law
  (version-at-release, [Unreleased], manifest, invariant, RC rule `vX.Y.Z-rc.N` as GitHub
  pre-release, backfill/repair procedure). VERSIONING.md becomes the single authoritative
  release-law doc; skills/release references it.
- Contradiction fixes: changelog-keyword rule in `skills/meta-decisions/` vs. release-artifact
  risk signal (release artifacts always win); emergencyHotfix precedence note; 'No Skipping' vs
  Smart Routing (rule rephrased: no skipping within the selected path); quality-gates
  isolation claim aligned with reality; report numbering references.
- `templates/CLAUDE-ORCHESTRATOR.md`: regenerated from the v9 root CLAUDE.md (thin wrapper +
  project header) so the installer's behavior (root CLAUDE.md is what ships) and the template
  stop diverging; stale '11 Skills'/'NEW in V3.1' removed.
- `docs/orchestrator/MODES.md`, `WORKFLOWS.md`, `QUALITY-GATES.md`: sprint mode row, workflow
  table gains "Plan:"/"Sprint:" commands, gate docs get sprint-scoped report paths.
- ADR-005: single-writer release process + CI invariant.

## Non-Goals
- No README/install-prompt edits (Sprint 6). No agent file edits (done in Sprint 4).

## Files / Write Scope
| Path | Writer |
|---|---|
| `CLAUDE.md`, `templates/CLAUDE-ORCHESTRATOR.md`, `skills/sprint-planning/**`, `skills/release/SKILL.md`, `skills/meta-decisions/SKILL.md`, `skills/cost-efficiency/SKILL.md`, `skills/quality-gates/SKILL.md`, `docs/orchestrator/*.md`, `DECISIONS.md` (ADR-005), `.claude-plugin/plugin.json` (register new skill) | orchestrator |

## Risks
- CLAUDE.md is the product core → keep the compact style; every removed rule must be replaced
  or explicitly retired in ADR-005/CHANGELOG.
- Doc sprawl → VERSIONING.md authoritative, others reference it.

## Acceptance Criteria
- [x] CLAUDE.md contains Plan-First rule (Core Rule 1), Sprint Execution section, rewritten Start checklist without version bump, changelog-at-integration rule (Core Rule 11)
- [x] skills/sprint-planning exists and is registered in plugin.json (14 skills)
- [x] No remaining version-first/increment-before-work instruction outside CHANGELOG history
- [x] Contradictions resolved with documented winners: changelog-keyword vs release-artifact signal (release law wins), Smart-Routing vs parallel-first (compose: minimal set, then fan-out), 'No Skipping' scoped to the selected path, bug-fix path now ends with @scribe integration, quality-gates isolation claim marked as native frontmatter

## Test / Validation Strategy
Grep-based consistency sweep (version-first phrases, skill count, numbering) + read-through of
CLAUDE.md as a whole.

## Changelog Note
Changed: orchestrator law v9 — Plan-First replaces Version-First; new sprint-planning skill;
release law consolidated into VERSIONING.md.

## Version Relevance
major (breaking CLAUDE.md change).

## Result
CLAUDE.md rewritten to v9 law (Plan-First, Sprint Execution loop, hot-file single-writer rule,
ownership-before-fan-out). VERSIONING.md is now the single authoritative release law (SSOT
hierarchy, version-at-release, changelog law, release procedure incl. RCs, enforcement table,
repair procedures); skills/release reduced to an operational cheat sheet referencing it. New
skills/sprint-planning registered. templates/CLAUDE-ORCHESTRATOR.md regenerated as a thin
mirror of root CLAUDE.md (499 stale lines → 209, ends divergence; sync manifest still green).
ADR-005 records the single-writer release process + CI invariant. MODES/WORKFLOWS docs carry
the v9 plan-first preamble.
