# Agent Architecture - Local vs Global

> **Understanding the Two-Location Model in CC_GodMode**

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
│  ├── validator.md          ← Updated via git                        │
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
│  ├── validator.md          ← Task tool uses these                   │
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

### First-Time Setup

```bash
# 1. Clone CC_GodMode repository
git clone https://github.com/user/CC_GodMode.git
cd CC_GodMode

# 2. Create global agent directory
mkdir -p ~/.claude/agents

# 3. Copy agents to global location
cp agents/*.md ~/.claude/agents/

# 4. Verify installation
ls -la ~/.claude/agents/

# You should see:
# architect.md
# api-guardian.md
# builder.md
# validator.md
# tester.md
# scribe.md
# github-manager.md
```

### Updating Agents

```bash
# When agents are updated in the repository:

# 1. Pull latest changes
cd /path/to/CC_GodMode
git pull origin main

# 2. Re-copy agents to global location
cp agents/*.md ~/.claude/agents/

# 3. Verify update (check file modification times)
ls -lt ~/.claude/agents/
```

### Verification

```bash
# Check that agents are installed correctly:

# 1. List global agents
ls -la ~/.claude/agents/

# 2. Check an agent file exists and is readable
cat ~/.claude/agents/architect.md | head -20

# 3. Verify frontmatter is valid
head -6 ~/.claude/agents/architect.md

# Should show:
# ---
# name: architect
# description: ...
# tools: ...
# model: ...
# ---
```

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

### 1. Always Update Both Locations

```bash
# After editing agents:
# ✅ DO THIS:
vim CC_GodMode/agents/architect.md
cp CC_GodMode/agents/architect.md ~/.claude/agents/
git commit -am "feat: improve architect"

# ❌ DON'T DO THIS:
vim ~/.claude/agents/architect.md  # Changes not version controlled!
```

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
# Install agents
cp CC_GodMode/agents/*.md ~/.claude/agents/

# Update agents
cp CC_GodMode/agents/*.md ~/.claude/agents/

# Check sync status
diff -r CC_GodMode/agents/ ~/.claude/agents/
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
