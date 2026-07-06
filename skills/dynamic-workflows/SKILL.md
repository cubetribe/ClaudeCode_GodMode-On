---
name: dynamic-workflows
description: "Ultracode / Max-Parallel mode — dynamic workflows fan work out across tens–hundreds of adversarially-verified parallel subagents for large, decomposable jobs (codebase-wide audits, big migrations, cross-checked research). Opt-in; higher token spend."
---

# Dynamic Workflows (Ultracode / Max-Parallel Mode)

> **Status:** Production-ready opt-in. Requires Claude Code v2.1.154+.
> **When to use:** A job outgrows a handful of subagents and needs adversarial cross-checks — codebase-wide audits, large migrations, or multi-angle research where correctness matters more than cost.

---

## What Is a Dynamic Workflow?

A dynamic workflow is a **Claude-written script** that fans work out across **tens to hundreds of parallel subagents**, runs **adversarial verification** (agents try to refute each other's findings), iterates until answers converge, and returns only the verified result.

Key properties:

- **Claude-authored:** The orchestrator generates the workflow script for the specific job — it is not a static template.
- **Fan-out/fan-in:** Work is decomposed into independent units and dispatched in parallel. Results are collected, cross-checked, and synthesized.
- **Adversarial verification:** For each finding, a separate set of "skeptic" subagents attempts to refute it. A finding survives only if a majority of skeptics cannot disprove it.
- **Perspective-diverse verifiers:** Skeptics receive different framings, file subsets, or role priming so they do not share the same blind spots as the primary agents.
- **Iterative convergence:** Rounds repeat until findings stabilize — contested results are re-examined rather than silently dropped.
- **Returns only the verified result:** The final output is the convergence-confirmed set of findings, not raw subagent output.

Trigger: the word **"workflow"** in a prompt, or automatically when `ultracode` effort is active. Inspect running and past workflow runs with `/workflows`.

---

## When to Use Which Surface

Four parallelization surfaces exist in CC_GodMode. Choose based on job size and verification need:

| Surface | What it is | Best for | Approx. concurrent limit |
|---|---|---|---|
| **Subagents** | Delegated workers inside one session; own context; return a summary | A side task would flood the main context; a few independent parallel steps | ~10 concurrent; rest queue |
| **Agent view** (`claude agents`) | Dispatch and monitor background sessions | Several independent hand-off tasks you check on later (research preview) | Session-limited |
| **Agent teams** (`skills/agent-teams/`) | Coordinated sessions; SharedTaskList; inter-agent messaging; lead-managed | Splitting a project into persistent, synchronized teammates (experimental, off by default) | 3–5 teammates recommended |
| **Dynamic workflows** (`/workflows`) | Script runs many subagents + adversarial cross-checks; iterates to convergence | Job outgrows a handful of subagents: codebase-wide audit, 500-file migration, cross-checked research | Tens–hundreds per workflow run; mind org rate limits |

**Decision shorthand:**

- One-off side task with a few parallel steps → **subagents** (single message, fan-out in-session).
- Large feature with persistent, synchronized teammates → **agent teams**.
- Job outgrows ~10 concurrent workers OR correctness requires adversarial verification → **dynamic workflows**.

Supporting tools that work with all surfaces:

- **Worktrees** — separate git checkout per parallel session, avoids file conflicts.
- **`/batch`** — splits one large change into 5–30 worktree-isolated subagents that each open a PR.
- **Forked subagent** — inherits full conversation context when continuity matters.

---

## How to Trigger Dynamic Workflows

**Via prompt word (any session):**

Include the word `workflow` in your request:

```
workflow: audit every API route in src/api/ for missing auth checks
```

**Via ultracode (recommended for large or time-critical jobs):**

```
/model best
/effort ultracode
```

`ultracode` sends `xhigh` reasoning to the model **and** has Claude automatically orchestrate dynamic workflows for substantive tasks. It is session-only — it cannot live in the `effortLevel` settings field.

**Via settings (persist across sessions):**

```json
{
  "model": "best",
  "ultracode": true
}
```

Pass `ultracode: true` via `--settings` or an Agent SDK control request.

**Inspect runs:**

```
/workflows
```

Lists running and completed workflow runs with status and subagent counts.

---

## Adversarial Verification Pattern

The verification loop is what separates dynamic workflows from naive fan-out:

```
Round N
  ├── Primary agents (P workers)
  │     each processes an independent unit and returns findings
  │
  └── Skeptic agents (S skeptics per finding)
        each receives a finding + relevant context
        task: find errors, missing cases, or counter-evidence
        verdict: REFUTE | CONFIRM | INCONCLUSIVE

Convergence check
  ├── MAJORITY REFUTE → finding killed; if important, re-examine in Round N+1
  ├── MAJORITY CONFIRM → finding promoted to verified set
  └── INCONCLUSIVE → finding queued for another round (up to max_rounds)

Final output: verified set only
```

**Perspective diversity:** skeptics are given different role priming, different file subsets, or different question framing to avoid correlated failures. If all skeptics share the same blind spot as primary agents, verification is meaningless.

**Practical implication:** you get fewer findings than a naive scrape, but the ones returned are high-confidence. For security audits or migration correctness checks this tradeoff is usually correct.

### Verification Scoping — Facts Only, Not Judgment

Adversarial verification only works on **refutable** claims: a skeptic must be
able to disprove the finding with a concrete counterexample. That is true for
factual, checkable findings — it is not true for design/architecture judgment
calls, where "refuting" the claim would require generating a better design,
which is exactly the capability a same-tier skeptic lacks. Routing a judgment
question into a skeptic panel produces **confident consensus error**, not
signal: same-tier judges share the same blind spot as the primary agent and
majority-vote the error through instead of catching it.

| Verify adversarially (facts) | Do NOT verify — escalate instead (judgment) |
|---|---|
| "This function is unused" (grep for call sites disproves/confirms it) | "This module split is suboptimal" (refuting it means designing the better split) |
| "This consumer breaks under the new signature" (run/trace the call site) | "This API's ergonomics are poor" (a matter of taste, not a checkable fact) |
| "Test X does not cover code path Y" (coverage report settles it) | "This is the right architecture for this problem" (no mechanical counterexample exists) |

**Litmus test:** if refuting the claim requires only checking, running, or
grepping something that already exists (fact), it verifies adversarially; if
refuting it requires producing a *better alternative* that doesn't yet exist
(judgment), it escalates.

When a finding falls in the right-hand column, do not spin up a skeptic
panel — route it per the QUALITY-GATES adjudication procedure's Step 3
(`docs/orchestrator/QUALITY-GATES.md`): not criteria-resolvable ⇒ mandatory
human escalation. A unanimous same-tier PASS on a judgment question is not
evidence; it is a correlated miss waiting to happen.

### Decomposition Seam-Check

Before dispatching a multi-agent decomposition, the orchestrator writes **one
line** naming the cross-cutting concern the split could hide, e.g.:

```
seams: auth flow crosses builder-A/builder-B file boundary
```

This is cheap — one sentence — but closes real recall gaps: cross-cutting
bugs live in the seams between subagent scopes, not inside any single unit,
so no per-unit gate catches them by default. Where the seam is non-trivial
(the concern spans behavior, not just adjacent files), assign one
**seam-checker** agent whose only job is reading ACROSS the completed units'
outputs for cross-cutting breakage — it does not re-review any single unit in
isolation; that is the primary agent's and the quality gates' job.

---

## Concurrency Caps and Rate-Limit Awareness

| Context | Limit |
|---|---|
| Plain subagents in one session | ~10 concurrent; additional requests queue |
| Dynamic workflow subagents | Tens–hundreds per run; dispatched by the workflow script |
| Org API rate limits | Apply to all surfaces equally — workflows multiply request volume |

**Practical guidance:**

- For organizations on standard tiers, a workflow dispatching 50+ subagents simultaneously can hit rate limits. The workflow script handles backpressure and retry internally, but very large jobs may need to be staged.
- Token throughput (not just request count) matters: each subagent has its own context. 100 subagents at 50K tokens each = 5M tokens for that round.
- Check your org's rate-limit tier before scheduling large overnight workflow runs.
- Use `/workflows` to monitor active runs and cancel runaway jobs early.

---

## Worktree Isolation and `/batch`

When parallel subagents edit **overlapping files**, race conditions and merge conflicts are likely without isolation.

**Worktrees:** Each parallel session operates on a separate git checkout of the same repository. Changes are made in isolation and merged afterward. Use when multiple subagents will write to the same files.

```bash
# The workflow script manages this automatically under ultracode
# Manual setup for custom scripts:
git worktree add ../branch-A feature/branch-A
git worktree add ../branch-B feature/branch-B
```

**`/batch`:** Splits one large change into 5–30 worktree-isolated subagents that each open a pull request. Good for applying a uniform transformation across many files without a full dynamic workflow overhead.

```
/batch: apply the new error-handling pattern to every file in src/handlers/
```

**When to use each:**

| Situation | Tool |
|---|---|
| Parallel subagents reading the same files (no writes) | No isolation needed |
| Parallel subagents writing to different files | No isolation needed |
| Parallel subagents writing to overlapping files | Worktrees |
| One large uniform change across many files | `/batch` |
| Full codebase audit or cross-checked migration | Dynamic workflow (manages worktrees internally) |

---

## Cost Tradeoff — The Guardrail

**Parallelism cuts wall-clock time by ~60–80% on independent work. It does not reduce cost.**

Running many workers at once multiplies token usage. Dynamic workflows add on top of that: adversarial verification means each finding is examined multiple times by multiple agents. For a large codebase audit this can burn substantially more tokens than a focused single-agent session.

**Therefore:**

- **Smart Routing stays the default** (`skills/cost-efficiency/`). The Orchestrator applies it automatically.
- **Dynamic workflows are an explicit, deliberate opt-in** — triggered by the word `workflow` or by the user activating `ultracode`.
- Before triggering ultracode on a large job, consider whether Smart Routing with a few targeted subagents would reach the same result at lower cost.
- Use dynamic workflows when **correctness at scale** matters more than token cost: security audits, migration correctness, large multi-angle research where a missed finding has downstream consequences.

**Cost signal by surface (relative):**

| Surface | Relative token cost | Wall-clock vs sequential |
|---|---|---|
| Sequential subagents | 1x | 1x (baseline) |
| ~10 parallel subagents | 1x (same total tokens) | ~3–5x faster |
| Agent teams (3–5 teammates) | ~5–15x | faster for large features |
| Dynamic workflows (adversarial) | Substantially higher (varies by N subagents × rounds) | ~60–80% faster wall-clock |

### Cost Thresholds — Lever Multiplier Table and the ~2× Rule

Each compensation lever has a documented token-cost multiplier relative to a
plain single-pass session. These multiply when stacked (e.g. decomposition ×
adversarial verification), so a workflow combining several heavy levers can
reach a much larger total multiplier than any single row suggests.

| Lever | Cost multiplier | Why it works |
|---|---|---|
| Deterministic hooks/scripts | ~1.05× | Regex on file paths triggers checks at ~100% recall regardless of model tier — best ROI of any lever. |
| Structured handoff templates | ~1.1× | Converts "remember to mention X" (capability) into "fill in field X" (compliance). |
| Dual parallel gates + decision matrix | ~1.2× | Converts post-build acceptance from judgment to rule application (tier-insensitive). |
| Decomposition + externalized state | 1.3–2× | Short bounded task horizons avoid long-horizon degradation structurally instead of out-reasoning it. |
| Adversarial verification of FACTUAL findings | 2–4× | Counterexample-finding is easier than original synthesis, so same-tier skeptics add real signal (see Verification Scoping above — facts only). |
| Judge panels on verdict conflicts only | 2–3× (on the ~10–20% of runs that conflict) | Reduces tie-break variance where explicit adjudication criteria exist (`QUALITY-GATES.md` Step 2). |
| Loop-until-dry enumeration | 3–10× | Multiple independently framed passes approach the recall a stronger model gets in one pass. |

**The ~2× rule:** Fable 5 costs roughly 2× Opus 4.8 per token ($10/$50 vs
$5/$25 in/out per MTok). Compensation levers stack multiplicatively — when a
task's *planned* compensation stack (sum of the levers you intend to invoke)
exceeds roughly a **2× total token multiplier**, a Fable-5 run would likely be
both cheaper AND higher-ceiling than compensating on Opus 4.8, because
compensation buys reliability parity within Opus' capability envelope but
never raises that envelope (see `docs/AGENT_MODEL_SELECTION.md` — Fable-parity
economics for the full break-even argument).

Before launching a heavy workflow, state the projected multiplier in one line
(Routing Log entry — defined in `docs/templates/SPRINT_TEMPLATE.md` § Routing
Log; per-turn announcement if no sprint file exists — or workflow
announcement), e.g.:

```
projected multiplier: decomposition (1.5x) x adversarial-facts (3x) ~= 4.5x -> exceeds 2x threshold, consider Fable-5 if available
```

This is a planning heuristic, not a hard gate — proceed on Opus-only orgs
where Fable is unavailable, but log the number so the cost tradeoff is
visible before spend, not after. On orgs with Fable 5 access, the `best`
alias already resolves to it automatically (see CLAUDE.md Ultracode
Orchestrator Model Strategy) — these thresholds matter for Opus-only
environments where that auto-upgrade path does not apply.

---

## Cross-Links

- `skills/agent-teams/` — Coordinated persistent teammates with SharedTaskList. Use when you want synchronized human-like parallelism, not adversarial verification.
- `skills/cost-efficiency/` — Smart Routing default policy. Always consult before opting into ultracode.
- **`## Parallelization` section of `CLAUDE.md`** — Canonical fan-out/fan-in rules, dependency mapping, concurrency tiers, and the cost guardrail as they apply to the Orchestrator's default behavior.
