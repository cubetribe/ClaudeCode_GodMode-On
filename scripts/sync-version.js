#!/usr/bin/env node

/**
 * Version Sync Script (v5.11.0)
 *
 * Ensures all version references are synchronized across the project.
 * Run this BEFORE every release to prevent version mismatches.
 *
 * Usage:
 *   node scripts/sync-version.js --check    # Check for mismatches (dry-run)
 *   node scripts/sync-version.js --sync     # Actually sync all versions
 */

const fs = require('fs');
const path = require('path');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bright: '\x1b[1m'
};

// Get project root
const PROJECT_ROOT = path.resolve(__dirname, '..');

// Files to check/sync (relative to PROJECT_ROOT)
const FILES_TO_SYNC = [
  'VERSION',
  'CLAUDE.md',
  'CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md',
  'CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md',
  'CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md',
  'CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md',
  'CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md',
  'CC-GodMode-Prompts/QUICK_START.md'
];

/**
 * Read the current version from VERSION file
 */
function getCurrentVersion() {
  const versionFile = path.join(PROJECT_ROOT, 'VERSION');
  if (!fs.existsSync(versionFile)) {
    console.error(`${colors.red}Error: VERSION file not found${colors.reset}`);
    process.exit(1);
  }
  return fs.readFileSync(versionFile, 'utf-8').trim();
}

/**
 * Check a file for version mismatches
 */
function checkFile(filePath, targetVersion) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    return { status: 'missing', file: filePath };
  }

  const content = fs.readFileSync(fullPath, 'utf-8');

  // Simple check: does the file contain the target version in a version context?
  const versionPatterns = [
    `> **Version:** ${targetVersion}`,
    `**Current Version:** v${targetVersion}`,
    `CC_GodMode v${targetVersion}`,
    `Version ${targetVersion} in header`
  ];

  // For VERSION file, just check the content directly
  if (filePath === 'VERSION') {
    if (content.trim() === targetVersion) {
      return { status: 'ok', file: filePath };
    } else {
      return { status: 'mismatch', file: filePath, found: content.trim(), expected: targetVersion };
    }
  }

  // For other files, check if target version appears
  const hasCorrectVersion = versionPatterns.some(pattern => content.includes(pattern));

  // Check for old versions (5.10.0, 5.9.x, etc.)
  const oldVersionMatch = content.match(/> \*\*Version:\*\* (\d+\.\d+\.\d+)/);

  if (oldVersionMatch && oldVersionMatch[1] !== targetVersion) {
    return { status: 'mismatch', file: filePath, found: oldVersionMatch[1], expected: targetVersion };
  }

  if (hasCorrectVersion) {
    return { status: 'ok', file: filePath };
  }

  return { status: 'unknown', file: filePath };
}

/**
 * Sync a file to target version
 */
function syncFile(filePath, targetVersion) {
  const fullPath = path.join(PROJECT_ROOT, filePath);

  if (!fs.existsSync(fullPath)) {
    return { status: 'skipped', file: filePath, reason: 'not found' };
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  const original = content;

  // For VERSION file
  if (filePath === 'VERSION') {
    content = targetVersion + '\n';
  } else {
    // Replace version patterns
    // Pattern 1: > **Version:** X.Y.Z
    content = content.replace(/> \*\*Version:\*\* \d+\.\d+\.\d+/g, `> **Version:** ${targetVersion}`);

    // Pattern 2: **Current Version:** vX.Y.Z
    content = content.replace(/\*\*Current Version:\*\* v\d+\.\d+\.\d+/g, `**Current Version:** v${targetVersion}`);

    // Pattern 3: CC_GodMode vX.Y.Z (title line, be careful not to change CHANGELOG references)
    // Only replace in specific contexts
    content = content.replace(/CC_GodMode v\d+\.\d+\.\d+ - The Fail-Safe Release/g, `CC_GodMode v${targetVersion} - The Fail-Safe Release`);

    // Pattern 4: Version X.Y.Z in header (examples)
    content = content.replace(/Version \d+\.\d+\.\d+ in header/g, `Version ${targetVersion} in header`);
  }

  if (content !== original) {
    fs.writeFileSync(fullPath, content);
    return { status: 'updated', file: filePath };
  }

  return { status: 'unchanged', file: filePath };
}

/**
 * Main check mode
 */
function runCheck(targetVersion) {
  console.log('');
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}CC_GodMode Version Check${colors.reset}                                  ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}Target Version:${colors.reset} ${targetVersion}`);
  console.log('');

  let mismatches = 0;

  for (const file of FILES_TO_SYNC) {
    const result = checkFile(file, targetVersion);

    if (result.status === 'ok') {
      console.log(`  ${colors.green}✓${colors.reset} ${file}`);
    } else if (result.status === 'mismatch') {
      console.log(`  ${colors.red}✗${colors.reset} ${file} (found: ${result.found})`);
      mismatches++;
    } else if (result.status === 'missing') {
      console.log(`  ${colors.yellow}?${colors.reset} ${file} (not found)`);
    } else {
      console.log(`  ${colors.cyan}○${colors.reset} ${file}`);
    }
  }

  console.log('');

  if (mismatches > 0) {
    console.log(`${colors.red}✗ Found ${mismatches} version mismatch(es)${colors.reset}`);
    console.log(`${colors.yellow}Run: node scripts/sync-version.js --sync${colors.reset}`);
    process.exit(1);
  } else {
    console.log(`${colors.green}✓ All versions synchronized!${colors.reset}`);
  }
  console.log('');
}

/**
 * Main sync mode
 */
function runSync(targetVersion) {
  console.log('');
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║${colors.reset}  ${colors.bright}CC_GodMode Version Sync${colors.reset}                                   ${colors.cyan}║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  console.log(`${colors.bright}Target Version:${colors.reset} ${targetVersion}`);
  console.log('');

  let updated = 0;

  for (const file of FILES_TO_SYNC) {
    const result = syncFile(file, targetVersion);

    if (result.status === 'updated') {
      console.log(`  ${colors.green}✓${colors.reset} Updated: ${file}`);
      updated++;
    } else if (result.status === 'unchanged') {
      console.log(`  ${colors.cyan}○${colors.reset} Already current: ${file}`);
    } else if (result.status === 'skipped') {
      console.log(`  ${colors.yellow}○${colors.reset} Skipped: ${file} (${result.reason})`);
    }
  }

  console.log('');
  console.log(`${colors.green}✓ Sync complete! ${updated} file(s) updated.${colors.reset}`);
  console.log('');
}

/**
 * Main
 */
function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    console.log('');
    console.log('CC_GodMode Version Sync Script');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/sync-version.js --check   Check for version mismatches');
    console.log('  node scripts/sync-version.js --sync    Sync all versions to VERSION file');
    console.log('');
    process.exit(0);
  }

  const targetVersion = getCurrentVersion();

  if (args.includes('--sync')) {
    runSync(targetVersion);
  } else {
    runCheck(targetVersion);
  }
}

main();
