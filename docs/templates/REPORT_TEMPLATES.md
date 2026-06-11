# Agent Report Templates

**Version:** v7.0.0
**Last Updated:** 2026-06-11
**Validation:** Enforced by `scripts/validate-agent-output.js`

---

## Orchestrator Return Verdict (separate from the on-disk report)

Each agent saves a **full report** to disk (`reports/vX.X.X/NN-<agent>-report.md`) and returns only a structured verdict to the Orchestrator. These are two distinct outputs.

**Verdict shape:**
```
STATUS: APPROVED | BLOCKED | DONE
- finding 1 (one line max)
- finding 2
- finding 3
report: <absolute path to full report>
```

**Rules:**
- Maximum 3 bullet findings in the verdict.
- `STATUS: APPROVED` — work passed all gates; proceed.
- `STATUS: BLOCKED` — issues found; Orchestrator reads full report for details.
- `STATUS: DONE` — task completed (used by @builder, @scribe, @github-manager, @researcher).
- The Orchestrator opens the full report **only on BLOCKED** or when explicitly needed.
- Min-length validation (`scripts/validate-agent-output.js`) checks the **on-disk file**, not the verdict. Thresholds unchanged: architect 1000, api-guardian 800, builder 500, validator 400, tester 800, scribe 300, github-manager 200.

---

## Overview

This document defines standardized report templates for all 8 CC_GodMode agents. Each template includes:
- **Frontmatter Schema** - YAML metadata for machine-readable parsing
- **Required Sections** - Core content blocks that must be present
- **Required Patterns** - Critical regex patterns for validation
- **Minimum Length** - Character count thresholds for completeness

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
- Minimum length: 1000 characters
- Required sections: Architectural Decisions, Implementation Strategy, Risk Assessment, Handoff
- Required patterns: `## ARCHITECTURAL DECISIONS`, `## IMPLEMENTATION`, `## RISK`

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

## 2. @api-guardian Report Template

**Purpose:** API lifecycle management and breaking change detection

**Validation Rules:**
- Minimum length: 800 characters
- Required sections: Impact Analysis, Consumer Files, Breaking Changes, Migration Checklist
- Required patterns: `## IMPACT ANALYSIS`, `## CONSUMER`, `## BREAKING`

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
- Minimum length: 500 characters
- Required sections: Files Created, Files Modified, Quality Gates, Tests
- Required patterns: `### Files Created`, `### Files Modified`, `### Quality Gates`

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

## READY FOR VALIDATION

- [x] All changes complete
- [x] Types compile
- [x] Tests pass
- [x] Code follows standards

## HANDOFF TO @validator + @tester

Implementation complete. Ready for parallel quality gates.
```

---

## 4. @validator Report Template

**Purpose:** Code quality validation gate

**Validation Rules:**
- Minimum length: 400 characters
- Required sections: Code Quality, TypeScript, Tests, Decision
- Required patterns: `## CODE QUALITY`, `TypeScript`, `Tests`, `(APPROVED|BLOCKED)`

**Template:**

```markdown
---
agent: validator
version: [VERSION]
date: [DATE]
status: [approved|blocked]
task: [TASK_DESCRIPTION]
---

# Code Quality Validation: [FEATURE_NAME]

## CODE QUALITY ASSESSMENT

### TypeScript Validation
```bash
npm run typecheck
```
**Result:** [PASS|FAIL]
- [x] No type errors
- [ ] Issues: [description]

### Unit Test Coverage
```bash
npm test -- --coverage
```
**Result:** [PASS|FAIL]
- Coverage: [N]%
- All tests passing: [Yes|No]
- Missing tests: [description if any]

### Security Scan
**Result:** [PASS|FAIL]
- No vulnerabilities: [Yes|No]
- Issues: [description if any]

### Code Standards
- [x] Follows naming conventions
- [x] No console.logs in production code
- [x] Error handling implemented
- [x] No `any` types used

## CONSUMER VALIDATION
(For API changes only)

- [x] All consumers updated
- [x] Consumer tests pass
- [ ] Consumers need attention: [list]

## DECISION

**STATUS:** [✅ APPROVED | 🔴 BLOCKED]

**Rationale:** [Explanation of decision]

### Blocking Issues (if blocked)
1. [Issue 1]
2. [Issue 2]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

## SYNC POINT

Waiting for @tester validation to complete.
```

---

## 5. @tester Report Template

**Purpose:** UX quality validation gate

