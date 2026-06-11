# CC_GodMode Agents

## Agent Registry

All agents are installed globally in `~/.claude/agents/` and available system-wide.

**DO NOT create local agent files!** Call agents via the **Task tool** with `subagent_type`:

### Core Agents (8)

| Agent | subagent_type | Role | MCP-Server | Model |
|-------|---------------|------|------------|-------|
| @researcher | `"researcher"` | Knowledge Discovery & Web Research | memory | haiku |
| @architect | `"architect"` | System Design & High-Level Architecture | memory | opus |
| @api-guardian | `"api-guardian"` | API Lifecycle & Breaking Change Detection | memory | sonnet |
| @builder | `"builder"` | Code Implementation | – | sonnet |
| @validator | `"validator"` | Code Quality Gate | – | sonnet |
| @tester | `"tester"` | UX Quality Gate (Screenshots, E2E) | Playwright, Lighthouse, A11y | sonnet |
| @scribe | `"scribe"` | Documentation & Changelog | memory | haiku |
| @github-manager | `"github-manager"` | Issues, PRs, Releases, CI/CD | GitHub | haiku |

### Optional Security Gate (1)

| Agent | subagent_type | Role | MCP-Server | Model |
|-------|---------------|------|------------|-------|
| @security | `"security"` | Security Quality Gate (secrets, injection, authz, deps) | – | opus |

Activate @security when a change touches auth, secrets/credentials, user input handling,
crypto, file/path access, or external integrations. Runs in parallel with @validator and
@tester after @builder.

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
| @builder | @architect, @api-guardian | @validator AND @tester (+@security if security-sensitive), PARALLEL |
| @validator | @builder | SYNC POINT (waits for other gates) |
| @tester | @builder | SYNC POINT (waits for other gates) |
| @security | @builder, @api-guardian | SYNC POINT (waits for other gates); BLOCK → @builder |
| @scribe | @validator + @tester (+@security) all approved | @github-manager (for release) |
| @github-manager | @scribe, @tester, User | Done |
