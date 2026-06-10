# Manual Installation Guide

> **Version:** 6.3.0
> **Type:** SYSTEM INSTALL
> **Prerequisite:** None (first-time installation)
> **Frequency:** Once per machine
> Manual step-by-step installation of CC_GodMode

**Note:** For automatic installation see [`CCGM_Prompt_01-SystemInstall-Auto.md`](./CCGM_Prompt_01-SystemInstall-Auto.md)

---

## Recommended: one-command install

The steps below are the fully manual path. For most users the idempotent installer is faster and safer (it backs up existing files and can verify the result):

**Windows (PowerShell):**
```powershell
.\scripts\apply-global-claude-setup.ps1          # install / refresh ~/.claude
.\scripts\apply-global-claude-setup.ps1 -Check   # verify the installed runtime
```

**macOS / Linux:**
```bash
./scripts/apply-global-claude-setup.sh           # install / refresh ~/.claude
./scripts/apply-global-claude-setup.sh --check   # verify the installed runtime
```

The installer copies **agents, scripts, skills, and templates** into `~/.claude`, writes a
`.cc-godmode-version` marker, and archives any replaced files under
`~/.claude/backups/install-archives/<timestamp>/`. It does **not** modify your
`settings.json` hooks or MCP servers — those remain Steps 6–8 below.

---

## Prerequisites

| Component | Version | Check with |
|------------|---------|----------|
| Node.js | 18+ | `node --version` |
| Claude Code CLI | Latest | `claude --version` |
| Git | Any | `git --version` |

---

## Installation Steps

### Step 1: Create directories

**macOS / Linux:**
```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/scripts
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/templates
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\scripts"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\templates"
```

---

### Step 2: Clone repository

**macOS / Linux:**
```bash
cd /tmp
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git CC_GodMode
```

**Windows (PowerShell):**
```powershell
cd $env:TEMP
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git CC_GodMode
```

---

### Step 3: Install agents (9 files)

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode/agents/*.md ~/.claude/agents/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\agents\*.md" "$env:USERPROFILE\.claude\agents\" -Force
```

**Expected files:**
- `architect.md`
- `api-guardian.md`
- `builder.md`
- `validator.md`
- `tester.md`
- `scribe.md`
- `github-manager.md`
- `researcher.md`
- `security.md`

---

### Step 4: Install scripts

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode/scripts/*.js ~/.claude/scripts/
chmod +x ~/.claude/scripts/*.js
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\scripts\*.js" "$env:USERPROFILE\.claude\scripts\" -Force
```

---

### Step 4b: Install skills (10 skills)

The 8 GodMode skills are what the agents and orchestrator invoke at runtime. Without
them the agents reference skills that are not present. Install them as **user skills**
so they load in every project.

**macOS / Linux:**
```bash
cp -R /tmp/CC_GodMode/skills/* ~/.claude/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\skills\*" "$env:USERPROFILE\.claude\skills\" -Recurse -Force
```

**Expected skill directories** (each with a `SKILL.md`):
`workflows`, `quality-gates`, `release`, `issue-processing`, `api-change`,
`research`, `meta-decisions`, `agent-teams`, `prototype-mode`, `greenfield-bootstrap`

---

### Step 5: Install templates

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode/CCGM_Prompt_02-ProjectActivation.md ~/.claude/templates/
cp /tmp/CC_GodMode/CLAUDE.md ~/.claude/templates/CLAUDE-ORCHESTRATOR.md
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\CCGM_Prompt_02-ProjectActivation.md" "$env:USERPROFILE\.claude\templates\" -Force
Copy-Item "$env:TEMP\CC_GodMode\CLAUDE.md" "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" -Force
```

---

### Step 6: Install Memory MCP Server

```bash
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
```

**Verify:**
```bash
claude mcp list
```

---

### Step 7: Additional MCP Servers (recommended)

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

---

### Step 8: Configure hooks

Create/edit `~/.claude/settings.json` (macOS/Linux) or `%USERPROFILE%\.claude\settings.json` (Windows):

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/check-api-impact.js \"$CLAUDE_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

**Windows path in settings.json:**
```json
"command": "node \"%USERPROFILE%\\.claude\\scripts\\check-api-impact.js\" \"$CLAUDE_FILE_PATH\""
```

---

### Step 9: Cleanup

**macOS / Linux:**
```bash
rm -rf /tmp/CC_GodMode
```

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force "$env:TEMP\CC_GodMode"
```

---

## Verification

```bash
echo "=== Agents ==="
ls ~/.claude/agents/

echo "=== Scripts ==="
ls ~/.claude/scripts/

echo "=== Skills ==="
ls ~/.claude/skills/

echo "=== Templates ==="
ls ~/.claude/templates/

echo "=== MCP Server ==="
claude mcp list
```

Or simply run the verifier:
```bash
./scripts/apply-global-claude-setup.sh --check    # macOS / Linux
.\scripts\apply-global-claude-setup.ps1 -Check    # Windows
```

**Expected result:**
- 9 agent files
- at least 1 script (`check-api-impact.js`)
- 10 skill directories (each with `SKILL.md`)
- 2 templates (`CLAUDE-ORCHESTRATOR.md`, `CCGM_Prompt_02-ProjectActivation.md`)
- MCP: `memory`, optional: `playwright`, `github`, `lighthouse`, `a11y`

---

## Activate project

For each project where you want to use CC_GodMode:

**macOS / Linux:**
```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
```

**Windows (PowerShell):**
```powershell
cd your-project
Copy-Item "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" ".\CLAUDE.md"
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
| Agents (9) | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` |
| Scripts | `~/.claude/scripts/` | `%USERPROFILE%\.claude\scripts\` |
| Skills (10) | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` |
| Templates | `~/.claude/templates/` | `%USERPROFILE%\.claude\templates\` |
| Hooks | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` |
| MCP Server | `~/.claude/mcp.json` | `%USERPROFILE%\.claude\mcp.json` |

---

## Uninstallation

**macOS / Linux:**
```bash
# Remove agents
rm ~/.claude/agents/{architect,api-guardian,builder,validator,tester,security,scribe,github-manager,researcher}.md

# Remove scripts
rm ~/.claude/scripts/check-*.js

# Remove templates
rm -rf ~/.claude/templates/

# Remove MCP servers
claude mcp remove memory
claude mcp remove playwright
claude mcp remove github
claude mcp remove lighthouse
claude mcp remove a11y

# Hooks: Remove manually from ~/.claude/settings.json
```

**Windows (PowerShell):**
```powershell
# Remove agents
Remove-Item "$env:USERPROFILE\.claude\agents\*.md"

# Remove scripts
Remove-Item "$env:USERPROFILE\.claude\scripts\*.js"

# Remove templates
Remove-Item -Recurse "$env:USERPROFILE\.claude\templates\"

# Remove MCP servers
claude mcp remove memory
claude mcp remove playwright
claude mcp remove github
claude mcp remove lighthouse
claude mcp remove a11y

# Hooks: Remove manually from settings.json
```

---

## Troubleshooting

### Agents not recognized
```bash
ls ~/.claude/agents/  # Are the files there?
```

### Hook not running
```bash
cat ~/.claude/settings.json | grep -A 10 "hooks"  # Is the configuration correct?
```

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

CC_GodMode **v6.4.0**

See [CHANGELOG.md](./CHANGELOG.md) for details.

---

*For automatic installation: [`CCGM_Prompt_01-SystemInstall-Auto.md`](./CCGM_Prompt_01-SystemInstall-Auto.md)*