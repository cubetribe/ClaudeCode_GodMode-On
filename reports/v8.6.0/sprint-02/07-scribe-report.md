---
agent: scribe
version: v8.6.0
date: 2026-07-06
status: complete
task: Sprint 02 — Integrate installer --fix-hooks mode and session-start drift guard
---

## Task

Integrate Sprint 02 changes into CHANGELOG.md [Unreleased] section:
- **Installer `--fix-hooks` mode** (`scripts/apply-global-claude-setup.sh`): repairs `~/.claude/settings.json` hook wiring
- **Session-start drift guard** (`scripts/session-start.js`): banner warns of installation drift and broken hook wiring

## Files Changed

| File | Section | Change |
|------|---------|--------|
| CHANGELOG.md | ## [Unreleased] / ### Added | Appended 2 bullets under existing "Added" subsection (Sprint 02 entries) |

## Entries Added

### Added (Sprint 02)

- **Installer `--fix-hooks` mode** (`scripts/apply-global-claude-setup.sh`): repairs `~/.claude/settings.json` hook wiring — backs up first, merges the canonical five events ($HOME-anchored, argument-free, both repo-relative and `~/.claude`-style canonical paths normalized), removes entries referencing analyze-prompt.js or never-populated `$CLAUDE_*` vars, preserves all unrelated keys/events byte-for-byte; composes with the normal install or runs standalone. Closes the documented gap that the installer never healed settings.json drift.
- **Session-start drift guard** (`scripts/session-start.js`): banner now warns when the install marker is behind the repo VERSION and when broken `$CLAUDE_*`/analyze-prompt hook wiring is detected in `~/.claude/settings.json` (with the fix command); silent when healthy, never crashes the banner (full try/catch degradation).

## Verification

- Entries appended to existing `### Added` subsection under `## [Unreleased]`
- No version bump or dated heading created (as instructed)
- House style (bold lead) applied to both entries
- Changes preserve all existing Sprint 01 entries in the [Unreleased] section
