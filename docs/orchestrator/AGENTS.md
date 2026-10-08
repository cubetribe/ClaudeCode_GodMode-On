# CC_GodMode Agents

## Agent Registry

All agents are installed globally in `~/.claude/agents/` and available system-wide.

**DO NOT create local agent files!** Call agents via the **Task tool** with `subagent_type`:

### Core Agents (7)

@validator no longer exists as a standing agent. It was split per Core Rule 5:
its deterministic part (typecheck, lint, tests, build) runs as a hook after
@builder — a compiler result is a fact, not a second opinion, and it costs no
context when it passes. Its judgment part (code review) is pulled on demand via
the native `/code-review` skill instead of a standing agent re-reading the same
diff.

| Agent | subagent_type | Role | MCP-Server | Model |
|-------|---------------|------|------------|-------|
| @researcher | `"researcher"` | Knowledge Discovery & Web Research | memory | haiku |
| @architect | `"architect"` | System Design & High-Level Architecture | memory | opus |
| @api-guardian | `"api-guardian"` | API Lifecycle & Breaking Change Detection | memory | sonnet |
| @builder | `"builder"` | Code Implementation | – | sonnet |
| @tester | `"tester"` | UX Quality Gate (Screenshots, E2E) — runs only when the sprint declared `ux_gate: auto` | Playwright, Lighthouse, A11y | sonnet |
| @scribe | `"scribe"` | Documentation & Changelog | memory | haiku |
| @github-manager | `"github-manager"` | Issues, PRs, Releases, CI/CD | GitHub | haiku |

### Optional Security Gate (1)

| Agent | subagent_type | Role | MCP-Server | Model |
|-------|---------------|------|------------|-------|
| @security | `"security"` | Security Quality Gate (secrets, injection, authz, deps) | – | opus |

Activate @security when a change touches auth, secrets/credentials, user input handling,
crypto, file/path access, or external integrations. It is an optional gate on security
surfaces, with the same routing as the other post-@builder gates (Core Rule 5,
`docs/orchestrator/QUALITY-GATES.md`): runs in parallel with @tester and `/code-review`
where they apply, and a BLOCKED verdict routes back to @builder.

### Department Agents (6, optional — activate when domain is in scope)

| Agent | subagent_type | Role | Model |
|-------|---------------|------|-------|
| @ci-security-guardian | `"ci-security-guardian"` | GitHub Actions, CODEOWNERS, Dependabot, security | sonnet |
| @docs-dx | `"docs-dx"` | Public docs, prompts, setup instructions | sonnet |
| @quality-operations | `"quality-operations"` | Validation scope, regression gates | sonnet |
| @runtime-platform | `"runtime-platform"` | Toolchain, sandbox, environment constraints | sonnet |
| @workflow-design | `"workflow-design"` | Orchestration design, skill boundaries | sonnet |
| @workspace-governance | `"workspace-governance"` | AGENTS layering, repo rules, release law | sonnet |

## Handoff Matrix

| Agent | Receives from | Passes to |
|-------|---------------|----------|
| @researcher | User/Orchestrator | @architect (optional research phase) |
| @architect | User/Orchestrator/@researcher | @api-guardian or @builder |
| @api-guardian | @architect | @builder |
| @builder | @architect, @api-guardian | deterministic hook (always), then whichever of @tester (if `ux_gate: auto`), @security (if security-sensitive), `/code-review` (if risk/doubt) apply, PARALLEL |
| @tester | @builder | SYNC POINT (waits for other gates) |
| @security | @builder, @api-guardian | SYNC POINT (waits for other gates); BLOCK → @builder |
| @scribe | hook + all gates that ran, all approved | @github-manager (for release) |
| @github-manager | @scribe, @tester, User | Done |
| @ci-security-guardian | Orchestrator (CI/security surface in scope) | @builder (implements specified workflows) |
| @docs-dx | Orchestrator (docs in acceptance criteria) | @scribe |
| @quality-operations | Orchestrator (test-plan / gate scoping) | Orchestrator (informs which checks run) |
| @runtime-platform | Orchestrator (environment/toolchain concerns) | @builder / Orchestrator |
| @workflow-design | Orchestrator (orchestration/skill changes) | Orchestrator |
| @workspace-governance | Orchestrator (release prep, governance review) | @scribe |

Department agents are advisory (report-only) and return the same STATUS verdict as core agents
(`docs/templates/REPORT_TEMPLATES.md`).


---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
