# CC_GodMode Workflow Modes

Updated: 2026-06-11

This document defines the mode layer above the CC_GodMode agent
workflow. Modes change orchestration behavior; they do not remove mandatory
safety rules unless the mode explicitly declares a local-only exception.

**v7.0.0 note:** Smart Routing is now the default. Each agent carries an `effort` field in its frontmatter (requires Claude Code ≥2.1.152) to tune token budgets: architect=high, builder/tester/api-guardian=medium, all others=low.

## Mode Summary

| Mode | Skill | Use when | Default posture |
| --- | --- | --- | --- |
| **Smart Routing** | `skills/cost-efficiency/` | **DEFAULT — all work not matching risk signals** | risk-based minimal-agent paths, inline arch brief |
| Full-Gates | `skills/workflows/` | high-risk work: new modules, API/breaking changes, security, release artifacts | full workflow and gates |
| Prototype | `skills/prototype-mode/` | local throwaway spikes | fast, watermarked, no push |
| Departments | `skills/departments/` | large cross-domain work | expanded planning and write scopes |
| Agent Teams | `skills/agent-teams/` | explicitly requested teammate-style parallelism | experimental and expensive |

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

## Promotion Rules

- Prototype output promotes to Full-Gates (Standard) before production.
- Departments Mode narrows back to Smart Routing once ownership is clear.
- Smart Routing can be combined with Full-Gates or Departments Mode, but
  it cannot override required safety gates.
- Agent Teams require explicit user approval because they increase token use.
