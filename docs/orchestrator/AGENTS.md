# CC_GodMode Agents

## Agent Registry

All 8 agents are installed globally in `~/.claude/agents/` and available system-wide.

**DO NOT create local agent files!** Call agents via the **Task tool** with `subagent_type`:

| Agent | subagent_type | Role | MCP-Server | Model |
|-------|---------------|------|------------|-------|
| @researcher | `"researcher"` | Knowledge Discovery & Web Research | memory | haiku |
| @architect | `"architect"` | System Design & High-Level Architecture | memory | opus |
| @api-guardian | `"api-guardian"` | API Lifecycle & Breaking Change Detection | memory | sonnet |
| @builder | `"builder"` | Code Implementation | – | sonnet |
| @validator | `"validator"` | Code Quality Gate | – | sonnet |
| @tester | `"tester"` | UX Quality Gate (Screenshots, E2E) | Playwright, Lighthouse, A11y | sonnet |
| @scribe | `"scribe"` | Documentation & Changelog | memory | sonnet |
| @github-manager | `"github-manager"` | Issues, PRs, Releases, CI/CD | GitHub | haiku |

## Handoff Matrix

| Agent | Receives from | Passes to |
|-------|---------------|----------|
| @researcher | User/Orchestrator | @architect (optional research phase) |
| @architect | User/Orchestrator/@researcher | @api-guardian or @builder |
| @api-guardian | @architect | @builder |
| @builder | @architect, @api-guardian | @validator AND @tester (PARALLEL) |
| @validator | @builder | SYNC POINT (waits for @tester) |
| @tester | @builder | SYNC POINT (waits for @validator) |
| @scribe | @validator + @tester (both approved) | @github-manager (for release) |
| @github-manager | @scribe, @tester, User | Done |
