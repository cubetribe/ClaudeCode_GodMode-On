---
name: agent-teams
description: "Experimental Agent Teams orchestration — run CC_GodMode agents as parallel teammates with SharedTaskList coordination (requires CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1)"
disable-model-invocation: true
---

# Agent Teams Orchestration (Experimental)

> **Status:** Experimental — OFF by default (requires `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`)
> **When to use:** Large features where multiple teammates can work truly in parallel and the user explicitly accepts the token cost

## What Are Agent Teams?

Agent Teams are **coordinated background sessions** with a **shared task list**, **inter-agent messaging**, and a **lead/manager that assigns tasks and keeps workers in sync**. Instead of the Orchestrator calling agents sequentially via Task tool, a lead agent dispatches work and teammates claim, execute, and report tasks from the shared queue independently.

This surface is **experimental and off by default** — enable it only by setting `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1` in your environment or `settings.json`.

## How This Relates to the Other Parallelization Surfaces

GodMode maps onto four parallelization surfaces. Choose the right one for the job:

| Surface | What it is | Use when |
|---|---|---|
| **Plain subagents** (Task tool) | Delegated workers inside one session, own context, return a summary | A side task would flood the main context; up to ~10 run concurrently, the rest queue |
| **Agent teams** *(this skill)* | Coordinated sessions, shared task list, inter-agent messaging, lead-managed | Split a project, assign pieces, keep workers in sync — persistent teammates, not one-off tasks |
| **Dynamic workflows** (`skills/dynamic-workflows/`) | Orchestrator-written script fans out to tens–hundreds of subagents + adversarial cross-checks | Job outgrows a handful of subagents: codebase-wide audit, large migration, cross-checked research |
| **Agent view** (`claude agents`) | Dispatch + monitor background sessions | Several independent hand-off tasks you check on later (research preview) |

**Decision guidance:**
- Use **plain subagents** for one-off in-session side tasks (the default, always available).
- Use **agent teams** when you need persistent, coordinated teammates kept in sync via a shared task list across a multi-part project.
- Use **dynamic workflows** when a job outgrows a handful of subagents and needs fan-out at scale plus adversarial verification — trigger with the word "workflow" in a prompt or enable ultracode.
- See also the `## Parallelization` section of `CLAUDE.md` for the cost guardrail and concurrency tiers that apply across all surfaces.

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

## Limitations

- No session resumption with in-process teammates
- Task status can lag
- Only one team per session
- No nested teams
- Token usage: ~15x standard
- Shutdown can be slow

Use `skills/departments/` first when the problem is ownership and routing. Use
Agent Teams only when the implementation work itself can safely run in parallel.

## Best Practices

1. Break work into truly independent tasks
2. Define clear dependencies with `blockedBy`
3. Keep team size to 3–5 teammates
4. Use worktree isolation for all building/testing teammates
5. Reserve standard orchestration for sequential workflows (API changes)
