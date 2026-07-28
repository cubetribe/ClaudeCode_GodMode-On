#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * check-api-impact.js - Enhanced API Impact Detection Hook
 *
 * This script runs automatically on Write/Edit operations and:
 * - Detects changes to API/Type files
 * - Analyzes potential breaking changes
 * - Finds all consumer files
 * - Triggers @api-guardian workflow
 *
 * Installation:
 * 1. Save as: scripts/check-api-impact.js
 * 2. Make executable: chmod +x scripts/check-api-impact.js
 * 3. Configure in .claude/settings.json or ~/.claude/settings.json
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  apiPaths: [
    'src/api/',
    'backend/routes/',
    'shared/types/',
    'types/',
    'api/',
  ],
  typeFilePatterns: ['.d.ts', 'types.ts', 'types.tsx'],
  schemaFiles: ['openapi.yaml', 'openapi.json', 'schema.graphql'],
  maxConsumersToShow: 25,
  breakingPatterns: [
    /(\w+)\s*\?\s*:/,  // Optional field marker
    /:\s*(\w+)\s*\|/,  // Union types
    /export\s+(interface|type)/,  // Type exports
  ],
};

/**
 * Hook mode (v8.6.0 fix): Claude Code hooks (PostToolUse etc.) invoke this
 * script with NO argv and deliver a JSON payload on stdin — there is no
 * $CLAUDE_FILE_PATH env var. The old wiring `node check-api-impact.js
 * "$CLAUDE_FILE_PATH"` therefore always passed an empty string and the
 * script silently exited, killing Core Rule 4's automatic @api-guardian
 * trigger. Pattern follows validate-agent-output.js runHookMode
 * (lines ~697-759): if argv[2] is present, keep existing CLI behavior; else
 * if stdin is not a TTY, read+parse the JSON payload (tolerantly — bad/empty
 * JSON just exits 0) and pull the changed file from
 * payload.tool_input.file_path (PostToolUse payload shape), using
 * payload.cwd to scope the analysis; else (TTY, no arg) exit 0 as before.
 * This hook stays non-blocking: informational output only, always exit 0.
 */
function runHookMode() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { raw += d; });
  process.stdin.on('end', () => {
    let payload = {};
    try { payload = JSON.parse(raw || '{}'); } catch { /* tolerate non-JSON */ }

    const changedFile = payload && payload.tool_input && payload.tool_input.file_path;
    if (!changedFile) process.exit(0);

    if (payload.cwd) {
      try { process.chdir(payload.cwd); } catch { /* fall back to current cwd */ }
    }

    analyzeAndReport(changedFile);
    process.exit(0);
  });
}

// Determine mode: CLI (argv) vs hook (stdin JSON payload) vs no-op (TTY, no arg)
const cliFile = process.argv[2];
if (!cliFile) {
  if (!process.stdin.isTTY) {
    runHookMode();
    return;
  }
  process.exit(0);
}

analyzeAndReport(cliFile);

function analyzeAndReport(changedFile) {

// Check if this is an API-relevant file
const isApiFile = CONFIG.apiPaths.some(p => changedFile.includes(p));
const isTypeFile = CONFIG.typeFilePatterns.some(p => changedFile.endsWith(p));
const isSchemaFile = CONFIG.schemaFiles.some(f => changedFile.endsWith(f));

if (!isApiFile && !isTypeFile && !isSchemaFile) {
  return;
}

// Helper: Run command safely
function runCommand(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf-8', timeout: 10000 }).trim();
  } catch (e) {
    return '';
  }
}

// Helper: Count consumers
function countConsumers(pattern) {
  const result = runCommand(
    `grep -rn "${pattern}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l`
  );
  return parseInt(result, 10) || 0;
}

// Helper: Get consumers
function getConsumers(pattern, limit = CONFIG.maxConsumersToShow) {
  return runCommand(
    `grep -rn "${pattern}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -${limit}`
  );
}

