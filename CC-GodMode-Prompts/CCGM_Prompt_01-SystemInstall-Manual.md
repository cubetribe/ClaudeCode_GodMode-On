# Manual Installation Guide

> **Version:** 9.0.0
> **Type:** SYSTEM INSTALL
> **Prerequisite:** None (first-time installation)
> **Frequency:** Once per machine
> Manual step-by-step installation of CC_GodMode

> **Note:** Plugin-based installation via `.claude-plugin/` is the recommended path since v7.0.0.
> Clone the repo and follow the steps in `QUICK_START.md` or `README.md` for the plugin install path.
> This guide remains as a manual fallback for users who prefer step-by-step control.

**Note:** For automatic prompt-based installation see [`CCGM_Prompt_01-SystemInstall-Auto.md`](./CCGM_Prompt_01-SystemInstall-Auto.md)

---

## Prerequisites

| Component | Version | Check with |
|------------|---------|----------|
| Node.js | 18+ | `node --version` |
| Claude Code CLI | Latest | `claude --version` |
| Git | Any | `git --version` |

---

## Installation Steps

There is one installer for the whole runtime — `scripts/apply-global-claude-setup.sh`
(macOS/Linux) or `scripts/apply-global-claude-setup.ps1` (Windows). This guide shows
you what it does step by step so you understand the mechanism, but the recommended
path is still to run it rather than hand-copy files (Step 3 below is the one command
that matters; Steps 1-2 just get you there).

### Step 1: Clone the repository

**macOS / Linux:**
```bash
cd ~
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
```

**Windows (PowerShell):**
```powershell
cd $env:USERPROFILE
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
```

Keep this clone — it is also your update source (`git pull && ./scripts/apply-global-claude-setup.sh`)
and the place you copy `CC-GodMode-Prompts/*.md` from when activating a project (Step 6).

---

### Step 2: Prerequisites check

```bash
node --version    # need 18+
claude --version
git --version
```

---

### Step 3: Run the installer

**macOS / Linux:**
```bash
./scripts/apply-global-claude-setup.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\apply-global-claude-setup.ps1
```

This one command:
- Installs all 14 agents (7 core + 1 security gate + 6 department) into `~/.claude/agents/`
- Installs all 14 skills into `~/.claude/skills/`
- Installs every script under `scripts/` into `~/.claude/scripts/`
- Installs `CLAUDE.md` as `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` and
  `CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md` into `~/.claude/templates/`
- Installs `LICENSE`/`NOTICE` into `~/.claude/`
- Backs up anything it overwrites (timestamped, under `~/.claude/backups/install-archives/`)
- Merges the hooks from `config/claude-settings.json` into `~/.claude/settings.json`
  (only the `hooks` key — every other key you already have there, e.g. `model`,
  `effortLevel`, `permissions`, your own hooks, is preserved)
- Writes `~/.claude/.cc-godmode-version`

Add `--no-hooks` if you manage `settings.json` hook wiring yourself.

**Not installed by this script:** `config/domain-config.schema.json` and the full
`CC-GodMode-Prompts/` folder stay in your clone — copy the prompts you need per
project directly from there (Step 6). MCP servers are a separate step (below).

---

### Step 4: Install MCP servers (optional, separate step)

```bash
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
```

**Additional MCP servers (optional):**

```bash
# Playwright (for @tester - browser automation)
claude mcp add playwright -- npx @playwright/mcp@latest

# Lighthouse (for @tester - performance)
claude mcp add lighthouse -- npx lighthouse-mcp

# A11y (for @tester - accessibility)
claude mcp add a11y -- npx a11y-mcp
```

**GitHub MCP (requires token):**
```bash
export GITHUB_TOKEN="your_token"
claude mcp add github \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
  ghcr.io/github/github-mcp-server
```

**Verify:**
```bash
claude mcp list
```

---

### Step 5: Verify the installation

```bash
node scripts/verify-install.js
```

- **Exit 0** — all 14 agents, all 14 skills, the hook wiring, the orchestrator
  template, and LICENSE/NOTICE are present and match this repo's `VERSION`.
- **Exit non-zero** — the script lists exactly what's missing; re-run Step 3.

Equivalent built into the installer itself:

```bash
./scripts/apply-global-claude-setup.sh --check
```

---

## Activate a project

