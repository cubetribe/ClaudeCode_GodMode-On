#!/usr/bin/env node

/**
 * CC_GodMode Version Bump Utility
 *
 * Increments version number and prepares CHANGELOG.md entry.
 * Follows semantic versioning (MAJOR.MINOR.PATCH).
 *
 * Usage: node scripts/version-bump.js [major|minor|patch] [--dry-run] [--help]
 *
 * Copyright (c) 2025 Dennis Westermann
 * www.dennis-westermann.de
 */

const fs = require('fs');
const path = require('path');

// Configuration - use current working directory, not script location
const VERSION_FILE = path.join(process.cwd(), 'VERSION');
const CHANGELOG_FILE = path.join(process.cwd(), 'CHANGELOG.md');

// ANSI Colors (same as check-update.js)
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

/**
 * Print styled box output
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
    `${colors.red}✗ ERROR${colors.reset}`,
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
 * Print help message
 */
function printHelp() {
  const lines = [
    `${colors.bright}CC_GodMode Version Bump${colors.reset}`,
    '',
    `${colors.cyan}USAGE${colors.reset}`,
    '  node scripts/version-bump.js <type> [options]',
    '',
    `${colors.cyan}TYPE${colors.reset}`,
    '  major     Increment MAJOR version (X.0.0)',
    '  minor     Increment MINOR version (0.X.0)',
    '  patch     Increment PATCH version (0.0.X)',
    '',
    `${colors.cyan}OPTIONS${colors.reset}`,
    '  --auto     Auto-detect bump type from git history',
    '  --dry-run  Show what would happen without making changes',
    '  --help     Show this help message',
    '',
    `${colors.cyan}EXAMPLES${colors.reset}`,
    '  node scripts/version-bump.js patch',
    '  node scripts/version-bump.js minor --dry-run',
    '  node scripts/version-bump.js major',
    '  node scripts/version-bump.js --auto',
    '',
    `${colors.cyan}WHAT IT DOES${colors.reset}`,
    '  1. Reads current version from VERSION file',
    '  2. Increments specified segment (or auto-detects)',
    '  3. Checks CHANGELOG.md for version uniqueness',
    '  4. Writes new VERSION file',
    '  5. Inserts CHANGELOG template entry',
    '  6. Creates report folder (reports/vX.X.X/)'
  ];

  printBox(lines, colors.blue);
  process.exit(0);
}

/**
 * Parse semantic version string
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
 * Increment version based on bump type
 */
function incrementVersion(version, bumpType) {
  const newVersion = { ...version, toString: version.toString };

  switch (bumpType) {
    case 'major':
      newVersion.major += 1;
      newVersion.minor = 0;
      newVersion.patch = 0;
      break;
    case 'minor':
      newVersion.minor += 1;
      newVersion.patch = 0;
      break;
    case 'patch':
      newVersion.patch += 1;
      break;
    default:
      return null;
  }

  return newVersion;
}

/**
 * Read current version from VERSION file
 */
function readCurrentVersion() {
  if (!fs.existsSync(VERSION_FILE)) {
    errorExit(
      'VERSION file not found',
      [
        'Create a VERSION file in the project root',
        'Example: echo "1.0.0" > VERSION'
      ]
    );
  }

  const content = fs.readFileSync(VERSION_FILE, 'utf8');
  const version = parseVersion(content);

  if (!version) {
    errorExit(
      `Invalid version format in VERSION file: "${content.trim()}"`,
      [
        'VERSION file must contain semantic version (MAJOR.MINOR.PATCH)',
        'Example: 1.0.0'
      ]
    );
  }

  return version;
}

/**
 * Check if version already exists in CHANGELOG.md
 */
function checkChangelogUniqueness(versionString) {
  if (!fs.existsSync(CHANGELOG_FILE)) {
    // No CHANGELOG yet, that's OK
    return true;
  }

  const changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
  const versionPattern = new RegExp(`^## \\[${versionString.replace(/\./g, '\\.')}\\]`, 'm');

  return !versionPattern.test(changelog);
}

/**
 * Write new version to VERSION file
 */
function writeVersionFile(version, dryRun = false) {
  const content = `${version.toString()}\n`;

  if (dryRun) {
    console.log(`${colors.gray}[DRY RUN] Would write to VERSION file:${colors.reset}`);
    console.log(`${colors.cyan}${content.trim()}${colors.reset}`);
  } else {
    fs.writeFileSync(VERSION_FILE, content, 'utf8');
  }
}

