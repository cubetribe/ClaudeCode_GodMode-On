---
agent: builder-4
date: 2026-07-28
sprint: v8.7.0/sprint-02-gate-restructure
task: agents/* gate restructure (validator dissolution, tester opt-in, D1 fix)
---

# Builder-4 Report — Agent Files (Gate Restructure)

## Summary

@validator archived (not deleted). @tester trimmed and made explicitly opt-in
(`ux_gate: auto` only, with a Playwright-unreachable fallback to `human`). @security
`effort` fixed to `medium`; given explicit optional-gate routing text matching
validator/tester. All other agent files that named @validator or the old dual-gate
model updated to the hook + optional-gate + `/code-review` model. D1 (report duty vs.
tool set) fixed for `docs-dx` and `quality-operations`, the two read-only agents in my
scope that carried a physically unfulfillable `Save to:` instruction.

## Files Created

- `archive/agents/validator.md` — archived copy of the dissolved agent, with a dissolution header note (Sprint 02, v8.7.0).
- `reports/v8.7.0/sprint-02/03-builder-agents-report.md` — this report.

## Files Modified

(also mirrored to `~/.claude/agents/` for each entry below)

- `agents/tester.md` — trimmed and made opt-in.
- `agents/security.md` — effort fixed, optional-gate wording added.
- `agents/builder.md`, `agents/architect.md`, `agents/api-guardian.md`, `agents/researcher.md`, `agents/github-manager.md`, `agents/docs-dx.md`, `agents/quality-operations.md`, `agents/scribe.md` — @validator references replaced with hook/`/code-review`/@tester/@security language; D1 fix applied to `docs-dx.md` and `quality-operations.md`.

## Files Removed

- `agents/validator.md` (repo) and `~/.claude/agents/validator.md` (install) — dissolved, preserved under `archive/agents/validator.md`.

## Quality Gates

- [x] `grep -rn "@validator" agents/*.md` → 0 matches
- [x] License footer preserved verbatim in every touched/archived file
- [x] Pre-write conflict check (`git status`/`git diff` on `agents/*`) showed only the expected Sprint 01 license-footer diff, no foreign in-flight edits
- [x] `~/.claude/agents/validator.md` confirmed absent (agent no longer dispatchable)
- [x] All 10 non-archived touched files re-synced repo → install

## Tests

No automated test suite applies to markdown agent-definition files; verification was via the `grep` sweep and manual diff review above (this sprint's Test Strategy explicitly specifies a `grep`-sweep as the executable assertion for the coherence criteria, not unit tests).

## Files Changed (detail)

**Repo (`ON/agents/`) + mirrored to `~/.claude/agents/`:**
- `agents/validator.md` → removed (repo); archived copy created at `archive/agents/validator.md` with a dissolution header note. Removed from `~/.claude/agents/` so it is no longer dispatchable.
- `agents/tester.md` — trimmed ~546 → ~150 lines: dropped ASCII output templates, JSON error schemas, testing-trophy diagram, viewport-preset table, cross-browser section, quick-commands. Kept 3 viewports (375×667/768×1024/1920×1080), CWV thresholds table, blocking/non-blocking list. Added: runs only under `ux_gate: auto`; Playwright-unreachable → report + recommend `ux_gate: human` fallback (logged, not blocking) instead of `STATUS: BLOCKED`. Replaced @validator references ("No Unit Tests/TypeScript — that's @validator") with hook/@security references.
- `agents/security.md` — `effort: low` → `effort: medium` (was contradicting its own high-stakes rationale). Reworded Role + Workflow Position to state it is an **optional** gate on security surfaces with the same BLOCKED→@builder routing as the other gates. Replaced the `@validator` mention in "What I DO NOT Do" and the workflow diagram. Checked for Anthropic's "conservative-instruction" anti-pattern (docs warn instructions like "only report high-severity" or "be conservative" suppress findings) — none found; existing "Default to caution: flag as Medium" already reports rather than suppresses, left unchanged. HEAD~1 rule already present independently in this file (not solely in validator.md) — nothing to backfill.
- `agents/builder.md` — replaced 4 `@validator` references (workflow diagram, "Ready for @validator" checklist header, "No Cross-File Validation", API-change handoff step 5) with hook/`/code-review` language.
- `agents/architect.md` — replaced "No Cross-File Consistency Checks — @validator" with hook/`/code-review`.
- `agents/api-guardian.md` — replaced "No Cross-File Consistency Checks — @validator (final)" and workflow diagram; own HEAD~1 rule already present, untouched.
- `agents/researcher.md` — replaced "No Testing — @validator + @tester" with hook + conditional @tester.
- `agents/github-manager.md` — replaced "No Code Review Content — @validator" and "From @validator" input section.
- `agents/docs-dx.md` — replaced "No code review — @validator's scope"; **D1 fix**: Sprint Contract write-scope line and Report-Output section now state the agent has no `Write` tool, returns full findings in its verdict, and the dispatcher persists the report — no new Write access granted.
- `agents/quality-operations.md` — replaced "@validator and @tester run the actual gates" and the `@quality-operations ▶ @validator` workflow diagram; **D1 fix** applied identically to docs-dx (write-scope line + Report Output section).
- `agents/scribe.md` — replaced 5 `@validator` references: report-reading list (`04-validator-report.md` → deterministic hook output note), "No Quality Validation", workflow diagram, "From @validator" input section, and the "When to use @scribe" trigger line.

**Not touched (outside grep hits / outside my write scope):** `workflow-design.md`, `workspace-governance.md`, `ci-security-guardian.md`, `runtime-platform.md` — none mention `@validator` per the sweep; left to whichever builder owns them if the old gate model appears there in prose form.

## Verification

- `grep -rn "@validator" agents/*.md` → 0 matches (acceptance criterion 1, scoped to `agents/`).
- `ls ~/.claude/agents/ | grep -i validator` → no result; agent no longer dispatchable.
- Pre-write conflict check: `git status`/`git diff` on `agents/*` showed only the Sprint 01 license-footer additions (uncommitted, expected) — no foreign in-flight edits.
- License footer preserved verbatim in every touched file, including the archived copy.

## Known follow-ups for other builders (not mine to fix)

- `docs/orchestrator/AGENTS.md`, `QUALITY-GATES.md`, `WORKFLOWS.md`, `MODES.md` (builder-2) and `skills/*` (builder-3) still need the same hook/optional-gate wording for full coherence (acceptance criterion 2).
- `scripts/validate-agent-output.js` (builder-5) likely still has a rule for the now-archived `@validator` — out of my write scope.