**Validation Rules:**
- Minimum length: 400 characters
- Required sections: E2E Tests, Visual Regression, Accessibility, Decision
- Required patterns: `## E2E`, `Visual`, `A11y|Accessibility`, `(APPROVED|BLOCKED)`

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

## E2E TEST RESULTS

### Test Execution
```bash
npm run test:e2e
```
**Result:** [PASS|FAIL]
- Tests run: [N]
- Passed: [N]
- Failed: [N]

### Failed Tests (if any)
- **Test:** [test name]
  - **Error:** [description]
  - **Screenshot:** [path/to/screenshot.png]

## VISUAL REGRESSION

### Screenshots Captured
- Desktop (1920x1080): [path/to/screenshot.png]
- Tablet (768x1024): [path/to/screenshot.png]
- Mobile (375x667): [path/to/screenshot.png]

### Visual Changes Detected
- [Component]: [Description of visual change]
- **Status:** [Expected|Unexpected]

## ACCESSIBILITY (A11y)

### WCAG 2.1 AA Compliance
**Result:** [PASS|FAIL]
- [x] Keyboard navigation works
- [x] Screen reader compatible
- [x] Color contrast meets standards (4.5:1 minimum)
- [x] ARIA labels present

### Issues Found (if any)
- [Issue 1]
- [Issue 2]

## PERFORMANCE

### Core Web Vitals
- **LCP:** [N]s (target: <2.5s)
- **FID:** [N]ms (target: <100ms)
- **CLS:** [N] (target: <0.1)

**Result:** [PASS|FAIL]

## DECISION

**STATUS:** [✅ APPROVED | 🔴 BLOCKED]

**Rationale:** [Explanation of decision]

### Blocking Issues (if blocked)
1. [Issue 1]
2. [Issue 2]

### Recommendations
- [Recommendation 1]
- [Recommendation 2]

## SYNC POINT

Waiting for @validator validation to complete.
```

---

## 6. @scribe Report Template

**Purpose:** Documentation and changelog updates

**Validation Rules:**
- Minimum length: 300 characters
- Required sections: CHANGELOG, VERSION, Documentation
- Required patterns: `## CHANGELOG`, `VERSION`, `v?\d+\.\d+\.\d+`

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

## VERSION UPDATE

**Previous Version:** [OLD_VERSION]
**New Version:** [NEW_VERSION]
**Type:** [MAJOR|MINOR|PATCH]

## CHANGELOG ENTRY

### [NEW_VERSION] - [DATE]

#### Added
- [Feature 1]
- [Feature 2]

#### Changed
- [Change 1]
- [Change 2]

#### Fixed
- [Bug fix 1]
- [Bug fix 2]

#### Removed
- [Removed item 1]

## DOCUMENTATION UPDATES

### Files Updated
- `CHANGELOG.md` - Added version [NEW_VERSION] entry
- `VERSION` - Updated to [NEW_VERSION]
- `README.md` - [Description of changes if any]

### API Documentation (if applicable)
- Updated: [path/to/api-docs.md]
- Sections modified: [section names]

## READY FOR RELEASE

- [x] VERSION file updated
- [x] CHANGELOG.md updated
- [x] README.md updated (if needed)
- [x] All documentation consistent

## HANDOFF TO @github-manager

Ready for PR creation or release publication.
```

---

## 7. @github-manager Report Template

**Purpose:** GitHub operations (Issues, PRs, Releases)

**Validation Rules:**
- Minimum length: 200 characters
- Required sections: Action, Result
- Required patterns: `(Issue|PR|Release)`, `(Created|Updated|Closed)`

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
3. **Minimum Length** - Blocks if output is too short
4. **Completeness Score** - Calculates based on section/pattern coverage

### Running Validation Manually

```bash
node scripts/validate-agent-output.js reports/v5.7.0/00-architect-plan.md architect
```

### Validation Output Example

```
╔════════════════════════════════════════════════════════════╗
║  AGENT OUTPUT VALIDATION (v5.6.0)                          ║
╚════════════════════════════════════════════════════════════╝

Agent: @architect
Status: ✓ VALID
Completeness: 95%

Statistics:
  Output length: 2341 chars (min: 1000)
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

- **v5.7.0** - Initial standardized templates with validation integration
- **v5.6.0** - SubagentStop hook implementation (validation automation)

---

**See Also:**
- `scripts/validate-agent-output.js` - Validation implementation
- `docs/policies/CONTEXT_SCOPE_POLICY.md` - Agent scope boundaries
- `docs/policies/SECURITY_TOOLING_POLICY.md` - Tool access policies
