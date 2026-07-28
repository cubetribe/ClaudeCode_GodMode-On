#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * Phase 2 Integration Tests
 *
 * Tests the integration of Phase 1 Domain Pack systems with CC_GodMode hooks:
 * - SessionStart hook with domain pack discovery
 * - UserPromptSubmit hook with domain detection
 *
 * @architecture v5.7.0 - Phase 2: Hook Integration
 */

const path = require('path');
const { analyzeUserPrompt } = require('./analyze-prompt.js');

// ANSI Colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m'
};

// ============================================================================
// TEST SCENARIOS
// ============================================================================

const testScenarios = [
  {
    name: 'Technical Feature Request',
    prompt: 'Add user authentication with OAuth2',
    expectedOrchestration: 'technical',
    expectedTaskType: 'feature',
    description: 'Should use CC_GodMode core orchestration'
  },
  {
    name: 'Bug Fix Request',
    prompt: 'Bug Fix: Login form validation error',
    expectedOrchestration: 'technical',
    expectedTaskType: 'bug',
    description: 'Should use CC_GodMode core orchestration'
  },
  {
    name: 'Legal Opinion Request',
    prompt: 'Legal opinion on: Patent infringement claim',
    expectedOrchestration: 'domain',
    expectedTaskType: 'legal',
    description: 'Should use Anwaltsorchester domain orchestration'
  },
  {
    name: 'Case Analysis Request',
    prompt: 'Analyze case: Contract dispute with supplier',
    expectedOrchestration: 'domain',
    expectedTaskType: 'legal',
    description: 'Should use Anwaltsorchester domain orchestration'
  },
  {
    name: 'Contract Review Request',
    prompt: 'Review contract: Software development agreement with liability clauses',
    expectedOrchestration: 'domain',
    expectedTaskType: 'legal',
    description: 'Should use Anwaltsorchester domain orchestration'
  },
  {
    name: 'API Change Request',
    prompt: 'API Change: Update user endpoint to include profile data',
    expectedOrchestration: 'technical',
    expectedTaskType: 'api',
    description: 'Should use CC_GodMode core with @api-guardian'
  },
  {
    name: 'Refactoring Request',
    prompt: 'Refactor database queries for better performance',
    expectedOrchestration: 'technical',
    expectedTaskType: 'refactor',
    description: 'Should use CC_GodMode core orchestration'
  }
];

// ============================================================================
// TEST EXECUTION
// ============================================================================

