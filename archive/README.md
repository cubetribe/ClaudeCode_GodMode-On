# archive/

Historical material kept for reference, not deletion. Nothing here is dispatchable or wired into
the running system — see each item's own header/banner for why it moved here and what replaced it.

## Contents

- `ROADMAP-V5.0-HISTORICAL.md` — superseded roadmap, kept for historical context.
- `agents/validator.md` — archived Sprint 02, v8.7.0. Its deterministic checks moved into a hook;
  its judgment part is now pulled on demand via `/code-review`.
- `scripts/auto-update.js`, `scripts/check-update.js` — archived Sprint 04, v9.0.0. Found unwired
  by the v8.7.0 Sprint 03 script audit. The update path is now `git pull && ./scripts/apply-global-claude-setup.sh`.
