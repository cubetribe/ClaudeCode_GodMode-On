---
sprint: 01
slug: license-hardening
plan: plans/v8.7.0/PLAN.md
status: done
execution: parallel
owner: orchestrator
---

# Sprint 01 — License Hardening

## Goal

Every scrapeable artifact in the repo carries a machine-readable and human-readable
proprietary-license declaration that survives re-hosting, and the LICENSE text itself
closes its three gaps (optional attribution, missing re-hosting/scraping prohibition,
fork contradiction). After this sprint, any aggregator that labels the work "MIT" or
"open-source" is provably mislabeling despite explicit in-file notices.

## Scope

- Replace LICENSE with v2 (canonical text below).
- Add NOTICE file (canonical text below).
- README: license badge in the top badge row + "Not open source" one-liner under the
  title + refreshed License section (year 2025–2026, attribution required, NOTICE link).
- Add `license` field to all 14 `skills/*/SKILL.md` frontmatters + Markdown footer.
- Add Markdown footer to all 15 `agents/*.md`, all 6 `CC-GodMode-Prompts/*.md`
  (normalize the existing block in `CCGM_Prompt_01-SystemInstall-Auto.md`), `CLAUDE.md`,
  `templates/CLAUDE-ORCHESTRATOR.md` (kept in sync with CLAUDE.md; fix the v8.5.0
  footer drift), and the four most exposed docs (`docs/STORY.md`, `docs/ARCHITECTURE.md`,
  `docs/orchestrator/AGENTS.md`, `docs/INSTALLATION.md`).
- Copyright header in the 14 unheadered scripts + `templates/check-api-impact.js.template`
  + `src/api/hook-test.ts`.
- package.json: `"license": "SEE LICENSE IN LICENSE"`, `author`, `repository`, `homepage`.
- .claude-plugin/plugin.json: `"license": "LicenseRef-CC-GodMode-Proprietary"`.
- Defuse MIT decoys: example `"license": "MIT"` values → `"proprietary"` in
  `config/domain-config.schema.json` and `docs/policies/DOMAIN_PACK_SPEC.md`.
- CONTRIBUTING.md: add "Contributor License" section (canonical text below).
- Both installers additionally copy LICENSE + NOTICE to
  `~/.claude/LICENSE-CC_GodMode.txt` / `~/.claude/NOTICE-CC_GodMode.txt`.

## Non-Goals

