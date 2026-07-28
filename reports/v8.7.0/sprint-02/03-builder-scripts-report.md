---
agent: builder-5
date: 2026-07-28
sprint: v8.7.0/sprint-02
task: Gate-Umbau - scripts + neuer verify-changes.js Hook
---

# Builder Report — Sprint 02 (scripts, @builder-5)

## Files Created

- `scripts/verify-changes.js` - new SubagentStop hook implementing @validator's
  former deterministic half. Detects project type (package.json / pubspec.yaml /
  Xcode-Swift) and runs ONLY the checks the project itself defines
  (npm scripts `typecheck`/`lint`/`test`/`build` if present; `dart analyze` if
  `dart` is on PATH; Xcode/Swift only reported, never built). Zero-byte stdout
  on a clean pass, per-check timeout (60s), never blocks on missing tooling,
  garbage stdin, or an unrecognized project — exit 2 only on a genuine failure
  of a project-defined check.

## Files Modified

- `scripts/validate-agent-output.js`
  - Removed the `validator` rule set entirely (agent dissolved).
  - Removed all `minLength` thresholds and the associated length-check branch,
    stats field, and doc comment (Goodhart trap per
    `reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md:92`).
    Pattern/section checks — which verify the work happened, not its length —
    are unchanged.
  - Removed the VERSION/SemVer pattern requirement from the `scribe` rule set
    (`docs/orchestrator/VERSIONING.md:24` forbids @scribe from writing VERSION).
  - Rewrote the `tester` rule set to match exactly the pattern/section set
    @builder-6 is putting in `docs/templates/REPORT_TEMPLATES.md` in the same
    sprint (Widerspruch H7): sections `Screenshots Created / Console Errors /
    Performance Metrics / Accessibility / Decision`; patterns for screenshot
    path, image file, console errors, `(LCP|CLS|INP|FCP)`, `(APPROVED|BLOCKED)`.
  - Removed the stray `validator` domain override in the `backend` example
    domain, and the domain-level `minLength` override in the `docs` example
    domain.
  - Fixed `checkWorkflowViolation`: no longer requires a (now impossible)
    `validator: APPROVED` state to let @scribe proceed; only blocks @scribe on
    an explicit `tester: BLOCKED` (tester is opt-in per `ux_gate` now, so its
    absence is not a violation).
  - Removed `validator` from `detectAgentName`'s filename-pattern map.
  - Added an explicit comment documenting that `security` and the 6 department
    agents deliberately have no rule set (no `Write`, verdict-only per Core
    Rule 8) — a decision, not a gap.

- `scripts/session-start.js`
  - Replaced the hardcoded 7-agent `AGENTS` array with `loadAgentList()`,
    which reads `~/.claude/agents/*.md` at runtime (Widerspruch W6) and falls
    back to a static 14-agent list (7 core + security + 6 department) only if
    the directory is missing/unreadable/empty. `@validator` removed from the
    fallback.
  - Reworked the "Agents Ready" banner section to wrap any agent count in
    rows of 5 instead of a hardcoded two-rows-of-4 layout.

- `scripts/parallel-quality-gates.js` (still explicitly marked SIMULATION
  ONLY / deprecated-as-tooling, unchanged in that respect)
  - Updated header docs and decision-matrix table to reflect the new model:
    the old `@validator` slot is now the deterministic hook; `@tester` is
    opt-in (`ux_gate: auto`).
  - Renamed `launchValidator` → `launchHookCheck`, `validatorResult` →
    `hookResult`, `agent: 'validator'` → `agent: 'hook'`, and all related
    log labels/messages throughout `executeParallel`, `coordinateResults`,
    `sequentialFallback`, and `module.exports`.

- `scripts/test-hooks-contract.js`
  - Added a dedicated probe block for `scripts/verify-changes.js`, run
    directly against its known repo path (not via `config/claude-settings.json`
    hook-wiring discovery, since that file is outside this sprint's write
    scope — only `~/.claude/settings.json` is, and that's a local install
    file CI cannot read). Covers: no recognized project type → exit 0 +
    zero-byte output; no changes at all → exit 0 + zero-byte output;
    garbage stdin → exit 0; no `Usage:` leak in any case.

- `~/.claude/settings.json`
  - Backed up to `~/.claude/backups/settings.json.bak-20260728-223756` before
    editing.
  - Registered `verify-changes.js` in the `SubagentStop` hook array, ahead of
    `validate-agent-output.js`, with a 300s timeout (real project checks —
    e.g. `npm test` — can run longer than the other hooks' 30s budget).
    Only the `hooks` block was touched.

- `~/.claude/scripts/` — mirrored `verify-changes.js` (new, chmod +x),
  `validate-agent-output.js`, `parallel-quality-gates.js`, `session-start.js`,
  `test-hooks-contract.js`.

## Quality Gates

- [x] All 5 touched/created `.js` files pass `node -c` syntax check
- [x] `node scripts/test-hooks-contract.js` — **37/37 checks passed**, exit 0
- [x] Manual smoke tests: `verify-changes.js` against garbage stdin, empty
      payload, and a real non-git tmp dir all exit 0 with zero bytes of output
- [x] `session-start.js` smoke test confirms the dynamic 14-agent roster reads
      correctly from `~/.claude/agents/`
- No typecheck/lint/test/build config exists for this repo itself (plain
  Node scripts, no `package.json` entries for those names) — nothing to run
  against my own changes via `verify-changes.js` other than the contract test.

## Scope Note (not fixed — out of my write scope)

`grep -rn "@validator"` still finds it described as a live gate in
`scripts/check-api-impact.js`, `scripts/analyze-prompt.js`,
`scripts/pre-push-check.js`, and `scripts/workflow-state.js`. None of these
four are in @builder-5's write scope (nor listed for any builder in this
sprint's write-scope table) — flagging for the orchestrator's coherence sweep;
likely Sprint 03 territory per the sprint's own Non-Goals list.

## Ready for @validator/@code-review

- [x] All changes complete within declared write scope
- [x] Hook contract test green
- [x] No `reports/**`, `plans/**`, `CHANGELOG.md`, `VERSION`, `CLAUDE.md`,
      `agents/**`, `skills/**`, or `docs/**` touched
