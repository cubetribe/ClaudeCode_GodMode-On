#!/usr/bin/env node

/**
 * CC_GodMode SessionStart Hook
 *
 * Runs automatically when Claude Code starts a new session.
 *
 * Features:
 * - Validates VERSION file exists and is valid semver
 * - Creates report folder for current version (reports/vX.X.X/)
 * - Checks MCP server health status
 * - Displays welcome message with system status
 *
 * Copyright (c) 2025 Dennis Westermann
 * www.dennis-westermann.de
 */

const fs = require('fs');
const path = require('path');
const os = require('os');
const { execSync } = require('child_process');

// v5.7.0 - Phase 2: Domain Pack Integration
const domainPackLoaderPath = path.join(__dirname, '..', 'Orchester-Design', 'scripts', 'domain-pack-loader.js');
let discoverDomainPacks = null;

// Lazy load domain pack loader if available
try {
  if (fs.existsSync(domainPackLoaderPath)) {
    const domainPackLoader = require(domainPackLoaderPath);
    discoverDomainPacks = domainPackLoader.discoverDomainPacks;
  }
} catch (error) {
  // Domain pack system not available - continue with CC_GodMode core only
}

// v5.8.3 - Workflow State Persistence
const workflowStatePath = path.join(__dirname, 'workflow-state.js');
let getResumeInfo = null;

// Lazy load workflow state manager if available
try {
  if (fs.existsSync(workflowStatePath)) {
    const workflowState = require(workflowStatePath);
    getResumeInfo = workflowState.getResumeInfo;
  }
} catch (error) {
  // Workflow state system not available - continue without it
}

// Configuration
// VERSION_FILE: Always read from CC_GodMode installation (~/.claude/VERSION)
// REPORTS_DIR: Use project directory for reports
const HOME_DIR = os.homedir();
const CLAUDE_DIR = path.join(HOME_DIR, '.claude');
const VERSION_FILE = path.join(CLAUDE_DIR, 'VERSION');
const REPORTS_DIR = path.join(process.cwd(), 'reports');

// v8.6.0 - Sprint 02: Install/repo drift guard + broken-wiring guard
const INSTALL_VERSION_MARKER = path.join(HOME_DIR, '.cc-godmode-version');
const CLAUDE_SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');

// ANSI Colors (same as version-bump.js)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// MCP Servers to check
const MCP_SERVERS = {
  required: ['playwright', 'github', 'memory'],
  optional: ['lighthouse', 'a11y']
};

// Available agents
const AGENTS = [
  '@architect',
  '@api-guardian',
  '@builder',
  '@validator',
  '@tester',
  '@scribe',
  '@github-manager'
];

/**
 * Print styled box output
 * (Reused from version-bump.js)
 */
function printBox(lines, color = colors.cyan) {
  const maxLen = Math.max(...lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length));
  const border = '═'.repeat(maxLen + 2);

  console.log(`${color}╔${border}╗${colors.reset}`);
  lines.forEach(line => {
    const plainLen = line.replace(/\x1b\[[0-9;]*m/g, '').length;
    const padding = ' '.repeat(maxLen - plainLen);
    console.log(`${color}║${colors.reset} ${line}${padding} ${color}║${colors.reset}`);
  });
  console.log(`${color}╚${border}╝${colors.reset}`);
}

/**
 * Print error message and exit
 */
function errorExit(message, details = []) {
  const lines = [
    `${colors.red}✗ CRITICAL ERROR${colors.reset}`,
    '',
    message,
    ''
  ];

  if (details.length > 0) {
    lines.push(`${colors.bright}Solution:${colors.reset}`);
    details.forEach(detail => lines.push(`  ${colors.gray}${detail}${colors.reset}`));
  }

  printBox(lines, colors.red);
  process.exit(1);
}

/**
 * Parse semantic version string
 * (Reused from version-bump.js)
 */
function parseVersion(versionString) {
  const cleaned = versionString.trim().replace(/^v/, '');
  const match = cleaned.match(/^(\d+)\.(\d+)\.(\d+)$/);

  if (!match) {
    return null;
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    toString() {
      return `${this.major}.${this.minor}.${this.patch}`;
    }
  };
}

/**
 * Print a minimal "not installed" notice and signal graceful degradation.
 * (v8.6.0 - Sprint 02 addendum: a SessionStart hook must NEVER fail. A
 * missing ~/.claude/VERSION, or a missing ~/.claude entirely, means
 * CC_GodMode simply isn't installed on this machine yet — that is not a
 * corruption/error condition, so this prints a short hint instead of the
 * red CRITICAL banner and lets main() exit 0.)
 */
