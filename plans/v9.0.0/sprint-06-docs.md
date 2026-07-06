---
sprint: 6
slug: docs
plan: plans/v9.0.0/PLAN.md
status: planned
execution: sequential
owner: orchestrator
---

# Sprint 06 — Documentation, README & Consistency

## Goal
Bring the public docs in line with the v9 workflow and repair objective defects found by the
audit, without rewriting healthy content.

## Scope
- `README.md`: v9 workflow summary (plan-first, sprints, release invariant), version box,
  docs index entry for ROADMAP/plans.
- `docs/INSTALLATION.md`, `CC-GodMode-Prompts/QUICK_START.md`: sprint workflow mention; fix the
  false "setup script installs MCP servers" claim; skill count corrections (install prompts
  claim 11, repo has 14 after sprint-planning).
- `CONTRIBUTING.md`: release law for contributors — conventional commits incl. actually-used
  types (`deps:`, `chore(release):`, `feat(release)!:`), changelog rule (every PR adds an
  `[Unreleased]` entry or is labeled no-changelog), release-branch naming, structure map update.
- Registry dedupe: `docs/AGENTS.md` stays human-facing, `docs/orchestrator/AGENTS.md` machine
  registry gains the 6 department agents in the handoff matrix; `docs/AGENT_ARCHITECTURE.md`
  updated or explicitly marked historical (placeholder URL, 7-agent tree).
- Install prompts: version/feature claims sweep (CCGM_Prompt_02 v5.6-era content, Prompt_99
  obsolete law and 'v6.4.0' example, Prompt_01 skill list) — minimal correction to v9 reality.
- `CHANGELOG.md` tail repair (objective defects only): year typos ([5.0.0]/[4.1.0] 2025→2026),
  duplicate upgrade-guide heading label, dead footer links, Version History Summary note.
  Released entry BODIES remain untouched.
- `docs/policies/*`: stamp reconciliation only where claims are actively wrong (REPORT_TEMPLATES
  agent list is fixed in Sprint 4; policies get an "applies as of" note).

## Non-Goals
- No new features; no STORY.md rewrite; no translation work.

## Files / Write Scope
| Path | Writer |
|---|---|
| `README.md`, `docs/**` (excl. orchestrator files owned by S5 where already updated), `CC-GodMode-Prompts/*.md`, `CONTRIBUTING.md`, `CHANGELOG.md` (tail repairs only) | orchestrator |

## Risks
- Touching historical CHANGELOG text → only objective defects (dates, dead links, mislabels),
  each listed in the changelog note.
- Install prompts are long → targeted edits, no rewrite.

## Acceptance Criteria
- [ ] No doc claims 11 or 13 skills where 14 exist; agent count 15 everywhere
- [ ] CONTRIBUTING covers commits/changelog/release branches
- [ ] CHANGELOG has no 2025-01 dates between 2025-12 and 2026-01 entries
- [ ] `sync-version.js --check` still green after edits

## Test / Validation Strategy
Grep sweeps (skill/agent counts, version strings), link check on repaired footer links,
`--check` run.

## Changelog Note
Fixed: documentation consistency sweep (skill counts, install claims, CHANGELOG date/link
defects); Added: contributor release law in CONTRIBUTING.md.

## Version Relevance
patch (within the major release).

## Result
(filled at completion)
