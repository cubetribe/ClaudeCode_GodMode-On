# CC_GodMode Quick Start Guide

> **Version:** 8.0.1

## Daily Usage — Two Steps

Each session, two steps unlock the full parallel-first system:

**Step 1 — Turn on Ultracode** (session-scoped; set it once per session via the effort selector at
the bottom of Claude Code, or by command):

```
/model best        # Opus 4.8 today; auto-upgrades as higher tiers unlock
/effort ultracode  # xhigh reasoning + automatic parallel dynamic workflows
```

**Step 2 — Type `GodMode:`** followed by your request:

```
GodMode: New Feature: user profile page with avatar upload
GodMode: Bug Fix: login button unresponsive on mobile
GodMode: Research: best state management for React 18 in 2026
```

No elaborate role prompts needed — the orchestrator reads `CLAUDE.md` automatically when Claude Code
starts in your project. Ultracode is the one thing that does **not** persist across sessions, so make
Step 1 a habit; without it GodMode still orchestrates, just at lower parallel width. The trigger
`GodMode:` is case-insensitive (`GODMODE:` works too).

---

## Installation (30 seconds)

### Script Install (Recommended)

```bash
# Clone and run the setup script
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On

# macOS / Linux:
./scripts/apply-global-claude-setup.sh
./scripts/apply-global-claude-setup.sh --check   # Verify

# Windows (PowerShell):
.\scripts\apply-global-claude-setup.ps1
.\scripts\apply-global-claude-setup.ps1 -Check   # Verify
```

### Then Activate Your Project

```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
claude
```

### Fallback: Manual Prompts

If the script doesn't work:
- **Automated:** `CCGM_Prompt_01-SystemInstall-Auto.md` — paste with `--dangerously-skip-permissions`
- **Manual:** `CCGM_Prompt_01-SystemInstall-Manual.md` — step-by-step walkthrough

Then activate: `CCGM_Prompt_02-ProjectActivation.md`

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
