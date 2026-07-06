---
sprint: 02
slug: install-sync
plan: plans/v8.6.0/PLAN.md
status: done
execution: sequential
owner: orchestrator
---

# Sprint 02 — Install Sync & Drift Guard

## Goal
Close the repo→install gap: the live `~/.claude/` runs v8.0.0 with broken env-var hook
wiring, pre-Sprint-Contract agents, and no sprint-planning skill — and the installer
deliberately never touches `settings.json`, so drift heals only manually today. Give
the installer a safe hook-repair mode, make drift visible at session start, then
execute the sync so the running system actually gets Sprint 01's fixes.

## Scope
- `scripts/apply-global-claude-setup.sh`: new opt-in `--fix-hooks` flag — backs up
  `~/.claude/settings.json` (timestamped, under `~/.claude/backups/`), then merges the
  canonical hook wiring from `config/claude-settings.json` (SessionStart, PostToolUse,
  SubagentStop, TaskCompleted, TeammateIdle; removes hook entries invoking
  analyze-prompt.js or passing `$CLAUDE_*` variables). JSON editing via embedded
  `node -e` (no jq dependency). Non-hook settings keys are preserved untouched.
- `scripts/session-start.js`: drift guard in the banner — (a) compare install marker
  `~/.cc-godmode-version` against `~/.claude/VERSION` and, when cwd is a GodMode repo
  (VERSION + CLAUDE.md present), against the repo VERSION; warn on mismatch with the
  fix command; (b) scan `~/.claude/settings.json` hook commands for `$CLAUDE_`
  patterns and warn "broken hook wiring detected — run apply-global-claude-setup.sh --fix-hooks".
- Execute the sync on this machine: run the installer (agents, scripts, skills,
  templates) + `--fix-hooks`; refresh the GodMode core of `~/.claude/CLAUDE.md` to the
  v8.5/8.6 orchestrator law while preserving the personal tail (stack defaults,
  department table, scheduled automations — PLAN.md D5); update `~/.claude/VERSION`
  marker per installer convention.

## Non-Goals
- No MCP server configuration changes.
- No changes to repo-side hook logic (done in sprint 01).
- No deletion of any user customization in `~/.claude/` — everything backed up first.

## Files / Write Scope (ownership)
| Path / Glob | Writer | Notes |
|---|---|---|
| `scripts/apply-global-claude-setup.sh` | @builder | --fix-hooks |
| `scripts/session-start.js` | @builder | drift + broken-wiring warnings |
| `~/.claude/**` (live install) | orchestrator via installer | execution step, with backups |

## Risks
- Corrupting the user's settings.json → mitigation: timestamped backup + node JSON
  round-trip (parse-modify-stringify), abort on parse failure.
- Overwriting personal CLAUDE.md content → mitigation: explicit preserve-tail
  procedure (documented 2026-06-30 precedent), full pre-sync backup.

## Acceptance Criteria
- [ ] `apply-global-claude-setup.sh --fix-hooks` on a settings.json fixture with broken env-var wiring produces the canonical argument-free wiring, preserving unrelated keys.
- [ ] session-start banner warns on version drift and on `$CLAUDE_` hook patterns.
- [ ] Live `~/.claude/`: agents carry Sprint Contract, `skills/sprint-planning/` present, `validate-agent-output.js` has stdin mode, settings.json hooks argument-free, `hooks:test` passes against the installed scripts.
- [ ] Backups exist for settings.json and CLAUDE.md.

## Test / Validation Strategy
Fixture test for --fix-hooks (temp dir); `node scripts/test-hooks-contract.js` re-run
against installed `~/.claude/scripts`; @validator review; manual banner check.

## Changelog Note
Added: installer `--fix-hooks` repairs broken settings.json hook wiring (with backup);
session-start banner now warns on install/repo version drift and broken hook wiring.

## Version Relevance
patch — installer/diagnostic improvements, no contract change.

## Preflight (checked at sprint start)
- [ ] Sprint 01 status = done (sync must ship its fixes)
- [ ] `git status` clean except tracked sprint artifacts
- [ ] No other in-progress sprint owns overlapping files

## Result (filled at completion)
Done 2026-07-06. Gates: @validator APPROVED after one BLOCKED (quality) round — the
canonical repo-relative PostToolUse command was not $HOME-normalized in the install
merge; fixed (adjustCommand now normalizes both `scripts/<name>.js` and
`~/.claude/scripts/<name>.js` forms). Contract suite stayed 28/28 throughout.

Live sync EXECUTED on this machine (orchestrator step):
- `--fix-hooks`: 3 events replaced, 2 inserted (TaskCompleted/TeammateIdle were never
  wired in the install), 1 broken analyze-prompt entry removed; backup at
  `~/.claude/backups/install-archives/2026-07-06T14-28-50/settings/settings.json`.
- Full install: 15 agents (Sprint Contract), 17 scripts (stdin hook modes), 14 skills
  (incl. sprint-planning), templates; archive `.../2026-07-06T14-29-00/`.
- `~/.claude/CLAUDE.md` refreshed to the v8.5 orchestrator core with the personal tail
  preserved (stack defaults, department table, scheduled automations); backup in the
  same archive. `~/.claude/VERSION` → 8.5.0.
- Verified: wiring $HOME-anchored/argument-free (no forbidden $CLAUDE_*), installed
  check-api-impact + validate-agent-output have stdin modes, drift guard silent on the
  now-healthy install, installed hook fires on API-path probe.

Follow-up: sprint 05 re-syncs the install after the 8.6.0 bump (VERSION marker +
CLAUDE.md footer). NOTE: running sessions load the new global CLAUDE.md only on
restart.
