---
agent: builder
date: 2026-07-28
sprint: v8.7.0/sprint-02
task: gate-restructure — workflow-state.js / pre-push-check.js @validator dissolution (Nachtrag)
status: complete
---

# Builder Report — workflow-state Nachtrag

## Problem

`pre-push-check.js` hard-required `qualityGates.validator.status === 'APPROVED'`,
which — with @validator dissolved this sprint — would fail every push
unconditionally. `workflow-state.js` carried `@validator`/`qualityGates.validator`
through its entire state machine (AGENT_STAGES, validateState, pipeline lists,
setGateResult, getResumeInfo).

## Changes

New gate model: `qualityGates: { checks: null, tester: null, security: null }`.
Semantics: `checks` mandatory; `tester`/`security` only checked if non-null
(a gate that never ran must not block).

### `scripts/workflow-state.js`
- Removed `@validator` from `AGENT_STAGES`.
- `validateState()`: validates `checks`/`tester`/`security` instead of
  `validator`/`tester`.
- Pipeline lists (`feature`/`bug`/`api`/`refactor`): dropped `@validator`
  entirely, dropped `@tester` from the default (comment documents it's added
  via `ux_gate: auto` by the caller — this function has no sprint context).
- `initWorkflow()` seeds `qualityGates` as `{ checks: null, tester: null, security: null }`.
- `setGateResult(gate, result)`: accepts `'checks' | 'tester' | 'security'`.
- `getResumeInfo()`: gate-status logic now treats `null` as "not required",
  only actually-run gates (`ranGates`) count toward BLOCKED/APPROVED/IN
  PROGRESS; returns `checks`/`tester`/`security` in the resume object.

### `scripts/pre-push-check.js`
- `checkWorkflowState()`: `checks` must be `'APPROVED'`; `tester`/`security`
  are only checked (and can only fail) if non-null. A gate at `null` is
  skipped, not treated as missing.
- Doc header updated to describe the new gate contract.

### `scripts/check-api-impact.js`
- Single-line change: `@api-guardian → @builder → @validator → @scribe`
  → `@api-guardian → @builder → checks → @scribe`. No other change.

### `scripts/test-hooks-contract.js`
- Added in-process probes (no new spawns, plain `require`) asserting:
  1. `checks: APPROVED`, `tester/security: null` → push-eligible.
  2. `tester: BLOCKED` → not push-eligible.
  3. `checks: null` → not push-eligible.
  4. `initWorkflow()` seeds the new `{checks,tester,security}` shape.
  5. `setGateResult('validator', ...)` is rejected (agent no longer exists).
  6. `setGateResult('security', 'APPROVED')` is tracked in `getResumeInfo()`.
- 6 new checks; total 37 → 43.

### Files Created

None — this task was a fix to existing scripts, no new files.

### Files Modified

- `scripts/workflow-state.js` — AGENT_STAGES, validateState, pipeline lists,
  initWorkflow seed, setGateResult, getResumeInfo migrated to
  `{checks, tester, security}`.
- `scripts/pre-push-check.js:69-96` — checkWorkflowState() rewritten for the
  null-skip / mandatory-checks gate semantics.
- `scripts/check-api-impact.js:257` — one line, `@validator` → `checks`.
- `scripts/test-hooks-contract.js` — additive gate-semantics probes.
- `~/.claude/scripts/workflow-state.js`, `~/.claude/scripts/pre-push-check.js`,
  `~/.claude/scripts/check-api-impact.js`, `~/.claude/scripts/test-hooks-contract.js`
  — mirrors of the four files above.

### Quality Gates

- [x] `node scripts/test-hooks-contract.js` → 43/43 PASS (baseline 37/37,
  no prior check broken; +6 new checks for the gate-semantics contract).
- [x] `node scripts/pre-push-check.js` in the real repo (no `.ccgm-state.json`)
  → "No workflow state found (not in workflow mode)" passes; only the
  unrelated "Uncommitted changes" check fails (other builders' parallel
  work in this sprint), confirming the old always-fails-on-validator bug
  is gone.
- [x] Manual fixture runs of `checkWorkflowState()`, `setGateResult()`, and
  `getResumeInfo()` confirm the null-skip / mandatory-checks semantics
  (checks=APPROVED+tester/security=null passes; tester=BLOCKED blocks;
  checks=null blocks).

### Tests

- `scripts/test-hooks-contract.js` — 6 new in-process assertions (no new
  spawned fixtures needed, plain `require` against fixture cwds):
  1. `checks: APPROVED`, `tester/security: null` → push-eligible.
  2. `tester: BLOCKED` → not push-eligible.
  3. `checks: null` → not push-eligible.
  4. `initWorkflow()` seeds the new `{checks,tester,security}` shape.
  5. `setGateResult('validator', ...)` is rejected (agent no longer exists).
  6. `setGateResult('security', 'APPROVED')` is tracked in `getResumeInfo()`.

## Out of scope / untouched

`scripts/analyze-prompt.js` (deprecated, dead code, deliberately left as is
per instruction). `README.md`, `CONTRIBUTING.md`, `docs/**`,
`CC-GodMode-Prompts/**` (other builder's scope). `validate-agent-output.js`,
`session-start.js`, `verify-changes.js`, `parallel-quality-gates.js` (already
done, not touched).
