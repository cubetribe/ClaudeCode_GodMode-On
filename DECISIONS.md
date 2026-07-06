# Architecture Decision Records (ADR)

> **Documenting key architectural and design decisions for CC_GodMode**

This document captures significant decisions made during the development of CC_GodMode. Each decision is recorded using the ADR (Architecture Decision Record) format to provide context, rationale, and consequences.

---

## Decision Index

| ADR | Title | Status | Version | Date |
|-----|-------|--------|---------|------|
| [ADR-001](#adr-001-parallel-quality-gates) | Parallel Quality Gates | ACCEPTED | v5.6.0 | 2025-01-07 |
| [ADR-002](#adr-002-mcp-health-check-tiers) | MCP Health Check Tiers | ACCEPTED | v5.6.0 | 2025-01-07 |
| [ADR-003](#adr-003-phase-2-governance-features) | Phase 2 Governance Features | ACCEPTED | v5.8.0 | 2025-01-08 |
| [ADR-004](#adr-004-plan-first-orchestration-and-version-at-release) | Plan-First Orchestration & Version-at-Release | ACCEPTED | v9.0.0 | 2026-07-06 |
| [ADR-005](#adr-005-single-writer-release-process-with-ci-enforced-invariant) | Single-Writer Release Process with CI-Enforced Invariant | ACCEPTED | v9.0.0 | 2026-07-06 |

---

## ADR-001: Parallel Quality Gates

### Status

**ACCEPTED**

- **Date:** 2025-01-07
- **Decision Makers:** Orchestrator, based on performance analysis
- **Version Introduced:** v5.6.0

### Context

Prior to v5.6.0, the quality validation workflow ran @validator and @tester sequentially:
- @builder completes
- @validator runs (4-6 minutes)
- @tester runs (4-6 minutes)
- Total: 8-12 minutes

This sequential approach was simple but created a bottleneck in the development workflow. Analysis showed that @validator (code quality) and @tester (UX quality) have no dependencies on each other - they both depend only on @builder's output.

### Decision

**We will run @validator and @tester in parallel after @builder completes.**

**Implementation:**
- Use parallel Task tool calls to launch both agents simultaneously
- Implement a sync point that waits for both to complete
- Use Decision Matrix to coordinate results
- Provide sequential fallback if parallel execution fails

**Decision Matrix:**

| @validator | @tester | Action |
|------------|---------|--------|
| APPROVED | APPROVED | Proceed to @scribe |
| APPROVED | BLOCKED | Return to @builder (tester concerns) |
| BLOCKED | APPROVED | Return to @builder (code concerns) |
| BLOCKED | BLOCKED | Return to @builder (merged feedback) |

### Consequences

#### Positive

- **40% faster quality validation** (8-12min reduced to 5-7min)
- No change to quality standards - both gates still must pass
- Better developer experience with faster feedback
- Parallel execution is more efficient use of resources

#### Negative

- Slightly more complex orchestration logic
- Merged feedback when both fail requires careful coordination
- Sequential fallback adds maintenance overhead

#### Neutral

- Overall workflow structure unchanged
- Individual agent logic unchanged
- Report format unchanged

### Alternatives Considered

#### Alternative 1: Keep Sequential Execution

**Description:** Maintain the existing sequential @validator -> @tester flow.

**Why rejected:** Performance analysis showed consistent 40% time waste due to unnecessary sequential waiting.

#### Alternative 2: Single Combined Agent

**Description:** Merge @validator and @tester into one "quality" agent.

**Why rejected:** Violates separation of concerns. Code quality (TypeScript, tests, security) and UX quality (E2E, visual, a11y, performance) are distinct domains requiring different expertise.

### Implementation

**Affected Components:**
- Orchestrator workflow coordination
- Quality gate decision logic
- Report aggregation

**Files Changed:**
- `CLAUDE.md` (workflow documentation)
- `scripts/parallel-quality-gates.js` (new)

### Related Decisions

- [ADR-002: MCP Health Check Tiers](#adr-002-mcp-health-check-tiers)

### Notes

Script location: `scripts/parallel-quality-gates.js`

Performance metrics collected:
- Sequential baseline: 8-12 minutes average
- Parallel execution: 5-7 minutes average
- Time saved per workflow: 3-5 minutes

---

## ADR-002: MCP Health Check Tiers

### Status

**ACCEPTED**

- **Date:** 2025-01-07
- **Decision Makers:** Orchestrator, based on failure analysis
- **Version Introduced:** v5.6.0

### Context

MCP (Model Context Protocol) servers are external dependencies that agents rely on:
- @tester requires: Playwright, Lighthouse (optional), A11y (optional)
- @github-manager requires: GitHub MCP

Prior to v5.6.0, MCP failures were discovered mid-workflow, causing:
- Wasted agent execution time
- Incomplete workflows requiring restart
- Poor developer experience
- No graceful degradation for optional MCPs

### Decision

**We will implement a three-tier MCP health check system.**

**Tier 1: Startup Health Check**
- Runs at session start via SessionStart hook
- Checks all MCPs defined in configuration
- Reports status and provides early warning
- Non-blocking (informational only)

**Tier 2: Pre-Workflow Check**
- Runs before each workflow starts
- Checks MCPs required by the selected workflow
- BLOCKING for required MCPs (workflow cannot proceed)
- WARNING for optional MCPs (workflow proceeds with degraded functionality)

**Tier 3: Agent-Level Check**
- Each agent checks its required MCPs before execution
- Fast validation (health already verified at Tier 2)
- Provides agent-specific error messages

**MCP Classification:**
| MCP | Classification | Used By |
|-----|----------------|---------|
| playwright | REQUIRED | @tester |
| github | REQUIRED | @github-manager |
| lighthouse | OPTIONAL | @tester |
| a11y | OPTIONAL | @tester |

### Consequences

#### Positive

- **95% reduction in mid-workflow MCP failures**
- Early detection of configuration issues
- Graceful degradation for optional features
- Clear error messages at appropriate time
- Better developer experience

#### Negative

- Adds ~8 seconds to session startup (one-time cost)
- Additional complexity in health check logic
- Requires maintaining MCP classification matrix

#### Neutral

- Agents still responsible for MCP interaction
- Optional MCP features may be unavailable
- Health check results logged for debugging

### Alternatives Considered

#### Alternative 1: No Health Checks

**Description:** Let MCPs fail naturally during agent execution.

**Why rejected:** Poor developer experience. Mid-workflow failures waste time and require restart.

#### Alternative 2: Startup Check Only

**Description:** Check all MCPs at startup, block if any fail.

**Why rejected:** Too aggressive. Optional MCPs shouldn't block the entire session.

#### Alternative 3: Agent-Level Only

**Description:** Each agent checks its MCPs just before use.

**Why rejected:** Discovers problems too late. Better to know before starting a 20-minute workflow.

### Implementation

**Affected Components:**
- SessionStart hook
- Orchestrator workflow initialization
- Agent MCP validation

**Files Changed:**
- `scripts/mcp-health-check.js` (new)
- `scripts/session-start.js` (enhanced)
- Agent files (health check integration)

### Related Decisions

- [ADR-001: Parallel Quality Gates](#adr-001-parallel-quality-gates)

### Notes

Script location: `scripts/mcp-health-check.js`

Health check command: `claude mcp list`

Timeout configuration:
- Individual MCP check: 5 seconds
- Full health check: 30 seconds maximum

---

## ADR-003: Phase 2 Governance Features

### Status

**ACCEPTED**

- **Date:** 2025-01-08
- **Decision Makers:** Orchestrator, based on CLAUDE.md compliance analysis
- **Version Introduced:** v5.8.0

### Context

CC_GodMode v5.6.0 achieved 93% CLAUDE.md compliance. Analysis identified governance gaps:
- No formal decision logging (decisions made but not recorded)
- No clear responsibility matrix (who decides what?)
- No meta-decision logic (when to override standard workflows)

These gaps create ambiguity in multi-agent orchestration and make it harder to understand why decisions were made.

### Decision

**We will implement three governance features in Phase 2.**

**Feature #1: Meta-Decision Logic**
- Extend `analyze-prompt.js` with override rules
- 5 meta-decision rules for special cases
- Integrates with existing workflow suggestion system

**Feature #3: DECISIONS.md Logging**
- Create ADR template for consistent decision recording
- Maintain DECISIONS.md with key architectural decisions
- Link decisions to versions and affected components

**Feature #7: RARE Matrix**
- Define clear responsibility assignments for all agents
- RARE = Responsible / Accountable / Recommends / Executes
- Document decision types and who handles them

### Consequences

#### Positive

- **Clear audit trail** for architectural decisions
- **Explicit responsibility assignments** reduce confusion
- **Meta-decision logic** handles edge cases automatically
- Better onboarding for new contributors
- Improved compliance with documentation standards

#### Negative

- Additional documentation maintenance burden
- Meta-decision rules may need tuning
- RARE matrix needs updating when agents change

#### Neutral

- Core workflow unchanged
- Agent logic unchanged
- Performance unchanged

### Alternatives Considered

#### Alternative 1: No Governance Documentation

**Description:** Continue with informal decision-making.

**Why rejected:** Reduces transparency and makes debugging harder.

#### Alternative 2: External Governance Tool

**Description:** Use a separate tool/system for decision tracking.

**Why rejected:** Adds complexity and external dependency. Markdown-based approach is simpler and version-controlled.

#### Alternative 3: Full RACI Matrix

**Description:** Use traditional RACI instead of RARE.

**Why rejected:** RACI's "Consulted/Informed" distinction less relevant for agent orchestration. RARE's "Recommends/Executes" better fits agent roles.

### Implementation

**Affected Components:**
- Documentation structure
- analyze-prompt.js script
- Agent responsibility definitions

**Files Changed:**
- `templates/adr-template.md` (new)
- `DECISIONS.md` (new)
- `docs/policies/RARE_MATRIX.md` (new)
- `scripts/analyze-prompt.js` (extended)

### Related Decisions

- [ADR-001: Parallel Quality Gates](#adr-001-parallel-quality-gates)
- [ADR-002: MCP Health Check Tiers](#adr-002-mcp-health-check-tiers)

### Notes

Phase 2 is part of the v5.8.0 release focusing on governance and compliance improvements.

Meta-Decision Rules implemented:
1. Security Override
2. Breaking Change Escalation
3. Performance Critical Path
4. Emergency Hotfix
5. Documentation-Only Optimization

---

## ADR-004: Plan-First Orchestration & Version-at-Release

### Status

**ACCEPTED**

- **Date:** 2026-07-06
- **Decision Makers:** Orchestrator, based on full repository audit (plans/v9.0.0/PLAN.md)
- **Version Introduced:** v9.0.0

### Context

Core Rule 1 ("Version-First": read VERSION and increment BEFORE any work starts) was designed
for single-task workflows. A 2026-07-06 audit confirmed it breaks under the framework's own
parallel-first doctrine and under real usage:

- Two concurrent workstreams read the same VERSION, claim the same next version, and collide on
  `reports/vX.X.X/` (fixed filenames → silent overwrites) and the CHANGELOG prepend point.
- VERSION had 2–3 legitimate writers (Orchestrator before work, @scribe before push, any second
  session) with no demarcation rule.
- Bumping before work structurally guarantees windows where main claims an unreleased version.
  Result on record: `[8.0.1]` and `[7.1.1]` changelogged and merged but never tagged/released
  (42 CHANGELOG versions vs. 3 GitHub releases).
- The rule also self-collided with routing: touching VERSION/CHANGELOG is a Full-Gates risk
  signal, so read literally every Smart-Routed task escalated.

### Decision

1. **Plan-First replaces Version-First.** Non-trivial work starts with a plan
   (`plans/vX.Y.Z/PLAN.md`) split into sprint files (`docs/templates/SPRINT_TEMPLATE.md`) that
   carry goal, scope, non-goals, write-scope ownership, risks, acceptance criteria, test
   strategy, changelog note, and version relevance.
2. **VERSION is written exactly once per release**, by the release sprint's tooling
   (`scripts/version-bump.js`: bump → `[Unreleased]` promotion → full touchpoint sync), never at
   task start and never by implementer agents.
3. **CHANGELOG gains an `[Unreleased]` section.** Sprints contribute entries at their
   (serialized) integration step; the release tooling promotes the section to `[X.Y.Z] - date`.
4. **Release invariant** enforced by `scripts/release-check.js` + CI:
   `VERSION == top CHANGELOG version == latest tag == latest GitHub release`, with
   `VERSION > latest tag` allowed only on an open `release/*` branch.

### Consequences

**Positive:** parallel sprints cannot race on version claims; phantom releases become
mechanically detectable; a single writer owns each hot file; report/plan artifacts get sprint
namespaces.

**Negative / trade-offs:** work-in-progress is no longer labeled with a target version from
minute one (the plan folder carries the target instead); one more artifact layer to maintain.

### Alternatives Considered

- **Keep Version-First + add a lock file:** rejected — locks don't work across clones/sessions
  and don't fix the phantom-release tail.
- **Fragment-based changelog (towncrier/changesets):** rejected for now — proportionate for
  multi-contributor repos; solo maintainer + serialized integration makes `[Unreleased]`
  sufficient. Revisit if contributors join (see ROADMAP backlog).
- **Full automation via release-please/semantic-release:** rejected — CI-centric, heavier than
  needed; the composed local tooling + thin CI checks achieve the invariant with less machinery.

### Related Decisions

- [ADR-001: Parallel Quality Gates](#adr-001-parallel-quality-gates)

---

## ADR-005: Single-Writer Release Process with CI-Enforced Invariant

### Status

**ACCEPTED**

- **Date:** 2026-07-06
- **Decision Makers:** Orchestrator, based on validated audit findings (plans/v9.0.0/PLAN.md)
- **Version Introduced:** v9.0.0

### Context

The audit found the release tail structurally unenforced: 42 CHANGELOG versions vs. 3 GitHub
releases; `[7.1.1]`/`[8.0.1]` merged but never tagged; @github-manager derived the tag version
from the top CHANGELOG heading (a tag-corruption path); ~15 version touchpoints with tooling
covering only subsets; WHO writes VERSION/CHANGELOG was specified four inconsistent ways; and
no CI existed to enforce any of it.

### Decision

1. **Single writers:** only @scribe edits `CHANGELOG.md` (the `[Unreleased]` section, at
   serialized sprint integration); only `scripts/version-bump.js` (release sprint) writes
   `VERSION` and the touchpoint manifest; only @github-manager/`release-tag.yml` creates tags —
   with the version read exclusively from `VERSION`.
2. **Machine-checked invariant:** `VERSION == top CHANGELOG == latest tag == latest GitHub
   release` (ahead-of-tag only on `release/*`), enforced by `scripts/release-check.js` locally,
   in `pre-push-check.js`, and in `.github/workflows/release-consistency.yml` on every PR.
3. **Automated release tail:** `.github/workflows/release-tag.yml` creates the annotated tag +
   draft GitHub Release when a merged release PR changes VERSION; publishing stays manual.
4. **Codenames** live only in CHANGELOG entries and GitHub Release titles.

### Consequences

**Positive:** phantom releases become impossible to miss; version drift is caught at PR time;
concurrent version writes are structurally excluded. **Negative:** releases require the
tooling path (intentional friction); GitHub Actions becomes a soft dependency (manual fallback
documented in VERSIONING.md).

### Alternatives Considered

- **Fully automated publishing (semantic-release):** rejected — violates the repo's
  "never push/publish without permission" law.
- **File locks for VERSION:** rejected — don't work across clones; the single-writer +
  invariant approach removes the race at its source.

### Related Decisions

- [ADR-004: Plan-First Orchestration & Version-at-Release](#adr-004-plan-first-orchestration-and-version-at-release)

---

## Adding New Decisions

When making a significant architectural or design decision:

1. Copy the template from `templates/adr-template.md`
2. Assign the next ADR number
3. Fill in all sections
4. Add entry to the Decision Index table
5. Link to related decisions if applicable

**What qualifies as an ADR-worthy decision:**
- Changes to workflow structure
- New agent responsibilities
- Performance optimizations with trade-offs
- Breaking changes to interfaces
- New feature architectures
- Deprecation of existing features

---

*Document Version: 1.0.0 (v5.8.0)*
