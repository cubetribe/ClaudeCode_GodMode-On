# CC_GodMode Installation Prompt

> **Version:** 8.0.0
> **Type:** SYSTEM INSTALL
> **Prerequisite:** None (first-time installation)
> **Frequency:** Once per machine
> **One-Shot:** Copy this entire prompt into Claude Code and it will set up everything automatically.

> **Note:** Plugin-based installation via `.claude-plugin/` is the recommended path since v7.0.0.
> Clone the repo and follow the steps in `QUICK_START.md` or `README.md` for the plugin install path.
> This prompt remains as a manual fallback for users who prefer a guided, copy-paste setup.

---

## What's New in v8.0.0 — The Ultracode Release

### Ultracode Orchestrator Tuning

**Smart Routing (new default)**
- Risk-based minimal-agent paths replace always-running the full workflow
- Inline architecture briefs for small/medium tasks (no @architect invocation)
- Full-Gates escalation for API changes, security surfaces, new modules, breaking changes
- Targets 30–50% token reduction per standard feature
- Orchestrator model: `best` (alias for Opus 4.8; auto-upgrades when a newer model is available) at ultracode effort — set with `/model best` and `/effort ultracode`
- PARALLEL-FIRST fan-out: independent tasks spawn parallel subagents in a single message; orchestrator collects and synthesizes verdicts
- Ultracode + dynamic-workflows escalation for large decomposable jobs (fan out to tens–hundreds of verified parallel subagents)

**14 Agents (8 Core + 6 Department)**
- 6 department agents added under version control and auto-installed
- Each agent carries an `effort` field for Claude Code ≥2.1.152 budget tuning
- @scribe downgraded to haiku (templated doc work is sufficient)

**Verdict Contract**
- Agents return a structured STATUS verdict to the Orchestrator
- Full reports still written to disk and validated by `validate-agent-output.js`

**Skills Installation**
- Installs all 11 CC_GodMode skills into `~/.claude/skills/`

---

## Foundation: v6.0.0 — The Platform Release

### Architecture Revolution

**Modular CLAUDE.md**
- Reduced from 688 lines to ~65 lines (91% smaller)
- On-demand reference docs in `docs/orchestrator/`
- Less context waste = better orchestration focus

**Modern Hook System**
- SubagentStop: Deterministic agent output validation (fires on every agent completion)
- TaskCompleted: Quality gate enforcement (exit code 2 = task not complete)
- Support for new hook types: `prompt`, `agent`, `http`

**Clean Configuration**
- Updated model references (opus, sonnet, haiku)
- Removed non-standard custom fields from settings.json
- Standards-compliant hook configuration

### System Requirements

- Node.js 18+ (required)
- Claude Code CLI (latest version recommended)
- Git (for installation)
- 100MB free disk space
- Internet connection for MCP server installation

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
║   CC_GodMode Installation v8.0.0 - The Ultracode Release                  ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   Hello! I will now set up your system for CC_GodMode.                   ║
║                                                                           ║
║   What I will do for you:                                                ║
║                                                                           ║
║   1. Download the CC_GodMode repository from GitHub                      ║
║   2. Install 14 AI agents (8 core + 6 department)                        ║
║   3. Set up 15 automation scripts                                         ║
║   4. Install 11 skills, config files, and templates                       ║
║   5. Install the Memory MCP Server (for persistent knowledge)             ║
║   6. Configure 4 automatic hooks                                          ║
║   7. Set up auto-update system                                            ║
║   8. Verify everything and clean up                                       ║
║                                                                           ║
║   This will take approximately 3-7 minutes.                               ║
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
mkdir -p ~/.claude/skills
mkdir -p ~/.claude/scripts
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\agents"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\skills"
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

**Expected agents (14 files):**

Core agents (8):
- `researcher.md`
- `architect.md`
- `api-guardian.md`
- `builder.md`
- `validator.md`
- `tester.md`
- `scribe.md`
- `github-manager.md`

Department agents (6):
- `ci-security-guardian.md`
- `docs-dx.md`
- `quality-operations.md`
- `runtime-platform.md`
- `workflow-design.md`
- `workspace-governance.md`

