# Changelog

All notable changes to CC_GodMode will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [5.0.1] - 2026-01-06

### Fixed

- **Agent Tool Mismatch Bug** - Subagents no longer hang when trying to use unavailable tools
  - `scribe.md` - Removed Bash commands from "Tips" and "Quick Commands" sections
  - `architect.md` - Removed Bash commands from "Dependency Check" section
  - Both agents now use their available tools: Read, Grep, Glob (+ Write/Edit for scribe)
  - Git operations are now explicitly delegated to Orchestrator
  - Clear warnings added: "I do NOT have Bash access!"

### Technical

- Root cause: Agent instructions contained `cat`, `git`, `find`, `tail`, `npx` commands but agents lacked Bash tool access
- Solution: Rewrote instructions to use native Claude tools (Read, Grep, Glob) and delegate Bash operations to Orchestrator

---

## [5.0.0] - 2025-01-05

### Added

- **One-Shot Installation System** - Self-installing prompt
  - `INSTALL-V5.0.md` - Copy & paste into Claude Code for automatic setup
  - Supports macOS, Linux, and Windows (PowerShell)
  - Includes `--dangerously-skip-permissions` hint for smooth installation
  - Welcome message explaining what will be installed
  - Installation report at the end

- **Manual Installation Guide** - `MANUAL-INSTALL-V5.0.md`
  - Step-by-step instructions for manual setup
  - Cross-platform commands (bash + PowerShell)
  - Troubleshooting section

- **Templates System** - `~/.claude/templates/`
  - `CLAUDE-ORCHESTRATOR.md` - Copy to projects for instant orchestration
  - `PROJECT-SETUP-V5.0.md` - Inject into existing CLAUDE.md

- **Memory MCP Roadmap** - `ROADMAP-V5.0.md`
  - Planned shared knowledge graph between agents
  - Simplified from 5 MCP servers to 1 (Memory MCP only)
  - IDE-independent architecture

### Changed

- **File Renaming** - Clearer, version-consistent names
  - `INIT-V5.md` → `INSTALL-V5.0.md`
  - `ORCHESTRATOR-INJECT-V4.1.0.md` → `PROJECT-SETUP-V5.0.md`
  - `ORCHESTRATOR-RESTART-V4.1.0.md` → `RESTART-V5.0.md`
  - `INSTALLATION.md` → `MANUAL-INSTALL-V5.0.md`

- **Complete English Translation** - All documentation now in English
  - INSTALL-V5.0.md translated
  - MANUAL-INSTALL-V5.0.md translated
  - ROADMAP-V5.0.md translated
  - README.md German sections translated

- **README.md** - Updated installation section
  - Option A: One-Shot Install (recommended)
  - Option B: Safe Mode (step by step)
  - Option C: Manual

### Removed

- `ORCHESTRATOR-PROMPT-V4.1.0.md` - Redundant with CLAUDE.md
- `INSTALLATION.md` - Replaced by MANUAL-INSTALL-V5.0.md
- `ORCHESTRATOR-INJECT-V4.1.0.md` - Renamed to PROJECT-SETUP-V5.0.md
- `ORCHESTRATOR-RESTART-V4.1.0.md` - Renamed to RESTART-V5.0.md

### Technical

- All files validated for link integrity
- 116 code blocks verified intact
- Cross-platform compatibility confirmed
- No German text remaining

---

## [4.1.0] - 2025-01-04

### Added

- **Version-First Workflow** - New mandatory workflow rule
  - Determine target version BEFORE any work starts
  - All agent reports grouped by version number
  - New section in CLAUDE.md explaining the workflow

- **Version-Based Report Structure** - Reports organized by CHANGELOG version
  - Old: `reports/[workflow-name]_[timestamp]/`
  - New: `reports/v[VERSION]/` (e.g., `reports/v4.1.0/`)
  - Cleaner organization, easier to find reports for specific releases

### Changed

- **CLAUDE.md** - Updated orchestrator instructions
  - New Rule 1: "Version-First"
  - Rule 7 updated: Reports in `reports/vX.X.X/`
  - Start workflow now includes version determination step

- **All 7 Agent Files** - Added "Report Output" section
  - Each agent now documents its report path: `reports/v[VERSION]/XX-agent-report.md`
  - Numbered prefixes: 00-architect, 01-api-guardian, 02-builder, 03-validator, 04-tester, 05-scribe, 06-github-manager

- **@scribe** - Updated report reading paths to version folder format

- **ORCHESTRATOR-INJECT.md** - Updated output structure documentation

- **ORCHESTRATOR-RESTART.md** - Updated reports path reference

- **README.md** - Updated project structure section

### Technical

