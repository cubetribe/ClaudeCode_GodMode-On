# CC_GodMode Installation Prompt

> **Version:** 5.1.0
> **Type:** Self-Installing System
> **One-Shot:** Copy this entire prompt into Claude Code and it will set up everything automatically.

---

## Before You Start: Launch Claude Correctly!

**IMPORTANT:** Start Claude Code with this flag so the installation runs automatically:

```bash
claude --dangerously-skip-permissions
```

**Why?**
- The installation executes 30+ commands (mkdir, cp, git clone, etc.)
- Without this flag, you must manually confirm EVERY single command
- With the flag, everything runs automatically

**Security Notice:**
- Only use this mode for the installation
- Afterwards, you can start Claude normally (without the flag)
- This flag gives Claude full permissions - only use with trusted prompts!

---

## Quick Install (Copy & Paste)

After starting Claude with `--dangerously-skip-permissions`, copy everything below the line and paste it:

---

You are now installing **CC_GodMode** - a self-orchestrating multi-agent system for Claude Code.

## FIRST ACTION: Welcome and Explanation

Before you execute anything, give the user the following message:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   🚀 CC_GodMode Installation                                              ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   Hello! I will now set up your system for CC_GodMode.                   ║
║                                                                           ║
║   What I will do for you:                                                ║
║                                                                           ║
║   1. 📦 Download the CC_GodMode repository from GitHub                    ║
║   2. 🤖 Install 7 specialized AI agents                                   ║
║   3. 🔧 Set up hook scripts (automatic quality checks)                    ║
║   4. 🧠 Install the Memory MCP Server (for persistent knowledge)          ║
║   5. ⚙️  Adjust the configuration                                          ║
║   6. ✅ Verify everything and clean up                                    ║
║                                                                           ║
║   ⏱️  This will take approximately 2-5 minutes.                            ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   ⚠️  IMPORTANT: During installation, I will ask you multiple times for   ║
║   permission to execute commands and write files.                         ║
║                                                                           ║
║   Please allow these actions, otherwise I cannot proceed!                 ║
║                                                                           ║
║   You can also select "Yes, don't ask again" to speed up the process.    ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

I'm now starting the installation...
```

Wait briefly (2 seconds) and then proceed with the installation steps.

---

## INSTALLATION STEPS

### Step 0: Detect Operating System

First detect the operating system and set variables accordingly:

```bash
# Detect OS
node -e "console.log(process.platform)"
```

**Evaluate result:**
- `darwin` → macOS
- `win32` → Windows
- `linux` → Linux

Remember the OS for the following steps!

---

### Step 1: Prerequisites Check

Run these checks and report any failures:

```bash
# Check Node.js version (need 18+)
node --version

# Check Claude CLI
claude --version

# Check git
git --version
```

**If any check fails:** Stop and provide installation instructions for the missing component.

---

### Step 2: Create Directory Structure

**macOS / Linux:**
```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/scripts
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\scripts"
```

---

### Step 3: Clone Repository

**macOS / Linux:**
```bash
cd /tmp
rm -rf CC_GodMode_install
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git CC_GodMode_install
```

**Windows (PowerShell):**
```powershell
cd $env:TEMP
if (Test-Path "CC_GodMode_install") { Remove-Item -Recurse -Force "CC_GodMode_install" }
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git CC_GodMode_install
```

**If clone fails:** The repo might be private or renamed. Report the error.

---

### Step 4: Install Agents (Global)

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode_install/agents/*.md ~/.claude/agents/
ls -la ~/.claude/agents/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode_install\agents\*.md" "$env:USERPROFILE\.claude\agents\" -Force
Get-ChildItem "$env:USERPROFILE\.claude\agents\"
```

**Expected agents (7 files):**
- `architect.md`
- `api-guardian.md`
- `builder.md`
- `validator.md`
- `tester.md`
- `scribe.md`
- `github-manager.md`

---

