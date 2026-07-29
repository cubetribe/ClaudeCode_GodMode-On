---
sprint: 04
agent: builder-6 (archive)
role: builder
---

# Builder Report — archive auto-update.js / check-update.js

Small, scope-limited task: move two already-deprecated, unwired scripts to `archive/scripts/`
(same pattern as `archive/agents/validator.md`), preserve license headers, extend the deprecation
banner with the new location and the current update path, and document the archive directory.

### Files Created
- `archive/scripts/auto-update.js` (via `git mv` from `scripts/auto-update.js`)
- `archive/scripts/check-update.js` (via `git mv` from `scripts/check-update.js`)
- `archive/README.md` — did not exist yet; short index of archive contents (roadmap, validator.md, now these two scripts)

### Files Modified
- `archive/scripts/auto-update.js` — appended a line to the existing UNWIRED banner noting the v9.0.0/Sprint 04 move and the current update path (`git pull && ./scripts/apply-global-claude-setup.sh`). License header (Copyright/Proprietary) untouched.
- `archive/scripts/check-update.js` — same banner addition, license header untouched.

### Quality Gates
- [x] `git mv` used for both files — history preserved (`git status` shows `RM`, not delete+add)
- [x] `node --check` passes on both moved files (syntax intact)
- [x] License headers unchanged (verified by diff review)
- Tests: none exist for these scripts (they are archived/unwired); no test suite affected.

### Post-move verification
Ran the required grep for remaining references to the old `scripts/auto-update` / `scripts/check-update` paths, excluding `reports/` and `archive/`. Remaining hits fall into two buckets:
1. **`CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md`, `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md`** — foreign scope (@builder-4/5), not touched.
2. **`CHANGELOG.md`** (historical entries from v5.x/v6.x releases) and **`plans/v8.7.0/sprint-04-install-update-path.md`** (the sprint file itself, describing this task) — both outside my write scope by contract (release artifacts / plans), left untouched.

No reference to the old paths remains in any file inside my own write scope or in any file not owned by another builder in this sprint.
