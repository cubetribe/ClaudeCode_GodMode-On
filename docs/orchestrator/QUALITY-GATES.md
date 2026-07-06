# CC_GodMode Quality Gates (Parallel Execution)

## Overview

After @builder completes, BOTH quality gates run simultaneously for faster validation.

```
@builder
    |
    +------------------+
    |                  |
    v                  v
@validator        @tester
(Code Quality)    (UX Quality)
    |                  |
    +--------+---------+
             |
        SYNC POINT
             |
    +--------+--------+
    |                 |
BOTH APPROVED     ANY BLOCKED
    |                 |
    v                 v
@scribe          @builder
              (fix & retry)
```

## Decision Matrix

| @validator | @tester | Action |
|------------|---------|--------|
| APPROVED | APPROVED | --> @scribe |
| APPROVED | BLOCKED | --> @builder (tester concerns) |
| BLOCKED | APPROVED | --> @builder (code concerns) |
| BLOCKED | BLOCKED | --> @builder (merged feedback) |

## Execution Pattern

Use parallel Task tool calls to run both agents simultaneously:
1. Launch @validator and @tester in parallel using Task tool
2. Wait for both to complete
3. Apply Decision Matrix above
4. If both blocked: merge feedback into single @builder instruction

## Gate 1: @validator (Code Quality)

- TypeScript compiles (`tsc --noEmit`)
- Unit tests pass
- No security issues
- All consumers updated (for API changes)

## Gate 2: @tester (UX Quality)

- E2E tests pass
- Screenshots at 3 viewports (mobile, tablet, desktop)
- A11y compliant (WCAG 2.1 AA)
- Performance OK (Core Web Vitals: LCP, CLS, INP, FCP)
- Console errors captured and reported

## Finding-Conflict Adjudication

The Decision Matrix above resolves plain **verdict** combinations
(APPROVED/BLOCKED). It does not, by itself, resolve contradictory **findings**
between gate agents or parallel subagents — e.g. @validator reports "unused
code" while a builder report claims "consumed by X", or @tester and @validator
disagree about whether a behavior is in scope. That is a separate, narrower
procedure and applies ONLY when two findings actually contradict each other,
not to ordinary APPROVED/BLOCKED disagreement (the matrix already covers that).

### Procedure

**Step 1 — Criteria check.** Does either side's finding cite a written rule,
spec, acceptance criterion, or sprint write-scope entry?
- YES, and only one side cites it → the criteria-backed side wins; the
  orchestrator logs one line (which finding, which rule, resolution) and
  proceeds. No panel, no escalation.
- YES, both sides cite conflicting criteria, or NO neither side cites
  anything checkable → go to Step 2.

**Step 2 — Criteria-resolvable but contested.** Convene a judge panel of 2–3
judges with DIVERSE prompts/lenses (e.g. one judge reviews for correctness,
one for scope/write-boundary compliance, one for reproducibility of the
claimed behavior) — invoked ONLY on this specific conflict, not as a general
review step. Judges vote strictly against the written criteria identified in
Step 1 (not against each other's opinions). Majority decides. Log the panel
composition and verdict in the sprint report.

**Step 3 — Not criteria-resolvable.** If the conflict is about taste,
architecture preference, or a genuinely ambiguous requirement with no
written criterion to check against → mandatory human escalation (Tier 3,
`docs/orchestrator/META-DECISIONS.md`). NEVER majority-vote a judgment
question: same-tier judge panels tend to share the same blind spots as the
agents being judged, so a panel vote does not add independent evidence — it
just re-runs the same judgment with extra steps.

**Example:** @validator: "unused import in utils.ts" (cites lint rule).
@builder: "consumed dynamically via require()" (no rule cited) → Step 1: only
validator cites a checkable rule → validator's finding wins; orchestrator logs
"utils.ts: lint rule X vs unverified dynamic-use claim → lint wins" → proceed.
No panel needed.

### Scope note

**Trigger test:** plain APPROVED/BLOCKED disagreement → Decision Matrix; if
either side's stated reason directly contradicts a factual claim in the
other's report (same file/behavior, incompatible claims) → this adjudication
procedure.

This procedure activates on contradictory **findings**, not on parallel
BLOCKED/APPROVED verdicts — those follow the Decision Matrix unchanged. It is
the same escalation ladder as Tier 2 → Tier 3 in META-DECISIONS.md: Step 1 is
orchestrator-level (Tier 2 equivalent), Step 2 is a scoped verification lever
(still orchestrator-managed, Tier 2), Step 3 is Tier 3 mandatory human
escalation — never satisfied by a vote.

## Judgment-Class Human Gate

Some decisions are not resolvable by adding more agents, more findings, or more
review passes — they require a human. This gate is a **MANDATORY escalation
TO the human**, not a stall: the orchestrator packages a one-paragraph
decision brief (options, trade-offs, recommendation) and hands it over.

The brief differs by trigger class: for triggers 1–2 (alternatives, taste):
options / trade-offs / recommendation. For triggers 3–4 (malformed request,
adjudication Step 3): state the specific conflict or unresolvable claim in
place of "options", plus a recommendation on how to proceed once clarified.

### Mandatory triggers

1. **Architecture selection between two or more workable alternatives** — the
   choice is not wrong/right, it is a trade-off (e.g. two valid module
   boundaries, two valid state-management approaches).
2. **Design-taste decisions a written criterion cannot resolve** — API
   ergonomics, naming of public surfaces, UX judgment calls with no style
   guide or acceptance criterion to check against.
3. **Suspicion that the request itself is malformed** — requirements silently
   conflict, or a "bug fix" turns out to be a design flaw in disguise.
4. **Any decision where the Finding-Conflict Adjudication procedure above hit
   Step 3** (not criteria-resolvable, taste/architecture/ambiguous
   requirement with no written criterion).

### Unanimity does not waive the gate

A unanimous agent PASS on any of the above does **not** satisfy this gate.
Same-tier agents share the same training, the same blind spots, and often the
same failure modes — unanimity among them is correlated, not independent,
evidence (the correlated-miss floor: see
`docs/orchestrator/META-DECISIONS.md` and
`reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md` §2.5).
Escalate regardless of how confident or aligned the agent verdicts are.

### Escalation is a handoff, not a block

The orchestrator does not wait indefinitely or treat this as a gate failure.
It surfaces the decision brief to the human and continues once a decision is
made — same posture as the other Tier 3 mandatory escalations in
`docs/orchestrator/META-DECISIONS.md`.

## Agent Return Contract

Every agent writes a **full report** to `reports/vX.Y.Z/sprint-NN/<NN>-<agent>-report.md` (validated by `scripts/validate-agent-output.js` — min-length rules check the file, not the return message). The agent's **return message to the Orchestrator** is the structured verdict only:

```
STATUS: APPROVED | BLOCKED | DONE
- finding 1 (one line max)
- finding 2
- finding 3
report: <absolute path to full report>
```

Rules:
- Maximum 3 bullet findings.
- Orchestrator reads the full report only on BLOCKED or when explicitly needed.
- Full report min-lengths are unchanged: architect 1000, api-guardian 800, builder 500, validator 400, tester 800, scribe 300, github-manager 200.
