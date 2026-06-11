# CC_GodMode Quick Start Guide

> **Version:** 7.0.0

## Daily Usage

Once installed, just type `GodMode:` followed by your request:

```
GodMode: New Feature: user profile page with avatar upload
GodMode: Bug Fix: login button unresponsive on mobile
GodMode: Research: best state management for React 18 in 2026
```

No elaborate role prompts needed. No activation ceremony. The orchestrator reads `CLAUDE.md`
automatically when Claude Code starts in your project — you just describe the work.

---

## Installation

### Plugin Install (Recommended)

```bash
# Clone and install
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
cp agents/*.md ~/.claude/agents/
cp -R skills/* ~/.claude/skills/
cp scripts/*.js ~/.claude/scripts/ && chmod +x ~/.claude/scripts/*.js
cp CLAUDE.md ~/.claude/templates/CLAUDE-ORCHESTRATOR.md
claude mcp add memory -- npx -y @modelcontextprotocol/server-memory

# Activate in your project
cd /your/project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
claude
```

### Prompts Fallback (Manual)

Use install prompts for a guided setup. Choose ONE:
- **Automated:** `CCGM_Prompt_01-SystemInstall-Auto.md` — paste into Claude with `--dangerously-skip-permissions`
- **Manual:** `CCGM_Prompt_01-SystemInstall-Manual.md` — step-by-step instructions

Then activate your project: `CCGM_Prompt_02-ProjectActivation.md`

---

## Already Installed?

| Situation | Use This Prompt |
|-----------|----------------|
| New project to activate | `02-ProjectActivation` |
| Context lost after /compact | `99-ContextRestore` |
| Check for updates | `98-Maintenance` |

---

## Prompt Overview

| # | Prompt | Purpose | When |
|---|--------|---------|------|
| 01 | SystemInstall-Auto | Global installation (automated) | Once per machine |
| 01 | SystemInstall-Manual | Global installation (step-by-step) | Once per machine |
| 02 | ProjectActivation | Activate orchestrator for project | Once per project |
| 98 | Maintenance | Check/apply updates | Periodically |
| 99 | ContextRestore | Restore after /compact | As needed |

---

## Visual Flow

```
FIRST TIME?
    |
    +- YES --> Plugin install (recommended) or 01-SystemInstall prompt
    |              |
    |              v
    |          02-ProjectActivation
    |              |
    |              v
    |          GodMode: <your request>
    |              |
    |          +---+---+
    |          |       |
    |          v       v
    |      Context   Update?
    |      lost?        |
    |          |        v
    |          v    98-Maintenance
    |      99-ContextRestore
    |
    +- NO --> Already installed?
                   |
               +---+---+
               |       |
               v       v
           New      Update?
           project?    |
               |       v
               v   98-Maintenance
           02-ProjectActivation
```
