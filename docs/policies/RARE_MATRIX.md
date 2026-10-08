# RARE Responsibility Matrix

> **Defining who does what in CC_GodMode orchestration**

---

## RARE Definitions

| Role | Symbol | Description |
|------|--------|-------------|
| **Responsible** | **R** | Does the work. The agent that executes the task and produces the output. |
| **Accountable** | **A** | Owns the outcome. Makes final decisions and ensures quality. Only ONE per activity. |
| **Recommends** | **Re** | Provides input and expertise. Consulted for recommendations but doesn't execute. |
| **Executes** | **E** | Follows instructions. Performs specific sub-tasks as directed by Responsible agent. |

### Key Principles

1. **One Accountable per Activity** - Always exactly one A per row
2. **Responsible Does the Work** - R produces the deliverable
3. **Recommends Advises** - Re provides expertise without execution
4. **Executes Follows** - E performs directed sub-tasks
5. **Orchestrator Coordinates** - Never executes, only orchestrates

---

## Agent Responsibility Matrix

### Core Development Activities

@validator was dissolved in v8.7.0 (Sprint 02): its deterministic checks moved into a
post-`@builder` **hook** (not an agent, so it gets its own column below, not a RACI role — a
compiler result is a fact, not a delegated responsibility); its judgment part is pulled on
demand via `/code-review`. `@tester` now runs only when the sprint declares `ux_gate: auto`.

| Activity | Orchestrator | @architect | @api-guardian | @builder | Hook (deterministic) | @tester | @scribe | @github-manager |
|----------|--------------|------------|---------------|----------|----------------------|---------|---------|-----------------|
| **System Design** | A | R | Re | - | - | - | - | - |
| **API Design** | A | R | Re | - | - | - | - | - |
| **API Impact Analysis** | A | Re | R | - | - | - | - | - |
| **Consumer Discovery** | A | - | R | - | - | - | - | - |
| **Code Implementation** | A | Re | - | R | - | - | - | - |
| **Type Definitions** | A | Re | Re | R | - | - | - | - |
| **Unit Testing** | A | - | - | R | E | - | - | - |
| **Code Quality Check** | A | - | - | - | R | - | - | - |
| **Security Scan** | A | - | - | - | Re | - | - | - |
| **E2E Testing (opt-in)** | A | - | - | - | - | R | - | - |
| **Visual Regression (opt-in)** | A | - | - | - | - | R | - | - |
| **Accessibility Audit (opt-in)** | A | - | - | - | - | R | - | - |
| **Performance Testing (opt-in)** | A | - | - | - | - | R | - | - |
| **Documentation** | A | Re | - | - | - | - | R | - |
| **CHANGELOG Update** | A | - | - | - | - | - | R | - |
| **VERSION Update** | A | - | - | - | - | - | R | - |
| **PR Creation** | A | - | - | - | - | - | - | R |
| **Issue Processing** | A | - | - | - | - | - | - | R |
| **Release Management** | A | - | - | - | - | - | Re | R |

`@security` (optional gate) is not a table column here because it activates only on security
surfaces; when it runs, Security Scan becomes **R: @security, Re: Hook**.

### Legend

- **R** = Responsible (does the work)
- **A** = Accountable (owns outcome, makes decisions)
- **Re** = Recommends (provides expertise/input)
- **E** = Executes (performs sub-tasks as directed)
- **-** = Not involved

---

## Decision Type Assignments

### Architecture Decisions

| Decision Type | Primary Owner | Consulted | Informed |
|--------------|---------------|-----------|----------|
| Module structure | @architect | Orchestrator | @builder |
| API contracts | @architect | @api-guardian | @builder, @scribe |
| Technology choices | @architect | Orchestrator | All agents |
| Breaking changes | @architect | @api-guardian | All agents |
| Performance architecture | @architect | @tester | @builder |

### Implementation Decisions

| Decision Type | Primary Owner | Consulted | Informed |
|--------------|---------------|-----------|----------|
| Code patterns | @builder | @architect | Orchestrator |
| Test strategy | @builder | @tester (if `ux_gate: auto`) | - |
| Refactoring approach | @builder | @architect | Orchestrator |
| Error handling | @builder | @architect | Orchestrator |

### Quality Decisions

| Decision Type | Primary Owner | Consulted | Informed |
|--------------|---------------|-----------|----------|
| Code quality standards | Hook (deterministic) | @architect | @builder |
| Test coverage requirements | @builder | @tester (if `ux_gate: auto`) | Orchestrator |
| Security policies | @security | Orchestrator | All agents |
| Accessibility standards | @tester | @architect | @builder |
| Performance thresholds | @tester | @architect | @builder |
| Code judgment (on risk/doubt) | `/code-review` | Orchestrator | @builder |

### Documentation Decisions

| Decision Type | Primary Owner | Consulted | Informed |
|--------------|---------------|-----------|----------|
| Doc structure | @scribe | @architect | All agents |
| API documentation | @scribe | @api-guardian | @builder |
| CHANGELOG format | @scribe | Orchestrator | All agents |
| Version naming | @scribe | Orchestrator | All agents |

### Release Decisions

| Decision Type | Primary Owner | Consulted | Informed |
|--------------|---------------|-----------|----------|
| Release timing | @github-manager | Orchestrator | All agents |
| PR strategy | @github-manager | Orchestrator | @scribe |
| Issue triage | @github-manager | Orchestrator | Relevant agents |
| CI/CD configuration | @github-manager | @builder | All agents |

---

