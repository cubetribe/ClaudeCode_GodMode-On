---
agent: builder-6 (templates)
date: 2026-07-28
sprint: v8.7.0/sprint-02
task: Gate-Umbau — SPRINT_TEMPLATE.md ux_gate field, REPORT_TEMPLATES.md coherence fixes
status: complete
---

# Implementation Report: Sprint 02 Templates (@builder-6)

## IMPLEMENTATION COMPLETE

### Files Created

None — this sprint only modified existing template files within the assigned write scope.

### Files Modified

- `docs/templates/SPRINT_TEMPLATE.md`
  - Added `ux_gate: auto | human | skip` to sprint frontmatter (default `human`).
  - Added `## UX Gate` section documenting the once-at-planning decision, the "only asked when
    write scope touches UI" rule, the `human` default, and the `auto`→`human` playwright fallback.
  - Extended `## Routing Log` to carry Core Rule 7 weight: log line now includes a `ux_gate` field
    (with fallback annotation), three worked examples (`skip`, `human`, `auto→human` fallback),
    and an explicit rule that the `ux_gate` value/fallback must be logged before dispatch.

- `docs/templates/REPORT_TEMPLATES.md`
  - Removed the @validator template (H4) entirely; retired prefix `04` reassigned to `tester`
    with a historical note. Removed all `@validator` mentions describing it as a running gate
    (`STATUS: APPROVED` gate-agent list, builder handoff line, tester's old sync-point).
  - Rewrote the @scribe template (H5, renumbered from H6): removed `Previous/New Version`,
    `VERSION file updated`, and the dated `### [NEW_VERSION] - [DATE]` changelog heading —
    all forbidden inside a normal sprint per `docs/orchestrator/VERSIONING.md`. Replaced with an
    `## Unreleased Entry` section (undated `[Unreleased]` bullet only) and an explicit note that
    VERSION/dated headings are release-sprint-only.
  - Rewrote the @tester template (now H4) to exactly match the target validation set: sections
    `Screenshots Created`, `Console Errors`, `Performance Metrics`, `Accessibility`, `Decision`;
    patterns for screenshot path, image file, console-errors statement, `(LCP|CLS|INP|FCP)`,
    `(APPROVED|BLOCKED)`. Added a precondition note: template applies only when the sprint has
    `ux_gate: auto`.
  - Removed the minimum-length table/thresholds everywhere (verdict-rules summary, every
    per-agent "Minimum length: N characters" line, the "Statistics: ... (min: N)" example).
    Replaced with "Length calibration" guidance: cover the content, don't pad with filler
    sections, redundant summaries, or boilerplate — matches the v8.6.0 Goodhart-trap finding.
  - Fixed agent count: "8 CC_GodMode agents" → "14 CC_GodMode agents (7 core + 1 security gate +
    6 department)" in the Overview section and the verdict-shape line ("ALL 15" → "ALL 14").
  - Fixed the stale example path `reports/v5.7.0/00-architect-plan.md` →
    `reports/v8.7.0/sprint-02/01-architect-report.md` (prefix 01 = architect, 00 = researcher).
  - Confirmed the canonical report-path form (`reports/vX.Y.Z/sprint-NN/<prefix>-<agent>-report.md`)
    is the only form used throughout the document.
  - Left the verdict contract (`APPROVED | BLOCKED | DONE`, `BLOCKED (scope|conflict|quality)`)
    unchanged in shape; only removed `@validator` from the gate-agent list inside it.
  - Added Core Rule 8 (Defekt D1) resolution: a new "Report authorship is gated by tool access"
    rule under Canonical Report Paths — only `Write`-holders (@architect, @builder, @researcher,
    @scribe, per actual `tools:` frontmatter in `agents/*.md`) write the on-disk report
    themselves; every other agent (api-guardian, tester, security, github-manager,
    ci-security-guardian, and the four read-only department agents) returns a verdict only, and
    the dispatcher persists it as the report using the relevant template for shape. Cross-noted
    in the api-guardian, tester, and github-manager template Purpose lines and in Sprint Contract
    point 2.
  - Renumbered template headers 1/1a/2/3/4/5/6 (dropped the H4 validator gap) and updated internal
    handoff text in @builder's template (`HANDOFF TO @validator + @tester` → hook + conditional
    @tester).
  - Updated "Last Updated" header and appended a Version History entry summarizing this sprint's
    changes.

### Tests Added

None — this is a documentation/template-only sprint (no code paths). Verification is by
targeted `grep` sweep and full-file read-through, listed under Quality Gates below.

### Quality Gates

This sprint's write scope is Markdown templates only (no code, no scripts) — `npm run
typecheck`/`npm test`/`npm run lint` do not apply to this file set. Verification performed
instead:

### Coherence Sweep
```bash
grep -rn "@validator" docs/templates/REPORT_TEMPLATES.md docs/templates/SPRINT_TEMPLATE.md
```
- [x] Only 2 hits remain, both historical/changelog prose describing the removal (Last-Updated
  line, Version History entry) — none describe @validator as a live gate.

### Stale Reference Sweep
```bash
grep -n "8 CC_GodMode agents\|ALL 15 agents\|minLength\|Minimum length" docs/templates/REPORT_TEMPLATES.md
```
- [x] No stale agent-count strings or minimum-length thresholds remain.

### Manual Review
- [x] Full-file read-through of both documents for template renumbering and internal
  cross-references (handoffs, sync points, canonical path examples).

## Conflict Check

`git status`/`git diff` on assigned scope before first write: `REPORT_TEMPLATES.md` had 3 lines
already modified (agent count 8→15, minLength 400→800, FID→INP) by a prior/parallel pass — these
values were superseded by this sprint's own edits (15→14, minLength table removed entirely, FID
was already gone). No foreign scope conflict; `SPRINT_TEMPLATE.md` was untouched at start.

## Ready for @scribe / Integration

- [x] `ux_gate` documented in sprint template with default, trigger condition, and fallback rule
- [x] Routing Log carries `ux_gate` + skip justification per Core Rule 7
- [x] @validator template removed, no residual "running gate" references
- [x] @scribe template stripped of VERSION/dated-heading fields
- [x] @tester template matches target sections/patterns, gated on `ux_gate: auto`
- [x] Minimum-length thresholds replaced by length-calibration guidance
- [x] Agent count corrected to 14; canonical example path fixed
- [x] Report-path form is singular/canonical throughout; report-authorship rule documented
