---
name: meta-decisions
description: "Meta-decision logic that adapts workflows based on task analysis — security overrides, breaking change escalation, performance paths, emergency hotfix, and documentation optimization"
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
---

# Meta-Decision Logic

The meta-decision layer analyzes user prompts and automatically adapts workflows.

## 5 Meta-Decision Rules

| Rule | Trigger Keywords | Workflow Adaptation |
|------|-----------------|---------------------|
| **securityOverride** | auth, jwt, token, password, encrypt, session | Force @security check on this surface |
| **breakingChangeEscalation** | breaking change, deprecate, remove API, migration | Require @architect review before any change |
| **performanceCriticalPath** | performance, optimize, slow, latency, cache | Add performance benchmarks to @tester |
| **emergencyHotfix** | hotfix, urgent, critical, production down | Streamlined workflow: @builder → deterministic hook, with any skipped gate logged in the Routing Log |
| **documentationOnly** | docs only, readme, typo fix | Skip @builder, direct to @scribe. **Precedence:** if the change WRITES release artifacts (`VERSION`, `CHANGELOG.md` beyond the sprint-integration `[Unreleased]` entry), the release-artifact risk signal wins and the release law applies (`docs/orchestrator/VERSIONING.md`) |

## Decision Flow

```
User Prompt Received
    ↓
Orchestrator applies the meta-decision rules natively (Core Rule 3), evaluating:
    ↓
┌─ Security keywords? → securityOverride
├─ Breaking change? → breakingChangeEscalation
├─ Performance? → performanceCriticalPath
├─ Emergency? → emergencyHotfix
└─ Docs only? → documentationOnly
    ↓
None matched → Standard workflow selection
```

**Note:** `scripts/analyze-prompt.js` implemented an earlier version of this logic
as a `UserPromptSubmit` hook. That wiring was removed in v8.5.0 and the script has
been deprecated since v8.6.0 — it is kept for reference only. The rules above are
applied natively by the Orchestrator, not by a wired hook
(`docs/orchestrator/META-DECISIONS.md`).

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
| **R**eviewed by | deterministic hook + @tester/@security/`/code-review` as declared/applicable | Quality assurance |
| **E**scalated to | User | Final authority |

## Escalation Mechanism

Three-tier error handling, expressed as an explicit decision tree so every trigger is
classified MANDATORY (must escalate, no orchestrator discretion) or OPTIONAL
(orchestrator judgment call, logged). Authoritative definition:
`docs/orchestrator/META-DECISIONS.md` § Escalation Decision Tree.

### Escalation Decision Tree

```
START: an agent, gate, or the orchestrator hits friction
│
├─ Is it a retriable tool error or a missing input the agent can find itself?
│  └─ YES ─▶ TIER 1 (agent self-resolution)
│            - max 2 attempts, same agent, same scope
│            - attempt 2 still fails ─▶ fall through to TIER 2
│
├─ Is it a write-scope conflict, a gate failure with actionable findings,
│  or a mid-sprint routing re-classification (new risk signal appeared)?
│  └─ YES ─▶ TIER 2 (orchestrator resolution)
│            - BLOCKED (conflict)  → orchestrator resolves ownership, re-dispatches
│            - BLOCKED (quality)   → merge findings, rework loop back to @builder
│            - new risk signal     → re-route Smart Routing → Full-Gates, log why
│
└─ Is it one of the following?
   │
   ├─ MANDATORY (Tier 3 human escalation — no orchestrator override):
   │  - security-relevant finding (any agent, any tier)
   │  - scope change vs. the approved plan/sprint file
   │  - verdict conflict NOT resolvable by written criteria
   │    (see Finding-Conflict Adjudication in `docs/orchestrator/QUALITY-GATES.md`)
   │  - any destructive/irreversible action (force-push, history rewrite,
   │    data deletion, prod deploy)
   │  - release/publish steps (tag, GitHub Release, npm publish, merge to main)
   │  - architecture selection between two or more workable alternatives
   │  - design-taste decisions no written criterion can resolve (API
   │    ergonomics, public-surface naming, UX judgment)
   │  - suspicion that the request itself is malformed (requirements
   │    silently conflict, a "bug fix" is actually a design flaw)
   │  - any decision where the Finding-Conflict Adjudication procedure
   │    hit Step 3
   │
   └─ OPTIONAL (orchestrator judgment — permitted to proceed without asking,
      but MUST be logged in the sprint's Routing Log):
      - cost overruns (token/time budget exceeded)
      - repeated rework loops (>2 cycles through Tier 2 on the same item)
      - ambiguity that slows progress but does not block a gate or a write
```

Judgment-class triggers (four classes — architecture choice between valid
alternatives, design taste with no written criterion, malformed-request
suspicion, and Adjudication Step 3): authoritative definition is the
**Judgment-Class Human Gate** in `docs/orchestrator/QUALITY-GATES.md` —
a unanimous agent PASS does not waive them, because same-tier agents share the same blind spots: a unanimous PASS at Tier 1/2 is not independent evidence of correctness, it is confident correlated silence. See that section for the correlated-miss floor rationale.

## Issue Analysis Enhancement

When processing issues, the meta-layer adds:

```json
{
  "type": "feature|bug|enhancement",
  "complexity": "low|medium|high",
  "areas": ["api", "ui", "backend"],
  "meta_rules_triggered": ["securityOverride"],
  "workflow_adaptation": "Added @security check"
}
```

## Emergency Hotfix Workflow

When `emergencyHotfix` is triggered, speed wins over ceremony — but a skip is a
**logged skip with a reason**, not a silent skip of process (Core Rule 7):

```
User: "Hotfix: production login broken"
    ↓
@builder (immediate fix)
    ↓
Deterministic hook (typecheck/lint/tests/build)
    ↓
@tester and/or @security skipped IF the sprint's risk profile allows it —
logged in the Routing Log with the reason, not silently dropped
    ↓
@scribe adds the `[Unreleased]` CHANGELOG entry — NOT skippable, even for a
one-line hotfix (`docs/orchestrator/VERSIONING.md`: "No exceptions")
    ↓
DONE
```

**Post-hotfix:** Schedule a follow-up with any gate that was logged as skipped.

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
