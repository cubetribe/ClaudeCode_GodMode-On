# Security & Tooling Policy

**Version:** v5.7.0
**Last Updated:** 2026-01-08
**Status:** Enforced

---

## Overview

This policy defines **tool access levels**, **security boundaries**, and **operational restrictions** for all CC_GodMode agents. The principle of **least privilege** is enforced - each agent has access only to tools required for their specific role.

**Key Principles:**
- Least privilege access
- No destructive operations without explicit user permission
- PII protection at all stages
- File system boundaries enforced
- WebFetch restrictions for safety

---

## 1. Tool Access Matrix

@validator was dissolved in v8.7.0 (Sprint 02); its deterministic checks now run in a hook
outside the Task-tool agent roster entirely, so it no longer holds a tool grant here. @tester
now runs only when the sprint declares `ux_gate: auto`.

| Tool | @architect | @api-guardian | @builder | @tester | @scribe | @github-manager |
|------|-----------|---------------|----------|---------|---------|----------------|
| **Read** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Write** | ⚠️ | ❌ | ✅ | ⚠️ | ✅ | ❌ |
| **Edit** | ⚠️ | ❌ | ✅ | ⚠️ | ✅ | ❌ |
| **Bash** | ⚠️ | ⚠️ | ✅ | ✅ | ⚠️ | ✅ |
| **Glob** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Grep** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Playwright MCP** | ❌ | ❌ | ⚠️ | ✅ | ❌ | ❌ |
| **GitHub MCP** | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Lighthouse MCP** | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ |
| **A11y MCP** | ❌ | ❌ | ❌ | ⚠️ | ❌ | ❌ |

**Legend:**
- ✅ **Allowed** - Full access for this role
- ⚠️ **Restricted** - Limited access (see restrictions below)
- ❌ **Denied** - No access for this role

---

## 2. Tool-Specific Policies

### Read Tool

**Access:** All agents

**Allowed:**
- Read any project file
- Read agent reports
- Read configuration files
- Read existing code

**Denied:**
- Read files outside project directory
- Read system files (/etc/, /usr/, etc.)
- Read other users' home directories
- Read credential files (.env, secrets.json, etc.) without user permission

**Security Notes:**
- Always validate file paths are within project
- Warn if attempting to read credential files
- Never log sensitive file contents to console

---

### Write Tool

**Access:** @builder, @scribe (full), @architect/@tester (reports only)

**@builder - Allowed:**
- Create new source files (src/, tests/)
- Create test files
- Create configuration files (with user approval)

**@builder - Denied:**
- Overwrite files without reading first
- Write outside project directory
- Write to system directories
- Create executable files without review

**@scribe - Allowed:**
- Update VERSION file
- Update CHANGELOG.md
- Update README.md
- Update documentation files (docs/)

**@scribe - Denied:**
- Modify source code
- Create executable scripts
- Overwrite configuration files

**@architect/@tester - Allowed:**
- Write reports to reports/vX.X.X/ only

**@architect/@tester - Denied:**
- Write any production code
- Write outside reports directory

**Security Notes:**
- Always use Read before Write for existing files
- Validate file paths are relative to project root
- Never write credentials to disk
- Prompt user before creating config files

---

### Edit Tool

**Access:** @builder, @scribe (full), @architect/@tester (reports only)

**@builder - Allowed:**
- Edit source files (src/, tests/)
- Edit configuration files
- Edit test files

**@builder - Denied:**
- Edit without reading first (tool enforces this)
- Edit version control files (.git/)
- Edit credential files
- Edit system files

**@scribe - Allowed:**
- Edit VERSION file
- Edit CHANGELOG.md
- Edit README.md
- Edit documentation files

**@scribe - Denied:**
- Edit source code
- Edit test files
- Edit build configurations

**Security Notes:**
- Tool enforces "read before edit" automatically
- Always preserve exact indentation
- Validate old_string is unique
- Never edit credential files

---

### Bash Tool

**Access:** All agents (with restrictions)

