# Changelog

All notable changes to CC_GodMode will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [3.2.0] - 2025-12-24

### Added

- **Auto-Update-Check** - Version check at session start
  - `scripts/check-update.js` - Cross-platform (Windows/Mac/Linux)
  - Checks GitHub for latest version
  - Shows changelog diff if update available
  - Colored terminal output
  - `VERSION` file for local version tracking

- **New Orchestrator Prompt V3.2** - `ORCHESTRATOR-PROMPT-V3.2.md`
  - Version check instruction at start
  - All V3.1 features included

### Changed

- Renamed `ORCHESTRATOR-PROMPT-V3.1.md` → `ORCHESTRATOR-PROMPT-V3.2.md`
- Updated all version references to 3.2.0

---

## [3.1.0] - 2025-12-24

### Added

- **GitHub Issue Workflow** - Automated issue processing
  - Load issues via `@github-manager`
  - Orchestrator analyzes: Type, Complexity, Areas affected
  - Automatic workflow selection based on analysis
  - PR creation with "Fixes #X" reference
  - Batch issue processing support

- **New Orchestrator Prompt V3.1** - `ORCHESTRATOR-PROMPT-V3.1.md`
  - Issue analysis checklist (Type/Complexity/Areas/Auto-OK)
  - Issue workflow diagram
  - Shorter and minimalist variants updated
  - Quick reference for issue processing

- **Project Structure Improvements**
  - New `reports/` folder for agent reports (gitignored)
  - Cleaner separation: `agents/` for definitions, `reports/` for outputs

### Changed

- **Workflow trigger via Issue**
  - "Bearbeite Issue #X" → loads, analyzes, executes, creates PR
  - Low bugs skip @architect for faster processing
  - Feature requests always include @scribe

- **Documentation**
  - Fixed repository URLs (GodMon → GodMode)
  - Fixed MCP package names in all files
  - Updated .gitignore for reports folder

---

## [3.0.0] - 2025-12-24

### Added

- **New Agent: `@tester`** - UX Quality Engineer
  - E2E Testing with Playwright MCP
  - Visual Regression Testing (screenshots, pixel diff)
  - Accessibility Testing with Axe-core (WCAG 2.1 compliance)
  - Performance Audits with Lighthouse (Core Web Vitals)
  - Cross-Browser Testing (Chrome, Firefox, Safari)
  - Responsive Testing (Mobile, Tablet, Desktop viewports)
  - Console Error Monitoring
  - Testing Trophy philosophy (Kent C. Dodds)

- **New Agent: `@github-manager`** - GitHub Project Management Specialist
  - Issue lifecycle management (create, label, assign, close)
  - Pull Request workflow (branch creation, PR management, review coordination)
  - Release management (tags, GitHub Releases, release notes generation)
  - Repository synchronization (fork sync, upstream merge)
  - CI/CD monitoring (GitHub Actions status, failure analysis)
  - Uses GitHub MCP Server for API access (with `gh` CLI fallback)

- **MCP Server Integration** - Full documentation and installation
  - **Playwright MCP** (Microsoft) - Browser automation for @tester
  - **GitHub MCP** (GitHub) - Repository management for @github-manager
  - **Lighthouse MCP** - Performance & accessibility audits for @tester
  - **A11y MCP** - WCAG compliance testing for @tester

- **New Installation Script** - `scripts/install-mcps.sh`
  - Automated MCP server installation
  - Prerequisite checks
  - Fallback handling

- **New Orchestrator Prompt V3** - `ORCHESTRATOR-PROMPT-V3.md`
  - 7-Agent workflow
  - Dual Quality Gates: @validator (code) → @tester (UX)
  - MCP server references
  - Testing Trophy integration

### Changed

- **Quality Gate Split**
  - `@validator` - Now focused on code quality (TypeScript, unit tests, security)
  - `@tester` - Now handles UX quality (E2E, visual, a11y, performance)

