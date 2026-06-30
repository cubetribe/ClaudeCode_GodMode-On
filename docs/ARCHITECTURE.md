# Architecture

A reference guide to how CC_GodMode is structured, how its orchestrator thinks, and why the pieces live where they do.

---

## Parallel-First & Ultracode Orchestration

The orchestrator runs on `best` (Opus 4.8, auto-upgrades as higher tiers become available) at **ultracode** effort — maximum reasoning plus automatic dynamic workflows for substantive tasks. Everything else follows from that single decision.

**How it works:**

- **Parallel fan-out is the default.** When a request decomposes into independent units (multi-file edits, multi-domain work, audits, migrations, multi-angle research), the orchestrator spawns multiple subagents in a single message rather than sequentially, then collects and synthesizes their verdicts.
- **Dynamic-workflows escalation.** When a job outgrows ~10 concurrent subagents — codebase-wide audits, large migrations, cross-checked research — the orchestrator escalates to dynamic workflows (`/workflows` or ultracode) with adversarial verification across tens-to-hundreds of subagents.
- **Subagents stay on tiered aliases.** haiku for simple ops, sonnet for implementation, opus for architecture. Only genuinely hard problems justify the expensive tier.
- **Effort fields tune token budgets.** Each agent's `effort` frontmatter field (requires Claude Code ≥2.1.152) tells the runtime how hard to think: architect=high, builder/tester/api-guardian=medium, everything else=low.
- **Smart Routing is the default.** Risk-based, minimal-agent paths replace the old always-Full-Gates default. Estimated 30–50% token reduction per standard feature (based on per-workflow cost models in `docs/AGENT_MODEL_SELECTION.md`).
- **Full-Gates activates automatically** for API/schema changes, security surfaces, release artifacts, new modules, and breaking changes.
- **Cost guardrail.** Parallel means faster, not cheaper. Dynamic workflows multiply token spend. Max-parallel and dynamic-workflows are explicit, deliberate opt-ins for big or time-critical jobs — Smart Routing stays the default.

**Token efficiency per workflow type:**

| Workflow | Smart Routing | Full-Gates |
|:---------|:-------------|:-----------|
| Simple bug fix | @builder + scoped gates | all agents |
| Docs-only | @scribe only | — |
| Standard feature | inline brief + @builder + scoped gates | @architect + full sequence |
| API change | always Full-Gates (mandatory @api-guardian) | always Full-Gates |

**The four parallelization surfaces:**

| Surface | What it is | Use when |
|:--------|:-----------|:---------|
| **Subagents** | Delegated workers inside one session, own context, return a summary | A side task would flood the main context; up to ~10 run concurrently, the rest queue |
| **Agent view** (`claude agents`) | Dispatch + monitor background sessions | Several independent hand-off tasks you check on later |
| **Agent teams** | Coordinated sessions, shared task list, inter-agent messaging, lead-managed | Split a project, assign pieces, keep workers in sync (experimental, off by default) |
| **Dynamic workflows** (`/workflows`) | Script runs many subagents + adversarial cross-checks | Job outgrows a handful of subagents: codebase-wide audit, 500-file migration, cross-checked research |

---

## File Structure

Two trees, two purposes. The runtime tree is what Claude Code loads. The project tree is what you ship.

**Runtime — `~/.claude/` (what Claude loads)**

```
~/.claude/                          ← RUNTIME (What Claude loads)
├── agents/                         ← 15 agents (8 core + 1 security gate + 6 department), globally available
│   ├── researcher.md               ← haiku, effort: low
│   ├── architect.md                ← opus, effort: high
│   ├── api-guardian.md             ← sonnet, effort: medium
│   ├── builder.md                  ← sonnet, effort: medium
│   ├── validator.md                ← sonnet, effort: low
│   ├── tester.md                   ← sonnet, effort: medium
│   ├── scribe.md                   ← haiku, effort: low
│   ├── github-manager.md           ← haiku, effort: low
│   ├── security.md                 ← opus, effort: low  (security gate, optional)
│   ├── ci-security-guardian.md     ← sonnet, effort: low (dept.)
│   ├── docs-dx.md                  ← sonnet, effort: low (dept.)
│   ├── quality-operations.md       ← sonnet, effort: low (dept.)
│   ├── runtime-platform.md         ← sonnet, effort: low (dept.)
│   ├── workflow-design.md          ← sonnet, effort: low (dept.)
│   └── workspace-governance.md     ← sonnet, effort: low (dept.)
├── scripts/                        ← Hook scripts
│   ├── session-start.js
│   ├── validate-agent-output.js
│   └── check-api-impact.js
└── settings.json                   ← Hooks (SessionStart, PostToolUse,
                                       SubagentStop, TaskCompleted)
```

**Your project**

