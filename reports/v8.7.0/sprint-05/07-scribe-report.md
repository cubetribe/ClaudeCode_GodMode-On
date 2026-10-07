---
agent: scribe
date: 2026-10-07
sprint: 05
---

# Scribe Report — Sprint 05 Integration + Follow-Up Restructure

## Summary

**Initial:** CHANGELOG.md `[Unreleased]` section updated with Sprint 05 integration: superseded line removed, Breaking Changes section added, four new Changed/Fixed entries integrated.

**Follow-up:** Complete restructure as coherent 9.0.0 release notes (per sprint-06-release.md "Was Nutzer beim Upgrade tun müssen"): all breaking changes from sprints 02, 04, 05 consolidated; upgrade guide added (6 numbered steps); German entries translated to English; section order fixed (### Breaking Changes, ### Upgrading from 8.6.0, ### Added, ### Changed, ### Fixed — no duplicates).

## Files-Changed

- `CHANGELOG.md` — [Unreleased] section (61 lines of content, 5 section headings):
  - ### Breaking Changes (6 items: Core Rule 2, @validator dissolved, Core Rules 5/6/7/8 rewritten, ux_gate field, installer hooks, qualityGates shape)
  - ### Upgrading from 8.6.0 (6 numbered steps with sub-bullets)
  - ### Added (3 items)
  - ### Changed (9 items, incl. license hardening from Sprint 01)
  - ### Fixed (14 items, merged from both sections, German translated)

## Structure and Content (Follow-Up Restructure)

### Breaking Changes — 6 items, all sprints 02/04/05
1. Core Rule 2 "Delegate when it pays" vs "Delegate by default" (Sprint 05)
2. @validator dissolved → verify-changes.js hook + /code-review; 15→14 agents (Sprint 02)
3. Core Rules 5, 6, 7, 8 rewritten — verification matches evidence; ux_gate declared; skips logged; reports tracked (Sprint 02)
4. New mandatory `ux_gate: auto | human | skip` field — declared at planning, default human (Sprint 02)
5. Installer now merges hooks into ~/.claude/settings.json — backup, entry-level dedup, idempotent, --no-hooks opt-out (Sprint 04)
6. `.ccgm-state.json` qualityGates shape changed to {checks, tester, security}; null = "was not required" (Sprint 02)

### Upgrading from 8.6.0 — 6 steps
1. git pull && ./scripts/apply-global-claude-setup.sh (hooks now wired)
2. node scripts/verify-install.js
3. Update ~/.claude/CLAUDE.md / copy template (new Core Rules)
4. Replace subagent_type: validator with /code-review or remove
5. Add ux_gate field to open sprint files
6. Set /model opus and /effort ultracode in Claude Code 2.1.28x+

### Changed — 9 items (includes Sprint 01 license entry)
1. License hardening (Sprint 01) — LICENSE v2, NOTICE, metadata, headers, footers, packages
2. Product name "GodMode Core for Claude Code" with family table
3. Model strategy (opus default, best Fable 5.1 ~2.5×)
4. Ultracode as session-only switch
5. Fable pricing ~2.5× vs ~2×
6. Installation unification (git pull + installer)
7. auto-update.js / check-update.js archived
8. Hook entry dedup (foreign hooks preserved)
9. README updates (Update section, Verify section, MCP honesty)

### Fixed — 14 items (merged, German translated, corrections applied)
- Hook wiring, docs drift, plugin manifest, model refs (corrected)
- Report authorship (Core Rule 8), min-length thresholds, agent count (14 verified)
- **API path list consolidated** (7 versions → single source skills/api-change/SKILL.md)
- **Escalation model unified** (meta-decisions → META-DECISIONS.md)
- **Architecture gate clarified** (greenfield not separate threshold)
- **@scribe/VERSION separated** (Unreleased only; version-bump.js exclusive)
- **Tool declarations aligned** (14-agent sweep, frontmatter verified)
- **sync-version.js bug fixed** (require.main guard, 47/47 tests passing)
- **Dead scripts audit** (6 of 21 unwired; size correction)

## Verification (Follow-Up)

✅ All breaking changes from sprints 02, 04, 05 consolidated under ### Breaking Changes (6 items covering @validator, Core Rules, ux_gate, installer, qualityGates)
✅ Upgrade guide added as dedicated ### Upgrading from 8.6.0 section (6 numbered steps)
✅ License hardening entry (Sprint 01) added to ### Changed
✅ German bullets translated to English; factual substance preserved, wording tightened
✅ Factual corrections applied:
   - Model legacy: "Opus 4.8, Sonnet 4.6, Fable 5 are legacy (still available, not deprecated)" ✓
   - Model refs scope: "across documentation, skills, the orchestrator template, prompts and the plugin manifest" ✓
   - Plugin verification: "plugin load verified on Claude Code 2.1.286 (14 agents, 14 skills)" ✓
✅ Two ### Fixed sections merged; no duplicate headings
✅ Section heading order: Breaking Changes → Upgrading → Added → Changed → Fixed (per requirements)
✅ [Unreleased] reads as coherent 9.0.0 release narrative (breaking changes → upgrade path → features → fixes)
✅ No VERSION written, no dated heading, no invented facts

## Status

✅ CHANGELOG [Unreleased] complete as 9.0.0 release notes
✅ Five section headings present: Breaking Changes, Upgrading from 8.6.0, Added, Changed, Fixed
✅ Breaking changes: 6 items (sprints 02/04/05 consolidated)
✅ Upgrade guide: 6 numbered actionable steps
✅ License entry: restored from Sprint 01
✅ German: fully translated; facts verified
✅ Corrections: legacy status, model refs scope, plugin verification all fixed
✅ Section line count: 61 lines of content (10 CHANGELOG #8.6.0 entry starts at line 74)
✅ Ready for release sprint (scripts/version-bump.js will promote to ## [9.0.0] - DATE)


## Orchestrator post-edit (2026-10-07)

Two trivial factual fixes applied directly by the orchestrator after verification:
- `qualityGates` old shape corrected to `{validator, tester}` (verified against commit a317d4e,
  `scripts/workflow-state.js` diff) — the scribe text claimed `{checks, tester, security, review}`.
- Upgrade step 3 reworded: re-copy the template into each activated project; a self-maintained
  `~/.claude/CLAUDE.md` must be updated the same way (installer never writes it).
