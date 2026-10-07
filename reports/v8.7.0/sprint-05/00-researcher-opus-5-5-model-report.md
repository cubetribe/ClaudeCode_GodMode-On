---
agent: researcher
date: 2026-10-05
sources:
  - https://platform.claude.com/docs/en/models/overview
  - https://platform.claude.com/docs/en/about-claude/pricing
  - https://platform.claude.com/docs/en/about-claude/model-deprecations
  - https://code.claude.com/docs/en/model-config
  - https://platform.claude.com/docs/en/build-with-claude/effort
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5-5
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
  - https://platform.claude.com/docs/en/models/opus-5-5/whats-new-opus-5-5
  - https://www.anthropic.com/claude-opus-5-5
  - https://www.anthropic.com/claude-sonnet-5-5
---

# Opus 5.5 / Claude 5.5 family research (as of 2026-10-05)

STATUS: DONE (official sources only; gaps marked UNVERIFIED)

## 1. Models: IDs, specs, pricing, lifecycle
Source: models overview, pricing, deprecations (URLs above).

| | Fable 5.1 | Opus 5.5 | Sonnet 5.5 | Haiku 4.5 |
|---|---|---|---|---|
| API ID | claude-fable-5-1 | claude-opus-5-5 | claude-sonnet-5-5 | claude-haiku-4-5-20251001 (alias claude-haiku-4-5) |
| In/Out per MTok | $10 / $50 | $4 / $20 | $2 / $10 | $1 / $5 |
| Cache write 5m / 1h | $12.50 / $20 | $5 / $8 | $2.50 / $4 | $1.25 / $2 |
| Cache read | $0.25 (0.025x) | $0.20 (0.05x) | $0.20 (0.1x) | $0.10 (0.1x) |
| Batch in/out | $5 / $25 | $2 / $10 | $1 / $5 | $0.50 / $2.50 |
| Context / max out | 1M / 128K | 1M / 128K | 1M / 128K | 200K / 64K |
| Thinking | adaptive, always on | adaptive, always on | adaptive | extended |
| API default effort | high | medium | high | n/a |
| Retirement (not sooner than) | 2027-09-01 | 2027-09-22 | 2027-09-28 | 2026-10-15 |

- Long-context: no surcharge; 1M window at standard price on 4.6+ models (pricing page). 1M is default/max on 5.x models.
- Opus 5.5 fast mode (research preview, API only): $8 / $40.
- Tokenizer on 4.7+ yields ~30% more tokens for same text (pricing page).
- Release dates: Opus 5.5 = 2026-09-22 (anthropic.com/claude-opus-5-5, system card dated Sep 22, 2026). Sonnet 5.5 = 2026-09-28 (system card date; anthropic.com/claude-sonnet-5-5). Fable 5.1 release date: UNVERIFIED (only retirement floor 2027-09-01 seen). Haiku 4.5 release: UNVERIFIED on a fetched page (ID date 20251001). Opus 5.5 announcement said "Haiku 5.5 in coming weeks" (search snippet) — a Haiku 5.5 may appear; not in lineup per docs today.
- Opus 5.5 announcement claims: "performs at the level of Fable 5.1 on most work", 40% cheaper than Opus 5 to run, 20% lower per-token price than Opus 5, >30% faster output (search snippet of anthropic.com/claude-opus-5-5).

### Lifecycle of old models (deprecations page)
- Opus 4.8 (claude-opus-4-8): LEGACY (listed under "Legacy models (still available)" in overview), status Active, retirement not sooner than 2027-05-28; price $5/$25.
- Sonnet 4.6: LEGACY, Active, not sooner than 2027-02-17; $3/$15.
- Fable 5: LEGACY, Active, not sooner than 2027-06-09; $10/$50 (cache read $1).
- Also legacy: Opus 5 ($5/$25), Sonnet 5 ($2/$10), Opus 4.7/4.6/4.5.
- Not deprecated by Anthropic's definition; "Legacy" = no updates. Sonnet 4.5 IS deprecated (retires 2026-11-30, replacement claude-sonnet-5-5). Haiku 4.5 is Active but floor retirement is 2026-10-15 (10 days away); no deprecation notice seen yet -> watch.

## 2. Claude Code aliases (code.claude.com/docs/en/model-config)
Anthropic API: `opus` -> Opus 5.5; `sonnet` -> Sonnet 5.5; `fable` -> Fable 5.1 (Fable 5 in "Claude apps gateway"); `best` -> Fable 5.1 where available, else Opus 5.5; `opusplan` -> Opus 5.5 in plan mode, Sonnet 5.5 for execution. `haiku` -> listed as "Haiku 3.5" in the fetched table (all providers). That is a retired model per the deprecations page, so this looks like a stale/inconsistent docs row: UNVERIFIED; recommend pinning `claude-haiku-4-5-20251001` explicitly. Bedrock/Vertex: opus 5.5, sonnet 4.5; Foundry: opus 4.6, sonnet 4.5 (older pins). Also `opus[1m]`, `sonnet[1m]`, `opusplan[1m]`, `default`. Env: ANTHROPIC_DEFAULT_OPUS_MODEL etc. to pin.
=> The package's "opus -> claude-opus-4-8, sonnet -> claude-sonnet-4-6" mapping is outdated on the Anthropic API.

