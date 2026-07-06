---
name: cost-efficiency
description: "Smart Routing — the DEFAULT CC_GodMode routing policy. Risk-based, minimal-agent paths that preserve required safety gates for the changed scope."
---

# Smart Routing (Default Routing Policy)

**This is the default routing mode.** The Orchestrator applies Smart Routing automatically unless the task carries high-risk signals that require Full-Gates (see `skills/workflows/`).

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
- The brief's 3–5 bullets MUST cover all five **required fields** (see below). A brief
  missing any field is invalid — invoke @architect instead of proceeding on an
  underspecified design.

For **high-risk tasks** (new modules, breaking changes, cross-domain design, uncertain scope):
- Invoke @architect (Opus) via Task tool as normal.
- Full-Gates path applies.

### Inline Architecture Brief — Required Fields

The brief stays 3–5 bullets (cost-efficiency spirit unchanged) — these are the fields
those bullets must cover, not additional sections:

1. **Decision** — the design/approach actually taken.
2. **Rejected alternative** — at least one alternative considered and why it lost.
3. **Constraints** — what binds the implementation (technical, contractual, scope).
4. **Out-of-scope** — explicitly what this brief does NOT cover.
5. **Affected contracts/APIs** — named, or "none".

Missing any of the five ⇒ the brief is invalid; escalate to @architect rather than
handing @builder an underspecified design. See `docs/templates/REPORT_TEMPLATES.md`
for the exact inline-brief report variant (frontmatter, field labels).

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

## Routing Log (Mandatory)

Every Smart Routing decision and every agent skip is logged **before dispatch** — no
exceptions. See `docs/templates/SPRINT_TEMPLATE.md` § Routing Log for the exact format
string and example — that section is the single canonical definition; this skill does
not duplicate it.

Planned work logs this in the sprint file's `## Routing Log` section; implicit
`sprint-00` work logs the same line in the report header instead.

**Why this exists:** a misrouted task bypasses every downstream gate invisibly —
Smart Routing's whole value is skipping agents when the risk profile allows it, but
an unlogged skip means nobody can tell, after the fact, whether that call was
justified or a silent gap. The log turns each minimal-path decision into a
post-hoc auditable, re-examinable record instead of an invisible judgment call.
A gate-skip without a matching log line is a contract violation — reviewers
(@validator, the Orchestrator on re-check) return `BLOCKED (quality)`.

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
- @scribe is on haiku — templated doc work is sufficient.

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

## Precedence vs. Parallel-First

Smart Routing decides **which agents** run (smallest useful set). CLAUDE.md's parallel-first
doctrine decides **how independent units are scheduled** (fan-out with disjoint write scopes).
They compose: pick the minimal set first, then parallelize only genuinely independent units.
Smart Routing never skips required gates, and parallel fan-out never overrides ownership rules.