For each project where you want to use CC_GodMode. There is no global
`~/.claude/CLAUDE.md` — the orchestrator template is copied into each project
individually:

**macOS / Linux:**
```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
mkdir -p ./CC-GodMode-Prompts
cp <your-clone>/CC-GodMode-Prompts/*.md ./CC-GodMode-Prompts/
```

**Windows (PowerShell):**
```powershell
cd your-project
Copy-Item "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" ".\CLAUDE.md"
New-Item -ItemType Directory -Force -Path ".\CC-GodMode-Prompts"
Copy-Item "<your-clone>\CC-GodMode-Prompts\*.md" ".\CC-GodMode-Prompts\"
```

Then start Claude:
```bash
claude
```

The CLAUDE.md will be automatically loaded and the orchestrator is active!

---

## What gets installed where?

| Component | macOS/Linux | Windows |
|------------|-------------|----------|
| Agents (14) | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` |
| Skills (14) | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` |
| Scripts (all `*.js` in the repo) | `~/.claude/scripts/` | `%USERPROFILE%\.claude\scripts\` |
| Templates (2) | `~/.claude/templates/` | `%USERPROFILE%\.claude\templates\` |
| License/Notice | `~/.claude/LICENSE-CC_GodMode.txt`, `NOTICE-CC_GodMode.txt` | same, under `%USERPROFILE%\.claude\` |
| Hooks (merged) | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` |
| MCP Server | Claude MCP registry | Claude MCP registry |

---

## Uninstallation

There is no uninstall script. Back up `~/.claude/settings.json` first if you
want to keep unrelated settings — editing out just the GodMode `hooks` block is
safer than deleting the whole file.

**macOS / Linux:**
```bash
# Remove agents (all 14 — core + security gate + department)
rm ~/.claude/agents/{researcher,architect,api-guardian,builder,tester,scribe,github-manager}.md
rm ~/.claude/agents/{security,ci-security-guardian,docs-dx,quality-operations,runtime-platform,workflow-design,workspace-governance}.md

# Remove scripts and skills
rm -rf ~/.claude/scripts ~/.claude/skills

# Remove templates
rm -rf ~/.claude/templates

# Remove license/notice and version marker
rm -f ~/.claude/LICENSE-CC_GodMode.txt ~/.claude/NOTICE-CC_GodMode.txt ~/.claude/.cc-godmode-version

# Remove MCP servers
claude mcp remove memory
claude mcp remove playwright
claude mcp remove github
claude mcp remove lighthouse
claude mcp remove a11y

# Hooks: edit the GodMode hooks block out of ~/.claude/settings.json by hand
```

**Windows (PowerShell):**
```powershell
# Remove agents (all 14)
Remove-Item "$env:USERPROFILE\.claude\agents\*.md"

# Remove scripts and skills
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\scripts"
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\skills"

# Remove templates
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\templates"

# Remove license/notice and version marker
Remove-Item "$env:USERPROFILE\.claude\LICENSE-CC_GodMode.txt","$env:USERPROFILE\.claude\NOTICE-CC_GodMode.txt","$env:USERPROFILE\.claude\.cc-godmode-version" -ErrorAction SilentlyContinue

# Remove MCP servers
claude mcp remove memory
claude mcp remove playwright
claude mcp remove github
claude mcp remove lighthouse
claude mcp remove a11y

# Hooks: edit the GodMode hooks block out of settings.json by hand
```

---

## Troubleshooting

### Agents not recognized
```bash
ls ~/.claude/agents/  # Are the files there?
```
If not, re-run Step 3 — the installer is idempotent.

### Hooks not wired / `verify-install.js` reports missing hooks
```bash
./scripts/apply-global-claude-setup.sh   # re-run without --no-hooks
```
If `~/.claude/settings.json` exists but is invalid JSON, the installer refuses
to touch it — fix the JSON first, then re-run.

### MCP Server errors
```bash
claude mcp list  # Which ones are installed?
claude mcp logs memory  # Show error logs
```

### Permission denied (macOS/Linux)
```bash
chmod +x ~/.claude/scripts/*.js
```

---

## Version

CC_GodMode **v9.0.0**

See [CHANGELOG.md](./CHANGELOG.md) for details.

---

*For automatic installation: [`CCGM_Prompt_01-SystemInstall-Auto.md`](./CCGM_Prompt_01-SystemInstall-Auto.md)*

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
