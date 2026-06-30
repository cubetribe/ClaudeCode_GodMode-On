<div align="center">

# CC_GodMode

### *"What happens when an AI system is used to improve itself?"*

**You're looking at the answer.**

[![Version](https://img.shields.io/badge/Version-8.0.0-blue)](./CHANGELOG.md)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20%2B%20Skills-green)](./skills/)
[![Agents](https://img.shields.io/badge/Agents-8%20Core%20%2B%201%20Security%20%2B%206%20Dept-purple)](./agents/)
[![Plugin](https://img.shields.io/badge/Plugin-Ready-orange)](./CLAUDE.md)
[![Ultracode Ready](https://img.shields.io/badge/Ultracode-Ready-brightgreen)](./docs/AGENT_MODEL_SELECTION.md)
[![Self-Improving](https://img.shields.io/badge/Self--Improving-Yes%2C%20Really-red)](./CHANGELOG.md)

</div>

---

## The System That Builds Itself

Welcome to the machine shop. Except the machines are building themselves — and they're getting better at it.

**CC_GodMode v7.0.0 and v7.1.0 weren't built by hand.** They were planned, architected, implemented, validated, documented, and shipped by the exact agents defined in this repo. PRs [#22](https://github.com/cubetribe/ClaudeCode_GodMode-On/pull/22) and [#23](https://github.com/cubetribe/ClaudeCode_GodMode-On/pull/23) are proof. The orchestrator delegated to @architect for design, @builder for implementation, @validator and @tester for quality gates, and @scribe for documentation. Then it created the PR itself.

That's not marketing copy. That's what happened.

---

## Install in 30 Seconds

CC_GodMode is a Claude Code plugin that transforms your development workflow into a self-orchestrating multi-agent system. Here's how to set it up:

**macOS / Linux:**
```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
./scripts/apply-global-claude-setup.sh
./scripts/apply-global-claude-setup.sh --check   # Verify installation
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
.\scripts\apply-global-claude-setup.ps1
.\scripts\apply-global-claude-setup.ps1 -Check   # Verify installation
```

Then activate in any project:
```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
claude
```

Done. The orchestrator is active.

---

## Just Type GodMode

Once installed, daily usage is one line:

```
GodMode: New Feature: user authentication with JWT
GodMode: Bug Fix: cart total miscalculates with discount codes
GodMode: Research: best approach for real-time sync in React 18
```

No installation ceremony. After one-time setup, most sessions need nothing — the orchestrator loads from CLAUDE.md automatically. Use the ContextRestore prompt only after /compact or if the orchestrator loses its role.
You say what you want — the system figures out which agents to call, in what order, at what cost.

---

## What Changed in v7 — and Why

CC_GodMode v7.0.0 was redesigned around Opus 4.8, ultracode effort, and a parallel-first architecture — built on how modern Claude models actually work, not how earlier models needed to be prompted:

- **Persona prompts are gone.** "You are a Senior X with 15 years of experience" adds nothing on modern Claude models like Opus 4.8 — identity is now one line, the task description does the work.
- **Aggressive caps removed.** Extensive CRITICAL/MUST/NEVER scaffolding in older agents caused overtriggering. Per Anthropic's guidance, normal imperative phrasing is enough; hard safety rules (never push, api-guardian mandatory) keep their weight.
- **Effort fields instead of verbose instructions.** Each agent carries an `effort:` frontmatter field (Claude Code ≥2.1.152) that tunes token budgets automatically — no long preambles needed.
- **Smart Routing is now the default.** The old system always ran every agent. v7 runs only what the risk level requires — estimated 30–50% token reduction for standard features.
- **Verdict contract instead of report re-reading.** Agents return a structured 3-bullet STATUS verdict to the orchestrator. The full on-disk report exists for humans and for BLOCKED escalations.
- **Plugin-based install replaces copy-paste prompts as the primary path.** `.claude-plugin/plugin.json` is the modern distribution mechanism; the install prompts stay as a manual fallback.

---

## The Story

It started simple: One developer, mass sleep deprivation, and a vision.

**Phase 1:** Manual labor. Researching best practices. Reading docs. Testing prompts. Failing. Iterating. Building agent after agent. Workflow after workflow. Week after week.

**Phase 2:** The system works. 8 specialized AI agents orchestrating themselves. Features get built. Bugs get fixed. Documentation writes itself. *"This is pretty good,"* I thought.

**Phase 3:** January 6th, 2026. A thought: *"What if I use the system... to improve the system?"*

I gave it one prompt. The orchestrator delegated to the research team. Analyzed its own architecture. Found inefficiencies. Proposed improvements. Implemented them. Validated itself. Documented the changes.

**The loop closed.**

**Phase 4:** You're reading this README. An AI wrote parts of it. An AI will improve it. The experiment continues.

---

## What Is This?

**CC_GodMode** transforms Claude Code into a self-orchestrating multi-agent development team powered by the best / Claude Opus 4.8 orchestrator at ultracode effort, fanning work out across parallel Claude Code subagents for implementation, validation, and documentation.

**You say WHAT. The AI figures out HOW.**

```
You: "I need user authentication with JWT"

Orchestrator:
  → Analyzes request
  → Determines version (5.5.0)
  → Creates report folder
  → Delegates to @architect for design
  → Delegates to @api-guardian for API impact
  → Delegates to @builder for implementation
  → @validator checks code quality
  → @tester checks UX quality
  → @scribe documents everything
  → @github-manager creates PR

You: *drinks coffee*
```

The difference?

| Without CC_GodMode | With CC_GodMode |
|:---|:---|
| You: "Design the feature" | You: "Build Feature X" |
| You: "Now implement it" | ☕ |
| You: "Check the types" | ☕ |
| You: "Update the consumers" | ☕ |
| You: "Write the docs" | ☕ |
| You: "Did I forget something?" | AI: "Done. Here's the report." |

---

## The Agents

15 specialists (8 core + 1 security gate + 6 department). Each with their own expertise, model assignment, and effort tuning.

**Core agents** (8) — always available:

| Agent | Role | Specialty |
|:------|:-----|:----------|
| `@researcher` | Knowledge Discovery | Web research, documentation lookup, technology evaluation |
| `@architect` | System Architect | High-level design, module structure, tech decisions |
| `@api-guardian` | API Lifecycle Expert | Breaking changes, consumer impact, contract validation |
| `@builder` | Senior Developer | Implementation, following @architect's specifications |
| `@validator` | Code Quality Gate | TypeScript, unit tests, security, consumer verification |
| `@tester` | UX Quality Gate | E2E tests, visual regression, accessibility, performance |
| `@scribe` | Technical Writer | Documentation, changelog, version management |
| `@github-manager` | GitHub Manager | Issues, PRs, releases, CI/CD orchestration |

**Security gate** (1) — optional, activate for security-sensitive changes:

| Agent | Domain | Mode |
|:------|:-------|:-----|
| `@security` | Secrets, injection, auth/authz, crypto, dependencies | Read + Write (security-focused) |

**Department agents** (6) — optional, activate when their domain is in scope:

| Agent | Domain | Mode |
|:------|:-------|:-----|
| `@ci-security-guardian` | GitHub Actions, CODEOWNERS, Dependabot, security | Read + Write (GitHub surface only) |
| `@docs-dx` | Public docs, prompts, setup instructions, user-facing clarity | Read-only reviewer |
| `@quality-operations` | Validation scope, regression gates, eval-oriented checks | Read-only advisor |
| `@runtime-platform` | Toolchain, sandbox, environment constraints, OS behavior | Read-only + diagnostic Bash |
| `@workflow-design` | Orchestration design, skill boundaries, handoff artifacts | Read-only designer |
| `@workspace-governance` | AGENTS layering, repo rules, release law, change-scope policy | Read-only reviewer |

**Dual Quality Gates:**

```
                    @builder completes
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │ @validator  │                 │  @tester    │
    │ Code Quality│                 │ UX Quality  │
    ├─────────────┤                 ├─────────────┤
    │ ✓ TypeScript│                 │ ✓ E2E Tests │
    │ ✓ Unit Tests│                 │ ✓ Visuals   │
    │ ✓ Security  │                 │ ✓ A11y      │
    │ ✓ Consumers │                 │ ✓ Perf      │
    └──────┬──────┘                 └──────┬──────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                   Both gates passed?
                   → Continue to @scribe
```

---

## Ultracode & Parallel-First

CC_GodMode v8.0.0 runs on a **parallel-first, ultracode orchestrator** with model-tiered Claude Code subagents (haiku for simple ops, sonnet for implementation, opus for architecture) and effort-field budget tuning.

**How it works:**
- **The orchestrator (best / Opus 4.8 at ultracode)** — classifies risk, writes inline architecture briefs, fans work out across parallel subagents, and reads only what it needs.
- **Parallel fan-out by default** — when a request decomposes into independent units (multi-file edits, multi-domain work, audits, migrations), the orchestrator spawns parallel subagents in a single message rather than sequentially, then collects and synthesizes their verdicts.
- **Dynamic-workflows escalation** — when a job outgrows ~10 concurrent subagents (codebase-wide audits, large migrations, cross-checked research), the orchestrator escalates to dynamic workflows (`/workflows` or ultracode) with adversarial verification across tens-to-hundreds of subagents.
- **Subagents stay cheap** — builder/validator/tester on sonnet, scribe/researcher/github-manager on haiku, architect on opus only when genuinely needed.
- **Effort fields** — each agent's `effort` frontmatter field (Claude Code ≥2.1.152) tunes token budgets automatically: architect=high, builder/tester/api-guardian=medium, all others=low.
- **Smart Routing default** — risk-based minimal-agent paths replace the old "always Full-Gates" default, estimated 30–50% token reduction per standard feature vs. the previous always-Full-Gates default (based on per-workflow cost models in docs/AGENT_MODEL_SELECTION.md).
- **Full-Gates on demand** — API/schema changes, security surfaces, release artifacts, new modules, and breaking changes automatically escalate to the full agent sequence.
- **Cost guardrail** — parallel = faster, not cheaper; dynamic workflows multiply token spend. Smart Routing stays the default; max-parallel / dynamic-workflows is an explicit, deliberate opt-in for big or time-critical jobs.

**Token efficiency per workflow type:**
| Workflow | Smart Routing | Full-Gates |
|:---------|:-------------|:-----------|
| Simple bug fix | @builder + scoped gates | all agents |
| Docs-only | @scribe only | — |
| Standard feature | inline brief + @builder + scoped gates | @architect + full sequence |
| API change | always Full-Gates (mandatory @api-guardian) | always Full-Gates |

---

## The Architecture (v7.0)

**v6.0 modular architecture. v6.1 Skills. v6.2 worktree isolation. v6.3 Plugin packaging. v6.4 Workflow Modes. v7.0 orchestrator tuning + Smart Routing default. v7.1 @security gate + installer scripts → 15 agents. v8.0 Ultracode orchestrator + parallel-first architecture.**

```
~/.claude/                          ← RUNTIME (What Claude loads)
├── agents/                         ← 15 agents (8 core + 1 security gate + 6 department), globally available
│   ├── researcher.md               ← haiku, effort: low
│   ├── architect.md                ← opus, effort: high
│   ├── api-guardian.md             ← sonnet, effort: medium
│   ├── builder.md                  ← sonnet, effort: medium
│   ├── validator.md                ← sonnet, effort: low
│   ├── tester.md                   ← sonnet, effort: medium
│   ├── scribe.md                   ← haiku, effort: low
│   ├── github-manager.md           ← haiku, effort: low
│   ├── ci-security-guardian.md     ← sonnet, effort: low (dept.)
│   ├── docs-dx.md                  ← sonnet, effort: low (dept.)
│   ├── quality-operations.md       ← sonnet, effort: low (dept.)
│   ├── runtime-platform.md         ← sonnet, effort: low (dept.)
│   ├── workflow-design.md          ← sonnet, effort: low (dept.)
│   └── workspace-governance.md     ← sonnet, effort: low (dept.)
├── scripts/                        ← Hook scripts
│   ├── session-start.js
│   ├── validate-agent-output.js
│   └── check-api-impact.js
└── settings.json                   ← Hooks (SessionStart, PostToolUse,
                                       SubagentStop, TaskCompleted)
```

```
your-project/                       ← YOUR PROJECT
├── CLAUDE.md                       ← Orchestrator (~65 lines, auto-loaded!)
├── VERSION                         ← Single source of truth
├── CHANGELOG.md                    ← Version history
├── docs/orchestrator/              ← NEW v6.0: Modular reference docs
│   ├── AGENTS.md                   ← Agent registry & handoff matrix
│   ├── WORKFLOWS.md                ← All 7 workflow definitions
│   ├── MODES.md                    ← Smart Routing, Prototype, Departments, Cost-Efficiency
│   ├── QUALITY-GATES.md            ← Parallel gate orchestration
│   ├── VERSIONING.md               ← Version-first & pre-push rules
│   └── META-DECISIONS.md           ← Meta-logic, ADR, RARE, escalation
├── reports/                        ← Agent outputs (gitignored)
│   └── vX.X.X/                     ← Grouped by version
└── .playwright-mcp/                ← Screenshot output
```

**The trick:** `CLAUDE.md` is automatically loaded by Claude Code. The 65 lines contain core rules. Detailed docs load on-demand — less context waste, more focus.

---

## Agent Architecture

CC_GodMode uses a **dual-location model** for agents:

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AGENT DUAL-LOCATION MODEL                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   GitHub Repository                    Your System                   │
│   ════════════════                    ════════════                   │
│                                                                      │
│   CC_GodMode/                         ~/.claude/                     │
│   └── agents/           ──INSTALL──►  └── agents/                   │
│       ├── architect.md  (15 files)        ├── architect.md          │
│       ├── builder.md                      ├── builder.md            │
│       ├── validator.md                    ├── validator.md          │
│       ├── ...8 core...                    ├── ...8 core...          │
│       └── ...6 dept...                    └── ...6 dept...          │
│                                                                      │
│   📦 SOURCE                            🚀 RUNTIME                    │
│   • Version controlled                 • Actually loaded by Claude   │
│   • Templates for Git                  • System-wide available       │
│   • Update here, reinstall             • Used during workflows       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Why this design?**
- **Source** (`/agents/`): Tracked in Git, shareable, updatable
- **Runtime** (`~/.claude/agents/`): Where Claude Code actually looks for agents

**Update flow:**
1. Modify agent in `/agents/` (source)
2. Run installation script
3. Changes copied to `~/.claude/agents/` (runtime)
4. Claude Code uses updated agents

---

## The Workflows

The Orchestrator selects the right workflow automatically:

**New Feature:**
```
(@researcher)* → @architect → @builder → (@validator ∥ @tester) → @scribe
```

**Bug Fix:**
```
@builder → (@validator ∥ @tester)
```

**API Change (Critical!):**
```
(@researcher)* → @architect → @api-guardian → @builder → (@validator ∥ @tester) → @scribe
```

**Refactoring:**
```
@architect → @builder → (@validator ∥ @tester)
```

**Research Task:**
```
@researcher → report with sources
```

*\* @researcher is optional - use when new tech/library research is needed*

**Note:** Quality gates run in PARALLEL (∥ symbol) for faster validation.

**Release:**
```
@scribe → @github-manager
```

## Workflow Modes

v7.0 inverts routing: Smart Routing is now the default, Full-Gates is the explicit escalation path for high-risk work.

| Mode | Skill | Purpose |
|:-----|:------|:--------|
| **Smart Routing (default)** | `skills/cost-efficiency/` | Risk-based minimal-agent paths, inline arch brief for small/medium tasks |
| Full-Gates | `skills/workflows/` | High-risk work: new modules, API/breaking changes, security, release artifacts |
| Prototype | `skills/prototype-mode/` | Local-only spikes with `PROTOTYPE ONLY` watermarks and a migration checklist |
| Departments | `skills/departments/` | Expanded cross-domain orchestration with frozen ownership and write scopes |
| Agent Teams | `skills/agent-teams/` | Experimental teammate-style parallelism when explicitly requested |

Prototype Mode is the only mode that intentionally skips production gates. It
must not be pushed, deployed, or connected to production systems. Promotion
always goes back through the Full-Gates workflow.

---

## The Hook

The secret ingredient: A PostToolUse hook that runs after every file change.

```
Developer changes: shared/types/User.ts
                          │
                          ▼
              ┌───────────────────────┐
              │  check-api-impact.js  │  ← AUTOMATICALLY
              │                       │
              │  • Detects API change │
              │  • Analyzes diff      │
              │  • Finds consumers    │
              │  • Warns about breaks │
              └───────────────────────┘
                          │
                          ▼
╔═══════════════════════════════════════════════════════════╗
║  ⚠️  API/TYPE FILE CHANGE DETECTED                         ║
║                                                            ║
║  📁 File: shared/types/User.ts                             ║
║  🔴 BREAKING: Removed field 'email'                        ║
║  📍 5 consumers found                                      ║
║                                                            ║
║  ⚡ @api-guardian MUST be called!                          ║
╚═══════════════════════════════════════════════════════════╝
```

Nothing gets forgotten. The hook remembers for you.

---

## Recommended MCP Servers

Enhanced capabilities through Model Context Protocol (installed in the setup script, but optional):

```bash
# Memory (recommended for agents)
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory

# Browser automation & screenshots (required for @tester)
claude mcp add playwright -- npx @playwright/mcp@latest

# GitHub (recommended for @github-manager)
export GITHUB_TOKEN="your_token"
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
  ghcr.io/github/github-mcp-server

# Performance audits (optional)
claude mcp add lighthouse -- npx lighthouse-mcp

# Accessibility testing (optional)
claude mcp add a11y -- npx a11y-mcp
```

---

## Backup Install Methods (Fallback)

If the script doesn't work on your system, you have fallback options:

**Manual prompt install (guided, copy-paste):**
1. [`CCGM_Prompt_01-SystemInstall-Auto.md`](./CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md) — One-shot automated (requires `--dangerously-skip-permissions`)
2. [`CCGM_Prompt_01-SystemInstall-Manual.md`](./CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md) — Step-by-step (manual control)

For updates and troubleshooting:
- [`CCGM_Prompt_98-Maintenance.md`](./CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md) — Pull agent and skill improvements
- [`CCGM_Prompt_99-ContextRestore.md`](./CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md) — Restore orchestrator after `/compact`

**When you need context recovery:**

The orchestrator is active when `CLAUDE.md` is present. Use the context-restore prompt if:
- Claude writes code instead of delegating
- Claude forgets to call @api-guardian for API changes
- Claude skips quality gates
- Claude tries to push without permission

Otherwise, just type `GodMode: <your request>`.

---

## The Rules

1. **Version-First** — Determine version BEFORE any work starts
2. **Smart Routing default** — Risk-based routing; Full-Gates for high-risk signals
3. **Architecture gate (split)** — Inline brief for small/medium; @architect (Opus) for new modules/breaking changes
4. **@api-guardian is MANDATORY** — For any API/schema/type change (enforced by hook)
5. **Dual Quality Gates** — Both @validator AND @tester must pass (parallel execution)
6. **@tester MUST create Screenshots** — Every page tested at 3 viewports
7. **No Skipping** — Every agent in workflow executes
8. **Reports in reports/vX.X.X/** — Organized by version
9. **NEVER push without permission** — Applies to ALL agents

---

## Documentation

CC_GodMode includes comprehensive documentation for understanding and extending the system:

### Core Documentation
- **[CHANGELOG.md](./CHANGELOG.md)** - Full version history and evolution of the system
- **[AGENT_ARCHITECTURE.md](./docs/AGENT_ARCHITECTURE.md)** - Understanding the dual-location model
- **[AGENT_MODEL_SELECTION.md](./docs/AGENT_MODEL_SELECTION.md)** - Cost optimization and ROI analysis
- **[MODES.md](./docs/orchestrator/MODES.md)** - Smart Routing (default), Full-Gates, Prototype, Departments, Agent Teams, and Cost-Efficiency routing

### Policy Documents
- **[REPORT_TEMPLATES.md](./docs/templates/REPORT_TEMPLATES.md)** - Standardized formats for all 15 agents
- **[CONTEXT_SCOPE_POLICY.md](./docs/policies/CONTEXT_SCOPE_POLICY.md)** - Agent boundaries and responsibilities
- **[SECURITY_TOOLING_POLICY.md](./docs/policies/SECURITY_TOOLING_POLICY.md)** - Tool access control matrix

These documents transform implicit knowledge into explicit contracts, making the system more maintainable and predictable.


## FAQ

**Q: Why 15 agents?**
A: 8 core agents cover the standard workflow. 1 optional @security gate activates for security-sensitive changes. 6 optional department agents activate only when their domain is in scope — CI/security, docs, quality ops, platform, workflow design, governance. Separation of concerns: each agent has ONE job.

**Q: What's the difference between @validator and @tester?**
A: @validator = code quality (TypeScript, tests, security). @tester = UX quality (E2E, visual, a11y, perf).

**Q: Can I skip @tester?**
A: For backend-only changes, yes. For anything UI-related, no.

**Q: Can agents push without your permission?**
A: No. "NEVER git push without permission" is enforced across all agents.

**Q: Is this just... AI improving AI?**
A: Yes. That's the unsettling part. And the fascinating part. Same thing, really.

---

## The Meta

This README was partly written by an AI.
The system that wrote it will improve it.
The loop continues.

---

## Version

**CC_GodMode v8.0.0 — The Ultracode Release**

Latest releases:
- **v8.0.0:** Ultracode orchestrator (best / Opus 4.8 at ultracode), parallel-first architecture, new dynamic-workflows skill + Ultracode/Max-Parallel mode, branding migrated to Opus/ultracode
- **v7.1.1:** README overhaul, self-improving narrative, consolidated install quickstart, improved docs structure
- **v7.1.0:** Installer/verifier scripts, @security gate agent, greenfield-bootstrap skill, dependabot + CODEOWNERS
- **v7.0.0:** Orchestrator tuning + Smart Routing default, 15 agents (8 core + 1 security + 6 dept), effort fields, verdict contract

What's in the box:
- **15 agents** (8 core + 1 security gate + 6 department) with effort-field budget tuning
- **12 skills** for workflows, quality gates, release, research, API changes, modes, teams, and bootstrap
- **Dual quality gates** (parallel execution for speed)
- **Smart Routing by default** (30–50% token savings vs. old always-Full-Gates)
- **Full-Gates escalation** for high-risk work: API/schema changes, security, release artifacts, new modules
- **Version-first workflow** with automated checks

See [CHANGELOG.md](./CHANGELOG.md) for the full history.

---

## Credits

**Dennis Westermann** ([www.dennis-westermann.de](https://www.dennis-westermann.de))
*Years of suffering, distilled into this repo. Now the repo improves itself. Was it worth it?*

---

## License

**Proprietary License** — Private use permitted. Commercial use requires permission.

Copyright (c) 2025 Dennis Westermann

---

<div align="center">

**Made with mass sleep deprivation**

*The experiment continues.*

⭐ Star if you're not too unsettled ⭐

</div>
