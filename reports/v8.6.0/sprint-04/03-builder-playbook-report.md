---
agent: builder
version: v8.6.0
date: 2026-07-06
status: complete
task: Sprint 04 (compensation playbook) - builder-A scope, verification scoping + seam-check + cost thresholds in dynamic-workflows skill, Fable-parity economics in AGENT_MODEL_SELECTION
---

# Builder Report — Sprint 04 Scoped Compensation Playbook (builder-A)

## Context

Binding sprint file: `plans/v8.6.0/sprint-04-compensation-playbook.md`. Essential
context: `reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md` §2
("Fable 5 Light" — orchestration compensates reliability, not capability).
Write scope for builder-A: `skills/dynamic-workflows/SKILL.md`,
`docs/AGENT_MODEL_SELECTION.md`, and this report. A parallel builder
(@builder-B) owns META-DECISIONS/QUALITY-GATES/CLAUDE.md/VERSIONING — not
touched here.

Preflight: `git status --porcelain` on all six sprint-04 write-scope files
showed no uncommitted/foreign changes before my first write; both my files
were last touched at the same base commit — no conflict. Read the sprint-03
QUALITY-GATES adjudication section (Finding-Conflict Adjudication, Steps 1-3,
already committed) before writing, and reference (not redefine) its Step 3
human-escalation language in both files I touched.

## Files Created

None (both target files pre-existed; report is new).

## Files Modified

- `skills/dynamic-workflows/SKILL.md`
  - Added `### Verification Scoping — Facts Only, Not Judgment` after the
    Adversarial Verification Pattern section: 2-column table (verify
    adversarially vs. do-not-verify-escalate-instead) with 3 examples each
    (unused function / consumer breakage / test coverage gap vs. module-split
    suboptimality / API ergonomics / "right architecture" claims); explains
    why same-tier skeptic panels produce confident consensus error on
    judgment questions; routes judgment findings to QUALITY-GATES Step 3.
  - Added `### Decomposition Seam-Check` in the same block: one-line
    orchestrator seam statement before dispatch (worked example: "seams: auth
    flow crosses builder-A/builder-B file boundary"), plus the seam-checker
    agent assignment rule for non-trivial seams (reads ACROSS completed units'
    outputs, does not re-review any single unit).
  - Added `### Cost Thresholds — Lever Multiplier Table and the ~2× Rule` in
    the Cost Tradeoff section: full 7-row lever multiplier table (hooks
    ~1.05×, structured handoffs ~1.1×, dual gates ~1.2×, decomposition +
    externalized state 1.3–2×, adversarial verification of facts 2–4×, judge
    panels 2–3× on conflict path only, loop-until-dry 3–10×); the ~2× rule
    with verified pricing ($10/$50 Fable 5 vs $5/$25 Opus 4.8); a worked
    "projected multiplier" log-line example; the `best`-alias auto-upgrade
    caveat for orgs with Fable access.

- `docs/AGENT_MODEL_SELECTION.md`
  - Added `### Fable-parity economics` subsection immediately after the
    existing "Ultracode Orchestrator Economics" section: verified pricing
    (Fable 5 $10/$50, Opus 4.8 $5/$25, no other numbers invented), the 2×
    break-even logic referencing the skill's lever table by name, an honest
    paragraph on what compensation buys (reliability parity on routine,
    checkable work via tier-insensitive rule application and counterexample
    verification) versus what it cannot buy (decomposition quality against
    unexplored alternatives, design taste, correlated same-tier verifier
    misses) with the explicit "Fable 5 Light" framing tied back to the
    verification-scoping split and the human gate in META-DECISIONS /
    QUALITY-GATES Step 3, and the `best`-alias note (auto-upgrade where
    Fable access exists; nothing in the system depends on it).

## Consistency Check

Read `docs/orchestrator/QUALITY-GATES.md`'s Finding-Conflict Adjudication
section (Steps 1-3, committed by sprint 03) before writing. Both edits
reference Step 3 ("not criteria-resolvable → mandatory human escalation,
never majority-vote a judgment question") verbatim in spirit without
redefining or renumbering it. No contradiction introduced: the skill's
"do-not-verify-escalate-instead" column and the economics doc's judgment-class
paragraph both point at the same QUALITY-GATES Step 3 / META-DECISIONS Tier 3
mechanism that builder-B is wiring in parallel, rather than inventing a
second escalation path.

## Quality Gates

- [x] Markdown structure valid (headers, tables render correctly) — spot
      checked via grep for `2×` / `~2x` occurrences across both files;
      consistent terminology and figures in both.
- [x] No invented pricing figures — only the two verified numbers ($10/$50
      Fable 5, $5/$25 Opus 4.8) used anywhere; all other multipliers are the
      lever-cost multipliers already given in the sprint brief / analysis
      digest, not prices.
- [x] Write scope respected — only the two assigned files plus this report
      were touched; `git status` confirms no other file in the working tree
      was modified by this agent (CLAUDE.md's concurrent change belongs to
      @builder-B, observed but not edited).
- [x] No core-rule renumbering, no VERSION/CHANGELOG/plans/** writes (out of
      scope per Sprint Contract and non-goals).

## Tests

N/A — documentation/skill-file change, no executable code. Validation is
textual/structural: acceptance criteria below checked by direct re-read of
both files.

## Acceptance Criteria (from sprint file)

- [x] dynamic-workflows skill distinguishes refutable findings from judgment
      questions with examples, contains the multiplier table and the ~2× rule.
- [x] AGENT_MODEL_SELECTION has the Fable-parity economics subsection with
      verified prices.
- [ ] Judgment-class human gate in META-DECISIONS/QUALITY-GATES/CLAUDE.md —
      out of builder-A scope (@builder-B).
- [ ] VERSIONING.md integration queue — out of builder-A scope (@builder-B).

## Files Changed

- `skills/dynamic-workflows/SKILL.md` (modified)
- `docs/AGENT_MODEL_SELECTION.md` (modified)
- `reports/v8.6.0/sprint-04/03-builder-playbook-report.md` (created)

## Addendum — @docs-dx Wording Fixes (post-gate-approval)

Gates approved Sprint 04; @docs-dx queued three wording fixes in builder-A's
files. Scope unchanged (same two files, no new write-scope grant needed).
Applied all three:

1. `skills/dynamic-workflows/SKILL.md` — added the generalized litmus-test
   sentence directly under the facts-vs-judgment table: "if refuting the
   claim requires only checking, running, or grepping something that already
   exists (fact), it verifies adversarially; if refuting it requires
   producing a *better alternative* that doesn't yet exist (judgment), it
   escalates." Gives the table a one-line generalization instead of relying
   on the reader to infer the rule from six examples.

2. `skills/dynamic-workflows/SKILL.md` — on first mention of "Routing Log" in
   the ~2×-rule passage, added the canonical pointer: "(defined in
   `docs/templates/SPRINT_TEMPLATE.md` § Routing Log; per-turn announcement
   if no sprint file exists)". Verified the target section exists
   (`grep -n "Routing Log" docs/templates/SPRINT_TEMPLATE.md` → line 50)
   before citing it.

3. `docs/AGENT_MODEL_SELECTION.md` — appended "(this is the correlated-miss
   floor — see `docs/orchestrator/META-DECISIONS.md`)" where the
   unearned-consensus idea is stated in the honest-limits paragraph, making
   the concept searchable by the term used elsewhere in the compensation
   playbook (sprint-00 digest §2.5 item 4, and builder-B's META-DECISIONS
   work).

No new files touched, no scope change, no conflicts encountered on re-apply
(files re-read fresh before editing per tool requirements).