## 3. Prompting / agentic guidance
Sources: prompting-claude-opus-5-5, prompting-claude-opus-5, effort page.
- Effort levels: low, medium, high, xhigh, max (all five on Opus 5.5). Claude Code adds `ultracode` (not a true effort level; orchestrates dynamic workflows) per model-config page. Claude Code default effort for Opus 5.5/Sonnet 5.5 = medium; Fable 5.1 = high.
- Opus 5.5 guidance: start at `medium`; at medium it matches/exceeds Opus 5 at high on coding; reserve xhigh/max for measured gains; thinks MORE per turn than Opus 5 at the same level (esp. xhigh/max); set max_tokens up to 128K for agentic coding; to reduce thinking, lower effort rather than prompting. Effort doc: `low` is "such as subagents"; `xhigh` for long-running (>30 min) agentic tasks. `max` "prone to overthinking" (Claude Code doc).
- Thinking cannot be disabled on Opus 5.5 (400 error); forced tool_choice any/tool unsupported (400). Manual budget_tokens rejected.
- LESS SCAFFOLDING (Opus 5 page, which 5.5 says remains the baseline): "Claude Opus 5 verifies its own work without being told to... If your prompt contains explicit verification instructions ('include a final verification step', 'use a subagent to verify'), remove them... The same applies to legacy harness scaffolding that adds separate verification steps." Also: avoid "double-check your answer"-style instructions. Opus 5 "performs best when given the complete task specification up front and left to run."
- Subagents: Opus 5 "delegates to subagents more readily"; guidance is to cap it: "Delegate to a subagent only for large tasks that are genuinely independent and parallelizable... do not use subagents to verify or double-check your own work... keep spawn counts low." Deterministic caps: env CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH, CLAUDE_CODE_MAX_CONCURRENT_SUBAGENTS, SDK max_budget_usd (Claude Code >= 2.1.217). With a custom system prompt, Claude Code does not add its delegation instruction; add your own.
- Scope control: Opus 5 can expand task scope; use explicit scope sentence for narrow tasks. Reviews: "only report high severity / be conservative" is followed literally; ask for everything, filter later.
- Over-prompting: general guide says give the reason behind rules ("NEVER use ellipses" -> explain why) and "tell Claude what to do instead of what not to do"; Claude is "smart enough to generalize from the explanation." Opus 5.5 page: "responsive to instructions that name specific kinds of early stop"; remove "think carefully" lines in chat prompts (replies start sooner, no quality loss). No explicit CRITICAL/MUST-caps ban text found in the fetched pages (the 4.x-era "dial back emphatic language" note was not seen) -> UNVERIFIED for 5.5 specifically; consistent direction is reasons over shouting.
- Opus 5.5 specifics: progress text between tool calls arrives as thinking blocks (needs thinking.display "updates"); unattended loops: text-only end_turn may be a report not completion -> keep checklist/todo, and docs offer an "unattended" system-prompt paragraph; time budgets (`elapsed 340s / 1200s`) speed up multi-agent teams (helpful for orchestrators); multi-app: tell it to explore broadly before acting; changing top-level effort mid-session invalidates prompt cache (per-message effort beta preserves it); keep tools/system prompt append-only (thinking-block binding).
- Implication for an orchestrator CLAUDE.md: shorter, reason-giving rules; drop mandatory verification-agent steps (matches repo Core Rule 5 direction); add explicit subagent-delegation criteria and caps; set effort per role (low for simple subagents) instead of prose.

## 4. Positioning and Claude Code defaults
- Models overview: "start with Claude Opus 5.5 for most workloads"; Opus 5.5 = "long-running agentic coding and knowledge work"; Fable 5.1 for demanding reasoning/long-horizon agentic work "or when your evals on Opus 5.5 at higher effort still fall short."
- Claude Code default (model-config): Opus 5.5 for Pro, Max, Team, Enterprise, Anthropic API, AWS platform, Bedrock, Google Cloud; Microsoft Foundry: Sonnet 4.5.

## 5. Price ratio Fable 5.1 vs Opus 5.5
- Input 10/4 = 2.5x; output 50/20 = 2.5x; cache write 12.50/5 = 2.5x (5m), 20/8 = 2.5x (1h); cache read 0.25/0.20 = 1.25x (Fable reads far cheaper relative to base); batch 2.5x.
- So the old "~2x" rule (Fable 5 $10/$50 vs Opus 4.8 $5/$25) is now ~2.5x on list price. Real cost gap also depends on tokens used (Opus 5.5 "tends to finish with fewer tokens"; Fable 5.1 default effort high vs Opus medium) and cache-hit share (high cache reuse narrows the input gap). Token-efficiency ratio: UNVERIFIED (no official number).
- Opus 5.5 vs Opus 4.8: $4/$20 vs $5/$25 = 20% cheaper (but ~30% tokenizer inflation applies to both as both are 4.7+).

## Gaps / UNVERIFIED
Fable 5.1 and Haiku 4.5 release dates; haiku alias target (docs say Haiku 3.5, likely stale); explicit CRITICAL/MUST language guidance for the 5.x family.
