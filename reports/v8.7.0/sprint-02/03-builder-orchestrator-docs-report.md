---
agent: builder-2 (orchestrator-docs)
date: 2026-07-28
sprint: v8.7.0/sprint-02-gate-restructure
task: align QUALITY-GATES.md, WORKFLOWS.md, AGENTS.md, MODES.md with the canonical
  gate model already written to CLAUDE.md (Core Rules 5-8)
---

## Summary

Brought the four assigned `docs/orchestrator/` files into agreement with the canonical
law already present in `CLAUDE.md`: @validator is dissolved (deterministic part -> hook,
judgment part -> `/code-review`), @tester is opt-in via `ux_gate`, @security is wired
identically wherever it appears, and all Standard Workflows end at @scribe.

## Changes per file

### QUALITY-GATES.md
- Replaced the "@validator ∥ @tester, both must APPROVE" model with the four-part
  Core Rule 5 model: deterministic hook (always) + @tester (`ux_gate: auto`) +
  @security (security surfaces) + `/code-review` (risk/doubt), run in parallel after
  the hook. New ASCII diagram and Decision Matrix reflect 3 optional gates instead of 2.
  Old "Gate 1 / Gate 2" sections replaced with one section per gate (@tester, @security,
  `/code-review`).
- Rewrote the two `@validator`-referencing examples inside Finding-Conflict Adjudication
  to use `/code-review` / lint instead, so no reference to @validator as an active gate
  remains outside the historical explanation.
- Left the Judgment-Class Human Gate section (including the correlated-miss reasoning)
  untouched, per sprint instruction — it gains value with stronger models, doesn't need
  restating.
- Rewrote Agent Return Contract: full-report duty now stated as "agents holding `Write`"
  (@architect, @builder, @researcher, @scribe); read-only agents (@api-guardian, @tester,
  @security, department agents) return verdict only, dispatcher persists it (Core Rule 8).
  Confirmed via `~/.claude/agents/*.md` frontmatter that api-guardian/tester/security/
  github-manager all lack `Write` — matches the sprint's tool-based split, not a guess.
  Min-length list trimmed to the four Write-holding agents.

### WORKFLOWS.md
- "@validator and @tester run IN PARALLEL, both must APPROVE" replaced with a
  Core-Rule-5-referencing note (hook always + whichever of tester/security/code-review
  apply, in parallel).
- All five workflow diagrams (New Feature, Bug Fix, API Change, Refactoring) and the
  Commands table now read `-> checks -> @scribe`; Bug Fix and Refactoring previously
  ended at "(done)" with no @scribe — fixed per H3 (every sprint needs an `[Unreleased]`
  entry).
- Removed the stale "@validator ∥ @tester" framing line, replaced with a "checks" glossary
  line.

### AGENTS.md
- Core Agents table: 8 -> 7, @validator row removed with an explanatory paragraph (split
  into hook + `/code-review`, per Core Rule 5) instead of silent deletion.
- @tester role annotated with its `ux_gate: auto` condition.
- @security section reworded: "same routing as the other post-@builder gates ... BLOCKED
  routes back to @builder" — resolves H5 (@security had no defined routing vs.
  QUALITY-GATES.md not knowing it; now both files say the same thing).
- Handoff Matrix: @validator row removed; @builder's "passes to" cell now lists the
  hook + conditional gates; @scribe's "receives from" cell references "hook + all gates
  that ran"; @quality-operations row no longer references @validator.

### MODES.md
- Full-Gates diagram: `(@validator || @tester)` -> `checks`, with a one-line gloss.
- Smart Routing section: "does not skip @api-guardian ... @validator ... @tester" ->
  "does not skip @api-guardian ... the deterministic hook ... @tester when `ux_gate: auto`".

## Verification

```
grep -n "@validator" docs/orchestrator/QUALITY-GATES.md docs/orchestrator/WORKFLOWS.md \
  docs/orchestrator/AGENTS.md docs/orchestrator/MODES.md
```
Two remaining hits, both explanatory (not describing @validator as an active gate):
- `AGENTS.md:11` — "@validator no longer exists as a standing agent. It was split..."
- `QUALITY-GATES.md:84` — "...the part of the old @validator role a hook cannot replace"

`META-DECISIONS.md` still references `@validator` twice — out of write scope for this
sprint (owned by whichever builder covers the remaining H2/H3/H4/H9/H14/H15/H17/H18/H21
sweep in Sprint 03 per the sprint's Non-Goals).

### Files Created

None — this task only edited existing files inside the assigned write scope.

### Files Modified

- `docs/orchestrator/QUALITY-GATES.md` - gate model, decision matrix, agent return contract
- `docs/orchestrator/WORKFLOWS.md` - workflow diagrams, commands table, all flows end at @scribe
- `docs/orchestrator/AGENTS.md` - agent roster, handoff matrix, @validator removal
- `docs/orchestrator/MODES.md` - Full-Gates diagram, Smart Routing gate description

## Files Changed

- `docs/orchestrator/QUALITY-GATES.md`
- `docs/orchestrator/WORKFLOWS.md`
- `docs/orchestrator/AGENTS.md`
- `docs/orchestrator/MODES.md`

### Quality Gates

Documentation-only sprint, no source code changed — no TypeScript/lint/build to run.
Verification performed instead:
- [x] `grep -rn "@validator"` sweep across all 4 files — only 2 explanatory (non-active-gate) hits remain
- [x] `grep -n "done)$"` sweep on WORKFLOWS.md — no flow ends before @scribe anymore
- [x] Cross-file consistency check: QUALITY-GATES.md, WORKFLOWS.md, AGENTS.md, MODES.md now state the same hook + @tester + @security + `/code-review` model
- [x] Tests: not applicable (no code paths touched); Core Rule 5/6/7/8 wording matches CLAUDE.md verbatim where quoted

## Notes / Handoffs

- Confirmed tool lists for api-guardian, tester, security, github-manager (`~/.claude/agents/*.md`) show none hold `Write` — consistent with builder-4's expected archival of `agents/validator.md`.
- `META-DECISIONS.md` (2 remaining @validator refs) is out of scope here; flagging for whichever sprint/builder owns it.
- **Preflight conflict check:** `git status` before my first write showed `AGENTS.md` and `MODES.md` already modified relative to `HEAD` (`QUALITY-GATES.md`/`WORKFLOWS.md` were clean). Diffed against `HEAD` to check for overlap: `AGENTS.md` carried a pre-existing uncommitted addition of the standard copyright footer (unrelated to the gate model, no line overlap with my edits); `MODES.md` carried a pre-existing `v8.0.0 note` → `v7.0.0 note` label drift (cosmetic, no line overlap). Neither touches gate/agent-roster content, so I proceeded rather than blocking — flagging both here so the orchestrator can confirm no other agent is mid-edit on these two files.
