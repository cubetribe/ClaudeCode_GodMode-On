#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * Pre-Push Check Hook (v5.9.0)
 *
 * Git pre-push hook that ensures workflow is complete before allowing push
 *
 * Checks:
 * - Workflow state shows complete
 * - Both quality gates APPROVED
 * - VERSION file updated
 * - CHANGELOG.md updated
 * - No uncommitted changes
 *
 * This hook BLOCKS push if any check fails.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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
 * Check if workflow is complete
 */
function checkWorkflowState() {
  const stateFile = path.join(process.cwd(), '.ccgm-state.json');

  if (!fs.existsSync(stateFile)) {
    // No state file - allow push (not in workflow mode)
    return {
      passed: true,
      message: 'No workflow state found (not in workflow mode)'
    };
  }

  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));

    // Check if workflow is marked complete
    if (!state.workflowComplete) {
      return {
        passed: false,
        message: 'Workflow is not complete',
        details: {
          currentPhase: state.currentPhase || 'unknown',
          completedAgents: state.completedAgents || []
        }
      };
    }

    // Check quality gates
    const validatorStatus = state.qualityGates?.validator?.status;
    const testerStatus = state.qualityGates?.tester?.status;

    if (validatorStatus !== 'APPROVED') {
      return {
        passed: false,
        message: '@validator has not approved',
        details: {
          validatorStatus: validatorStatus || 'NOT_RUN'
        }
      };
    }

    if (testerStatus !== 'APPROVED') {
      return {
        passed: false,
        message: '@tester has not approved',
        details: {
          testerStatus: testerStatus || 'NOT_RUN'
        }
      };
    }

    return {
      passed: true,
      message: 'Workflow complete, quality gates approved'
    };
  } catch (error) {
    return {
      passed: false,
      message: `Could not read workflow state: ${error.message}`
    };
  }
}

/**
 * Check if VERSION file was updated in this commit
 */
function checkVersionUpdated() {
  try {
    const versionFile = path.join(process.cwd(), 'VERSION');

    if (!fs.existsSync(versionFile)) {
      return {
        passed: false,
        message: 'VERSION file does not exist'
      };
    }

    // Check if VERSION file is in staged changes
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    const versionUpdated = stagedFiles.split('\n').includes('VERSION');

    if (!versionUpdated) {
      // Check if VERSION file was updated in recent commits
      const recentChanges = execSync('git log --oneline -5 --name-only', { encoding: 'utf-8' });
      if (!recentChanges.includes('VERSION')) {
        return {
          passed: false,
          message: 'VERSION file has not been updated'
        };
      }
    }

    return {
      passed: true,
      message: 'VERSION file updated'
    };
  } catch (error) {
    return {
      passed: false,
      message: `Could not check VERSION file: ${error.message}`
    };
  }
}

/**
 * Check if CHANGELOG was updated
 */
function checkChangelogUpdated() {
  try {
    const changelogFile = path.join(process.cwd(), 'CHANGELOG.md');

    if (!fs.existsSync(changelogFile)) {
      return {
        passed: false,
        message: 'CHANGELOG.md does not exist'
      };
    }

    // Check if CHANGELOG is in staged changes
    const stagedFiles = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
    const changelogUpdated = stagedFiles.split('\n').includes('CHANGELOG.md');

    if (!changelogUpdated) {
      // Check if CHANGELOG was updated in recent commits
      const recentChanges = execSync('git log --oneline -5 --name-only', { encoding: 'utf-8' });
      if (!recentChanges.includes('CHANGELOG.md')) {
        return {
          passed: false,
          message: 'CHANGELOG.md has not been updated'
        };
      }
    }

    return {
      passed: true,
      message: 'CHANGELOG.md updated'
    };
  } catch (error) {
    return {
      passed: false,
      message: `Could not check CHANGELOG.md: ${error.message}`
    };
  }
}

/**
 * Check for uncommitted changes
 */
function checkUncommittedChanges() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf-8' });

    if (status.trim().length > 0) {
      const lines = status.trim().split('\n');
      return {
        passed: false,
        message: 'Uncommitted changes detected',
        details: {
          fileCount: lines.length,
          files: lines.slice(0, 5).map(line => line.trim())
        }
      };
    }

    return {
      passed: true,
      message: 'No uncommitted changes'
    };
  } catch (error) {
    return {
      passed: false,
      message: `Could not check git status: ${error.message}`
    };
  }
}

