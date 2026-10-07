---
agent: builder-4 (manifests-prompts)
date: 2026-10-07
sprint: 05
plan: v8.7.0
status: DONE
---
# Builder-4 report — manifests + prompts

## Files-Changed
- `.claude-plugin/plugin.json` — description rewritten (GodMode Core for Claude Code, Opus 5.5 `opus`, 14 agents = 7+1+6); keywords: `claude-opus-4-8` -> `claude-opus-5-5`, + `godmode-core`; added `displayName: "GodMode Core for Claude Code"` (validator-recognized; a bogus key yields "Unknown field" warning, displayName does not); `agents`/`skills` paths fixed (see below). name/version/license/repository untouched.
- `package.json` — description only.
- `CC-GodMode-Prompts/QUICK_START.md` — `/model opus`, ultracode = session-only switch (effort unchanged, needs dynamic workflows in /config), optional `/effort xhigh`, optional `best` = Fable 5.1 (~2.5x).
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` — orchestrator model line.
- `CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md`, `CCGM_Prompt_99-ContextRestore.md` — "NEVER implement / ALWAYS delegate" restatements aligned to new Core Rule 2 (99's Rule numbering untouched; the "Rule 1/2/5/6" references remain).
- `scripts/analyze-prompt.js` — NO change: it contains no model names/IDs/prices (the only grep hits are the variable `bestType`; the "3 hits" were false positives). `node -c` OK.

## Pre-existing validator errors (fixed, in scope)
Before: 42 errors — all 14 `agents` entries and 14 `skills` entries lacked the `./` prefix, and `skills` entries pointed at `SKILL.md` files instead of directories. Fix: `./agents/<n>.md`, `./skills/<n>` (mechanical). Only hooks are consumed by repo scripts (test-hooks-contract) so no script impact. NOTE for orchestrator: this changes how the plugin manifest resolves components; verify via a real plugin install if desired. The `mcpServers.playwright.optional` key and hooks raised NO validator complaint.

## Validator outputs (Claude Code 2.1.286)
- `plugin validate .` -> "Validation passed with warnings" (1 warning: root CLAUDE.md is not loaded as plugin context — informational, pre-existing, not fixable in scope).
- `plugin validate . --strict` -> "Validation failed (--strict treats warnings as errors)" solely due to that CLAUDE.md warning; zero manifest errors/warnings.

## Checks
- JSON valid (plugin.json, package.json); `sync-version.js --check` green (14 touchpoints, 8.6.0); `test-hooks-contract.js` green; `node -c scripts/analyze-prompt.js` OK.
