---
agent: docs-dx
version: v7.0.0
date: 2026-06-11
status: BLOCKED
task: Public-docs / DX review of v7.0.0 "The Fable Release" (README, plugin.json, install prompts, AGENT_MODEL_SELECTION)
---

# Docs-DX Review: v7.0.0 — VERDICT: BLOCKED

## Finding 1 — README dead prompt-file links (MISLEADING)
README.md lines 341, 354, 364–365, 367, 378, 386, 394, 417–421, 513 reference prompt files that do not exist:
- `CCGM_Prompt_Install.md` → must be `CCGM_Prompt_01-SystemInstall-Auto.md`
- `CCGM_Prompt_ManualInstall.md` → must be `CCGM_Prompt_01-SystemInstall-Manual.md`
- `CCGM_Prompt_Restart.md` → must be `CCGM_Prompt_99-ContextRestore.md`
Also update the "Prompt Files" table row descriptions accordingly (auto = "One-shot automated installation", manual = "Step-by-step manual installation", restore = "Context recovery after /compact or fresh session").

## Finding 2 — Stale v5.x version labels in README (OUTDATED)
- Line 188: comment says "Standard, Prototype, Departments, Cost-Efficiency" → change "Standard" to "Smart Routing".
- Line 265: remove "(NEW v5.10.0)" on Research Task workflow.
- Line 272: remove "Since v5.6.0," — keep only "Quality gates run in PARALLEL (∥ symbol) for faster validation."
- Line 501: "Standardized formats for all 8 agents" → "all 14 agents".
- Lines 500–503: remove "(NEW in v5.7.0)" label from Policy Documents heading.

## Finding 3 — AGENT_MODEL_SELECTION.md cost-table inconsistencies (OUTDATED/MISLEADING)
- Line 384: API Change workflow still shows `@scribe (sonnet): $0.60` → `@scribe (haiku): $0.20  ← v7.0.0: haiku`.
- Line 388: API Change total `~$6.90` → `~$6.50`.
- Monthly Cost Estimates section uses $6.10/feature and $0.70/docs (pre-v7.0.0). Summary table in the same doc says ~$2.60 and ~$0.30 under Smart Routing. Add an explicit label: estimates are Full-Gates upper-bound baseline, and note Smart Routing default figures (~$2.60 feature / ~$0.30 docs).

## Finding 4 — Mode naming inconsistent within README (UNCLEAR)
Workflow Modes table (line 283) correctly says "Smart Routing (default)", but line 188 (diagram comment) and line 498 (MODES.md link description) still say "Standard". Recommended line 498: `**[MODES.md](./docs/orchestrator/MODES.md)** - Smart Routing (default), Full-Gates, Prototype, Departments, Agent Teams, and Cost-Efficiency routing`.

## Finding 5 — "Fable 5 Ready" wording precision (SUGGESTION)
- Line 133: "with cheaper Claude Code subagents" → "with model-tiered Claude Code subagents (haiku for simple ops, sonnet for implementation, opus for architecture) and effort-field budget tuning."
- Line 138: "targeting 30–50% token reduction per standard feature" → "estimated 30–50% token reduction per standard feature vs. the previous always-Full-Gates default (based on per-workflow cost models in docs/AGENT_MODEL_SELECTION.md)."

## Positive
- "Fable 5 Ready" section structure and keyword placement otherwise natural, no stuffing.
- plugin.json description and keywords sensible.
- Install prompts consistently reference 14 agents and v7.0.0.
