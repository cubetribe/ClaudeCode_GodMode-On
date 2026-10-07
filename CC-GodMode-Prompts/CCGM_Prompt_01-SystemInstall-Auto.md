# CC_GodMode Installation Prompt

> **Version:** 8.6.0
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
- Orchestrator model: `opus` (Opus 5.5, recommended) — set with `/model opus`. `/effort ultracode` is an optional session-only switch that turns on automatic dynamic workflows and leaves the effort level unchanged (requires dynamic workflows enabled in `/config`); `/effort xhigh` is an optional separate effort level. `best` resolves to Fable 5.1 where available (about 2.5× Opus 5.5's list price) and is an optional upgrade
- PARALLEL-FIRST fan-out: independent tasks spawn parallel subagents in a single message; orchestrator collects and synthesizes verdicts
- Ultracode + dynamic-workflows escalation for large decomposable jobs (fan out to tens–hundreds of verified parallel subagents)

**14 Agents (7 Core + 1 Security Gate + 6 Department)**
- 6 department agents added under version control and auto-installed
- Each agent carries an `effort` field for Claude Code ≥2.1.152 budget tuning
- @scribe downgraded to haiku (templated doc work is sufficient)

**Verdict Contract**
- Agents return a structured STATUS verdict to the Orchestrator
- Full reports still written to disk and validated by `validate-agent-output.js`

**Skills Installation**
- Installs all 14 CC_GodMode skills into `~/.claude/skills/` (incl. sprint-planning, dynamic-workflows, greenfield-bootstrap)

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
║   CC_GodMode Installation v8.6.0                                          ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   Hello! I will now install/update your system for CC_GodMode.            ║
║                                                                           ║
║   What I will do for you:                                                 ║
║                                                                           ║
║   1. Clone (or update) the CC_GodMode repository from GitHub              ║
║   2. Run: ./scripts/apply-global-claude-setup.sh                          ║
║   3. That installs 14 agents, 14 skills, and 18 scripts                   ║
║   4. It wires the GodMode hooks into ~/.claude/settings.json              ║
║   5. Verify the result: node scripts/verify-install.js                    ║
║                                                                           ║
║   This will take approximately 1-3 minutes.                               ║
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

There is exactly one installation mechanism: `scripts/apply-global-claude-setup.sh`
(macOS/Linux) or `scripts/apply-global-claude-setup.ps1` (Windows). It is idempotent —
the same command is also the update path later. Do not hand-copy individual files; the
script is the single source of truth for what gets installed and where.

### Step 0: Detect Operating System

```bash
node -e "console.log(process.platform)"
```

**Evaluate result:**
- `darwin` / `linux` → use the `.sh` script (bash)
- `win32` → use the `.ps1` script (PowerShell)

---

### Step 1: Prerequisites Check

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

### Step 2: Clone the Repository

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

**If clone fails:** The repo might be private or renamed. Report the error.

Keep this clone around — it is also where you run updates from later
(`git pull && ./scripts/apply-global-claude-setup.sh`), and where the
`CC-GodMode-Prompts/` files live that you copy into each project (Step 6).

---

### Step 3: Run the Installer

**macOS / Linux:**
```bash
./scripts/apply-global-claude-setup.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\apply-global-claude-setup.ps1
```

This single run:
- Copies all 14 agents into `~/.claude/agents/`
- Copies all 14 skills into `~/.claude/skills/`
- Copies all scripts into `~/.claude/scripts/`
- Copies `CLAUDE.md` to `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` and
  `CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md` to `~/.claude/templates/`
- Copies `LICENSE`/`NOTICE` into `~/.claude/`
- Backs up anything it is about to overwrite (timestamped, under
  `~/.claude/backups/install-archives/`)
- Merges the canonical hook wiring from `config/claude-settings.json` into
  `~/.claude/settings.json` — only the `hooks` key is touched; any other keys you
  already have there (`model`, `effortLevel`, `permissions`, your own hooks) are
  preserved as-is
- Writes `~/.claude/.cc-godmode-version` so future runs know whether an update
  actually changed anything

If you manage hook wiring yourself and don't want the script to touch
`settings.json`, add `--no-hooks`.

**Note:** This script does **not** install MCP servers (memory, playwright, …) —
that is the separate, opt-in `scripts/install-mcps.sh` (Step 4).

---

### Step 4: Install MCP Servers (optional, separate from the runtime install)

```bash
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory
```

**Verify:**
```bash
claude mcp list
```

Other MCP servers (`playwright`, `github`, …) are the user's own choice — see
`scripts/install-mcps.sh` for the available options. None of them are required
for the core agent/skill/hook runtime installed in Step 3.

---

### Step 5: Verify the Installation

```bash
node scripts/verify-install.js
```

- **Exit code 0** — every agent, every skill, the hook wiring, the orchestrator
  template, and LICENSE/NOTICE are present and match this repo's version.
- **Exit code non-zero** — the script prints the concrete list of what's missing.
  Re-run Step 3; if the problem persists, report the exact output.

You can also run the built-in check baked into the installer itself:

```bash
./scripts/apply-global-claude-setup.sh --check
```

---

### Step 6: Test Orchestrator Mode

After installation, activate a project (there is no global `~/.claude/CLAUDE.md` —
the orchestrator template lives at `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` and
is copied per-project):

```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
mkdir -p ./CC-GodMode-Prompts
cp <path-to-your-clone>/CC-GodMode-Prompts/*.md ./CC-GodMode-Prompts/
claude
```

Then, inside Claude Code for that project, type:

```
You are the Orchestrator. List your available agents.
```

The system should recognize all 14 agents (7 core + 1 security gate + 6 department).

---

## INSTALLATION REPORT

After completing all steps, provide this summary to the user:

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   CC_GodMode Installation Successful! v8.6.0                              ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   INSTALLATION REPORT                                                     ║
║                                                                           ║
║   Version:      8.6.0                                                     ║
║   Agents:       [X]/14 installed (7 core + 1 security + 6 department)     ║
║   Skills:       [X]/14 installed                                          ║
║   Scripts:      [X]/15 installed                                          ║
║   Templates:    [X]/2 installed (orchestrator + project-activation)       ║
║   License:      [X]/2 installed (LICENSE, NOTICE)                         ║
║   MCP Server:   memory [OK / ERROR / not installed]                       ║
║   Hooks:        [Wired into settings.json / Skipped --no-hooks]           ║
║   Verify:       node scripts/verify-install.js -> [Exit 0 / Exit 1]       ║
║                                                                           ║
╠═══════════════════════════════════════════════════════════════════════════╣
║                                                                           ║
║   🎯 HOW TO ACTIVATE A PROJECT                                            ║
║                                                                           ║
║   For EVERY project where you want to use CC_GodMode:                    ║
║                                                                           ║
║   There is no global ~/.claude/CLAUDE.md — the orchestrator template is   ║
║   copied per project from ~/.claude/templates/CLAUDE-ORCHESTRATOR.md.     ║
║                                                                           ║
║   macOS/Linux:                                                            ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  cd your-project                                                    │ ║
║   │  cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md          │ ║
║   │  mkdir -p ./CC-GodMode-Prompts ./reports                            │ ║
║   │  cp <your-clone>/CC-GodMode-Prompts/*.md ./CC-GodMode-Prompts/      │ ║
║   └─────────────────────────────────────────────────────────────────────┘ ║
║                                                                           ║
║   Windows (PowerShell):                                                   ║
║   ┌─────────────────────────────────────────────────────────────────────┐ ║
║   │  cd your-project                                                    │ ║
║   │  Copy-Item "$env:USERPROFILE\.claude\templates\CLAUDE-ORCHESTRATOR.md" ".\CLAUDE.md" -Force ║
║   │  New-Item -ItemType Directory -Force -Path ".\CC-GodMode-Prompts",".\reports" ║
║   │  Copy-Item "<your-clone>\CC-GodMode-Prompts\*.md" ".\CC-GodMode-Prompts\" -Force ║
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
║   │      ├── 03-tester-report.md (only if ux_gate: auto)               │ ║
║   │      └── 04-scribe-report.md                                       │ ║
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

### Hooks not wired / `verify-install.js` reports missing hooks

Re-run the installer without `--no-hooks`:

```bash
./scripts/apply-global-claude-setup.sh
```

If `~/.claude/settings.json` already existed and was invalid JSON, the installer
refuses to touch it (to avoid corrupting it) — fix the JSON syntax first, then
re-run.

### Permission Denied (macOS/Linux only)

The installer preserves executable bits itself; if a script still can't run:

```bash
chmod +x ~/.claude/scripts/*.js
```

### Agents Not Found

**macOS / Linux:**
```bash
ls ~/.claude/agents/
```

**Windows (PowerShell):**
```powershell
Get-ChildItem "$env:USERPROFILE\.claude\agents\"
```

If files are missing, re-run the installer (Step 3) — it is idempotent and safe
to run again.

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

Everything below is installed by `scripts/apply-global-claude-setup.sh` /
`.ps1` in one run — there is no separate manual step for any of it.

| Component | macOS/Linux | Windows | Count |
|-----------|-------------|---------|-------|
| Agent Files | `~/.claude/agents/` | `%USERPROFILE%\.claude\agents\` | 14 |
| Skills | `~/.claude/skills/` | `%USERPROFILE%\.claude\skills\` | 14 |
| Automation Scripts | `~/.claude/scripts/` | `%USERPROFILE%\.claude\scripts\` | all `*.js` in the repo's `scripts/` |
| Orchestrator Template | `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` | `%USERPROFILE%\.claude\templates\CLAUDE-ORCHESTRATOR.md` | 1 |
| Project-Activation Template | `~/.claude/templates/CCGM_Prompt_02-ProjectActivation.md` | `%USERPROFILE%\.claude\templates\...` | 1 |
| License / Notice | `~/.claude/LICENSE-CC_GodMode.txt`, `NOTICE-CC_GodMode.txt` | same, under `%USERPROFILE%\.claude\` | 2 |
| Hooks (merged) | `~/.claude/settings.json` | `%USERPROFILE%\.claude\settings.json` | from `config/claude-settings.json` |
| Memory MCP (separate step) | Claude MCP registry | Claude MCP registry | 1 |

Not installed by this script: `config/domain-config.schema.json` and the full
`CC-GodMode-Prompts/` directory stay in your repo clone — copy the ones you need
per project from there (see Step 6). MCP servers beyond `memory` are a separate,
opt-in step (`scripts/install-mcps.sh`).

**Details:**

**Agents (14 — 7 core + 1 security gate + 6 department):**

Core agents:
- researcher.md
- architect.md
- api-guardian.md
- builder.md
- tester.md
- scribe.md
- github-manager.md

Security gate:
- security.md

Department agents:
- ci-security-guardian.md
- docs-dx.md
- quality-operations.md
- runtime-platform.md
- workflow-design.md
- workspace-governance.md

**Skills (14):**
- agent-teams
- api-change
- cost-efficiency
- departments
- dynamic-workflows
- greenfield-bootstrap
- issue-processing
- meta-decisions
- prototype-mode
- quality-gates
- release
- research
- sprint-planning
- workflows

**Scripts:** every `*.js` file under the repo's `scripts/` directory (the exact
list changes as the project evolves — `ls ~/.claude/scripts/` after install
shows what actually shipped).

**Templates (2):**
- CLAUDE-ORCHESTRATOR.md
- CCGM_Prompt_02-ProjectActivation.md

**Hooks (from `config/claude-settings.json`):**
- `SessionStart` - `session-start.js` (MCP health & diagnostics)
- `PostToolUse` (Write|Edit) - `check-api-impact.js` (API impact check)
- `SubagentStop` - `verify-changes.js` + `validate-agent-output.js` (deterministic checks + output validation)
- `TaskCompleted`, `TeammateIdle` - `validate-agent-output.js`

The exact set is whatever `config/claude-settings.json` defines in this repo —
that file, not this prompt, is the canonical source; `verify-install.js` checks
against it directly.

(`UserPromptSubmit` is not installed by Step 10 above — `analyze-prompt.js`
is deprecated since v8.6.0. `config/claude-settings.json` in the repo wires
two additional events not covered by this manual install walkthrough,
`TaskCompleted` and `TeammateIdle`, both routed to
`validate-agent-output.js`; add them here too if you want full parity with
the repo's reference settings file.)

---

## Uninstall

There is no uninstall script; remove the installed directories/files by hand.
Back up `~/.claude/settings.json` first if you want to keep your other settings —
removing the `hooks` block manually is safer than deleting the whole file.

**macOS / Linux:**
```bash
# Remove agents (all 14 — core + security gate + department)
rm ~/.claude/agents/{researcher,architect,api-guardian,builder,tester,scribe,github-manager}.md
rm ~/.claude/agents/{security,ci-security-guardian,docs-dx,quality-operations,runtime-platform,workflow-design,workspace-governance}.md

# Remove scripts and skills
rm -rf ~/.claude/scripts
rm -rf ~/.claude/skills

# Remove templates
rm -rf ~/.claude/templates

# Remove license/notice
rm -f ~/.claude/LICENSE-CC_GodMode.txt ~/.claude/NOTICE-CC_GodMode.txt

# Remove version marker
rm -f ~/.claude/.cc-godmode-version

# Remove MCP server
claude mcp remove memory

# Note: edit ~/.claude/settings.json by hand to remove the GodMode hooks block
# if you want to keep other settings you have there.
```

**Windows (PowerShell):**
```powershell
# Remove agents (all 14 — core + security gate + department)
Remove-Item "$env:USERPROFILE\.claude\agents\*.md"

# Remove scripts and skills
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\scripts"
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\skills"

# Remove templates
Remove-Item -Recurse -Force "$env:USERPROFILE\.claude\templates"

# Remove license/notice
Remove-Item "$env:USERPROFILE\.claude\LICENSE-CC_GodMode.txt","$env:USERPROFILE\.claude\NOTICE-CC_GodMode.txt" -ErrorAction SilentlyContinue

# Remove version marker
Remove-Item "$env:USERPROFILE\.claude\.cc-godmode-version" -ErrorAction SilentlyContinue

# Remove MCP server
claude mcp remove memory

# Note: edit %USERPROFILE%\.claude\settings.json by hand to remove the GodMode
# hooks block if you want to keep other settings you have there.
```

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
