<div align="center">

# CC_GodMode

### *"What happens when an AI system is used to improve itself?"*

**You're looking at the answer.**

[![Version](https://img.shields.io/badge/Version-6.3.0-blue)](./CHANGELOG.md)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20%2B%20Skills-green)](./skills/)
[![Agents](https://img.shields.io/badge/Agents-8%20Specialists-purple)](./agents/)
[![Plugin](https://img.shields.io/badge/Plugin-Ready-orange)](./CLAUDE.md)
[![Self-Improving](https://img.shields.io/badge/Self--Improving-Yes%2C%20Really-red)](./CHANGELOG.md)

</div>

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

**CC_GodMode** transforms Claude Code into a self-orchestrating development team.

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

8 specialists. Each with their own expertise. Each knowing exactly what they do—and what they don't.

| Agent | Role | Specialty |
|:------|:-----|:----------|
| `@researcher` | Knowledge Discovery | Web research, documentation lookup, technology evaluation *(NEW v5.10.0)* |
| `@architect` | System Architect | High-level design, module structure, tech decisions |
| `@api-guardian` | API Lifecycle Expert | Breaking changes, consumer impact, contract validation |
| `@builder` | Senior Developer | Implementation, following @architect's specifications |
| `@validator` | Code Quality Gate | TypeScript, unit tests, security, consumer verification |
| `@tester` | UX Quality Gate | E2E tests, visual regression, accessibility, performance *(Enhanced v5.10.0)* |
| `@scribe` | Technical Writer | Documentation, changelog, version management |
| `@github-manager` | GitHub Manager | Issues, PRs, releases, CI/CD orchestration |

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

## The Architecture (v6.3)

**v6.0 introduced modular architecture. v6.1 added Skills. v6.2 added worktree isolation. v6.3 added Plugin packaging.**

```
~/.claude/                          ← RUNTIME (What Claude loads)
├── agents/                         ← 8 agents, globally available
│   ├── researcher.md
│   ├── architect.md
│   ├── api-guardian.md
│   ├── builder.md
│   ├── validator.md
│   ├── tester.md
│   ├── scribe.md
│   └── github-manager.md
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
│       ├── architect.md                    ├── architect.md          │
│       ├── builder.md                      ├── builder.md            │
│       ├── validator.md                    ├── validator.md          │
│       └── ...                             └── ...                   │
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

**Research Task (NEW v5.10.0):**
```
@researcher → report with sources
```

*\* @researcher is optional - use when new tech/library research is needed*

**Note:** Since v5.6.0, quality gates run in PARALLEL (∥ symbol) for 40% faster validation.

**Release:**
```
@scribe → @github-manager
```

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

## Installation

### One-Shot Install (Recommended)

> One prompt. Claude installs everything.

**Step 1:** Start Claude with permissions:
```bash
claude --dangerously-skip-permissions
```

**Step 2:** Copy the entire content from [`CC-GodMode-Prompts/CCGM_Prompt_Install.md`](./CC-GodMode-Prompts/CCGM_Prompt_Install.md) and paste it.

**Step 3:** Watch. Claude will:
- Clone the repository
- Install 8 agents globally
- Set up hook scripts
- Install Memory MCP Server
- Configure and verify

**Why `--dangerously-skip-permissions`?** 30+ file operations. Without it, you'd confirm each one manually.

### Manual Install

See [`CC-GodMode-Prompts/CCGM_Prompt_ManualInstall.md`](./CC-GodMode-Prompts/CCGM_Prompt_ManualInstall.md) for step-by-step instructions.

---

## Prompt Files

CC_GodMode includes ready-to-use prompts for different scenarios:

| Prompt File | Purpose | When to Use |
|-------------|---------|-------------|
| [`CCGM_Prompt_Install.md`](./CC-GodMode-Prompts/CCGM_Prompt_Install.md) | One-shot installation | First-time setup with `--dangerously-skip-permissions` |
| [`CCGM_Prompt_ManualInstall.md`](./CC-GodMode-Prompts/CCGM_Prompt_ManualInstall.md) | Step-by-step installation | When you prefer manual control |
| [`CCGM_Prompt_ProjectSetup.md`](./CC-GodMode-Prompts/CCGM_Prompt_ProjectSetup.md) | Inject orchestrator into project | Adding CC_GodMode to existing project's CLAUDE.md |
| [`CCGM_Prompt_Restart.md`](./CC-GodMode-Prompts/CCGM_Prompt_Restart.md) | **CRITICAL** Context recovery | After `/compact`, long sessions, or **every fresh session** |

### When to Use Which Prompt

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PROMPT DECISION TREE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Is CC_GodMode installed globally (~/.claude/)?                             │
│     │                                                                       │
│     ├── NO → Use CCGM_Prompt_Install.md (one-time setup)                   │
│     │                                                                       │
│     └── YES → Does your project have CLAUDE.md?                            │
│                  │                                                          │
│                  ├── NO → Copy CCGM_Prompt_ProjectSetup.md into CLAUDE.md  │
│                  │                                                          │
│                  └── YES → Is this a fresh/new session?                    │
│                              │                                              │
│                              └── YES → Use CCGM_Prompt_Restart.md          │
│                                        (CRITICAL - Do this EVERY TIME!)    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### CRITICAL: The Restart Prompt

**Why is `CCGM_Prompt_Restart.md` so important?**

Claude Code does NOT automatically remember orchestrator mode between sessions. Even if:
- CC_GodMode is installed globally
- Your project has CLAUDE.md configured
- Everything worked perfectly yesterday

**You MUST use the Restart Prompt when:**
1. Starting a **new/fresh Claude Code session**
2. After using **`/compact`** (context summarization)
3. After **long sessions** where Claude seems to "forget"
4. When Claude **starts implementing instead of delegating**

**Signs you need the Restart Prompt:**
- Claude writes code instead of calling agents
- Claude forgets to call @api-guardian for API changes
- Claude skips quality gates (@validator or @tester)
- Claude pushes without asking permission

### Quick Reference

| Scenario | Action |
|----------|--------|
| **First time ever** | `CCGM_Prompt_Install.md` |
| **New project (CC_GodMode already installed)** | Copy `CCGM_Prompt_ProjectSetup.md` into CLAUDE.md |
| **Every new session** | Paste `CCGM_Prompt_Restart.md` |
| **After /compact** | Paste `CCGM_Prompt_Restart.md` |
| **Claude seems confused** | Paste `CCGM_Prompt_Restart.md` |

**TL;DR:** Install once, restart every session.

---

## Activate in Your Project

After installation, for each project:

**macOS / Linux:**
```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
claude
```

**Windows:**
```powershell
cd your-project
Copy-Item "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" ".\CLAUDE.md"
claude
```

The CLAUDE.md is auto-loaded. Orchestrator mode is active.

---

## MCP Servers

Enhanced capabilities through Model Context Protocol:

| Server | Agent | Purpose | Required? |
|:-------|:------|:--------|:-----------|
| **memory** | @researcher, @architect, @scribe | Persistent knowledge | ✅ Installed |
| **playwright** | @tester | Browser automation, E2E, **screenshots** | Recommended |
| **github** | @github-manager | Issues, PRs, Releases | Recommended |
| **lighthouse** | @tester | Performance audits | Optional |
| **a11y** | @tester | Accessibility testing | Optional |

```bash
# Install recommended MCPs
claude mcp add playwright -- npx @playwright/mcp@latest
claude mcp add lighthouse -- npx lighthouse-mcp
claude mcp add a11y -- npx a11y-mcp

# GitHub MCP (requires token)
export GITHUB_TOKEN="your_token"
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
  ghcr.io/github/github-mcp-server
```

---

## The Rules

1. **Version-First** — Determine version BEFORE any work starts
2. **@researcher for Unknown Tech** — Use when new technologies need evaluation *(NEW v5.10.0)*
3. **@architect is the Gate** — No feature starts without design
4. **@api-guardian is MANDATORY** — For any API change
5. **Dual Quality Gates** — Both @validator AND @tester must pass
6. **@tester MUST create Screenshots** — Every page tested at 3 viewports *(NEW v5.10.0)*
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

### Policy Documents (NEW in v5.7.0)
- **[REPORT_TEMPLATES.md](./docs/templates/REPORT_TEMPLATES.md)** - Standardized formats for all 7 agents
- **[CONTEXT_SCOPE_POLICY.md](./docs/policies/CONTEXT_SCOPE_POLICY.md)** - Agent boundaries and responsibilities
- **[SECURITY_TOOLING_POLICY.md](./docs/policies/SECURITY_TOOLING_POLICY.md)** - Tool access control matrix

These documents transform implicit knowledge into explicit contracts, making the system more maintainable and predictable.

---

## Context Recovery

Claude Code's `/compact` can cause memory loss. When the orchestrator starts implementing instead of delegating:

1. Open [`CC-GodMode-Prompts/CCGM_Prompt_Restart.md`](./CC-GodMode-Prompts/CCGM_Prompt_Restart.md)
2. Copy the restart prompt
3. Paste into chat
4. Orchestrator mode restored

**Signs you need restart:**
- Claude writes code instead of calling agents
- Claude forgets @api-guardian for API changes
- Claude skips quality gates (@validator or @tester)
- Claude pushes without permission
- Claude writes reports to wrong folder (should be `reports/v[VERSION]/`)

---

## FAQ

**Q: Why 8 agents?**
A: Separation of concerns. Each agent has ONE job. No overlap. No confusion.

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

**CC_GodMode v6.3.0 — The Plugin Release**

- **v6.0:** Modular architecture — CLAUDE.md reduced from 688 to ~75 lines (-89%)
- **v6.1:** Skills Architecture — 7 on-demand SKILL.md files for progressive disclosure
- **v6.2:** Platform Features — Worktree isolation for parallel agents, Agent Teams support, TeammateIdle hook
- **v6.3:** Plugin Packaging — `plugin.json` manifest for one-command installation
- 8 specialized agents with model selection and worktree isolation
- Dual quality gates (parallel execution in isolated worktrees)
- 5 hook events (SessionStart, PostToolUse, SubagentStop, TaskCompleted, TeammateIdle)
- Version-first workflow with automated pre-push checks

See [CHANGELOG.md](./CHANGELOG.md) for the full story.

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