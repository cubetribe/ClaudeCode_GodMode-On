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

Script: `scripts/analyze-prompt.js` (META_DECISION_LAYER)

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
| **Re**commends | Provides input | analyze-prompt.js suggests |
| **E**xecutes | Implements | @builder codes |

Full Matrix: `docs/policies/RARE_MATRIX.md`

## Escalation Mechanism

Three-tier error handling:

```
Tier 1: Agent Self-Resolution (automatic retry)
        | (if fails 3x)
Tier 2: Orchestrator Resolution (alternate agent/skip)
        | (if unresolvable)
Tier 3: Human Escalation (present options to user)
```

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
