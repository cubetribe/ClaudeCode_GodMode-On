# Agent Model Selection - Cost Optimization Guide

> **Choosing the Right Claude Model for Each Agent**

---

## Overview

CC_GodMode v7.0.0 uses **three different Claude models** across its 14 agents (8 core + 6 department) to optimize for cost vs. performance. This document explains:
- Which model and effort level each agent uses and why
- Fable 5 orchestrator economics
- Cost implications per workflow with Smart Routing
- When to consider overriding defaults
- Performance trade-offs

---

## Effort Field (v7.0.0)

Every agent carries an `effort` field in its frontmatter (consumed by Claude Code ≥2.1.152). This tunes the token budget per invocation without changing the model.

| Agent | Model | Effort | Rationale |
|-------|-------|--------|-----------|
| @architect | opus | high | Complex trade-off analysis; long-lived decisions |
| @builder | sonnet | medium | Implementation quality needs reasoning depth |
| @tester | sonnet | medium | MCP coordination + test evaluation |
| @api-guardian | sonnet | medium | Consumer discovery + breaking change analysis |
| @validator | sonnet | low | Mostly execution (tsc, tests) + checklist |
| @scribe | haiku | low | Templated doc work; CHANGELOG/VERSION updates |
| @researcher | haiku | low | Retrieval + synthesis, not deep reasoning |
| @github-manager | haiku | low | API operations; MCP does the heavy lifting |
| @ci-security-guardian | sonnet | low | Advisory; YAML review |
| @docs-dx | sonnet | low | Advisory; language-intensive review |
| @quality-operations | sonnet | low | Advisory; scope matching |
| @runtime-platform | sonnet | low | Diagnostic; environment constraint analysis |
| @workflow-design | sonnet | low | Advisory; sequence design |
| @workspace-governance | sonnet | low | Advisory; text + policy analysis |

---

## Fable 5 Orchestrator Economics

**Claude Fable 5** (as of 2026): ~$10/$50 per MTok (input/output) — approximately 2× the cost of Opus 4.5.

CC_GodMode v7.0.0 positions Fable 5 as the **orchestrator only** — it classifies, routes, and delegates. Subagents do the implementation work on cheaper models.

**Smart Routing default** targets 30–50% token reduction per standard feature compared to always running the full agent sequence:
- Inline architecture briefs instead of @architect invocation for small/medium tasks saves ~$2.50 per invocation
- Scoped validation (affected flows only) instead of full @tester run saves ~$0.50–0.80
- @scribe downgraded from sonnet → haiku saves ~$0.40 per invocation
- Total per standard feature: ~$2.60 (fully scoped) to ~$6.10 (Full-Gates escalation) — cost depends on whether risk signals escalate to Full-Gates

**When Full-Gates costs are justified:**
- API/schema changes: @api-guardian prevents cascading consumer breakage
- New modules: @architect (Opus) prevents expensive architecture mistakes
- Breaking changes: full consumer analysis is mandatory

---

---

## Model Strategy

### The Three Models

| Model | Use Case | Cost | Performance |
|-------|----------|------|-------------|
| **Opus 4.5** | Complex reasoning, architecture | High | Best |
| **Sonnet 4.5** | Balanced code work, analysis | Medium | Excellent |
| **Haiku** | Simple operations, API calls | Low | Fast |

### Cost vs Capability

```
                    COST EFFICIENCY CURVE

High Cost   │                    ●  Opus 4.5
            │                   (@architect)
            │
Medium Cost │          ●●●●●    Sonnet 4.5
            │       (@api-guardian, @builder, @validator,
            │        @tester, @scribe)
            │
Low Cost    │  ●●     Haiku
            │  (@researcher, @github-manager)
            │
            └─────────────────────────────────────────►
                Simple                           Complex
                     TASK COMPLEXITY
```

---

## Agent Model Assignments

### @researcher - Haiku (LOW COST)

**Model:** `claude-haiku-20250219`

**Rationale:**
- Gathers current facts before higher-cost decisions
- Uses official and primary sources where possible
- Returns concise findings, source links, and routing implications
- Keeps exploratory work cheap before @architect is needed

**Cost Impact:** Low (~$0.10-0.20 per bounded research pass)

**When Invoked:**
- New technology, dependency, or platform facts are version-sensitive
- Official documentation must be checked before design
- A narrow research brief can prevent expensive rework