- No takedowns/DMCA/outreach to platforms (maintainer's separate track, "Plan B").
- No GitHub topic changes, no repo-visibility change.
- No VERSION/CHANGELOG/ROADMAP writes (CHANGELOG `[Unreleased]` only via @scribe at
  integration; VERSION only in sprint 02 via tooling).
- No license switch to PolyForm/CC/BUSL (decided in PLAN.md).
- No behavioral changes to any script — header comments only.

## Files / Write Scope (ownership)

| Path / Glob | Writer | Notes |
|---|---|---|
| `LICENSE`, `NOTICE`, `README.md`, `CONTRIBUTING.md`, `package.json`, `.claude-plugin/plugin.json` | @builder-1 (legal-core) | README is a hot file — single writer |
| `skills/*/SKILL.md` (14 files) | @builder-2 (skills) | preserve existing frontmatter fields |
| `agents/*.md` (15 files), `CC-GodMode-Prompts/*.md` (6 files) | @builder-3 (agents-prompts) | |
| `scripts/*` (headers only + installer copy step), `templates/*`, `CLAUDE.md`, `src/api/hook-test.ts` (header only), `docs/STORY.md`, `docs/ARCHITECTURE.md`, `docs/orchestrator/AGENTS.md`, `docs/INSTALLATION.md`, `config/domain-config.schema.json`, `docs/policies/DOMAIN_PACK_SPEC.md` | @builder-4 (scripts-docs) | CLAUDE.md + template must stay in sync (`scripts/sync-version.js`); hook-test.ts added to table in r2 (was in scope text but missing from table — orchestrator planning gap) |
| `CHANGELOG.md` `[Unreleased]` | @scribe only | at integration, serialized |
| `reports/v8.7.0/sprint-01/*` | each agent (own report) | canonical numbering |

## Canonical Legal Texts (binding — agents copy verbatim, never paraphrase)

### LICENSE v2 (full replacement)

```
CC_GodMode - Proprietary License

Copyright (c) 2025-2026 Dennis Westermann
www.dennis-westermann.de

All rights reserved.

This software and its accompanying content - including all prompts, skills,
agent definitions, documentation, templates, and configuration (together,
the "Work") - are NOT open source.

================================================================================
TERMS OF USE
================================================================================

1. PRIVATE, NON-COMMERCIAL USE
   The Work may be used for private, non-commercial purposes free of charge.
   Private use includes personal projects, learning, and individual
   development.

2. COMMERCIAL USE
   Any commercial use of the Work is prohibited without prior written
   permission from the copyright holder.

   Commercial use includes, but is not limited to:
   - Use in products or services offered for sale
   - Use in a commercial business environment
   - Use to generate revenue directly or indirectly
   - Redistribution as part of a commercial product or platform

   For commercial licensing inquiries, please contact:
   Dennis Westermann - www.dennis-westermann.de

3. COLLABORATION ON GITHUB (EXPRESSLY PERMITTED)
   Viewing this repository on GitHub, forking it on GitHub, and submitting
   contributions (pull requests) to the official repository at
   https://github.com/cubetribe/ClaudeCode_GodMode-On are expressly
   permitted and welcome. Forks on GitHub must retain this LICENSE and the
   NOTICE file unchanged.

4. REDISTRIBUTION AND RE-HOSTING (PROHIBITED)
   Except as permitted in Section 3, redistribution of the Work, in whole
   or in part, is prohibited without explicit written permission from the
   copyright holder. This prohibition expressly includes:
   - Copying, mirroring, re-hosting, or offering the Work or parts of it
     (such as SKILL.md files, agent definitions, prompts, or documentation)
     for download, installation, or import on any third-party website,
     marketplace, directory, registry, or aggregator platform;
   - Automated scraping, indexing, harvesting, or bulk collection of the
     Work for republication;
   - Converting the Work into other formats for republication;
   - Republishing the Work under any other license. Any license label other
     than this one (for example "MIT") applied to the Work by a third party
     is invalid and unauthorized.

5. MODIFICATIONS
   You may modify the Work for private, non-commercial use. Modified
   versions may not be redistributed outside GitHub without permission
   (see Section 4).

6. ATTRIBUTION (REQUIRED)
   Every permitted copy or use of the Work outside the official repository
   must preserve the copyright notice above and visibly attribute the Work
   to: Dennis Westermann - https://github.com/cubetribe/ClaudeCode_GodMode-On

7. TERMINATION
   Any violation of these terms automatically terminates all rights granted
   under this license.

8. NO WARRANTY
   THE WORK IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
   IMPLIED. THE COPYRIGHT HOLDER SHALL NOT BE LIABLE FOR ANY DAMAGES ARISING
   FROM THE USE OF THE WORK.

================================================================================

For questions, licensing, or permissions:
Dennis Westermann
www.dennis-westermann.de
```

### NOTICE (new file)

```
NOTICE - CC_GodMode (ClaudeCode_GodMode-On)

Copyright (c) 2025-2026 Dennis Westermann - www.dennis-westermann.de

This project is proprietary. It is NOT open source and is NOT licensed
under MIT, Apache, or any other open-source license.

- Free for private, non-commercial use.
- Forks and pull requests on GitHub are welcome.
- Commercial use requires written permission.
- Re-hosting, mirroring, scraping, or redistribution on third-party
  platforms, marketplaces, or skill directories is PROHIBITED.
- Attribution to "Dennis Westermann -
  github.com/cubetribe/ClaudeCode_GodMode-On" is REQUIRED for every
  permitted copy.

Official source: https://github.com/cubetribe/ClaudeCode_GodMode-On
Full terms: see LICENSE.

If you found this content anywhere other than the official repository or a
GitHub fork of it, it is being redistributed without permission.
```

### SKILL.md frontmatter field (add to every skill, preserve existing fields)

```yaml
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
```

### Markdown footer (skills, agents, prompts, docs, CLAUDE.md, template)

```markdown

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
```

### Script header — JS/TS (first lines after any shebang)

```js
/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */
```

### Script header — sh/ps1 (after shebang / param block)

```
# CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
# Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
```

### CONTRIBUTING.md — new section "Contributor License"

```markdown
## Contributor License

By submitting a pull request or otherwise contributing content to this
repository, you:

1. certify that you authored the contribution yourself or have the right to
   submit it,
2. grant the project owner (Dennis Westermann) a perpetual, worldwide,
   irrevocable, royalty-free right to use, modify, sublicense, and
   distribute your contribution as part of the Work — under the project
   LICENSE and under separate commercial licenses,
3. agree that no compensation is owed for the contribution.

If you cannot agree to these terms, please open an issue instead of a pull
request.
```

### README top one-liner (directly under the title/badges)

```markdown
> **Not open source.** Free for private, non-commercial use. Forks & pull requests on GitHub are welcome — re-hosting on third-party platforms/marketplaces is prohibited and attribution is required. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
```

### README license badge (into the existing top badge row, linked to LICENSE)

```markdown
[![License: Proprietary](https://img.shields.io/badge/License-Proprietary_(non--commercial)-red.svg)](LICENSE)
```

## Risks

- Footer text in SKILL.md/agents enters model context on invocation → kept to one line
  (~40 tokens), purely declarative, no imperative wording that could steer behavior.
- CLAUDE.md/template sync: editing both by hand risks drift → builder-4 reads
  `scripts/sync-version.js` first and uses/reflects its sync mechanism; validator runs
  `--check`.
- YAML frontmatter breakage in 14 skills → value is quoted, no colons unescaped;
  validator parses all frontmatters.
- Schema example change (`MIT` → `proprietary`) could break schema validation if the
  field is an enum → builder-4 verifies it is a free-form example before editing.

## Acceptance Criteria

- [x] LICENSE, NOTICE, CONTRIBUTING section match the canonical texts verbatim.
- [x] All 14 SKILL.md have the `license` frontmatter field AND the footer; YAML parses.
- [x] All 15 agents/*.md and all 6 CC-GodMode-Prompts/*.md end with the footer.
- [x] CLAUDE.md and templates/CLAUDE-ORCHESTRATOR.md both carry the footer and agree on
      the version string (drift fixed); `node scripts/sync-version.js --check` passes.
- [x] package.json has license/author/repository/homepage; plugin.json license is
      `LicenseRef-CC-GodMode-Proprietary`; both files are valid JSON.
- [x] No `"license": "MIT"` example strings remain outside `package-lock.json`.
- [x] All 19 scripts + template + src/api/hook-test.ts carry the header; every script
      still runs (`node scripts/release-check.js`, `node scripts/sync-version.js --check`
      exit 0; `bash -n` for installers; .ps1: documented structural review — no pwsh on
      host, flagged for release-sprint follow-up).
- [x] Both installers copy LICENSE + NOTICE into `~/.claude/`.
- [x] VERSION, CHANGELOG.md, ROADMAP.md untouched by builders (CHANGELOG `[Unreleased]`
      only via @scribe at integration, as designed).

## Test / Validation Strategy

`node scripts/sync-version.js --check` · `node scripts/release-check.js` ·
`bash -n scripts/apply-global-claude-setup.sh` · JSON parse of package.json/plugin.json ·
YAML frontmatter parse of all 14 skills + 15 agents · grep sweep for residual
`"license": "MIT"` (excluding package-lock.json) · grep sweep that every target file
contains "2025-2026 Dennis Westermann" or the footer line · @docs-dx review of README/
NOTICE/CONTRIBUTING wording.

## Routing Log

- 2026-07-13 | path: smart-routing | signals: README.md (user-facing docs, hot file), LICENSE (release-adjacent legal artifact), CLAUDE.md (orchestrator prompt) | skipped: @architect (no new module/design — inline brief at reports/v8.7.0/sprint-01/01-architect-report.md), @api-guardian (no API/type/contract change; comment-only script edits), @tester (no UI surface to screenshot — repo is CLI/Markdown; playwright MCP unavailable; user-facing docs dimension covered by @docs-dx instead), @security (no auth/secrets/workflow surface touched)
- 2026-07-13 | path: smart-routing (fix loop r2) | signals: @validator BLOCKED (hook-test.ts header orphaned by scope-table gap; 5 legacy script headers lack canonical anti-re-hosting line; .ps1 formally unverified — no pwsh on host), @docs-dx APPROVED with 2 minors (template line-2 "(v8.5)" comment, leftover license line in Auto-Install prompt) | skipped: @docs-dx re-run after r2 (already APPROVED; its 2 minors are objective one-line text fixes, re-verified textually by @validator r2 instead)

## Changelog Note

`### Changed` — License hardening: LICENSE v2 (explicit GitHub-fork permission, mandatory
attribution, explicit re-hosting/scraping prohibition), NOTICE file, license metadata on
every scrapeable surface (SKILL.md frontmatter, agent/prompt/doc footers, script headers,
package.json/plugin.json), MIT example-string defusal, contributor-license clause,
installer now ships LICENSE+NOTICE.

## Version Relevance

minor — new NOTICE artifact + license metadata across all public surfaces; no breaking
change to any workflow or API.

## Preflight (checked at sprint start)

- [x] `git status` clean (only expected untracked: reports/v8.7.0/ research report;
      internal TomeVault consultation file moved OUT of the repo beforehand)
- [x] Plan assumptions valid (research report of same day, all listings live-verified)
- [x] No other in-progress sprint owns overlapping files (no other plan open)

## Result (filled at completion)

Completed 2026-07-13 on branch `feat/v8.7.0-license-hardening` (uncommitted, awaiting
maintainer commit approval). 71 files changed (+408/−45): LICENSE v2 + NOTICE verbatim
from canonical texts; README badge/top-notice/refreshed License section; `license`
frontmatter + footer in all 14 skills; footer in all 15 agents + 6 prompts + CLAUDE.md/
template + 4 docs; canonical header in all 19 scripts + template + src/api/hook-test.ts;
package.json/plugin.json license metadata; MIT decoys defused; Contributor-License
section; installers ship LICENSE+NOTICE to `~/.claude/`.

Deviations: (1) r2 fix loop needed — orchestrator scope-table gap (hook-test.ts),
legacy-header upgrade ambiguity, plus 2 docs-dx minors (template line-2 drift, leftover
license line); all fixed, @validator r2 APPROVED after full regression sweep.
(2) `apply-global-claude-setup.ps1` verified by documented structural review only (no
pwsh on host) — **follow-up for sprint 02 (release):** run PowerShell parse in CI or on
a Windows/pwsh machine before tagging. (3) Internal TomeVault consultation file moved
out of the repo pre-sprint (was untracked in root — publication risk).

Gates: @validator r1 BLOCKED → r2 APPROVED · @docs-dx r1 APPROVED (2 minors fixed in r2,
re-verified by @validator r2; re-run skipped per Routing Log). Reports:
`reports/v8.7.0/sprint-01/` (00/01 in sprint-00, 03×5, 04×2, docs-dx, 07-scribe).
