---
agent: validator
sprint: 01
slug: license-hardening
plan: plans/v8.7.0/PLAN.md
date: 2026-07-13
status: BLOCKED
---

# Validator Report — Sprint 01 (License Hardening)

## Method

Every acceptance criterion in `plans/v8.7.0/sprint-01-license-hardening.md` was checked
directly against the working tree on branch `feat/v8.7.0-license-hardening` (not against
the 4 builder reports' claims). Commands run: `git status`, verbatim text comparison of
LICENSE/NOTICE/CONTRIBUTING against the sprint's canonical texts, a Node/js-yaml
frontmatter parser over all 14 `skills/*/SKILL.md`, grep sweeps for footers/headers,
`node scripts/sync-version.js --check`, `node scripts/release-check.js`, `bash -n` on
both shell installers, `node --check` on 11 JS scripts, JSON parse of `package.json` and
`.claude-plugin/plugin.json`.

## CODE QUALITY

### PASS — verified directly

- `git status`: `VERSION`, `CHANGELOG.md`, `ROADMAP.md` untouched; only expected files
  modified/new (`NOTICE` new, `plans/v8.7.0/`, `reports/v8.7.0/` new/untracked).
- `LICENSE` — byte-for-byte match against the canonical LICENSE v2 text in the sprint
  file (all 8 sections, header, footer contact block).
- `NOTICE` — byte-for-byte match against the canonical NOTICE text.
- `CONTRIBUTING.md` lines 175–190 — "## Contributor License" section matches the
  canonical text verbatim (3 numbered obligations + opt-out sentence).
- `README.md` — badge row (line 9) contains the exact canonical
  `[![License: Proprietary]...(LICENSE)` markdown; line 19 has the exact canonical
  one-liner directly under the title; License section (line ~223) is present, refreshed
  with the 2025-2026 year and NOTICE link.
- All 14 `skills/*/SKILL.md`: YAML frontmatter parses cleanly (js-yaml, no exceptions)
  and every file has a `license:` key with the canonical string. All 14 also carry the
  canonical footer (`grep -L` returned empty).
- All 15 `agents/*.md` and all 6 `CC-GodMode-Prompts/*.md`: footer present in every file
  (`grep -L` returned empty for both sets).
- `CLAUDE.md` and `templates/CLAUDE-ORCHESTRATOR.md`: both carry the footer; both agree
  on the version string; `node scripts/sync-version.js --check` → exit 0, "All 12
  touchpoints consistent with VERSION=8.6.0" (includes both files).
- `node scripts/release-check.js` → exit 0, "Release invariant holds."
- `docs/STORY.md`, `docs/ARCHITECTURE.md`, `docs/orchestrator/AGENTS.md`,
  `docs/INSTALLATION.md`: all 4 carry the footer.
- `package.json`: valid JSON; `license: "SEE LICENSE IN LICENSE"`, `author` (name+url),
  `repository` (git url), `homepage` all present and correct.
- `.claude-plugin/plugin.json`: valid JSON; `license: "LicenseRef-CC-GodMode-Proprietary"`.
- MIT decoy sweep: no remaining `"license": "MIT"` outside `package-lock.json`/plans/
  reports. `config/domain-config.schema.json` line 230 and
  `docs/policies/DOMAIN_PACK_SPEC.md` line 88 both now read `"license": "proprietary"`.
- `bash -n scripts/apply-global-claude-setup.sh` and `bash -n scripts/install-mcps.sh`
  both OK. `node --check` clean on `sync-version.js`, `release-check.js`,
  `version-bump.js` and 8 other touched `.js` scripts.
- Both installers (`.sh` and `.ps1`) copy `LICENSE`→`LICENSE-CC_GodMode.txt` and
  `NOTICE`→`NOTICE-CC_GodMode.txt` into `~/.claude/`, guarded by source-existence checks,
  with matching `--check`/`-Check` assertions.
- Script headers: canonical 2-line JS/TS block verified present, positioned correctly
  after the shebang, in `scripts/analyze-prompt.js`, `check-api-impact.js`,
  `domain-pack-loader.js`, `escalation-handler.js`, `mcp-health-check.js`,
  `parallel-quality-gates.js`, `pre-push-check.js`, `test-hooks-contract.js`,
  `test-phase2-integration.js`, `validate-agent-output.js`, and
  `templates/check-api-impact.js.template`. sh/ps1 header variant correctly placed in
  both installers (`.ps1` after the `param()` block, per spec).

### FAIL — deviations from the sprint's binding text

1. **`src/api/hook-test.ts` has NO copyright/license header at all** (0 occurrences of
   "Dennis Westermann"; file starts directly with a doc-comment about the hook test
   protocol, unchanged from before the sprint). This is an explicit Acceptance
   Criterion item ("All 19 scripts + template + **src/api/hook-test.ts** carry the
   header") and is explicitly named in Scope. `03-builder-scripts-docs-report.md`
   (lines 124–134) self-reports this as an orphaned file — it is in nobody's write-scope
   table row (builder-4's row lists `scripts/*, templates/*, CLAUDE.md, docs/STORY.md,
   docs/ARCHITECTURE.md, docs/orchestrator/AGENTS.md, docs/INSTALLATION.md,
   config/domain-config.schema.json, docs/policies/DOMAIN_PACK_SPEC.md` — `src/api/` is
   not covered by any of the 4 builders' scope rows). Confirmed as a real gap, not a
   false report.

2. **5 scripts received a year-only patch instead of the canonical header block**:
   `scripts/check-update.js`, `scripts/session-start.js`, `scripts/version-bump.js`,
   `scripts/auto-update.js`, `scripts/workflow-state.js` — these kept their pre-existing
   `Copyright (c) 2025 Dennis Westermann / www.dennis-westermann.de` comment and only
   bumped the year to 2025-2026; none carry the canonical
   `Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.`
   line the sprint's binding "Script header — JS/TS" text requires verbatim. This
   satisfies the *Test/Validation Strategy*'s looser grep sweep ("contains '2025-2026
   Dennis Westermann' or the footer line") but does not satisfy the Acceptance
   Criterion's plain reading ("carry the header" = the canonical block), nor the sprint
   Goal's "provably mislabeling despite explicit in-file notices" intent — a scraper
   copying these 5 files would not see the anti-re-hosting notice at all.

3. **PowerShell syntax of `scripts/apply-global-claude-setup.ps1` not verified** — no
   `pwsh` binary available in this validation environment either (`which pwsh` →
   not found), same limitation builder-4 flagged. The edit is a minimal, mirrored
   2-comment-line insertion following the `.sh` twin's already-verified structure, so
   risk is assessed as low, but the Acceptance Criterion ("PowerShell parse for
   installers") is formally unverified by any agent so far.

## TypeScript / Tests

No TypeScript compiler or test suite is in scope for this sprint (comment/text-only
changes; no `tsconfig.json`/test runner touched). N/A per sprint's Non-Goals
("No behavioral changes to any script — header comments only").

## Security

No secrets, auth code, or `.github/workflows/` touched. No behavioral script changes
(header-comment insertions only, verified via `node --check`/`bash -n`). Consistent with
Non-Goals.

## DECISION

**STATUS: BLOCKED (quality)**

Reason: 2 concrete Acceptance Criterion violations (Finding 1 hard-fails "All 19 scripts
+ template + src/api/hook-test.ts carry the header"; Finding 2 fails the same criterion's
plain reading for 5 named files) plus one formally-unverified criterion (PowerShell
parse). All other criteria — LICENSE/NOTICE/CONTRIBUTING verbatim text, SKILL.md
frontmatter+footer (14/14), agents+prompts footers (21/21), CLAUDE.md/template sync,
package.json/plugin.json, MIT decoy defusal, installer LICENSE/NOTICE copy, VERSION/
CHANGELOG/ROADMAP untouched — pass on direct re-verification.

### Required Actions

- [ ] @builder: add the canonical JS/TS header block to `src/api/hook-test.ts` (assign
      explicit write-scope ownership — currently orphaned between all 4 builders' rows).
- [ ] @builder: replace the year-only patch in `scripts/check-update.js`,
      `scripts/session-start.js`, `scripts/version-bump.js`, `scripts/auto-update.js`,
      `scripts/workflow-state.js` with the full canonical 2-line header block (keep the
      pre-existing doc-comment content below it, as done for the other 13 scripts).
- [ ] Orchestrator/validator: obtain a `pwsh`-capable host (or accept documented risk)
      to run `pwsh -NoProfile -Command '$null = Get-Command; ... '`-style syntax check
      on `scripts/apply-global-claude-setup.ps1` before final sign-off.

→ Returning to @builder for fixes; re-validation required before @scribe.
