---
name: release
description: "Version-first workflow, semantic versioning rules, pre-push checklist, and release process for CC_GodMode"
---

# Release & Versioning

## Version-First Workflow

**BEFORE any work starts:**

1. Read current `VERSION` file
2. Determine increment type:
   - **MAJOR** (X.0.0) — Breaking changes, architectural rewrites
   - **MINOR** (0.X.0) — New features, new agents, new workflows
   - **PATCH** (0.0.X) — Bug fixes, documentation, minor improvements
3. Create report folder: `mkdir -p reports/vX.X.X/`
4. Announce: "Working on vX.X.X — [type]: [description]"
5. All agent reports saved to `reports/vX.X.X/`

## Pre-Push Checklist

Before ANY push to remote, verify ALL of these:

- [ ] `VERSION` file is updated to new version
- [ ] `CHANGELOG.md` has entry for new version with date
- [ ] All prompt file headers show correct version
- [ ] CLAUDE.md version reference is current
- [ ] No duplicate version in CHANGELOG
- [ ] Both quality gates (@validator + @tester) have APPROVED
- [ ] User has given EXPLICIT push permission

**NEVER push the same version twice.**
**NEVER push without user permission.**

## Report Structure

```
reports/
└── vX.X.X/
    ├── 00-researcher-report.md    (if @researcher was used)
    ├── 01-architect-report.md
    ├── 02-api-guardian-report.md   (if API change)
    ├── 03-builder-report.md
    ├── 04-validator-report.md
    ├── 05-tester-report.md
    └── 06-scribe-report.md
```

## Semantic Versioning Rules

| Change Type | Example | Version Bump |
|-------------|---------|-------------|
| New agent added | @researcher | MINOR |
| New workflow | Research workflow | MINOR |
| Breaking CLAUDE.md change | Full rewrite | MAJOR |
| Hook configuration change | New SubagentStop | MINOR |
| Bug fix in script | False positive fix | PATCH |
| Documentation only | README update | PATCH |
| New platform feature | Skills, Plugins | MINOR |

## CHANGELOG Format

```markdown
## [X.X.X] - YYYY-MM-DD

### "Release Title" — Subtitle

> *Philosophy/context quote*

### Breaking Changes (if MAJOR)
- Description of what breaks and migration path

### Added
- New features with details

### Changed
- Modified behaviors

### Fixed
- Bug fixes

### Technical Details
- Implementation notes
```

## Release Workflow

```
1. @scribe verifies:
   → VERSION incremented
   → CHANGELOG updated
   → All docs current
   → Reports complete

2. @github-manager executes:
   → Create release branch (if needed)
   → Create PR with all changes
   → Tag version after merge
   → Create GitHub Release with CHANGELOG excerpt
```

## Version Automation

Use the version bump script for consistency:

```bash
node scripts/version-bump.js patch   # 6.0.0 → 6.0.1
node scripts/version-bump.js minor   # 6.0.0 → 6.1.0
node scripts/version-bump.js major   # 6.0.0 → 7.0.0
node scripts/version-bump.js --dry-run minor  # Preview only
```