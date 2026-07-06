# v8.0.1 — Version Unification · Architecture Brief

**Type:** Release consistency cleanup (PATCH). v8.0.0 is already tagged & released ("The Ultracode Release", 2026-06-30). This pass removes lingering pre-v8 *current-state* version references and bumps the live version to **v8.0.1**.

## Scope (user-confirmed)
- **Policy — "Nur aktuelle Angaben":** change ONLY references that declare the project's *current/active* version. Preserve all historical references: `CHANGELOG.md`, feature-introduction comments (`// v5.7.0: …`), ADR/decision version stamps, `archive/`, illustrative examples, module "authored-at" headers.
- **Reach — Repo + Install + GitHub:** the git checkout (`cc--god_mode/ON`, → v8.0.1 release), the local `~/.claude` installation, and the public GitHub "About" description.

## Approach
1. Parallel classification of ~42 files carrying version refs → adversarially-verified edit list (current-state vs historical).
2. Apply confirmed edits. Bump `VERSION` + `.claude-plugin` manifest → `8.0.1`. Fix `scripts/sync-version.js` (stale hardcoded "The Fail-Safe Release"; its own v5.11.0 header) and broaden its coverage. Add `CHANGELOG.md` v8.0.1 entry.
3. Quality gates: `test-phase2-integration.js` must stay 100%; `sync-version.js --check`; `node --check` on edited JS; `pre-push-check.js` (no push).
4. Align local `~/.claude` install (only if its content already matches v8 — else recommend re-install, do not fake the number) + GitHub About description.
5. Stage on branch `release/v8.0.1`. **No push/tag/publish without explicit user go** (GodMode rule 9).

## Risks & guards
- Do not rewrite history — conservative policy, every CHANGE adversarially verified; uncertain → KEEP.
- Local install: bump number only if content is genuinely current.
- Outward-facing items (GitHub About) are user-authorized for this task; the actual release push is NOT.
