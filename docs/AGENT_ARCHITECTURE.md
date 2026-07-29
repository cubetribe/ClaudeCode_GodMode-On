# Agent Architecture - Local vs Global

> **Understanding the Two-Location Model in CC_GodMode**

> ⚠️ **Maintenance note (2026-07-06, updated 2026-07-28):** the conceptual two-location model below
> is current, but the agent tree in the diagrams reflects an older 6-agent generation and predates
> @validator's removal — the current roster is 14 agents (7 core + 1 security gate + 6 department),
> not 6 or 7; @validator no longer exists (its deterministic part moved into a hook, its judgment
> part into `/code-review`). For the authoritative roster see `docs/orchestrator/AGENTS.md`. The
> Installation Procedures section below has been corrected to the actual installer command,
> including hook wiring and `verify-install.js`; the illustrative diagrams and manual `cp` examples
> elsewhere in this file are conceptual only — never hand-copy individual agent files (see
> `docs/INSTALLATION.md`).

---

## Overview

CC_GodMode uses a **two-location agent model** where agent files exist in two places:
1. **Source Location** (`/agents/` in GitHub repo) - Version-controlled source of truth
2. **Runtime Location** (`~/.claude/agents/` on your machine) - Active agent definitions

This document explains why this architecture exists, how to work with it, and how to troubleshoot common issues.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                         GITHUB REPOSITORY                            │
│                     github.com/user/CC_GodMode                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /agents/                                                            │
│  ├── architect.md          ← SOURCE OF TRUTH                        │
│  ├── api-guardian.md       ← Version controlled                     │
│  ├── builder.md            ← Shared across projects                 │
│  ├── tester.md                                                       │
│  ├── scribe.md                                                       │
│  └── github-manager.md                                               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ git clone / git pull
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        YOUR LOCAL MACHINE                            │
│              ~/Desktop/.../CC_GodMode/agents/                        │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ✓ You have local copies                                            │
│  ✓ Can edit for testing                                             │
│  ✓ Can compare with runtime versions                                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ Installation
                                  │ cp agents/*.md ~/.claude/agents/
                                  │
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CLAUDE CODE RUNTIME                               │
│                    ~/.claude/agents/                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  /Users/yourname/.claude/agents/                                     │
│  ├── architect.md          ← ACTIVE RUNTIME                         │
│  ├── api-guardian.md       ← Claude Code reads from here            │
│  ├── builder.md            ← Global across ALL projects             │
│  ├── tester.md                                                       │
│  ├── scribe.md                                                       │
│  └── github-manager.md                                               │
│                                                                      │
│  When you call: @architect                                           │
│  Claude Code executes: ~/.claude/agents/architect.md                │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Why Two Locations?

### Source Location (`/agents/` in repo)

**Purpose:** Version control and distribution
**Benefits:**
- Track agent evolution over time via git history
- Share agent improvements across projects
- Document agent capabilities for the community
- Enable collaborative agent development

**You interact with these when:**
- Developing new agent features
- Reviewing agent changes in PRs
- Learning how agents work
- Contributing agent improvements

### Runtime Location (`~/.claude/agents/`)

**Purpose:** Active execution by Claude Code
**Benefits:**
- Global availability across ALL projects
- No need to duplicate agents per project
- Single source for Claude Code Task tool
- Consistent agent behavior everywhere

**Claude Code interacts with these when:**
- You call `@architect` in ANY project
- Task tool needs to spawn subagent
- Agent delegation happens automatically

---

## Installation Procedures

**Do not hand-copy individual agent files.** The diagram above illustrates the two-location
*concept*; the actual mechanism is the setup script, which installs and updates all 14 agents (7
core + 1 security gate + 6 department), all 14 skills, scripts, templates, LICENSE/NOTICE — and,
as of v8.7.0, the hook wiring in `~/.claude/settings.json` — in one pass. Manual `cp` of a single
agent file leaves the rest of the runtime (skills, hooks, templates) out of sync with the repo.

### First-Time Setup

```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
./scripts/apply-global-claude-setup.sh          # macOS / Linux
# or
.\scripts\apply-global-claude-setup.ps1         # Windows PowerShell
```

This installs all agents into `~/.claude/agents/`, all skills into `~/.claude/skills/`, and merges
the canonical hook configuration from `config/claude-settings.json` into `~/.claude/settings.json`
(a merge of the `hooks` key only — any other keys you already have, such as `model` or
`permissions`, are preserved; a timestamped backup is written first). Without this step wired,
the enforcement layer — `check-api-impact.js`, `verify-changes.js`, `session-start.js` — does not
fire. Opt out of hook wiring with `--no-hooks` if you manage `settings.json` yourself; repair it
later with `--fix-hooks`. Full details: `docs/INSTALLATION.md`.

### Updating Agents

Same command as install — there is no separate updater:

```bash
cd ClaudeCode_GodMode-On
git pull && ./scripts/apply-global-claude-setup.sh
```

The script is idempotent: re-running it does not duplicate hook entries, and it reports the
installed version against the repository `VERSION` so you can see whether anything changed.

### Verification

```bash
node scripts/verify-install.js
```

Confirms all 14 agents and all 14 skills are present under `~/.claude/`, that the hooks from
`config/claude-settings.json` are wired into `~/.claude/settings.json` and point at files that
actually exist, that `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` and LICENSE/NOTICE are present,
and that the installed version matches the repo's `VERSION`. Exit 0 means the install is complete;
exit 1 lists exactly what's missing. This is the load-bearing check — treat a passing
`verify-install.js` as the definition of "installed correctly", not a manual `ls`.

---

## Working with Agents

### Development Workflow

```bash
# When developing agent improvements:

# 1. Edit source file
vim CC_GodMode/agents/architect.md

# 2. Test locally by copying to runtime
cp CC_GodMode/agents/architect.md ~/.claude/agents/

# 3. Test in any project
cd ~/some-other-project
# Call @architect and observe behavior

# 4. If good, commit to git
cd CC_GodMode
git add agents/architect.md
git commit -m "feat: improve architect agent"
```

### Troubleshooting Agent Behavior

```bash
# If an agent isn't working as expected:

# 1. Check which version is active
diff CC_GodMode/agents/architect.md ~/.claude/agents/architect.md

# 2. If different, decide which is correct:

# Option A: Source is correct (update runtime)
cp CC_GodMode/agents/architect.md ~/.claude/agents/

# Option B: Runtime is correct (update source)
cp ~/.claude/agents/architect.md CC_GodMode/agents/
cd CC_GodMode && git commit -am "fix: update architect from runtime"
```

---

## Common Issues & Solutions

### Issue 1: Agent Not Found

**Symptoms:**
```
Error: Agent 'architect' not found
```

**Solution:**
```bash
# Check if agent file exists
ls ~/.claude/agents/architect.md

# If not, install it:
cp CC_GodMode/agents/architect.md ~/.claude/agents/
```

### Issue 2: Agent Using Old Behavior

**Symptoms:**
- Agent does something that was changed in recent update
- Agent output doesn't match documentation

**Solution:**
```bash
# Update runtime version from source
cp CC_GodMode/agents/*.md ~/.claude/agents/

# Verify update timestamp
ls -lt ~/.claude/agents/architect.md
```

### Issue 3: Local Changes Not Working

**Symptoms:**
- You edited `CC_GodMode/agents/architect.md`
- But @architect still shows old behavior

**Solution:**
```bash
# You forgot to copy to runtime location!
cp CC_GodMode/agents/architect.md ~/.claude/agents/

# Always copy after editing source files
```

### Issue 4: Different Behavior Across Projects

**Symptoms:**
- Agent works differently in project A vs project B
- Inconsistent agent behavior

**Solution:**
```bash
# This should NOT happen (agents are global)
# Check if you have local agent files overriding global ones

# In each project, check for local agents:
ls .claude/agents/  # Should NOT exist

# If exists, remove local overrides:
rm -rf .claude/agents/

# Agents should ONLY be in ~/.claude/agents/
```

---

## Best Practices

### 1. Always Update Both Locations — the Repo Is the Source, `~/.claude/` Is Disposable

```bash
# After editing agents:
# ✅ DO THIS:
vim CC_GodMode/agents/architect.md
cp CC_GodMode/agents/architect.md ~/.claude/agents/
git commit -am "feat: improve architect"

# ❌ DON'T DO THIS:
vim ~/.claude/agents/architect.md  # Changes not version controlled!
```

`~/.claude/` is a deployment target that `apply-global-claude-setup.sh` treats as disposable and
overwrites on every run — anything edited only there is silently lost on the next install/update.
This is not hypothetical: in this project's history a health-cache fix and a hook registration were
each made once directly in the installed copy and once wiped out by the next reinstall. Change the
repo, then run the installer — never the other way around.

### 2. Test Before Committing

```bash
# Test agent changes in runtime before committing:
cp CC_GodMode/agents/architect.md ~/.claude/agents/
# Test in various projects...
# If good:
cd CC_GodMode && git commit -am "feat: tested change"
```

### 3. Keep Agents Synchronized

```bash
# Periodically check for drift:
diff -r CC_GodMode/agents/ ~/.claude/agents/

# If differences found, decide which is correct and synchronize
```

### 4. Document Agent Changes

```markdown
# When modifying agents, document in commit message:

git commit -m "feat(architect): add REQUEST TO ORCHESTRATOR pattern

- Added explicit note about no Bash access
- Clarified delegation pattern
- Updated dependency check examples

Resolves: Issue #1"
```

---

## Advanced Topics

### Creating New Agents

```bash
# To add a new agent to the system:

# 1. Create in source location
cat > CC_GodMode/agents/new-agent.md << 'EOF'
---
name: new-agent
description: What this agent does
tools: Read, Write
model: sonnet
---

# @new-agent - Role Name

Agent instructions here...
EOF

# 2. Copy to runtime
cp CC_GodMode/agents/new-agent.md ~/.claude/agents/

# 3. Test
# Call @new-agent in any project

# 4. Commit
cd CC_GodMode
git add agents/new-agent.md
git commit -m "feat: add new-agent for X functionality"
```

### Agent Inheritance

Agents can reference other agents, but they don't inherit configuration.
Each agent is independent and self-contained.

### Multi-Project Consistency

Because agents are global (`~/.claude/agents/`), they work identically across all projects on your machine. This ensures:
- Consistent workflow patterns
- No per-project agent configuration
- Single source of truth for agent behavior

---

## Rationale for Global Agent Design

### Why Global Instead of Local?

**1. Consistency Across Projects**
- Same agents, same behavior, everywhere
- No confusion about which agent version is active
- Reduces maintenance burden

**2. Single Source of Truth**
- One location for Claude Code to read from
- No ambiguity about which agent file to use
- Clear update path

**3. Reduced Duplication**
- Don't need to copy agents to every project
- Updates propagate globally
- Disk space savings

**4. Easier Maintenance**
- Update once, affects all projects
- Clear separation: source vs runtime
- Git tracks source, runtime is deployment

### When Might You Want Local Agents?

In rare cases, you might want project-specific agent behavior:
- Experimental agent features for one project
- Project-specific tool integrations
- Testing agent changes before global deployment

**For these cases:**
```bash
# Create project-local agent override (use sparingly!)
mkdir -p .claude/agents
cp ~/.claude/agents/architect.md .claude/agents/
# Edit .claude/agents/architect.md for project-specific behavior

# Note: This is NOT recommended for normal use
# It breaks the global consistency model
```

---

## Summary

**Two-Location Model:**
- **Source** (`/agents/` in repo): Version-controlled, shared, documented
- **Runtime** (`~/.claude/agents/`): Active execution, global, consistent

**Key Commands:**
```bash
# Install / update (identical command, idempotent)
git pull && ./scripts/apply-global-claude-setup.sh

# Verify the install
node scripts/verify-install.js

# Check sync status of a single agent (debugging only)
diff CC_GodMode/agents/architect.md ~/.claude/agents/architect.md
```

**Remember:**
- Agents are global and consistent across all projects
- Source location is for development and version control
- Runtime location is what Claude Code actually uses
- Always keep both locations synchronized

---

**For more information:**
- See [AGENT_MODEL_SELECTION.md](./AGENT_MODEL_SELECTION.md) for cost optimization
- See [CLAUDE.md](../CLAUDE.md) for orchestrator configuration
- See [agents/](../agents/) for individual agent documentation
