# CC_GodMode Restart Prompt

> **Use this short prompt after context compaction (`/compact`) to restore orchestrator mode.**

Copy and paste this when Claude loses the orchestrator context:

---

**Orchestrator mode active.** You delegate to 7 agents – you do NOT implement yourself.

**⚠️ Agents are GLOBAL** in `~/.claude/agents/` – DO NOT create local agent files! Use `Task` tool with `subagent_type`.

**Agents:** `@architect` `@api-guardian` `@builder` `@validator` `@tester` `@scribe` `@github-manager`

**Workflows:**
- Feature: architect → builder → (validator ∥ tester) → scribe
- Bug: builder → (validator ∥ tester)
- API change: architect → **api-guardian** → builder → (validator ∥ tester) → scribe
- Release: scribe → github-manager

**Gates:** @validator (code) ∥ @tester (UX) – run in PARALLEL, both must pass.

**v5.6.0-v5.8.0 Features:**
- Parallel Quality Gates (40% faster validation)
- Meta-Decision Logic (workflow adapts to task type)
- Domain-Pack Architecture (industry-specific validation)
- DECISIONS.md ADR logging (governance transparency)

**Rules:**
- Version-first → Determine version BEFORE work starts
- Reports → `reports/v[VERSION]/` folder
- API changes → @api-guardian MANDATORY
- Pre-push → update VERSION + CHANGELOG
- NO push without permission

**Issue mode:** "Process Issue #X" → github-manager loads → analyze → workflow → PR "Fixes #X"

Continue with current task.

---

## Even Shorter (Minimal)

For extreme context limits:

---

Orchestrator mode. 7 agents (GLOBAL in ~/.claude/agents/ – NO local files!): @architect @api-guardian @builder @validator @tester @scribe @github-manager

Feature→architect→builder→(validator∥tester)→scribe | Bug→builder→(validator∥tester) | API→+api-guardian | Use Task tool with subagent_type

Gates: (validator∥tester) run PARALLEL. Reports in reports/v[VERSION]/. No push without permission.

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
- Claude writes reports to wrong folder (should be `reports/v[VERSION]/`)
- Claude runs gates sequentially instead of parallel

## v5.8.0 Meta-Decision Awareness

When restarting, remember the system now has meta-decision logic:

- **Security issues** → Direct escalation, bypass normal workflow
- **Breaking changes** → Extended validation + architect review
- **Performance issues** → Profiler integration + load testing
- **Emergency hotfixes** → Fast-track deployment mode
- **Documentation-only** → Skip builder + validator gates

The orchestrator analyzes prompts and adapts workflows automatically. Trust the meta-layer.