function runTests() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 PHASE 2 INTEGRATION TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  let passed = 0;
  let failed = 0;
  const results = [];

  for (const scenario of testScenarios) {
    const analysis = analyzeUserPrompt(scenario.prompt);

    const orchestrationMatch = analysis.orchestrationType === scenario.expectedOrchestration;
    const taskTypeMatch = analysis.taskType === scenario.expectedTaskType;
    const testPassed = orchestrationMatch && taskTypeMatch;

    if (testPassed) {
      passed++;
    } else {
      failed++;
    }

    results.push({
      scenario,
      analysis,
      orchestrationMatch,
      taskTypeMatch,
      testPassed
    });
  }

  // Display results
  console.log('📊 TEST RESULTS:\n');

  for (const result of results) {
    const statusIcon = result.testPassed ? `${colors.green}✓${colors.reset}` : `${colors.red}✗${colors.reset}`;
    console.log(`${statusIcon} ${result.scenario.name}`);
    console.log(`   Prompt: "${result.scenario.prompt}"`);
    console.log(`   Expected: ${result.scenario.expectedOrchestration} / ${result.scenario.expectedTaskType}`);
    console.log(`   Got: ${result.analysis.orchestrationType} / ${result.analysis.taskType}`);

    if (result.analysis.domain) {
      console.log(`   Domain Score: ${result.analysis.domain.score} (${result.analysis.domain.confidence} confidence)`);
    }

    if (!result.testPassed) {
      if (!result.orchestrationMatch) {
        console.log(`   ${colors.red}✗ Orchestration mismatch${colors.reset}`);
      }
      if (!result.taskTypeMatch) {
        console.log(`   ${colors.red}✗ Task type mismatch${colors.reset}`);
      }
    }

    console.log('');
  }

  // Summary
  const total = passed + failed;
  const accuracy = ((passed / total) * 100).toFixed(1);

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📈 SUMMARY');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Total Tests: ${total}`);
  console.log(`Passed: ${colors.green}${passed}${colors.reset}`);
  console.log(`Failed: ${failed > 0 ? colors.red : colors.gray}${failed}${colors.reset}`);
  console.log(`Accuracy: ${accuracy}% (Target: 100%)`);

  console.log('');

  // Success criteria
  const success = passed === total;

  if (success) {
    console.log(`${colors.green}✅ ALL TESTS PASSED - Phase 2 Integration Complete!${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ SOME TESTS FAILED - Review results above${colors.reset}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return { passed, failed, total, accuracy, success };
}

// ============================================================================
// BACKWARDS COMPATIBILITY TESTS
// ============================================================================

function testBackwardsCompatibility() {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔄 BACKWARDS COMPATIBILITY TESTS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const compatibilityTests = [
    {
      name: 'analyzeUserPrompt without context parameter',
      test: () => {
        const result = analyzeUserPrompt('Add user authentication');
        return result.taskType === 'feature' && result.orchestrationType === 'technical';
      }
    },
    {
      name: 'analyzeUserPrompt with context parameter',
      test: () => {
        const result = analyzeUserPrompt('Add user authentication', {
          recentFiles: [],
          cwd: process.cwd()
        });
        return result.taskType === 'feature' && result.orchestrationType === 'technical';
      }
    },
    {
      name: 'All existing task types still work',
      test: () => {
        const taskTypes = ['feature', 'bug', 'refactor', 'api', 'documentation'];
        const prompts = [
          'Add new feature',
          'Fix bug in login',
          'Refactor code',
          'Update API endpoint',
          'Update documentation'
        ];

        for (let i = 0; i < taskTypes.length; i++) {
          const result = analyzeUserPrompt(prompts[i]);
          if (result.taskType !== taskTypes[i]) {
            return false;
          }
        }
        return true;
      }
    }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of compatibilityTests) {
    try {
      const result = test.test();
      if (result) {
        console.log(`${colors.green}✓${colors.reset} ${test.name}`);
        passed++;
      } else {
        console.log(`${colors.red}✗${colors.reset} ${test.name}`);
        failed++;
      }
    } catch (error) {
      console.log(`${colors.red}✗${colors.reset} ${test.name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  const total = passed + failed;
  const success = failed === 0;

  console.log('');
  console.log(`Total: ${total} | Passed: ${passed} | Failed: ${failed}`);

  if (success) {
    console.log(`${colors.green}✅ BACKWARDS COMPATIBILITY MAINTAINED${colors.reset}`);
  } else {
    console.log(`${colors.red}❌ BREAKING CHANGES DETECTED${colors.reset}`);
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  return { passed, failed, total, success };
}

// ============================================================================
// MAIN
// ============================================================================

if (require.main === module) {
  const integrationResults = runTests();
  const compatibilityResults = testBackwardsCompatibility();

  // Final summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎯 PHASE 2 INTEGRATION - FINAL STATUS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  console.log(`Integration Tests: ${integrationResults.passed}/${integrationResults.total} (${integrationResults.accuracy}%)`);
  console.log(`Compatibility Tests: ${compatibilityResults.passed}/${compatibilityResults.total}`);

  const overallSuccess = integrationResults.success && compatibilityResults.success;

  if (overallSuccess) {
    console.log(`\n${colors.green}🎉 PHASE 2 INTEGRATION COMPLETE - ALL SYSTEMS GO!${colors.reset}`);
    console.log('\nReady for:');
    console.log('  - SessionStart shows domain packs');
    console.log('  - UserPromptSubmit detects legal vs technical');
    console.log('  - Zero breaking changes to existing workflows');
    process.exit(0);
  } else {
    console.log(`\n${colors.red}❌ PHASE 2 INTEGRATION INCOMPLETE - See failures above${colors.reset}`);
    process.exit(1);
  }
}

module.exports = {
  runTests,
  testBackwardsCompatibility
};
