---
name: prototype-mode
description: "Local-only fast lane for rapid prototyping — minimal governance, no security review, maximum iteration speed. Use proactively for spikes, proofs-of-concept, and throwaway experiments. All output is watermarked PROTOTYPE ONLY and must not be pushed to production."
---

# CC_GodMode Prototype Mode

> ⚠️ **LOCAL ONLY — DO NOT DEPLOY TO PRODUCTION**

Use this skill when you need the fastest possible path from idea to running local
code, and correctness, security, and production-readiness are explicitly deferred.

This skill trades the full CC_GodMode quality pipeline for raw iteration speed.
Every output carries a mandatory prototype watermark and a migration checklist that
records what still needs to happen before production.

Pair this skill with the `workflows` skill when you are ready to promote a prototype
into production.

## When to use

- exploring a new idea or architecture before committing to full implementation
- spike work to answer a specific technical question quickly
- local proof-of-concept that will be rewritten before shipping
- rapid debugging experiments where multiple approaches need to be tried fast
- demo code that will never go to production directly

## When NOT to use

- work that will go to production, staging, or be pushed to `main`
- anything touching real credentials, production databases, live APIs, or live
  external services
- public-facing features, even behind a feature flag
- any change where the normal `workflows` pipeline is feasible in the available time

## What this skill skips

| Skipped gate | Reason |
| --- | --- |
| Governance / version-first preflight | No need for full process on throwaway code |
| `@api-guardian` | No contract or schema enforcement |
| `@validator` | No full structural checks |
| `@tester` | No full test suite — one smoke command only |
| `@scribe` | No changelog / version updates |
| `@github-manager` | No PR, no push to remote |

## What this skill keeps

- a 3-bullet plan (what to build, where files go, what "running" looks like)
- `@builder` for all code generation
- one smoke command that proves the code runs or produces output
- prototype watermark headers on all generated source files
- the migration checklist in the output

## Core rules

- All generated source files must include the prototype header (see below).
- No real API keys, tokens, passwords, or production credentials.
  Use `placeholder_` or `test_` prefixed values only.
- File naming: prefix with `proto_` OR place files inside a `prototype/` or
  `spike/` directory.
- Do not commit prototype output to `main` or any shared branch.
- Output must include the migration checklist — do not remove it.

## Required prototype header

Add this comment block at the top of every generated source file, adapted to the
language syntax:

**Python / Shell / Ruby / YAML:**

```python
# ⚠️ PROTOTYPE ONLY — NOT FOR PRODUCTION
# Created in CC_GodMode Prototype Mode — local testing only.
# Do NOT commit to main, deploy, or use real credentials here.
# Promote via the `workflows` skill before any production use.
```

**JavaScript / TypeScript / Swift / Dart / Go / Java / C:**

```javascript
// ⚠️ PROTOTYPE ONLY — NOT FOR PRODUCTION
// Created in CC_GodMode Prototype Mode — local testing only.
// Do NOT commit to main, deploy, or use real credentials here.
// Promote via the `workflows` skill before any production use.
```

**HTML / XML:**

```html
<!-- ⚠️ PROTOTYPE ONLY — NOT FOR PRODUCTION
     Created in CC_GodMode Prototype Mode — local testing only.
     Do NOT commit to main, deploy, or use real credentials here.
     Promote via the `workflows` skill before any production use. -->
```

## Prototype mode loop

1. **State the goal** — one sentence, no archaeology of repo docs
2. **3-bullet plan** — what to build, where files go, what "running" means
3. **Build** — `@builder` writes all code with the prototype header
4. **Smoke** — run one command that proves the code runs or produces output
5. **Done** — output includes the migration checklist below

## Migration checklist

When you are ready to bring a prototype into production, start a normal CC_GodMode
session (via the `workflows` skill) in the real project workspace and work through
this list:

- [ ] Remove all `PROTOTYPE ONLY` header comments from source files
- [ ] Rename or move files (remove `proto_` prefix, move out of `prototype/` or
  `spike/` directories)
- [ ] Replace all placeholder credentials, URLs, and config values with real ones
- [ ] Route through `@architect` for design review of the approach
- [ ] Run `@api-guardian` if any contracts, schemas, or public interfaces changed
- [ ] Run `@validator` + `@tester` gates — both must be green
- [ ] Update `CHANGELOG.md` / `VERSION` via `@scribe` per the `release` skill
- [ ] Get explicit human approval before push or deploy (`@github-manager`)

## Output expectation

Return a concise prototype result with:

- goal restated in one line
- 3-bullet plan
- files created (paths listed, prototype headers confirmed)
- smoke command and its actual output
- migration checklist (pre-filled where possible)

## Do not use when

- the task is a one-line question or a docs-only change
- correctness and contract safety cannot be deferred
- the output will be shared with anyone outside the local development loop
