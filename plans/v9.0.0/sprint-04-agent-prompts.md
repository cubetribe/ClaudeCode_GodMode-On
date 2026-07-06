---
sprint: 4
slug: agent-prompts
plan: plans/v9.0.0/PLAN.md
status: planned
execution: sequential
owner: orchestrator
---

# Sprint 04 — Agent Prompts for Parallel & Sprint Work

## Goal
Make all 15 agent prompts sprint-aware and parallel-safe without discarding what works: add
four standard blocks to each, unify the verdict contract, and fix agent-specific defects found
in the audit.

## Scope
Standard blocks (added to every agent file, adapted per role):
1. **Context Intake** — must-read before start: assigned sprint file (goal/scope/non-goals/
   acceptance), plus role-specific inputs as explicit paths.
2. **Write Scope** — allowed paths (from frontmatter tools + sprint ownership table); writing
   outside scope ⇒ stop with `STATUS: BLOCKED (scope)`. Implementers get the explicit line:
   "NEVER write VERSION, CHANGELOG.md, ROADMAP.md, or plan files — release artifacts belong to
   the release process."
3. **Conflict & Stop Rules** — preflight `git status`/diff of the assigned scope; foreign
   modifications in scope ⇒ `STATUS: BLOCKED (conflict)`; escalation lines repeated at file end.
4. **Return Verdict** — single canonical contract (defined once in
   `docs/templates/REPORT_TEMPLATES.md`, referenced not copied): `STATUS: DONE | APPROVED |
   BLOCKED`, ≤3 findings, `report:` path under `reports/vX.Y.Z/sprint-NN/`.

Agent-specific fixes:
- @github-manager: release version from `VERSION` file (assert equal to top CHANGELOG heading),
  never from CHANGELOG grep; restate push-permission rule.
- @scribe: `[Unreleased]` flow (entries at sprint integration; promotion only via release
  tooling); remove the contradictory second template; read researcher/security reports too.
- @architect/@researcher: resolve report-writing vs. missing Write tool (grant Write scoped to
  reports/ via frontmatter).
- @validator/@api-guardian: diff against an explicitly passed commit range, not `HEAD~1`.
- Canonical report numbering defined in REPORT_TEMPLATES.md (00-researcher, 01-architect,
  02-api-guardian, 03-builder, 04-validator, 05-tester, 06-security, 07-scribe,
  08-github-manager, dept agents unnumbered by name) — all files reference it.
- Unify status sets (tester/researcher FAILED/PARTIAL → map to BLOCKED with reason).
- Remove stale v5.x stamps; department agents get the verdict contract too.

## Non-Goals
- No CLAUDE.md/skill changes (Sprint 5). No renaming/removal of agents.

## Files / Write Scope
| Path | Writer |
|---|---|
| `agents/*.md` (15 files), `docs/templates/REPORT_TEMPLATES.md` | orchestrator |

## Risks
- Prompt bloat → blocks are compact (≤15 lines each), shared definitions referenced not copied.
- Breaking working handoffs → preserve existing structure/personas; additive where possible.

## Acceptance Criteria
- [ ] All 15 files contain the four blocks; grep for `STATUS: BLOCKED (conflict)` hits 15 files
- [ ] `grep -l "report: <absolute" agents/` covers all 15 (or references REPORT_TEMPLATES)
- [ ] github-manager contains `cat VERSION` derivation, no CHANGELOG grep
- [ ] No `(v5.` stale stamps remain in agents/

## Test / Validation Strategy
Structural greps per acceptance criteria + manual read-through of the 4 most-changed files
(scribe, github-manager, builder, validator).

## Changelog Note
Changed: all 15 agent prompts gain sprint intake, write scopes, conflict/stop rules, and a
unified verdict contract; github-manager now tags from VERSION.

## Version Relevance
major (verdict/handoff contract changes).

## Result
(filled at completion)