**Install skills (11 directories):**

**macOS / Linux:**
```bash
cp -R /tmp/CC_GodMode_install/skills/* ~/.claude/skills/
ls -la ~/.claude/skills/
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode_install\skills\*" "$env:USERPROFILE\.claude\skills\" -Recurse -Force
Get-ChildItem "$env:USERPROFILE\.claude\skills\"
```

**Expected skills:**
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

**Expected scripts:**
- `check-api-impact.js`
- `parallel-quality-gates.js`
- `mcp-health-check.js`
- `analyze-prompt.js`
- `escalation-handler.js`
- `domain-pack-loader.js`
- `validate-agent-output.js`
- `auto-update.js`
- `check-update.js`
- `pre-push-check.js`
- `session-start.js`
- `sync-version.js`
- `test-phase2-integration.js`
- `version-bump.js`
- `workflow-state.js`

---

### Step 6: Install Config Files

**macOS / Linux:**
```bash
mkdir -p ~/.claude/config
cp /tmp/CC_GodMode_install/config/domain-config.schema.json ~/.claude/config/
ls -la ~/.claude/config/
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\config"
Copy-Item "$env:TEMP\CC_GodMode_install\config\domain-config.schema.json" "$env:USERPROFILE\.claude\config\" -Force
Get-ChildItem "$env:USERPROFILE\.claude\config\"
```

---

### Step 7: Install Orchestrator Template and Prompts

Copy the orchestrator template and prompt files for projects:

**macOS / Linux:**
```bash
mkdir -p ~/.claude/templates
mkdir -p ~/.claude/CC-GodMode-Prompts
cp /tmp/CC_GodMode_install/CLAUDE.md ~/.claude/templates/CLAUDE-ORCHESTRATOR.md
cp /tmp/CC_GodMode_install/templates/adr-template.md ~/.claude/templates/
cp /tmp/CC_GodMode_install/CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md ~/.claude/templates/
cp /tmp/CC_GodMode_install/CC-GodMode-Prompts/*.md ~/.claude/CC-GodMode-Prompts/
```

**Windows (PowerShell):**
```powershell
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\templates"
New-Item -ItemType Directory -Force -Path "$env:USERPROFILE\.claude\CC-GodMode-Prompts"
Copy-Item "$env:TEMP\CC_GodMode_install\CLAUDE.md" "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" -Force
Copy-Item "$env:TEMP\CC_GodMode_install\templates\adr-template.md" "$env:USERPROFILE\.claude\templates\" -Force
Copy-Item "$env:TEMP\CC_GodMode_install\CC-GodMode-Prompts\CCGM_Prompt_98-Maintenance.md" "$env:USERPROFILE\.claude\templates\" -Force
Copy-Item "$env:TEMP\CC_GodMode_install\CC-GodMode-Prompts\*.md" "$env:USERPROFILE\.claude\CC-GodMode-Prompts\" -Force
```

**Important:** These templates will be copied to each project later!

**Expected templates:**
- `CLAUDE-ORCHESTRATOR.md` - Main orchestrator configuration
- `adr-template.md` - Architecture Decision Records template
- `CCGM_Prompt_98-Maintenance.md` - Auto-update notification template

**Expected prompts (in CC-GodMode-Prompts/):**
- `CCGM_Prompt_01-SystemInstall-Auto.md` - Automated installation prompt
- `CCGM_Prompt_01-SystemInstall-Manual.md` - Manual installation guide
- `CCGM_Prompt_02-ProjectActivation.md` - Project activation guide
- `CCGM_Prompt_98-Maintenance.md` - Maintenance and update check
- `CCGM_Prompt_99-ContextRestore.md` - Context restore after /compact
- `QUICK_START.md` - Quick start guide

---

### Step 8: Install Auto-Update System

**macOS / Linux:**
```bash
cp /tmp/CC_GodMode_install/scripts/auto-update.js ~/.claude/scripts/
chmod +x ~/.claude/scripts/auto-update.js
```

