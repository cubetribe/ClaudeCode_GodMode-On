# The Agents

15 specialists (8 core + 1 security gate + 6 department), each with one job, its own model assignment, and effort tuning.

This is the human-facing roster; for the machine handoff matrix see [orchestrator/AGENTS.md](./orchestrator/AGENTS.md), and for per-agent model/cost rationale see [AGENT_MODEL_SELECTION.md](./AGENT_MODEL_SELECTION.md).

---

## Core Agents (8)

Always available. The Orchestrator selects from these on every workflow run.

| Agent | Role | Specialty |
|:------|:-----|:----------|
| `@researcher` | Knowledge Discovery | Web research, documentation lookup, technology evaluation |
| `@architect` | System Architect | High-level design, module structure, tech decisions |
| `@api-guardian` | API Lifecycle Expert | Breaking changes, consumer impact, contract validation |
| `@builder` | Senior Developer | Implementation, following @architect's specifications |
| `@validator` | Code Quality Gate | TypeScript, unit tests, security, consumer verification |
| `@tester` | UX Quality Gate | E2E tests, visual regression, accessibility, performance |
| `@scribe` | Technical Writer | Documentation, changelog, version management |
| `@github-manager` | GitHub Manager | Issues, PRs, releases, CI/CD orchestration |

---

## Security Gate (1)

Optional. Activate for any change that touches secrets, auth/authz, crypto, injection surfaces, or dependency trust.

| Agent | Domain | Mode |
|:------|:-------|:-----|
| `@security` | Secrets, injection, auth/authz, crypto, dependencies | Read + Write (security-focused) |

---

## Department Agents (6)

Optional. The Orchestrator activates them when a task touches their domain.

| Agent | Domain | Mode |
|:------|:-------|:-----|
| `@ci-security-guardian` | GitHub Actions, CODEOWNERS, Dependabot, security | Read + Write (GitHub surface only) |
| `@docs-dx` | Public docs, prompts, setup instructions, user-facing clarity | Read-only reviewer |
| `@quality-operations` | Validation scope, regression gates, eval-oriented checks | Read-only advisor |
| `@runtime-platform` | Toolchain, sandbox, environment constraints, OS behavior | Read-only + diagnostic Bash |
| `@workflow-design` | Orchestration design, skill boundaries, handoff artifacts | Read-only designer |
| `@workspace-governance` | AGENTS layering, repo rules, release law, change-scope policy | Read-only reviewer |

---

## Dual Quality Gates

@validator and @tester run in **PARALLEL** after @builder — both must pass before the workflow continues. Neither gate can be skipped.

```
                    @builder completes
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │ @validator  │                 │  @tester    │
    │ Code Quality│                 │ UX Quality  │
    ├─────────────┤                 ├─────────────┤
    │ ✓ TypeScript│                 │ ✓ E2E Tests │
    │ ✓ Unit Tests│                 │ ✓ Visuals   │
    │ ✓ Security  │                 │ ✓ A11y      │
    │ ✓ Consumers │                 │ ✓ Perf      │
    └──────┬──────┘                 └──────┬──────┘
           │                               │
           └───────────────┬───────────────┘
                           ▼
                   Both gates passed?
                   → Continue to @scribe
```

If either gate returns `BLOCKED`, the Orchestrator merges the feedback and sends it back to @builder before re-running both gates.

---

## Workflows

The Orchestrator selects the right workflow automatically based on request type and risk classification.

**New Feature:**
```
(@researcher)* → @architect → @builder → (@validator ∥ @tester) → @scribe
```

**Bug Fix:**
```
@builder → (@validator ∥ @tester)
```

**API Change (Critical!):**
```
(@researcher)* → @architect → @api-guardian → @builder → (@validator ∥ @tester) → @scribe
```

**Refactoring:**
```
@architect → @builder → (@validator ∥ @tester)
```

**Research Task:**
```
@researcher → report with sources
```

**Release:**
```
@scribe → @github-manager
```

*\* @researcher is optional — invoke when new tech or library evaluation is needed before design decisions.*

**Note:** The `∥` symbol means the gates run in **PARALLEL** for faster validation. Both must pass.

For full workflow definitions including API change protocol and issue processing, see [orchestrator/WORKFLOWS.md](./orchestrator/WORKFLOWS.md).

---

## Workflow Modes

v7.0 inverted routing: Smart Routing is the default, Full-Gates is the explicit escalation path for high-risk work.

| Mode | Skill | Purpose |
|:-----|:------|:--------|
| **Smart Routing (default)** | `skills/cost-efficiency/` | Risk-based minimal-agent paths, inline arch brief for small/medium tasks |
| Full-Gates | `skills/workflows/` | High-risk work: new modules, API/breaking changes, security, release artifacts |
| Prototype | `skills/prototype-mode/` | Local-only spikes with `PROTOTYPE ONLY` watermarks and a migration checklist |
| Departments | `skills/departments/` | Expanded cross-domain orchestration with frozen ownership and write scopes |
| Agent Teams | `skills/agent-teams/` | Experimental teammate-style parallelism when explicitly requested |
| **Ultracode / Max-Parallel** | `skills/dynamic-workflows/` | Large, decomposable jobs (codebase-wide audits, big migrations, cross-checked research); fans out to tens-to-hundreds of verified parallel subagents — opt-in, higher token spend |

**Mode selection notes:**

- Prototype Mode is the only mode that intentionally skips production gates. It must not be pushed, deployed, or connected to production systems. Promotion always goes back through the Full-Gates workflow.
- Ultracode / Max-Parallel is a deliberate opt-in. Parallel execution is faster, not cheaper — dynamic workflows multiply token spend. Smart Routing stays the default for everyday work.

For full mode definitions and routing rules, see [orchestrator/MODES.md](./orchestrator/MODES.md).

---

## See Also

- [../README.md](../README.md) — Project overview and quick-start
- [./orchestrator/AGENTS.md](./orchestrator/AGENTS.md) — Machine handoff matrix and agent registry
- [./orchestrator/WORKFLOWS.md](./orchestrator/WORKFLOWS.md) — Full workflow definitions
- [./orchestrator/MODES.md](./orchestrator/MODES.md) — Routing mode details and skill boundaries
- [./orchestrator/QUALITY-GATES.md](./orchestrator/QUALITY-GATES.md) — Parallel gate orchestration and decision matrix
- [./AGENT_MODEL_SELECTION.md](./AGENT_MODEL_SELECTION.md) — Per-agent model assignment and cost rationale
