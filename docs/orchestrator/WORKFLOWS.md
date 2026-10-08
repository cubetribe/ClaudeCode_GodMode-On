# CC_GodMode Workflows

> **v8.5 (ADR-004):** two commands wrap all workflows below — "Plan: [X]" produces `plans/vX.Y.Z/PLAN.md` + sprint files (`skills/sprint-planning/`), "Sprint: [NN|next]" executes one sprint through the matching workflow with preflight, gates, and serialized integration (changelog `[Unreleased]` entry via @scribe, sprint `Result`, status flip). VERSION is written only in the release sprint (`docs/orchestrator/VERSIONING.md`).

## Routing Decision

**Default: Smart Routing** (`skills/cost-efficiency/`) — risk-based minimal-agent paths.

**Escalate to Full-Gates** (`skills/workflows/`) when any risk signal is present:
- API/schema/type paths touched — canonical, enumerated list in `skills/api-change/SKILL.md`
- Security surfaces (`.github/workflows/`, auth code, secrets handling)
- Release artifacts (`VERSION`, `CHANGELOG.md`)
- User-facing UI changes
- New modules or cross-domain designs
- Breaking changes

**Architecture gate split:** For small/medium tasks the Orchestrator writes a 3–5 bullet inline architecture brief instead of invoking @architect. For high-risk tasks (risk signals above), invoke @architect (Opus) via Task tool.

## Workflow Selection

The Orchestrator selects the appropriate workflow based on the user's request.

**Note:** after @builder, the deterministic hook always runs; whichever of @tester (if
`ux_gate: auto`), @security (on security surfaces), and `/code-review` (on risk or doubt)
apply run IN PARALLEL. All that ran must APPROVE before continuing (Core Rule 5, `docs/orchestrator/QUALITY-GATES.md`).
@researcher is OPTIONAL — use when new technologies/libraries need evaluation.

## Parallel-First Defaults

When a request decomposes into **independent units** (multi-file edits, multi-domain work,
audits, migrations, multi-angle research), spawn parallel subagents in a **single message**
and fan in their verdicts — do not run them sequentially.

**Dependency mapping first:** tasks that write the same files, depend on each other's output,
or require ordering run **sequentially**. Only genuinely independent tasks run in parallel.

**Concurrency tiers:**
- Up to ~10 subagents concurrently inside one session (rest queue/batch).
- When a job outgrows that, escalate to **dynamic workflows** (`skills/dynamic-workflows/`,
  `/workflows`, or the ultracode switch) with adversarial verification and worktree/`/batch` isolation.

**File-conflict isolation:** use **worktrees** for parallel work on overlapping files; use
**`/batch`** to split one large change into 5–30 PR-opening subagents.

**Cost guardrail:** parallel = faster wall-clock, **not** cheaper — running many workers
multiplies token usage, and dynamic workflows can burn substantially more tokens than a
normal session. Smart Routing stays the default; max-parallel / dynamic-workflows is an
explicit, deliberate opt-in for big or time-critical jobs.

"Checks" after @builder means the deterministic hook (always) plus whichever of
@tester / @security / `/code-review` the sprint's risk profile calls for, run in
PARALLEL (Core Rule 5, `docs/orchestrator/QUALITY-GATES.md`).

## Standard Workflows

### 1. New Feature
```
User --> (@researcher)* --> @architect --> @builder --> checks --> @scribe
```
*@researcher is optional — use when new tech/library research is needed

### 2. Bug Fix
```
User --> @builder --> checks --> @scribe ([Unreleased] entry)
```

### 3. API Change (CRITICAL!)
```
User --> (@researcher)* --> @architect --> @api-guardian --> @builder --> checks --> @scribe
```
**@api-guardian is MANDATORY for API changes!**

### 4. Refactoring
```
User --> @architect --> @builder --> checks --> @scribe ([Unreleased] entry)
```

### 5. Release
```
User --> @scribe --> @github-manager
```

### 6. Process Issue
```
User: "Process Issue #X"
  --> @github-manager loads Issue
  --> Orchestrator analyzes: Type, Complexity, Areas
  --> Appropriate workflow is executed
  --> @github-manager creates PR with "Fixes #X"
```

### 7. Research Task
```
User: "Research [topic]"
  --> @researcher gathers knowledge
  --> Report with findings + sources
```

## Commands

| Command | Workflow |
|---------|----------|
| "New Feature: [X]" | Full: (@researcher) -> @architect -> @builder -> checks -> @scribe |
| "Bug Fix: [X]" | Bug: @builder -> checks -> @scribe ([Unreleased] entry) |
| "API Change: [X]" | API: (@researcher) -> @architect -> @api-guardian -> @builder -> checks -> @scribe |
| "Research: [X]" | Research: @researcher -> report |
| "Process Issue #X" | GitHub Issue Workflow |
| "Prepare Release" | Release: @scribe -> @github-manager |
| "Status" | Show current workflow state |

## Workflow Modes

Use `docs/orchestrator/MODES.md` and the matching skill when the request is not
a normal Standard Mode delivery task.

| Mode | Trigger | Skill |
|------|---------|-------|
| **Smart Routing (default)** | all tasks without high-risk signals | `skills/cost-efficiency/` |
| Full-Gates | risk signals present (API, security, release, new modules, breaking changes) | `skills/workflows/` |
| Prototype | "prototype", "spike", "proof of concept", "throwaway" | `skills/prototype-mode/` |
| Departments | cross-domain work, unclear ownership, large implementation plan | `skills/departments/` |
| Agent Teams | explicit teammate or SharedTaskList request | `skills/agent-teams/` |
| Ultracode / Max-Parallel | large decomposable jobs / codebase-wide audits / big migrations / cross-checked research, or ultracode | `skills/dynamic-workflows/` |

Mode rules do not remove mandatory safety gates unless the mode explicitly says
so. Prototype Mode is the only local-only exception and must not be pushed or
deployed.

## Critical Paths (API Changes) — Full-Gates Risk Signals

API/schema/type paths are a Full-Gates risk signal category — touching them forces the Full-Gates
path and **MUST** go through @api-guardian. The canonical, enumerated path list lives in
**`skills/api-change/SKILL.md`** and nowhere else — look there for the current set instead of
relying on a copy here.

Additional Full-Gates risk signals: `.github/workflows/`, `VERSION`, `CHANGELOG.md`, user-facing UI, new modules, breaking changes.

The hook `check-api-impact.js` warns automatically for API paths.
