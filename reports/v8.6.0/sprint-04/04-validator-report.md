---
agent: validator
version: v8.6.0
date: 2026-07-06
status: complete
task: validate Sprint 04 (compensation playbook) against acceptance criteria — dynamic-workflows scoping/thresholds, judgment-class human gate, Fable-parity economics, integration queue
---

# Validator Report — Sprint 04 (Compensation Playbook)

## Review Scope

Uncommitted diff vs HEAD (repo: `cc--god_mode/ON`, branch `release/v8.6.0`):
`skills/dynamic-workflows/SKILL.md`, `docs/AGENT_MODEL_SELECTION.md`,
`docs/orchestrator/META-DECISIONS.md`, `docs/orchestrator/QUALITY-GATES.md`,
`CLAUDE.md`, `docs/orchestrator/VERSIONING.md`, plus
`reports/v8.6.0/sprint-04/` (builder reports) and the sprint file's own
`status` frontmatter edit.

## 1. Acceptance Criteria — one by one

### AC1 — dynamic-workflows skill: facts-vs-judgment + multiplier table + ~2x rule

**Facts-vs-judgment distinction with 2-column example table** — present, `### Verification Scoping — Facts Only, Not Judgment`:

> "Adversarial verification only works on **refutable** claims: a skeptic must be able to disprove the finding with a concrete counterexample... it is not true for design/architecture judgment calls, where 'refuting' the claim would require generating a better design"

2-column example table confirmed:
```
| Verify adversarially (facts) | Do NOT verify — escalate instead (judgment) |
|---|---|
| "This function is unused" (grep for call sites disproves/confirms it) | "This module split is suboptimal" (refuting it means designing the better split) |
```
(3 rows total, both columns populated with concrete paired examples.) PASS.

**Multiplier table** — present under `### Cost Thresholds — Lever Multiplier Table and the ~2× Rule`:

> `| Deterministic hooks/scripts | ~1.05× | ... |`
> `| Loop-until-dry enumeration | 3–10× | ... |`

All rows from the sprint scope are present: hooks ~1.05×, structured handoffs ~1.1×, dual gates ~1.2×, decomposition 1.3–2×, adversarial-facts 2–4×, judge panels 2–3× (conflict-path only), loop-until-dry 3–10×. Matches sprint scope note verbatim ("hooks ~1.05×, decomposition 1.3–2×, adversarial 2–4×, loop-until-dry 3–10×"). PASS.

**~2× rule incl. pre-launch multiplier statement obligation** — present:

> "**The ~2× rule:** Fable 5 costs roughly 2× Opus 4.8 per token ($10/$50 vs $5/$25 in/out per MTok)... when a task's *planned* compensation stack ... exceeds roughly a **2× total token multiplier**, a Fable-5 run would likely be both cheaper AND higher-ceiling..."

Pre-launch obligation with worked example:
> "Before launching a heavy workflow, state the projected multiplier in one line (Routing Log entry or workflow announcement), e.g.: `projected multiplier: decomposition (1.5x) x adversarial-facts (3x) ~= 4.5x -> exceeds 2x threshold, consider Fable-5 if available`"

PASS.

**Decomposition seam-check** — present under `### Decomposition Seam-Check`:

> "Before dispatching a multi-agent decomposition, the orchestrator writes **one line** naming the cross-cutting concern the split could hide, e.g.: `seams: auth flow crosses builder-A/builder-B file boundary`"

Includes seam-checker assignment guidance for non-trivial seams. PASS.

**AC1 verdict: PASS (all sub-criteria met).**

### AC2 — Judgment-Class Human Gate (META-DECISIONS + QUALITY-GATES + CLAUDE.md, no renumbering)

**4 triggers in QUALITY-GATES** — `## Judgment-Class Human Gate` → `### Mandatory triggers`:
1. "Architecture selection between two or more workable alternatives"
2. "Design-taste decisions a written criterion cannot resolve"
3. "Suspicion that the request itself is malformed"
4. "Any decision where the Finding-Conflict Adjudication procedure above hit Step 3"

