# CC_GodMode Workflows

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

## Critical Paths (API Changes)

Changes in these paths **MUST** go through @api-guardian:
- `src/api/**`
- `backend/routes/**`
- `shared/types/**`
- `types/`
- `*.d.ts`
- `openapi.yaml` / `openapi.json`
- `schema.graphql`

The hook `check-api-impact.js` warns automatically.
