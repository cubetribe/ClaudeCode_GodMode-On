---
name: release
description: "Release sprint workflow: version-at-release via tooling, CHANGELOG [Unreleased] flow, release invariant checks, tags, GitHub Releases, RCs. Authoritative law: docs/orchestrator/VERSIONING.md"
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
---

# Release & Versioning (v9.0.0)

> **Authoritative law:** `docs/orchestrator/VERSIONING.md` (ADR-004). This skill is the
> operational cheat sheet. The pre-v8.5 "Version-First" rule (bump before work) is retired.

## The model in one look

```
plans/vX.Y.Z/PLAN.md + sprint files      ← what ships (target version = working label)
CHANGELOG.md [Unreleased]                ← accumulates one entry per sprint (writer: @scribe)
VERSION                                  ← single source of truth, written ONCE per release
scripts/version-bump.js <type>           ← bump + [Unreleased] promotion + full touchpoint sync
scripts/sync-version.js --check          ← all ~12 touchpoint files consistent?
scripts/release-check.js                 ← VERSION == CHANGELOG == tag == release?
release/vX.Y.Z → PR → merge commit       ← CI: release-consistency.yml
.github/workflows/release-tag.yml        ← annotated tag + DRAFT GitHub Release
```

## During normal sprints

- Do NOT touch `VERSION`, do NOT create dated CHANGELOG headings.
- Each sprint ends with @scribe adding its entry under `## [Unreleased]` (serialized).
- Record the sprint's `Version Relevance` (none/patch/minor/major) in its sprint file.

## Release sprint checklist

- [ ] All sprints `done`; working tree clean; `[Unreleased]` non-empty
- [ ] `node scripts/release-check.js` — resolve inherited drift (phantom releases) FIRST
- [ ] Bump type = highest sprint `Version Relevance` (semver table in VERSIONING.md)
- [ ] `node scripts/version-bump.js <type>` (use `--dry-run` first)
- [ ] `npm run version:check` green, `npm run release:check` green (on `release/*` branch)
- [ ] Release PR with the promoted CHANGELOG entry; CI green
- [ ] **Explicit user permission**, then merge (merge commit)
- [ ] Verify tag + draft release created (release-tag workflow); publish the draft
- [ ] ROADMAP entry → `released`

## Pre-releases / Release Candidates

- Tag `vX.Y.Z-rc.N` (annotated) + GitHub Release with the **pre-release** flag.
- CHANGELOG headings never carry the rc suffix — RC feedback rolls into the final entry.

## Hard rules

- **NEVER** reuse a version number (version-bump checks git tags).
- **NEVER** push, tag, or publish without explicit user permission.
- Only the release sprint writes VERSION; only @scribe writes CHANGELOG.
- A merged release PR without tag+release is a defect — `release-check.js` flags it.

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
