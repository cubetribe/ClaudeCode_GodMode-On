# Agent Model Selection - Cost Optimization Guide

> **Choosing the Right Claude Model for Each Agent**

---

## Overview

CC_GodMode uses **three different Claude models** across its 7 agents to optimize for cost vs. performance. This document explains:
- Which model each agent uses and why
- Cost implications per workflow
- When to consider overriding defaults
- Performance trade-offs

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
Low Cost    │  ●      Haiku
            │  (@github-manager)
            │
            └─────────────────────────────────────────►
                Simple                           Complex
                     TASK COMPLEXITY
```

---

## Agent Model Assignments

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

### @scribe - Sonnet 4.5 (MEDIUM COST)

**Model:** `claude-sonnet-4-5-20250929`

**Rationale:**
- Technical writing requires clarity and accuracy
- Must analyze reports from all other agents
- Needs documentation best practices knowledge
- VERSION/CHANGELOG management is critical

**Cost Impact:** Medium (~$0.60 per invocation)

**When Invoked:**
- After both quality gates pass
- MANDATORY before ANY push
- VERSION and CHANGELOG updates
- Documentation maintenance

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

### Standard Feature Workflow

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
  ├─ @scribe (sonnet): $0.60
  │
  └─ @github-manager (haiku): $0.10

Total: ~$6.10 per feature
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
  ├─ @scribe (sonnet): $0.60
  │
  └─ @github-manager (haiku): $0.10

Total: ~$6.90 per API change
```

### Documentation Update Workflow

```
User: "Update README"
  │
  ├─ @scribe (sonnet): $0.60
  │
  └─ @github-manager (haiku): $0.10

Total: ~$0.70 per doc update
```

---

## Monthly Cost Estimates

### Small Project (5 features/month)

```
Features (5):        5 × $6.10 = $30.50
Bug fixes (10):     10 × $2.90 = $29.00
API changes (2):     2 × $6.90 = $13.80
Docs (5):            5 × $0.70 =  $3.50
────────────────────────────────────────
Monthly Total:                   $76.80
```

### Medium Project (20 features/month)

```
Features (20):      20 × $6.10 = $122.00
Bug fixes (40):     40 × $2.90 = $116.00
API changes (8):     8 × $6.90 =  $55.20
Docs (15):          15 × $0.70 =  $10.50
Refactoring (5):     5 × $6.10 =  $30.50
────────────────────────────────────────
Monthly Total:                  $334.20
```

### Large Project (50 features/month)

```
Features (50):      50 × $6.10 = $305.00
Bug fixes (100):   100 × $2.90 = $290.00
API changes (20):   20 × $6.90 = $138.00
Docs (30):          30 × $0.70 =  $21.00
Refactoring (15):   15 × $6.10 =  $91.50
────────────────────────────────────────
Monthly Total:                  $845.50
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

## Summary

### Model Strategy

| Agent | Model | When | Why |
|-------|-------|------|-----|
| @architect | opus | New features, major decisions | Best reasoning |
| @api-guardian | sonnet | API changes (auto-triggered) | Balanced analysis |
| @builder | sonnet | All implementations | Best cost/performance |
| @validator | sonnet | Every implementation | Thorough quality |
| @tester | sonnet | Every implementation | Comprehensive testing |
| @scribe | sonnet | Before push | Clear documentation |
| @github-manager | haiku | GitHub operations | Fast & cheap |

### Cost Efficiency

- **Feature**: ~$6.10 (optimized)
- **Bug Fix**: ~$2.90 (efficient)
- **API Change**: ~$6.90 (mandatory safety)
- **Documentation**: ~$0.70 (minimal)

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