function printNotInstalledNotice() {
  console.log(
    `${colors.gray}CC_GodMode not installed — run scripts/apply-global-claude-setup.sh${colors.reset}`
  );
}

/**
 * Check VERSION file and return version, or null if not installed.
 * Never exits non-zero: a missing install degrades to a short notice
 * (handled by the caller); genuine corruption (unreadable/invalid content)
 * is downgraded to a warning line, not a fatal CRITICAL ERROR + exit 1 -
 * this is a SessionStart hook and must always exit 0.
 */
function checkVersionFile() {
  try {
    // Missing ~/.claude/VERSION (including a missing ~/.claude entirely) is
    // the "not installed yet" case - graceful, not an error.
    if (!fs.existsSync(VERSION_FILE)) {
      return null;
    }

    // Read and parse version
    const content = fs.readFileSync(VERSION_FILE, 'utf8');
    const version = parseVersion(content);

    if (!version) {
      console.log(
        `${colors.yellow}⚠ Warning: Invalid version format in VERSION file: "${content.trim()}"${colors.reset}`
      );
      console.log(
        `${colors.gray}  VERSION file must contain semantic version (MAJOR.MINOR.PATCH), e.g. 1.0.0${colors.reset}`
      );
      return null;
    }

    return version;

  } catch (error) {
    // Genuine corruption (unreadable file, permissions, etc.) - warn, don't crash.
    console.log(
      `${colors.yellow}⚠ Warning: Failed to read VERSION file: ${error.message}${colors.reset}`
    );
    return null;
  }
}

/**
 * Create report folder for current version
 */
function createReportFolder(version) {
  try {
    const versionFolder = path.join(REPORTS_DIR, `v${version.toString()}`);

    // Create reports/ directory if it doesn't exist
    if (!fs.existsSync(REPORTS_DIR)) {
      fs.mkdirSync(REPORTS_DIR, { recursive: true });
    }

    // Create version folder if it doesn't exist
    if (!fs.existsSync(versionFolder)) {
      fs.mkdirSync(versionFolder, { recursive: true });
      return { created: true, path: versionFolder };
    }

    return { created: false, path: versionFolder };

  } catch (error) {
    // Non-critical - warn but continue
    console.log(`${colors.yellow}⚠ Warning: Could not create report folder: ${error.message}${colors.reset}`);
    return { created: false, path: null };
  }
}

/**
 * Check MCP server health (v5.6.0 - Enhanced with Tier 1 health check)
 */
