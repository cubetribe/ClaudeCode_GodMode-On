---
sprint: 04
agent: builder-3 (readme)
write_scope: README.md
---

# Builder Report — README Install/Update Path

## Summary

Rewrote the "Install in 30 Seconds" section against the sprint's factual baseline (hooks now
wired by the installer, merge-safe, backed up, idempotent), reframed the `cp
~/.claude/templates/CLAUDE-ORCHESTRATOR.md ./CLAUDE.md` step as intentional per-project activation
rather than a footnote, and added two new sections: **Update** (`git pull && ./scripts/apply-global-claude-setup.sh`,
with the one-sentence idempotency/backup/version-diff rationale) and **Verify your install**
(`node scripts/verify-install.js`, what it checks, exit-code contract, and that it also catches
hooks pointing at files that no longer exist). Added an honest MCP paragraph: `install-mcps.sh`
stays a separate step; `playwright` absence degrades the UX gate to `human` per Core Rule 6 rather
than failing.

Removed the now-inaccurate standalone `--check` install-time bullets from the quickstart (the
installer's own `--check` flag still exists per `scripts/apply-global-claude-setup.sh`, but the
sprint's new `verify-install.js` is the documented verification path per Acceptance Criterion 6, so
the quickstart points there instead of duplicating both).

Agent count (14 = 7 core + 1 security gate + 6 department) was already correct in this file; no
change needed there.

### Files Created
(none)

### Files Modified
- `README.md` — rewrote "Install in 30 Seconds" (hooks now installed, CLAUDE.md-per-project framed
  as intentional), added "Update" section, added "Verify your install" section with MCP honesty
  note.

### Quality Gates
- [x] `node scripts/sync-version.js --check` — green, 14/14 touchpoints consistent (VERSION=8.6.0,
  version strings in README untouched)
- [x] `grep -n "auto-update\|check-update" README.md` — no match
- [x] Manual read-through against sprint-04 scope items 1, 2, 5, 6 — covered
- Tests: no test suite applies to README prose; verification is via `sync-version.js --check` (ran,
  green) and the grep above (ran, no stale references).

### Ready for the deterministic hook
- [x] Write scope respected (README.md only)
- [x] No conflicting/foreign changes found in README.md before editing (`git diff` was empty)
- [x] Version strings (badge, `**CC_GodMode vX.Y.Z**`) left untouched
