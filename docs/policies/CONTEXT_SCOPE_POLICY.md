# Context Scope Policy

**Version:** v5.7.0
**Last Updated:** 2026-01-08
**Status:** Enforced

---

## Overview

This policy defines **what is in scope** and **what is out of scope** for each CC_GodMode agent. Clear boundaries prevent scope creep, enable efficient context window management, and ensure clean handoffs between agents.

**Key Principles:**
- Each agent has a **single responsibility**
- Agents **never** perform work assigned to other agents
- Handoffs are **explicit** and **documented**
- Escalation to the orchestrator is **always allowed**

---

## 1. In-Scope Definitions

### @architect
**Primary Responsibility:** System design and high-level architectural decisions

**In Scope:**
- API design and endpoint structure
- Module organization and file placement
- Technology stack selection and rationale
- Data flow architecture
- Integration point identification
- Risk assessment and mitigation strategies
- Implementation phase planning
- Architectural decision records (ADRs)

**Out of Scope:**
- Writing production code (that's @builder)
- API consumer discovery (that's @api-guardian)
- Code quality validation (that's @validator)
- Documentation writing (that's @scribe)

**Context Window Focus:**
- Project requirements
- Existing architecture patterns
- Technology constraints
- Team expertise levels

---

### @api-guardian
**Primary Responsibility:** API lifecycle management and breaking change detection

**In Scope:**
- Detecting API changes in commits
- Identifying all API consumers (files that import/use the API)
- Classifying changes as breaking/non-breaking
- Creating migration checklists
- Documenting impact scope (number of consumers affected)
- Recommending versioning strategies

**Out of Scope:**
- Implementing the API changes (that's @builder)
- Validating consumer code quality (that's @validator)
- Creating documentation (that's @scribe)
- Deciding API design (that's @architect)

**Context Window Focus:**
- Changed API files (diffs)
- Project file tree structure
- Import/dependency graphs
- Existing API documentation

---

### @builder
**Primary Responsibility:** Code implementation according to specifications

**In Scope:**
- Writing production code (TypeScript/JavaScript/React)
- Creating unit tests
- Running quality gates (typecheck, test, lint)
- Implementing exactly what @architect specified
- Updating consumers when directed by @api-guardian
- Following existing code patterns and standards

**Out of Scope:**
- Making architectural decisions (that's @architect)
- Finding API consumers (that's @api-guardian)
- Cross-file validation (that's @validator)
- Writing documentation (that's @scribe)
- Creating PRs (that's @github-manager)

**Context Window Focus:**
- Architecture specification from @architect
- Consumer list from @api-guardian (if API change)
- Existing code in files being modified
- Test examples for reference

---

### @validator
**Primary Responsibility:** Code quality gate validation

**In Scope:**
- Running TypeScript compilation checks
- Executing unit tests and checking coverage
- Security vulnerability scanning
- Code standards validation (naming, patterns, no-console, etc.)
- Consumer validation (for API changes)
- Cross-file consistency checking
- Issuing APPROVED or BLOCKED decision

**Out of Scope:**
- Implementing fixes (that's @builder)
- Making architectural decisions (that's @architect)
- UX testing (that's @tester)
- Writing documentation (that's @scribe)

**Context Window Focus:**
- All files changed in current feature
- Related consumer files
- Test results and coverage reports
- Lint and type check outputs

---

### @tester
**Primary Responsibility:** UX quality gate validation

**In Scope:**
- Running E2E tests (Playwright)
- Visual regression testing (screenshots)
- Accessibility audits (WCAG 2.1 AA)
- Performance testing (Core Web Vitals)
- Issuing APPROVED or BLOCKED decision
- Documenting UX issues with screenshots

**Out of Scope:**
- Writing E2E tests (that's @builder)
- Code quality validation (that's @validator)
- Implementing fixes (that's @builder)
- Creating documentation (that's @scribe)

**Context Window Focus:**
- Feature requirements
- Affected UI components
- Test results and screenshots
- Performance metrics

**MCP Requirements:**
- Playwright MCP (required)
- Lighthouse MCP (optional, for performance)
- A11y MCP (optional, for accessibility)

---

### @scribe
**Primary Responsibility:** Documentation and changelog maintenance

**In Scope:**
- Updating VERSION file
- Writing CHANGELOG.md entries
- Updating README.md when needed
- Creating API documentation
- Maintaining developer guides
- Version number management

**Out of Scope:**
- Writing code (that's @builder)
- Making architectural decisions (that's @architect)
- Creating PRs (that's @github-manager)
- Validation work (that's @validator/@tester)

**Context Window Focus:**
- All agent reports from current workflow
- Existing CHANGELOG entries
- Current VERSION file
- Documentation files needing updates

---

### @github-manager
**Primary Responsibility:** GitHub operations (Issues, PRs, Releases)

**In Scope:**
- Creating pull requests
- Managing GitHub issues
- Publishing releases
- Linking PRs to issues (Fixes #N)
- CI/CD coordination
- Branch management

**Out of Scope:**
- Writing code (that's @builder)
- Writing documentation (that's @scribe)
- Validation work (that's @validator/@tester)
- Pushing without permission (always ask user!)

**Context Window Focus:**
- Current git status
- Issue/PR metadata
- Release notes from @scribe
- GitHub API responses

**MCP Requirements:**
- GitHub MCP (required)

---

## 2. Context Window Management

### Budget Allocation

**Token Budget:** 200K+ tokens (alias `sonnet` → Sonnet 4.6; `opus`/`best` → Opus 4.8, 1M context)

**Recommended Allocation by Agent:**
- @architect: 30-40% (needs broad context for design decisions)
- @api-guardian: 20-30% (needs file tree and import graphs)
- @builder: 20-30% (needs specs and code files)
- @validator: 15-20% (needs changed files and test results)
- @tester: 15-20% (needs test results and screenshots)
- @scribe: 10-15% (needs agent reports)
- @github-manager: 5-10% (needs metadata only)

### Context Optimization Strategies

**1. Read Only What You Need**
- @architect: Don't read implementation code, only existing patterns
- @builder: Don't read unrelated files, only what you're changing
- @validator: Don't re-read specs, only code and test outputs
- @tester: Don't read code, only test results and screenshots

**2. Use Compact Representations**
- File lists instead of full file contents
- Diffs instead of complete files
- Summary outputs instead of verbose logs
- Grep results instead of full file searches

**3. Progressive Loading**
- Start with overview (file tree, git status)
- Load specific files only when needed
- Use Grep to find patterns before reading entire files

**4. Offload to Reports**
- Agents write reports to disk, not in chat
- Next agent reads report file, not chat history
- Orchestrator coordinates via report paths

---

## 3. Handoff Boundaries

### Explicit Handoff Protocol

Each agent MUST end their report with an explicit handoff section:

**Example (@architect to @builder):**
```markdown
## HANDOFF TO @builder

### Implementation Checklist
- [ ] Create src/auth/AuthService.ts
- [ ] Create src/auth/types.ts
- [ ] Update src/App.tsx to integrate AuthService

### Critical Constraints
- Must use JWT tokens (not sessions)
- Token expiry: 24 hours
- Refresh token rotation required

### Success Criteria
- All TypeScript compiles
- Unit tests pass
- No console errors
```

**Example (@builder to @validator + @tester):**
```markdown
## HANDOFF TO @validator + @tester

Implementation complete. Ready for parallel quality gates.

### Changed Files
- src/auth/AuthService.ts (new)
- src/auth/types.ts (new)
- src/App.tsx (modified)

### Test Coverage
- Unit tests: src/auth/AuthService.test.ts
- E2E tests: tests/auth/login.spec.ts
```

### Handoff Chain

```
User → @architect → @builder → @validator ┐
                                           ├─→ @scribe → @github-manager
                                @tester ┘
```

**Critical Rule:** No agent may skip their designated role. If work is not needed for a specific agent, they should produce a minimal report stating "No work required for this workflow" and pass to the next agent.

---

## 4. Escalation Rules

### When to Escalate to Orchestrator

**Any agent should escalate when:**

1. **Ambiguity in Requirements**
   - Specifications are unclear
   - Multiple valid interpretations exist
   - User input is needed

2. **Scope Boundary Violation**
   - Another agent's work is required first
   - Out-of-scope decision needs to be made
   - Context suggests wrong workflow was selected

3. **Resource Limitations**
   - Context window approaching limit (>80%)
   - Required MCP server is unavailable
   - Required files are inaccessible

4. **Quality Gate Failure**
   - Tests fail after implementation
   - TypeScript won't compile
   - E2E tests are broken

5. **Dependency Blocking**
   - External API is down
   - Required package is missing
   - Build tool failure

### Escalation Format

```markdown
## ⚠️ ESCALATION TO ORCHESTRATOR

**Reason:** [Brief description]

**Category:** [Ambiguity|Scope|Resource|Failure|Dependency]

**Details:**
[Detailed explanation of the issue]

**Recommendation:**
[Suggested next steps]

**Blocking:** [Yes|No]
```

### Orchestrator Response

The orchestrator will:
1. Analyze the escalation
2. Decide if user input is needed
3. Adjust workflow if necessary
4. Provide clarification or resources
5. Resume workflow at appropriate agent

---

## 5. Context Window Warning Thresholds

**Monitoring:**
Agents should be aware of their context usage and warn when approaching limits.

**Thresholds:**
- **50% used:** Continue normally
- **70% used:** Start optimizing context (use summaries, offload to files)
- **80% used:** Warning - consider using `/compact`
- **90% used:** Critical - must use `/compact` or split work
- **95% used:** Emergency - escalate to orchestrator

**Response Actions:**

**At 70%:**
- Write intermediate results to disk
- Use grep instead of reading full files
- Summarize previous context

**At 80%:**
- Recommend `/compact` to orchestrator
- Offload all non-critical context
- Focus only on current task

**At 90%:**
- Mandatory `/compact` or workflow split
- Create checkpoint report
- Resume from clean context

**At 95%:**
- Escalate immediately
- Cannot proceed safely
- Risk of context truncation

---

## 6. Cross-Agent Coordination

### Parallel Execution (@validator + @tester)

**Context Isolation:**
- Each agent has independent context
- No shared state during execution
- Reports saved to separate files

**Synchronization Point:**
- Both agents complete independently
- Orchestrator reads both reports
- Decision matrix applied:
  - BOTH APPROVED → proceed to @scribe
  - ANY BLOCKED → return to @builder

**Context Handoff:**
- If blocked, feedback from BOTH agents sent to @builder
- @builder receives merged feedback in single message
- No need to re-read both full reports

---

## 7. Best Practices

### For Agents

1. **Stay in Lane**
   - Only do work assigned to your role
   - Escalate if unclear
   - Never make decisions for other agents

2. **Explicit Handoffs**
   - Always include handoff section in report
   - List exactly what next agent needs
   - Provide clear success criteria

3. **Context Efficiency**
   - Read only what you need
   - Write summaries instead of raw data
   - Offload large outputs to files

4. **Monitor Usage**
   - Be aware of context window usage
   - Warn at 80% threshold
   - Escalate at 90%

### For Orchestrator

1. **Workflow Selection**
   - Choose correct workflow based on task type
   - Validate MCP availability before starting
   - Announce workflow and version at start

2. **Context Management**
   - Monitor total context across workflow
   - Trigger `/compact` proactively
   - Split long workflows if needed

3. **Escalation Handling**
   - Respond to escalations quickly
   - Provide clear guidance
   - Adjust workflow if needed

4. **Quality Assurance**
   - Validate agent outputs meet templates
   - Ensure handoffs are explicit
   - Verify all gates are executed

---

## 8. Enforcement

This policy is enforced through:

1. **Agent Prompts** - Each agent's CLAUDE.md includes scope definitions
2. **Validation Hooks** - SubagentStop hook checks for out-of-scope work
3. **Orchestrator Monitoring** - Orchestrator validates workflow adherence
4. **Report Templates** - Required sections enforce scope boundaries

**Violations:**
- Agents performing out-of-scope work
- Skipped handoffs or missing reports
- Quality gates bypassed

**Response:**
- Warning to agent
- Workflow restart from correct agent
- Escalation to orchestrator

---

## Version History

- **v5.7.0** - Initial context scope policy formalization
- **v5.6.0** - Foundation (parallel quality gates, agent validation)

---

**See Also:**
- `docs/templates/REPORT_TEMPLATES.md` - Required output formats
- `docs/policies/SECURITY_TOOLING_POLICY.md` - Tool access controls
- `CLAUDE.md` - Orchestrator workflow definitions
