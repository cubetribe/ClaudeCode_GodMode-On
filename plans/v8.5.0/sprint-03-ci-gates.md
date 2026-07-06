---
sprint: 3
slug: ci-gates
plan: plans/v8.5.0/PLAN.md
status: done
execution: sequential
owner: orchestrator
---

# Sprint 03 — CI & Enforcement Gates

## Goal
Move the release law from prose to enforcement: CI checks on every PR, an automated release
tail, a working agent-output hook, and honest labels on dead automation.

## Scope
- `.github/workflows/release-consistency.yml`: on PR + push to main run
  `node scripts/sync-version.js --check` and `node scripts/release-check.js --ci`.
- `.github/workflows/release-tag.yml`: on push to main, if VERSION changed and tag `vX.Y.Z`
  missing → create annotated tag + **draft** GitHub Release from the CHANGELOG section
  (maintainer publishes manually; honors "never push without permission" culture).
- Fix `scripts/validate-agent-output.js`: read the Claude Code hook payload as stdin JSON
  (fallback to argv for manual CLI use); exit 2 for blocking per hook contract; align wiring in
  `config/claude-settings.json` and `.claude-plugin/plugin.json` (no arguments).
- Deprecation labels: header notice in `scripts/workflow-state.js` and
  `scripts/parallel-quality-gates.js` (simulation); remove/correct doc references
  (ADR-001 note, CCGM_Prompt_99 reference happens in Sprint 6).

## Non-Goals
- No full rebuild of workflow-state as multi-sprint state store (backlog, see ROADMAP).
- No branch-protection changes (needs maintainer; documented as manual step in S7 notes).

## Files / Write Scope
| Path | Writer |
|---|---|
| `.github/workflows/*.yml`, `scripts/validate-agent-output.js`, `scripts/workflow-state.js`, `scripts/parallel-quality-gates.js`, `config/claude-settings.json`, `.claude-plugin/plugin.json` (hooks section) | orchestrator |

## Risks
- CI YAML errors → validate syntax locally (node-based lint or careful review); workflows are
  new, cannot break existing CI (none exists).
- Auto-tag on main could fire on the backfill → guard: only acts when VERSION content changed
  in the push and no tag exists; draft release requires manual publish anyway.

## Acceptance Criteria
- [x] Both workflow files syntactically valid YAML (js-yaml parse), checks reference existing scripts
- [x] Hook mode verified: stdin JSON without argv exits 0 when no fresh report exists, validates
      the newest report otherwise (blocking = exit 2); CLI mode with explicit args unchanged
- [x] Dead scripts carry a DEPRECATED/SIMULATION header

## Test / Validation Strategy
Local: run scripts with stdin/args; YAML parsed with js-yaml. CI proof comes with the release PR.

## Changelog Note
Added: release-consistency CI + automated tag/draft-release tail; Fixed: SubagentStop hook
never validated (arg/stdin mismatch); Deprecated: workflow-state.js, parallel-quality-gates.js.

## Version Relevance
minor within the major release.

## Result
Delivered as scoped, plus: the two broken env-var hook variants
(`$CLAUDE_SUBAGENT_TYPE`/`$CLAUDE_SUBAGENT_OUTPUT`) in the auto-install prompt were corrected to
the argument-free stdin form (hook correctness, pulled forward from Sprint 6);
`release-check.js` now reads `GITHUB_HEAD_REF` so release/* PRs pass the ahead-of-tag rule in CI.
Note: `release-tag.yml` creates a DRAFT release — publishing stays manual by design.
