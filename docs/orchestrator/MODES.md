# CC_GodMode Workflow Modes

Updated: 2026-06-11

This document defines the mode layer above the CC_GodMode agent
workflow. Modes change orchestration behavior; they do not remove mandatory
safety rules unless the mode explicitly declares a local-only exception.

**v8.0.0 note:** Smart Routing is now the default. Each agent carries an `effort` field in its frontmatter (requires Claude Code ≥2.1.152) to tune token budgets: architect=high, builder/tester/api-guardian=medium, all others=low.

## Mode Summary

| Mode | Skill | Use when | Default posture |
| --- | --- | --- | --- |
| **Smart Routing** | `skills/cost-efficiency/` | **DEFAULT — all work not matching risk signals** | risk-based minimal-agent paths, inline arch brief |
| Full-Gates | `skills/workflows/` | high-risk work: new modules, API/breaking changes, security, release artifacts | full workflow and gates |
| Prototype | `skills/prototype-mode/` | local throwaway spikes | fast, watermarked, no push |
| Departments | `skills/departments/` | large cross-domain work | expanded planning and write scopes |
| Agent Teams | `skills/agent-teams/` | explicitly requested teammate-style parallelism; see also `skills/dynamic-workflows/` | experimental and expensive |
| Ultracode / Max-Parallel | `skills/dynamic-workflows/` | large, decomposable jobs: codebase-wide audits, big migrations, cross-checked research; fan out to tens–hundreds of verified parallel subagents (opt-in, higher token spend) | dynamic-workflow script; adversarial verification; worktree isolation |

## Parallel-First Defaults

When a request decomposes into independent units (multi-file edits, multi-domain work, audits, migrations, multi-angle research), the orchestrator fans out to parallel subagents **in a single message** rather than sequentially. After all subagents return, the orchestrator fans in, resolves conflicts, and synthesizes one result.

- **Dependency mapping first:** tasks that write the same files, depend on each other's output, or require ordering run sequentially. Only genuinely independent tasks run in parallel.
- **Concurrency cap:** up to ~10 subagents concurrently in one session (the rest queue). When a job outgrows that, escalate to dynamic workflows (`/workflows` or ultracode effort) with adversarial verification.
- **File-conflict isolation:** use worktrees for parallel work on overlapping files; use `/batch` to split one large change into 5–30 PR-opening subagents.

## Smart Routing (Default)

**Smart Routing is the default** as of v7.0.0. The Orchestrator applies it automatically unless the task carries high-risk signals.

Risk signals that force Full-Gates:
- API/schema/type paths (`src/api/`, `backend/routes/`, `shared/types/`, `*.d.ts`, `openapi.yaml`)
- Security surfaces (`.github/workflows/`, auth code, secrets handling)
- Release artifacts (`VERSION`, `CHANGELOG.md`)
- User-facing UI changes
- New modules or cross-domain designs
- Breaking changes

See `skills/cost-efficiency/SKILL.md` for full routing table.

## Full-Gates (formerly Standard)

Full-Gates is the explicit escalation path for high-risk work:

```text
(@researcher)* -> @architect -> @builder -> (@validator || @tester) -> @scribe
```

Use @api-guardian between @architect and @builder for API, schema, CLI, config,
or public contract changes.

**Architecture gate split:** For small/medium tasks, the Orchestrator may write an inline architecture brief instead of invoking @architect (Opus). Invoke @architect for new modules, breaking changes, cross-domain designs, or when uncertain.

## Prototype Mode

Prototype Mode is copied conceptually from the Codex GodMode fast lane, but
implemented here as a Claude Code skill.

It is local-only:

- @builder writes prototype files
- every generated source file carries a `PROTOTYPE ONLY` header
- one smoke command is required
- @scribe and @github-manager are skipped
- output must migrate through Full-Gates (Standard) before production use

## Departments Mode

Departments Mode is the expanded orchestration layer. It uses the existing
agents, but groups responsibility into runtime, workflow, governance, quality,
docs, CI/GitHub, and API/contract departments.

It requires:

- intake brief
- department routing map
- write-scope matrix
- concise department handoffs
- one implementation writer unless an explicit write lease is granted

Claude Code Agent Teams can be used inside this mode only when explicitly
requested and when tasks are truly independent.

## Smart Routing / Cost-Efficiency

Smart Routing (formerly Cost-Efficiency Mode, now the default) keeps the system from over-orchestrating.

It prefers:

- fewer subagents
- bounded research
- concise reports
- existing low-cost agents where they fit
- targeted validation by changed scope
- inline architecture brief for small/medium tasks

It does not skip @api-guardian for contracts, @validator for implementation
quality, or @tester for user-facing behavior that changed.

## Current Claude Code Platform Notes

Official Claude Code documentation and the v2.1.152 release notes now treat
skills, subagents, hooks, and plugins as first-class extension surfaces:

- subagents support richer frontmatter such as `model`, `permissionMode`,
  `skills`, `mcpServers`, `hooks`, `maxTurns`, `effort`, `background`, and
  `isolation`
- plugin subagents intentionally ignore `hooks`, `mcpServers`, and
  `permissionMode`; use standalone `.claude/agents/` definitions when those
  fields are required
- skills are plugin components under `skills/<name>/SKILL.md` and can use
  frontmatter to shape invocation and tool availability
- the v2.1.152 release added `/code-review --fix`, `disallowed-tools`
  frontmatter for skills and slash commands, `/reload-skills`, `SessionStart`
  skill reload and session-title outputs, `MessageDisplay`, plugin marketplace
  controls, fallback-model behavior, and auto mode without opt-in consent
- v2.1.149 added `/usage` category breakdowns for skills, subagents, plugins,
  and MCP cost drivers

Sources:

- https://github.com/anthropics/claude-code/releases
- https://code.claude.com/docs/en/changelog
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/plugins

## Ultracode / Max-Parallel (Dynamic Workflows)

Ultracode is the escalation path when a job outgrows a handful of plain subagents. It combines the `best`/Opus 4.8 orchestrator running at ultracode effort (`/model best` + `/effort ultracode`) with Claude Code's **dynamic workflow** engine.

**What dynamic workflows do:**

- The orchestrator writes and runs a script that fans work out across **tens to hundreds of parallel subagents**.
- **Adversarial verification:** agents try to refute each other's findings; the workflow iterates until answers converge, then returns only the verified result.
- Triggered by the word "workflow" in a prompt, or automatically when ultracode effort is active.
- Requires Claude Code v2.1.154+. Inspect active runs with `/workflows`.

**File-conflict isolation:**

- Use **worktrees** (separate git checkout per parallel session) to avoid conflicts when multiple subagents write overlapping files.
- Use **`/batch`** to split one large change into 5–30 worktree-isolated subagents that each open a separate PR.

**Cost guardrail:**

Parallel execution cuts wall-clock time by ~60–80% on independent work but **does not reduce token cost** — running many workers at once multiplies usage, and dynamic workflows can burn substantially more tokens than a normal session. **Smart Routing stays the default.** Ultracode / Max-Parallel is an **explicit, deliberate opt-in** for large or time-critical jobs.

See `skills/dynamic-workflows/` for the full escalation decision tree, adversarial verification protocol, concurrency caps, and cost tradeoff guidance.

## Promotion Rules

- Prototype output promotes to Full-Gates (Standard) before production.
- Departments Mode narrows back to Smart Routing once ownership is clear.
- Smart Routing can be combined with Full-Gates or Departments Mode, but
  it cannot override required safety gates.
- Agent Teams require explicit user approval because they increase token use.
