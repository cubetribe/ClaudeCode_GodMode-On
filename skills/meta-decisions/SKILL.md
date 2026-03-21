---
name: meta-decisions
description: "Meta-decision logic that adapts workflows based on task analysis — security overrides, breaking change escalation, performance paths, emergency hotfix, and documentation optimization"
---

# Meta-Decision Logic

The meta-decision layer analyzes user prompts and automatically adapts workflows.

## 5 Meta-Decision Rules

| Rule | Trigger Keywords | Workflow Adaptation |
|------|-----------------|---------------------|
| **securityOverride** | auth, jwt, token, password, encrypt, session | Force @validator security-focused check |
| **breakingChangeEscalation** | breaking change, deprecate, remove API, migration | Require @architect review before any change |
| **performanceCriticalPath** | performance, optimize, slow, latency, cache | Add performance benchmarks to @tester |
| **emergencyHotfix** | hotfix, urgent, critical, production down | Streamlined workflow: @builder → @validator only |
| **documentationOnly** | docs only, readme, changelog, typo fix | Skip @builder, direct to @scribe |

## Decision Flow

```
User Prompt Received
    ↓
analyze-prompt.js evaluates:
    ↓
┌─ Security keywords? → securityOverride
├─ Breaking change? → breakingChangeEscalation
├─ Performance? → performanceCriticalPath
├─ Emergency? → emergencyHotfix
└─ Docs only? → documentationOnly
    ↓
None matched → Standard workflow selection
```

## Architecture Decision Records (ADR)

Significant decisions are logged in `DECISIONS.md`:

```markdown
## ADR-[NUMBER]: [Title]

**Date:** YYYY-MM-DD
**Status:** Accepted / Superseded / Deprecated
**Context:** [Why this decision was needed]
**Decision:** [What was decided]
**Consequences:** [Impact of the decision]
```

## RARE Responsibility Matrix

For complex decisions, use the RARE matrix:

| Role | Agent | Responsibility |
|------|-------|----------------|
| **R**esponsible | @builder | Does the work |
| **A**ccountable | Orchestrator | Ensures completion |
| **R**eviewed by | @validator + @tester | Quality assurance |
| **E**scalated to | User | Final authority |

## Escalation Mechanism

When the Orchestrator cannot decide:

1. **Ambiguous task type** → Ask user for clarification
2. **Conflicting agent outputs** → Present both to user
3. **Scope creep detected** → Propose splitting into multiple tasks
4. **Critical security concern** → Stop and notify user immediately
5. **Resource limit approaching** → Suggest /compact and restart

## Issue Analysis Enhancement

When processing issues, the meta-layer adds:

```json
{
  "type": "feature|bug|enhancement",
  "complexity": "low|medium|high",
  "areas": ["api", "ui", "backend"],
  "meta_rules_triggered": ["securityOverride"],
  "workflow_adaptation": "Added security-focused @validator check"
}
```

## Emergency Hotfix Workflow

When `emergencyHotfix` is triggered:

```
User: "Hotfix: production login broken"
    ↓
@builder (immediate fix)
    ↓
@validator (security + unit tests only)
    ↓
DONE (skip @tester, @scribe — speed over process)
```

**Post-hotfix:** Schedule a follow-up with full quality gates.