async function checkMcpHealth() {
  const status = {
    available: false,
    servers: {
      required: [],
      optional: []
    },
    errors: [],
    tier1Results: null
  };

  try {
    // Use enhanced MCP health check if available (v5.6.0)
    const mcpHealthCheckPath = path.join(__dirname, 'mcp-health-check.js');

    if (fs.existsSync(mcpHealthCheckPath)) {
      // v5.6.0: Use Tier 1 health check
      const { tier1HealthCheck } = require('./mcp-health-check.js');
      const tier1Results = await tier1HealthCheck();

      status.tier1Results = tier1Results;
      status.available = true;

      // Convert Tier 1 results to legacy format for compatibility
      Object.entries(tier1Results.servers).forEach(([serverName, serverStatus]) => {
        const serverInfo = {
          name: serverName,
          active: serverStatus.status === 'HEALTHY',
          status: serverStatus.status,
          severity: serverStatus.severity
        };

        if (serverStatus.required) {
          status.servers.required.push(serverInfo);
        } else {
          status.servers.optional.push(serverInfo);
        }
      });

      return status;
    }

    // Fallback: Original MCP check (v5.5.0 and earlier)
    const output = execSync('claude mcp list 2>&1', {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    // Parse output to find active servers
    const lines = output.split('\n');
    const activeServers = [];

    lines.forEach(line => {
      // Look for server names in output
      MCP_SERVERS.required.concat(MCP_SERVERS.optional).forEach(server => {
        if (line.toLowerCase().includes(server.toLowerCase()) &&
            !line.toLowerCase().includes('error') &&
            !line.toLowerCase().includes('failed')) {
          if (!activeServers.includes(server)) {
            activeServers.push(server);
          }
        }
      });
    });

    // Check required servers
    MCP_SERVERS.required.forEach(server => {
      status.servers.required.push({
        name: server,
        active: activeServers.includes(server)
      });
    });

    // Check optional servers
    MCP_SERVERS.optional.forEach(server => {
      status.servers.optional.push({
        name: server,
        active: activeServers.includes(server)
      });
    });

    status.available = true;

  } catch (error) {
    // MCP check failed - non-critical
    status.available = false;
    status.errors.push(error.message);
  }

  return status;
}

/**
 * Detect version bump suggestion (same logic as version-bump.js)
 */
function detectVersionBump() {
  try {
    const recentCommits = execSync('git log --oneline -10 2>/dev/null', { encoding: 'utf-8' }).trim();
    const diffStat = execSync('git diff --stat HEAD~1 2>/dev/null', { encoding: 'utf-8' }).trim();

    // Check for uncommitted changes
    const statusOutput = execSync('git status --porcelain 2>/dev/null', { encoding: 'utf-8' }).trim();
    if (!statusOutput) {
      return null; // No changes to analyze
    }

    // Check for breaking change indicators
    if (recentCommits.match(/BREAKING CHANGE|breaking:/i)) {
      return { type: 'MAJOR', reason: 'Breaking change detected', confidence: 'HIGH' };
    }

    // Check for feature additions
    if (recentCommits.match(/^[a-f0-9]+ feat:|^[a-f0-9]+ feature:/mi)) {
      return { type: 'MINOR', reason: 'Feature addition detected', confidence: 'HIGH' };
    }

    // Check for new src/ files
    if (diffStat.match(/src\/[^|]+\|\s+\d+ \+/)) {
      const newFiles = (diffStat.match(/src\/[^|]+\|\s+\d+ \+/g) || []).length;
      if (newFiles >= 2) {
        return { type: 'MINOR', reason: `${newFiles} new files detected`, confidence: 'MEDIUM' };
      }
    }

    // Check for bug fixes
    if (recentCommits.match(/^[a-f0-9]+ fix:|^[a-f0-9]+ bug:/mi)) {
      return { type: 'PATCH', reason: 'Bug fix detected', confidence: 'HIGH' };
    }

    // Default for any uncommitted changes
    return { type: 'PATCH', reason: 'Changes detected', confidence: 'LOW' };

  } catch (error) {
    return null; // Can't detect
  }
}

/**
 * Discover domain packs (v5.7.0)
 */
function discoverDomainPacksIfAvailable() {
  if (!discoverDomainPacks) {
    return null;
  }

  try {
    return discoverDomainPacks();
  } catch (error) {
    // Non-critical - domain packs optional
    return null;
  }
}

/**
 * Check for workflow in progress (v5.8.3)
 */
function checkWorkflowInProgress() {
  if (!getResumeInfo) {
    return null;
  }

  try {
    return getResumeInfo();
  } catch (error) {
    // Non-critical - workflow state optional
    return null;
  }
}

/**
 * Detect a GodMode repo signature in a directory (v8.6.0)
 * Signature: VERSION file + CLAUDE.md + scripts/apply-global-claude-setup.sh
 */
function isGodModeRepoDir(dir) {
  try {
    return (
      fs.existsSync(path.join(dir, 'VERSION')) &&
      fs.existsSync(path.join(dir, 'CLAUDE.md')) &&
      fs.existsSync(path.join(dir, 'scripts', 'apply-global-claude-setup.sh'))
    );
  } catch (error) {
    return false;
  }
}

/**
 * Find a GodMode repo VERSION by walking up from cwd up to 2 ancestor levels (v8.6.0)
 */
function findRepoVersion() {
  try {
    let dir = process.cwd();
    for (let i = 0; i <= 2; i++) {
      if (isGodModeRepoDir(dir)) {
        const content = fs.readFileSync(path.join(dir, 'VERSION'), 'utf8');
        return content.trim().replace(/^v/, '') || null;
      }
      const parent = path.dirname(dir);
      if (parent === dir) break;
      dir = parent;
    }
  } catch (error) {
    // Non-critical - degrade silently
  }
  return null;
}

/**
 * Read a version-like marker file, tolerating absence (v8.6.0)
 */
function readVersionMarker(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf8').trim().replace(/^v/, '');
    return content || null;
  } catch (error) {
    return null;
  }
}

/**
 * Detect install/repo version drift (v8.6.0 - Sprint 02)
 * Never throws - degrades to no warnings on any error.
 */
function detectDriftWarnings() {
  const warnings = [];

  try {
    const marker = readVersionMarker(INSTALL_VERSION_MARKER);
    const claudeVersion = readVersionMarker(VERSION_FILE);
    const repoVersion = findRepoVersion();

    if (marker && repoVersion && marker !== repoVersion) {
      warnings.push(
        `Install v${marker} behind repo v${repoVersion} — run scripts/apply-global-claude-setup.sh`
      );
    }

    if (marker && claudeVersion && claudeVersion !== marker) {
      warnings.push(
        `~/.claude/VERSION (v${claudeVersion}) != install marker (v${marker})`
      );
    }
  } catch (error) {
    // Non-critical - degrade silently, never crash the banner
  }

  return warnings;
}

/**
 * Detect broken hook wiring in ~/.claude/settings.json (v8.6.0 - Sprint 02)
 * Scans hook command strings for $CLAUDE_* tokens (other than
 * ${CLAUDE_PLUGIN_ROOT}) or analyze-prompt.js references.
 * Tolerates absence/parse errors silently - never crashes the banner.
 */
function detectBrokenHookWiring() {
  try {
    if (!fs.existsSync(CLAUDE_SETTINGS_FILE)) return false;

    const settings = JSON.parse(fs.readFileSync(CLAUDE_SETTINGS_FILE, 'utf8'));
    const hooks = settings && settings.hooks;
    if (!hooks || typeof hooks !== 'object') return false;

    const FORBIDDEN_VAR_RE = /\$CLAUDE_(?!\{?PLUGIN_ROOT\b)/;
    const ANALYZE_PROMPT_RE = /analyze-prompt\.js/;

    for (const entries of Object.values(hooks)) {
      if (!Array.isArray(entries)) continue;
      for (const entry of entries) {
        const hookList = entry && entry.hooks;
        if (!Array.isArray(hookList)) continue;
        for (const h of hookList) {
          const command = h && typeof h.command === 'string' ? h.command : '';
          if (FORBIDDEN_VAR_RE.test(command) || ANALYZE_PROMPT_RE.test(command)) {
            return true;
          }
        }
      }
    }
  } catch (error) {
    // Non-critical - degrade silently, never crash the banner
  }

  return false;
}

/**
 * Display workflow resume box (v5.8.3)
 */
function displayWorkflowResume(resumeInfo) {
  const lines = [
    `${colors.yellow}⚠ WORKFLOW IN PROGRESS DETECTED${colors.reset}`,
    '',
    `${colors.bright}Task:${colors.reset} ${resumeInfo.description}`,
    `${colors.bright}Type:${colors.reset} ${resumeInfo.taskType.toUpperCase()}`,
    `${colors.bright}Version:${colors.reset} ${resumeInfo.version}`,
    `${colors.bright}Stage:${colors.reset} ${resumeInfo.stage}`,
    `${colors.bright}Progress:${colors.reset} ${resumeInfo.progress} (${resumeInfo.completed.length}/${resumeInfo.completed.length + resumeInfo.pending.length} agents)`,
    '',
    `${colors.cyan}Completed:${colors.reset} ${resumeInfo.completed.join(', ') || 'None'}`,
    `${colors.cyan}Pending:${colors.reset} ${resumeInfo.pending.join(', ') || 'None'}`,
    ''
  ];

  // Quality gates status
  const validatorIcon = resumeInfo.qualityGates.validator === 'APPROVED' ? colors.green + '✓' :
                        resumeInfo.qualityGates.validator === 'BLOCKED' ? colors.red + '✗' :
                        resumeInfo.qualityGates.validator === 'PENDING' ? colors.yellow + '○' :
                        colors.gray + '–';
  const testerIcon = resumeInfo.qualityGates.tester === 'APPROVED' ? colors.green + '✓' :
                     resumeInfo.qualityGates.tester === 'BLOCKED' ? colors.red + '✗' :
                     resumeInfo.qualityGates.tester === 'PENDING' ? colors.yellow + '○' :
                     colors.gray + '–';

  lines.push(`${colors.cyan}Quality Gates:${colors.reset} validator=${validatorIcon}${colors.reset} ${resumeInfo.qualityGates.validator}, tester=${testerIcon}${colors.reset} ${resumeInfo.qualityGates.tester}`);

  if (resumeInfo.qualityGates.status) {
    lines.push(`${colors.bright}Gate Status:${colors.reset} ${resumeInfo.qualityGates.status}`);
  }

  lines.push('');
  lines.push(`${colors.bright}Elapsed Time:${colors.reset} ${resumeInfo.elapsedTime}`);
  lines.push(`${colors.bright}Files Changed:${colors.reset} ${resumeInfo.filesChanged}`);
  lines.push(`${colors.bright}Push Approved:${colors.reset} ${resumeInfo.pushApproved ? colors.green + 'YES' : colors.red + 'NO'}${colors.reset}`);
  lines.push('');
  lines.push(`${colors.bright}Next Action:${colors.reset} ${resumeInfo.nextAction}`);
  lines.push('');
  lines.push(`${colors.gray}Use the RESTART PROMPT below to continue this workflow.${colors.reset}`);

  printBox(lines, colors.yellow);
}

/**
 * Display welcome message with system status
 */
function displayWelcome(version, mcpStatus, reportFolder, versionBump, domainPacks, driftWarnings, hookWiringBroken) {
  const lines = [
    `${colors.bright}CC_GodMode v${version.toString()}${colors.reset}`,
    ''
  ];

  // System Status Section
  lines.push(`${colors.cyan}System Status${colors.reset}`);

  // VERSION status
  lines.push(`  ${colors.green}✓${colors.reset} VERSION: ${version.toString()}`);

  // Report folder status
  if (reportFolder.path) {
    const statusIcon = reportFolder.created ? colors.green + '✓' : colors.gray + '○';
    const statusText = reportFolder.created ? 'Created' : 'Exists';
    lines.push(`  ${statusIcon}${colors.reset} Reports: reports/v${version.toString()}/ (${statusText})`);
  } else {
    lines.push(`  ${colors.yellow}⚠${colors.reset} Reports: Could not create folder`);
  }

  lines.push('');

  // MCP Servers Section (v5.6.0 - Enhanced with Tier 1 health status)
  lines.push(`${colors.cyan}MCP Servers${colors.reset}`);

  if (mcpStatus.available) {
    // Required servers
    const requiredStatus = mcpStatus.servers.required.map(s => {
      let icon = colors.green + '✓';

      // v5.6.0: Use enhanced status if available
      if (s.status) {
        switch (s.status) {
          case 'HEALTHY':
            icon = colors.green + '✓';
            break;
          case 'WARNING':
            icon = colors.yellow + '⚠';
            break;
          case 'CRITICAL':
            icon = colors.red + '✗';
            break;
          case 'OFFLINE':
            icon = colors.gray + '○';
            break;
          default:
            icon = s.active ? colors.green + '✓' : colors.red + '✗';
        }
      } else {
        // Legacy status
        icon = s.active ? colors.green + '✓' : colors.red + '✗';
      }

      return `${icon} ${s.name}${colors.reset}`;
    }).join('  ');

    // Optional servers
    const optionalStatus = mcpStatus.servers.optional.map(s => {
      let icon = colors.green + '✓';

      // v5.6.0: Use enhanced status if available
      if (s.status) {
        switch (s.status) {
          case 'HEALTHY':
            icon = colors.green + '✓';
            break;
          case 'WARNING':
            icon = colors.yellow + '⚠';
            break;
          case 'OFFLINE':
            icon = colors.gray + '○';
            break;
          default:
            icon = s.active ? colors.green + '✓' : colors.gray + '○';
        }
      } else {
        // Legacy status
        icon = s.active ? colors.green + '✓' : colors.gray + '○';
      }

      return `${icon} ${s.name}${colors.reset}`;
    }).join('  ');

    lines.push(`  ${requiredStatus}  ${optionalStatus}`);

    // Check if any required servers are missing
    const missingRequired = mcpStatus.servers.required.filter(s => !s.active);
    if (missingRequired.length > 0) {
      lines.push('');
      lines.push(`  ${colors.yellow}⚠ Missing required: ${missingRequired.map(s => s.name).join(', ')}${colors.reset}`);
    }

    // v5.6.0: Show Tier 1 health check duration if available
    if (mcpStatus.tier1Results) {
      const duration = mcpStatus.tier1Results.duration;
      const healthySummary = `${mcpStatus.tier1Results.summary.healthy}/${mcpStatus.tier1Results.summary.total} healthy`;
      lines.push('');
      lines.push(`  ${colors.gray}Health check: ${healthySummary} (${duration}ms)${colors.reset}`);
    }

  } else {
    lines.push(`  ${colors.yellow}⚠ Could not check MCP status${colors.reset}`);
    lines.push(`  ${colors.gray}Run: claude mcp list${colors.reset}`);
  }

  lines.push('');

  // v5.7.0: Domain Packs Section
  if (domainPacks && domainPacks.length > 0) {
    lines.push(`${colors.cyan}Domain Packs${colors.reset}`);
    domainPacks.forEach(pack => {
      lines.push(`  ${colors.green}✓${colors.reset} ${pack.name} (${pack.agentCount} agents)`);
    });
    lines.push('');
  }

  // Agents Section
  lines.push(`${colors.cyan}Agents Ready${colors.reset}`);

  // Format agents in two rows
  const row1 = AGENTS.slice(0, 4).join(' ');
  const row2 = AGENTS.slice(4).join(' ');

  lines.push(`  ${colors.gray}${row1}${colors.reset}`);
  lines.push(`  ${colors.gray}${row2}${colors.reset}`);

  // v8.6.0 - Sprint 02: Drift Guard section (only rendered when triggered)
  const hasDriftWarnings = Array.isArray(driftWarnings) && driftWarnings.length > 0;
  if (hasDriftWarnings || hookWiringBroken) {
    lines.push('');
    lines.push(`${colors.yellow}Drift Guard${colors.reset}`);
    if (hasDriftWarnings) {
      driftWarnings.forEach(w => lines.push(`  ${colors.yellow}⚠${colors.reset} ${w}`));
    }
    if (hookWiringBroken) {
      lines.push(
        `  ${colors.yellow}⚠${colors.reset} Broken hook wiring detected in ~/.claude/settings.json — run apply-global-claude-setup.sh --fix-hooks`
      );
    }
  }

  // Print the box
  printBox(lines, colors.blue);

  // Print version bump suggestion if available (only for MEDIUM/HIGH confidence)
  if (versionBump && versionBump.confidence !== 'LOW') {
    console.log('');
    printBox([
      `${colors.yellow}Version Bump Suggestion${colors.reset}`,
      '',
      `  Type: ${colors.bright}${versionBump.type}${colors.reset}`,
      `  Reason: ${versionBump.reason}`,
      `  Confidence: ${versionBump.confidence}`,
      '',
      `  Run: ${colors.cyan}node scripts/version-bump.js ${versionBump.type.toLowerCase()}${colors.reset}`
    ], colors.yellow);
  }
}

/**
 * Main function (v5.8.3 - Enhanced with workflow state detection)
 */
async function main() {
  // v5.8.3: Check for workflow in progress FIRST
  const workflowResume = checkWorkflowInProgress();

  if (workflowResume) {
    // Display workflow resume information prominently
    console.log(''); // Empty line before box
    displayWorkflowResume(workflowResume);
    console.log(''); // Empty line after box
    console.log('');
    console.log(`${colors.bright}RESTART PROMPT:${colors.reset}`);
    console.log(`${colors.cyan}Continue workflow for v${workflowResume.version}: ${workflowResume.description}${colors.reset}`);
    console.log('');
    // Continue to show system status below
  }

  // Check VERSION file (v8.6.0: returns null when not installed/unreadable -
  // this is a SessionStart hook and must never exit non-zero)
  const version = checkVersionFile();

  if (!version) {
    printNotInstalledNotice();
    console.log('');
    return;
  }

  // Create report folder
  const reportFolder = createReportFolder(version);

  // Check MCP health (v5.6.0 - Now async)
  const mcpStatus = await checkMcpHealth();

  // Detect version bump suggestion
  const versionBump = detectVersionBump();

  // v5.7.0: Discover domain packs
  const domainPacks = discoverDomainPacksIfAvailable();

  // v8.6.0 - Sprint 02: Drift guard + broken-wiring guard (never throws)
  const driftWarnings = detectDriftWarnings();
  const hookWiringBroken = detectBrokenHookWiring();

  // Display welcome message
  if (!workflowResume) {
    console.log(''); // Empty line before box (only if no workflow resume shown)
  }
  displayWelcome(version, mcpStatus, reportFolder, versionBump, domainPacks, driftWarnings, hookWiringBroken);
  console.log(''); // Empty line after box
}

// Run
main().catch(error => {
  console.error(`${colors.red}SessionStart error: ${error.message}${colors.reset}`);
  process.exit(1);
});