```
your-project/                       ← YOUR PROJECT
├── CLAUDE.md                       ← Orchestrator (~65 lines, auto-loaded!)
├── VERSION                         ← Single source of truth
├── CHANGELOG.md                    ← Version history
├── docs/orchestrator/              ← Modular reference docs
│   ├── AGENTS.md                   ← Agent registry & handoff matrix
│   ├── WORKFLOWS.md                ← All workflow definitions
│   ├── MODES.md                    ← Smart Routing, Prototype, Departments, Cost-Efficiency
│   ├── QUALITY-GATES.md            ← Parallel gate orchestration
│   ├── VERSIONING.md               ← Version-first & pre-push rules
│   └── META-DECISIONS.md           ← Meta-logic, ADR, RARE, escalation
├── reports/                        ← Agent outputs (gitignored)
│   └── vX.X.X/                     ← Grouped by version
└── .playwright-mcp/                ← Screenshot output
```

`CLAUDE.md` is auto-loaded by Claude Code on every session. The 65 lines contain the core rules; the 13 skills in `skills/` load on-demand so context stays focused.

---

## The Dual-Location Model

CC_GodMode separates where agents live from where Claude reads them.

```
┌─────────────────────────────────────────────────────────────────────┐
│                    AGENT DUAL-LOCATION MODEL                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   GitHub Repository                    Your System                   │
│   ════════════════                    ════════════                   │
│                                                                      │
│   CC_GodMode/                         ~/.claude/                     │
│   └── agents/           ──INSTALL──►  └── agents/                   │
│       ├── architect.md  (15 files)        ├── architect.md          │
│       ├── builder.md                      ├── builder.md            │
│       ├── validator.md                    ├── validator.md          │
│       ├── ...8 core...                    ├── ...8 core...          │
│       └── ...6 dept...                    └── ...6 dept...          │
│                                                                      │
│   SOURCE                               RUNTIME                       │
│   • Version controlled                 • Actually loaded by Claude   │
│   • Templates for Git                  • System-wide available       │
│   • Update here, reinstall             • Used during workflows       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

**Source** (`/agents/` in the repo) is tracked in Git — shareable, diffable, PR-reviewable. **Runtime** (`~/.claude/agents/`) is where Claude Code looks when it resolves a `subagent_type`. They are not the same directory; changes to source only take effect after an install step copies them to runtime.

**Update flow in brief:**
1. Modify an agent file in `agents/` (source)
2. Run the installation script
3. Files are copied to `~/.claude/agents/` (runtime)
4. Claude Code picks up the updated agent on the next task

For full install, update, and verification procedures — including the installer scripts, manual fallback steps, and how to confirm the right version is live — see [`./AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md).

---

## The Hook

The secret ingredient: a PostToolUse hook that fires after every file write.

```
Developer changes: shared/types/User.ts
                          │
                          ▼
              ┌───────────────────────┐
              │  check-api-impact.js  │  ← AUTOMATICALLY
              │                       │
              │  • Detects API change │
              │  • Analyzes diff      │
              │  • Finds consumers    │
              │  • Warns about breaks │
              └───────────────────────┘
                          │
                          ▼
╔═══════════════════════════════════════════════════════════╗
║  ⚠️  API/TYPE FILE CHANGE DETECTED                         ║
║                                                            ║
║  📁 File: shared/types/User.ts                             ║
║  🔴 BREAKING: Removed field 'email'                        ║
║  📍 5 consumers found                                      ║
║                                                            ║
║  ⚡ @api-guardian MUST be called!                          ║
╚═══════════════════════════════════════════════════════════╝
```

`check-api-impact.js` watches for writes to API-critical paths (`src/api/`, `backend/routes/`, `shared/types/`, `*.d.ts`, `openapi.yaml`), diffs the change, discovers downstream consumers, and blocks the workflow until @api-guardian has signed off. Nothing gets forgotten — the hook remembers so the orchestrator doesn't have to.

---

## Evolution

The architecture has a clear lineage:

**v6.0** modular architecture →
**v6.1** Skills system (on-demand knowledge, 13 skills) →
**v6.2** worktree isolation →
**v6.3** plugin packaging →
**v6.4** Workflow Modes →
**v7.0** orchestrator tuning + Smart Routing default →
**v7.1** @security gate + installer scripts (15 agents total) →
**v8.0** Ultracode orchestrator + parallel-first architecture

Each step is additive. The core contract — `CLAUDE.md` auto-loads, agents live in `~/.claude/agents/`, skills load on demand — has been stable since v6.0.

---

## See Also

- [`../README.md`](../README.md) — project overview and quick-start
- [`./AGENT_ARCHITECTURE.md`](./AGENT_ARCHITECTURE.md) — full agent install, update, and verification procedures
- [`./AGENT_MODEL_SELECTION.md`](./AGENT_MODEL_SELECTION.md) — model and effort matrix per agent, cost models
- [`./orchestrator/MODES.md`](./orchestrator/MODES.md) — Smart Routing, Full-Gates, Prototype, Departments, Agent Teams, Ultracode
- [`../skills/dynamic-workflows/SKILL.md`](../skills/dynamic-workflows/SKILL.md) — when and how to escalate to dynamic workflows with adversarial verification
