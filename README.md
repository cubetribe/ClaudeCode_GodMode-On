<div align="center">

# CC_GodMode

### *"What happens when an AI system is used to improve itself?"*

**You're looking at the answer.**

[![Version](https://img.shields.io/badge/Version-8.0.0-blue)](./CHANGELOG.md)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20%2B%20Skills-green)](./skills/)
[![Agents](https://img.shields.io/badge/Agents-8%20Core%20%2B%201%20Security%20%2B%206%20Dept-purple)](./docs/AGENTS.md)
[![Plugin](https://img.shields.io/badge/Plugin-Ready-orange)](./CLAUDE.md)
[![Ultracode Ready](https://img.shields.io/badge/Ultracode-Ready-brightgreen)](./docs/ARCHITECTURE.md)
[![Self-Improving](https://img.shields.io/badge/Self--Improving-Yes%2C%20Really-red)](./docs/STORY.md)

</div>

---

## The System That Builds Itself

Welcome to the machine shop. Except the machines are building themselves — and they're getting better at it.

**CC_GodMode v7.0.0, v7.1.0, and v8.0.0 weren't built by hand.** They were planned, architected, implemented, validated, documented, and shipped by the exact agents defined in this repo. v8.0.0 went further: it was produced by a **parallel dynamic workflow** — a dozen edit subagents fanned out at once, each adversarially verified by another. The orchestrator delegated, gated, and opened the PR itself.

That's not marketing copy. That's what happened — [the full story is here](./docs/STORY.md).

---

## Install in 30 Seconds

CC_GodMode is a Claude Code plugin that turns your workflow into a self-orchestrating multi-agent system.

**macOS / Linux:**
```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
./scripts/apply-global-claude-setup.sh
./scripts/apply-global-claude-setup.sh --check   # Verify installation
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
.\scripts\apply-global-claude-setup.ps1
.\scripts\apply-global-claude-setup.ps1 -Check   # Verify installation
```

Then activate in any project:
```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
claude
```

Done. The orchestrator is active. → **Full setup, MCP servers, and prompt-based fallback: [Installation Guide](./docs/INSTALLATION.md).**

---

## Just Type GodMode

Once installed, daily usage is one line:

```
GodMode: New Feature: user authentication with JWT
GodMode: Bug Fix: cart total miscalculates with discount codes
GodMode: Research: best approach for real-time sync in React 18
```

No ceremony. After one-time setup the orchestrator loads from `CLAUDE.md` automatically. You say *what* you want — the system figures out *which* agents to call, in *what* order, at *what* cost.

---

## What Is This?

**CC_GodMode** transforms Claude Code into a self-orchestrating multi-agent development team — driven by the `best` / Claude Opus 4.8 orchestrator at **ultracode** effort, fanning work out across parallel Claude Code subagents for implementation, validation, and documentation.

**You say WHAT. The AI figures out HOW.**

```
You: "I need user authentication with JWT"

Orchestrator:
  → Analyzes the request and determines the version bump
  → Creates the report folder
  → Delegates to @architect for design
  → Delegates to @api-guardian for API impact
  → Delegates to @builder for implementation
  → @validator checks code quality  ┐ in parallel
  → @tester checks UX quality        ┘
  → @scribe documents everything
  → @github-manager opens the PR

You: *drinks coffee*
```

| Without CC_GodMode | With CC_GodMode |
|:---|:---|
| You: "Design the feature" | You: "Build Feature X" |
| You: "Now implement it" | ☕ |
| You: "Check the types" | ☕ |
| You: "Update the consumers" | ☕ |
| You: "Write the docs" | ☕ |
| You: "Did I forget something?" | AI: "Done. Here's the report." |

---

## Parallel-First & Ultracode

v8.0.0's headline: **parallelization is the default**, not an afterthought.

- **Orchestrator on `best` / Opus 4.8 at ultracode** — xhigh reasoning plus automatic dynamic workflows for substantive tasks. The `best` alias auto-upgrades as your org gains access to more capable models, so the system never goes stale.
- **Fan-out by default** — independent units (multi-file edits, audits, migrations, multi-angle research) spawn parallel subagents in a single message; the orchestrator fans in and synthesizes their verdicts.
- **Dynamic-workflows escalation** — when a job outgrows ~10 concurrent subagents, it escalates to tens-to-hundreds of subagents with **adversarial verification** (agents try to refute each other's findings). See [`skills/dynamic-workflows/`](./skills/dynamic-workflows/SKILL.md).
- **Smart Routing stays the default** — risk-based, minimal-agent paths; ~30–50% token reduction vs. always-Full-Gates. Parallel is *faster, not cheaper*, so max-parallel is a deliberate opt-in.

→ Deep dive: [Architecture](./docs/ARCHITECTURE.md) · cost model: [Agent Model Selection](./docs/AGENT_MODEL_SELECTION.md).

---

## The Agents

**15 specialists**, each with one job, a model assignment, and effort tuning:

- **8 core** — `@researcher` `@architect` `@api-guardian` `@builder` `@validator` `@tester` `@scribe` `@github-manager` (always available).
- **1 security gate** — `@security`, for secrets, injection, auth/authz, crypto, and dependency review.
- **6 department** — `@ci-security-guardian` `@docs-dx` `@quality-operations` `@runtime-platform` `@workflow-design` `@workspace-governance` (activate when their domain is in scope).

After `@builder`, the **dual quality gates** — `@validator` (code) and `@tester` (UX) — run **in parallel** and both must pass before `@scribe` documents and ships.

→ Full roster, quality gates, and workflows: **[The Agents](./docs/AGENTS.md)**.

---

## The Rules

1. **Version-First** — Determine the version BEFORE any work starts
2. **Smart Routing default** — Risk-based routing; Full-Gates for high-risk signals
3. **Architecture gate (split)** — Inline brief for small/medium; @architect (Opus) for new modules / breaking changes
4. **@api-guardian is MANDATORY** — For any API/schema/type change (enforced by hook)
5. **Dual Quality Gates** — Both @validator AND @tester must pass (parallel execution)
6. **@tester MUST create screenshots** — Every page tested at 3 viewports
7. **No Skipping** — Every agent in the workflow executes
8. **Reports in `reports/vX.X.X/`** — Organized by version
9. **NEVER push without permission** — Applies to ALL agents

---

## Documentation

**Guides** (start here):
- **[Installation Guide](./docs/INSTALLATION.md)** — script install, MCP servers, prompt-based fallback, recovery
- **[Architecture](./docs/ARCHITECTURE.md)** — parallel-first orchestration, file structure, dual-location model, the hook
- **[The Agents](./docs/AGENTS.md)** — the 15-agent roster, quality gates, workflows, and modes
- **[The Story & Design Philosophy](./docs/STORY.md)** — how (and why) the system builds itself

**Reference:**
- **[CHANGELOG.md](./CHANGELOG.md)** — full version history
- **[AGENT_MODEL_SELECTION.md](./docs/AGENT_MODEL_SELECTION.md)** — model aliases, pricing, and cost optimization
- **[AGENT_ARCHITECTURE.md](./docs/AGENT_ARCHITECTURE.md)** — dual-location install/update/verify procedures
- **[orchestrator/AGENTS.md](./docs/orchestrator/AGENTS.md)** — agent registry & handoff matrix
- **[orchestrator/WORKFLOWS.md](./docs/orchestrator/WORKFLOWS.md)** · **[MODES.md](./docs/orchestrator/MODES.md)** · **[QUALITY-GATES.md](./docs/orchestrator/QUALITY-GATES.md)** · **[VERSIONING.md](./docs/orchestrator/VERSIONING.md)** · **[META-DECISIONS.md](./docs/orchestrator/META-DECISIONS.md)**

**Policies:**
- **[REPORT_TEMPLATES.md](./docs/templates/REPORT_TEMPLATES.md)** · **[CONTEXT_SCOPE_POLICY.md](./docs/policies/CONTEXT_SCOPE_POLICY.md)** · **[SECURITY_TOOLING_POLICY.md](./docs/policies/SECURITY_TOOLING_POLICY.md)**

---

## FAQ

**Q: Why 15 agents?**
A: 8 core cover the standard workflow, 1 optional `@security` gate activates for security-sensitive changes, and 6 optional department agents activate only when their domain is in scope. Separation of concerns — each agent has ONE job.

**Q: What's the difference between @validator and @tester?**
A: `@validator` = code quality (TypeScript, tests, security). `@tester` = UX quality (E2E, visual, a11y, perf). They run in parallel.

**Q: Can agents push without my permission?**
A: No. "NEVER git push without permission" is enforced across all agents.

→ More, plus the origin story: [The Story & Design Philosophy](./docs/STORY.md).

---

## Version

**CC_GodMode v8.0.0 — The Ultracode Release**

What's in the box:
- **15 agents** (8 core + 1 security gate + 6 department) with effort-field budget tuning
- **13 skills** for workflows, quality gates, release, research, API changes, modes, teams, bootstrap, and dynamic workflows
- **Parallel-first orchestration** — fan-out by default, dynamic-workflows escalation with adversarial verification
- **Dual quality gates** (parallel execution for speed)
- **Smart Routing by default** (~30–50% token savings vs. old always-Full-Gates)
- **Version-first workflow** with automated checks

See the [CHANGELOG](./CHANGELOG.md) for the full history.

---

## Credits

**Dennis Westermann** ([www.dennis-westermann.de](https://www.dennis-westermann.de))
*Years of suffering, distilled into this repo. Now the repo improves itself. Was it worth it?*

---

## License

**Proprietary License** — Private use permitted. Commercial use requires permission.

Copyright (c) 2025 Dennis Westermann

---

<div align="center">

**Made with mass sleep deprivation**

*The experiment continues.*

⭐ Star if you're not too unsettled ⭐

</div>
