---
agent: builder-4 (scripts-docs)
version: v8.7.0-dev
date: 2026-07-13
status: DONE
task: License hardening — copyright headers on scripts/templates, CLAUDE.md/template
  license footer + version-drift fix, installer LICENSE/NOTICE copy step, MIT-decoy
  defusal in schema/spec docs
---

# Builder Report — @builder-4 (scripts-docs) — Sprint 01 License Hardening

## Preflight

- `git status`/`git diff` on the assigned write-scope paths (`scripts/*`, `templates/*`,
  `CLAUDE.md`, `docs/STORY.md`, `docs/ARCHITECTURE.md`, `docs/orchestrator/AGENTS.md`,
  `docs/INSTALLATION.md`, `config/domain-config.schema.json`,
  `docs/policies/DOMAIN_PACK_SPEC.md`) was clean before any edit — no foreign
  uncommitted changes, no conflict.
- Read `scripts/sync-version.js` first, as instructed, to understand the touchpoint
  manifest mechanism before editing `CLAUDE.md` / `templates/CLAUDE-ORCHESTRATOR.md`.
  The manifest only tracks version-number strings (two regex patterns per file), not
  footer text, so the license footer could be added independently to both files by
  hand without breaking `--sync`/`--check`.

## Files Modified

### Script headers (canonical JS header inserted after shebang)
- `scripts/check-api-impact.js`
- `scripts/parallel-quality-gates.js`
- `scripts/mcp-health-check.js`
- `scripts/sync-version.js`
- `scripts/escalation-handler.js`
- `scripts/validate-agent-output.js`
- `scripts/domain-pack-loader.js`
- `scripts/pre-push-check.js`
- `scripts/analyze-prompt.js`
- `scripts/release-check.js`
- `scripts/test-phase2-integration.js`
- `scripts/test-hooks-contract.js`
- `templates/check-api-impact.js.template`

All 13 above previously had no `Copyright` line. Inserted, immediately after the
shebang line:
```js
/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */
```
The pre-existing doc-comment block for each file was kept unchanged directly below.

### Script headers — year-only fix (pre-existing header preserved otherwise)
- `scripts/check-update.js`
- `scripts/session-start.js`
- `scripts/version-bump.js`
- `scripts/auto-update.js` (two occurrences: header comment + a runtime console
  string at line ~875 that prints the same copyright line — both updated for
  consistency)
- `scripts/workflow-state.js`

`Copyright (c) 2025 Dennis Westermann` → `Copyright (c) 2025-2026 Dennis Westermann`.
No other content in these 5 files was touched.

### sh/ps1 header variant (after shebang / after param block)
- `scripts/apply-global-claude-setup.sh` — header inserted after the shebang, before
  the existing description comment block.
- `scripts/apply-global-claude-setup.ps1` — header inserted after the closing `)` of
  the `param(...)` block (PowerShell comment-based help lives inside `<# ... #>`
  above `param`, so the license comment sits after param, before `Set-StrictMode`, to
  avoid interfering with `Get-Help`).
- `scripts/install-mcps.sh` — header inserted after the shebang, before the existing
  description comment block.

### Installer LICENSE/NOTICE copy step
Both installers now copy `LICENSE` → `~/.claude/LICENSE-CC_GodMode.txt` and `NOTICE` →
`~/.claude/NOTICE-CC_GodMode.txt`, mirroring the existing copy pattern (backup-then-copy
for existing destination files) and adding the same coverage to `--check`/`-Check` mode:
- `scripts/apply-global-claude-setup.sh`: new `SRC_LICENSE`/`SRC_NOTICE`/`DST_LICENSE`/
  `DST_NOTICE` vars; new "License:" install step after the Templates step; new
  `--check` assertions for both destination files.
- `scripts/apply-global-claude-setup.ps1`: new `$srcLicense`/`$srcNotice`/`$dstLicense`/
  `$dstNotice` vars; new "License:" install step after the Templates step; new `-Check`
  assertions (`Test-Item`) for both destination files.
