---
name: prototype-mode
description: "Local-only fast lane for rapid spikes and throwaway prototypes. Skips production gates, requires PROTOTYPE ONLY watermarks, and must not be pushed or deployed."
---

# Prototype Mode

Use this skill when speed matters more than production readiness and the output
is explicitly disposable.

Prototype Mode is not normal delivery with fewer checks. It is a separate local
lane for spikes, experiments, and short proof-of-concepts. Nothing created in
this mode may be pushed, released, deployed, or connected to production
services until it is migrated through the normal CC_GodMode workflow.

## When To Use

- exploring a new idea before choosing architecture
- answering a narrow technical question quickly
- trying multiple approaches before picking one
- building local demo code that will be rewritten before shipping
- debugging an approach with disposable local files

## When Not To Use

- production, staging, shared branches, or release work
- real credentials, production databases, live APIs, or customer data
- API contracts, schemas, migrations, or public behavior that must be preserved
- security-sensitive work
- any task where the normal workflow is feasible in the available time

## What This Mode Skips

| Gate | Prototype behavior |
| --- | --- |
| Version-first release flow | Skipped for throwaway local work |
| @architect | Optional; use only if the prototype will shape production design |
| @api-guardian | Skipped; prototypes must not define production contracts |
| @validator | Skipped as a full gate |
| @tester | Reduced to one smoke command |
| @scribe | Skipped; no CHANGELOG or release docs for throwaway output |
| @github-manager | Skipped; no PR, release, or push |

## What This Mode Keeps

- The main thread stays the orchestrator.
- @builder writes generated code.
- A three-bullet plan is required before writing.
- One smoke command must prove the prototype runs or produces output.
- Every generated source file must include a `PROTOTYPE ONLY` header.
- The final answer must include the migration checklist.

## File Placement

Use one of these conventions:

- `prototype/` directory
- `spike/` directory
- `proto_` filename prefix

Do not mix prototype files into production source folders unless the filename
is visibly prefixed with `proto_`.

## Required Header

Adapt the comment syntax to the language.

```text
PROTOTYPE ONLY - NOT FOR PRODUCTION
Created in CC_GodMode Prototype Mode for local testing only.
Do not commit to main, deploy, or use real credentials here.
Run through the normal CC_GodMode workflow before production use.
```

## Loop

1. State the prototype goal in one sentence.
2. Write a three-bullet plan: files, behavior, smoke command.
3. Delegate implementation to @builder.
4. Run exactly one smoke command.
5. Return files changed, smoke result, and the migration checklist.

## Migration Checklist

Before promoting prototype output:

- [ ] Remove every `PROTOTYPE ONLY` header.
- [ ] Rename or move files out of `prototype/`, `spike/`, or `proto_*`.
- [ ] Replace placeholder credentials and local-only URLs.
- [ ] Run @architect if the approach affects production design.
- [ ] Run @api-guardian if contracts, schemas, CLI surfaces, or public APIs are touched.
- [ ] Run @validator and @tester as full quality gates.
- [ ] Route documentation and release notes through @scribe.
- [ ] Get explicit human approval before push or deploy.