- Global agents (`~/.claude/agents/`) synchronized with local templates
- All version references updated to 4.1.0

---

## [4.0.2] - 2025-12-29

### Added

- **Global Agent Installation Hints** - Clear documentation that agents are globally installed
  - Added warning block to ORCHESTRATOR-INJECT.md
  - Added hint to ORCHESTRATOR-RESTART.md (both versions)
  - Updated CLAUDE.md with Task tool usage instructions
  - Prevents Claude from creating local agent files unnecessarily

### Changed

- **CLAUDE.md** - Rule 4 now explains Task tool usage with `subagent_type`
- **Documentation** - All orchestrator files now reference `~/.claude/agents/`

### Fixed

- **Agent Creation Bug** - Claude no longer attempts to create local `.md` agent files when injecting orchestrator into new projects

---

## [4.0.1] - 2025-12-29

### Added

- **ORCHESTRATOR-INJECT.md** - Copy-paste orchestrator for existing projects
  - Compact version of orchestrator instructions
  - Designed to be injected into any project's CLAUDE.md
  - Contains all essential rules, workflows, and agent definitions

- **ORCHESTRATOR-RESTART.md** - Context recovery after /compact
  - Short restart prompt for when Claude "forgets" orchestrator mode
  - Minimal version for extreme context limits
  - Usage guide with signs that restart is needed

### Changed

- **README.md** - New sections for integration options
  - "Add to Existing Project" - How to inject into existing CLAUDE.md
  - "Context Recovery" - How to restore orchestrator after /compact
  - Updated project structure with new files

### Removed

- **ORCHESTRATOR-PROMPT-V3.2.md** - Replaced by INJECT and RESTART files

### Technical

- Split monolithic prompt into purpose-specific files
- Improved context efficiency for long sessions

---

## [4.0.0] - 2025-12-29

### Added

- **Mandatory Pre-Push Versioning** - New rule enforced across all agents
  - VERSION file MUST be updated before any push
  - CHANGELOG.md MUST be updated before any push
  - Never push the same version twice
  - Pre-Push Checklist in CLAUDE.md

- **VERSION file as Standard** - Single source of truth for project version
  - Must exist in every project root
  - Can be read by frontend/scripts for version display
  - Semantic versioning enforced (MAJOR.MINOR.PATCH)

- **@scribe Version Management** - New responsibility for @scribe agent
  - @scribe now manages VERSION file updates
  - @scribe ensures CHANGELOG entries before any push
  - Version uniqueness verification

### Changed

- **Output folder standardized to `reports/`** - Breaking change from `Agents/`
  - All 13 path references updated across documentation
  - `reports/` is gitignored (reports not pushed to GitHub)
  - Agent definitions remain in `agents/` (tracked in Git)

- **Complete English translation** - All documentation now in English
  - CLAUDE.md fully translated
  - All 7 agent files translated
  - README.md template section translated
  - CHANGELOG.md translated

### Breaking Changes

- `Agents/` folder renamed to `reports/` for output
- New mandatory versioning rules before push
- @scribe agent has new required responsibilities

### Technical

- Blueprint compliance: 95% → 100%
- All agent files use consistent English terminology
- Pre-push validation now checks version consistency

---

## [3.3.0] - 2025-12-29

### Added

- **CLAUDE.md Orchestrator** - Auto-loaded project context
  - Complete orchestrator configuration in project root
  - Automatically loaded by Claude Code
  - Replaces manual copy-paste of orchestrator prompt
  - ASCII workflow diagrams
  - Handoff matrix for agent communication

- **Blueprint-compliant agent structure**
  - All 7 agents refactored according to blueprint schema
  - Essence lines for quick overview
  - Unified "What I Do NOT Do" sections
  - Workflow position diagrams per agent
  - Standardized output formats

- **Hierarchical output structure**
  - `reports/[workflow-name]_[timestamp]/` format
  - Numbered reports (00-architect, 01-api-guardian, ...)
  - README.md in reports folder with naming convention

- **Template-Ready**
  - CC_GodMode usable as universal template
  - Documentation for creating custom teams
  - Blueprint structure explained in README

### Changed

- README.md extended as template documentation
- Project structure enhanced with CLAUDE.md and reports/ hierarchy
- Version badge displays "Blueprint-Template"

### Technical

- Agent files: Maintained uniform YAML frontmatter
- Blueprint compliance: 63% → 95%
- No breaking changes to existing workflows

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

Use `PROJECT-SETUP-V5.0.md` instead of the old prompt.

---

## Links

- [README](./README.md)
- [Installation Guide](./MANUAL-INSTALL-V5.0.md)
- [Project Setup](./PROJECT-SETUP-V5.0.md)