**Why Haiku is Sufficient:**
- The task is retrieval and synthesis, not long-horizon architecture
- Source quality matters more than model size
- Findings are handed to @architect or the orchestrator for decisions

---

### @architect - Opus 4.5 (HIGH COST)

**Model:** `claude-opus-4-5-20251101`

**Rationale:**
- Makes architectural decisions with long-term codebase impact
- Requires deep reasoning about trade-offs
- Needs to evaluate multiple solutions
- Mistakes here are expensive to fix later

**Cost Impact:** High (~$2-3 per invocation)

**When It's Worth It:**
```
✅ Worth the cost:
- New feature architecture planning
- Major refactoring decisions
- Technology stack selection
- API design strategy
- System-wide changes

❌ Not worth it:
- Simple bug fix planning
- Minor documentation updates
- Straightforward implementations
```

**Example Workflow Cost:**
```
New Feature: User Authentication System
@architect invocation: $2.50
Total saved by good architecture: $50+ (prevents rework)
ROI: 20x
```

---

### @api-guardian - Sonnet 4.5 (MEDIUM COST)

**Model:** `claude-sonnet-4-5-20250929`

**Rationale:**
- Needs code analysis capability (finding consumers)
- Requires understanding of breaking changes
- Must write clear impact reports
- Balanced cost/performance for frequent API work

**Cost Impact:** Medium (~$0.80 per invocation)

**When Invoked:**
- Automatic on any API/type file changes
- Hook-triggered (check-api-impact.js)
- MANDATORY for API contract changes

**Performance:**
- Consumer discovery: Fast (uses Grep tool)
- Breaking change analysis: Thorough
- Report generation: Clear and actionable

---

### @builder - Sonnet 4.5 (MEDIUM COST)

**Model:** `claude-sonnet-4-5-20250929`

**Rationale:**
- Most frequently used agent (all implementations)
- Needs strong coding capability
- Must execute tests and verify quality
- Cost-optimized for high-volume use

**Cost Impact:** Medium (~$1.00 per invocation)

**Frequency:** Very High (multiple times per feature)

**Example Workflow:**
```
Feature Implementation:
@builder invocation 1: Implement types ($1.00)
@builder invocation 2: Implement backend ($1.00)
@builder invocation 3: Implement frontend ($1.00)
@builder invocation 4: Fix issues ($1.00)
Total: $4.00

Using Opus: Would be $10-12
Savings: 60-70% with minimal quality difference
```

---

### @validator - Sonnet 4.5 (MEDIUM COST)

**Model:** `claude-sonnet-4-5-20250929`

**Rationale:**
- Needs analytical capability for code review
- Must execute multiple quality checks
- Requires thorough consumer verification
- Part of mandatory quality gate

**Cost Impact:** Medium (~$0.70 per invocation)

**When Invoked:**
- After EVERY implementation (mandatory)
- Part of dual quality gate with @tester
- Before ANY merge/push

**Quality Gates:**
- TypeScript compilation
- Unit tests
- Consumer updates verification
- Security checks

---

### @tester - Sonnet 4.5 (MEDIUM COST)

**Model:** `claude-sonnet-4-5-20250929`

**Rationale:**
- Coordinates multiple MCP servers (Playwright, Lighthouse, A11y)
- Needs analytical capability for test evaluation
- Must write comprehensive test reports
- Part of mandatory quality gate

**Cost Impact:** Medium (~$1.20 per invocation)

**When Invoked:**
- After EVERY implementation (mandatory)
- Runs IN PARALLEL with @validator
- Visual regression testing
- E2E test execution

**Performance:**
- Test execution: Fast (delegates to MCP servers)
- Screenshot analysis: Thorough
- Accessibility audits: Complete

---

### @scribe - Haiku (LOW COST) — changed in v7.0.0

**Model:** `haiku` (downgraded from sonnet in v7.0.0)

**Rationale:**
- CHANGELOG and VERSION updates follow a strict template — haiku handles templated work well
- Report synthesis from other agents is pattern-matching, not deep reasoning
- `effort: low` + haiku is sufficient under Fable 5 orchestration
- Saves ~$0.40 per invocation vs sonnet

**Cost Impact:** Low (~$0.15–0.20 per invocation)

**When Invoked:**
- After both quality gates pass
- MANDATORY before ANY push
- VERSION and CHANGELOG updates
- Documentation maintenance

