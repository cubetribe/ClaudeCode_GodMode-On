---
agent: builder-1 (api-paths)
date: 2026-07-28
sprint: v8.7.0/sprint-03
task: H14 — canonical API-critical-path list
---

# Builder Report — API Paths Canonicalization (H14)

## Summary

`skills/api-change/SKILL.md` is now the single canonical source for the API-critical-path
list. It carries the union of the five previously divergent versions:

```
src/api/
backend/routes/
shared/types/
types/
**/interfaces/**
**/dto/**
**/contracts/**
*.d.ts
openapi.yaml
openapi.json
swagger.json
schema.graphql
```

Documented as a deliberate consequence: more paths now trigger the @api-guardian gate than
under four of the five prior versions (safe direction — a missed contract break costs more
than an extra gate run).

`skills/cost-efficiency/SKILL.md` and `skills/workflows/SKILL.md` had their path enumerations
removed and replaced with an in-prose reference to `skills/api-change/`. The risk *category*
("API/schema/type paths touched") was kept in both files per the sprint's risk note — only the
concrete enumeration moved.

`CLAUDE.md` was out of scope (orchestrator already updated it with a reference — verified,
not touched).

### Files Created
- None

### Files Modified
- `skills/api-change/SKILL.md` — canonical union path list + rationale note
- `skills/cost-efficiency/SKILL.md` — path enumeration replaced with reference to `skills/api-change/`
- `skills/workflows/SKILL.md` — path enumeration replaced with reference to `skills/api-change/`
- `/Users/denniswestermann/.claude/skills/api-change/SKILL.md` — mirrored
- `/Users/denniswestermann/.claude/skills/cost-efficiency/SKILL.md` — mirrored
- `/Users/denniswestermann/.claude/skills/workflows/SKILL.md` — mirrored

## Diff Verification (repo vs. install)

`diff` between repo and install copies for all three files shows **only** the expected
license-frontmatter line and the license footer block as differences (install copies have
neither) — no content drift:

```
=== api-change diff ===
4d3
< license: "Proprietary - ..."
101,105c100
< @api-guardian sits between @architect and @builder...
< ---
< *CC_GodMode — © 2025-2026 ...*
---
> @api-guardian sits between @architect and @builder... (no trailing newline)

=== cost-efficiency diff === (license line + footer only)
=== workflows diff === (license line + footer only)
```

## Quality Gates

- [x] `diff` repo↔install for all three files: only license frontmatter/footer differ (see above)
- [x] `grep -c "openapi.yaml" skills/api-change/SKILL.md` → 1 (single enumeration, this file only)
- [x] Markdown header structure intact in all three files (verified via `grep "^## "`)
- [x] No changes outside write scope (`git status` shows only orchestrator's prior `CLAUDE.md`/`templates/CLAUDE-ORCHESTRATOR.md` edits, untouched by this task)
- [x] `node --check scripts/sync-version.js` — not modified by this task, ran clean (no output = pass)
- Tests: no test suite covers Markdown skill files; verification performed via `grep`/`diff` per sprint's deterministic Test Strategy (criterion 1). No code tests applicable to this write scope.

## Notes for Acceptance Criterion 1

Sprint-wide `grep` for `openapi.yaml` outside `reports/`, `plans/`, `archive/`, `CHANGELOG.md`
still shows hits in `agents/api-guardian.md`, `docs/ARCHITECTURE.md`,
`docs/orchestrator/MODES.md`, and `CC-GodMode-Prompts/*` — these are owned by other builders
in this sprint's write-scope table (not `skills/api-change/`, `skills/cost-efficiency/`,
`skills/workflows/`), so out of my scope. Within my scope, the union list exists in exactly
one place.
