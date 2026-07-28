# Agent Report Templates

**Last Updated:** 2026-07-28 (v8.7.0 sprint 02 — @validator dissolved into deterministic hook + opt-in @tester, `ux_gate` gate)
**Validation:** Enforced by `scripts/validate-agent-output.js`

> **This document is the CANONICAL definition** of the return verdict, the report numbering,
> and the sprint contract blocks. Agent files and orchestrator docs reference it — they must
> not carry diverging copies.

---

## Orchestrator Return Verdict (separate from the on-disk report)

Each agent saves a **full report** to disk and returns only a structured verdict to the Orchestrator. These are two distinct outputs.

**Verdict shape (identical for ALL 14 agents, including department agents):**
```
STATUS: APPROVED | BLOCKED | DONE
- finding 1 (one line max)
- finding 2
- finding 3
report: <absolute path to full report>
```

**Rules:**
- Maximum 3 bullet findings in the verdict.
- `STATUS: APPROVED` — gate agents only (@tester, @security): work passed; proceed.
- `STATUS: DONE` — non-gate agents: task completed.
- `STATUS: BLOCKED` — any agent, always with a reason category in parentheses:
  - `BLOCKED (scope)` — the task requires writing outside the agent's assigned write scope.
  - `BLOCKED (conflict)` — foreign/uncommitted changes detected in the assigned scope; another agent or sprint may be editing the same files. Never overwrite — stop and report.
  - `BLOCKED (quality)` — gate failure, missing inputs, or unresolvable errors (details in report).
  - Legacy `FAILED`/`PARTIAL` statuses are retired: report them as `BLOCKED (quality)` with the partial results documented in the on-disk report.
- The Orchestrator opens the full report **only on BLOCKED** or when explicitly needed.
- Validation (`scripts/validate-agent-output.js`) checks the **on-disk file's content coverage**, not the verdict, and carries no minimum-length threshold (see "Length calibration, not length minimums" below).

## Canonical Report Paths & Numbering

Reports are **TRACKED repo artifacts** (maintainer rule, 2026-07-06): every agent AND every
subagent/swarm writes its report into the repo — never into `/tmp` or session scratch dirs,
which vanish on interruption. Reports are committed at sprint integration; the sprint file
(`plans/vX.Y.Z/sprint-NN-*.md`, `Result` section) is the condensed summary. Within a sprint:

```
reports/vX.Y.Z/sprint-NN/<prefix>-<agent>-report.md
```

