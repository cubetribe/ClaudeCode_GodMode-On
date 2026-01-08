# Manual Installation Guide v5.1.0

> Manual step-by-step installation of CC_GodMode

**Note:** For automatic installation see [`CCGM_Prompt_Install_v5.8.2.md`](./CCGM_Prompt_Install_v5.8.2.md)

---

## Prerequisites

| Component | Version | Check with |
|------------|---------|------------|
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
mkdir -p ~/.claude/templates
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
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

### Step 3: Install agents (7 files)

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

### Step 5: Install templates

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode/CCGM_Prompt_ProjectSetup_v5.8.2.md ~/.claude/templates/
cp /tmp/CC_GodMode/CLAUDE.md ~/.claude/templates/CLAUDE-ORCHESTRATOR.md
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode\CCGM_Prompt_ProjectSetup_v5.8.2.md" "$env:USERPROFILE\.claude\templates\" -Force
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

echo "=== Templates ==="
ls ~/.claude/templates/

echo "=== MCP Server ==="
claude mcp list
```

**Expected result:**
- 7 agent files
- at least 1 script (`check-api-impact.js`)
- 2 templates (`CLAUDE-ORCHESTRATOR.md`, `CCGM_Prompt_ProjectSetup_v5.8.2.md`)
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
|------------|-------------|---------|
| Agents (7) | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` |
| Scripts | `~/.claude/scripts/` | `%USERPROFILE%\.claude\scripts\` |
| Templates | `~/.claude/templates/` | `%USERPROFILE%\.claude\templates\` |
| Hooks | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` |
| MCP Server | `~/.claude/mcp.json` | `%USERPROFILE%\.claude\mcp.json` |

---

## Uninstallation

**macOS / Linux:**
```bash
# Remove agents
rm ~/.claude/agents/{architect,api-guardian,builder,validator,tester,scribe,github-manager}.md

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

CC_GodMode **v5.0**

See [CHANGELOG.md](./CHANGELOG.md) for details.

---

*For automatic installation: [`CCGM_Prompt_Install_v5.8.2.md`](./CCGM_Prompt_Install_v5.8.2.md)*
