# CC_GodMode Workflows

## Routing Decision

**Default: Smart Routing** (`skills/cost-efficiency/`) — risk-based minimal-agent paths.

**Escalate to Full-Gates** (`skills/workflows/`) when any risk signal is present:
- API/schema/type paths touched (`src/api/`, `backend/routes/`, `shared/types/`, `*.d.ts`, `openapi.yaml`)
- Security surfaces (`.github/workflows/`, auth code, secrets handling)
- Release artifacts (`VERSION`, `CHANGELOG.md`)
- User-facing UI changes
- New modules or cross-domain designs
- Breaking changes

**Architecture gate split:** For small/medium tasks the Orchestrator writes a 3–5 bullet inline architecture brief instead of invoking @architect. For high-risk tasks (risk signals above), invoke @architect (Opus) via Task tool.

## Workflow Selection

The Orchestrator selects the appropriate workflow based on the user's request.

**Note:** @validator and @tester run IN PARALLEL after @builder. Both must APPROVE before continuing. @researcher is OPTIONAL — use when new technologies/libraries need evaluation.

## Standard Workflows

### 1. New Feature
```
User --> (@researcher)* --> @architect --> @builder --> @validator + @tester (PARALLEL) --> @scribe
```
*@researcher is optional — use when new tech/library research is needed

### 2. Bug Fix
```
User --> @builder --> @validator + @tester (PARALLEL) --> (done)
```

### 3. API Change (CRITICAL!)
```
User --> (@researcher)* --> @architect --> @api-guardian --> @builder --> @validator + @tester (PARALLEL) --> @scribe
```
**@api-guardian is MANDATORY for API changes!**

### 4. Refactoring
```
User --> @architect --> @builder --> @validator + @tester (PARALLEL) --> (done)
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
| "New Feature: [X]" | Full: (@researcher) -> @architect -> @builder -> @validator + @tester -> @scribe |
| "Bug Fix: [X]" | Bug: @builder -> @validator + @tester |
| "API Change: [X]" | API: (@researcher) -> @architect -> @api-guardian -> @builder -> @validator + @tester -> @scribe |
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

Mode rules do not remove mandatory safety gates unless the mode explicitly says
so. Prototype Mode is the only local-only exception and must not be pushed or
deployed.

## Critical Paths (API Changes) — Full-Gates Risk Signals

These file paths are Full-Gates risk signals — they force the Full-Gates path and **MUST** go through @api-guardian:
- `src/api/**`
- `backend/routes/**`
- `shared/types/**`
- `types/`
- `*.d.ts`
- `openapi.yaml` / `openapi.json`
- `schema.graphql`

Additional Full-Gates risk signals: `.github/workflows/`, `VERSION`, `CHANGELOG.md`, user-facing UI, new modules, breaking changes.

The hook `check-api-impact.js` warns automatically for API paths.