All 4 present, matching sprint scope's list verbatim. PASS.

**Unanimity-does-not-waive rule** — QUALITY-GATES, `### Unanimity does not waive the gate`:

> "A unanimous agent PASS on any of the above does **not** satisfy this gate. Same-tier agents share the same training, the same blind spots, and often the same failure modes — unanimity among them is correlated, not independent, evidence (the correlated-miss floor...)"

PASS.

**Escalation-with-decision-brief (not a stall)** — QUALITY-GATES, `### Escalation is a handoff, not a block`:

> "This gate is a **MANDATORY escalation TO the human**, not a stall: the orchestrator packages a one-paragraph decision brief (options, trade-offs, recommendation) and hands it over... The orchestrator does not wait indefinitely or treat this as a gate failure."

PASS.

**META-DECISIONS tree lists the triggers as MANDATORY Tier-3** — confirmed added directly inside the `MANDATORY` block of the escalation decision tree ASCII diagram:
```
│  - architecture selection between two or more workable alternatives
│  - design-taste decisions no written criterion can resolve (API
│    ergonomics, public-surface naming, UX judgment)
│  - suspicion that the request itself is malformed (requirements
│    silently conflict, a "bug fix" is actually a design flaw)
│  - any decision where the Finding-Conflict Adjudication procedure
│    hit Step 3
```
Placed above the `OPTIONAL` block boundary — correctly scoped as MANDATORY, not OPTIONAL. PASS.

**Sprint-03 anchor line fully resolved** — grepped for the literal string `"sprint 04 extends"` in `docs/orchestrator/META-DECISIONS.md`: **no match** (grep exit code 1). The old placeholder line was replaced with:

> "Judgment-class triggers (four classes — architecture choice between valid alternatives, design taste with no written criterion, malformed-request suspicion, and Adjudication Step 3): authoritative definition is the **Judgment-Class Human Gate** in `docs/orchestrator/QUALITY-GATES.md`. A unanimous agent PASS does NOT waive this gate — see that section for the correlated-miss floor rationale."

PASS.

**CLAUDE.md: exactly one added sentence, in Quality Gates section, no core rule renumbered/reworded** — `git diff CLAUDE.md` shows exactly one added content line (plus one blank spacer line, standard markdown paragraph separation):
```
+Judgment-class decisions (architecture choice between valid alternatives, design taste, malformed-request suspicion) are mandatory human escalations — a unanimous agent PASS does not waive them (`docs/orchestrator/QUALITY-GATES.md`).
```
Inserted between "Full decision matrix: ..." and `## Ultracode Orchestrator` — inside the `## Quality Gates` section as required. No other line in the diff touches Core Rules 1–11 (verified — diff contains only this hunk). PASS.

**AC2 verdict: PASS (all sub-criteria met).**

### AC3 — AGENT_MODEL_SELECTION: Fable-parity economics, verified prices only

New `### Fable-parity economics` subsection present with:
> "**Verified pricing (per 1M tokens, in/out):** Fable 5 (Mythos-class) $10/$50; Opus 4.8 $5/$25. Fable 5 costs roughly **2× Opus 4.8 per token** — no other pricing figures in this document are estimates of Fable pricing; only these two are verified."

- 2× break-even argument present, cross-referencing the skill's multiplier table (no duplication — see §2 below).
- Honest-limits paragraph present: "**What compensation buys, and what it does not.**" — explicitly states judgment-class gaps are not closable by adding more same-tier agents.
- `best`-alias note present: "On orgs with Fable 5 access, the `best` alias already resolves to it automatically... This economics subsection... exist[s] for Opus-only environments where that auto-upgrade path is unavailable; nothing in this system depends on Fable access."

**AC3 verdict: PASS.**

### AC4 — VERSIONING.md integration queue

New `## Integration queue` section:
> "When multiple sprints reach integration simultaneously, they integrate in **ascending sprint number, exactly one integration at a time**... A `BLOCKED` integration does not let later-numbered sprints jump the queue: they wait for resolution, or the orchestrator re-sequences the plan and records the change in the plan file."

