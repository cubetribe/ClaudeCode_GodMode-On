# Installation Guide

CC_GodMode is a Claude Code plugin that transforms your development workflow into a self-orchestrating multi-agent system. This guide covers every installation path from the fast track to manual fallbacks.

---

## Requirements

- **Node.js 18+** — required by the MCP servers (memory, playwright, etc.)
- **Claude Code ≥ 2.1.152** — required for agent `effort` frontmatter fields and subagent dispatch
- **git** — required to clone the repo and to keep GodMode up to date

---

## Quick Install (recommended)

Clone the repo once, then run the platform-appropriate setup script. The script installs agents, skills, and templates into `~/.claude/` globally.

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

The `--check` / `-Check` flag re-runs the script in verification mode: it confirms that all agents, skills, and templates were placed correctly without making further changes.

---

## Activate in a Project

After installation, activate the orchestrator in any project by copying the template and launching Claude Code:

```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
claude
```

The orchestrator is now active. To run it at full power, each session is two steps:

1. **Turn on Ultracode** — in the effort selector at the bottom of Claude Code, or by command:
   ```
   /model best        # Opus 4.8 today; auto-upgrades as your org gains access
   /effort ultracode  # xhigh reasoning + automatic parallel dynamic workflows
   ```
   Ultracode is **session-scoped** — it does not persist, so enable it in every new session.
2. **Type your request**, prefixed with `GodMode:` — e.g. `GodMode: New Feature: dark mode toggle`.

Skip Step 1 and GodMode still orchestrates and gates correctly; it just won't fan out to its full parallel width. The trigger `GodMode:` is case-insensitive (`GODMODE:` works too).

---

## Recommended MCP Servers

These servers extend what the agents can do. The setup script installs them for you, but you can add them manually with the commands below.

```bash
# Memory — recommended for agents (persistent context across sessions)
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory

# Browser automation & screenshots — REQUIRED for @tester
claude mcp add playwright -- npx @playwright/mcp@latest

# GitHub — recommended for @github-manager
export GITHUB_TOKEN="your_token"
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
  ghcr.io/github/github-mcp-server

# Performance audits — optional
claude mcp add lighthouse -- npx lighthouse-mcp

# Accessibility testing — optional
claude mcp add a11y -- npx a11y-mcp
```

| Server | Required? | Used by |
|--------|-----------|---------|
| `memory` | Recommended | All agents (persistent state) |
| `playwright` | **Required** | @tester (screenshots at 3 viewports) |
| `github` | Recommended | @github-manager (issues, PRs, releases) |
| `lighthouse` | Optional | Performance audits |
| `a11y` | Optional | Accessibility testing |

---

## Backup / Manual Prompt Install (fallback)

If the setup script does not work on your system, use one of the prompt-based install paths instead. Open Claude Code and paste the contents of the relevant file.

### Install prompts

| Prompt | Description |
|--------|-------------|
| [`CCGM_Prompt_01-SystemInstall-Auto.md`](../CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md) | **Auto install** — one-shot, fully automated. Requires `--dangerously-skip-permissions` flag when launching Claude Code. |
| [`CCGM_Prompt_01-SystemInstall-Manual.md`](../CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md) | **Manual install** — step-by-step with explicit confirmation at each stage. No special flags needed. |

### Maintenance and recovery prompts

| Prompt | Description |
|--------|-------------|
| [`CCGM_Prompt_98-Maintenance.md`](../CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md) | Pull the latest agent and skill improvements after a `git pull`. |
| [`CCGM_Prompt_99-ContextRestore.md`](../CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md) | Restore the orchestrator's behavior after a `/compact` or session reset. |

---

## Context Recovery

The orchestrator is active whenever `CLAUDE.md` is present in your project. Normally you never need to do anything special — just type `GodMode: <your request>` and the orchestrator routes the work.

Use the [ContextRestore prompt](../CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md) if you notice any of these symptoms:

- Claude writes code directly instead of delegating to @builder
- Claude forgets to call @api-guardian for API or type changes
- Claude skips quality gates (@validator / @tester)
- Claude tries to git push without asking for explicit permission

Paste the ContextRestore prompt into the current session to re-establish the orchestrator role without starting a new session.

---

## Updating and Uninstalling

### Updating

Pull the latest changes and re-run the setup script:

```bash
cd ClaudeCode_GodMode-On
git pull
./scripts/apply-global-claude-setup.sh          # macOS / Linux
# or
.\scripts\apply-global-claude-setup.ps1         # Windows PowerShell
```

The script is idempotent — it is safe to re-run and will overwrite only the GodMode files in `~/.claude/`.

After pulling, run the [Maintenance prompt](../CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md) inside Claude Code to refresh agent context.

### Uninstalling

Uninstall instructions are embedded in the SystemInstall prompt files. Open either install prompt and follow the uninstall section at the bottom to remove agents, skills, and templates from `~/.claude/`.

---

## See Also

- [README](../README.md) — Overview, architecture diagram, and daily usage patterns
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Agent registry, routing logic, and workflow internals