/**
 * Get current date in YYYY-MM-DD format
 */
function getCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Generate CHANGELOG template entry
 */
function generateChangelogEntry(version) {
  const date = getCurrentDate();

  return [
    `## [${version.toString()}] - ${date}`,
    '',
    '### Added',
    '',
    '- ',
    '',
    '### Changed',
    '',
    '- ',
    '',
    '### Fixed',
    '',
    '- ',
    '',
    '---',
    ''
  ].join('\n');
}

/**
 * Insert CHANGELOG entry after header
 */
function insertChangelogEntry(version, dryRun = false) {
  let changelog = '';

  if (fs.existsSync(CHANGELOG_FILE)) {
    changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
  } else {
    // Create new CHANGELOG with header
    changelog = [
      '# Changelog',
      '',
      'All notable changes to CC_GodMode will be documented in this file.',
      '',
      'The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),',
      'and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).',
      '',
      '---',
      ''
    ].join('\n');
  }

  // Find insertion point (after first "---" separator)
  const separatorIndex = changelog.indexOf('---\n');

  if (separatorIndex === -1) {
    errorExit(
      'CHANGELOG.md format is invalid',
      [
        'CHANGELOG.md must contain a "---" separator after the header',
        'See: https://keepachangelog.com/en/1.0.0/'
      ]
    );
  }

  const insertionPoint = separatorIndex + 4; // After "---\n"
  const entry = '\n' + generateChangelogEntry(version);
  const newChangelog = changelog.slice(0, insertionPoint) + entry + changelog.slice(insertionPoint);

  if (dryRun) {
    console.log('');
    console.log(`${colors.gray}[DRY RUN] Would insert into CHANGELOG.md:${colors.reset}`);
    console.log(`${colors.cyan}${entry.trim()}${colors.reset}`);
  } else {
    fs.writeFileSync(CHANGELOG_FILE, newChangelog, 'utf8');
  }
}

/**
 * Auto-detect suggested bump type based on git changes
 */
function detectBumpType() {
  const detection = {
    type: 'patch',
    reason: 'Default (no strong indicators)',
    confidence: 'LOW'
  };

  try {
    // Get recent commit messages
    const recentCommits = execSync('git log --oneline -10 2>/dev/null', { encoding: 'utf-8' }).trim();

    // Get git diff to check for new files
    const diffStat = execSync('git diff --stat HEAD~1 2>/dev/null', { encoding: 'utf-8' }).trim();

    // Check for breaking change indicators
    if (recentCommits.match(/BREAKING CHANGE|breaking:/i)) {
      detection.type = 'major';
      detection.reason = 'BREAKING CHANGE keyword detected in commits';
      detection.confidence = 'HIGH';
      return detection;
    }

    // Check for feature additions
    if (recentCommits.match(/^[a-f0-9]+ feat:|^[a-f0-9]+ feature:/mi)) {
      detection.type = 'minor';
      detection.reason = 'Feature commit detected (feat:)';
      detection.confidence = 'HIGH';
      return detection;
    }

    // Check for new src/ files (likely new features)
    if (diffStat.match(/src\/[^|]+\|\s+\d+ \+/)) {
      const newFiles = (diffStat.match(/src\/[^|]+\|\s+\d+ \+/g) || []).length;
      if (newFiles >= 2) {
        detection.type = 'minor';
        detection.reason = `${newFiles} new files in src/ directory detected`;
        detection.confidence = 'MEDIUM';
        return detection;
      }
    }

    // Check for bug fix indicators
    if (recentCommits.match(/^[a-f0-9]+ fix:|^[a-f0-9]+ bug:/mi)) {
      detection.type = 'patch';
      detection.reason = 'Bug fix commit detected (fix:)';
      detection.confidence = 'HIGH';
      return detection;
    }

    // Check for documentation or test-only changes
    if (recentCommits.match(/^[a-f0-9]+ docs:|^[a-f0-9]+ test:/mi) &&
        !recentCommits.match(/^[a-f0-9]+ feat:|^[a-f0-9]+ fix:/mi)) {
      detection.type = 'patch';
      detection.reason = 'Documentation or test changes only';
      detection.confidence = 'MEDIUM';
      return detection;
    }

  } catch (error) {
    // Git commands failed - return default
    detection.reason = 'Could not analyze git history';
    detection.confidence = 'LOW';
  }

  return detection;
}

/**
 * Create report folder for version
 */