/**
 * Release invariant (v8.5, ADR-004): VERSION == top CHANGELOG == latest tag,
 * ahead-of-tag only while a release is in flight. Delegates to release-check.js.
 */
function checkReleaseConsistency() {
  try {
    execSync(`node ${JSON.stringify(path.join(__dirname, 'release-check.js'))} --ci`, { stdio: 'pipe' });
    return {
      passed: true,
      message: 'Release invariant holds (VERSION / CHANGELOG / tags consistent)'
    };
  } catch (error) {
    return {
      passed: false,
      message: 'Release invariant violated — run: node scripts/release-check.js'
    };
  }
}

/**
 * Run all pre-push checks
 */
function runPrePushChecks() {
  console.log('');
  console.log(`${colors.cyan}+============================================================+${colors.reset}`);
  console.log(`${colors.cyan}|  PRE-PUSH CHECK (v5.9.0)                                   |${colors.reset}`);
  console.log(`${colors.cyan}+============================================================+${colors.reset}`);
  console.log('');

  const checks = [
    { name: 'Workflow State', fn: checkWorkflowState },
    { name: 'VERSION Updated', fn: checkVersionUpdated },
    { name: 'CHANGELOG Updated', fn: checkChangelogUpdated },
    { name: 'Release Consistency', fn: checkReleaseConsistency },
    { name: 'No Uncommitted Changes', fn: checkUncommittedChanges }
  ];

  const results = [];
  let allPassed = true;

  checks.forEach(check => {
    console.log(`${colors.bright}Checking: ${check.name}${colors.reset}`);
    const result = check.fn();
    results.push({ name: check.name, result });

    if (result.passed) {
      console.log(`  ${colors.green}✓ ${result.message}${colors.reset}`);
    } else {
      console.log(`  ${colors.red}✗ ${result.message}${colors.reset}`);
      if (result.details) {
        Object.entries(result.details).forEach(([key, value]) => {
          console.log(`    ${colors.gray}${key}: ${JSON.stringify(value)}${colors.reset}`);
        });
      }
      allPassed = false;
    }
    console.log('');
  });

  console.log(`${colors.cyan}+------------------------------------------------------------+${colors.reset}`);

  if (allPassed) {
    console.log(`${colors.green}✓ All checks passed - push allowed${colors.reset}`);
    console.log('');
    return 0;
  } else {
    console.log(`${colors.red}✗ Pre-push checks failed - push blocked${colors.reset}`);
    console.log('');
    console.log(`${colors.yellow}Fix the issues above and try again.${colors.reset}`);
    console.log('');
    console.log(`${colors.gray}To bypass this check (NOT RECOMMENDED):${colors.reset}`);
    console.log(`${colors.gray}  git push --no-verify${colors.reset}`);
    console.log('');
    return 1;
  }
}

/**
 * Main CLI interface
 */
function main() {
  const args = process.argv.slice(2);

  // Handle --help
  if (args.includes('--help') || args.includes('-h')) {
    console.log('');
    console.log(`${colors.cyan}Pre-Push Check Hook (v5.9.0)${colors.reset}`);
    console.log('');
    console.log('Usage:');
    console.log('  pre-push-check.js           Run all pre-push checks');
    console.log('  pre-push-check.js --help    Show this help');
    console.log('');
    console.log('This hook ensures:');
    console.log('  - Workflow is complete');
    console.log('  - Quality gates approved');
    console.log('  - VERSION and CHANGELOG updated');
    console.log('  - No uncommitted changes');
    console.log('');
    console.log('Installation:');
    console.log('  ln -s ../../scripts/pre-push-check.js .git/hooks/pre-push');
    console.log('  chmod +x .git/hooks/pre-push');
    console.log('');
    process.exit(0);
  }

  // Run checks
  const exitCode = runPrePushChecks();
  process.exit(exitCode);
}

// Export for use by other scripts
module.exports = {
  checkWorkflowState,
  checkVersionUpdated,
  checkChangelogUpdated,
  checkUncommittedChanges,
  runPrePushChecks
};

// CLI mode
if (require.main === module) {
  main();
}
