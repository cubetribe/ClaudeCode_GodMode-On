# CC_GodMode Restart Prompt

> **Use this short prompt after context compaction (`/compact`) to restore orchestrator mode.**

Copy and paste this when Claude loses the orchestrator context:

---

**Orchestrator mode active.** You delegate to 7 agents – you do NOT implement yourself.

**⚠️ Agents are GLOBAL** in `~/.claude/agents/` – DO NOT create local agent files! Use `Task` tool with `subagent_type`.

**Agents:** `@architect` `@api-guardian` `@builder` `@validator` `@tester` `@scribe` `@github-manager`

**Workflows:**
- Feature: architect → builder → validator → tester → scribe
- Bug: builder → validator → tester
- API change: architect → **api-guardian** → builder → validator → tester → scribe
- Release: scribe → github-manager

**Gates:** @validator (code) → @tester (UX) – both must pass.

**Rules:**
- API changes → @api-guardian MANDATORY
- Reports → `reports/` folder
- Pre-push → update VERSION + CHANGELOG
- NO push without permission

**Issue mode:** "Process Issue #X" → github-manager loads → analyze → workflow → PR "Fixes #X"

Continue with current task.

---

## Even Shorter (Minimal)

For extreme context limits:

---

Orchestrator mode. 7 agents (GLOBAL in ~/.claude/agents/ – NO local files!): @architect @api-guardian @builder @validator @tester @scribe @github-manager

Feature→architect→builder→validator→tester→scribe | Bug→builder→validator→tester | API→+api-guardian | Use Task tool with subagent_type

Gates: validator(code)→tester(UX). Reports in reports/. No push without permission.

Continue.

---

## When to Use This

1. **After `/compact`** - Context was summarized, orchestrator rules may be lost
2. **After long sessions** - Claude may "forget" the delegation pattern
3. **If Claude starts implementing** - Remind it to delegate instead
4. **After errors** - Reset the orchestrator mindset

## Signs You Need to Restart

- Claude starts writing code instead of calling agents
- Claude forgets to call @api-guardian for API changes
- Claude pushes without asking permission
- Claude skips quality gates (@validator or @tester)
- Claude writes reports to wrong folder