**Windows (PowerShell):**
```powershell
Copy-Item "$env:TEMP\CC_GodMode_install\scripts\auto-update.js" "$env:USERPROFILE\.claude\scripts\" -Force
```

**Note:** The auto-update system checks for new versions on GitHub and notifies you.

---

### Step 9: Install Memory MCP Server

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

### Step 10: Configure Hooks

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
    ],
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "node ~/.claude/scripts/analyze-prompt.js \"$CLAUDE_USER_PROMPT\""
      }
    ],
    "SessionStart": [
      {
        "type": "command",
        "command": "node ~/.claude/scripts/session-start.js"
      }
    ],
    "SubagentStop": [
      {
        "type": "command",
        "command": "node ~/.claude/scripts/validate-agent-output.js \"$CLAUDE_SUBAGENT_TYPE\" \"$CLAUDE_SUBAGENT_OUTPUT\""
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
    ],
    "UserPromptSubmit": [
      {
        "type": "command",
        "command": "node \"%USERPROFILE%\\.claude\\scripts\\analyze-prompt.js\" \"$CLAUDE_USER_PROMPT\""
      }
    ],
    "SessionStart": [
      {
        "type": "command",
        "command": "node \"%USERPROFILE%\\.claude\\scripts\\session-start.js\""
      }
    ],
    "SubagentStop": [
      {
        "type": "command",
        "command": "node \"%USERPROFILE%\\.claude\\scripts\\validate-agent-output.js\" \"$CLAUDE_SUBAGENT_TYPE\" \"$CLAUDE_SUBAGENT_OUTPUT\""
      }
    ]
  }
}
```

**Note:** If the file already exists, merge the hooks section carefully.

**Hook Explanations:**
- **PostToolUse (Write|Edit)**: Checks for API impact after file changes
- **UserPromptSubmit**: Analyzes user prompts for task type, complexity, and workflow suggestions
- **SessionStart**: MCP health checks and system diagnostics
- **SubagentStop**: Validates agent output quality and completeness

---

### Step 11: Verify Installation

**macOS / Linux:**
```bash
echo "=== Version ==="
cat /tmp/CC_GodMode_install/VERSION

echo "=== Agents ==="
ls ~/.claude/agents/

echo "=== Skills ==="
ls ~/.claude/skills/

echo "=== Scripts ==="
ls ~/.claude/scripts/

echo "=== Config ==="
ls ~/.claude/config/

echo "=== Templates ==="
ls ~/.claude/templates/

echo "=== MCP Servers ==="
claude mcp list

echo "=== Hooks ==="
cat ~/.claude/settings.json | grep -A 5 "hooks"
```

**Windows (PowerShell):**
```powershell
Write-Host "=== Version ==="
Get-Content "$env:TEMP\CC_GodMode_install\VERSION"

Write-Host "=== Agents ==="
Get-ChildItem "$env:USERPROFILE\.claude\agents\"

Write-Host "=== Skills ==="
Get-ChildItem "$env:USERPROFILE\.claude\skills\"

Write-Host "=== Scripts ==="
Get-ChildItem "$env:USERPROFILE\.claude\scripts\"

Write-Host "=== Config ==="
Get-ChildItem "$env:USERPROFILE\.claude\config\"

Write-Host "=== Templates ==="
Get-ChildItem "$env:USERPROFILE\.claude\templates\"

Write-Host "=== MCP Servers ==="
claude mcp list

