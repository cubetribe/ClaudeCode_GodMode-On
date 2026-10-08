---
name: quality-gates
description: "Verification-matches-the-evidence gate model after @builder — deterministic hook always, @tester only when the sprint declared ux_gate: auto, @security on security surfaces, /code-review on risk or doubt"
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
---

# Quality Gates (Verification Matches the Evidence)

After @builder completes, "checks" means, per Core Rule 5:

1. **Deterministic checks — always.** Typecheck, lint, tests, build, run by hook. A
   compiler result is a fact, not a second opinion, and it costs no context when it
   passes.
2. **UX gate — when the sprint declared `ux_gate: auto`.** @tester.
3. **Security gate — on security surfaces.** @security (auth code, secrets handling,
   `.github/workflows/`).
4. **Review pass — on risk or doubt.** Pull the `/code-review` skill. No standing
   agent re-reads the same diff.

Whichever of 2–4 apply run in **PARALLEL**:
- All APPROVED -> continue to @scribe
- Any BLOCKED -> back to @builder with merged feedback

## Execution Pattern

```
                    @builder completes
                           │
                 ┌─────────┴──────────┐
                 ▼                    ▼
        ┌─────────────────┐   (parallel, only if applicable)
        │ Deterministic    │   ┌──────────┐ ┌───────────┐ ┌──────────────┐
        │ hook (always)    │   │ @tester  │ │ @security │ │ /code-review │
        │ typecheck/lint/  │   │ if       │ │ if        │ │ if risk or   │
        │ tests/build      │   │ ux_gate: │ │ security  │ │ doubt        │
        │ 0 bytes on pass  │   │ auto     │ │ surface   │ │              │
        └────────┬─────────┘   └────┬─────┘ └─────┬─────┘ └──────┬───────┘
                 │                  │              │               │
                 └──────────────────┴──────────────┴───────────────┘
                                     SYNC POINT
                                         │
                              Apply Decision Matrix
```

## Decision Matrix

Every gate that ran for this sprint MUST report before the matrix applies:

| Deterministic hook | @tester (if run) | @security (if run) | /code-review (if run) | NEXT ACTION |
|---|---|---|---|---|
| PASS | APPROVED/skip | APPROVED/skip | APPROVED/skip | **PROCEED** to @scribe |
| FAIL | — | — | — | **RETURN** to @builder with hook output |
| PASS | BLOCKED | any | any | **RETURN** to @builder (with @tester feedback) |
| PASS | any | BLOCKED | any | **RETURN** to @builder (with @security feedback) |
| PASS | any | any | BLOCKED | **RETURN** to @builder (with review feedback) |
| PASS | multiple BLOCKED | | | **RETURN** to @builder with MERGED feedback |

**Rules:**
- You MUST wait for every gate that applies to this sprint before deciding.
- @scribe can ONLY be called when every gate that ran is APPROVED (or the hook passed
  and no other gate applied).
- If ANY gate is BLOCKED → back to @builder with specific feedback.
- Escalation follows `docs/orchestrator/META-DECISIONS.md`'s Tier 1 self-resolution:
  max 2 attempts, same agent, same scope, before Tier 2 (orchestrator resolution).

## Deterministic Hook (Always)

| Check | Tool | Blocking? |
|-------|------|----------|
| TypeScript / language compilation | `npx tsc --noEmit` (or project equivalent) | YES |
| Unit tests pass | `npm test` (or project equivalent) | YES |
| Build succeeds | project build command | YES |
| Code style / linting | `npm run lint` | NO (warning only) |

Runs via hook, not a subagent — a compiler or test runner result is a fact, not a
second opinion. Emits 0 bytes of context on success; output only on failure.
Project-detection is required: the hook must recognize what kind of project it is
running in (Node/TS, Swift, Flutter, other) and pass through cleanly on unknown
project types instead of blocking.

## @tester Gate (when `ux_gate: auto`)

Runs only when the sprint frontmatter declares `ux_gate: auto` (see
`docs/templates/SPRINT_TEMPLATE.md`). Default is `human`; `skip` when the write
scope has no UI paths. If the `playwright` MCP is unreachable, the sprint falls
back to `human` and logs it — it does not block.

| Check | Tool | Blocking? |
|-------|------|----------|
| E2E tests pass | Playwright MCP | YES |
| Screenshots at 3 viewports | Playwright MCP | YES |
| Console errors captured | Browser console | YES (errors only) |
| WCAG 2.1 AA compliance | a11y checks | YES |
| Core Web Vitals | LCP, CLS, INP, FCP | NO (warning if poor) |

**Screenshot viewports:** 375×667 (mobile), 768×1024 (tablet), 1920×1080 (desktop).

**Minimum output:** 800 characters
**Required sections:** Summary, Screenshots Table, Console Errors, Performance Metrics, Verdict

## @security Gate (on security surfaces)

Runs on auth code, secrets handling, `.github/workflows/`, and other
security-sensitive surfaces flagged by the sprint's risk signals. Opens evidence
@builder did not have (threat-modeling read of the diff), so it stays a model pass,
not a hook.

## Review Pass (`/code-review`, on risk or doubt)

Pulled on demand when risk or doubt about code judgment warrants a second read of
the diff — never as a standing agent. This is the replacement for the judgment
portion of the former @validator: a compiler is a fact, but naming, structure, and
maintainability calls need a model pass, invoked only when it is worth the cost.

Judgment-class decisions (architecture choice between valid alternatives, design
taste, malformed-request suspicion) remain mandatory human escalations regardless
of how many of the gates above pass — see
`docs/orchestrator/QUALITY-GATES.md` for the full decision matrix. Unanimous
agreement among same-tier agents on a judgment question is correlated evidence, not
independent evidence, and does not waive the human escalation.

## Fail-Safe (Graceful Degradation)

If a gate agent crashes (MCP failure, timeout):

1. **Full Report** — Normal operation, all checks pass
2. **Partial Report** — Some checks completed, others failed/timed out
3. **Failure Report** — Agent crashed, structured error output

Failure report includes: error type, suggested action (retry/escalate/skip), completion percentage.

## Agent Return Contract

Each agent that ran writes a **full report** to
`reports/vX.Y.Z/sprint-NN/<NN>-<agent>-report.md` (canonical numbering:
`docs/templates/REPORT_TEMPLATES.md`) if it holds `Write`; read-only agents return
their verdict and whoever dispatched them persists it. The return message to the
Orchestrator is the structured verdict only — separate from the on-disk report.

```
STATUS: APPROVED | BLOCKED | DONE
- finding 1 (one line max)
- finding 2
- finding 3
report: <absolute path to full report>
```

**Important:** `scripts/validate-agent-output.js` enforces min-length on the
**file**, not the return message, for agents that still hold `Write`. This
contract does not change validation behavior.

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
