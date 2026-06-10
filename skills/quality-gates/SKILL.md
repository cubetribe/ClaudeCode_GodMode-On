---
name: quality-gates
description: "Parallel quality gate orchestration — @validator and @tester run simultaneously after @builder, with mandatory decision matrix for pass/fail routing"
---

# Quality Gates (Parallel Execution)

After @builder completes, BOTH quality gates run **simultaneously**.

## Parallel Execution Pattern

```
                    @builder completes
                           │
           ┌───────────────┴───────────────┐
           ▼                               ▼
    ┌─────────────┐                 ┌─────────────┐
    │ @validator  │                 │  @tester    │
    │ Code Quality│                 │ UX Quality  │
    ├─────────────┤                 ├─────────────┤
    │ ✓ TypeScript│                 │ ✓ E2E Tests │
    │ ✓ Unit Tests│                 │ ✓ Screenshots│
    │ ✓ Security  │                 │ ✓ A11y      │
    │ ✓ Consumers │                 │ ✓ Perf      │
    └──────┬──────┘                 └──────┬──────┘
           │                               │
           └───────────────┬───────────────┘
                      SYNC POINT
                           │
                   Apply Decision Matrix
```

## Decision Matrix (MANDATORY)

Both agents MUST complete before applying this matrix:

| @validator | @tester | NEXT ACTION |
|------------|---------|-------------|
| ✅ APPROVED | ✅ APPROVED | **PROCEED** to @scribe |
| ✅ APPROVED | 🔴 BLOCKED | **RETURN** to @builder (with @tester feedback) |
| 🔴 BLOCKED | ✅ APPROVED | **RETURN** to @builder (with @validator feedback) |
| 🔴 BLOCKED | 🔴 BLOCKED | **RETURN** to @builder (with MERGED feedback from both) |

**Rules:**
- You MUST wait for ALL active agents before deciding
- @scribe can ONLY be called when ALL active gates are APPROVED
- If ANY gate is BLOCKED → back to @builder with specific feedback
- Maximum 3 retry cycles before escalation to user

## Optional Third Gate: @security

For security-sensitive changes, `@security` runs as a **third parallel gate** alongside
@validator and @tester. It is activated by the `meta-decisions` skill `securityOverride`
rule (keywords: auth, jwt, token, password, encrypt, session, secret, credential) or for
any auth/credential-touching API change.

```
                    @builder completes
                           │
        ┌──────────────────┼──────────────────┐
        ▼                  ▼                  ▼
  ┌───────────┐     ┌───────────┐     ┌───────────┐
  │ @validator│     │  @tester  │     │ @security │  ← only when security-sensitive
  └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
        └──────────────────┼──────────────────┘
                      SYNC POINT
```

When active, @security joins the decision matrix: **any Critical or High finding →
BLOCKED → return to @builder**. Medium/Low findings pass as APPROVED-with-notes.
@scribe runs only when @validator, @tester, **and** @security (if active) are all green.

## @validator Checks (Code Quality)

| Check | Tool | Blocking? |
|-------|------|----------|
| TypeScript compilation | `npx tsc --noEmit` | YES |
| Unit tests pass | `npm test` | YES |
| No security vulnerabilities | Static analysis | YES |
| Consumer impact verified | Type-check consumers | YES if API change |
| Code style / linting | `npm run lint` | NO (warning only) |

**Minimum output:** 400 characters
**Required sections:** Summary, Checks Performed, Issues Found, Verdict

## @tester Checks (UX Quality)

| Check | Tool | Blocking? |
|-------|------|----------|
| E2E tests pass | Playwright MCP | YES |
| Screenshots at 3 viewports | Playwright MCP | YES |
| Console errors captured | Browser console | YES (errors only) |
| WCAG 2.1 AA compliance | a11y checks | YES |
| Core Web Vitals | LCP, CLS, INP, FCP | NO (warning if poor) |

**Screenshot viewports:**
- Mobile: 375px
- Tablet: 768px
- Desktop: 1920px

**Minimum output:** 800 characters
**Required sections:** Summary, Screenshots Table, Console Errors, Performance Metrics, Verdict

## Execution with Worktree Isolation

For conflict-free parallel execution, use `isolation: worktree`:

```
Task tool → subagent_type: "validator", isolation: "worktree"
Task tool → subagent_type: "tester", isolation: "worktree"
```

Both agents get their own git worktree — no file conflicts possible.

## Performance

| Mode | Duration | Improvement |
|------|----------|-------------|
| Sequential | 8–12 min | baseline |
| Parallel | 5–7 min | **40% faster** |
| Parallel + Worktree | 5–7 min | **40% faster + zero conflicts** |

## Fail-Safe (Graceful Degradation)

If an agent crashes (MCP failure, timeout):

1. **Full Report** — Normal operation, all checks pass
2. **Partial Report** — Some checks completed, others failed/timed out
3. **Failure Report** — Agent crashed, structured error output

Failure report includes: error type, suggested action (retry/escalate/skip), completion percentage.