| Prefix | Agent |
|---|---|
| 00 | researcher |
| 01 | architect (also used for the Orchestrator's inline arch brief) |
| 02 | api-guardian |
| 03 | builder |
| 04 | tester (was validator through v8.6; retired — folded into the deterministic hook, see Core Rule 8/5) |
| 05 | security |
| 06 | scribe |
| 07 | github-manager |
| — | department agents: `<agent-name>-report.md` (unnumbered) |

Rules:
- One folder per sprint — parallel sprints can never overwrite each other's reports.
- Re-runs within a sprint (e.g. builder fix loops) append `-r2`, `-r3` … instead of overwriting.
- Single-task work without a plan uses `sprint-00`.
- **Subagents/swarms:** an agent that spawns subagents is responsible for persisting their
  results as `<prefix>-<agent>-<subtask-slug>-report.md` in the same sprint folder (repo path,
  absolute). Temp-dir output does not count as a report.
- **Frontmatter is mandatory** (agent, date, task, status) and reports that change files must
  list them under a `## Files Changed` section — this is the "who/what/when" record.
- **Report authorship is gated by tool access.** Only agents holding `Write`
  (@architect, @builder, @researcher, @scribe) write the on-disk report themselves. Every other
  agent — @api-guardian, @tester, @security, @github-manager, @ci-security-guardian, and the four
  read-only department agents (@docs-dx, @quality-operations, @workflow-design,
  @workspace-governance) — returns only the verdict defined above; whoever dispatched it
  (Orchestrator or a spawning agent) persists that verdict as the report file at the canonical
  path, using the relevant template below for shape. No agent is held to a report obligation its
  tool set cannot fulfill.

## Sprint Contract (referenced by every agent file)

Every agent follows these four blocks; agent files state role-specific specializations only:

1. **Context intake** — read the assigned sprint file first (goal, scope, non-goals, acceptance
   criteria, write-scope table are binding), then the role-specific inputs listed in the agent file.
2. **Write scope** — write only the paths assigned in the sprint file plus the own report path
   (Write-holders only — see the report-authorship rule above; read-only agents have no file
   write scope beyond their verdict). `VERSION`, `CHANGELOG.md`, `ROADMAP.md`, and `plans/**` are
   release/orchestrator artifacts: no agent writes them except @scribe (CHANGELOG `[Unreleased]`
   entries at sprint integration, release promotion via `scripts/version-bump.js`). Outside scope
   ⇒ `STATUS: BLOCKED (scope)`.
3. **Conflict detection** — before writing, check `git status`/`git diff` for the assigned paths;
   foreign modifications ⇒ `STATUS: BLOCKED (conflict)` listing the conflicting paths.
4. **Return verdict** — exactly the shape defined above.

---

## Overview

This document defines standardized report templates for all 14 CC_GodMode agents (7 core + 1
security gate + 6 department). Each template includes:
- **Frontmatter Schema** - YAML metadata for machine-readable parsing
- **Required Sections** - Core content blocks that must be present
- **Required Patterns** - Critical regex patterns for validation
- **Length Calibration** - Content coverage guidance, not a character-count floor

Reports are validated automatically via the **SubagentStop Hook** which enforces these standards.

---

## Frontmatter Schema (YAML)

All agent reports MUST start with YAML frontmatter in this format:

```yaml
---
agent: [agent-name]
version: [version-number]
date: [YYYY-MM-DD]
status: [draft|complete|approved|blocked]
task: [brief task description]
---
```

**Example:**
```yaml
---
agent: architect
version: v5.7.0
date: 2026-01-08
status: complete
task: Design authentication system architecture
---
```

---

## 1. @architect Report Template

**Purpose:** High-level system design and architectural decisions

**Validation Rules:**
- Required sections: Architectural Decisions, Implementation Strategy, Risk Assessment, Handoff
- Required patterns: `## ARCHITECTURAL DECISIONS`, `## IMPLEMENTATION`, `## RISK`
- Length calibration: cover every section below with real content; do not pad with filler
  bullets, restated goals, or boilerplate to hit a word count.

**Template:**

```markdown
---
agent: architect
version: [VERSION]
date: [DATE]
status: complete
task: [TASK_DESCRIPTION]
---

# Architectural Plan: [FEATURE_NAME]

## ARCHITECTURAL DECISIONS

### Design Approach
[Overall architectural strategy and rationale]

### Module Structure
[Component organization and responsibilities]

### Technology Choices
[Frameworks, libraries, patterns selected and why]

### Data Flow
[How information moves through the system]

### Integration Points
[External dependencies and interfaces]

## IMPLEMENTATION STRATEGY

### Phase 1: [Phase Name]
- Step 1: [Description]
- Step 2: [Description]

### Phase 2: [Phase Name]
- Step 1: [Description]
- Step 2: [Description]

### Dependencies
- [Dependency 1]: [Why needed]
- [Dependency 2]: [Why needed]

## RISK ASSESSMENT

### High Risk
- **[Risk Name]**: [Description and mitigation]

### Medium Risk
- **[Risk Name]**: [Description and mitigation]

### Low Risk
- **[Risk Name]**: [Description and mitigation]

## HANDOFF TO @builder

### Implementation Checklist
- [ ] Task 1
- [ ] Task 2
- [ ] Task 3

### Critical Constraints
- [Constraint 1]
- [Constraint 2]

### Success Criteria
- [Criterion 1]
- [Criterion 2]
```

---

## 1a. Inline Architecture Brief (Orchestrator-written variant)

**Purpose:** Smart Routing's lightweight substitute for the full @architect report on
small/medium tasks (`skills/cost-efficiency/SKILL.md` — Architecture Gate Split). This
does NOT replace or weaken the full @architect template above; it is a distinct,
narrower artifact the Orchestrator itself writes when @architect is not invoked.

**Validation Rules:**
- Stays 3–5 bullets total (cost-efficiency spirit) — but ALL five required-field labels
  below MUST be present as bullet labels. Missing any field ⇒ brief invalid ⇒ invoke
  @architect instead of proceeding.
- Saved to the same canonical path as the full template: `reports/vX.Y.Z/sprint-NN/01-architect-report.md`.
- For implicit sprints (no sprint file), the Routing Log line goes in this report's
  frontmatter/header instead of a sprint-file section (see `docs/templates/SPRINT_TEMPLATE.md`).

**Template:**

```markdown
---
agent: orchestrator-inline
version: [VERSION]
date: [DATE]
status: complete
task: [TASK_DESCRIPTION]
---

# Inline Architecture Brief: [FEATURE_NAME]

- **Decision:** [the design/approach actually taken]
- **Rejected alternative:** [at least one alternative considered and why it lost]
- **Constraints:** [what binds the implementation — technical, contractual, scope]
- **Out-of-scope:** [explicitly what this brief does NOT cover]
- **Affected contracts/APIs:** [named, or "none"]

<!-- Implicit sprint-00 (no sprint file) → KEEP this Routing Log line here. Planned sprint (sprint file exists) → OMIT this line; it lives in the sprint file's own ## Routing Log section instead. -->
Routing Log: <date> | path: smart-routing | signals: <risk signals seen or "none"> | skipped: <agents skipped + justification, or "none">
```

---

## 2. @api-guardian Report Template

**Purpose:** API lifecycle management and breaking change detection

**Validation Rules:**
- Required sections: Impact Analysis, Consumer Files, Breaking Changes, Migration Checklist
- Required patterns: `## IMPACT ANALYSIS`, `## CONSUMER`, `## BREAKING`
- Length calibration: cover every section below with real content; do not pad.
- `api-guardian` holds no `Write` tool — see the report-authorship rule above. This template
  defines the shape of the verdict-derived report the dispatcher persists on its behalf.

**Template:**

```markdown
---
agent: api-guardian
version: [VERSION]
date: [DATE]
status: complete
task: [TASK_DESCRIPTION]
---

# API Impact Analysis: [API_NAME]

## IMPACT ANALYSIS

### API Changes Detected
- **File:** [path/to/file]
  - Change: [Description]
  - Impact Level: [High|Medium|Low]

### Scope of Impact
- Consumer count: [N]
- Breaking changes: [Yes|No]
- Migration required: [Yes|No]

## CONSUMER FILES

### Direct Consumers
```
[FILE_PATH_1]
[FILE_PATH_2]
```

### Indirect Consumers
```
[FILE_PATH_3]
[FILE_PATH_4]
```

### Consumer Update Summary
- Total consumers: [N]
- Require changes: [N]
- No changes needed: [N]

## BREAKING CHANGES

### Breaking Change 1: [Name]
- **Type:** [Signature|Removal|Rename|Behavior]
- **Before:** `[old code]`
- **After:** `[new code]`
- **Impact:** [Description]

### Breaking Change 2: [Name]
[Same structure]

## MIGRATION CHECKLIST

### Pre-Migration
- [ ] Backup current state
- [ ] Review all consumers
- [ ] Prepare rollback plan

### Consumer Updates
- [ ] Update [consumer_1]
- [ ] Update [consumer_2]
- [ ] Update tests

### Post-Migration
- [ ] Verify all consumers
- [ ] Run integration tests
- [ ] Update documentation

## HANDOFF TO @builder

All consumer files listed above must be updated before completion.
```

---

## 3. @builder Report Template

**Purpose:** Code implementation and quality gate execution

**Validation Rules:**
- Required sections: Files Created, Files Modified, Quality Gates, Tests
- Required patterns: `### Files Created`, `### Files Modified`, `### Quality Gates`
- Length calibration: cover every section below with real content; do not pad.

**Template:**

```markdown
---
agent: builder
version: [VERSION]
date: [DATE]
status: complete
task: [TASK_DESCRIPTION]
---

# Implementation Report: [FEATURE_NAME]

## IMPLEMENTATION COMPLETE

### Files Created
- `[path/to/file1.tsx]` - [Description]
- `[path/to/file2.ts]` - [Description]

### Files Modified
- `[path/to/file3.ts]:[line_range]` - [Description of changes]
- `[path/to/file4.tsx]:[line_range]` - [Description of changes]

### Tests Added
- `[path/to/test1.test.ts]` - [Test coverage description]
- `[path/to/test2.test.ts]` - [Test coverage description]

## QUALITY GATES

### TypeScript Compilation
```bash
npm run typecheck
```
- [x] Passes without errors
- [ ] Blocked: [error description]

### Unit Tests
```bash
npm test -- --related
```
- [x] All tests pass (5/5)
- [ ] Failures: [description]

### Linting
```bash
npm run lint
```
- [x] No lint errors
- [ ] Issues found: [description]

## READY FOR NEXT STEP

- [x] All changes complete
- [x] Types compile
- [x] Tests pass
- [x] Code follows standards

## HANDOFF

Implementation complete. The deterministic hook runs the typecheck/lint/test/build facts
automatically; @tester runs only if this sprint declared `ux_gate: auto`.
```

---

## 4. @tester Report Template

**Purpose:** UX quality validation gate — runs only when the sprint's `ux_gate: auto`
(see `docs/templates/SPRINT_TEMPLATE.md`). Under `ux_gate: human` or `skip`, this template does
not apply and no @tester report is produced for the sprint. `tester` holds no `Write` tool — see
the report-authorship rule above; this template defines the shape of the verdict-derived report
the dispatcher persists on its behalf.

**Validation Rules (must match `scripts/validate-agent-output.js` exactly):**
- Required sections: Screenshots Created, Console Errors, Performance Metrics, Accessibility, Decision
- Required patterns: a screenshot path, an image file reference, a console-errors statement,
  `(LCP|CLS|INP|FCP)`, `(APPROVED|BLOCKED)`
- Length calibration: cover every section below with real content; do not pad.

**Template:**

```markdown
---
agent: tester
version: [VERSION]
date: [DATE]
status: [approved|blocked]
task: [TASK_DESCRIPTION]
---

# UX Quality Validation: [FEATURE_NAME]

Precondition: sprint frontmatter has `ux_gate: auto`. If `playwright` MCP was unreachable and
the sprint fell back to `human`, this report does not apply — log the fallback in the sprint's
Routing Log instead.

## Screenshots Created

- Mobile (375x667): `[path/to/screenshot-mobile.png]`
- Tablet (768x1024): `[path/to/screenshot-tablet.png]`
- Desktop (1920x1080): `[path/to/screenshot-desktop.png]`

### Visual Changes Detected
- [Component]: [Description of visual change]
- **Status:** [Expected|Unexpected]

## Console Errors

- Console errors: [count] (`[list, or "none"]`)

## Performance Metrics

### Core Web Vitals
- **LCP:** [N]s (target: <2.5s)
- **CLS:** [N] (target: <0.1)
- **INP:** [N]ms (target: <200ms)
- **FCP:** [N]s (target: <1.8s)

**Result:** [PASS|FAIL]

## Accessibility

### WCAG 2.1 AA Compliance
**Result:** [PASS|FAIL]
- [x] Keyboard navigation works
- [x] Screen reader compatible
- [x] Color contrast meets standards (4.5:1 minimum)
- [x] ARIA labels present

### Issues Found (if any)
- [Issue 1]
- [Issue 2]

## Decision

**STATUS:** [✅ APPROVED | 🔴 BLOCKED]

**Rationale:** [Explanation of decision]

### Blocking Issues (if blocked)
1. [Issue 1]
2. [Issue 2]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]
```

---

## 5. @scribe Report Template

**Purpose:** `[Unreleased]` changelog entry at sprint integration, plus related documentation
updates. Per `docs/orchestrator/VERSIONING.md`, VERSION is written exactly once, by
`scripts/version-bump.js` in the release sprint — never by @scribe, never per sprint, never with
a dated heading. @scribe's changelog contribution during a normal sprint is the undated
`[Unreleased]` bullet only.

**Validation Rules:**
- Required sections: Unreleased Entry, Documentation Updates
- Required patterns: `## \[Unreleased\]` or `### Unreleased Entry`, `Documentation`
- Length calibration: cover every section below with real content; do not pad.

**Template:**

```markdown
---
agent: scribe
version: [VERSION]
date: [DATE]
status: complete
task: [TASK_DESCRIPTION]
---

# Documentation Update: [FEATURE_NAME]

## Unreleased Entry

Added to `CHANGELOG.md` under `## [Unreleased]` (no dated heading, no VERSION write):

#### Added
- [Feature 1]

#### Changed
- [Change 1]

#### Fixed
- [Bug fix 1]

#### Removed
- [Removed item 1]

## Documentation Updates

### Files Updated
- `CHANGELOG.md` - Appended `[Unreleased]` bullet(s) above
- `README.md` - [Description of changes if any]

### API Documentation (if applicable)
- Updated: [path/to/api-docs.md]
- Sections modified: [section names]

## Ready For Next Step

- [x] CHANGELOG.md `[Unreleased]` entry added
- [x] README.md updated (if needed)
- [x] All documentation consistent
- [x] VERSION untouched — release sprint only

## HANDOFF

Sprint integration continues (Result section, acceptance criteria, status=done). VERSION and
dated CHANGELOG headings are out of scope here — release sprint territory.
```

---

## 6. @github-manager Report Template

**Purpose:** GitHub operations (Issues, PRs, Releases). `github-manager` holds no `Write` tool —
see the report-authorship rule above; this template defines the shape of the verdict-derived
report the dispatcher persists on its behalf.

**Validation Rules:**
- Required sections: Action, Result
- Required patterns: `(Issue|PR|Release)`, `(Created|Updated|Closed)`
- Length calibration: cover every section below with real content; do not pad.

**Template:**

```markdown
---
agent: github-manager
version: [VERSION]
date: [DATE]
status: complete
task: [TASK_DESCRIPTION]
---

# GitHub Operation: [OPERATION_TYPE]

## ACTION PERFORMED

**Type:** [Issue|PR|Release]
**Operation:** [Created|Updated|Closed|Merged]

### Details
- **Number:** [#N]
- **Title:** [Title]
- **URL:** [GitHub URL]

## RESULT

### Pull Request (if applicable)
```
Title: [PR Title]
Base: [base-branch]
Head: [feature-branch]
Status: [open|merged|closed]
URL: [PR URL]
```

### Issue (if applicable)
```
Number: #[N]
Status: [open|closed]
Linked PR: #[N]
URL: [Issue URL]
```

### Release (if applicable)
```
Tag: v[VERSION]
Name: [Release Name]
Published: [Yes|No]
URL: [Release URL]
```

## RELATED ITEMS

- Fixes #[N]
- Related to #[N]
- Depends on #[N]

## NEXT STEPS

- [Action item 1]
- [Action item 2]
```

---

## Validation Integration

All templates are automatically validated by `scripts/validate-agent-output.js` which enforces:

1. **Required Sections** - Warns if recommended sections are missing
2. **Required Patterns** - Blocks if critical patterns are absent
3. **Length Calibration** - No minimum-length floor; content coverage is judged qualitatively
   against the required sections/patterns, not a character count (length minimums are a
   Goodhart trap — see the v8.6.0 analysis under "not to adopt")
4. **Completeness Score** - Calculates based on section/pattern coverage

### Running Validation Manually

```bash
node scripts/validate-agent-output.js reports/v8.7.0/sprint-02/01-architect-report.md architect
```

### Validation Output Example

```
╔════════════════════════════════════════════════════════════╗
║  AGENT OUTPUT VALIDATION                                    ║
╚════════════════════════════════════════════════════════════╝

Agent: @architect
Status: ✓ VALID
Completeness: 95%

Statistics:
  Required sections: 4/4
  Required patterns: 3/3

✓ Agent output meets quality standards
```

---

## Best Practices

### For Agents
1. **Always include frontmatter** - Makes reports machine-readable
2. **Use exact heading names** - Validation looks for specific patterns
3. **Be comprehensive** - Aim for completeness scores above 90%
4. **Include code blocks** - Use proper markdown formatting
5. **Link to related files** - Use absolute paths

### For Orchestrator
1. **Validate before handoff** - Check agent output quality before next step
2. **Monitor completeness scores** - Address low scores proactively
3. **Review blocked reports** - Investigate validation failures
4. **Maintain consistency** - Enforce templates across all workflows

---

## Version History

- **v8.7.0 (sprint 02)** - @validator template removed (deterministic hook + opt-in `/code-review`
  replace it); @tester template gated on `ux_gate: auto` and aligned to
  `scripts/validate-agent-output.js`'s exact sections/patterns; @scribe template stripped of
  VERSION/dated-heading fields (release-sprint-only, per `docs/orchestrator/VERSIONING.md`);
  minimum-length thresholds replaced with length calibration guidance; agent count corrected to 14;
  report-authorship rule added (Write-holders write, read-only agents return a verdict the
  dispatcher persists).
- **v5.7.0** - Initial standardized templates with validation integration
- **v5.6.0** - SubagentStop hook implementation (validation automation)

---

**See Also:**
- `scripts/validate-agent-output.js` - Validation implementation
- `docs/policies/CONTEXT_SCOPE_POLICY.md` - Agent scope boundaries
- `docs/policies/SECURITY_TOOLING_POLICY.md` - Tool access policies
