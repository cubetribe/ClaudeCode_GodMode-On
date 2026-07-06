# v8.0.1 — Version Unification · Validation Report

**Date:** 2026-06-30 · **Type:** PATCH (docs/version consistency) · **Status:** Working-tree complete, NOT committed/pushed.

## What this release does
Completes the v8.0.1 version bump that user commit `ee790b9` started. `ee790b9` bumped the core surfaces (`VERSION`, `plugin.json`, `CLAUDE.md`, template, `README`, `QUICK_START`) and added the activation-flow docs + the `[8.0.1]` CHANGELOG entry, but left the **install-prompt headers/banners and one doc** at `8.0.0` (and a stale `v6.4.0` footer). This pass finishes them.

## Method
Adversarial multi-agent classification of **~42 files / 197 version references** (9 parallel classifiers → per-group verifiers → completeness critic, 19 agents). Policy: change **only current-state declarations** of the live system version → `8.0.1`; **preserve all historical references** (CHANGELOG, `// vX.Y.Z:` feature comments, ADR/authored-at stamps, `archive/`, narrative mentions of what v8.0.0 shipped).

## Edits applied (working tree, uncommitted) — 7 files, +12/−11
| File | Change |
|------|--------|
| `CCGM_Prompt_01-SystemInstall-Auto.md` | header + welcome banner + success banner + report version field → 8.0.1 |
| `CCGM_Prompt_01-SystemInstall-Manual.md` | header + `## Version` footer → 8.0.1 |
| `CCGM_Prompt_02-ProjectActivation.md` | header → 8.0.1 |
| `CCGM_Prompt_98-Maintenance.md` | header → 8.0.1 |
| `CCGM_Prompt_99-ContextRestore.md` | header → 8.0.1; footer `v6.4.0` → 8.0.1 |
| `docs/AGENT_MODEL_SELECTION.md` | intro line "CC_GodMode v8.0.0 uses…" → 8.0.1 (borderline current-state; flagged) |
| `CHANGELOG.md` | augmented existing `[8.0.1]` "Changed" with the consistency sweep |

## Deliberately NOT changed (historical — verified)
- `README.md:24/120`, `docs/STORY.md:11` — narrative about what v8.0.0 achieved.
- `docs/AGENT_MODEL_SELECTION.md:18/717` — `(v8.0.0)` section headers (feature-introduction annotations).
- `docs/orchestrator/MODES.md:9` — "v8.0.0 note:" annotation.
- All `scripts/*.js` headers + `// vX.Y.Z:` comments; `archive/`; `docs/templates/REPORT_TEMPLATES.md` v7.0.0 authored-at stamp; `agents/github-manager.md` `v2.1.0` examples.
- `CCGM_Prompt_99-ContextRestore.md:234` "Working on v6.4.0" — illustrative example (candidate to genericize to `vX.X.X`; left per conservative policy).

## Quality gates
- `test-phase2-integration.js`: **7/7 (100%)** + 3/3 backwards-compat. ✓
- `sync-version.js --check`: all synchronized. ✓ (Note: tool only covers 8 files — see follow-up.)
- No remaining current-state `> **Version:** 8.0.0` headers. ✓

## Open items (require user decision — outward-facing / git)
1. **Branch divergence:** local `main` is **1 ahead** (`ee790b9` + these uncommitted edits) / **2 behind** origin (Dependabot js-yaml 4.2→5.1, PR #26). Must integrate origin before push.
2. **Commit + push + tag `v8.0.1` + GitHub release** — needs explicit permission (rule 9).
3. **GitHub "About" description** still says "v7.1 … Optimized for Claude Fable 5" — authorized to update.
4. **Local `~/.claude` install** at 8.0.0 (content matches repo) — bump/re-sync to 8.0.1.

## Follow-up recommendation
`scripts/sync-version.js` gave a false "all synchronized" while 6 files were stale: it only checks 8 files and has a dormant hardcoded `"The Fail-Safe Release"` string. Broaden `FILES_TO_SYNC` (prompts, README, plugin) and fix the codename string in a later patch.
