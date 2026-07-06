---
sprint: 03
slug: routing-audit
plan: plans/v8.6.0/PLAN.md
status: planned
execution: parallel
owner: orchestrator
---

# Sprint 03 — Routing Audit & Conflict Adjudication

## Goal
Make the orchestrator's own decisions auditable and rule-bound — the analysis showed
routing misclassification bypasses every downstream gate invisibly, and conflicting
findings between parallel agents have no defined adjudication. Convert these judgment
surfaces into recorded, checkable procedure (the tier-insensitive compensation class).

## Scope
- **Routing Decision Log** (`skills/cost-efficiency/SKILL.md` + `docs/templates/SPRINT_TEMPLATE.md`):
  mandatory `## Routing Log` section in every sprint file — one line per routing
  choice: selected path (Smart Routing/Full-Gates), risk signals seen, agents skipped
  + justification. Rule: a gate-skip without a log line is a contract violation.
- **Escalation decision tree** (`docs/orchestrator/META-DECISIONS.md`): explicit
  mandatory-vs-optional criteria for the 3 tiers (agent self-resolution → orchestrator
  → human), replacing the loose 5-case list with a decision tree including "verdict
  conflict unresolvable by written criteria ⇒ Tier 3 mandatory".
- **Finding-conflict adjudication** (`docs/orchestrator/QUALITY-GATES.md`): procedure
  for contradictory findings (validator vs tester, or parallel subagents): (1) check
  against written criteria (rule violated? in-scope?); (2) criteria-resolvable ⇒
  judge panel (2–3 diverse-prompted judges) ONLY on this conflict path; (3) not
  criteria-resolvable ⇒ human escalation — never majority-vote a judgment question.
- **Inline arch brief required fields** (`skills/cost-efficiency/SKILL.md` +
  `docs/templates/REPORT_TEMPLATES.md`): the 3–5 bullet brief must name: decision,
  alternatives rejected, constraints, out-of-scope, affected contracts. Missing
  fields ⇒ brief invalid, @architect required.

## Non-Goals
- No new scripts/enforcement automation (docs + template layer; script enforcement can
  follow once the format has settled).
- No changes to `CLAUDE.md` core rules (sprint 04 touches CLAUDE.md).
- No changes to META-DECISIONS' 5 meta-rules themselves.

## Files / Write Scope (ownership)
| Path / Glob | Writer | Notes |
|---|---|---|
| `skills/cost-efficiency/SKILL.md` | @builder-A | Routing Log + brief fields |
| `docs/templates/SPRINT_TEMPLATE.md` | @builder-A | Routing Log section |
| `docs/orchestrator/META-DECISIONS.md` | @builder-B | escalation tree |
| `docs/orchestrator/QUALITY-GATES.md` | @builder-B | adjudication procedure |
| `docs/templates/REPORT_TEMPLATES.md` | @builder-A | inline-brief variant |

## Risks
- Ceremony creep for small tasks → mitigation: Routing Log is one line per decision,
  sprint-00 implicit sprints log in the report header instead.
- Wording drift between skill and template → mitigation: single canonical definition in
  SPRINT_TEMPLATE.md, skill references it.

## Acceptance Criteria
- [ ] SPRINT_TEMPLATE.md contains `## Routing Log` with format spec; cost-efficiency skill mandates it and defines the gate-skip rule.
- [ ] META-DECISIONS.md contains the escalation decision tree with mandatory Tier-3 triggers.
- [ ] QUALITY-GATES.md defines the 3-step finding-conflict adjudication incl. "judge panels only on the conflict path, never for judgment questions".
- [ ] Inline-brief required fields specified in both cost-efficiency skill and REPORT_TEMPLATES.md.

## Test / Validation Strategy
@validator consistency review across the 5 touched files (no contradictions with
CLAUDE.md); @docs-dx readability pass; targeted grep that old "5 escalation cases"
phrasing is superseded.

## Changelog Note
Added: mandatory Routing Decision Log for gate-skips, escalation decision tree,
finding-conflict adjudication procedure (judge panels only on criteria-resolvable
conflicts), required fields for inline architecture briefs.

## Version Relevance
minor — new mandatory workflow mechanisms, backward-compatible.

## Preflight (checked at sprint start)
- [ ] Sprint 01 done (02 may run after; 03 needs no 02 outputs)
- [ ] `git status` clean except tracked sprint artifacts
- [ ] No other in-progress sprint owns overlapping files (04 shares META-DECISIONS ⇒ 04 waits)

## Result (filled at completion)
_pending_
