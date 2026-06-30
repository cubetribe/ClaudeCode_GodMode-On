# Manual Installation Guide

> **Version:** 8.0.0
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

### Step 1: Create directories

**macOS / Linux:**
```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/scripts
mkdir -p ~/.claude/templates
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\scripts"
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

### Step 3: Install agents (15 files)

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode/agents/*.md ~/.claude/agents/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\agents\*.md" "$env:USERPROFILE\.claude\agents\" -Force
```

**Expected files (15 — 8 core + 1 security gate + 6 department):**

Core agents:
- `researcher.md`
- `architect.md`
- `api-guardian.md`
- `builder.md`
- `validator.md`
- `tester.md`
- `scribe.md`
- `github-manager.md`

Security gate:
- `security.md`

Department agents:
- `ci-security-guardian.md`
- `docs-dx.md`
- `quality-operations.md`
- `runtime-platform.md`
- `workflow-design.md`
- `workspace-governance.md`

---

### Step 4: Install skills (11 directories)

**macOS / Linux:**
```bash
cp -R /tmp/CC_GodMode/skills/* ~/.claude/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\skills\*" "$env:USERPROFILE\.claude\skills\" -Recurse -Force
```

**Expected directories:**
- `workflows`
- `quality-gates`
- `release`
- `issue-processing`
- `api-change`
- `research`
- `meta-decisions`
- `agent-teams`
- `prototype-mode`
- `departments`
- `cost-efficiency`

---

### Step 5: Install scripts

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

### Step 6: Install templates

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode/CLAUDE.md ~/.claude/templates/CLAUDE-ORCHESTRATOR.md
cp /tmp/CC_GodMode/templates/adr-template.md ~/.claude/templates/
cp /tmp/CC_GodMode/CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md ~/.claude/templates/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\CLAUDE.md" "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" -Force
Copy-Item "$env:TEMP\CC_GodMode\templates\adr-template.md" "$env:USERPROFILE\.claude\templates\" -Force
Copy-Item "$env:TEMP\CC_GodMode\CC-GodMode-Prompts\CCGM_Prompt_02-ProjectActivation.md" "$env:USERPROFILE\.claude\templates\" -Force
```

---

### Step 7: Install Memory MCP Server

```bash
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
```

**Verify:**
```bash
claude mcp list
```

---

### Step 8: Additional MCP Servers (recommended)

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

### Step 9: Configure hooks

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

### Step 10: Cleanup

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

echo "=== Skills ==="
ls ~/.claude/skills/

echo "=== Scripts ==="
ls ~/.claude/scripts/

echo "=== Templates ==="
ls ~/.claude/templates/

echo "=== MCP Server ==="
claude mcp list
```

**Expected result:**
- 15 agent files (8 core + 1 security gate + 6 department)
- 11 skill directories
- 15 scripts
- 3 templates (`CLAUDE-ORCHESTRATOR.md`, `adr-template.md`, `CCGM_Prompt_02-ProjectActivation.md`)
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
| Agents (15) | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` |
| Skills (11) | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` |
| Scripts (15) | `~/.claude/scripts/` | `%USERPROFILE%\.claude\scripts\` |
| Templates (3) | `~/.claude/templates/` | `%USERPROFILE%\.claude\templates\` |
| Hooks | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` |
| MCP Server | `~/.claude/mcp.json` | `%USERPROFILE%\.claude\mcp.json` |

---

## Uninstallation

**macOS / Linux:**
```bash
# Remove agents (core + department)
rm ~/.claude/agents/{researcher,architect,api-guardian,builder,validator,tester,scribe,github-manager}.md
rm ~/.claude/agents/{ci-security-guardian,docs-dx,quality-operations,runtime-platform,workflow-design,workspace-governance}.md

# Remove skills
rm -rf ~/.claude/skills/{workflows,quality-gates,release,issue-processing,api-change,research,meta-decisions,agent-teams,prototype-mode,departments,cost-efficiency}

# Remove scripts
rm ~/.claude/scripts/{analyze-prompt,auto-update,check-api-impact,check-update,domain-pack-loader,escalation-handler,mcp-health-check,parallel-quality-gates,pre-push-check,session-start,sync-version,test-phase2-integration,validate-agent-output,version-bump,workflow-state}.js

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
# Remove agents (core + department — glob removes all 15)
Remove-Item "$env:USERPROFILE\.claude\agents\*.md"

# Remove scripts
Remove-Item "$env:USERPROFILE\.claude\scripts\analyze-prompt.js","$env:USERPROFILE\.claude\scripts\auto-update.js","$env:USERPROFILE\.claude\scripts\check-api-impact.js","$env:USERPROFILE\.claude\scripts\check-update.js","$env:USERPROFILE\.claude\scripts\domain-pack-loader.js","$env:USERPROFILE\.claude\scripts\escalation-handler.js","$env:USERPROFILE\.claude\scripts\mcp-health-check.js","$env:USERPROFILE\.claude\scripts\parallel-quality-gates.js","$env:USERPROFILE\.claude\scripts\pre-push-check.js","$env:USERPROFILE\.claude\scripts\session-start.js","$env:USERPROFILE\.claude\scripts\sync-version.js","$env:USERPROFILE\.claude\scripts\test-phase2-integration.js","$env:USERPROFILE\.claude\scripts\validate-agent-output.js","$env:USERPROFILE\.claude\scripts\version-bump.js","$env:USERPROFILE\.claude\scripts\workflow-state.js"

# Remove skills
Remove-Item -Recurse "$env:USERPROFILE\.claude\skills\workflows","$env:USERPROFILE\.claude\skills\quality-gates","$env:USERPROFILE\.claude\skills\release","$env:USERPROFILE\.claude\skills\issue-processing","$env:USERPROFILE\.claude\skills\api-change","$env:USERPROFILE\.claude\skills\research","$env:USERPROFILE\.claude\skills\meta-decisions","$env:USERPROFILE\.claude\skills\agent-teams","$env:USERPROFILE\.claude\skills\prototype-mode","$env:USERPROFILE\.claude\skills\departments","$env:USERPROFILE\.claude\skills\cost-efficiency"

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

CC_GodMode **v8.0.0 — The Ultracode Release**

See [CHANGELOG.md](./CHANGELOG.md) for details.

---

*For automatic installation: [`CCGM_Prompt_01-SystemInstall-Auto.md`](./CCGM_Prompt_01-SystemInstall-Auto.md)*