**Quality assurance:** Min-length validation (300 chars) and required section patterns are enforced by `scripts/validate-agent-output.js` — the downgrade does not weaken output standards.

**Critical Tasks:**
- VERSION file updates (MANDATORY)
- CHANGELOG entries (MANDATORY)
- API Consumer Registry maintenance
- README updates

---

### @github-manager - Haiku (LOW COST)

**Model:** `claude-haiku-20250219`

**Rationale:**
- Simple GitHub API operations
- Straightforward workflow execution
- High frequency of invocations
- Cost optimization priority

**Cost Impact:** Low (~$0.10 per invocation)

**When Invoked:**
- Creating/managing GitHub issues
- Creating/managing pull requests
- Publishing releases
- CI/CD monitoring

**Why Haiku is Sufficient:**
- GitHub MCP server does the heavy lifting
- Agent primarily coordinates and formats
- No complex reasoning required
- Speed matters more than sophistication

**Example:**
```
Release Workflow:
@github-manager create PR: $0.10
@github-manager publish release: $0.10
Total: $0.20

Using Sonnet: Would be $1.20
Savings: 80% with zero quality impact
```

---

## Workflow Cost Analysis

### Standard Feature Workflow (Full-Gates)

```
User: "Build user authentication"
  │
  ├─ @architect (opus): $2.50
  │
  ├─ @builder (sonnet): $1.00
  │
  ├─ @validator (sonnet): $0.70  ┐
  ├─ @tester (sonnet): $1.20     ├─ Parallel
  │                               ┘
  ├─ @scribe (haiku): $0.20       ← v7.0.0: haiku (was sonnet $0.60)
  │
  └─ @github-manager (haiku): $0.10

Total: ~$5.70 per feature (Full-Gates)

Smart Routing (no @architect invocation, scoped gates):
  ├─ inline arch brief: $0
  ├─ @builder (sonnet): $1.00
  ├─ @validator scoped: $0.50  ┐
  ├─ @tester scoped: $0.80     ├─ Parallel
  │                             ┘
  ├─ @scribe (haiku): $0.20
  └─ @github-manager (haiku): $0.10
Total: ~$2.60 per standard feature (Smart Routing)
Note: risk escalation to Full-Gates raises this toward ~$6.10
```

### Bug Fix Workflow

```
User: "Fix login validation"
  │
  ├─ @builder (sonnet): $1.00
  │
  ├─ @validator (sonnet): $0.70  ┐
  ├─ @tester (sonnet): $1.20     ├─ Parallel
  │                               ┘

Total: ~$2.90 per bug fix
```

### API Change Workflow (MANDATORY)

```
User: "Change user endpoint response"
  │
  ├─ @architect (opus): $2.50
  │
  ├─ @api-guardian (sonnet): $0.80  ← MANDATORY for API changes
  │
  ├─ @builder (sonnet): $1.00
  │
  ├─ @validator (sonnet): $0.70  ┐
  ├─ @tester (sonnet): $1.20     ├─ Parallel
  │                               ┘
  ├─ @scribe (haiku): $0.20   ← v7.0.0: haiku
  │
  └─ @github-manager (haiku): $0.10

Total: ~$6.50 per API change
```

### Documentation Update Workflow

```
User: "Update README"
  │
  ├─ @scribe (haiku): $0.20    ← v7.0.0: haiku (was sonnet $0.60)
  │
  └─ @github-manager (haiku): $0.10

Total: ~$0.30 per doc update
```

---

## Monthly Cost Estimates

> **Note:** These figures use the **Full-Gates upper-bound baseline** (every agent invoked, no Smart Routing).
> Under the **Smart Routing default** (v7.0.0), standard features cost ~$2.60 each and doc updates ~$0.30 each — see the Summary table below and the Workflow Cost Analysis section above for per-workflow breakdowns.

### Small Project (5 features/month) — Full-Gates upper bound

```
Features (5):        5 × $6.10 = $30.50
Bug fixes (10):     10 × $2.90 = $29.00
API changes (2):     2 × $6.50 = $13.00
Docs (5):            5 × $0.30 =  $1.50
────────────────────────────────────────
Monthly Total:                   $74.00
  (Smart Routing estimate: ~$35–45 depending on feature complexity)
```

### Medium Project (20 features/month) — Full-Gates upper bound