### Step 5: Install Scripts (Global)

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode_install/scripts/*.js ~/.claude/scripts/
chmod +x ~/.claude/scripts/*.js
ls -la ~/.claude/scripts/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode_install\scripts\*.js" "$env:USERPROFILE\.claude\scripts\" -Force
Get-ChildItem "$env:USERPROFILE\.claude\scripts\"
```

**Note:** On Windows, `chmod` is not needed.

### Step 6: Install Orchestrator Template

Copy the orchestrator template for projects:

**macOS / Linux:**
```bash
mkdir -p ~/.claude/templates
cp /tmp/CC_GodMode_install/PROJECT-SETUP-V5.0.md ~/.claude/templates/
cp /tmp/CC_GodMode_install/CLAUDE.md ~/.claude/templates/CLAUDE-ORCHESTRATOR.md
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\templates"
Copy-Item "$env:TEMP\CC_GodMode_install\PROJECT-SETUP-V5.0.md" "$env:USERPROFILE\.claude\templates\" -Force
Copy-Item "$env:TEMP\CC_GodMode_install\CLAUDE.md" "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" -Force
```

**Important:** These templates will be copied to each project later!

---

### Step 7: Install Memory MCP Server

This command is the same on all platforms:

```bash
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
```

**Verify installation:**
```bash
claude mcp list
```

**Expected output should include:** `memory`

---

### Step 8: Configure Hooks

**macOS / Linux** - Create/update `~/.claude/settings.json`:

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

**Windows** - Create/update `%USERPROFILE%\.claude\settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node \"%USERPROFILE%\\.claude\\scripts\\check-api-impact.js\" \"$CLAUDE_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

**Note:** If the file already exists, merge the hooks section carefully.

---

### Step 9: Verify Installation

**macOS / Linux:**
```bash
echo "=== Version ==="
cat /tmp/CC_GodMode_install/VERSION

echo "=== Agents ==="
ls ~/.claude/agents/

echo "=== Scripts ==="
ls ~/.claude/scripts/

echo "=== MCP Servers ==="
claude mcp list
```

**Windows (PowerShell):**
```powershell
Write-Host "=== Version ==="
Get-Content "$env:TEMP\CC_GodMode_install\VERSION"

Write-Host "=== Agents ==="
Get-ChildItem "$env:USERPROFILE\.claude\agents\"

Write-Host "=== Scripts ==="
Get-ChildItem "$env:USERPROFILE\.claude\scripts\"

Write-Host "=== MCP Servers ==="
claude mcp list
```

---

### Step 10: Cleanup

**macOS / Linux:**
```bash
rm -rf /tmp/CC_GodMode_install
```

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force "$env:TEMP\CC_GodMode_install"
```

---

### Step 11: Test Orchestrator Mode

After installation, test by typing:

```
You are the Orchestrator. List your available agents.
```

The system should recognize all 7 agents.

---

## INSTALLATION REPORT

After completing all steps, provide this summary to the user:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   ✅ CC_GodMode Installation Successful!                                  ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   📊 INSTALLATION REPORT                                                  ║
║                                                                           ║
║   Version:      [VERSION from VERSION file]                               ║
║   Agents:       [X]/7 installed                                           ║
║   Scripts:      [X]/X installed                                           ║
║   MCP Server:   memory [✅ OK / ❌ ERROR]                                  ║
║   Hooks:        [✅ Configured / ⏭️ Skipped]                               ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   🎯 HOW TO ACTIVATE A PROJECT                                            ║
║                                                                           ║
║   For EVERY project where you want to use CC_GodMode:                    ║
║                                                                           ║
║   macOS/Linux:                                                            ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  cd your-project                                                    │ ║
║   │  cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md          │ ║
║   └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║   Windows (PowerShell):                                                   ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  cd your-project                                                    │ ║
║   │  Copy-Item "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" ".\CLAUDE.md" ║
║   └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║   The CLAUDE.md will be automatically loaded by Claude Code!             ║
║                                                                           ║
║   Then start Claude in this project:                                     ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  claude                                                             │ ║
║   │  > "New Feature: User Authentication with JWT"                      │ ║
║   └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   📚 DOCUMENTATION                                                        ║
║                                                                           ║
║   You can find the complete documentation on GitHub:                     ║
║   https://github.com/cubetribe/ClaudeCode_GodMode-On                      ║
║                                                                           ║
║   For questions: https://github.com/cubetribe/ClaudeCode_GodMode-On/issues ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝

Good luck with CC_GodMode! 🚀
```

---

## Troubleshooting

### MCP Server Installation Failed

If `claude mcp add` fails:

```bash
# Manual installation (all platforms)
npm install -g @modelcontextprotocol/server-memory

# Then add to Claude manually by editing the mcp.json file
# macOS/Linux: ~/.claude/mcp.json
# Windows: %USERPROFILE%\.claude\mcp.json
```

### Permission Denied (macOS/Linux only)

If scripts can't be executed:

```bash
chmod +x ~/.claude/scripts/*.js
```

### Agents Not Found

**macOS / Linux:**
```bash
ls ~/.claude/agents/
ls -la ~/.claude/agents/*.md
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\agents\"
```

### Repository Not Found

The repository might have moved. Check:
- https://github.com/cubetribe/ClaudeCode_GodMode-On

### Windows: PowerShell Execution Policy

If PowerShell scripts are blocked:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## What Gets Installed

| Component | macOS/Linux | Windows |
|-----------|-------------|---------|
| 7 Agent Files | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` |
| Hook Scripts | `~/.claude/scripts/` | `%USERPROFILE%\.claude\scripts\` |
| Memory MCP | Claude MCP registry | Claude MCP registry |
| Settings | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` |

---

## Uninstall

**macOS / Linux:**
```bash
# Remove agents
rm ~/.claude/agents/{architect,api-guardian,builder,validator,tester,scribe,github-manager}.md

# Remove scripts
rm ~/.claude/scripts/check-*.js

# Remove MCP server
claude mcp remove memory

# Note: Manually edit ~/.claude/settings.json to remove hooks
```

**Windows (PowerShell):**
```powershell
# Remove agents
Remove-Item "$env:USERPROFILE\.claude\agents\architect.md"
Remove-Item "$env:USERPROFILE\.claude\agents\api-guardian.md"
Remove-Item "$env:USERPROFILE\.claude\agents\builder.md"
Remove-Item "$env:USERPROFILE\.claude\agents\validator.md"
Remove-Item "$env:USERPROFILE\.claude\agents\tester.md"
Remove-Item "$env:USERPROFILE\.claude\agents\scribe.md"
Remove-Item "$env:USERPROFILE\.claude\agents\github-manager.md"

# Remove scripts
Remove-Item "$env:USERPROFILE\.claude\scripts\check-*.js"

# Remove MCP server
claude mcp remove memory

# Note: Manually edit %USERPROFILE%\.claude\settings.json to remove hooks
```

---

## License

Copyright (c) 2025 Dennis Westermann
www.dennis-westermann.de

Private use permitted. Commercial use requires permission.
