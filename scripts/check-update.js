#!/usr/bin/env node

/**
 * CC_GodMode Update Checker
 *
 * Checks if a newer version is available on GitHub.
 * Run at session start to notify users of updates.
 *
 * Usage: node scripts/check-update.js
 *
 * Copyright (c) 2025 Dennis Westermann
 * www.dennis-westermann.de
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuration
const GITHUB_OWNER = 'cubetribe';
const GITHUB_REPO = 'ClaudeCode_GodMode-On';
const VERSION_FILE = path.join(__dirname, '..', 'VERSION');
const CHANGELOG_FILE = path.join(__dirname, '..', 'CHANGELOG.md');

// ANSI Colors
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
 * Get local version from VERSION file
 */
function getLocalVersion() {
  try {
    if (fs.existsSync(VERSION_FILE)) {
      return fs.readFileSync(VERSION_FILE, 'utf8').trim();
    }
    // Fallback: try to extract from CHANGELOG
    if (fs.existsSync(CHANGELOG_FILE)) {
      const changelog = fs.readFileSync(CHANGELOG_FILE, 'utf8');
      const match = changelog.match(/## \[(\d+\.\d+\.\d+)\]/);
      if (match) return match[1];
    }
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Fetch latest release from GitHub API
 */
function fetchLatestRelease() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/releases/latest`,
      method: 'GET',
      headers: {
        'User-Agent': 'CC_GodMode-Update-Checker',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error('Failed to parse GitHub response'));
          }
        } else if (res.statusCode === 404) {
          // No releases yet, try tags
          fetchLatestTag().then(resolve).catch(reject);
        } else {
          reject(new Error(`GitHub API returned ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

/**
 * Fetch latest tag if no releases exist
 */
function fetchLatestTag() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_OWNER}/${GITHUB_REPO}/tags`,
      method: 'GET',
      headers: {
        'User-Agent': 'CC_GodMode-Update-Checker',
        'Accept': 'application/vnd.github.v3+json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            const tags = JSON.parse(data);
            if (tags.length > 0) {
              resolve({ tag_name: tags[0].name });
            } else {
              resolve(null);
            }
          } catch (e) {
            reject(new Error('Failed to parse tags'));
          }
        } else {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve(null);
    });
    req.end();
  });
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
 * Print styled output
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
 * Main function
 */
async function main() {
  const localVersion = getLocalVersion();

  if (!localVersion) {
    console.log(`${colors.yellow}⚠️  Could not determine local version${colors.reset}`);
    console.log(`${colors.gray}   Create a VERSION file with the version number${colors.reset}`);
    return;
  }

  try {
    const release = await fetchLatestRelease();

    if (!release || !release.tag_name) {
      // No releases found, assume we're up to date
      printBox([
        `${colors.green}✓${colors.reset} CC_GodMode ${colors.bright}v${localVersion}${colors.reset}`,
        `${colors.gray}No remote releases found${colors.reset}`
      ], colors.green);
      return;
    }

    const remoteVersion = release.tag_name.replace(/^v/, '');
    const comparison = compareVersions(remoteVersion, localVersion);

    if (comparison > 0) {
      // Update available
      const lines = [
        `${colors.yellow}⚠️  UPDATE AVAILABLE${colors.reset}`,
        ``,
        `   Local:  ${colors.red}v${localVersion}${colors.reset}`,
        `   Remote: ${colors.green}v${remoteVersion}${colors.reset}`,
        ``
      ];

      if (release.body) {
        lines.push(`${colors.bright}Changelog:${colors.reset}`);
        const changelogLines = release.body.split('\n').slice(0, 5);
        changelogLines.forEach(line => {
          lines.push(`   ${colors.gray}${line.substring(0, 50)}${colors.reset}`);
        });
        if (release.body.split('\n').length > 5) {
          lines.push(`   ${colors.gray}...${colors.reset}`);
        }
        lines.push(``);
      }

      lines.push(`${colors.bright}To update:${colors.reset}`);
      lines.push(`   ${colors.cyan}cd ~/.claude && git pull${colors.reset}`);
      lines.push(`   ${colors.gray}or run: node scripts/install-update.js${colors.reset}`);

      printBox(lines, colors.yellow);

      // Exit with code 1 to indicate update available (can be used in scripts)
      process.exitCode = 1;

    } else if (comparison === 0) {
      // Up to date
      printBox([
        `${colors.green}✓${colors.reset} CC_GodMode ${colors.bright}v${localVersion}${colors.reset}`,
        `${colors.gray}You are up to date!${colors.reset}`
      ], colors.green);

    } else {
      // Local is newer (development version)
      printBox([
        `${colors.blue}🔧${colors.reset} CC_GodMode ${colors.bright}v${localVersion}${colors.reset}`,
        `${colors.gray}Development version (ahead of release)${colors.reset}`
      ], colors.blue);
    }

  } catch (error) {
    // Network error or API issue - don't block the user
    printBox([
      `${colors.green}✓${colors.reset} CC_GodMode ${colors.bright}v${localVersion}${colors.reset}`,
      `${colors.gray}Could not check for updates${colors.reset}`,
      `${colors.gray}(${error.message})${colors.reset}`
    ], colors.gray);
  }
}

// Run
main();