- **Workflow Updates**
  - New Feature: `@architect` → `@builder` → `@validator` → `@tester` → `@scribe`
  - API Change: `@architect` → `@api-guardian` → `@builder` → `@validator` → `@tester` → `@scribe`
  - Release: `@scribe` → `@github-manager`

- **INSTALLATION.md** - Complete rewrite with MCP documentation
  - Verified MCP server links
  - Docker vs npx installation options
  - Troubleshooting section

- **README.md** - Updated for 7-Agent system

### Requirements

- **Required MCPs:**
  - Playwright MCP (`@playwright/mcp`)
  - GitHub MCP (Docker: `ghcr.io/github/github-mcp-server`)

- **Recommended MCPs:**
  - Lighthouse MCP (`lighthouse-mcp`)
  - A11y MCP (`a11y-mcp`)

- **Prerequisites:**
  - Node.js 18+
  - Docker (for GitHub MCP)
  - GitHub Personal Access Token

### MCP Server Sources

| MCP | GitHub | NPM |
|-----|--------|-----|
| Playwright | [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp) | [@playwright/mcp](https://www.npmjs.com/package/@playwright/mcp) |
| GitHub | [github/github-mcp-server](https://github.com/github/github-mcp-server) | Docker only (npm deprecated) |
| Lighthouse | [priyankark/lighthouse-mcp](https://github.com/priyankark/lighthouse-mcp) | [lighthouse-mcp](https://www.npmjs.com/package/lighthouse-mcp) |
| A11y | [priyankark/a11y-mcp](https://github.com/priyankark/a11y-mcp) | [a11y-mcp](https://www.npmjs.com/package/a11y-mcp) |

---

## [2.0.0] - 2025-12-22

### Added

- **New Agent: `@api-guardian`** - Dedicated API Lifecycle Expert
  - Breaking change detection via git diff analysis
  - Consumer discovery and impact analysis
  - Migration checklist generation
  - API versioning strategy recommendations
  - Single Point of Truth for all API-related decisions

- **Enhanced Hook Script** (`check-api-impact.js`)
  - Breaking change detection with severity levels (HIGH/MEDIUM)
  - Improved consumer discovery
  - Structured output with clear sections
  - Automatic workflow recommendations
  - Support for OpenAPI and GraphQL schema files

- **Version tracking**
  - Added CHANGELOG.md
  - Version badge in README.md
  - Renamed ORCHESTRATOR-PROMPT.md to ORCHESTRATOR-PROMPT-V2.md

### Changed

- **`@architect`** - Now focused on high-level design only
  - Removed: API contract validation (moved to @api-guardian)
  - Removed: Consumer impact analysis (moved to @api-guardian)
  - Added: Explicit "What You Do NOT Do" section
  - Added: Clear handoff instructions to other agents

- **`@builder`** - Now pure implementation agent
  - Removed: Consumer search responsibility (moved to @api-guardian)
  - Added: Receives file list from @api-guardian
  - Added: Explicit "What You Do NOT Do" section
  - Added: Clear workflow for API file changes

- **`@validator`** - Now focused on verification only
  - Removed: Consumer discovery (moved to @api-guardian)
  - Added: Verifies against @api-guardian's consumer list
  - Added: Explicit "What You Do NOT Do" section
  - Added: Structured validation workflow

- **`@scribe`** - Now receives data from @api-guardian
  - Removed: Independent consumer analysis
  - Added: Uses @api-guardian's consumer matrix for registry
  - Added: Explicit "What You Do NOT Do" section

- **Workflow for API Changes**
  - Old: `@architect` → `@builder` → `@validator` → `@scribe`
  - New: `@architect` → `@api-guardian` → `@builder` → `@validator` → `@scribe`

### Fixed

- Eliminated overlapping responsibilities between agents
- Clear separation of concerns for API-related tasks
- No more redundant consumer searches by multiple agents

---

## [1.0.0] - 2025-12-07

### Added

- Initial release of CC_GodMode
- 4 Subagents: `@architect`, `@builder`, `@validator`, `@scribe`
- Orchestrator workflow system
- Basic `check-api-impact.js` hook script
- API Consumer Registry template
- YOLO Mode installation option
- Global and project-specific configuration support

### Features

- Automated task delegation via Orchestrator
- Cross-file consistency checking
- API consumer tracking
- Automatic documentation updates
- TypeScript/React/Node.js optimized workflows

---

## Version History Summary

| Version | Date | Agents | Key Feature |
|---------|------|--------|-------------|
| 3.0.0 | 2025-12-24 | 7 | `@tester` + `@github-manager` + MCP Integration |
| 2.0.0 | 2025-12-22 | 5 | `@api-guardian` + Enhanced Hooks |
| 1.0.0 | 2025-12-07 | 4 | Initial Release |

---

## Upgrade Guide: v2.x → v3.0.0

### 1. Install New Agent Files

```bash
cp agents/tester.md ~/.claude/agents/
cp agents/github-manager.md ~/.claude/agents/
```

### 2. Install MCP Servers

```bash
# Run the installation script
chmod +x scripts/install-mcps.sh
./scripts/install-mcps.sh

# Or manually:
claude mcp add playwright -- npx @playwright/mcp@latest
claude mcp add lighthouse -- npx lighthouse-mcp
claude mcp add a11y -- npx a11y-mcp

# For GitHub MCP (requires Docker + token)
export GITHUB_TOKEN="your_token"
claude mcp add github -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN ghcr.io/github/github-mcp-server
```

### 3. Install Playwright Browsers

```bash
npx playwright install chromium
```

### 4. Update Orchestrator Prompt

Use `ORCHESTRATOR-PROMPT-V3.md` instead of V2.

### 5. New Workflow

**Old (v2.x):**
```
@architect → @builder → @validator → @scribe
```

**New (v3.0):**
```
@architect → @builder → @validator → @tester → @scribe
```

The quality gate is now split:
- `@validator` = Code quality (TypeScript, unit tests, security)
- `@tester` = UX quality (E2E, visual, a11y, performance)

---

## Upgrade Guide: v1.0.0 → v2.0.0

### 1. Add New Agent File

```bash
cp agents/github-manager.md ~/.claude/agents/
```

### 2. Setup GitHub MCP Server (Recommended)

```bash
# Option A: Docker
claude mcp add github \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=YOUR_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
  ghcr.io/github/github-mcp-server

# Option B: Use gh CLI (Fallback)
# Install: https://cli.github.com/
gh auth login
```

### 3. Update Orchestrator Prompt

Use the updated `ORCHESTRATOR-PROMPT-V2.md` which now includes `@github-manager`.

### 4. New Workflows Available

- **Release:** After @scribe updates CHANGELOG → @github-manager creates GitHub Release
- **Bug Report:** User describes bug → @github-manager creates structured Issue
- **Feature Complete:** @validator confirms green → @github-manager creates PR

---

## Upgrade Guide: v1.0.0 → v2.0.0

### 1. Update Agent Files

Copy the new agent files to your global Claude config:

```bash
cp agents/*.md ~/.claude/agents/
```

### 2. Update Hook Script

```bash
cp scripts/check-api-impact.js ~/.claude/scripts/
chmod +x ~/.claude/scripts/check-api-impact.js
```

### 3. Update Your Workflow

**Old workflow for API changes:**
```
@architect → @builder → @validator → @scribe
```

**New workflow for API changes:**
```
@architect → @api-guardian → @builder → @validator → @scribe
```

### 4. Use New Orchestrator Prompt

Use `ORCHESTRATOR-PROMPT-V2.md` instead of the old prompt.

---

## Links

- [README](./README.md)
- [Installation Guide](./INSTALLATION.md)
- [Orchestrator Prompt V2](./ORCHESTRATOR-PROMPT-V2.md)