// Helper: Detect potential breaking changes
function detectBreakingChanges(filePath) {
  const changes = [];

  // Get git diff if available
  const diff = runCommand(`git diff HEAD -- "${filePath}" 2>/dev/null`);

  if (diff) {
    // Check for removed lines (potential breaking)
    const removedLines = diff.split('\n').filter(l => l.startsWith('-') && !l.startsWith('---'));
    const addedLines = diff.split('\n').filter(l => l.startsWith('+') && !l.startsWith('+++'));

    // Detect removed fields
    const removedFields = removedLines.filter(l => l.match(/^\-\s*\w+\s*[:\?]/));
    if (removedFields.length > 0) {
      changes.push({
        type: 'REMOVED_FIELDS',
        severity: 'HIGH',
        details: removedFields.map(f => f.replace(/^-\s*/, '').trim()),
      });
    }

    // Detect renamed fields (removed + added with similar pattern)
    if (removedLines.length > 0 && addedLines.length > 0) {
      changes.push({
        type: 'POTENTIAL_RENAME',
        severity: 'MEDIUM',
        details: ['Fields may have been renamed - verify consumers'],
      });
    }

    // Detect type changes
    const typeChanges = diff.match(/^\-.*:\s*\w+.*$\n^\+.*:\s*\w+/gm);
    if (typeChanges) {
      changes.push({
        type: 'TYPE_CHANGE',
        severity: 'HIGH',
        details: ['Property types have changed'],
      });
    }
  }

  return changes;
}

// Main analysis
console.log('\n');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  ⚠️   API/TYPE FILE CHANGE DETECTED                         ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

// File info
const fileName = path.basename(changedFile, path.extname(changedFile));
const fileType = isSchemaFile ? 'SCHEMA' : isTypeFile ? 'TYPE DEFINITION' : 'API';

console.log(`📁 File: ${changedFile}`);
console.log(`📋 Type: ${fileType}`);
console.log('');

// Breaking change detection
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🔍 BREAKING CHANGE ANALYSIS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

const breakingChanges = detectBreakingChanges(changedFile);

if (breakingChanges.length > 0) {
  console.log('');
  console.log('🔴 POTENTIAL BREAKING CHANGES DETECTED:');
  console.log('');
  breakingChanges.forEach((change, i) => {
    const icon = change.severity === 'HIGH' ? '🔴' : '🟡';
    console.log(`   ${icon} ${change.type}`);
    change.details.forEach(d => console.log(`      └─ ${d}`));
  });
  console.log('');
} else {
  console.log('');
  console.log('✅ No obvious breaking changes detected (verify manually)');
  console.log('');
}

// Consumer discovery
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('📋 CONSUMER DISCOVERY');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');

// Search by filename
const fileNameCount = countConsumers(fileName);
const fileNameConsumers = getConsumers(fileName);

// Search by import pattern
const importPattern = `from.*${fileName}|import.*${fileName}`;
const importConsumers = getConsumers(importPattern);

if (fileNameConsumers) {
  console.log(`Found ${fileNameCount} potential consumer(s):`);
  console.log('');
  fileNameConsumers.split('\n').forEach(line => {
    if (line.trim()) {
      console.log(`   📍 ${line}`);
    }
  });
  console.log('');
} else {
  console.log('✅ No direct consumers found in src/');
  console.log('');
}

// Action required section
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('🎯 REQUIRED ACTIONS');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('   1. 🤖 Call @api-guardian for full impact analysis');
console.log('   2. 📝 Update all affected consumers');
console.log('   3. ✅ Run: npm run typecheck');
console.log('   4. 🧪 Run: npm test');
console.log('   5. 📚 Update: docs/API_CONSUMERS.md');
console.log('');

// Orchestrator hint
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('💡 ORCHESTRATOR WORKFLOW');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log('');
console.log('   For API changes, use this workflow:');
console.log('');
console.log('   @api-guardian → @builder → @validator → @scribe');
console.log('');
console.log('   The @api-guardian will:');
console.log('   • Perform detailed impact analysis');
console.log('   • Identify all breaking changes');
console.log('   • Create migration checklist');
console.log('   • Recommend versioning strategy');
console.log('');
console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║  ⚡ @api-guardian MUST be called for API changes!          ║');
console.log('╚════════════════════════════════════════════════════════════╝');
console.log('');

} // end analyzeAndReport