## Orchestrator Responsibilities

The Orchestrator (CLAUDE.md) has unique responsibilities that span all workflows:

### Coordination Responsibilities

| Responsibility | Description |
|----------------|-------------|
| **Workflow Selection** | Analyze user request, choose appropriate workflow |
| **Agent Sequencing** | Determine agent order based on dependencies |
| **Version Management** | Set target version before work starts |
| **Report Folder Creation** | Create `reports/vX.X.X/` for each workflow |
| **Gate Enforcement** | Ensure quality gates pass before proceeding |
| **Conflict Resolution** | Merge feedback when multiple agents have concerns |
| **Meta-Decision Application** | Apply override rules for special cases |

### Escalation Responsibilities

| Situation | Orchestrator Action |
|-----------|---------------------|
| Security concern detected | Escalate to @security, halt workflow |
| Breaking API change | Route through @api-guardian (mandatory) |
| Any applicable check fails (hook / @tester / @security / `/code-review`) | Merge feedback, return to @builder |
| MCP health check fails | Apply graceful degradation or halt |
| Ambiguous user request | Request clarification before proceeding |
| Judgment-class decision (architecture choice, design taste, malformed-request suspicion) | Mandatory human escalation — Responsible: @builder, Accountable: Orchestrator, Reviewed by: checks, Escalated to: User |

### Accountability Matrix

| Area | Orchestrator Role |
|------|-------------------|
| Workflow correctness | **Accountable** |
| Agent output quality | Monitors, agents are Responsible |
| Documentation completeness | Monitors, @scribe is Responsible |
| Version consistency | **Accountable** |
| Push permission | **Accountable** (must ask user) |

---

## Evidence-Matched Verification Diagram

```
                          @builder completes
                                  |
                                  v
                    +---------------------------+
                    |  Hook (deterministic)     |
                    |  always runs              |
                    | - TypeScript / lint       |
                    | - Unit Tests / build      |
                    | 0 context on success      |
                    +---------------------------+
                                  |
              +-------------------+-------------------+
              |                                       |
              v (if ux_gate: auto)                    v (if security surface)
    +------------------+                   +------------------+
    |     @tester      |                   |     @security    |
    |------------------|                   |------------------|
    | R: UX Quality    |                   | R: Security Scan |
    | - E2E Tests      |                   | - Secrets/Auth   |
    | - Visual Match   |                   | - Injection      |
    | - A11y           |                   | - Dependencies   |
    | - Performance    |                   +------------------+
    +------------------+
              |                                       |
              v                                       v
    +------------------+                   +------------------+
    | APPROVED/BLOCKED |                   | APPROVED/BLOCKED |
    +------------------+                   +------------------+
              |                                       |
              +-------------------+-------------------+
                                  |
                    (risk or doubt on code judgment?)
                                  v
                          pull /code-review
                                  |
                                  v
                    +---------------------------+
                    |      SYNC POINT           |
                    | Orchestrator coordinates  |
                    +---------------------------+
                                  |
              +-------------------+-------------------+
              |                   |                   |
              v                   v                   v
     All APPROVED         One BLOCKED          Multiple BLOCKED
              |                   |                   |
              v                   v                   v
         @scribe           @builder              @builder
                       (single concern)      (merged feedback)
```

### Decision Matrix Detail

| Hook Result | @tester Result (if run) | @security Result (if run) | Orchestrator Action | Responsibility |
|-------------|--------------------------|-----------------------------|---------------------|----------------|
| PASS | APPROVED / n.a. | APPROVED / n.a. | Proceed to @scribe | @scribe: R, Orchestrator: A |
| PASS | BLOCKED | any | Return to @builder with tester feedback | @builder: R, @tester: Re |
| PASS | any | BLOCKED | Return to @builder with security feedback | @builder: R, @security: Re |
| FAIL | any | any | Return to @builder with hook output | @builder: R, Hook: Re |

---

## Workflow-Specific RARE Assignments

### Feature Workflow

```
User Request
     |
     v
@architect (R: Design, A: Orchestrator)
     |
     v
@builder (R: Implementation, A: Orchestrator)
     |
     +---> Hook (R: Code Quality, always) --+
     |                                       |
     +---> @tester (R: UX Quality, if ux_gate: auto) --+
                                             |
                                             v
                                    @scribe (R: Documentation)
```

### API Change Workflow

```
User Request
     |
     v
@architect (R: API Design, A: Orchestrator)
     |
     v
@api-guardian (R: Impact Analysis, A: Orchestrator)  <-- MANDATORY
     |
     v
@builder (R: Implementation, A: Orchestrator)
     |
     +---> Hook (R: Code Quality + Consumer regression, always) --+
     |                                                             |
     +---> @tester (R: UX Quality, if ux_gate: auto) -------------+
                                                       |
                                                       v
                                              @scribe (R: Documentation)
```

### Bug Fix Workflow

```
User Request
     |
     v
@builder (R: Fix Implementation, A: Orchestrator)
     |
     +---> Hook (R: Regression Check, always) --+
     |                                           |
     +---> @tester (R: Fix Verification, if ux_gate: auto) --+
                                               |
                                               v
                                           (Complete)
```

---

## Updating This Matrix

When to update:
- New agent added
- Agent responsibilities change
- New workflow introduced
- Decision type ownership changes

Update process:
1. Propose changes via @architect
2. Update this document
3. Update CLAUDE.md if workflow affected
4. Create ADR entry in DECISIONS.md

---

*Document Version: 1.0.0 (v5.8.0)*
