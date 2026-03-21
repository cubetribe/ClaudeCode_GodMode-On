# CC_GodMode Quality Gates (Parallel Execution)

## Overview

After @builder completes, BOTH quality gates run simultaneously for faster validation.

```
@builder
    |
    +------------------+
    |                  |
    v                  v
@validator        @tester
(Code Quality)    (UX Quality)
    |                  |
    +--------+---------+
             |
        SYNC POINT
             |
    +--------+--------+
    |                 |
BOTH APPROVED     ANY BLOCKED
    |                 |
    v                 v
@scribe          @builder
              (fix & retry)
```

## Decision Matrix

| @validator | @tester | Action |
|------------|---------|--------|
| APPROVED | APPROVED | --> @scribe |
| APPROVED | BLOCKED | --> @builder (tester concerns) |
| BLOCKED | APPROVED | --> @builder (code concerns) |
| BLOCKED | BLOCKED | --> @builder (merged feedback) |

## Execution Pattern

Use parallel Task tool calls to run both agents simultaneously:
1. Launch @validator and @tester in parallel using Task tool
2. Wait for both to complete
3. Apply Decision Matrix above
4. If both blocked: merge feedback into single @builder instruction

## Gate 1: @validator (Code Quality)

- TypeScript compiles (`tsc --noEmit`)
- Unit tests pass
- No security issues
- All consumers updated (for API changes)

## Gate 2: @tester (UX Quality)

- E2E tests pass
- Screenshots at 3 viewports (mobile, tablet, desktop)
- A11y compliant (WCAG 2.1 AA)
- Performance OK (Core Web Vitals: LCP, CLS, INP, FCP)
- Console errors captured and reported
