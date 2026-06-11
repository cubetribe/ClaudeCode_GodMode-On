---
name: cost-efficiency
description: "Smart Routing — the DEFAULT CC_GodMode routing policy. Risk-based, minimal-agent paths that preserve required safety gates for the changed scope."
---

# Smart Routing (Default Routing Policy)

**This is the default routing mode for CC_GodMode v7.0.0+.** The Orchestrator applies Smart Routing automatically unless the task carries high-risk signals that require Full-Gates (see `skills/workflows/`).

Smart Routing changes routing behavior. It does not silently weaken
security, contract, or release gates.

## Core Principle

Spend strong reasoning only where it changes the outcome.

Everything else should be:

- batched
- bounded
- summarized
- delegated only when it saves more context than it costs
- validated against the changed scope instead of the whole repository

## Architecture Gate (Split)

For **small/medium tasks** (no new modules, no breaking changes, no cross-domain design):
- Orchestrator writes a 3–5 bullet **inline architecture brief** directly into `reports/vX.X.X/01-architect-report.md`.
- No @architect subagent invocation needed.

For **high-risk tasks** (new modules, breaking changes, cross-domain design, uncertain scope):
- Invoke @architect (Opus) via Task tool as normal.
- Full-Gates path applies.

## Default Routing

| Work type | Smart Routing route |
| --- | --- |
| Docs-only | @scribe only; no @builder unless files need structural edits |
| Simple bug | @builder -> targeted @validator; @tester only for user-facing behavior |
| Unknown facts | @researcher with strict source/time budget |
| Small/medium feature | inline arch brief + @builder + scoped @validator ∥ @tester |
| Architecture risk | @architect, but with a narrow decision brief |
| API or schema risk | @api-guardian remains mandatory |
| UI behavior | @tester only on affected flows and viewports |
| Release or PR | @github-manager only after @scribe produces final notes |

## Escalate to Full-Gates When

Any of these risk signals force the Full-Gates path (`skills/workflows/`):

- API/schema/type paths touched (`src/api/`, `backend/routes/`, `shared/types/`, `*.d.ts`, `openapi.yaml`)
- Security surfaces (`.github/workflows/`, auth code, secrets handling)
- Release artifacts (`VERSION`, `CHANGELOG.md`)
- User-facing UI changes
- New modules or cross-domain designs
- Breaking changes

## Research Budget

When @researcher is needed:

- define the exact question first
- prefer official and primary sources
- cap source collection to the smallest useful set
- return only facts, source links, and routing implications
- do not perform broad background research unless the user asks

## Agent Budget

- Avoid Agent Teams unless the user explicitly accepts the cost.
- Avoid Departments Mode unless ownership is genuinely unclear.
- Keep active subagents to the smallest useful set.
- Reuse existing reports and state only after checking they are current.
- Ask agents for concise structured reports, not full transcripts.

## Model Budget

Use existing agent model assignments as the baseline:

- @researcher and @github-manager are already low-cost lanes.
- @architect should be reserved for decisions with long-lived impact.
- @builder, @validator, @tester stay on balanced models because
  bad implementation or weak validation often costs more than the saved tokens.
- @scribe is on haiku (v7.0.0+) — templated doc work is sufficient.

`effort` frontmatter fields (Claude Code ≥2.1.152) provide additional budget tuning per agent without model changes.

If the user asks for an explicit model downgrade beyond defaults, state the risk and get
approval before changing agent definitions or runtime config.

## Validation Budget

Run checks that match the changed scope:

- changed Markdown or prompts: syntax, link/path sanity, manifest references
- changed scripts: `node --check` or `bash -n`, plus targeted smoke
- changed hooks: event payload assumptions and a dry-run where possible
- changed API/contracts: @api-guardian plus consumer checks
- changed UI: affected flows only unless release risk is high
