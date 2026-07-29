# Installation Guide

CC_GodMode is a Claude Code plugin that transforms your development workflow into a self-orchestrating multi-agent system. This guide covers every installation path from the fast track to manual fallbacks.

---

## Requirements

- **Node.js 18+** — required by the MCP servers (memory, playwright, etc.)
- **Claude Code ≥ 2.1.152** — required for agent `effort` frontmatter fields and subagent dispatch
- **git** — required to clone the repo and to keep GodMode up to date

---

## Quick Install (recommended)

Clone the repo once, then run the platform-appropriate setup script. The script installs agents, skills, templates, LICENSE/NOTICE into `~/.claude/` globally, **and wires the hook configuration from `config/claude-settings.json` into `~/.claude/settings.json`.**

**macOS / Linux:**
```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
./scripts/apply-global-claude-setup.sh
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
.\scripts\apply-global-claude-setup.ps1
```

### Hook wiring

The script merges the canonical `hooks` block from `config/claude-settings.json` into `~/.claude/settings.json`. This is a **merge, not an overwrite**: any keys you already have there (`model`, `effortLevel`, `permissions`, your own hooks) are left untouched. If you don't yet have a `settings.json`, one is created. A timestamped backup of the previous file is written before every change, and re-running the script is safe — it will not create duplicate hook entries.

Without wired hooks, none of the enforcement layer fires: no `check-api-impact.js` (Core Rule 4), no `verify-changes.js` (Core Rule 5), no `session-start.js`. If you manage `settings.json` hooks yourself and want the installer to leave it alone, pass `--no-hooks` (`-NoHooks` on PowerShell). To repair hook wiring later without re-running the full install, use `--fix-hooks` (`-FixHooks`).

### Verify your install

```bash
node scripts/verify-install.js
```

Checks that all 14 agents, all 14 skills, the hook wiring in `~/.claude/settings.json`, the orchestrator template, LICENSE/NOTICE, and the installed version are all present and consistent with the repo. Exits 0 on a complete install, 1 with a concrete list of what's missing otherwise. This works whether you run it from the repo or from `~/.claude/scripts/verify-install.js`.

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

These servers extend what the agents can do. **The setup script does NOT install MCP servers** (it says so in its closing notes) — add them with the commands below, or use `scripts/install-mcps.sh`.

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
- Claude skips the deterministic hook checks, or ignores a declared `ux_gate: auto` and doesn't call @tester
- Claude tries to git push without asking for explicit permission

Paste the ContextRestore prompt into the current session to re-establish the orchestrator role without starting a new session.

---

## Updating and Uninstalling

### Updating

Update uses the exact same command as install — there is no separate updater script:

```bash
git pull && ./scripts/apply-global-claude-setup.sh
```

(`git pull && .\scripts\apply-global-claude-setup.ps1` on Windows.) The script is idempotent — it is safe to re-run, merges hook wiring without duplicating entries, and prints the version before/after so you can see what changed. If the installed version already matches the repo, it says so and does nothing further.

Run `node scripts/verify-install.js` afterward to confirm the update landed. Then use the [Maintenance prompt](../CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md) inside Claude Code to refresh agent context for the current session.

### Uninstalling

Uninstall instructions are embedded in the SystemInstall prompt files. Open either install prompt and follow the uninstall section at the bottom to remove agents, skills, and templates from `~/.claude/`.

---

## Don't edit `~/.claude/` directly

`~/.claude/` is a deployment target, not a source of truth — the installer treats it as disposable and overwrites it on every run. Edits made directly there (a hotfix to an agent file, a manually added hook) are silently lost the next time `apply-global-claude-setup.sh` runs. This has happened twice in this project's history: a health-cache fix and a hook registration that were made only in the installed copy and vanished on reinstall. Change the repo, then run the installer — never the other way around.

---

## See Also

- [README](../README.md) — Overview, architecture diagram, and daily usage patterns
- [ARCHITECTURE.md](./ARCHITECTURE.md) — Agent registry, routing logic, and workflow internals


---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
