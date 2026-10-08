---
name: api-change
description: "API change detection rules, critical file paths that trigger @api-guardian, consumer impact analysis requirements, and breaking change protocols"
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
---

# API Change Detection & Guardian Rules

## Critical API Paths

**This is the single canonical list.** No other file in this repo enumerates these paths —
they all reference this section instead. Changes to ANY of these paths **require
@api-guardian**:

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

This is the **union** of five previously divergent lists (see
`reports/v8.7.0/sprint-00/03b-contradiction-sweep.md`, finding H14). Deliberate
consequence: more paths trigger this gate now than under four of the five prior
versions. That is the safe direction — a contract break that slips through costs more
than a gate that runs once too often.

## Automatic Detection

The `check-api-impact.js` hook runs on every `Write|Edit` operation and:

1. Checks if the modified file matches critical paths
2. Analyzes the diff for breaking changes
3. Finds downstream consumers
4. Warns if @api-guardian has not been called

## @api-guardian Responsibilities

When called, @api-guardian MUST:

1. **Analyze the change type:**
   - Additive (new fields, new endpoints) — safe
   - Modification (type changes, renames) — potentially breaking
   - Removal (deleted fields, removed endpoints) — BREAKING

2. **Identify all consumers:**
   - Search for imports/usage of modified types
   - Check API endpoint consumers
   - Verify downstream dependencies

3. **Assess impact:**
   - How many consumers affected?
   - Is there a migration path?
   - Can it be done non-breaking?

4. **Produce report:**
   - Change classification (additive/modification/removal)
   - Consumer impact list
   - Migration strategy
   - Recommendation (proceed/modify/abort)

## Breaking Change Protocol

If a change is classified as BREAKING:

1. @api-guardian marks it as BREAKING in report
2. @architect must review and approve the break
3. @builder must update ALL affected consumers
4. @scribe must document the breaking change in CHANGELOG
5. Version bump MUST be MAJOR (X.0.0)

## Consumer Impact Matrix

| Change Type | Consumer Impact | Action Required |
|------------|----------------|------------------|
| New field added | None | Proceed |
| Optional → Required | HIGH | Update all consumers |
| Type changed | HIGH | Migration needed |
| Field removed | CRITICAL | Major version bump |
| Endpoint removed | CRITICAL | Deprecation period first |
| New endpoint | None | Document in API docs |

## Workflow Position

```
@architect (API design)
    ↓
@api-guardian (THIS — impact analysis)  ← MANDATORY
    ↓
@builder (implementation + consumer updates)
```

@api-guardian sits between @architect and @builder to catch breaking changes BEFORE implementation begins.

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