```
Features (20):      20 × $6.10 = $122.00
Bug fixes (40):     40 × $2.90 = $116.00
API changes (8):     8 × $6.50 =  $52.00
Docs (15):          15 × $0.30 =   $4.50
Refactoring (5):     5 × $6.10 =  $30.50
────────────────────────────────────────
Monthly Total:                  $325.00
  (Smart Routing estimate: ~$150–200 depending on feature complexity)
```

### Large Project (50 features/month) — Full-Gates upper bound

```
Features (50):      50 × $6.10 = $305.00
Bug fixes (100):   100 × $2.90 = $290.00
API changes (20):   20 × $6.50 = $130.00
Docs (30):          30 × $0.30 =   $9.00
Refactoring (15):   15 × $6.10 =  $91.50
────────────────────────────────────────
Monthly Total:                  $825.50
  (Smart Routing estimate: ~$380–480 depending on feature complexity)
```

---

## Cost Optimization Strategies

### 1. Use Appropriate Workflow

```
✅ GOOD: Simple bug fix
User: "Fix typo in error message"
→ Skip @architect (not needed)
→ Go straight to @builder
Savings: $2.50

❌ BAD: Complex feature without @architect
User: "Build payment processing"
→ Skip @architect (save $2.50)
→ @builder makes architectural mistakes
Cost: $50+ in rework
Loss: $47.50
```

### 2. Batch Related Work

```
✅ GOOD: Batch similar changes
User: "Fix 5 validation bugs"
→ One @builder session: $1.00
→ One @validator + @tester: $1.90
Total: $2.90

❌ BAD: Fix bugs individually
→ 5 × (@builder + @validator + @tester)
→ 5 × $2.90 = $14.50
Extra cost: $11.60
```

### 3. Skip Redundant Quality Gates When Safe

```
⚠️ CAUTION: Only for documentation-only changes

✅ GOOD: Pure README update
User: "Fix typo in README"
→ @scribe only: $0.60
→ Skip @validator + @tester (no code changed)

❌ BAD: Skip quality gates for code
User: "Quick fix in API"
→ Skip @validator + @tester (save $1.90)
→ Breaking change goes to production
Cost: Priceless (in a bad way)
```

### 4. Reuse @architect Decisions

```
✅ GOOD: Implement similar features
First feature: @architect designs pattern ($2.50)
Next 5 features: Reuse pattern (no @architect needed)
Savings: 5 × $2.50 = $12.50

Example:
@architect designs "List with pagination" pattern
Then implement:
- User list (no @architect)
- Product list (no @architect)
- Order list (no @architect)
All follow same pattern
```

---

## When to Override Model Defaults

### Upgrade to Opus

Consider using Opus instead of Sonnet for:

```
@builder → Opus when:
- Extremely complex algorithm implementation
- Critical security-sensitive code
- Novel architecture pattern
- High bug risk

@api-guardian → Opus when:
- Major API version migration (v1 → v2)
- Complex breaking change analysis
- Multi-service impact

Cost: +$1.50 per invocation
Worth it: When implementation complexity is very high
```

### Downgrade to Haiku

Consider using Haiku instead of Sonnet for:

```
@builder → Haiku when:
- Trivial typo fixes
- Simple constant changes
- Obvious one-line fixes

⚠️ Warning: Not recommended
Quality risk: Medium
Savings: $0.90 per invocation
When justified: Rarely
```

---

## Model Performance Comparison

### Code Quality

| Task | Haiku | Sonnet | Opus |
|------|-------|--------|------|
| Simple fixes | ✓ | ✓ | ✓ |
| Standard features | ✗ | ✓ | ✓ |
| Complex algorithms | ✗ | ✓ | ✓ |
| Architectural decisions | ✗ | △ | ✓ |

### Speed

| Model | Latency | Throughput |
|-------|---------|------------|
| Haiku | Fast (1-2s) | High |
| Sonnet | Medium (3-5s) | Medium |
| Opus | Slow (5-10s) | Low |

### Cost per 1M tokens

| Model | Input | Output |
|-------|-------|--------|
| Haiku | $0.80 | $4.00 |
| Sonnet | $3.00 | $15.00 |
| Opus | $15.00 | $75.00 |

---

## ROI Analysis

### @architect on Opus: Is it Worth It?

