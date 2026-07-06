#!/usr/bin/env node

/**
 * ⚠ SIMULATION ONLY — this script does NOT execute real quality gates.
 * launchValidator/launchTester are setTimeout stubs hardcoded to APPROVED.
 * Real parallel gates run via the Orchestrator's parallel Task tool calls
 * (see docs/orchestrator/QUALITY-GATES.md). Deprecated as tooling since
 * v8.5.0; kept as an executable illustration of the decision matrix.
 *
 * Parallel Quality Gates Orchestrator (v5.6.0)
 *
 * Revolutionary performance improvement: 40% faster quality validation
 *
 * Sequential (old): @builder → @validator (4min) → @tester (6min) → @scribe
 *                   Total: 10 minutes
 *
 * Parallel (new):   @builder → [@validator, @tester] (6min) → @scribe
 *                   Total: 6 minutes (40% faster!)
 *
 * Decision Matrix:
 * | @validator | @tester  | Action                              |
 * |------------|----------|-------------------------------------|
 * | APPROVED   | APPROVED | → @scribe (proceed)                 |
 * | APPROVED   | BLOCKED  | → @builder (tester concerns)        |
 * | BLOCKED    | APPROVED | → @builder (code concerns)          |
 * | BLOCKED    | BLOCKED  | → @builder (merged feedback)        |
 *
 * Features:
 * - Simultaneous execution of @validator and @tester
 * - Result coordination and conflict resolution
 * - Sequential fallback for safety
 * - Comprehensive error handling
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

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
 * Decision Matrix for coordinating results
 */
const DECISION_MATRIX = {
  'APPROVED-APPROVED': {
    status: 'APPROVED',
    nextAgent: 'scribe',
    message: 'Both quality gates passed - proceeding to documentation'
  },
  'APPROVED-BLOCKED': {
    status: 'BLOCKED',
    nextAgent: 'builder',
    message: 'UX quality gate failed - returning to builder with tester feedback'
  },
  'BLOCKED-APPROVED': {
    status: 'BLOCKED',
    nextAgent: 'builder',
    message: 'Code quality gate failed - returning to builder with validator feedback'
  },
  'BLOCKED-BLOCKED': {
    status: 'BLOCKED',
    nextAgent: 'builder',
    message: 'Both quality gates failed - returning to builder with merged feedback'
  }
};

/**
 * Prepare context for parallel execution
 */
function prepareContext(builderOutput) {
  const context = {
    timestamp: new Date().toISOString(),
    builderOutput,
    filesChanged: extractFilesChanged(builderOutput),
    testsAdded: extractTestsAdded(builderOutput),
    version: extractVersion(builderOutput)
  };

  return context;
}

/**
 * Extract files changed from builder output
 */
