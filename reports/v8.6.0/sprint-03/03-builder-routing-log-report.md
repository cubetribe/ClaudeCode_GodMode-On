---
agent: builder
version: v8.6.0
date: 2026-07-06
status: complete
task: Sprint 03 (builder-A) — Routing Decision Log + inline architecture brief required fields
---

# Implementation Report: Routing Audit — Decision Log & Inline Brief Fields

## Context

Binding sprint file: `plans/v8.6.0/sprint-03-routing-audit.md`. Implements findings #4
("Routing-decision audit log unlogged") and #9 ("Inline architecture brief has no
required-field validation") from
`reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md` §3.2.

Write scope for this task (builder-A): `skills/cost-efficiency/SKILL.md`,
`docs/templates/SPRINT_TEMPLATE.md`, `docs/templates/REPORT_TEMPLATES.md`, plus this
report. A parallel builder (builder-B) owns `docs/orchestrator/META-DECISIONS.md` and
`QUALITY-GATES.md` — not touched here.

**Preflight:** `git status`/`git diff` on the three assigned files showed no
uncommitted foreign changes and no prior diff — clean start, no conflict.

## IMPLEMENTATION COMPLETE

### Files Modified

- `docs/templates/SPRINT_TEMPLATE.md` — added a new `## Routing Log` section
  (canonical definition) directly after `## Test / Validation Strategy` and before
  `## Changelog Note`, per the sprint file's placement instruction. Contains the
  one-line-per-decision format (`date | path | signals | skipped`) and the three
  rules: log before dispatch, skip-without-log = contract violation
  (`BLOCKED (quality)`), implicit sprints log in the report header instead.

- `skills/cost-efficiency/SKILL.md` — two additions:
  1. New `## Routing Log (Mandatory)` section (placed before `## Research Budget`,
     matching the skill's flat H2 structure/voice) that mandates the log for every
     Smart Routing decision and skip, references SPRINT_TEMPLATE.md as the canonical
     format definition, states the implicit-sprint fallback, and gives the one-short-
     paragraph rationale requested (routing errors bypass all gates invisibly; the log
     makes minimal-path decisions post-hoc auditable and re-examinable). Ends with the
     explicit contract-violation / `BLOCKED (quality)` consequence.
  2. Upgraded `## Architecture Gate (Split)` with a new `### Inline Architecture
     Brief — Required Fields` subsection listing the five mandatory fields (decision,
     rejected alternative, constraints, out-of-scope, affected contracts/APIs) that
     the existing 3–5 bullets must cover — explicitly stated as refining, not
     expanding, the bullet count. Missing any field ⇒ brief invalid ⇒ escalate to
     @architect. Cross-references `REPORT_TEMPLATES.md` for the exact variant.

- `docs/templates/REPORT_TEMPLATES.md` — added new `## 1a. Inline Architecture Brief
  (Orchestrator-written variant)` section directly after the full `## 1. @architect
  Report Template` and before `## 2. @api-guardian Report Template`. Matches the
  existing per-agent template format (Purpose / Validation Rules / Template code
  block). Frontmatter uses `agent: orchestrator-inline` as specified. Template body
  uses the five required-field labels as mandatory bullets, plus a Routing Log line
  for implicit (sprint-00) work, explicitly marked optional/omit-if-sprint-file-has-it
  to avoid duplication. Explicitly states this is a distinct, narrower artifact and
  does not replace or weaken the full @architect template.

### Consistency Check (grep, post-change)

- `3–5 bullet` / `3-5 bullet` phrasing: 5 occurrences across
  `skills/cost-efficiency/SKILL.md` (x3), `CLAUDE.md` (untouched, Core Rule 3, matches
  sprint constraint), `docs/orchestrator/WORKFLOWS.md`, `docs/templates/REPORT_TEMPLATES.md`
  — all consistent; none contradict the new required-field spec (fields are what the
  existing bullets must cover, bullet count unchanged).
- No "no structure" / "unstructured" phrasing found anywhere in the touched templates
  or skill — nothing to supersede.
- `Routing Log` references: SPRINT_TEMPLATE.md (canonical section), SKILL.md (3 refs,
  all pointing back to the canonical section), REPORT_TEMPLATES.md (implicit-sprint
  fallback line) — single source of truth maintained, no duplicated/diverging format
  strings.

### Quality Gates

This sprint's write scope is documentation/template Markdown only (no code, per
sprint Non-Goals: "no new scripts/enforcement automation").

