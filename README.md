<div align="center">

# GodMode Core for Claude Code

*currently published as **CC_GodMode***

### *"What happens when an AI system is used to improve itself?"*

**You're looking at the answer.**

[![License: Proprietary](https://img.shields.io/badge/License-Proprietary_(non--commercial)-red.svg)](LICENSE)
[![Version](https://img.shields.io/badge/Version-8.6.0-blue)](./CHANGELOG.md)
[![Architecture](https://img.shields.io/badge/Architecture-Modular%20%2B%20Skills-green)](./skills/)
[![Agents](https://img.shields.io/badge/Agents-7%20Core%20%2B%201%20Security%20%2B%206%20Dept-purple)](./docs/AGENTS.md)
[![Plugin](https://img.shields.io/badge/Plugin-Ready-orange)](./CLAUDE.md)
[![Ultracode Ready](https://img.shields.io/badge/Ultracode-Ready-brightgreen)](./docs/ARCHITECTURE.md)
[![Self-Improving](https://img.shields.io/badge/Self--Improving-Yes%2C%20Really-red)](./docs/STORY.md)

</div>

> **Not open source.** Free for private, non-commercial use. Forks & pull requests on GitHub are welcome — re-hosting on third-party platforms/marketplaces is prohibited and attribution is required. See [LICENSE](LICENSE) and [NOTICE](NOTICE).

## Choose your GodMode

| Product | Best fit | What it provides |
|---|---|---|
| **GodMode Core for Claude Code** — this repository (currently CC_GodMode) | You operate your own Claude Code setup | Self-installed orchestrator rules, 14 agents, 14 skills, hooks and release tooling, under its own license terms |
| [**GodMode Core for Codex**](https://github.com/cubetribe/CODEX_GodMode_ON) | You operate your own Codex setup | The separately maintained Codex workflow package |
| [**GodMode Pro by Nerdsmiths**](https://godmode.nerdsmiths.de/) | You want an integrated application and assisted setup | A separate proprietary desktop application for project control, result review, maintained integrations, and scoped onboarding and support |

Core has no package subscription; Claude access and usage are paid separately. Free availability for private, non-commercial use does not make it open source and does not change the license. Pro has its own availability, pricing, and service terms; see the [Nerdsmiths landing page](https://godmode.nerdsmiths.de/).

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
```

**Windows (PowerShell):**
```powershell
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
.\scripts\apply-global-claude-setup.ps1
```

One run installs everything into `~/.claude/`: all 14 agents, all 14 skills, the scripts, the
templates, LICENSE and NOTICE — and, since v8.7.0, the hooks themselves, merged into
`~/.claude/settings.json` (your own settings, `model`, `permissions`, custom hooks, survive the
merge untouched). Without this step, nothing enforces the rules below; a Claude Code session with
no hooks wired is a session where `@api-guardian` never fires and the deterministic checks never run.

**Activate GodMode per project — on purpose, not globally.** The installer does **not** write a
global `~/.claude/CLAUDE.md`. It places the orchestrator template at
`~/.claude/templates/CLAUDE-ORCHESTRATOR.md`, and you copy it into each project you want GodMode to
run in:

```bash
cd your-project
cp ~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md
claude
```

That's deliberate: GodMode opts in per project instead of taking over every Claude Code session on
the machine. Done. The orchestrator is active in this project. → **MCP servers and prompt-based
fallback: [Installation Guide](./docs/INSTALLATION.md).**

---

## Update

Already installed? Same command, every time:

```bash
git pull && ./scripts/apply-global-claude-setup.sh
```

There is no separate updater — the installer is idempotent, backs up `~/.claude/settings.json`
before touching it, and prints the before/after version so you can see what changed. If nothing
changed, it says so and stays quiet.

---

## Verify your install

```bash
node scripts/verify-install.js
```

Checks that all 14 agents and all 14 skills are present under `~/.claude/`, that every hook from
`config/claude-settings.json` is wired into `~/.claude/settings.json` **and points at a file that
still exists** (a hook pointing at nothing is the same as no hook), that
`~/.claude/templates/CLAUDE-ORCHESTRATOR.md`, `LICENSE`, and `NOTICE` are in place, and that your
installed version matches the repo's `VERSION`. Exit code 0 means the installation is complete;
exit code 1 lists exactly what's missing.

**MCP servers are a separate, deliberate step.** `./scripts/install-mcps.sh` is not part of the
install/update command and stays that way. `playwright` is the one that matters for `@tester`'s
browser-based UX gate (Core Rule 6); without it, the UX gate falls back to `human` review instead
of failing the sprint. That's a graceful degradation, not a missing dependency.

---

## Daily Usage — Two Steps

The orchestrator loads from `CLAUDE.md` automatically. But its headline power — **parallel-first dynamic workflows — only fans out when Ultracode is on, and Ultracode is session-scoped**. So each new session is two steps (verified on Claude Code 2.1.286; use 2.1.28x or newer):

**Step 1 — Pick the model, turn on Ultracode.** Once per session, by command:

```
/model opus         # Opus 5.5 — the recommended default, the model this system is tuned for
/effort xhigh       # optional: raise reasoning effort for hard tasks
/effort ultracode   # separate session-only switch: automatic dynamic workflows, effort unchanged
```

`ultracode` is not an effort level. It is a switch that turns on automatic dynamic workflows for the session and leaves your effort setting alone. It needs dynamic workflows enabled in `/config`, and availability depends on the model. For a one-off, put the keyword `ultracode` in a single prompt instead.

Optional upgrade: `/model best` resolves to Fable 5.1 where your org has access (about 2.5× Opus 5.5's list price), otherwise to Opus 5.5. Nothing depends on it.

**Step 2 — Say what you want, prefixed with `GodMode:`**

```
GodMode: New Feature: user authentication with JWT
GodMode: Bug Fix: cart total miscalculates with discount codes
GodMode: Research: best approach for real-time sync in React 18
```

You say *what* you want — the system figures out *which* agents to call, in *what* order, at *what* cost. Ultracode is the one thing that does **not** persist across sessions, so make Step 1 a habit; skip it and GodMode still orchestrates and gates correctly, it just won't fan out to its full parallel width. The trigger `GodMode:` is case-insensitive (`GODMODE:` works too).

---

## What Is This?

**CC_GodMode** transforms Claude Code into a self-orchestrating multi-agent development team — driven by an Opus 5.5 orchestrator (`/model opus`) with **ultracode** switched on, fanning work out across parallel Claude Code subagents for implementation, validation, and documentation.

**You say WHAT. The AI figures out HOW.**

```
You: "I need user authentication with JWT"

Orchestrator:
  → Plans the work and splits it into sprints with write-scope ownership
  → Creates the report folder
  → Delegates to @architect for design
  → Delegates to @api-guardian for API impact
  → Delegates to @builder for implementation
  → Deterministic hook runs typecheck/lint/tests/build (always, ~0 context on success)
  → @tester checks UX quality, only if the sprint declared `ux_gate: auto`
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

- **Orchestrator tuned for Opus 5.5 (`/model opus`) with ultracode on** — ultracode switches on automatic dynamic workflows for substantive tasks. The `best` alias resolves to Fable 5.1 where your org has access (about 2.5× Opus 5.5's list price) — an optional upgrade, no feature depends on it.
- **Fan-out by default** — independent units (multi-file edits, audits, migrations, multi-angle research) spawn parallel subagents in a single message; the orchestrator fans in and synthesizes their verdicts.
- **Dynamic-workflows escalation** — when a job outgrows ~10 concurrent subagents, it escalates to tens-to-hundreds of subagents with **adversarial verification** (agents try to refute each other's findings). See [`skills/dynamic-workflows/`](./skills/dynamic-workflows/SKILL.md).
- **Smart Routing stays the default** — risk-based, minimal-agent paths; ~30–50% token reduction vs. always-Full-Gates. Parallel is *faster, not cheaper*, so max-parallel is a deliberate opt-in.

→ Deep dive: [Architecture](./docs/ARCHITECTURE.md) · cost model: [Agent Model Selection](./docs/AGENT_MODEL_SELECTION.md).

---

## The Agents

**14 specialists**, each with one job, a model assignment, and effort tuning:

- **7 core** — `@researcher` `@architect` `@api-guardian` `@builder` `@tester` `@scribe` `@github-manager` (always available).
- **1 security gate** — `@security`, for secrets, injection, auth/authz, crypto, and dependency review.
- **6 department** — `@ci-security-guardian` `@docs-dx` `@quality-operations` `@runtime-platform` `@workflow-design` `@workspace-governance` (activate when their domain is in scope).

After `@builder`, a deterministic hook (typecheck, lint, tests, build) always runs and costs no context on success. `@tester` (UX) runs only when the sprint declared `ux_gate: auto`; `@security` runs on security surfaces; a `/code-review` pass is pulled when risk or doubt warrants it. No standing agent re-reads the diff a compiler already checked.

→ Full roster, quality gates, and workflows: **[The Agents](./docs/AGENTS.md)**.

---

## The Rules

1. **Plan-First** — Non-trivial work starts with a plan (`plans/vX.Y.Z/`) split into sprints with explicit write-scope ownership; the version is decided at release, never at work start (ADR-004)
2. **Delegate when it pays** — Delegate large, genuinely independent, parallelizable work, or work needing a specialist's tools or a separate write scope; do what fits in a handful of tool calls yourself; never delegate to double-check your own work (that is what the deterministic checks are for). **Smart Routing** is the default — risk-based, Full-Gates for high-risk signals
3. **Architecture gate (split)** — Inline brief for small/medium; @architect (Opus) for new modules / breaking changes
4. **@api-guardian is MANDATORY** — For any API/schema/type change (enforced by hook)
5. **Verification matches the evidence** — After @builder, a deterministic hook (typecheck/lint/tests/build) always runs; @tester or @security only run where they open evidence @builder didn't have; a `/code-review` pass is pulled on risk or doubt
6. **The UX gate is declared, not assumed** — Every sprint carries `ux_gate: auto | human | skip`, decided once at planning (default `human`); under `auto`, @tester screenshots every page at 3 viewports (375×667 / 768×1024 / 1920×1080)
7. **No Skipping within the selected path** — Smart Routing picks the minimal set; that set executes fully. Whatever it leaves out is logged in the Routing Log, not silently dropped
8. **Sprint-scoped reports & single-writer hot files** — parallel agents get disjoint write scopes; `VERSION`/`CHANGELOG.md` have exactly one writer (the release tooling / @scribe)
9. **NEVER push without permission** — Applies to ALL agents
10. **Release invariant, machine-checked** — `VERSION == CHANGELOG == tag == GitHub release`, enforced locally and in CI

---

## Documentation

**Guides** (start here):
- **[Installation Guide](./docs/INSTALLATION.md)** — script install, MCP servers, prompt-based fallback, recovery
- **[Architecture](./docs/ARCHITECTURE.md)** — parallel-first orchestration, file structure, dual-location model, the hook
- **[The Agents](./docs/AGENTS.md)** — the 14-agent roster, quality gates, workflows, and modes
- **[The Story & Design Philosophy](./docs/STORY.md)** — how (and why) the system builds itself
- **[ROADMAP.md](./ROADMAP.md)** — living roadmap · **[plans/](./plans/)** — active plans & sprint files

**Reference:**
- **[CHANGELOG.md](./CHANGELOG.md)** — full version history
- **[AGENT_MODEL_SELECTION.md](./docs/AGENT_MODEL_SELECTION.md)** — model aliases, pricing, and cost optimization
- **[AGENT_ARCHITECTURE.md](./docs/AGENT_ARCHITECTURE.md)** — dual-location install/update/verify procedures
- **[orchestrator/AGENTS.md](./docs/orchestrator/AGENTS.md)** — agent registry & handoff matrix
- **[orchestrator/VERSIONING.md](./docs/orchestrator/VERSIONING.md)** — **the release law** (single source of truth, invariant, procedures)
- **[orchestrator/WORKFLOWS.md](./docs/orchestrator/WORKFLOWS.md)** · **[MODES.md](./docs/orchestrator/MODES.md)** · **[QUALITY-GATES.md](./docs/orchestrator/QUALITY-GATES.md)** · **[VERSIONING.md](./docs/orchestrator/VERSIONING.md)** · **[META-DECISIONS.md](./docs/orchestrator/META-DECISIONS.md)**

**Policies:**
- **[REPORT_TEMPLATES.md](./docs/templates/REPORT_TEMPLATES.md)** · **[CONTEXT_SCOPE_POLICY.md](./docs/policies/CONTEXT_SCOPE_POLICY.md)** · **[SECURITY_TOOLING_POLICY.md](./docs/policies/SECURITY_TOOLING_POLICY.md)**

---

## FAQ

**Q: Why 14 agents?**
A: 7 core cover the standard workflow, 1 optional `@security` gate activates for security-sensitive changes, and 6 optional department agents activate only when their domain is in scope. Separation of concerns — each agent has ONE job.

**Q: What happened to @validator?**
A: It was dissolved, not replaced. Its deterministic part (typecheck, lint, tests, build) moved into a hook that runs after every @builder pass and costs no context on success. Its judgment part (code review) is pulled on demand via `/code-review` instead of a standing agent re-reading the same diff.

**Q: What does @tester do now?**
A: UX quality (E2E, visual, a11y, perf) — but only when the sprint declares `ux_gate: auto`. It's the one true writer-verifier left in the system because it opens evidence (browser, screenshots) @builder never had.

**Q: Can agents push without my permission?**
A: No. "NEVER git push without permission" is enforced across all agents.

→ More, plus the origin story: [The Story & Design Philosophy](./docs/STORY.md).

---

## Version

**CC_GodMode v8.6.0**

What's in the box:
- **14 agents** (7 core + 1 security gate + 6 department) with effort-field budget tuning
- **14 skills** for workflows, quality gates, release, research, API changes, modes, teams, bootstrap, and dynamic workflows
- **Parallel-first orchestration** — fan-out by default, dynamic-workflows escalation with adversarial verification
- **Evidence-matched verification** — deterministic hook always, @tester opt-in via `ux_gate`, @security on security surfaces, `/code-review` on risk
- **Smart Routing by default** (~30–50% token savings vs. old always-Full-Gates)
- **Version-at-release workflow** — `VERSION` is written once by the release tooling; the release invariant is machine-checked

See the [CHANGELOG](./CHANGELOG.md) for the full history.

---

## Credits

**Dennis Westermann** ([www.dennis-westermann.de](https://www.dennis-westermann.de))
*Years of suffering, distilled into this repo. Now the repo improves itself. Was it worth it?*

---

## License

**Proprietary License** — Copyright (c) 2025-2026 Dennis Westermann. Free for private,
non-commercial use; commercial use requires written permission. Attribution is **required**
for every permitted copy. Forks and pull requests on GitHub are expressly welcome;
re-hosting, mirroring, or redistribution on third-party platforms is prohibited.

See [LICENSE](LICENSE) and [NOTICE](NOTICE) for the full terms.

---

<div align="center">

**Made with mass sleep deprivation**

*The experiment continues.*

⭐ Star if you're not too unsettled ⭐

</div>
