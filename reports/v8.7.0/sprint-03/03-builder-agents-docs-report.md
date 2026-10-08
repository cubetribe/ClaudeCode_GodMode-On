---
sprint: 03
builder: agents-docs (@builder-4)
scope: docs/AGENTS.md, agents/*.md (fließtext only, no frontmatter)
---

# Sprint 03 — @builder-4 (agents-docs) Report

## Summary

H2-Rest (@scribe/VERSION) and H13-Rest (@ci-security-guardian tool claim) fixed. Additionally,
the mandated 14-agent tool-claim sweep found the same contradiction pattern in three more
department agents that Auftrag 3 didn't name explicitly — fixed all of them for consistency.

## Auftrag 1 — @scribe / VERSION separation

- `docs/AGENTS.md:20` — "Documentation, changelog, version management" → now names the
  `[Unreleased]`-only scope and points at `scripts/version-bump.js` for the release sprint.
- `agents/scribe.md:258,266,271,379,384` — "Version Management Rules" / "run these commands for
  version management" / rationale citing "version management" → reworded to "Version Verification
  Rules (never version management)", explicit "I never write VERSION myself", rationale now says
  "verifying version uniqueness ahead of the release sprint's tooling".
- Confirmed zero remaining unnegated "version management" fließtext claims (`grep` check below).

## Auftrag 2 — Tool claims vs. frontmatter (H13-Rest + full 14-agent sweep)

- `docs/AGENTS.md:43` — @ci-security-guardian "Read + Write (GitHub surface only)" → "Read-only
  advisor (never modifies repository files)", matching its `tools:` line (no `Write`) and its own
  body text ("I never modify repository files").
- Ran `grep -n "^tools:"` across all 14 `agents/*.md` and cross-checked every read-only/write claim
  in the fließtext. Found the **same contradiction** (not limited to the two the sprint file named)
  in three more department agents: `ci-security-guardian.md`, `runtime-platform.md`,
  `workflow-design.md`, `workspace-governance.md` all had a Sprint-Contract "Write scope" clause
  reading "I write ONLY my report to `reports/.../*-report.md`" — despite holding **no** `Write`
  tool — while their own "Report output" section later, correctly, said "I hold no `Write` tool."
  Internal self-contradiction inside the same file. Fixed all four to state "I am advisory and hold
  no `Write` tool — I return my full findings inline in the verdict; whoever dispatched me persists
  them to `reports/...`."
- `docs-dx.md` and `quality-operations.md` already had the correct no-Write phrasing — no change
  needed.
- `security.md:34` ("Write scope: read-only gate — I write only my report...") is accurate: security
  does hold `Write` (confirmed in frontmatter), used only for its own report — left as-is.
- Added the previously-missing `Write` row to the Tools tables of `api-guardian.md`, `researcher.md`,
  and `security.md` (own-report-only, consistent with the "Write scope" text already in each file) —
  omission, not a false claim, but now the table and prose agree everywhere.
- Frontmatter tool matrix confirmed against the sprint's stated ground truth — 8 agents with
  `Write` (`api-guardian`, `architect`, `builder`, `github-manager`, `researcher`, `scribe`,
  `security`, `tester`), 6 without (`ci-security-guardian`, `docs-dx`, `quality-operations`,
  `runtime-platform`, `workflow-design`, `workspace-governance`). No frontmatter line was touched.

## Auftrag 3 — @validator residue

- `grep -rn "@validator\|VALIDATOR" agents/*.md docs/AGENTS.md` → only one hit, in
  `docs/AGENTS.md:23` ("Where did @validator go? It was dissolved, not deleted…") — an explanatory
  mention as permitted by the sprint file. No file describes @validator as a running gate. No
  change needed.

## Repo/Install parity

`diff` of every file in `agents/*.md` against `~/.claude/agents/*.md` after all edits: **zero
differences** (including the license footer — both copies already carry it identically; the
"install copies don't have the footer yet" note in the sprint file no longer matches the current
install state, verified with `tail -2` on all untouched files before syncing). All 8 touched files
copied into `~/.claude/agents/` to keep both trees byte-identical.

## Files Created

(none)

## Files Modified

- `docs/AGENTS.md` — @scribe specialty column, @ci-security-guardian mode column
- `agents/scribe.md` — Version Verification Rules section, rationale, "When to use" bullet
- `agents/ci-security-guardian.md` — Write-scope clause corrected to no-Write
- `agents/runtime-platform.md` — Write-scope clause corrected to no-Write
- `agents/workflow-design.md` — Write-scope clause corrected to no-Write
- `agents/workspace-governance.md` — Write-scope clause corrected to no-Write
- `agents/api-guardian.md` — added missing Write row to Tools table
- `agents/researcher.md` — added missing Write row to Tools table
- `agents/security.md` — added missing Bash/Write rows to Tools table
- `~/.claude/agents/scribe.md`, `ci-security-guardian.md`, `runtime-platform.md`,
  `workflow-design.md`, `workspace-governance.md`, `api-guardian.md`, `researcher.md`,
  `security.md` — mirrored to keep install copies identical to repo copies

## Quality Gates

- [x] `grep -n "version management"` in scope files → only one hit, explicitly negated
- [x] `grep -rn "@validator\|VALIDATOR"` in scope files → only the permitted explanatory mention
- [x] Frontmatter (`tools:` line and all other frontmatter fields) unmodified in every file —
      verified via `git diff` hunk offsets (all ≥ line 24, frontmatter ends at line 7)
- [x] `diff` of all 14 `agents/*.md` vs. `~/.claude/agents/*.md` → no differences
- No typecheck/lint/build applicable — this write scope is markdown-only prose; no test suite
  targets these files.

## Ready for the deterministic hook

- [x] All changes complete
- [x] No code/frontmatter touched, so typecheck/lint/build are not applicable to this scope
- [x] Tests: N/A (docs-only sprint scope); acceptance criteria 5 and 6 verified by `grep`/`diff`
      as shown above