- [x] No TypeScript/JS in scope — `typecheck`/`lint`/`test` not applicable.
- [x] Targeted grep verification (above) — no contradictions found.
- [x] `git diff --stat` on the three files shows only additive changes (92 insertions,
      0 deletions) — no unrelated edits, no touch to `CLAUDE.md`, `VERSION`,
      `CHANGELOG.md`, or `docs/orchestrator/META-DECISIONS.md`/`QUALITY-GATES.md`
      (builder-B's scope).

## READY FOR VALIDATION

- [x] All three assigned files updated
- [x] Canonical single-source-of-truth for Routing Log format preserved
      (SPRINT_TEMPLATE.md is canonical; skill and report template reference it)
- [x] Inline brief required fields specified in both `skills/cost-efficiency/SKILL.md`
      and `docs/templates/REPORT_TEMPLATES.md`, consistent with each other
- [x] Full @architect template left unmodified/unweakened

## HANDOFF TO @validator

Ready for consistency review across the 5 touched files (this task's 3 + builder-B's
2) per the sprint's Test / Validation Strategy — check no contradictions with
CLAUDE.md, and confirm the "old escalation cases" grep target (builder-B's file) is
out of this report's scope.

## Addendum — @docs-dx wording fixes (post-approval, same task, scope unchanged)

@docs-dx approved Sprint 03 but queued three wording fixes, all within the original
write scope (no new files, no scope change):

1. **`docs/templates/SPRINT_TEMPLATE.md`** — added a filled-in `Example:` block directly
   under the Routing Log format string, showing both a smart-routing skip line and a
   full-gates no-skip line, so the abstract format has a concrete reference instance.

2. **`skills/cost-efficiency/SKILL.md`** — removed the duplicated format-string code
   block from the `## Routing Log (Mandatory)` section and replaced it with a pointer:
   "See `docs/templates/SPRINT_TEMPLATE.md` § Routing Log for the exact format string
   and example — that section is the single canonical definition; this skill does not
   duplicate it." The obligation text (log before dispatch, implicit-sprint fallback)
   and the rationale paragraph are unchanged. This closes the anti-drift mitigation the
   sprint file itself calls for ("single canonical definition in SPRINT_TEMPLATE.md,
   skill references it") — previously the skill had a byte-for-byte copy of the format
   string, which is exactly the drift risk the sprint's own Risks section flagged.

3. **`docs/templates/REPORT_TEMPLATES.md`** — replaced the ambiguous HTML comment above
   the inline-brief's Routing Log line with the unambiguous keep/omit rule: "Implicit
   sprint-00 (no sprint file) → KEEP this Routing Log line here. Planned sprint (sprint
   file exists) → OMIT this line; it lives in the sprint file's own `## Routing Log`
   section instead."

**Duplication check (post-fix):** grepped all three touched files for the literal
format string `path: smart-routing|full-gates` — it now appears exactly once, in
`docs/templates/SPRINT_TEMPLATE.md` (canonical). `SKILL.md` carries no format string,
only the pointer. `REPORT_TEMPLATES.md`'s inline-brief block carries a filled example
line (illustrating where the log goes for implicit sprints), not a re-definition of the
format — no duplication of the canonical string.

### Files Modified (addendum)
- `docs/templates/SPRINT_TEMPLATE.md` — added Example block under Routing Log format.
- `skills/cost-efficiency/SKILL.md` — replaced duplicated format-string block with a pointer to the canonical section; obligation/rationale text kept.
- `docs/templates/REPORT_TEMPLATES.md` — replaced ambiguous HTML comment with explicit keep/omit rule for the Routing Log line.
