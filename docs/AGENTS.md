# The Agents

14 specialists (7 core + 1 security gate + 6 department), each with one job, its own model assignment, and effort tuning.

This is the human-facing roster; for the machine handoff matrix see [orchestrator/AGENTS.md](./orchestrator/AGENTS.md), and for per-agent model/cost rationale see [AGENT_MODEL_SELECTION.md](./AGENT_MODEL_SELECTION.md).

---

## Core Agents (7)

Always available. The Orchestrator selects from these on every workflow run.

| Agent | Role | Specialty |
|:------|:-----|:----------|
| `@researcher` | Knowledge Discovery | Web research, documentation lookup, technology evaluation |
| `@architect` | System Architect | High-level design, module structure, tech decisions |
| `@api-guardian` | API Lifecycle Expert | Breaking changes, consumer impact, contract validation |
| `@builder` | Senior Developer | Implementation, following @architect's specifications |
| `@tester` | UX Quality Gate (opt-in) | E2E tests, visual regression, accessibility, performance — only when the sprint declares `ux_gate: auto` |
| `@scribe` | Technical Writer | Documentation, changelog, version management |
| `@github-manager` | GitHub Manager | Issues, PRs, releases, CI/CD orchestration |

**Where did @validator go?** It was dissolved, not deleted. Its deterministic checks (typecheck, lint, tests, build) now run in a hook after every `@builder` pass, at ~0 context cost on success — a compiler result is a fact, not a second opinion. Its judgment part (code review) is pulled on demand via the native `/code-review` skill instead of a standing agent re-reading the same diff.

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

## Verification Matches the Evidence

There is no standing dual-gate pair anymore. After `@builder`, verification is evidence-matched: a deterministic hook always runs; a second *model* pass runs only where it opens evidence `@builder` did not have.

```
                    @builder completes
                           │
                           ▼
              Deterministic hook (always)
        typecheck · lint · tests · build
         0 context on success, output only on failure
                           │
           ┌───────────────┼───────────────┐
           ▼                               ▼
    ux_gate: auto?                 security surface?
           │                               │
           ▼                               ▼
       @tester runs                  @security runs
   (screenshots, a11y, CWV)       (secrets, auth, injection)
           │                               │
           └───────────────┬───────────────┘
                           ▼
              risk or doubt on code judgment?
                    → pull /code-review
                           │
                           ▼
                   All applicable checks passed?
                   → Continue to @scribe
```

Whichever of @tester / @security / `/code-review` apply run in parallel. If any returns `BLOCKED`, the Orchestrator merges the feedback and sends it back to @builder before re-running the applicable checks. Whatever Smart Routing leaves out (no UX gate declared, no security surface touched) is logged in the sprint's Routing Log with its reason — the unlogged skip is the defect, not the skip.

---

## Workflows

The Orchestrator selects the right workflow automatically based on request type and risk classification.

**New Feature:**
```
(@researcher)* → @architect → @builder → checks → @scribe
```

**Bug Fix:**
```
@builder → checks
```

**API Change (Critical!):**
```
(@researcher)* → @architect → @api-guardian → @builder → checks → @scribe
```

**Refactoring:**
```
@architect → @builder → checks
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

**Note:** "checks" means the deterministic hook always, plus @tester / @security / `/code-review` where the sprint or the surface calls for it (see Verification Matches the Evidence above). Whichever of those apply run in **PARALLEL**; all applicable ones must pass.

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
