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
const { execSync } = require('child_process');

// Configuration - use current working directory
const VERSION_FILE = path.join(process.cwd(), 'VERSION');
const REPORTS_DIR = path.join(process.cwd(), 'reports');

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
 * Check VERSION file and return version
 */
function checkVersionFile() {
  try {
    // Check if VERSION file exists
    if (!fs.existsSync(VERSION_FILE)) {
      errorExit(
        'VERSION file not found',
        [
          'Create a VERSION file in the project root',
          'Example: echo "1.0.0" > VERSION',
          'This file is required for CC_GodMode to function'
        ]
      );
    }

    // Read and parse version
    const content = fs.readFileSync(VERSION_FILE, 'utf8');
    const version = parseVersion(content);

    if (!version) {
      errorExit(
        `Invalid version format in VERSION file: "${content.trim()}"`,
        [
          'VERSION file must contain semantic version (MAJOR.MINOR.PATCH)',
          'Example: 1.0.0',
          'Current content is not valid semver'
        ]
      );
    }

    return version;

  } catch (error) {
    errorExit(
      `Failed to read VERSION file: ${error.message}`,
      [
        'Ensure VERSION file is readable',
        'Check file permissions',
        'Verify file is not corrupted'
      ]
    );
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
 * Check MCP server health
 */
function checkMcpHealth() {
  const status = {
    available: false,
    servers: {
      required: [],
      optional: []
    },
    errors: []
  };

  try {
    // Run claude mcp list command
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
 * Display welcome message with system status
 */
function displayWelcome(version, mcpStatus, reportFolder, versionBump) {
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

  // MCP Servers Section
  lines.push(`${colors.cyan}MCP Servers${colors.reset}`);

  if (mcpStatus.available) {
    // Required servers
    const requiredStatus = mcpStatus.servers.required.map(s => {
      const icon = s.active ? colors.green + '✓' : colors.red + '✗';
      return `${icon} ${s.name}${colors.reset}`;
    }).join('  ');

    // Optional servers
    const optionalStatus = mcpStatus.servers.optional.map(s => {
      const icon = s.active ? colors.green + '✓' : colors.gray + '○';
      return `${icon} ${s.name}${colors.reset}`;
    }).join('  ');

    lines.push(`  ${requiredStatus}  ${optionalStatus}`);

    // Check if any required servers are missing
    const missingRequired = mcpStatus.servers.required.filter(s => !s.active);
    if (missingRequired.length > 0) {
      lines.push('');
      lines.push(`  ${colors.yellow}⚠ Missing required: ${missingRequired.map(s => s.name).join(', ')}${colors.reset}`);
    }

  } else {
    lines.push(`  ${colors.yellow}⚠ Could not check MCP status${colors.reset}`);
    lines.push(`  ${colors.gray}Run: claude mcp list${colors.reset}`);
  }

  lines.push('');

  // Agents Section
  lines.push(`${colors.cyan}Agents Ready${colors.reset}`);

  // Format agents in two rows
  const row1 = AGENTS.slice(0, 4).join(' ');
  const row2 = AGENTS.slice(4).join(' ');

  lines.push(`  ${colors.gray}${row1}${colors.reset}`);
  lines.push(`  ${colors.gray}${row2}${colors.reset}`);

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
 * Main function
 */
function main() {
  // Check VERSION file
  const version = checkVersionFile();

  // Create report folder
  const reportFolder = createReportFolder(version);

  // Check MCP health
  const mcpStatus = checkMcpHealth();

  // Detect version bump suggestion
  const versionBump = detectVersionBump();

  // Display welcome message
  console.log(''); // Empty line before box
  displayWelcome(version, mcpStatus, reportFolder, versionBump);
  console.log(''); // Empty line after box
}

// Run
main();
