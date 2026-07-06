---
sprint: 04
slug: compensation-playbook
plan: plans/v8.6.0/PLAN.md
status: done
execution: parallel
owner: orchestrator
---

# Sprint 04 — Scoped Compensation Playbook

## Goal
Scope the compensation levers to where they demonstrably work (facts, enumeration,
rule application) and mark where they don't: judgment-class decisions get a mandatory
human gate, and dynamic workflows get explicit cost thresholds. This encodes the
central analysis finding — orchestration compensates reliability, not capability —
into the system's operating rules ("Fable 5 Light").

## Scope
- **`skills/dynamic-workflows/SKILL.md`**: (a) verification scoping — adversarial
  verification applies to FACTUAL/refutable findings only (unused code, breaking
  consumer, missing test); design/architecture judgments are excluded (verifier
  collusion: same-tier judges share the blind spot); (b) decomposition self-check —
  before dispatch, the orchestrator states in one line what cross-cutting concern the
  split could hide, and assigns a seam-checker where non-trivial; (c) cost thresholds —
  document lever multipliers (hooks ~1.05×, decomposition 1.3–2×, adversarial 2–4×,
  loop-until-dry 3–10×) and the ~2× rule: past a ~2× total token multiplier a Fable-5
  run would be cheaper AND better — log projected multiplier before launching heavy
  workflows.
- **Human-review gate for the judgment class** (`docs/orchestrator/META-DECISIONS.md`
  + `docs/orchestrator/QUALITY-GATES.md` + `CLAUDE.md` Quality Gates section, one
  sentence): architecture selection between valid alternatives, ambiguous design
  taste, and "the request itself seems malformed" are mandatory Tier-3 human
  escalations — a unanimous agent PASS does not override this (correlated-miss floor).
  Additive; core rules NOT renumbered (PLAN.md D2).
- **`docs/AGENT_MODEL_SELECTION.md`**: new "Fable-parity economics" subsection —
  Fable 5 $10/$50 vs Opus 4.8 $5/$25, the 2× break-even against compensation
  multipliers, `best`-alias auto-upgrade note (parity work is for orgs without Fable
  access; nothing depends on Fable).
- **Hot-file integration queue** (`docs/orchestrator/VERSIONING.md`): when multiple
  sprints reach integration simultaneously, integrate in ascending sprint number; one
  integration at a time; a blocked integration never bypasses the queue.

## Non-Goals
- No changes to agent frontmatter/models.
- No renumbering or rewording of existing CLAUDE.md core rules.
- No new scripts.

## Files / Write Scope (ownership)
| Path / Glob | Writer | Notes |
|---|---|---|
| `skills/dynamic-workflows/SKILL.md` | @builder-A | scoping, self-check, thresholds |
| `docs/AGENT_MODEL_SELECTION.md` | @builder-A | Fable-parity economics |
| `docs/orchestrator/META-DECISIONS.md` | @builder-B | human-gate triggers (after sprint 03's tree) |
| `docs/orchestrator/QUALITY-GATES.md` | @builder-B | human-gate in gate matrix |
| `CLAUDE.md` | @builder-B | one additive sentence, Quality Gates section |
| `docs/orchestrator/VERSIONING.md` | @builder-B | integration queue rule |

## Risks
- Contradicting sprint 03's fresh text in META-DECISIONS/QUALITY-GATES → mitigation:
  sprint runs strictly after 03; builder receives 03's diff as context.
- CLAUDE.md is the orchestrator law → mitigation: single additive sentence, @validator
  checks no rule semantics changed.

## Acceptance Criteria
- [ ] dynamic-workflows skill distinguishes refutable findings from judgment questions with examples, contains the multiplier table and the ~2× rule.
- [ ] Judgment-class human gate present in META-DECISIONS (mandatory Tier-3 triggers), QUALITY-GATES, and one sentence in CLAUDE.md; no core rule renumbered.
- [ ] AGENT_MODEL_SELECTION has the Fable-parity economics subsection with verified prices.
- [ ] VERSIONING.md documents the integration queue.

## Test / Validation Strategy
@validator cross-file consistency review (esp. against sprint 03 text); @docs-dx pass;
grep for contradictions ("judge panel" guidance must match QUALITY-GATES).

## Changelog Note
Added: scoped compensation playbook — facts-only adversarial verification,
decomposition seam-check, cost multiplier thresholds (~2× Fable break-even), mandatory
human gate for judgment-class decisions, hot-file integration queue.

## Version Relevance
minor — new operating guidance, backward-compatible.

## Preflight (checked at sprint start)
- [ ] Sprint 03 status = done (shared META-DECISIONS/QUALITY-GATES)
- [ ] `git status` clean except tracked sprint artifacts

## Result (filled at completion)
Done 2026-07-06. Gates: @validator APPROVED (all criteria with quoted evidence,
CLAUDE.md diff = exactly one additive sentence, price audit clean, hooks suite green),
@docs-dx APPROVED with queued wording fixes — all applied post-gate (litmus test under
the facts-vs-judgment table, Routing Log canonical pointer, correlated-miss-floor term
made searchable in AGENT_MODEL_SELECTION, trigger-class-differentiated decision brief,
VERSIONING.md sprint-04 note; header confirmed NOT a sync-version touchpoint, left for
release law).

The analysis' central honesty constraint is now codified: compensation levers scoped
to where they work, judgment class human-gated, ~2× cost break-even documented.
