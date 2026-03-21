---
name: agent-teams
description: "Experimental Agent Teams orchestration — run CC_GodMode agents as parallel teammates with SharedTaskList coordination (requires CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)"
disable-model-invocation: true
---

# Agent Teams Orchestration (Experimental)

> **Status:** Experimental — requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`
> **When to use:** Large features where multiple agents can work truly in parallel

## What Are Agent Teams?

Agent Teams allow multiple Claude Code instances to coordinate through a SharedTaskList. Instead of the Orchestrator calling agents sequentially via Task tool, teammates work independently and pick up tasks from a shared queue.

## Enabling Agent Teams

Add to your environment or `settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1"
  }
}
```

## Team Composition

| Teammate | Role | Model | Isolation |
|----------|------|-------|----------|
| Architect | Design & planning | opus | — |
| Builder | Implementation | sonnet | worktree |
| Validator | Code quality | sonnet | worktree |
| Tester | UX quality | sonnet | worktree |
| Scribe | Documentation | haiku | — |

**Recommended team size:** 3–5 teammates for optimal coordination.

## SharedTaskList

Tasks follow this lifecycle:

```
pending → in_progress → completed
                     → failed
```

- **Dependencies:** Tasks can have `blockedBy` arrays
- **Claiming:** File-locking prevents race conditions
- **Auto-pickup:** After completing a task, teammate picks next unblocked task

## Example Task Flow

```json
{
  "tasks": [
    {"id": "1", "name": "Design auth module", "assignee": "architect", "status": "completed"},
    {"id": "2", "name": "Implement auth API", "assignee": "builder", "blockedBy": ["1"], "status": "in_progress"},
    {"id": "3", "name": "Implement auth UI", "assignee": "builder", "blockedBy": ["1"], "status": "in_progress"},
    {"id": "4", "name": "Validate auth code", "assignee": "validator", "blockedBy": ["2", "3"], "status": "pending"},
    {"id": "5", "name": "Test auth UX", "assignee": "tester", "blockedBy": ["2", "3"], "status": "pending"}
  ]
}
```

## Hooks for Agent Teams

| Hook | Purpose | Exit Code 2 |
|------|---------|-------------|
| `TeammateIdle` | Fires when teammate about to go idle | Teammate continues working |
| `TaskCompleted` | Fires when task marked complete | Prevents completion, sends feedback |

## When to Use Agent Teams vs Standard Orchestration

| Scenario | Use Agent Teams? |
|----------|------------------|
| Large feature with independent modules | YES |
| Multiple parallel investigations | YES |
| Small bug fix | NO — overhead not worth it |
| API change (strict sequence required) | NO — sequential workflow needed |
| Research task | NO — single agent sufficient |

## Limitations (March 2026)

- No session resumption with in-process teammates
- Task status can lag
- Only one team per session
- No nested teams
- Token usage: ~15x standard
- Shutdown can be slow

## Best Practices

1. Break work into truly independent tasks
2. Define clear dependencies with `blockedBy`
3. Keep team size to 3–5 teammates
4. Use worktree isolation for all building/testing teammates
5. Reserve standard orchestration for sequential workflows (API changes)