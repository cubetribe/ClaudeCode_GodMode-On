---
sprint: 4
slug: agent-prompts
plan: plans/v9.0.0/PLAN.md
status: done
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
- [x] All 15 files contain the Sprint Contract; `BLOCKED (scope)`/`BLOCKED (conflict)` in 15/15
- [x] `report: <absolute path` verdict line present in all 15 files
- [x] github-manager derives the version via `cat VERSION` + CHANGELOG-consistency assert; the CHANGELOG-grep derivation is gone
- [x] No `(v5.` stale stamps remain in agents/ (tester/researcher cleaned, dept footers replaced)

## Test / Validation Strategy
Structural greps per acceptance criteria + manual read-through of the 4 most-changed files
(scribe, github-manager, builder, validator).

## Changelog Note
Changed: all 15 agent prompts gain sprint intake, write scopes, conflict/stop rules, and a
unified verdict contract; github-manager now tags from VERSION.

## Version Relevance
major (verdict/handoff contract changes).

## Result
All 15 agent prompts carry the v9 Sprint Contract (context intake, write scope, conflict/stop
rules, canonical verdict incl. BLOCKED reason categories). REPORT_TEMPLATES.md is now the single
canonical definition (verdict shape, report numbering 00–08 + unnumbered dept reports, sprint
namespace `reports/vX.Y.Z/sprint-NN/`, `-rN` re-run suffix). Specific fixes: github-manager tags
from VERSION with consistency assert + rc pre-release guidance + merge-commit law; scribe is
sole CHANGELOG writer ([Unreleased] only, bump via tooling; stale banners corrected);
architect/researcher got Write for their reports; validator/api-guardian/security diff an
Orchestrator-passed range instead of HEAD~1; tester ordering contradiction fixed (parallel);
ci-security-guardian is explicitly advisory (specifies workflows, @builder writes).