- Both copy steps are guarded by an existence check on the source file (`[[ -f ... ]]` /
  `Test-Path`), so they degrade gracefully — no runtime failure if `LICENSE`/`NOTICE`
  are not yet present (e.g. if run before @builder-1's part of this sprint lands).

### CLAUDE.md
Appended the canonical Markdown footer at the very end, after
`**Current Version:** v8.6.0` (unchanged), separated by a `---` rule.

### templates/CLAUDE-ORCHESTRATOR.md
- Fixed the known version drift: `**Current Version:** v8.5.0` → `v8.6.0` (this line is
  NOT covered by the `sync-version.js` manifest for the template file — the manifest
  only checks the `# CC_GodMode v...` heading and the trailing `**CC_GodMode
  vX.Y.Z**` line for this file, both of which were already correct at 8.6.0).
- Appended the same canonical license footer after the pre-existing
  `---\n\n**CC_GodMode v8.6.0**` trailer.
- `node scripts/sync-version.js --check` passes (exit 0, all 12 touchpoints consistent
  — see Quality Gates below).

### docs/STORY.md, docs/ARCHITECTURE.md, docs/orchestrator/AGENTS.md, docs/INSTALLATION.md
Appended the canonical Markdown footer at the end of each file (after the existing
final content, separated by a `---` rule), verbatim from the sprint's canonical text.

### config/domain-config.schema.json
Verified first that the `license` property (lines 30-34) is a free-form
`"type": "string"` with an `examples` array — NOT an `enum`/`const` — so changing the
example values cannot break schema validation of real domain-config.json files.
- Line ~33: `"examples": ["MIT", "Apache-2.0", "proprietary"]` →
  `["proprietary", "Apache-2.0", "proprietary"]` (MIT entry replaced per instruction;
  note this produces a duplicate "proprietary" value in the array — harmless for
  JSON Schema `examples`, called out here for @validator visibility).
- Line ~230 (top-level `examples` block sample domain-config): `"license": "MIT"` →
  `"license": "proprietary"`.
- Confirmed valid JSON after edit (`node -e "JSON.parse(...)"` succeeded).

### docs/policies/DOMAIN_PACK_SPEC.md
Line ~88, inside the `domain-config.json` example code fence: `"license": "MIT"` →
`"license": "proprietary"`. This is a documentation code-snippet, not machine-validated
config, so no schema risk.

## Files NOT Touched (scope boundary finding)

- `src/api/hook-test.ts` — named in the sprint's prose Scope section as needing the JS/TS
  header, but it is **not** listed in my write-scope table row (`scripts/*, templates/*,
  CLAUDE.md, docs/STORY.md, docs/ARCHITECTURE.md, docs/orchestrator/AGENTS.md,
  docs/INSTALLATION.md, config/domain-config.schema.json,
  docs/policies/DOMAIN_PACK_SPEC.md`). Per the dispatch instruction's explicit rule
  ("wenn nicht in deiner Tabellenzeile, NICHT anfassen"), I left it untouched. It
  currently starts with a doc-comment block (`/** CC_GodMode - Hook Validation Test
  File ... */`) but has no `Copyright` line — flagging for the orchestrator/another
  builder to cover, since it falls in nobody's table row as written.

## Quality Gates

- [x] `bash -n scripts/apply-global-claude-setup.sh` — OK
- [x] `bash -n scripts/install-mcps.sh` — OK
- [x] `node --check` on all touched `.js` files (17 scripts + verified via temp-copy for
      the `.template` file, since `node --check` requires a `.js` extension) — all OK
- [x] `node scripts/release-check.js` — exit 0, "Release invariant holds."
      (VERSION=8.6.0, top CHANGELOG=8.6.0, latest tag=v8.6.0 — untouched by this
      sprint, confirming the VERSION/CHANGELOG/ROADMAP-tabu was respected)
- [x] `node scripts/sync-version.js --check` — exit 0, "All 12 touchpoints consistent
      with VERSION=8.6.0" (includes CLAUDE.md and templates/CLAUDE-ORCHESTRATOR.md)
- [x] `node -e "JSON.parse(...)"` on `config/domain-config.schema.json` — valid JSON
- [ ] PowerShell parse of `apply-global-claude-setup.ps1` — **not run**: no `pwsh`
      binary available in this environment (`which pwsh` → not found). The edits are a
      minimal insertion of two `#`-comment lines plus a mirrored 4-variable /
      copy-step / check-step block, following the exact structural pattern of the
      existing `.sh` twin (verified via `bash -n`), so risk is low, but this specific
      gate could not be executed locally — flagging for @validator/@tester to run on a
      Windows/pwsh-capable host if available.
- [x] `git status` on write-scope paths before AND after — only the expected files
      changed; `VERSION`, `CHANGELOG.md`, `ROADMAP.md`, `plans/**`, `README.md`
      untouched.

## Ready for @validator

- [x] All in-scope changes complete (20 scripts + 1 template + CLAUDE.md + template +
      4 docs + schema + spec doc = 27 files modified)
- [x] JS syntax valid on all touched scripts/template
- [x] JSON valid on schema file
- [x] `sync-version.js --check` and `release-check.js` both exit 0
- [ ] PowerShell installer syntax not locally verifiable (no pwsh) — needs a Windows
      check
- [ ] `src/api/hook-test.ts` header — out of my scope, unassigned in the table, needs
      routing