**@builder - Allowed:**
```bash
npm run typecheck
npm test
npm run lint
npm install [package]
node [script]
```

**@builder - Denied:**
```bash
rm -rf
git push (without permission)
npm publish
chmod +x
sudo [anything]
curl | bash
```

**Deterministic hook / @tester - Allowed:**
```bash
npm run typecheck
npm test
npm run lint
npm run test:e2e
node scripts/validate-*
```

**Deterministic hook / @tester - Denied:**
```bash
npm install
git [any command]
rm [anything]
```

**@github-manager - Allowed:**
```bash
git status
git diff
git log
git add
git commit
gh pr create
gh issue [commands]
```

**@github-manager - Denied:**
```bash
git push (without explicit user permission)
git push --force (NEVER without user permission)
git reset --hard
git rebase -i
rm [anything]
```

**@architect/@api-guardian/@scribe - Allowed:**
```bash
ls [directory]
tree [directory]
node scripts/analyze-*
```

**@architect/@api-guardian/@scribe - Denied:**
```bash
npm [anything]
git [anything]
rm [anything]
```

**Security Notes:**
- Never run commands with sudo
- Always validate user permission for git push
- Never run piped curl commands
- Quote file paths with spaces
- Use absolute paths when possible

---

### Glob Tool

**Access:** All agents (unrestricted)

**Allowed:**
- Search for files by pattern
- List directory contents
- Find specific file types

**Best Practices:**
- Use specific patterns (*.ts not *)
- Limit search scope to relevant directories
- Use for file discovery, not content reading

---

### Grep Tool

**Access:** All agents (unrestricted)

**Allowed:**
- Search file contents by pattern
- Find API usage
- Discover consumers

**Best Practices:**
- Use specific regex patterns
- Limit search to file types
- Use output_mode: "files_with_matches" for discovery
- Use output_mode: "content" only when needed

---

## 3. MCP Server Policies

### Playwright MCP

**Access:** @tester (full), @builder (limited)

**@tester - Allowed:**
- Launch browser
- Navigate to pages
- Take screenshots
- Run E2E tests
- Monitor console
- Capture network traffic

**@tester - Denied:**
- Navigate to external sites (only localhost allowed)
- Execute arbitrary JavaScript
- Download files without review

**@builder - Allowed:**
- Run E2E tests during development
- Take debug screenshots

**@builder - Denied:**
- Modify E2E test execution
- Change browser configuration

**Security Notes:**
- Only test against localhost or approved staging URLs
- Never submit forms with real PII
- Clear browser storage after tests
- Don't navigate to untrusted URLs

---

### GitHub MCP

**Access:** @github-manager only

**Allowed:**
- Read issues, PRs, releases
- Create PRs
- Update issues
- Create releases
- Add comments
- Link issues to PRs

**Denied:**
- Force push
- Delete branches (without user permission)
- Close PRs without review
- Modify repository settings
- Add collaborators
- Create webhooks

