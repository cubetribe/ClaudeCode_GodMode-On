# CC_GodMode 🚀⚡

> **Years of trial, error, and mass prompt engineering - distilled into one glorious package.**

[![Version](https://img.shields.io/badge/Version-3.1.0-blue)](./CHANGELOG.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Subagents](https://img.shields.io/badge/Subagents-7%20Specialists-green)](./agents/)
[![YOLO Mode](https://img.shields.io/badge/YOLO%20Mode-Available-red)](./INSTALLATION.md)
[![MCP Servers](https://img.shields.io/badge/MCP%20Servers-4%20Integrated-purple)](./INSTALLATION.md#-mcp-server-installation)
[![Playwright](https://img.shields.io/badge/Playwright-E2E%20Testing-orange)](https://github.com/microsoft/playwright-mcp)

> **Version 3.1.0** - GitHub Issue Workflow + 7-Agent System | [See CHANGELOG](./CHANGELOG.md)

---

## What is CC_GodMode? 🤔

**CC_GodMode** transforms your AI coding setup into a self-orchestrating machine.

### The Problem

You tell your AI assistant "Build feature X" and then... chaos:
- You have to trigger every step manually
- You forget to update API consumers
- Documentation falls behind
- TypeScript screams, tests cry, tech lead gives you the look

### The Solution

With CC_GodMode you give **one single prompt** - and everything else runs automatically:

```
You: "I need user authentication with JWT"

AI (now Orchestrator):
  → Calls @architect for high-level design
  → Calls @api-guardian for API impact analysis
  → Calls @builder for implementation
  → Calls @validator for code quality checks
  → Calls @tester for UX quality checks
  → Calls @scribe for documentation
  → Calls @github-manager to create PR and release
  → Hooks automatically warn about API changes

You: *drinks coffee*
```

**You say WHAT. The AI decides HOW and delegates autonomously.**

---

## How does it work? 🧠

### The Orchestrator Loop

```
┌─────────────────────────────────────────────────────────────┐
│                        YOU                                   │
│                   "Build Feature X"                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              🤖 AI BECOMES THE ORCHESTRATOR                  │
│                                                              │
│   "Ok, for this feature I need..."                          │
│                                                              │
│   1. @architect for high-level design                       │
│   2. @api-guardian for API contracts (if API changes)       │
│   3. @builder for implementation                            │
│   4. @validator for quality checks                          │
│   5. @scribe for documentation                              │
│   6. @github-manager for Issues, PRs, Releases              │
│                                                              │
│   "Starting the workflow now..."                            │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
   @architect         @api-guardian        @builder
   (Subagent)          (Subagent)         (Subagent)
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
                            ▼
                       @validator
                       (Subagent)
                            │
                            ▼
                        @tester
                       (Subagent)
                            │
                    ┌───────┴───────┐
                    ▼               ▼
                @scribe      @github-manager
               (Subagent)      (Subagent)
                    │               │
                    └───────┬───────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                 🪝 HOOKS RUN AUTOMATICALLY                   │
│                                                              │
│   On every file change:                                     │
│   → check-api-impact.js detects API changes                 │
│   → Analyzes breaking changes                               │
│   → Finds affected consumers                                │
│   → Triggers @api-guardian workflow                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                        YOU                                   │
│               "Feature is done. Nice."                       │
└─────────────────────────────────────────────────────────────┘
```

### The Difference to Normal Prompting

| Without CC_GodMode | With CC_GodMode |
|--------------------|-----------------|
| You: "Design the feature" | You: "Build Feature X" |
| You: "Now implement it" | ☕ |
| You: "Check the types" | ☕ |
| You: "Update the consumers" | ☕ |
| You: "Write the docs" | ☕ |
| You: "Did I forget something?" | AI: "Done. Here's the report." |

---

## The Subagents 🤖

The Orchestrator has 7 specialized subagents at its disposal:

| Agent | Role | Called for | MCP Required |
|-------|------|------------|--------------|
| `@architect` | Senior Software Architect | High-level design, module structure, tech decisions | - |
| `@api-guardian` | API Lifecycle Expert | API contracts, breaking changes, consumer impact analysis | - |
| `@builder` | Senior Full-Stack Developer | Code implementation, tests | - |
| `@validator` | Code Quality Engineer | TypeScript, unit tests, security checks | - |
| `@tester` | UX Quality Engineer | E2E tests, visual regression, a11y, performance | Playwright |
| `@scribe` | Technical Writer | Documentation, changelog, API registry | - |
| `@github-manager` | GitHub Project Manager | Issues, PRs, Releases, CI/CD | GitHub |

Each agent has:
- **Own personality** and expertise
- **Specific tools** it's allowed to use
- **Clear responsibilities** (no overlap!)
- **Output formats** for structured reports
- **Explicit "What I do NOT do"** section

### Agent Workflow

```
@architect → High-level design
    ↓
@api-guardian → API impact analysis (if API changes)
    ↓
@builder → Implementation
    ↓
@validator → Code quality gate (TypeScript, unit tests, security)
    ↓
@tester → UX quality gate (E2E, visual, a11y, performance)
    ↓
@scribe → Documentation
    ↓
@github-manager → PR/Release (if needed)
```

### Dual Quality Gates (NEW in v3.0!)

```
┌─────────────────────────────────────────────────────────────┐
│                    QUALITY GATES                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  @validator (Code Quality)        @tester (UX Quality)       │
│  ─────────────────────────        ────────────────────       │
│  ✓ TypeScript compiles            ✓ E2E tests pass           │
│  ✓ Unit tests pass                ✓ Screenshots match        │
│  ✓ No security issues             ✓ A11y compliant           │
│  ✓ Consumers updated              ✓ Performance OK           │
│                                                              │
│              ↓                            ↓                  │
│         Code OK?                     UX OK?                  │
│              ↓                            ↓                  │
│              └────────────┬───────────────┘                  │
│                           ↓                                  │
│                    ✅ Ready for @scribe                      │
└─────────────────────────────────────────────────────────────┘
```

---

## The Hooks 🪝

The secret why nothing gets forgotten:

```
You (or @builder) changes: shared/types/User.ts

                    │
                    ▼
        ┌───────────────────────┐
        │  check-api-impact.js  │  ← Runs AUTOMATICALLY
        │                       │
        │  Enhanced Detection:  │
        │  • Breaking changes   │
        │  • Consumer discovery │
        │  • Impact severity    │
        └───────────────────────┘
                    │
                    ▼
╔════════════════════════════════════════════════════════════╗
║  ⚠️   API/TYPE FILE CHANGE DETECTED                         ║
╚════════════════════════════════════════════════════════════╝

📁 File: shared/types/User.ts
📋 Type: TYPE DEFINITION

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 BREAKING CHANGE ANALYSIS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 POTENTIAL BREAKING CHANGES DETECTED:

   🔴 REMOVED_FIELDS
      └─ email: string;

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 CONSUMER DISCOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Found 5 potential consumer(s):

   📍 src/hooks/useUsers.ts:15: import { User }
   📍 src/components/UserCard.tsx:23: user.email
   ...

╔════════════════════════════════════════════════════════════╗
║  ⚡ @api-guardian MUST be called for API changes!          ║
╚════════════════════════════════════════════════════════════╝
```

**This happens on EVERY Write/Edit.** Automatically. Without you having to remember.

---

## Workflows 🔄

The Orchestrator knows these standard workflows:

### New Feature
```
@architect → @builder → @validator → @tester → @scribe
```
Design → Implementation → Code check → UX check → Documentation

### Bug Fix
```
@builder → @validator → @tester
```
Implement fix → Code check → UX check

### API Change (Critical!)
```
@architect → @api-guardian → @builder → @validator → @tester → @scribe
```
Design → **Impact analysis** → Implementation → Code check → UX check → Docs

### Refactoring
```
@architect → @builder → @validator → @tester
```
Plan → Rebuild → Code check → UX check

### Release
```
@scribe → @github-manager
```
Changelog updated → Tag + GitHub Release created

### Bug Report
```
@github-manager
```
User describes bug → Structured Issue created with labels

### Feature Complete
```
@tester → @github-manager
```
All tests pass → PR created with proper description

---

## MCP Servers 🔌

CC_GodMode uses MCP (Model Context Protocol) servers for enhanced capabilities:

### Required MCPs

| MCP Server | Agent | Purpose | Source |
|------------|-------|---------|--------|
| **Playwright** | @tester | Browser automation, E2E tests, screenshots | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) |
| **GitHub** | @github-manager | Issues, PRs, Releases, CI/CD | [github/github-mcp-server](https://github.com/github/github-mcp-server) |

### Recommended MCPs

| MCP Server | Agent | Purpose | Source |
|------------|-------|---------|--------|
| **Lighthouse** | @tester | Performance audits, Core Web Vitals | [lighthouse-mcp](https://www.npmjs.com/package/lighthouse-mcp) |
| **A11y** | @tester | Accessibility testing, WCAG compliance | [a11y-mcp](https://www.npmjs.com/package/a11y-mcp) |

### Quick Install

```bash
# Install all MCPs at once
chmod +x scripts/install-mcps.sh
./scripts/install-mcps.sh

# Or individually
claude mcp add playwright -- npx @playwright/mcp@latest
claude mcp add lighthouse -- npx lighthouse-mcp
claude mcp add a11y -- npx a11y-mcp

# GitHub MCP (requires Docker + token)
export GITHUB_TOKEN="your_token"
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

See [INSTALLATION.md](./INSTALLATION.md#-mcp-server-installation) for detailed setup instructions.

---

## Installation 🛠️

### Option A: YOLO Mode 🚀💀

> *For the brave: One prompt, everything automatic*

```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
claude --dangerously-skip-permissions
```

Then enter:
```
Run the complete CC_GodMode installation.
You have full access. Install everything globally. YOLO.
```

Lean back. Done.

### Option B: Safe Mode 🛡️

> *For the cautious: Step by step with confirmation*

```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
claude
```

Then enter:
```
I want to install CC_GodMode step by step.
Read INSTALLATION.md and guide me through.
Ask before every file change.
```

### Option C: Manual 📝

See [INSTALLATION.md](./INSTALLATION.md) for the complete guide.

---

## Quick Start 🏃‍♂️

After installation:

### 1. Open your project
```bash
cd your-project
claude
```

### 2. Activate Orchestrator mode

Copy this prompt:
```
You are the Orchestrator for this project.

Your subagents:
- @architect (Design)
- @api-guardian (API Contracts & Impact)
- @builder (Code)
- @validator (Code Quality Gate)
- @tester (UX Quality Gate) - Uses Playwright MCP
- @scribe (Docs)
- @github-manager (Issues, PRs, Releases)

Workflow rules:
- New feature: @architect → @builder → @validator → @tester → @scribe
- API change: @architect → @api-guardian → @builder → @validator → @tester → @scribe
- Bug fix: @builder → @validator → @tester
- Release: @scribe → @github-manager

Quality gates:
- @validator = Code compiles, unit tests pass, security OK
- @tester = E2E works, visuals match, a11y OK, performance OK

You delegate and coordinate. You don't write code yourself.
For API changes @api-guardian MUST be called before @builder.
Reports go in the Agents/ folder.

Wait for my task.
```

### 3. Give your task

```
I need a REST API for user management with CRUD operations.
```

### 4. Drink coffee ☕

The Orchestrator:
1. Calls `@architect` for high-level design
2. Calls `@api-guardian` for API contract design
3. Calls `@builder` for implementation
4. Hooks automatically warn about API issues
5. Calls `@validator` for code quality (TypeScript, unit tests)
6. Calls `@tester` for UX quality (E2E, visual, a11y, perf)
7. Calls `@scribe` for documentation
8. Calls `@github-manager` for PR/Release
9. Gives you a final report

---

## Project Structure 📁

```
CC_GodMode/
├── README.md                 # You are here 👋
├── INSTALLATION.md           # Setup guide (with MCP instructions)
├── ORCHESTRATOR-PROMPT-V3.1.md # Copy-paste prompts (latest)
├── CHANGELOG.md              # Version history
│
├── agents/                   # The 7 subagents
│   ├── architect.md          # 🏗️ The Architect
│   ├── api-guardian.md       # 🛡️ The API Guardian
│   ├── builder.md            # 👷 The Developer
│   ├── validator.md          # ✅ Code Quality Gate
│   ├── tester.md             # 🧪 UX Quality Gate (NEW!)
│   ├── scribe.md             # 📝 The Writer
│   └── github-manager.md     # 🐙 The GitHub Manager
│
├── scripts/
│   ├── check-api-impact.js   # 🪝 The automatic hook
│   └── install-mcps.sh       # 🔌 MCP installation script (NEW!)
│
├── config/                   # Configuration files
└── templates/                # Project templates
```

---

## Why does this work? 🎯

### 1. Clear Separation of Concerns
Each subagent has ONE job. No overlap. No confusion.

### 2. API Guardian as Single Point of Truth
All API-related decisions go through `@api-guardian`. No more fragmented responsibility.

### 3. GitHub Manager for Project Lifecycle
Issues, PRs, and Releases handled by `@github-manager`. Complete project workflow coverage.

### 4. Enhanced Hooks
The hook script now:
- Detects breaking changes
- Analyzes git diff
- Categorizes severity
- Triggers the right workflow

### 5. Explicit "What I Do NOT Do"
Every agent knows what's NOT their job. Clear handoffs.

### 6. Structured Reports
Every agent outputs in a consistent format. Easy to follow.

---

## FAQ ❓

**Q: Why 7 agents now?**
A: The `@tester` separates code quality from UX quality. Previously, @validator did everything.

**Q: What's the difference between @validator and @tester?**
A: `@validator` = Code quality (TypeScript, unit tests, security). `@tester` = UX quality (E2E, visual, a11y, performance).

**Q: Do I need all 4 MCP servers?**
A: Playwright and GitHub MCPs are required. Lighthouse and A11y are recommended but optional.

**Q: Can I skip @tester for small changes?**
A: For non-UI changes (backend only), you can skip @tester. For any UI change, @tester is recommended.

**Q: When do I need @api-guardian?**
A: Whenever you change files in `src/api/`, `backend/routes/`, `shared/types/`, or `*.d.ts`.

**Q: Does this work with GraphQL?**
A: Yes! The `@api-guardian` supports `schema.graphql` files too.

**Q: Do I need Docker for GitHub MCP?**
A: Recommended. If Docker is not available, @github-manager falls back to `gh` CLI.

**Q: Can agents push without my permission?**
A: No. CC_GodMode enforces "NEVER git push without permission" across all agents.

**Q: Where do I get the MCP servers?**
A: See [MCP Server Installation](./INSTALLATION.md#-mcp-server-installation) for all links and commands.

---

## Credits 🙏

**Dennis Westermann** ([www.dennis-westermann.de](https://www.dennis-westermann.de))
*Years of suffering, distilled into this repo*

---

## License 📄

MIT - Do whatever you want.

---

<div align="center">

**Made with mass sleep deprivation**

*"You say what. The AI does how."*

⭐ Star if it helps ⭐

</div>