Write-Host "=== Hooks ==="
Get-Content "$env:USERPROFILE\.claude\settings.json" | Select-String -Pattern "hooks" -Context 0,5
```

---

### Step 12: Cleanup

**macOS / Linux:**
```bash
rm -rf /tmp/CC_GodMode_install
```

**Windows (PowerShell):**
```powershell
Remove-Item -Recurse -Force "$env:TEMP\CC_GodMode_install"
```

---

### Step 13: Test Orchestrator Mode

After installation, test by typing:

```
You are the Orchestrator. List your available agents.
```

The system should recognize all 14 agents (8 core + 6 department).

---

## INSTALLATION REPORT

After completing all steps, provide this summary to the user:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   CC_GodMode Installation Successful! v8.0.0 - The Ultracode Release      ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   INSTALLATION REPORT                                                     ║
║                                                                           ║
║   Version:      8.0.0                                                     ║
║   Agents:       [X]/14 installed (8 core + 6 department)                  ║
║   Skills:       [X]/11 installed                                          ║
║   Scripts:      [X]/15 installed                                          ║
║   Config:       [X]/1 installed                                           ║
║   Templates:    [X]/3 installed                                           ║
║   Prompts:      [X]/6 installed                                           ║
║   MCP Server:   memory [OK / ERROR]                                       ║
║   Hooks:        [4 Configured / Skipped]                                  ║
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
║   │  mkdir -p ./CC-GodMode-Prompts                                      │ ║
║   │  cp ~/.claude/CC-GodMode-Prompts/*.md ./CC-GodMode-Prompts/         │ ║
║   │  mkdir -p ./reports                                                 │ ║
║   └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║   Windows (PowerShell):                                                   ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  cd your-project                                                    │ ║
║   │  Copy-Item "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" ".\CLAUDE.md" -Force ║
║   │  New-Item -ItemType Directory -Force -Path ".\CC-GodMode-Prompts"  │ ║
║   │  Copy-Item "$env:USERPROFILE\.claude\CC-GodMode-Prompts\*.md" ".\CC-GodMode-Prompts\" -Force ║
║   │  New-Item -ItemType Directory -Force -Path ".\reports"             │ ║
║   └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║   The CLAUDE.md will be automatically loaded by Claude Code!             ║
║                                                                           ║
║   Then start Claude in this project:                                     ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  claude                                                             │ ║
║   │  > "New Feature: User Authentication with JWT"                      ║
║   └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║   📂 Report Structure (Version-Based)                                    ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  reports/                                                           │ ║
║   │  └── vX.X.X/                   ← Version-based folders             │ ║
║   │      ├── 00-architect-report.md                                    │ ║
║   │      ├── 01-api-guardian-report.md                                 │ ║
║   │      ├── 02-builder-report.md                                      │ ║
║   │      ├── 03-validator-report.md                                    │ ║
║   │      ├── 04-tester-report.md                                       │ ║
║   │      └── 05-scribe-report.md                                       │ ║
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

| Component | macOS/Linux | Windows | Count |
|-----------|-------------|---------|-------|
| Agent Files | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` | 14 |
| Skills | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` | 11 |
| Automation Scripts | `~/.claude/scripts/` | `%USERPROFILE%\.claude\scripts\` | 15 |
| Config Files | `~/.claude/config/` | `%USERPROFILE%\.claude\config\` | 1 |
| Templates | `~/.claude/templates/` | `%USERPROFILE%\.claude\templates\` | 3 |
| Prompt Files | `~/.claude/CC-GodMode-Prompts/` | `%USERPROFILE%\.claude\CC-GodMode-Prompts\` | 6 |
| Memory MCP | Claude MCP registry | Claude MCP registry | 1 |
| Settings | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` | 1 |

**Details:**

**Agents (14 — 8 core + 6 department):**

Core agents:
- researcher.md
- architect.md
- api-guardian.md
- builder.md
- validator.md
- tester.md
- scribe.md
- github-manager.md

Department agents:
- ci-security-guardian.md
- docs-dx.md
- quality-operations.md
- runtime-platform.md
- workflow-design.md
- workspace-governance.md

**Skills (11):**
- workflows
- quality-gates
- release
- issue-processing
- api-change
- research
- meta-decisions
- agent-teams
- prototype-mode
- departments
- cost-efficiency

**Scripts (15):**
- check-api-impact.js
- parallel-quality-gates.js
- mcp-health-check.js
- analyze-prompt.js
- escalation-handler.js
- domain-pack-loader.js
- validate-agent-output.js
- auto-update.js
- check-update.js
- pre-push-check.js
- session-start.js
- sync-version.js
- test-phase2-integration.js
- version-bump.js
- workflow-state.js

**Config (1):**
- domain-config.schema.json