```
Scenario: E-commerce checkout flow

Option A: Opus @architect
Cost: $2.50
Time to good architecture: 1 session
Rework needed: Minimal
Total cost: $2.50 + $10 implementation = $12.50

Option B: Sonnet @architect (to save $2.50)
Cost: $1.00
Time to good architecture: 2-3 sessions (refinement)
Rework needed: 1 iteration
Total cost: $3.00 + $10 + $10 (rework) = $23.00

Savings from using Opus: $10.50
ROI: 420%
```

### @github-manager on Haiku: Is it Worth It?

```
Scenario: Create 10 PRs per month

Option A: Haiku @github-manager
Cost: 10 × $0.10 = $1.00/month
Quality: Excellent (simple tasks)

Option B: Sonnet @github-manager (for "better quality")
Cost: 10 × $0.60 = $6.00/month
Quality: Excellent (overkill)

Savings from using Haiku: $5.00/month = $60/year
Quality difference: None
ROI: Infinite
```

---

## Best Practices

### 1. Trust the Defaults

The model assignments are optimized. Override only when you have specific reasons.

### 2. Monitor Your Costs

```bash
# Track agent invocations
grep "@architect" ~/.claude/history | wc -l
grep "@builder" ~/.claude/history | wc -l

# Estimate monthly cost
# (@architect × $2.50) + (@builder × $1.00) + ...
```

### 3. Architect Early, Save Later

```
✅ Good Investment:
Spend $2.50 on @architect (opus) for complex feature
Save $50+ in prevented rework

❌ False Economy:
Save $2.50 by skipping @architect
Spend $50+ fixing poor architecture
```

### 4. Batch Expensive Operations

```
✅ Good:
Design 3 related features in one @architect session: $2.50
Implement all: 3 × $1.00 = $3.00
Total: $5.50

❌ Bad:
Design each feature separately: 3 × $2.50 = $7.50
Implement each: 3 × $1.00 = $3.00
Total: $10.50
Extra cost: $5.00
```

---

## Cost-Efficiency Mode

The `skills/cost-efficiency/` mode is an orchestration policy, not a silent
model downgrade. It reduces cost by choosing fewer agents, narrowing research,
batching expensive reasoning, and validating only the changed scope.

Use it when the user explicitly asks for cheaper or smaller-model routing.

Do not use it to skip mandatory safety checks:

- @api-guardian remains mandatory for contracts and public API surfaces.
- @validator remains mandatory for implementation quality.
- @tester remains mandatory when user-facing behavior changes.
- @architect should still be used when design mistakes would create expensive rework.

---

## Summary

### Model + Effort Strategy (v7.0.0)

| Agent | Model | Effort | When | Why |
|-------|-------|--------|------|-----|
| @researcher | haiku | low | Bounded documentation and tech lookup | Fast source discovery |
| @architect | opus | high | New modules, breaking changes, cross-domain | Best reasoning for long-lived decisions |
| @api-guardian | sonnet | medium | API changes (auto-triggered) | Balanced analysis |
| @builder | sonnet | medium | All implementations | Best cost/performance |
| @validator | sonnet | low | Every implementation | Mostly execution + checklist |
| @tester | sonnet | medium | Every implementation | MCP coordination + analysis |
| @scribe | haiku | low | Before push | Templated doc work (v7.0.0 change) |
| @github-manager | haiku | low | GitHub operations | Fast & cheap |
| All 6 dept. agents | sonnet | low | Domain-specific advisory | Advisory-only |

### Cost Efficiency (Smart Routing Default)

- **Standard feature (Smart Routing)**: ~$2.60 (fully scoped) to ~$6.10 (Full-Gates escalation)
- **Standard feature (Full-Gates)**: ~$6.10
- **Bug Fix**: ~$2.90 (efficient)
- **API Change**: ~$6.50 (mandatory safety, always Full-Gates)
- **Documentation**: ~$0.20–0.30 (scribe=haiku)

### Key Takeaways

1. **Opus for Architecture**: Expensive but worth it for long-term impact
2. **Sonnet for Most Work**: Best balance of quality and cost
3. **Haiku for Simple Ops**: Fast and cheap when appropriate
4. **Don't Skip Quality Gates**: @validator + @tester prevent expensive bugs
5. **Batch Related Work**: Reduces total agent invocations

---

**For more information:**
- See [AGENT_ARCHITECTURE.md](./AGENT_ARCHITECTURE.md) for agent system design
- See [agents/](../agents/) for individual agent documentation
- See [CLAUDE.md](../CLAUDE.md) for orchestrator configuration
