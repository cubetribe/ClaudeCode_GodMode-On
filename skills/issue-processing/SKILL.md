---
name: issue-processing
description: "Process GitHub issues — load issue, analyze type/complexity/areas, select workflow, execute agents, create PR with 'Fixes #X'"
---

# Issue Processing

## Command

```
"Process Issue #X"
```

## Workflow

```
1. @github-manager loads issue #X from GitHub
    ↓
2. Orchestrator analyzes issue:
    ↓
3. Select & execute appropriate workflow
    ↓
4. @github-manager creates PR with "Fixes #X"
```

## Issue Analysis Schema

When analyzing a loaded issue, determine:

| Dimension | Options | How to Determine |
|-----------|---------|------------------|
| **Type** | Bug / Feature / Enhancement / Docs | Issue labels, title keywords, description |
| **Complexity** | Low / Medium / High | Scope of changes, number of files, dependencies |
| **Areas** | API / UI / Backend / Infrastructure / Docs | File paths mentioned, components affected |
| **API Impact** | Yes / No | Does it touch critical API paths? |

## Workflow Selection

| Type | Complexity | Workflow |
|------|-----------|----------|
| Bug | Any | Bug Fix workflow |
| Feature | Any | Feature workflow |
| Enhancement | Low | Bug Fix workflow |
| Enhancement | Medium/High | Feature workflow |
| Docs | Any | @scribe only |
| Any | Any + API Impact | API Change workflow |

## PR Requirements

The PR created by @github-manager MUST include:

- Title: Clear description of the change
- Body: Summary of what was done
- Reference: "Fixes #X" or "Closes #X" in body
- Labels: Match issue labels
- Reviewers: If configured

## Issue Labels → Agent Routing

| Label | Implication |
|-------|------------|
| `bug` | Bug Fix workflow |
| `enhancement` | Feature workflow |
| `api` | API Change workflow (include @api-guardian) |
| `docs` | Documentation only (@scribe) |
| `security` | Force @validator security check |
| `performance` | Add performance metrics to @tester |
| `urgent` / `hotfix` | Emergency workflow (streamlined) |