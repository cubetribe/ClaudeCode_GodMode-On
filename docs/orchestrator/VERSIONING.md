# CC_GodMode Versioning & Release Law (v8.5, ADR-004)

Updated by v8.6.0 sprint 04 additions; the header version is bumped at the release sprint per this document's own law.

> **This document is the single authoritative release law.** `skills/release/` and
> `skills/sprint-planning/` summarize it; agent prompts reference it. If another doc
> contradicts this one, this one wins.

## Source of truth

- **`VERSION` (repo root)** is the canonical current version. Every other occurrence
  (plugin.json, CLAUDE.md, README badge, templates, install prompts, docs) is a **derived
  copy** managed by the touchpoint manifest in `scripts/sync-version.js`. `package.json` is
  intentionally version-free.
- **Release status** is encoded by git tags + GitHub Releases and checked against VERSION by
  `scripts/release-check.js`. **Invariant:**
  `VERSION == top dated CHANGELOG heading == latest tag == latest GitHub release`,
  with `VERSION > latest tag` allowed only while a `release/*` branch is in flight.
- **Roadmap** = `ROADMAP.md` (living). **Sprint progress** = frontmatter `status` in
  `plans/vX.Y.Z/sprint-NN-*.md`. **Decisions** = `DECISIONS.md` (ADRs).

## When the version changes (and when it does NOT)

- Never at work start, never per task, never by an implementer agent.
- Exactly once per release, in the **release sprint**, executed by
  `node scripts/version-bump.js <major|minor|patch>` which:
  1. verifies uniqueness against CHANGELOG **and git tags**,
  2. promotes CHANGELOG `[Unreleased]` → `## [X.Y.Z] - date` (aborts if `[Unreleased]` is empty),
  3. runs `scripts/sync-version.js --sync` over the full touchpoint manifest,
  4. creates `reports/vX.Y.Z/`.
- Bump type = highest `Version Relevance` across the plan's sprint files:
  - **MAJOR** — breaking changes to CLAUDE.md rules, agent handoff/verdict contracts,
    workflow commands, or install surface
  - **MINOR** — new agents, skills, workflows, scripts, or backward-compatible features
  - **PATCH** — fixes, docs, internal improvements

## Changelog law

- Keep a Changelog format; a permanent `## [Unreleased]` section sits at the top.
- **Every sprint adds its entry to `[Unreleased]` at integration** (single writer: @scribe,
  serialized by the Orchestrator). No exceptions, even for one-line fixes. PRs that skip this
  need an explicit no-changelog justification in the PR body.
- Released entries are immutable history: only objective defects (broken links, date typos)
  may be corrected, each noted in `[Unreleased]`.
- Release codenames live ONLY in the CHANGELOG entry and the GitHub Release title — never in
  version lines of docs/prompts.

## Release procedure (release sprint)

1. Preflight: all sprints `done`, working tree clean, `release-check.js` shows no inherited
   drift (resolve missing tags/backfills first).
2. Bump via `version-bump.js` (above). Verify `npm run version:check` + `npm run release:check`.
3. Release branch `release/vX.Y.Z` → PR → CI (`release-consistency.yml`) green → **merge
   commit** (`gh pr merge --merge`).
4. Tag + Release: `.github/workflows/release-tag.yml` creates the annotated tag `vX.Y.Z` and a
   **draft** GitHub Release from the CHANGELOG section on the merge commit; the maintainer
   reviews and publishes. Manual fallback: @github-manager (version from `VERSION` only).
5. Pre-releases / RCs: `vX.Y.Z-rc.N` annotated tag + GitHub pre-release flag. RC changes roll
   into the final entry; the rc suffix never appears in CHANGELOG headings.
6. Flip the ROADMAP entry to `released`.

**Hard rules:** never reuse a version (tag check enforces it); never push/tag/publish without
explicit user permission; a merged release PR without its tag+release is a defect
(`release-check.js` and every subsequent PR's CI will flag it).

## Enforcement

| Check | Where |
|---|---|
| Touchpoint consistency | `scripts/sync-version.js --check` — local, `npm run version:check`, CI on every PR |
| Release invariant + phantom releases | `scripts/release-check.js` — local, pre-push-check, CI on every PR |
| Release tail closure | `.github/workflows/release-tag.yml` on push to main |
| Report/verdict quality | `scripts/validate-agent-output.js` (SubagentStop hook, stdin mode) |

## Repair procedures

- **Phantom release** (CHANGELOG entry without tag): backfill an annotated tag on the merge
  commit of its release PR + create the GitHub Release from the entry (mark as backfilled), OR
  mark the entry "folded into vX.Y.Z" — decision documented in the release sprint file.
- **Version drift across files:** `node scripts/sync-version.js --sync`, review diff, commit.
- **Wrong bump merged but not tagged:** revert the bump commit via PR (the invariant tolerates
  VERSION ahead of tags only on release branches).

## Integration queue

When multiple sprints reach integration simultaneously, they integrate in
**ascending sprint number, exactly one integration at a time** — the hot
files listed above (`VERSION`, `CHANGELOG.md`, `ROADMAP.md`, `plans/**`,
`README.md`) are single-writer and cannot absorb concurrent integrations. A
`BLOCKED` integration does not let later-numbered sprints jump the queue:
they wait for resolution, or the orchestrator re-sequences the plan and
records the change in the plan file.

## Report folders (TRACKED — maintainer rule, 2026-07-06)

`reports/` is **version-controlled**. Every agent — and every subagent or swarm an agent
spawns — writes its full markdown report into `reports/vX.Y.Z/sprint-NN/` **inside the repo**
(numbering in `docs/templates/REPORT_TEMPLATES.md`). Writing reports to `/tmp`, session
scratchpads, or any location outside the repo is a contract violation: those directories do not
survive session interruptions, and the audit trail ("who changed what, when") must persist.
Reports are committed at sprint integration together with the sprint `Result`. The sprint file
remains the condensed summary; the reports are the detailed evidence.
