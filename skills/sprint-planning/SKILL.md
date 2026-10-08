---
name: sprint-planning
description: "Plan-first orchestration (ADR-004): comprehensive PLAN.md, sprint files with write-scope ownership, preflight checks, serialized integration, and the release sprint. Use for any non-trivial or multi-part request BEFORE dispatching agents."
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
---

# Sprint Planning (Plan-First Orchestration)

> Replaces the pre-v8.5 Version-First rule. Work is planned before it is dispatched; the version
> is decided at release, not at start. Release law: `docs/orchestrator/VERSIONING.md`.

## When to plan

| Request | Path |
|---|---|
| Trivial fix (one file, one concern) | Implicit `sprint-00` — no plan ceremony, but changelog-at-integration still applies |
| One coherent feature/bug | Single sprint file, minimal PLAN.md (or extend an existing plan) |
| Multi-part work, release overhauls, anything touching >1 domain | Full plan: PLAN.md + sprint files |

## Artifacts

```
ROADMAP.md                          # living roadmap: initiative → target version → status
plans/vX.Y.Z/PLAN.md                # master plan: analysis, target architecture, sprint index, global ownership
plans/vX.Y.Z/sprint-NN-<slug>.md    # per sprint (template: docs/templates/SPRINT_TEMPLATE.md)
reports/vX.Y.Z/sprint-NN/           # TRACKED agent/subagent reports (committed at integration)
```

`vX.Y.Z` is the **target** version of the plan — a working label. The actual bump happens only
in the release sprint and may differ if scope changed (re-label the plan folder then).

## Writing the plan

1. **Analyze first** — understand the repo state before decomposing (audit sprint if needed).
2. **Decompose into sprints** with disjoint write scopes where possible. Every sprint file
   carries: Goal, Scope, Non-Goals, Files/Write-Scope table, Risks, Acceptance Criteria,
   Test/Validation Strategy, Changelog Note, Version Relevance, execution mode.
3. **Ownership matrix in PLAN.md** — for hot files (`VERSION`, `CHANGELOG.md`, `ROADMAP.md`,
   `README.md`, `plans/**`) name the single writer and the sprint that owns them.
4. **Order by dependency** — tooling before consumers, contracts before implementations,
   docs after behavior. Mark which sprints could run in parallel (disjoint scopes only).
5. **User review** — present the plan before execution for scope-relevant work.

## Executing sprints

Per sprint (see CLAUDE.md "Sprint Execution"):

1. **Preflight:** `git status` clean; plan assumptions still valid; no in-progress sprint with
   overlapping write scope; sprint status → `in-progress`.
2. **Dispatch:** agents get the sprint file path + their write scope in the prompt. Agents obey
   their Sprint Contract (stop on `BLOCKED (scope|conflict)` — never overwrite foreign work).
3. **Gates:** dual quality gates; a `BLOCKED (conflict)` halts this and dependent sprints.
4. **Integration (serialized — one sprint at a time):** @scribe adds the `[Unreleased]`
   changelog entry; orchestrator fills the sprint `Result`, ticks acceptance criteria,
   status → `done`. Commit per sprint with a Conventional Commit message — **including the
   sprint's `reports/` folder** (reports are tracked; temp-dir output is a contract violation).

## Parallel sprints — decision rule

Parallel execution is allowed ONLY when ALL are true:
- write-scope tables are disjoint (verified, not assumed),
- neither sprint touches hot files outside serialized integration,
- no dependency between their acceptance criteria.

Otherwise: sequential. When parallel writes to overlapping paths are truly needed, isolate in
git worktrees and serialize the merge order explicitly.

## Release sprint (always last)

1. All sprints `done`, `[Unreleased]` non-empty, working tree clean.
2. Resolve inherited drift first (missing tags etc. — `node scripts/release-check.js` lists it).
3. Bump type = max of all sprint `Version Relevance` fields.
4. `node scripts/version-bump.js <type>` → bump + `[Unreleased]` promotion + full touchpoint sync.
5. Verify: `npm run version:check` + `npm run release:check` green (ahead-of-tag is OK on `release/*`).
6. Release PR → merge (merge commit) → `.github/workflows/release-tag.yml` tags + drafts the
   GitHub Release → maintainer publishes. RCs: `vX.Y.Z-rc.N` as GitHub pre-release.
7. Flip ROADMAP entry to `released`.

**Push/tag/publish always requires explicit user permission.**

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
