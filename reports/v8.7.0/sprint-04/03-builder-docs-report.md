---
sprint: 04
agent: builder-4 (docs)
date: 2026-07-29
write_scope: docs/INSTALLATION.md, docs/AGENT_ARCHITECTURE.md
---

# Sprint 04 — Builder Report (docs)

## Summary

Brought both documents in line with the sprint's canonical commands (single install/update
command, hook wiring described, `verify-install.js` referenced) and removed every reference to
`auto-update.js` / `check-update.js`. Added the reinstall-drift warning to both files per Auftrag 3.

## Findings against the old docs

- `docs/INSTALLATION.md` previously advertised `--check` as *the* verification path and never
  mentioned hook wiring at all — both were true gaps once cross-checked against
  `scripts/apply-global-claude-setup.sh`'s help text (`--no-hooks`, `--fix-hooks`, `wire_hooks`).
  Corrected: install section now describes the merge-not-overwrite hook wiring, backup, idempotency,
  `--no-hooks` opt-out, and a dedicated `verify-install.js` section.
- `docs/AGENT_ARCHITECTURE.md`'s "Installation Procedures" section (First-Time Setup / Updating
  Agents / Verification) instructed hand-copying individual `agents/*.md` files with `cp` — this
  was already flagged stale by the file's own 2026-07-06 maintenance note, but the procedures
  themselves were never corrected until now. Replaced with the real installer command, hook wiring,
  and `verify-install.js`; updated the top maintenance note and the closing "Key Commands" summary
  to match, and corrected the roster count (14 agents: 7 core + 1 security gate + 6 department) —
  no `@validator` remains anywhere in this file, confirmed by grep.
- Neither file referenced `auto-update.js`/`check-update.js` originally, so no removal was needed
  there (confirmed via grep both before and after edit) — the dead references live in
  `CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md`, which is @builder-5's write scope, not mine.

## Note on verification limits

`scripts/apply-global-claude-setup.sh` was mid-edit by @builder-1 during this sprint (uncommitted,
`git status` showed it modified before I started). I did not touch that file. The install-section
prose in both docs describes the **target behavior specified in the sprint file** (merge-only hook
wiring, backup, idempotent, `--no-hooks`/`--fix-hooks` flags) — I confirmed the flag names,
`wire_hooks` merge-only semantics, and backup behavior directly against the script's comments and
code as it stood at time of writing, but could not run an end-to-end install since the script was
still in progress and `scripts/verify-install.js` did not yet exist (owned by @builder-2). Re-verify
both docs once builder-1/builder-2's work lands, ideally via `verify-install.js` output.

## Files Created

(none)

## Files Modified

- `docs/INSTALLATION.md` — Quick Install section now describes hook wiring + `--no-hooks`/
  `--fix-hooks`, added "Verify your install" section (`node scripts/verify-install.js`), rewrote
  Updating section to the single `git pull && ./scripts/apply-global-claude-setup.sh` command,
  added a "Don't edit `~/.claude/` directly" reinstall-drift section.
- `docs/AGENT_ARCHITECTURE.md` — rewrote Installation Procedures (First-Time Setup / Updating
  Agents / Verification) to the real installer command + hook wiring + `verify-install.js`;
  updated the top maintenance note (14-agent roster, @validator removal) and the closing Summary
  "Key Commands"; expanded Best Practices item 1 with the reinstall-drift warning (health-cache fix
  and hook registration lost on reinstall).

## Quality Gates

- [x] Scope respected — only the two assigned files touched (`git diff --stat` confirms)
- [x] `grep -rn "auto-update\|check-update" docs/INSTALLATION.md docs/AGENT_ARCHITECTURE.md` — no
      matches
- [x] No mention of `~/.claude/CLAUDE.md` as a global file — project activation step described as
      copying the template into the project's own `CLAUDE.md`, matching sprint requirement
- [N/A] No code/tests in scope (docs-only); markdown has no typecheck/lint/build gate in this repo

## Tests

Not applicable — documentation-only change, no test suite covers markdown content. Verified claims
by grep against the sprint file, `scripts/apply-global-claude-setup.sh` (as it stood mid-edit), and
`docs/orchestrator/AGENTS.md` for the agent count.

## Ready for the deterministic hook

- [x] Write scope respected
- [x] No stray edits outside `docs/INSTALLATION.md` / `docs/AGENT_ARCHITECTURE.md`
- [ ] Full end-to-end re-verification pending @builder-1 (installer) and @builder-2
      (`verify-install.js`) landing — flagged above, not a blocker for this report
