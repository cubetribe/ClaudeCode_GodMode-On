---
agent: builder
version: v8.6.0
date: 2026-07-06
status: complete
task: Sprint 03 (builder-B) — escalation decision tree in META-DECISIONS.md + finding-conflict adjudication procedure in QUALITY-GATES.md
---

# Builder-B Report — Escalation Tree & Finding-Conflict Adjudication

## Context

Binding sprint file: `plans/v8.6.0/sprint-03-routing-audit.md`. Implements the
escalation/adjudication findings from
`reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md` §2.3–2.5
(judgment vs. checkable error classes, correlated-miss floor) and §3.2
(findings #4, #8, #9, #10 — items #10 and #8 are this builder's scope; #4 and
#9 belong to @builder-A).

Preflight: `git status` showed no uncommitted changes to either target file
before editing; no foreign work in scope. No conflict with @builder-A's scope
(`skills/cost-efficiency/SKILL.md`, `docs/templates/SPRINT_TEMPLATE.md`,
`docs/templates/REPORT_TEMPLATES.md`) — untouched.

## What Changed

### `docs/orchestrator/META-DECISIONS.md`

Replaced the loose "Three-tier error handling" diagram + separate 5-case list
with a single **Escalation Decision Tree** section:
- Tier 1 (agent self-resolution): retriable tool errors / self-locatable
  missing inputs, max 2 attempts, falls through to Tier 2 on second failure.
- Tier 2 (orchestrator): write-scope conflicts (`BLOCKED (conflict)`), gate
  failures with actionable findings (`BLOCKED (quality)` → rework loop), and
  mid-sprint routing re-classification when new risk signals appear.
- Tier 3 — explicit MANDATORY triggers (no orchestrator override): security-
  relevant findings, scope changes vs. approved plan, verdict conflicts not
  resolvable by written criteria (cross-references the new adjudication
  section), destructive/irreversible actions, release/publish steps.
- Tier 3 — explicit OPTIONAL triggers (orchestrator judgment, logged in the
  sprint's Routing Log): cost overruns, >2 rework loops, slowing-but-not-
  blocking ambiguity.
- Added a "Why the MANDATORY set exists" paragraph explaining the
  correlated-miss floor from the analysis (§2.5/§3.2): a unanimous same-tier
  PASS is confident correlated silence, not independent evidence, so
  judgment-class risk is pulled out of orchestrator discretion.
- Added the required anchor line: "Judgment-class triggers: see Quality Gates
  (added in v8.6 sprint 04)." — leaves no dangling promise; sprint 04 owns the
  detailed judgment-class trigger list.

Old "5-case list" prose is fully superseded (grep confirms no residual
"5 case"/"five case" phrasing remains in the file).

### `docs/orchestrator/QUALITY-GATES.md`

Added a new **Finding-Conflict Adjudication** section (before "Agent Return
Contract"), scoped explicitly to contradictory *findings* (not verdicts —
the existing Decision Matrix stays authoritative for plain
APPROVED/BLOCKED combinations):
- Step 1 — criteria check: if one side cites a written rule/spec/acceptance
  criterion and the other doesn't, criteria side wins; log one line, no
  panel needed.
- Step 2 — criteria-resolvable but contested (both sides cite conflicting
  criteria, or neither cites anything checkable but the conflict is
  fact-checkable): 2–3 diverse-lens judges (correctness / scope /
  reproducibility), convened only on this conflict path, vote against the
  written criteria; majority decides; log panel + verdict.
- Step 3 — not criteria-resolvable (taste, architecture preference, ambiguous
  requirement): mandatory Tier 3 human escalation; explicit rule that
  same-tier judge panels must NEVER majority-vote a judgment question
  (verifier collusion — panels reduce variance, not the underlying capability
  gap).
- Added a "Scope note" tying Steps 1–3 back to the META-DECISIONS tier
  ladder (Step 1/2 = Tier 2 orchestrator-managed, Step 3 = Tier 3 mandatory),
  so the two documents use one consistent escalation vocabulary.

## Consistency Check

- META-DECISIONS' Tier 3 "verdict conflict NOT resolvable by written criteria"
  trigger cross-references QUALITY-GATES' new adjudication section by path;
  QUALITY-GATES' Step 3 cross-references META-DECISIONS' Tier 3 by path — no
  circular ambiguity, both anchors resolve to concrete sections.
- Neither file touches or contradicts CLAUDE.md's Quality Gates summary
  (Core Rule 5, the APPROVED/BLOCKED verdict contract, the Decision Matrix
  pointer to `docs/orchestrator/QUALITY-GATES.md`) — this sprint refines
  below that summary, does not restate or override it.
- Did not touch `skills/cost-efficiency/SKILL.md`, `docs/templates/*`, or
  `CLAUDE.md` (out of write scope; @builder-A / sprint 04 own those).
- Did not add the detailed judgment-class trigger list — left the explicit
  anchor line per instruction; sprint 04 is the single writer for that
  addition to avoid duplicated/conflicting trigger lists.

## Files Changed

### Files Created

None — this sprint only modifies existing docs files plus this report.

### Files Modified

- `docs/orchestrator/META-DECISIONS.md` — replaced 3-tier/5-case escalation
  section with an explicit MANDATORY/OPTIONAL decision tree + rationale
  paragraph + anchor line for sprint 04.
- `docs/orchestrator/QUALITY-GATES.md` — added "Finding-Conflict Adjudication"
  section (3-step procedure + scope note), inserted before "Agent Return
  Contract".
- `reports/v8.6.0/sprint-03/03-builder-adjudication-report.md` — this report.

### Quality Gates

Docs-only change; no code/tests/typecheck applicable.
- [x] TypeScript / build: N/A (markdown-only change)
- [x] Tests: N/A (no executable code touched); manual self-check performed —
  grep for stale "5 case"/"five case" phrasing returned no matches, grep for
  cross-reference consistency confirmed Tier 3 / adjudication mentions align
  in both files
- [x] Lint: N/A (markdown-only change)

### Tests

No automated tests apply to a docs-only sprint. Verification performed
manually via grep (see Quality Gates above) and a manual read-through of both
files for cross-reference consistency and non-contradiction with CLAUDE.md.

## Ready for @validator

- [x] Escalation decision tree present with explicit MANDATORY vs OPTIONAL
      classification (acceptance criterion met)
- [x] Finding-conflict adjudication 3-step procedure present, incl. "judge
      panels only on the conflict path, never for judgment questions"
      (acceptance criterion met)
- [x] No contradiction with CLAUDE.md's Quality Gates summary
- [x] Write scope respected (only the two docs files + this report touched)

## Addendum — @docs-dx wording fixes (post-approval, applied in scope)

@docs-dx approved Sprint 03 and queued four wording fixes, all within my
existing write scope (META-DECISIONS.md / QUALITY-GATES.md). Applied as-is:

1. `docs/orchestrator/META-DECISIONS.md` — the sprint-04 anchor line no longer
   implies sprint 04 already landed. Now reads: "Judgment-class triggers: see
   the Finding-Conflict Adjudication procedure in
   docs/orchestrator/QUALITY-GATES.md (this sprint); sprint 04 extends this
   further into CLAUDE.md core rules."
2. `docs/orchestrator/META-DECISIONS.md` — made the correlated-miss-floor
   justification self-contained by inlining the mechanism ("same-tier agents
   share blind spots, so a unanimous same-tier PASS is not independent
   evidence") alongside the existing citation to
   `reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md` §2.5/§3.2.
3. `docs/orchestrator/QUALITY-GATES.md` — added a worked example after Step 3
   (validator's cited lint rule vs. builder's uncited dynamic-use claim →
   Step 1 resolves without a panel), showing the procedure end-to-end.
4. `docs/orchestrator/QUALITY-GATES.md` — added the bright-line "Trigger test"
   sentence distinguishing plain Decision-Matrix disagreement from
   adjudication-worthy contradictory factual claims; simplified the
   verifier-collusion sentence in Step 3 to the shorter "panel vote does not
   add independent evidence — it just re-runs the same judgment with extra
   steps" phrasing.

No scope change: only the two files already owned by this builder were
touched. No edits to `skills/cost-efficiency/`, `docs/templates/*`, or
`CLAUDE.md`.