function createReportFolder(version) {
  try {
    const reportsDir = path.join(process.cwd(), 'reports');
    const versionFolder = path.join(reportsDir, `v${version.toString()}`);

    // Create reports/ directory if it doesn't exist
    if (!fs.existsSync(reportsDir)) {
      fs.mkdirSync(reportsDir, { recursive: true });
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
 * Main function
 */
function main() {
  const args = process.argv.slice(2);

  // Parse arguments
  const dryRun = args.includes('--dry-run');
  const needsHelp = args.includes('--help') || args.includes('-h');
  const autoDetect = args.includes('--auto');
  let bumpType = args.find(arg => ['major', 'minor', 'patch'].includes(arg));

  // Show help
  if (needsHelp) {
    printHelp();
  }

  // Auto-detect if requested
  if (autoDetect && !bumpType) {
    const detection = detectBumpType();

    // Only use auto-detection if confidence is MEDIUM or HIGH
    if (detection.confidence !== 'LOW') {
      bumpType = detection.type;
      console.log('');
      printBox([
        `${colors.cyan}🤖 AUTO-DETECTION${colors.reset}`,
        '',
        `Type: ${colors.bright}${detection.type.toUpperCase()}${colors.reset}`,
        `Reason: ${detection.reason}`,
        `Confidence: ${detection.confidence}`,
        ''
      ], colors.cyan);
      console.log('');
    } else {
      console.log(`${colors.yellow}⚠ Auto-detection confidence too low - please specify type manually${colors.reset}`);
      console.log('');
    }
  }

  // Validate bump type
  if (!bumpType) {
    errorExit(
      'Missing or invalid bump type',
      [
        'Specify one of: major, minor, patch',
        'Or use --auto for automatic detection',
        'Example: node scripts/version-bump.js patch',
        'Example: node scripts/version-bump.js --auto',
        'Use --help for more information'
      ]
    );
  }

  // Read current version
  const currentVersion = readCurrentVersion();

  // Increment version
  const newVersion = incrementVersion(currentVersion, bumpType);

  // Check uniqueness
  if (!checkChangelogUniqueness(newVersion.toString())) {
    errorExit(
      `Version ${newVersion.toString()} already exists in CHANGELOG.md`,
      [
        'This version has already been documented',
        'Did you mean to bump a different segment?',
        `Current: ${currentVersion.toString()} → Try different bump type`
      ]
    );
  }

  // Execute or dry-run
  if (dryRun) {
    printBox([
      `${colors.yellow}⚠ DRY RUN MODE${colors.reset}`,
      '',
      `Current:  ${colors.gray}${currentVersion.toString()}${colors.reset}`,
      `New:      ${colors.green}${newVersion.toString()}${colors.reset}`,
      `Type:     ${colors.cyan}${bumpType.toUpperCase()}${colors.reset}`,
      '',
      `${colors.gray}No files will be modified${colors.reset}`
    ], colors.yellow);

    console.log('');
    writeVersionFile(newVersion, true);
    insertChangelogEntry(newVersion, true);

  } else {
    // Write files
    writeVersionFile(newVersion);
    insertChangelogEntry(newVersion);

    // Create report folder
    const reportFolder = createReportFolder(newVersion);

    // Success message
    const successLines = [
      `${colors.green}✓ VERSION BUMPED${colors.reset}`,
      '',
      `${currentVersion.toString()} ${colors.gray}→${colors.reset} ${colors.bright}${newVersion.toString()}${colors.reset}`,
      '',
      `${colors.cyan}Files Updated:${colors.reset}`,
      `  ${colors.gray}•${colors.reset} VERSION`,
      `  ${colors.gray}•${colors.reset} CHANGELOG.md`
    ];

    // Add report folder status
    if (reportFolder.path) {
      const statusText = reportFolder.created ? 'Created' : 'Already exists';
      successLines.push(`  ${colors.gray}•${colors.reset} reports/v${newVersion.toString()}/ (${statusText})`);
    }

    successLines.push('');
    successLines.push(`${colors.cyan}Next Steps:${colors.reset}`);
    successLines.push(`  ${colors.gray}1.${colors.reset} Edit CHANGELOG.md to document changes`);
    successLines.push(`  ${colors.gray}2.${colors.reset} Review and commit changes`);
    successLines.push(`  ${colors.gray}3.${colors.reset} Create release (if needed)`);

    printBox(successLines, colors.green);
  }
}

// Import required for execSync
const { execSync } = require('child_process');

// Run
main();
