#!/usr/bin/env node

/**
 * CC_GodMode Auto-Update System (v5.8.0)
 *
 * Automated update system for CC_GodMode installations.
 * Downloads and applies updates from GitHub repository.
 *
 * Features:
 * - Version comparison (semver)
 * - SHA-based change detection
 * - Automatic backup before updates
 * - Rollback capability
 * - Cross-platform support (macOS, Linux, Windows)
 *
 * CLI Usage:
 *   node auto-update.js --check     # Check for updates
 *   node auto-update.js --update    # Apply updates
 *   node auto-update.js --dry-run   # Show what would change
 *   node auto-update.js --rollback  # Restore backup
 *
 * IMPORTANT: This script NEVER modifies settings.json or mcp.json
 *
 * Copyright (c) 2025 Dennis Westermann
 * www.dennis-westermann.de
 */

const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const os = require('os');

// Configuration
const GITHUB_OWNER = 'cubetribe';
const GITHUB_REPO = 'ClaudeCode_GodMode-On';
const GITHUB_BRANCH = 'main';

// Paths
const HOME_DIR = os.homedir();
const CLAUDE_DIR = path.join(HOME_DIR, '.claude');
const BACKUP_DIR = path.join(HOME_DIR, '.claude.bak');
const VERSION_FILE = path.join(CLAUDE_DIR, 'VERSION');
const LOCK_FILE = path.join(CLAUDE_DIR, '.update-lock');

// Protected files - NEVER modify these
const PROTECTED_FILES = [
  'settings.json',
  'mcp.json',
  'mcp_config.json',
  '.mcp.json',
  'settings.local.json',
  'credentials.json',
  '.env',
  '.env.local'
];

// Files to update
const UPDATE_PATHS = [
  'agents/',
  'scripts/',
  'CLAUDE.md',
  'VERSION',
  'CHANGELOG.md',
  'README.md'
];

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
  white: '\x1b[37m'
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Print styled message
 */
function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

/**
 * Print boxed message
 */
function printBox(lines, color = colors.cyan) {
  const maxLen = Math.max(...lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, '').length));
  const border = '='.repeat(maxLen + 2);

  console.log(`${color}+${border}+${colors.reset}`);
  lines.forEach(line => {
    const plainLen = line.replace(/\x1b\[[0-9;]*m/g, '').length;
    const padding = ' '.repeat(maxLen - plainLen);
    console.log(`${color}|${colors.reset} ${line}${padding} ${color}|${colors.reset}`);
  });
  console.log(`${color}+${border}+${colors.reset}`);
}

/**
 * Check if file is protected
 */
function isProtectedFile(filePath) {
  const filename = path.basename(filePath);
  return PROTECTED_FILES.includes(filename);
}

/**
 * Check if path should be updated
 */
function shouldUpdatePath(filePath) {
  return UPDATE_PATHS.some(updatePath => {
    if (updatePath.endsWith('/')) {
      return filePath.startsWith(updatePath);
    }
    return filePath === updatePath;
  });
}

/**
 * Calculate file hash
 */