**Security Notes:**
- NEVER push without explicit user permission
- NEVER force push to main/master
- Always link PRs to issues (Fixes #N)
- Validate branch names before operations

---

### Lighthouse MCP

**Access:** @tester (optional)

**Allowed:**
- Run performance audits
- Capture Core Web Vitals
- Generate performance reports

**Denied:**
- Run against production URLs without permission
- Execute arbitrary code in audits

**Security Notes:**
- Only audit localhost or approved URLs
- Don't send real user data to Lighthouse

---

### A11y MCP

**Access:** @tester (optional)

**Allowed:**
- Run accessibility audits
- Check WCAG compliance
- Generate A11y reports

**Denied:**
- Modify page DOM during audits
- Execute arbitrary code

**Security Notes:**
- Only audit localhost or approved URLs
- Don't scan external sites

---

## 4. Denied Operations List

### Universally Prohibited

**ALL agents are prohibited from:**

1. **Destructive File Operations**
   - `rm -rf` (recursive delete)
   - Deleting `.git` directory
   - Deleting `node_modules` (use npm clean instead)
   - Overwriting credential files

2. **Dangerous Git Operations**
   - `git push --force` (unless explicitly approved)
   - `git reset --hard` (loses uncommitted work)
   - `git rebase -i` (interactive, not supported)
   - `git push` without user permission

3. **Security Risks**
   - `sudo` commands
   - `curl | bash` (piped remote execution)
   - `eval` on user input
   - `chmod +x` without review

4. **Network Risks**
   - Fetching from untrusted URLs
   - Sending data to external services (without permission)
   - Installing packages from untrusted registries

5. **Privacy Violations**
   - Reading credential files without permission
   - Logging sensitive data
   - Committing secrets to git
   - Storing PII in plain text

---

## 5. PII Handling

### Definition

**Personally Identifiable Information (PII)** includes:
- Names
- Email addresses
- Phone numbers
- Physical addresses
- Credit card numbers
- Social security numbers
- API keys, tokens, passwords
- Any data that can identify a specific individual

### PII Protection Rules

**1. Detection**
- Scan for common PII patterns before committing
- Warn if .env or credentials files are staged
- Alert on hardcoded API keys or tokens

**2. Storage**
- NEVER commit PII to git
- NEVER store PII in plain text
- NEVER log PII to console
- Always use environment variables for secrets

**3. Testing**
- Use mock/fake PII for tests
- Never use real user data in E2E tests
- Clear browser storage after tests
- Don't commit test data with PII

**4. Handling in Code**
- Encrypt sensitive data at rest
- Use secure credential management (dotenv, vault)
- Redact PII in logs and error messages
- Don't pass PII in URL parameters

**5. Agent Behavior**
- If PII detected in staged files → BLOCK commit and warn user
- If credential file in git diff → Alert and ask for confirmation
- If API key in code → Suggest environment variable instead

### Common PII Patterns (Regex)

```regex
# Email
/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/

# API Key (generic)
/['"]([A-Za-z0-9_-]{32,})['"]/

# Credit Card
/\b\d{4}[- ]?\d{4}[- ]?\d{4}[- ]?\d{4}\b/

# JWT Token
/eyJ[A-Za-z0-9_-]+\.eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/

# SSH Private Key
/-----BEGIN (RSA|OPENSSH|DSA|EC) PRIVATE KEY-----/
```

**Agents should warn when these patterns are detected in code changes.**

---

## 6. WebFetch Restrictions

**WebFetch is NOT available as a tool** - this is intentional for security.

**Prohibited:**
- Fetching arbitrary URLs
- Downloading external scripts
- Making API calls to external services
- Web scraping

**Rationale:**
- Prevents data exfiltration
- Blocks untrusted code execution
- Protects against SSRF attacks
- Ensures reproducible builds

**Exceptions:**
- Package installation via npm (uses package-lock.json for integrity)
- MCP servers may fetch from approved URLs (e.g., GitHub API)

**If external data is needed:**
- User must download manually
- User must review before providing to agent
- User must validate source

---

## 7. File System Boundaries

### Allowed Directories

**Read Access:**
```
/Users/denniswestermann/Desktop/Coding Projekte/CC_GodMode/
├── src/                    ✅ Read/Write
├── tests/                  ✅ Read/Write
├── scripts/                ✅ Read
├── docs/                   ✅ Read/Write
├── reports/                ✅ Read/Write
├── public/                 ✅ Read
├── CHANGELOG.md            ✅ Read/Write
├── README.md               ✅ Read/Write
├── VERSION                 ✅ Read/Write
├── package.json            ✅ Read
├── package-lock.json       ✅ Read
└── .gitignore              ✅ Read
```

**Write Access (limited):**
```
├── src/                    ✅ @builder only
├── tests/                  ✅ @builder only
├── docs/                   ✅ @scribe only
├── reports/                ✅ All agents (own reports)
├── CHANGELOG.md            ✅ @scribe only
├── VERSION                 ✅ @scribe only
└── README.md               ✅ @scribe only
```

### Prohibited Directories

**NEVER access:**
```
/etc/                       ❌ System configuration
/usr/                       ❌ System binaries
/var/                       ❌ System data
/root/                      ❌ Root home directory
~/.ssh/                     ❌ SSH keys
~/.aws/                     ❌ AWS credentials
/tmp/                       ❌ Temporary system files
node_modules/               ⚠️ Read only, never write
.git/                       ⚠️ Read only, never write
```

**Rationale:**
- Prevents system damage
- Protects credentials
- Avoids permission issues
- Maintains project isolation

---

## 8. Audit Requirements

### Logging

**Required Logs:**
1. **Tool Usage** - Which agent used which tool
2. **File Access** - Read/Write operations with timestamps
3. **Git Operations** - All commits, pushes, PR creations
4. **MCP Calls** - All interactions with MCP servers
5. **Escalations** - All escalations to orchestrator

**Log Format:**
```json
{
  "timestamp": "2026-01-08T10:30:00Z",
  "agent": "builder",
  "tool": "Write",
  "path": "src/auth/AuthService.ts",
  "result": "success"
}
```

**Log Location:** `reports/vX.X.X/audit.log`

### Review Points

**Before Git Push:**
- Review all changed files
- Check for PII in diffs
- Verify VERSION updated
- Confirm CHANGELOG updated
- User explicitly approves

**Before PR Creation:**
- Review PR description
- Verify "Fixes #N" linking
- Check CI/CD will trigger
- User approves PR creation

**After Quality Gates:**
- Deterministic hook passed (and @tester approved, if `ux_gate: auto` applied)
- All tests passed
- No security issues found

---

## 9. Enforcement

### Automatic Enforcement

1. **Tool Restrictions** - Tools refuse operations outside allowed scope
2. **Pre-Push Hooks** - Git hooks check for PII and versioning
3. **Agent Validation** - SubagentStop hook validates agent behavior
4. **Path Validation** - File operations validate paths are in project

### Manual Enforcement

1. **Orchestrator Monitoring** - Reviews agent reports for violations
2. **User Review** - User must approve all pushes and PRs
3. **Audit Log Review** - Periodic review of audit logs

### Violation Response

**Level 1 - Warning:**
- Agent attempted restricted operation
- Operation blocked automatically
- Warning logged

**Level 2 - Escalation:**
- Agent repeatedly attempts violations
- Escalate to orchestrator
- Workflow may need adjustment

**Level 3 - Abort:**
- Security-critical violation detected
- Workflow aborted immediately
- User notified

---

## 10. Best Practices

### For Agents

1. **Request Minimal Permissions**
   - Only use tools you need
   - Read before write
   - Don't explore files unnecessarily

2. **Validate Before Operations**
   - Check file paths are in project
   - Scan for PII before commits
   - Confirm user permission for pushes

3. **Log All Operations**
   - Tool usage
   - File access
   - Git operations

4. **Fail Safely**
   - If permission denied, escalate
   - Never bypass security restrictions
   - Report violations to orchestrator

### For Orchestrator

1. **Monitor Tool Usage**
   - Track which tools agents use
   - Alert on unusual patterns
   - Review audit logs

2. **Enforce Boundaries**
   - Validate agent reports for violations
   - Block workflows that skip steps
   - Ensure handoffs are proper

3. **User Communication**
   - Always ask before git push
   - Explain security warnings
   - Get explicit approval for sensitive operations

---

## Version History

- **v8.7.0** - @validator's tool grant removed (dissolved into a deterministic hook); @tester tool grant now conditional on `ux_gate: auto`
- **v5.7.0** - Initial security and tooling policy formalization
- **v5.6.0** - Foundation (agent validation, quality gates)

---

**See Also:**
- `docs/templates/REPORT_TEMPLATES.md` - Agent output formats
- `docs/policies/CONTEXT_SCOPE_POLICY.md` - Agent scope boundaries
- `scripts/validate-agent-output.js` - Agent validation implementation
