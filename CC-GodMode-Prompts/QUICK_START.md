# CC_GodMode Quick Start Guide

> **Version:** 5.11.0

## First Time Installation?

### Step 1: Install System (One Time)
Choose ONE method:
- **Automated:** Use `CCGM_Prompt_01-SystemInstall-Auto.md`
- **Manual:** Use `CCGM_Prompt_01-SystemInstall-Manual.md`

### Step 2: Activate Your Project (Per Project)
Use: `CCGM_Prompt_02-ProjectActivation.md`

### Step 3: Start Working
Open Claude in your project. The Orchestrator is now active!

---

## Already Installed?

| Situation | Use This Prompt |
|-----------|-----------------|
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
    │
    ├─ YES ──► 01-SystemInstall (Auto or Manual)
    │              │
    │              ▼
    │          02-ProjectActivation
    │              │
    │              ▼
    │          Work with Orchestrator
    │              │
    │          ┌───┴───┐
    │          │       │
    │          ▼       ▼
    │      Context   Update?
    │      lost?        │
    │          │        ▼
    │          ▼    98-Maintenance
    │      99-ContextRestore
    │
    └─ NO ───► Already installed?
                   │
               ┌───┴───┐
               │       │
               ▼       ▼
           New      Update?
           project?    │
               │       ▼
               ▼   98-Maintenance
           02-ProjectActivation
```
