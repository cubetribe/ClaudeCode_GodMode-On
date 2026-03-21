---
name: workflows
description: "CC_GodMode workflow definitions — select the right agent sequence for any task type (Feature, Bug, API Change, Refactor, Research, Issue, Release)"
---

# Workflow Definitions

The Orchestrator selects workflows automatically based on task type.

## Workflow Selection

| Command Pattern | Workflow | Agents |
|----------------|----------|--------|
| "New Feature: [X]" | Feature | (@researcher) → @architect → @builder → @validator ∥ @tester → @scribe |
| "Bug Fix: [X]" | Bug Fix | @builder → @validator ∥ @tester |
| "API Change: [X]" | API Change | (@researcher) → @architect → @api-guardian → @builder → @validator ∥ @tester → @scribe |
| "Refactor: [X]" | Refactor | @architect → @builder → @validator ∥ @tester |
| "Research: [X]" | Research | @researcher → report |
| "Process Issue #X" | Issue | @github-manager loads → analyze → select workflow → PR |
| "Prepare Release" | Release | @scribe → @github-manager |

*(@researcher) = optional, use when new tech/libraries need evaluation*

## Feature Workflow (Full)

```
User Request → "New Feature: [X]"
    ↓
1. @researcher (OPTIONAL — if new tech involved)
   → Report: technology evaluation, best practices, risks
    ↓
2. @architect
   → Architecture Decision Record (ADR)
   → Module structure, interfaces, tech choices
    ↓
3. @builder
   → Implementation following @architect specs
   → All code changes, tests, types
    ↓
4. @validator ∥ @tester (PARALLEL — both MUST pass)
   → See quality-gates skill for decision matrix
    ↓
5. @scribe
   → VERSION bump, CHANGELOG, documentation
```

## Bug Fix Workflow (Minimal)

```
User Request → "Bug Fix: [X]"
    ↓
1. @builder (fix implementation)
    ↓
2. @validator ∥ @tester (PARALLEL)
    ↓
3. COMPLETE (no @scribe for patches unless significant)
```

## API Change Workflow (Strict)

**MANDATORY @api-guardian** — never skip for API changes.

```
User Request → "API Change: [X]"
    ↓
1. @researcher (OPTIONAL)
    ↓
2. @architect (API design, contract definition)
    ↓
3. @api-guardian (MANDATORY)
   → Consumer impact analysis
   → Breaking change detection
   → Migration strategy
    ↓
4. @builder (implementation + consumer updates)
    ↓
5. @validator ∥ @tester (PARALLEL)
    ↓
6. @scribe (document breaking changes)
```

## Critical API Paths

These file patterns **always** trigger @api-guardian:

- `src/api/**`
- `backend/routes/**`
- `shared/types/**`
- `*.d.ts`
- `openapi.yaml` / `schema.graphql`
- `**/interfaces/**`

## Research Workflow (Standalone)

```
User Request → "Research: [X]"
    ↓
1. @researcher
   → Web research, documentation lookup
   → Technology evaluation matrix
   → Report with sources and recommendations
    ↓
2. Report saved to reports/vX.X.X/00-researcher-report.md
```

## Issue Processing Workflow

```
User Request → "Process Issue #X"
    ↓
1. @github-manager loads issue from GitHub
    ↓
2. Orchestrator analyzes:
   → Type: Bug / Feature / Enhancement
   → Complexity: Low / Medium / High
   → Areas: API / UI / Backend / Infrastructure
    ↓
3. Select appropriate workflow (Feature/Bug/API)
    ↓
4. Execute workflow
    ↓
5. @github-manager creates PR with "Fixes #X"
```

## Release Workflow

```
User Request → "Prepare Release"
    ↓
1. @scribe
   → Verify VERSION is incremented
   → Verify CHANGELOG is updated
   → Verify all reports are in place
    ↓
2. @github-manager
   → Create release PR
   → Tag version
   → Create GitHub Release
```

## Agent Invocation

All agents are called via the `Task` tool with `subagent_type`:

```
Task tool → subagent_type: "architect"     → @architect
Task tool → subagent_type: "api-guardian"   → @api-guardian
Task tool → subagent_type: "builder"        → @builder
Task tool → subagent_type: "validator"      → @validator
Task tool → subagent_type: "tester"         → @tester
Task tool → subagent_type: "scribe"         → @scribe
Task tool → subagent_type: "github-manager" → @github-manager
Task tool → subagent_type: "researcher"     → @researcher
```