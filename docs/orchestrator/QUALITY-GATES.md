# CC_GodMode Quality Gates

## Overview

"Checks" after @builder means (Core Rule 5):

1. **Deterministic checks — always.** Typecheck, lint, tests, build, run by hook. A compiler result is a fact, not a second opinion, and it costs no context when it passes.
2. **UX gate — when the sprint declared `ux_gate: auto`.** @tester.
3. **Security gate — on security surfaces.** @security (auth code, secrets handling, `.github/workflows/`).
4. **Review pass — on risk or doubt.** Pull the `/code-review` skill. No standing agent re-reads the same diff.

Whichever of 2–4 apply run in PARALLEL, after the deterministic hook:

```
@builder
    |
    v
[hook: typecheck / lint / test / build]  (always; 0 bytes context on success)
    |
    +---------------+---------------+
    |               |               |
    v               v               v
@tester         @security      /code-review
(ux_gate:auto)  (security      (risk or
                 surface)       doubt)
    |               |               |
    +-------+-------+-------+-------+
             |
        SYNC POINT
             |
    +--------+--------+
    |                 |
ALL APPROVED      ANY BLOCKED
(among gates      (among gates
 that ran)         that ran)
    |                 |
    v                 v
@scribe          @builder
              (fix & retry)
```

## Decision Matrix

Applies only to the gates the sprint actually ran (2–4 above); a gate that
did not run is not counted against the sprint.

| @tester | @security | /code-review | Action |
|---------|-----------|--------------|--------|
| APPROVED or n/a | APPROVED or n/a | APPROVED or n/a | --> @scribe |
| BLOCKED | any | any | --> @builder (tester concerns) |
| any | BLOCKED | any | --> @builder (security concerns) |
| any | any | BLOCKED | --> @builder (review concerns) |

## Execution Pattern

1. The hook runs deterministic checks after every @builder pass. A passing
   run costs ~0 bytes of context; a failing run reports what failed.
2. Launch whichever of @tester / @security / `/code-review` apply, in
   parallel, using the Task tool.
3. Wait for all of them to complete.
4. Apply the Decision Matrix above.
5. If more than one is BLOCKED: merge feedback into a single @builder
   instruction.

## Gate: @tester (UX Quality — when `ux_gate: auto`)

- E2E tests pass
- Screenshots at 3 viewports (375×667 / 768×1024 / 1920×1080)
- A11y compliant (WCAG 2.1 AA)
- Performance OK (Core Web Vitals: LCP, CLS, INP, FCP)
- Console errors captured and reported
- If `ux_gate: human` or `skip`, this gate does not run for the sprint (Core Rule 6)

## Gate: @security (Security Quality — on security surfaces)

- Auth code, secrets/credentials handling, `.github/workflows/`, crypto,
  file/path access, external integrations
- BLOCKED routes back to @builder, same as the other gates

## Gate: /code-review (Judgment Pass — on risk or doubt)

- Pulled ad hoc via the native `/code-review` skill, not a standing agent
- Used when risk or doubt warrants a second read of the diff — the part of
  the old @validator role a hook cannot replace

## Finding-Conflict Adjudication

The Decision Matrix above resolves plain **verdict** combinations
(APPROVED/BLOCKED). It does not, by itself, resolve contradictory **findings**
between gate agents or parallel subagents — e.g. a `/code-review` pass reports
"unused code" while a builder report claims "consumed by X", or @tester and
`/code-review` disagree about whether a behavior is in scope. That is a separate, narrower
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

**Example:** hook/lint: "unused import in utils.ts" (cites lint rule).
@builder: "consumed dynamically via require()" (no rule cited) → Step 1: only
the lint result cites a checkable rule → the lint finding wins; orchestrator
logs "utils.ts: lint rule X vs unverified dynamic-use claim → lint wins" →
proceed. No panel needed.

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

Agents holding `Write` (@architect, @builder, @researcher, @scribe) write a **full report** to `reports/vX.Y.Z/sprint-NN/<NN>-<agent>-report.md` (validated by `scripts/validate-agent-output.js` — min-length rules check the file, not the return message). Read-only agents (@api-guardian, @tester, @security, department agents) have no `Write` tool and cannot produce that file themselves — they return their verdict only, and whoever dispatched them persists it as the report (Core Rule 8).

Every agent's **return message to the Orchestrator** is the structured verdict only:

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
- Full report min-lengths (agents holding Write): architect 1000, builder 500, researcher 500, scribe 300.