function calculateFileHash(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Ensure directory exists
 */
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

/**
 * HTTP GET request
 */
function httpGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);

    const reqOptions = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'GET',
      headers: {
        'User-Agent': 'CC_GodMode-AutoUpdate/1.0',
        'Accept': options.accept || 'application/json',
        ...options.headers
      }
    };

    const req = https.request(reqOptions, (res) => {
      // Handle redirects
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        httpGet(res.headers.location, options).then(resolve).catch(reject);
        return;
      }

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({ data, headers: res.headers });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data.substring(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(options.timeout || 30000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get local version from VERSION file
 */
function getLocalVersion() {
  try {
    if (fs.existsSync(VERSION_FILE)) {
      return fs.readFileSync(VERSION_FILE, 'utf8').trim();
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Get remote version from GitHub
 */
async function getRemoteVersion() {
  try {
    const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/VERSION`;
    const { data } = await httpGet(url, { accept: 'text/plain' });
    return data.trim();
  } catch (error) {
    // Try releases API as fallback
    try {
      const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`;
      const { data } = await httpGet(url, {
        headers: { 'Accept': 'application/vnd.github.v3+json' }
      });
      const release = JSON.parse(data);
      return release.tag_name.replace(/^v/, '');
    } catch (e) {
      throw new Error(`Could not fetch remote version: ${error.message}`);
    }
  }
}

/**
 * Compare semantic versions
 * Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
 */
function compareVersions(v1, v2) {
  const normalize = v => v.replace(/^v/, '').split('.').map(Number);
  const parts1 = normalize(v1);
  const parts2 = normalize(v2);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const p1 = parts1[i] || 0;
    const p2 = parts2[i] || 0;
    if (p1 > p2) return 1;
    if (p1 < p2) return -1;
  }
  return 0;
}

/**
 * Get repository tree from GitHub
 */
async function getRepoTree() {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/git/trees/${GITHUB_BRANCH}?recursive=1`;
  const { data } = await httpGet(url, {
    headers: { 'Accept': 'application/vnd.github.v3+json' }
  });
  const tree = JSON.parse(data);
  return tree.tree.filter(item => item.type === 'blob');
}

/**
 * Get changed files by comparing SHA hashes
 */
async function getChangedFiles() {
  const remoteTree = await getRepoTree();
  const changes = {
    added: [],
    modified: [],
    deleted: [],
    skipped: []
  };

  // Build local file map
  const localFiles = new Map();

  function scanDir(dir, basePath = '') {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        // Skip hidden directories and node_modules
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          scanDir(fullPath, relativePath);
        }
      } else if (entry.isFile()) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          localFiles.set(relativePath, calculateFileHash(content));
        } catch (e) {
          // Skip binary files or unreadable files
        }
      }
    }
  }

  // Scan update paths
  UPDATE_PATHS.forEach(updatePath => {
    const fullPath = path.join(CLAUDE_DIR, updatePath);
    if (updatePath.endsWith('/')) {
      scanDir(fullPath, updatePath.slice(0, -1));
    } else if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        localFiles.set(updatePath, calculateFileHash(content));
      } catch (e) {
        // Skip
      }
    }
  });

  // Compare with remote
  const remoteFiles = new Set();

  for (const item of remoteTree) {
    if (!shouldUpdatePath(item.path)) continue;

    remoteFiles.add(item.path);

    if (isProtectedFile(item.path)) {
      changes.skipped.push({ path: item.path, reason: 'Protected file' });
      continue;
    }

    const localHash = localFiles.get(item.path);

    if (!localHash) {
      changes.added.push({ path: item.path, sha: item.sha });
    } else {
      // GitHub uses git blob SHA, we use content SHA - so we need to fetch and compare
      // For efficiency, we'll mark as "potentially modified" and verify during update
      changes.modified.push({ path: item.path, sha: item.sha, localHash });
    }
  }

  // Check for deleted files (in local but not in remote)
  for (const [localPath] of localFiles) {
    if (!remoteFiles.has(localPath) && shouldUpdatePath(localPath)) {
      if (!isProtectedFile(localPath)) {
        changes.deleted.push({ path: localPath });
      }
    }
  }

  return changes;
}

/**
 * Create backup of current installation
 */
function createBackup() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupPath = path.join(BACKUP_DIR, `backup-${timestamp}`);

  log(`\nCreating backup at ${backupPath}...`, colors.cyan);

  // Ensure backup directory exists
  ensureDir(backupPath);

  // Copy files
  let fileCount = 0;

  function copyDir(src, dest, basePath = '') {
    if (!fs.existsSync(src)) return;

    ensureDir(dest);
    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      const relativePath = basePath ? `${basePath}/${entry.name}` : entry.name;

      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
          copyDir(srcPath, destPath, relativePath);
        }
      } else if (entry.isFile() && shouldUpdatePath(relativePath)) {
        fs.copyFileSync(srcPath, destPath);
        fileCount++;
      }
    }
  }

  // Copy update paths
  UPDATE_PATHS.forEach(updatePath => {
    const srcPath = path.join(CLAUDE_DIR, updatePath);
    const destPath = path.join(backupPath, updatePath);

    if (updatePath.endsWith('/')) {
      copyDir(srcPath, destPath, updatePath.slice(0, -1));
    } else if (fs.existsSync(srcPath)) {
      ensureDir(path.dirname(destPath));
      fs.copyFileSync(srcPath, destPath);
      fileCount++;
    }
  });

  // Save backup metadata
  const metadata = {
    timestamp: new Date().toISOString(),
    version: getLocalVersion(),
    fileCount,
    paths: UPDATE_PATHS
  };

  fs.writeFileSync(
    path.join(backupPath, 'backup-metadata.json'),
    JSON.stringify(metadata, null, 2)
  );

  log(`  Backed up ${fileCount} files`, colors.green);

  return backupPath;
}

/**
 * Download a single file from GitHub
 */
async function downloadFile(filePath) {
  const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${filePath}`;
  const { data } = await httpGet(url, { accept: 'text/plain' });
  return data;
}

/**
 * Update local installation
 */
async function updateLocalInstallation(changes, dryRun = false) {
  const results = {
    updated: [],
    added: [],
    deleted: [],
    failed: [],
    skipped: []
  };

  // Process added files
  for (const file of changes.added) {
    try {
      if (dryRun) {
        log(`  [ADD] ${file.path}`, colors.green);
        results.added.push(file.path);
        continue;
      }

      const content = await downloadFile(file.path);
      const localPath = path.join(CLAUDE_DIR, file.path);

      ensureDir(path.dirname(localPath));
      fs.writeFileSync(localPath, content);

      log(`  [ADD] ${file.path}`, colors.green);
      results.added.push(file.path);
    } catch (error) {
      log(`  [FAIL] ${file.path}: ${error.message}`, colors.red);
      results.failed.push({ path: file.path, error: error.message });
    }
  }

  // Process modified files
  for (const file of changes.modified) {
    try {
      const content = await downloadFile(file.path);
      const remoteHash = calculateFileHash(content);

      // Compare actual content hash
      if (remoteHash === file.localHash) {
        results.skipped.push(file.path);
        continue;
      }

      if (dryRun) {
        log(`  [UPDATE] ${file.path}`, colors.yellow);
        results.updated.push(file.path);
        continue;
      }

      const localPath = path.join(CLAUDE_DIR, file.path);
      fs.writeFileSync(localPath, content);

      log(`  [UPDATE] ${file.path}`, colors.yellow);
      results.updated.push(file.path);
    } catch (error) {
      log(`  [FAIL] ${file.path}: ${error.message}`, colors.red);
      results.failed.push({ path: file.path, error: error.message });
    }
  }

  // Process deleted files (only in full update mode)
  for (const file of changes.deleted) {
    try {
      if (dryRun) {
        log(`  [DELETE] ${file.path}`, colors.gray);
        results.deleted.push(file.path);
        continue;
      }

      const localPath = path.join(CLAUDE_DIR, file.path);
      if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath);
        log(`  [DELETE] ${file.path}`, colors.gray);
        results.deleted.push(file.path);
      }
    } catch (error) {
      log(`  [FAIL] ${file.path}: ${error.message}`, colors.red);
      results.failed.push({ path: file.path, error: error.message });
    }
  }

  // Log skipped protected files
  for (const file of changes.skipped) {
    results.skipped.push(file.path);
  }

  return results;
}

/**
 * Rollback to previous backup
 */
function rollback(backupPath = null) {
  // Find latest backup if not specified
  if (!backupPath) {
    if (!fs.existsSync(BACKUP_DIR)) {
      throw new Error('No backups found');
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      throw new Error('No backups found');
    }

    backupPath = path.join(BACKUP_DIR, backups[0]);
  }

  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup not found: ${backupPath}`);
  }

  // Read backup metadata
  const metadataPath = path.join(backupPath, 'backup-metadata.json');
  let metadata = { version: 'unknown', fileCount: 0 };

  if (fs.existsSync(metadataPath)) {
    metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
  }

  log(`\nRestoring from backup...`, colors.cyan);
  log(`  Version: ${metadata.version}`, colors.gray);
  log(`  Timestamp: ${metadata.timestamp || 'unknown'}`, colors.gray);

  let restoredCount = 0;

  function restoreDir(src, dest) {
    if (!fs.existsSync(src)) return;

    const entries = fs.readdirSync(src, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.name === 'backup-metadata.json') continue;

      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        ensureDir(destPath);
        restoreDir(srcPath, destPath);
      } else if (entry.isFile()) {
        ensureDir(path.dirname(destPath));
        fs.copyFileSync(srcPath, destPath);
        restoredCount++;
      }
    }
  }

  restoreDir(backupPath, CLAUDE_DIR);

  log(`  Restored ${restoredCount} files`, colors.green);

  return { restoredCount, version: metadata.version };
}

/**
 * Acquire update lock
 */
function acquireLock() {
  if (fs.existsSync(LOCK_FILE)) {
    const lockData = JSON.parse(fs.readFileSync(LOCK_FILE, 'utf8'));
    const lockAge = Date.now() - new Date(lockData.timestamp).getTime();

    // If lock is older than 10 minutes, consider it stale
    if (lockAge < 600000) {
      throw new Error('Another update is in progress. If this persists, delete .update-lock');
    }
  }

  fs.writeFileSync(LOCK_FILE, JSON.stringify({
    timestamp: new Date().toISOString(),
    pid: process.pid
  }));
}

/**
 * Release update lock
 */
function releaseLock() {
  if (fs.existsSync(LOCK_FILE)) {
    fs.unlinkSync(LOCK_FILE);
  }
}

// ============================================================================
// CLI COMMANDS
// ============================================================================

/**
 * Check for updates
 */
async function cmdCheck() {
  log('\n' + colors.bright + 'CC_GodMode Update Check' + colors.reset + '\n');

  const localVersion = getLocalVersion();

  if (!localVersion) {
    log('Could not determine local version.', colors.red);
    log('Ensure VERSION file exists in ~/.claude/', colors.gray);
    process.exit(1);
  }

  log(`Local version:  ${colors.cyan}v${localVersion}${colors.reset}`);

  try {
    const remoteVersion = await getRemoteVersion();
    log(`Remote version: ${colors.cyan}v${remoteVersion}${colors.reset}`);

    const comparison = compareVersions(remoteVersion, localVersion);

    console.log('');

    if (comparison > 0) {
      printBox([
        `${colors.yellow}UPDATE AVAILABLE${colors.reset}`,
        ``,
        `Current: v${localVersion}`,
        `Latest:  v${remoteVersion}`,
        ``,
        `Run: ${colors.cyan}node ~/.claude/scripts/auto-update.js --update${colors.reset}`
      ], colors.yellow);
      process.exitCode = 1;
    } else if (comparison === 0) {
      printBox([
        `${colors.green}UP TO DATE${colors.reset}`,
        ``,
        `Version: v${localVersion}`
      ], colors.green);
    } else {
      printBox([
        `${colors.blue}DEVELOPMENT VERSION${colors.reset}`,
        ``,
        `Local:  v${localVersion}`,
        `Remote: v${remoteVersion}`,
        ``,
        `${colors.gray}You are ahead of the release${colors.reset}`
      ], colors.blue);
    }

  } catch (error) {
    log(`\nCould not check for updates: ${error.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Perform update
 */
async function cmdUpdate(dryRun = false) {
  const mode = dryRun ? 'DRY RUN' : 'UPDATE';
  log(`\n${colors.bright}CC_GodMode ${mode}${colors.reset}\n`);

  const localVersion = getLocalVersion();

  if (!localVersion) {
    log('Could not determine local version.', colors.red);
    process.exit(1);
  }

  try {
    const remoteVersion = await getRemoteVersion();

    log(`Local version:  v${localVersion}`);
    log(`Remote version: v${remoteVersion}`);

    const comparison = compareVersions(remoteVersion, localVersion);

    if (comparison <= 0) {
      log('\nAlready up to date. Nothing to do.', colors.green);
      return;
    }

    if (!dryRun) {
      acquireLock();
    }

    try {
      log('\nAnalyzing changes...', colors.cyan);
      const changes = await getChangedFiles();

      const totalChanges = changes.added.length + changes.modified.length + changes.deleted.length;

      if (totalChanges === 0) {
        log('No file changes detected.', colors.green);
        return;
      }

      log(`\nFound ${totalChanges} changes:`);
      log(`  + ${changes.added.length} new files`, colors.green);
      log(`  ~ ${changes.modified.length} modified files`, colors.yellow);
      log(`  - ${changes.deleted.length} deleted files`, colors.gray);

      if (changes.skipped.length > 0) {
        log(`  ! ${changes.skipped.length} protected files (skipped)`, colors.dim);
      }

      // Create backup before update (unless dry run)
      let backupPath = null;
      if (!dryRun) {
        backupPath = createBackup();
      }

      log('\nApplying changes...', colors.cyan);
      const results = await updateLocalInstallation(changes, dryRun);

      // Summary
      console.log('');
      printBox([
        `${dryRun ? 'DRY RUN' : 'UPDATE'} COMPLETE`,
        ``,
        `Added:    ${results.added.length}`,
        `Updated:  ${results.updated.length}`,
        `Deleted:  ${results.deleted.length}`,
        `Skipped:  ${results.skipped.length}`,
        `Failed:   ${results.failed.length}`,
        ``,
        dryRun
          ? `${colors.gray}No changes made (dry run)${colors.reset}`
          : `${colors.green}Updated to v${remoteVersion}${colors.reset}`,
        backupPath
          ? `Backup: ${path.basename(backupPath)}`
          : ''
      ].filter(Boolean), results.failed.length > 0 ? colors.yellow : colors.green);

      if (results.failed.length > 0) {
        log('\nFailed files:', colors.red);
        results.failed.forEach(f => {
          log(`  ${f.path}: ${f.error}`, colors.red);
        });
      }

    } finally {
      if (!dryRun) {
        releaseLock();
      }
    }

  } catch (error) {
    log(`\nUpdate failed: ${error.message}`, colors.red);
    releaseLock();
    process.exit(1);
  }
}

/**
 * Perform rollback
 */
async function cmdRollback() {
  log(`\n${colors.bright}CC_GodMode ROLLBACK${colors.reset}\n`);

  try {
    // List available backups
    if (!fs.existsSync(BACKUP_DIR)) {
      log('No backups found.', colors.red);
      process.exit(1);
    }

    const backups = fs.readdirSync(BACKUP_DIR)
      .filter(f => f.startsWith('backup-'))
      .sort()
      .reverse();

    if (backups.length === 0) {
      log('No backups found.', colors.red);
      process.exit(1);
    }

    log('Available backups:');
    backups.slice(0, 5).forEach((backup, i) => {
      const metadataPath = path.join(BACKUP_DIR, backup, 'backup-metadata.json');
      let version = 'unknown';
      if (fs.existsSync(metadataPath)) {
        const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
        version = metadata.version || 'unknown';
      }
      const marker = i === 0 ? `${colors.cyan}(latest)${colors.reset}` : '';
      log(`  ${backup} - v${version} ${marker}`);
    });

    if (backups.length > 5) {
      log(`  ... and ${backups.length - 5} more`, colors.gray);
    }

    // Restore latest backup
    console.log('');
    const result = rollback();

    printBox([
      `${colors.green}ROLLBACK COMPLETE${colors.reset}`,
      ``,
      `Restored version: v${result.version}`,
      `Files restored: ${result.restoredCount}`
    ], colors.green);

  } catch (error) {
    log(`\nRollback failed: ${error.message}`, colors.red);
    process.exit(1);
  }
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
${colors.bright}CC_GodMode Auto-Update System${colors.reset}

${colors.cyan}Usage:${colors.reset}
  node auto-update.js [command]

${colors.cyan}Commands:${colors.reset}
  --check      Check if updates are available
  --update     Download and apply updates
  --dry-run    Show what would be updated (no changes made)
  --rollback   Restore from the latest backup
  --help       Show this help message

${colors.cyan}Examples:${colors.reset}
  node ~/.claude/scripts/auto-update.js --check
  node ~/.claude/scripts/auto-update.js --dry-run
  node ~/.claude/scripts/auto-update.js --update

${colors.cyan}Notes:${colors.reset}
  - Always creates a backup before updating
  - NEVER modifies settings.json, mcp.json, or other config files
  - Backups are stored in ~/.claude.bak/
  - Use --dry-run first to preview changes

${colors.gray}Copyright (c) 2025 Dennis Westermann${colors.reset}
`);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--help';

  try {
    switch (command) {
      case '--check':
      case '-c':
        await cmdCheck();
        break;

      case '--update':
      case '-u':
        await cmdUpdate(false);
        break;

      case '--dry-run':
      case '-d':
        await cmdUpdate(true);
        break;

      case '--rollback':
      case '-r':
        await cmdRollback();
        break;

      case '--help':
      case '-h':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    log(`\nError: ${error.message}`, colors.red);
    process.exit(1);
  }
}

main();
