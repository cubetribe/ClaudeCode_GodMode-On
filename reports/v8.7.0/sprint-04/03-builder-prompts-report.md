---
sprint: 04
agent: builder-5 (prompts)
plan: plans/v8.7.0/PLAN.md
---

# Builder Report — Prompts (Sprint 04)

## Summary

Rewrote the three assigned prompt files so they describe the actual, single
canonical install/update path (`git clone` + `./scripts/apply-global-claude-setup.sh`,
verified with `node scripts/verify-install.js`) instead of a hand-authored, drifted
duplicate of the installer's logic that referenced dead/archived scripts, a stale
agent count, and directories the installer no longer populates.

### Files Created
- (none)

### Files Modified
- `CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md` — full rewrite. No more
  `auto-update.js` / `check-update.js` references anywhere (checked, zero hits).
  Update flow is now: compare `~/.claude/.cc-godmode-version` vs `VERSION`,
  `git pull && ./scripts/apply-global-claude-setup.sh`, verify with
  `node scripts/verify-install.js` (exit-code contract explained), major-upgrade
  note to check `CHANGELOG.md` for breaking changes.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` — fixed the leftover
  "15 Agents (8 Core + ...)" line (stale @validator-era count) to 14/7. Replaced
  the 13-step hand-copy install (mismatched file lists, no hook-merge logic, no
  LICENSE/NOTICE, referenced `auto-update.js` and a 3-hook `settings.json` block
  that doesn't match `config/claude-settings.json`) with a 6-step flow that runs
  the canonical installer, verifies via `scripts/verify-install.js`, and
  clarifies there is no global `~/.claude/CLAUDE.md` (template lives at
  `~/.claude/templates/CLAUDE-ORCHESTRATOR.md`, copied per project). Updated the
  banner boxes (version-locked lines preserved verbatim), report template, "What
  Gets Installed" table/details (14 skills listed correctly, hook list matches
  `config/claude-settings.json` including `TaskCompleted`/`TeammateIdle`), and
  the Uninstall/Troubleshooting sections to match what the installer actually
  writes.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md` — same treatment:
  step-by-step manual walk-through now runs the installer script (with the
  underlying `cp`/merge steps explained rather than hand-executed), adds the
  hook-wiring explanation the manual path previously lacked entirely (it only
  wired `PostToolUse`, no `SessionStart`/`SubagentStop`/etc.), fixes the skills
  list (14, includes `dynamic-workflows`/`greenfield-bootstrap`/`sprint-planning`
  which were missing), and rewrites Uninstall/Troubleshooting to match reality.

### Quality Gates
- [x] `node scripts/sync-version.js --check` — green, 14/14 touchpoints,
  version-locked banner/version strings in all three files left untouched.
- [x] `grep -rn "auto-update\|check-update" CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md` — no hits.
- [x] `grep -n "validator\|15 Agents\|8 Core" <the three files>` — no hits (leftover fixed in Auto prompt).

### Tests
No automated test suite covers prose prompt files; verification here is the
`sync-version.js --check` run above plus the `grep` checks for the banned
strings (Acceptance Criterion 5 in the sprint file), both shown clean.

### Notes for other builders
- The Auto/Manual prompts now reference `scripts/verify-install.js` and
  `scripts/install-mcps.sh` — confirmed both exist in the working tree at time
  of writing (owned by @builder-2 and pre-existing respectively).
- I did not touch `scripts/apply-global-claude-setup.sh`/`.ps1`, README.md,
  docs/INSTALLATION.md, or package.json — out of my write scope.
