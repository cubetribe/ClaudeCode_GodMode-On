---
name: departments
description: "Expanded department-based orchestration for large cross-domain CC_GodMode work. Freezes ownership, handoffs, and write scopes before implementation."
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
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
| Runtime Platform | `config/`, hooks, MCP setup, install/runtime behavior | @architect, @builder |
| Workflow Design | `CLAUDE.md`, `skills/`, `docs/orchestrator/`, orchestration loops | @researcher, @architect |
| Workspace Governance | `VERSION`, `CHANGELOG.md`, `DECISIONS.md`, policies, templates | @architect, @scribe |
| Quality Operations | validation scripts, report templates, gate behavior | @tester, @security |
| Docs & Developer Experience | `README.md`, prompts, onboarding docs, examples | @scribe |
| CI & GitHub | PR/release framing, CI/CD, GitHub workflow surfaces | @github-manager |
| API & Contracts | API/type/schema/CLI/public contract surfaces | @api-guardian |

## Required Artifacts

Create or update these before implementation begins:

- intake brief: objective, non-goals, target version, expected validations
- department routing map: involved departments and dependency order
- write-scope matrix: which files each department owns or must not touch
- handoff checklist: what each department must report back

Reports should live under `reports/vX.Y.Z/sprint-NN/` and stay concise.

## Routing Rules

1. Run the normal governance and plan-first preflight (sprint file + write scopes, ADR-004).
2. Use @researcher only for unknown or version-sensitive facts.
3. Use @architect to freeze the department routing map and write-scope matrix.
4. Use @api-guardian whenever contracts, schemas, CLI, config, or public behavior change.
5. Keep @builder as the single implementation writer unless a temporary write lease is explicit.
6. Use the Core Rule 5 gate combination for this sprint (deterministic hook always;
   @tester if `ux_gate: auto`; @security on security surfaces; `/code-review` on
   risk or doubt) as the quality gate.
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

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