function extractFilesChanged(output) {
  const fileRegex = /(?:Created|Modified|Updated):\s*`?([^`\n]+)`?/gi;
  const matches = [];
  let match;

  while ((match = fileRegex.exec(output)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

/**
 * Extract tests added from builder output
 */
function extractTestsAdded(output) {
  const testRegex = /Tests?\s+(?:Added|Created):\s*`?([^`\n]+)`?/gi;
  const matches = [];
  let match;

  while ((match = testRegex.exec(output)) !== null) {
    matches.push(match[1]);
  }

  return matches;
}

/**
 * Extract version from builder output
 */
function extractVersion(output) {
  const versionRegex = /v?(\d+\.\d+\.\d+)/i;
  const match = output.match(versionRegex);
  return match ? match[1] : null;
}

/**
 * Execute parallel quality gates
 */
async function executeParallel(context) {
  console.log('');
  console.log(`${colors.cyan}╔════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.cyan}║  ⚡ PARALLEL QUALITY GATES (v5.6.0)                        ║${colors.reset}`);
  console.log(`${colors.cyan}╚════════════════════════════════════════════════════════════╝${colors.reset}`);
  console.log('');
  console.log(`${colors.gray}Launching @validator and @tester simultaneously...${colors.reset}`);
  console.log('');

  const startTime = Date.now();

  try {
    // Launch both agents in parallel
    const results = await Promise.allSettled([
      launchValidator(context),
      launchTester(context)
    ]);

    const duration = Date.now() - startTime;

    // Extract results
    const validatorResult = results[0].status === 'fulfilled'
      ? results[0].value
      : { status: 'ERROR', error: results[0].reason };

    const testerResult = results[1].status === 'fulfilled'
      ? results[1].value
      : { status: 'ERROR', error: results[1].reason };

    // Display timing
    console.log('');
    console.log(`${colors.green}✓ Parallel execution completed in ${Math.round(duration / 1000)}s${colors.reset}`);
    console.log('');

    // Coordinate results
    return coordinateResults(validatorResult, testerResult, duration);

  } catch (error) {
    console.log('');
    console.log(`${colors.red}✗ Parallel execution failed: ${error.message}${colors.reset}`);
    console.log(`${colors.yellow}⚠ Falling back to sequential execution...${colors.reset}`);
    console.log('');

    return sequentialFallback(context);
  }
}

/**
 * Launch @validator agent
 */
async function launchValidator(context) {
  const startTime = Date.now();

  console.log(`${colors.blue}[@validator]${colors.reset} Starting code quality validation...`);

  // Simulate validator execution (in real implementation, this would use Task tool)
  // For now, this is a placeholder that shows the pattern

  return new Promise((resolve) => {
    setTimeout(() => {
      const duration = Date.now() - startTime;

      // Placeholder result (real implementation would parse actual agent output)
      const result = {
        agent: 'validator',
        status: 'APPROVED', // or 'BLOCKED'
        duration,
        checks: {
          typescript: 'PASS',
          unitTests: 'PASS',
          security: 'PASS',
          consumers: 'PASS'
        },
        issues: []
      };

      console.log(`${colors.blue}[@validator]${colors.reset} Completed in ${Math.round(duration / 1000)}s`);

      resolve(result);
    }, 2000); // Placeholder timing
  });
}

/**
 * Launch @tester agent
 */
async function launchTester(context) {
  const startTime = Date.now();

  console.log(`${colors.blue}[@tester]${colors.reset} Starting UX quality validation...`);

  // Simulate tester execution (in real implementation, this would use Task tool)
  // For now, this is a placeholder that shows the pattern

  return new Promise((resolve) => {
    setTimeout(() => {
      const duration = Date.now() - startTime;

      // Placeholder result (real implementation would parse actual agent output)
      const result = {
        agent: 'tester',
        status: 'APPROVED', // or 'BLOCKED'
        duration,
        checks: {
          e2eTests: 'PASS',
          visualRegression: 'PASS',
          accessibility: 'PASS',
          performance: 'PASS'
        },
        issues: []
      };

      console.log(`${colors.blue}[@tester]${colors.reset} Completed in ${Math.round(duration / 1000)}s`);

      resolve(result);
    }, 3000); // Placeholder timing
  });
}

/**
 * Coordinate results from both agents
 */
function coordinateResults(validatorResult, testerResult, totalDuration) {
  console.log('');
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log(`${colors.cyan}RESULTS COORDINATION${colors.reset}`);
  console.log(`${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`);
  console.log('');

  // Display individual results
  displayAgentResult('validator', validatorResult);
  displayAgentResult('tester', testerResult);

  // Determine combined status using decision matrix
  const matrixKey = `${validatorResult.status}-${testerResult.status}`;
  const decision = DECISION_MATRIX[matrixKey] || {
    status: 'ERROR',
    nextAgent: 'orchestrator',
    message: 'Unexpected result combination - manual intervention required'
  };

  console.log('');
  console.log(`${colors.cyan}Combined Decision:${colors.reset}`);
  console.log(`  Status: ${getStatusIcon(decision.status)} ${decision.status}`);
  console.log(`  Next: ${colors.bright}@${decision.nextAgent}${colors.reset}`);
  console.log(`  ${colors.gray}${decision.message}${colors.reset}`);
  console.log('');

  // Merge feedback if both blocked
  let feedback = [];
  if (decision.status === 'BLOCKED') {
    feedback = mergeFeedback([validatorResult, testerResult]);

    if (feedback.length > 0) {
      console.log(`${colors.yellow}Feedback for @builder:${colors.reset}`);
      feedback.forEach((item, i) => {
        console.log(`  ${i + 1}. ${item}`);
      });
      console.log('');
    }
  }

  // Performance metrics
  const sequentialEstimate = validatorResult.duration + testerResult.duration;
  const timeSaved = sequentialEstimate - totalDuration;
  const percentageSaved = Math.round((timeSaved / sequentialEstimate) * 100);

  console.log(`${colors.cyan}Performance Metrics:${colors.reset}`);
  console.log(`  Parallel: ${Math.round(totalDuration / 1000)}s`);
  console.log(`  Sequential (estimate): ${Math.round(sequentialEstimate / 1000)}s`);
  console.log(`  ${colors.green}Time saved: ${Math.round(timeSaved / 1000)}s (${percentageSaved}% faster)${colors.reset}`);
  console.log('');

  return {
    status: decision.status,
    nextAgent: decision.nextAgent,
    message: decision.message,
    feedback,
    validatorResult,
    testerResult,
    performance: {
      parallelDuration: totalDuration,
      sequentialEstimate,
      timeSaved,
      percentageSaved
    }
  };
}

/**
 * Display result for a single agent
 */
function displayAgentResult(agentName, result) {
  const statusIcon = getStatusIcon(result.status);
  const statusColor = result.status === 'APPROVED' ? colors.green : colors.red;

  console.log(`${colors.bright}@${agentName}:${colors.reset} ${statusColor}${statusIcon} ${result.status}${colors.reset}`);

  if (result.checks) {
    Object.entries(result.checks).forEach(([check, status]) => {
      const icon = status === 'PASS' ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
      console.log(`  ${icon} ${check}: ${status}`);
    });
  }

  if (result.issues && result.issues.length > 0) {
    console.log(`  ${colors.yellow}Issues:${colors.reset}`);
    result.issues.forEach(issue => {
      console.log(`    - ${issue}`);
    });
  }

  console.log('');
}

/**
 * Get status icon
 */
function getStatusIcon(status) {
  switch (status) {
    case 'APPROVED':
      return '✓';
    case 'BLOCKED':
      return '✗';
    case 'ERROR':
      return '⚠';
    default:
      return '○';
  }
}

/**
 * Merge feedback from multiple agents
 */
function mergeFeedback(results) {
  const feedback = [];

  results.forEach(result => {
    if (result.issues && result.issues.length > 0) {
      const agentName = result.agent || 'unknown';
      feedback.push(`[${agentName}] Issues:`);
      result.issues.forEach(issue => {
        feedback.push(`  - ${issue}`);
      });
    }
  });

  return feedback;
}

/**
 * Sequential fallback if parallel execution fails
 */
async function sequentialFallback(context) {
  console.log(`${colors.yellow}SEQUENTIAL FALLBACK MODE${colors.reset}`);
  console.log('');

  const startTime = Date.now();

  // Run validator first
  const validatorResult = await launchValidator(context);
  displayAgentResult('validator', validatorResult);

  // Only run tester if validator approved
  let testerResult = null;

  if (validatorResult.status === 'APPROVED') {
    testerResult = await launchTester(context);
    displayAgentResult('tester', testerResult);
  } else {
    console.log(`${colors.yellow}⚠ Skipping @tester due to @validator BLOCKED status${colors.reset}`);
    console.log('');

    return {
      status: 'BLOCKED',
      nextAgent: 'builder',
      message: 'Validator blocked - fix code issues before testing',
      feedback: validatorResult.issues || [],
      validatorResult,
      testerResult: null,
      mode: 'sequential'
    };
  }

  const totalDuration = Date.now() - startTime;

  // Coordinate results
  return coordinateResults(validatorResult, testerResult, totalDuration);
}

/**
 * Main CLI interface
 */
async function main() {
  const builderOutputPath = process.argv[2];

  if (!builderOutputPath) {
    console.error('Usage: parallel-quality-gates.js <builder-output-file>');
    process.exit(1);
  }

  // Read builder output
  const builderOutput = fs.readFileSync(builderOutputPath, 'utf-8');

  // Prepare context
  const context = prepareContext(builderOutput);

  // Execute parallel quality gates
  const result = await executeParallel(context);

  // Exit with appropriate code
  process.exit(result.status === 'APPROVED' ? 0 : 1);
}

// Export for use by orchestrator
module.exports = {
  executeParallel,
  coordinateResults,
  prepareContext,
  launchValidator,
  launchTester,
  sequentialFallback
};

// CLI mode
if (require.main === module) {
  main().catch(error => {
    console.error(`${colors.red}Error: ${error.message}${colors.reset}`);
    process.exit(1);
  });
}