**Templates (3):**
- CLAUDE-ORCHESTRATOR.md
- adr-template.md
- CCGM_Prompt_98-Maintenance.md

**Hooks (4):**
- PostToolUse (Write|Edit) - API Impact Check
- UserPromptSubmit - Prompt Analysis
- SessionStart - MCP Health & Diagnostics
- SubagentStop - Agent Output Validation

---

## Uninstall

**macOS / Linux:**
```bash
# Remove agents (core + department)
rm ~/.claude/agents/{researcher,architect,api-guardian,builder,validator,tester,scribe,github-manager}.md
rm ~/.claude/agents/{ci-security-guardian,docs-dx,quality-operations,runtime-platform,workflow-design,workspace-governance}.md

# Remove scripts
rm ~/.claude/scripts/check-api-impact.js
rm ~/.claude/scripts/parallel-quality-gates.js
rm ~/.claude/scripts/mcp-health-check.js
rm ~/.claude/scripts/analyze-prompt.js
rm ~/.claude/scripts/escalation-handler.js
rm ~/.claude/scripts/domain-pack-loader.js
rm ~/.claude/scripts/validate-agent-output.js
rm ~/.claude/scripts/auto-update.js
rm ~/.claude/scripts/session-start.js
rm ~/.claude/scripts/test-phase2-integration.js

# Remove config
rm ~/.claude/config/domain-config.schema.json

# Remove templates
rm ~/.claude/templates/CLAUDE-ORCHESTRATOR.md
rm ~/.claude/templates/adr-template.md
rm ~/.claude/templates/CCGM_Prompt_98-Maintenance.md

# Remove prompts
rm -rf ~/.claude/CC-GodMode-Prompts

# Remove MCP server
claude mcp remove memory

# Note: Manually edit ~/.claude/settings.json to remove hooks
```

**Windows (PowerShell):**
```powershell
# Remove agents (core + department)
Remove-Item "$env:USERPROFILE\.claude\agents\researcher.md"
Remove-Item "$env:USERPROFILE\.claude\agents\architect.md"
Remove-Item "$env:USERPROFILE\.claude\agents\api-guardian.md"
Remove-Item "$env:USERPROFILE\.claude\agents\builder.md"
Remove-Item "$env:USERPROFILE\.claude\agents\validator.md"
Remove-Item "$env:USERPROFILE\.claude\agents\tester.md"
Remove-Item "$env:USERPROFILE\.claude\agents\scribe.md"
Remove-Item "$env:USERPROFILE\.claude\agents\github-manager.md"
Remove-Item "$env:USERPROFILE\.claude\agents\ci-security-guardian.md"
Remove-Item "$env:USERPROFILE\.claude\agents\docs-dx.md"
Remove-Item "$env:USERPROFILE\.claude\agents\quality-operations.md"
Remove-Item "$env:USERPROFILE\.claude\agents\runtime-platform.md"
Remove-Item "$env:USERPROFILE\.claude\agents\workflow-design.md"
Remove-Item "$env:USERPROFILE\.claude\agents\workspace-governance.md"

# Remove scripts
Remove-Item "$env:USERPROFILE\.claude\scripts\check-api-impact.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\parallel-quality-gates.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\mcp-health-check.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\analyze-prompt.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\escalation-handler.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\domain-pack-loader.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\validate-agent-output.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\auto-update.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\session-start.js"
Remove-Item "$env:USERPROFILE\.claude\scripts\test-phase2-integration.js"

# Remove config
Remove-Item "$env:USERPROFILE\.claude\config\domain-config.schema.json"

# Remove templates
Remove-Item "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md"
Remove-Item "$env:USERPROFILE\.claude\templates\adr-template.md"
Remove-Item "$env:USERPROFILE\.claude\templates\CCGM_Prompt_98-Maintenance.md"

# Remove prompts
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\CC-GodMode-Prompts"

# Remove MCP server
claude mcp remove memory

# Note: Manually edit %USERPROFILE%\.claude\settings.json to remove hooks
```

---

## License

Copyright (c) 2025 Dennis Westermann
www.dennis-westermann.de

Private use permitted. Commercial use requires permission.
