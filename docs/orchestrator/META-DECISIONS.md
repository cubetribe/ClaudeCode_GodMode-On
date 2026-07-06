# CC_GodMode Meta-Decision Logic

## Automatic Workflow Adaptation

The orchestrator uses meta-decision rules to automatically adapt workflows based on request analysis.

| Rule | Trigger Keywords | Action |
|------|-----------------|--------|
| securityOverride | auth, jwt, token, password | Force @validator security check |
| breakingChangeEscalation | breaking change, deprecate | Require @architect review |
| performanceCriticalPath | performance, optimize, slow | Add performance metrics |
| emergencyHotfix | hotfix, urgent, critical | Streamlined workflow |
| documentationOnlyOptimization | docs only, readme, changelog | Skip @builder, direct to @scribe |

Applied natively by the orchestrator (Core Rule 3 / `skills/meta-decisions/`) —
not by a wired hook. `scripts/analyze-prompt.js` implemented an earlier,
now-deprecated (since v8.6.0) version of this logic as a UserPromptSubmit
hook; that wiring was removed in v8.5.0 and the script is kept for reference
only.

## Architecture Decision Records (ADR)

All significant decisions are logged in `DECISIONS.md`:

```
ADR-XXX: [Title]
- Status: Proposed | Accepted | Deprecated
- Context: Why was this decision needed?
- Decision: What was decided?
- Consequences: What are the trade-offs?
```

Location: Project root `DECISIONS.md`
Template: `templates/adr-template.md`

## RARE Responsibility Matrix

Agent responsibilities follow the RARE model (AI-adapted RACI):

| Role | Definition | Example |
|------|------------|--------|
| **R**esponsible | Makes the decision | @architect designs |
| **A**ccountable | Quality gate | @validator approves |
| **Re**commends | Provides input | orchestrator meta-decision analysis suggests |
| **E**xecutes | Implements | @builder codes |

Full Matrix: `docs/policies/RARE_MATRIX.md`

## Escalation Mechanism

Three-tier error handling, now expressed as an explicit decision tree so every
trigger is classified MANDATORY (must escalate, no orchestrator discretion) or
OPTIONAL (orchestrator judgment call, logged).

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
**Judgment-Class Human Gate** in `docs/orchestrator/QUALITY-GATES.md`. A
unanimous agent PASS does NOT waive this gate — see that section for the
correlated-miss floor rationale.

### Why the MANDATORY set exists

Structured rule application — risk classification, gate sequencing, verdict-matrix
lookup — is tier-insensitive and safe to leave to the orchestrator. Judgment-class
questions (architecture taste, ambiguous requirements, "is this actually secure/
correct/reversible") are not: a same-tier agent ensemble shares the same blind
spots, so a unanimous PASS at Tier 1/2 is not independent evidence of correctness —
it is confident correlated silence. Left unescalated, a unanimous same-tier PASS
would suppress exactly the human review a single uncertain verdict should have
triggered (the correlated-miss floor: same-tier agents share blind spots, so a
unanimous same-tier PASS is not independent evidence — full derivation in
reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md §2.5/§3.2). The MANDATORY
Tier 3 triggers above are the cases where that floor is highest-consequence
(security, scope, irreversibility, release) or structurally unresolvable by any
written rule — so they are pulled out of orchestrator discretion entirely.

## Issue Analysis Schema

```
1. TYPE:
   - Bug (error, crash, broken functionality)
   - Feature (new functionality)
   - Enhancement (improve existing)
   - Refactoring (code quality, no behavior change)
   - Documentation (docs only)

2. COMPLEXITY:
   - Low (1-2 files, clear fix)
   - Medium (3-5 files, some design needed)
   - High (6+ files, architecture decisions)

3. AREAS AFFECTED:
   - API changes (routes, types, contracts)
   - UI changes (components, styles)
   - Backend only (services, database)
   - Configuration (env, config files)

4. AUTO-PROCESS?
   YES: Clear description, reproducible, isolated
   NO: Ambiguous, security-related, architecture
```
