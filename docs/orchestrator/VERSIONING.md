# CC_GodMode Versioning & Release

## Version-First Workflow (MANDATORY)

**Before ANY work starts:**
1. **Determine target version** - Read current VERSION file, increment appropriately
2. **Create CHANGELOG entry** - Document planned changes under new version
3. **Create report folder** - `mkdir -p reports/vX.X.X/`
4. **All agent reports go into this folder**

```
VERSION file says: 6.0.0
New work planned: Bug fix
--> New version: 6.0.1
--> Reports go to: reports/v6.0.1/
```

## Semantic Versioning

- **MAJOR** (X.0.0): Breaking changes, major architecture changes
- **MINOR** (0.X.0): New features, larger enhancements
- **PATCH** (0.0.X): Bug fixes, small changes, hotfixes

## The VERSION File

- Single line containing version number (e.g., `6.0.0`)
- Must exist in every project root
- Can be read by frontend/scripts for version display
- Is the single source of truth for project version

## Pre-Push Checklist (MANDATORY)

Before ANY push to GitHub, Dev Server, Production, etc.:

```
[ ] VERSION file updated
[ ] CHANGELOG.md entry added
[ ] README.md updated (if needed)
[ ] Version number is NEW (never pushed before)
[ ] User gave explicit permission to push
```

**NEVER push the same version twice.** Each push = new version number.

## Report File Structure

```
reports/                                    <-- gitignored, not pushed
|-- v[VERSION]/                             <-- Grouped by CHANGELOG version
    |-- 00-researcher-report.md             <-- optional
    |-- 01-architect-report.md
    |-- 02-api-guardian-report.md
    |-- 03-builder-report.md
    |-- 04-validator-report.md
    |-- 05-tester-report.md
    +-- 06-scribe-report.md
```