Covers ascending order, one-at-a-time, no-bypass-on-BLOCKED — all three sub-requirements from the sprint scope. PASS.

## 2. Cross-file consistency

- **Skill references QUALITY-GATES adjudication rather than duplicating steps**: confirmed — the skill's Verification Scoping section says "route it per the QUALITY-GATES adjudication procedure's Step 3 (`docs/orchestrator/QUALITY-GATES.md`)" instead of restating the procedure. PASS.
- **Multiplier table location**: canonical copy lives in `skills/dynamic-workflows/SKILL.md`; `docs/AGENT_MODEL_SELECTION.md` references it ("`skills/dynamic-workflows/SKILL.md` documents a lever multiplier table...") and repeats the multiplier values inline for readability but attributes the source — this is a reasonable summary-with-attribution pattern, not an uncredited duplicate. No numeric contradiction found between the two copies (both list hooks ~1.05×, decomposition 1.3–2×, adversarial-facts 2–4×, judge panels 2–3×, loop-until-dry 3–10× identically). PASS.
- **Judgment-gate wording consistency across QUALITY-GATES / META-DECISIONS / CLAUDE.md**: all three cite the same 4 trigger classes (architecture choice, design taste, malformed request, Adjudication Step 3) and the same unanimity-does-not-waive framing. QUALITY-GATES is explicitly established as authoritative ("authoritative definition is the **Judgment-Class Human Gate**" — META-DECISIONS; "(`docs/orchestrator/QUALITY-GATES.md`)" — CLAUDE.md). No contradiction found. PASS.
- **Nothing contradicts sprint-03's committed text**: sprint 03's Finding-Conflict Adjudication procedure (Step 3, Tier-3 escalation) and Escalation Decision Tree are extended, not rewritten — sprint 04 additions are additive bullets/subsections, confirmed by diff (no removed lines in the pre-existing Step 3 / adjudication text, only the placeholder anchor line was replaced as intended by the sprint scope itself).

**Cross-consistency verdict: PASS.**

## 3. Price-figure audit

`git diff -U0 docs/AGENT_MODEL_SELECTION.md skills/dynamic-workflows/SKILL.md` — all added `$`-figures: `$10`, `$25`, `$5`, `$50`. All four map onto the two verified pairs (Fable 5 $10/$50 in/out; Opus 4.8 $5/$25 in/out). No other/new price figures introduced in either changed doc. PASS.

## 4. Write scope

`git status --porcelain` shows exactly:
```
 M CLAUDE.md
 M docs/AGENT_MODEL_SELECTION.md
 M docs/orchestrator/META-DECISIONS.md
 M docs/orchestrator/QUALITY-GATES.md
 M docs/orchestrator/VERSIONING.md
 M plans/v8.6.0/sprint-04-compensation-playbook.md
 M skills/dynamic-workflows/SKILL.md
?? reports/v8.6.0/sprint-04/
```
This matches: the 6 sprint scope files + the plan file's own `status: planned` → `status: in-progress` frontmatter edit + the sprint-04 reports directory (2 builder reports, this validator report).

One untracked file outside sprint scope was observed: `conversation-tomevault-lizenz-beratung.md` (repo root, dated May 28 — predates this sprint by over a month). This is a **pre-existing stray artifact, not part of this sprint's diff or write scope**, and does not represent a foreign uncommitted change mixed into the reviewed change set (it is unrelated content, not touching any sprint-04 file). Flagged for hygiene, not a blocker — recommend the Orchestrator clean it up or confirm its origin outside this sprint's review.

**Write scope verdict: PASS** (no conflicting/foreign changes within the reviewed diff).

## 5. Hooks contract

`node scripts/test-hooks-contract.js` → **28/28 checks passed**, "All hook contract checks passed."

## Final Status

APPROVED — Ready for @scribe and sprint integration.

## Files Changed

None — review only (report file above is the only artifact written by this validation pass).
