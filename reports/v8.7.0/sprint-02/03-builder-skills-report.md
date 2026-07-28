---
agent: builder-3 (skills)
date: 2026-07-28
sprint: plans/v8.7.0/sprint-02-gate-restructure.md
task: Bring skills/{quality-gates,workflows,cost-efficiency,prototype-mode,departments,meta-decisions,issue-processing,agent-teams}/SKILL.md (repo + global mirror) into agreement with the new Core Rules 5–8 gate model (@validator dissolved into deterministic hook + optional @tester/@security/`/code-review`).
---

# Builder Report — Sprint 02 (Skills)

## Summary

Rewrote the gate-execution model across all 8 assigned skill files to match the
canonical wording now in `CLAUDE.md` (Core Rules 5–8), then mirrored every change
to the global `~/.claude/skills/` copy. No agent, script, doc, or plan file outside
the assigned write scope was touched.

## Files Changed (repo + global, each pair kept character-identical apart from
`license:` frontmatter and the footer line)

- `skills/quality-gates/SKILL.md` / `~/.claude/skills/quality-gates/SKILL.md` —
  full rewrite. Dual-gate ("@validator ∥ @tester") model replaced with the
  Core Rule 5 model: deterministic hook (always) → @tester (if `ux_gate: auto`) →
  @security (security surfaces) → `/code-review` (risk/doubt), all parallel where
  applicable. Removed the unbelieved benchmark table ("Sequential 8–12 min /
  Parallel 5–7 min / 40% faster") ersatzlos per instruction (DECISIONS.md: sourced
  from a stub-agent simulation). Changed "Maximum 3 retry cycles" to reference
  META-DECISIONS.md's Tier 1 self-resolution (max 2 attempts) instead of a
  standalone number (resolves H17). Kept the judgment-class/correlated-evidence
  point present in this file's Review Pass section, matching
  `docs/orchestrator/QUALITY-GATES.md`'s wording without altering that doc.
- `skills/workflows/SKILL.md` / global — all five workflow diagrams
  (`Feature`, `Bug Fix`, `API Change`) and the routing table replaced
  "@validator ∥ @tester" with "checks (Core Rule 5 …)"; Agent Invocation list
  drops `validator`, adds `security`.
- `skills/cost-efficiency/SKILL.md` / global — Default Routing table and Model
  Budget section no longer reference @validator; Routing Log paragraph now cites
  the deterministic hook and @tester/@security as the reviewers.
- `skills/prototype-mode/SKILL.md` / global — gate-skip table and migration
  checklist unified onto the new model (deterministic hook reduced to one smoke
  command; @tester skipped rather than "reduced"; migration checklist references
  Core Rule 5's full gate combination instead of "run @validator and @tester").
- `skills/departments/SKILL.md` / global — Department Map and Routing Rules no
  longer assign @validator; Quality Operations department now supported by
  @tester/@security; routing rule 6 references the Core Rule 5 gate combination.
- `skills/meta-decisions/SKILL.md` / global — `securityOverride` now routes to
  @security (not @validator); Decision Flow no longer shows `analyze-prompt.js`
  as a live mechanism — replaced with "Orchestrator applies natively (Core Rule 3)"
  plus an explicit deprecation note (script deprecated since v8.6.0, hook wiring
  removed in v8.5.0, per META-DECISIONS.md H10); RARE matrix "Reviewed by" cell
  updated; Emergency Hotfix Workflow rewritten from "skip @tester, @scribe" to a
  logged-skip model — @tester/@security may be skipped only if logged in the
  Routing Log with a reason, and the `[Unreleased]` CHANGELOG entry stays
  mandatory even for the hotfix (VERSIONING.md "no exceptions"), resolving H4.
- `skills/issue-processing/SKILL.md` / global — `security` label routing changed
  from "Force @validator security check" to "Force @security check".
- `skills/agent-teams/SKILL.md` / global — Team Composition table replaces the
  Validator row with a Security row; example SharedTaskList JSON task renamed
  from "Validate auth code" (assignee `validator`) to "Security-check auth code"
  (assignee `security`).

## Final Diff Check (repo vs. global mirror)

Ran `diff` on all 8 pairs after every edit. Result: each pair differs **only** by
the `license:` frontmatter line (present in repo, absent in global) and the
trailing footer block (`---` + italic copyright line, present in repo, absent in
global) — identical to the pre-existing diff pattern for these files before this
sprint's changes. No content drift between repo and global copies.

## Notes / Out of Scope

- One historical mention of "the former @validator" remains in
  `skills/quality-gates/SKILL.md` (explaining where the judgment portion of the
  old agent went) — intentional, descriptive, not a live routing reference.
- `docs/orchestrator/QUALITY-GATES.md`'s judgment-class-human-gate section and its
  "correlated, not independent, evidence" statement were left untouched (not in
  this write scope — @builder-2).
- `scripts/analyze-prompt.js` itself, `scripts/validate-agent-output.js`, and
  `agents/validator.md` are other builders' scope; this report only corrects how
  the skills describe them.
