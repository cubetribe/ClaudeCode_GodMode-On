---
name: departments
description: "Expanded department-based orchestration for large cross-domain CC_GodMode work. Freezes ownership, handoffs, and write scopes before implementation."
---

# Departments Mode

Use this skill when one linear workflow is too small for the task because the
work crosses multiple ownership areas. Departments Mode is the expanded
planning and coordination lane.

It does not replace the existing agents. It groups the existing agents and
project surfaces into departments, freezes write scopes, and then routes work
through the normal quality gates.

## When To Use

- runtime, hooks, skills, agents, docs, and release policy change together
- a task needs multiple independent research or validation tracks
- write ownership is unclear and must be frozen before @builder starts
- the work touches plugin packaging plus project templates
- the cost of one missed handoff is higher than the coordination overhead

## Department Map

| Department | Owns | Usual agent support |
| --- | --- | --- |
| Runtime Platform | `config/`, hooks, MCP setup, install/runtime behavior | @architect, @builder, @validator |
| Workflow Design | `CLAUDE.md`, `skills/`, `docs/orchestrator/`, orchestration loops | @researcher, @architect |
| Workspace Governance | `VERSION`, `CHANGELOG.md`, `DECISIONS.md`, policies, templates | @architect, @scribe |
| Quality Operations | validation scripts, report templates, gate behavior | @validator, @tester |
| Docs & Developer Experience | `README.md`, prompts, onboarding docs, examples | @scribe |
| CI & GitHub | PR/release framing, CI/CD, GitHub workflow surfaces | @github-manager |
| API & Contracts | API/type/schema/CLI/public contract surfaces | @api-guardian |

## Required Artifacts

Create or update these before implementation begins:

- intake brief: objective, non-goals, target version, expected validations
- department routing map: involved departments and dependency order
- write-scope matrix: which files each department owns or must not touch
- handoff checklist: what each department must report back

Reports should live under `reports/v[VERSION]/` and stay concise.

## Routing Rules

1. Run the normal governance and version-first preflight.
2. Use @researcher only for unknown or version-sensitive facts.
3. Use @architect to freeze the department routing map and write-scope matrix.
4. Use @api-guardian whenever contracts, schemas, CLI, config, or public behavior change.
5. Keep @builder as the single implementation writer unless a temporary write lease is explicit.
6. Use @validator and @tester as the joint quality gate.
7. Use @scribe only after quality gates pass.
8. Use @github-manager only for issue, PR, release, or GitHub surfaces.

## Agent Teams

Claude Code Agent Teams can inform this mode, but they are not the default.
Use Agent Teams only when the user explicitly asks for teammate-style parallel
execution and the work can be split into independent tasks with clear
dependencies. Otherwise, use normal Task-tool subagents and concise handoffs.

## Stop Conditions

Stop and ask the user before:

- changing branch strategy
- lowering model quality for critical paths
- touching production credentials or live services
- pushing, tagging, publishing, or deploying
- merging unrelated histories or importing a whole external repository
