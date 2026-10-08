#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * Agent Output Validator (v5.8.0)
 *
 * SubagentStop Hook Implementation
 *
 * Validates that subagent outputs meet quality standards and include
 * all required sections based on agent role.
 *
 * Triggered automatically after every agent completes.
 *
 * Features:
 * - Agent-specific validation rules (v5.6.0)
 * - Required section checking
 * - Output quality assessment
 * - Actionable feedback for incomplete outputs
 * - Domain-specific quality gates (v5.8.0)
 * - Dynamic domain registration
 * - CLI --domain flag support
 */

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
 * Core validation rules (v5.6.0 - preserved for backwards compatibility)
 * These are the baseline rules that apply to all domains.
 */
const VALIDATION_RULES_CORE = {
  // NEW: @researcher agent (v5.10.0)
  researcher: {
    requiredSections: [
      'Key Findings',
      'Sources',
      'Recommendation'
    ],
    requiredPatterns: [
      /#{2,4}\s+(Key Findings|Findings)/i,
      /#{2,4}\s+Sources/i,
      /\[.*\]\(https?:\/\//i,  // Must have at least one source link
      /(Recommendation|Handoff)/i
    ],
    name: '@researcher'
  },

  architect: {
    requiredSections: [
      'Architectural Decisions',
      'Implementation Strategy',
      'Risk Assessment',
      'Handoff'
    ],
    requiredPatterns: [
      /#{2,4}\s+ARCHITECTURAL DECISIONS/i,
      /#{2,4}\s+IMPLEMENTATION/i,
      /#{2,4}\s+RISK/i
    ],
    name: '@architect'
  },

  'api-guardian': {
    requiredSections: [
      'Impact Analysis',
      'Consumer Files',
      'Breaking Changes',
      'Migration Checklist'
    ],
    requiredPatterns: [
      /#{2,4}\s+IMPACT ANALYSIS/i,
      /#{2,4}\s+CONSUMER/i,
      /#{2,4}\s+BREAKING/i
    ],
    name: '@api-guardian'
  },

  builder: {
    requiredSections: [
      'Files Created',
      'Files Modified',
      'Quality Gates',
      'Tests'
    ],
    requiredPatterns: [
      /#{2,4}\s+Files\s+(Created|Added)/i,
      /#{2,4}\s+Files\s+(Modified|Changed)/i,
      /#{2,4}\s+(Quality Gates|Verification|Checks)/i
    ],
    name: '@builder'
  },

  // NOTE (v8.7.0 - Sprint 02): @validator no longer exists as a standing
  // agent. Its deterministic half (typecheck/lint/test/build) moved to the
  // scripts/verify-changes.js SubagentStop hook; its judgment half is pulled
  // on demand via the native /code-review skill instead of a standing agent.
  // There is no VALIDATION_RULES_CORE entry for it any more.

  // ENHANCED: @tester with mandatory screenshot enforcement (v5.10.0).
  // Pattern set kept byte-for-byte in sync with docs/templates/REPORT_TEMPLATES.md
  // (@builder-6, same sprint) - divergence here was Widerspruch H7: a
  // builder following the template used to fail this hook because the hook
  // demanded more than the template promised.
  tester: {
    requiredSections: [
      'Screenshots Created',
      'Console Errors',
      'Performance Metrics',
      'Accessibility',
      'Decision'
    ],
    requiredPatterns: [
      /(\.playwright-mcp\/|screenshots?\/)/i,  // Screenshot path MUST be present (.playwright-mcp/ or screenshots/)
      /\.(png|jpg|jpeg)/i,                     // Screenshot file MUST be named
      /Console\s*(Error|Message)/i,            // Console errors MUST be reported
      /(LCP|CLS|INP|FCP)/i,                    // Performance metrics MUST be included
      /(APPROVED|BLOCKED)/i
    ],
    name: '@tester'
  },

  // NOTE (v8.7.0 - Sprint 02): no VERSION/SemVer pattern here any more.
  // docs/orchestrator/VERSIONING.md:24 explicitly forbids @scribe from
  // writing VERSION ("never by an implementer agent") - a hook that
  // requires a scribe report to contain a SemVer string enforced the wrong
  // direction of that rule.
  scribe: {
    requiredSections: [
      'CHANGELOG',
      'Documentation'
    ],
    requiredPatterns: [
      /#{2,4}\s+CHANGELOG/i
    ],
    name: '@scribe'
  },

  'github-manager': {
    requiredSections: [
      'Action',
      'Result'
    ],
    requiredPatterns: [
      /(Issue|PR|Release)/i,
      /(Created|Updated|Closed)/i
    ],
    name: '@github-manager'
  }

  // NOTE (v8.7.0 - Sprint 02, Core Rule 8 / Defekt D1): deliberately no
  // entries for `security` or the 6 department agents
  // (ci-security-guardian, docs-dx, quality-operations, runtime-platform,
  // workflow-design, workspace-governance). None of them hold `Write` - they
  // return a verdict to whoever dispatched them instead of writing a report
  // file, so there is nothing on disk for this hook to validate. This is a
  // deliberate scope decision, not an oversight.
};

/**
 * Domain-specific validation rules (v5.8.0)
 * These extend or override core rules for specific project domains.
 *
 * Structure:
 * {
 *   domainName: {
 *     agentName: {
 *       requiredSections: [...],    // Additional sections required
 *       requiredPatterns: [...],    // Additional patterns to check
 *       overrides: boolean          // If true, replaces core rules; if false, extends them
 *     }
 *   }
 * }
 */
const VALIDATION_RULES_DOMAINS = {
  // Example: React Native domain
  'react-native': {
    builder: {
      requiredSections: [
        'Platform Compatibility',
        'iOS Considerations',
        'Android Considerations'
      ],
      requiredPatterns: [
        /Platform\.(OS|select)/i,
        /(iOS|Android)/i
      ],
      overrides: false // Extends core rules
    },
    tester: {
      requiredSections: [
        'Device Testing',
        'Simulator/Emulator Results'
      ],
      requiredPatterns: [
        /(iPhone|iPad|Android|Simulator|Emulator)/i
      ],
      overrides: false
    }
  },

  // Example: Backend/API domain
  'backend': {
    architect: {
      requiredSections: [
        'Database Schema',
        'API Endpoints',
        'Authentication Flow'
      ],
      requiredPatterns: [
        /(REST|GraphQL|Database|Schema)/i,
        /(endpoint|route)/i
      ],
      overrides: false
    }
    // NOTE (v8.7.0 - Sprint 02): `validator` domain override removed — the
    // agent no longer exists (see VALIDATION_RULES_CORE note above).
  },

  // Example: Documentation-only domain
  'docs': {
    scribe: {
      requiredSections: [
        'Documentation Structure',
        'API Reference Updated',
        'Examples Provided'
      ],
      requiredPatterns: [
        /(README|API|Examples|Guide)/i
      ],
      overrides: false
    }
  }
};

/**
 * Backwards compatibility: Combined validation rules
 * This is the legacy export that merges core rules.
 */
const VALIDATION_RULES = VALIDATION_RULES_CORE;

/**
 * Get validation rules for an agent, optionally with domain-specific extensions
 * @param {string} agentName - The agent name (e.g., 'builder', 'architect')
 * @param {string|null} domain - Optional domain name (e.g., 'react-native', 'backend')
 * @returns {object|null} Merged validation rules or null if no rules exist
 */
function getRules(agentName, domain = null) {
  const coreRules = VALIDATION_RULES_CORE[agentName];

  // No core rules for this agent
  if (!coreRules) {
    // Check if there are domain-specific rules even without core
    if (domain && VALIDATION_RULES_DOMAINS[domain] && VALIDATION_RULES_DOMAINS[domain][agentName]) {
      return VALIDATION_RULES_DOMAINS[domain][agentName];
    }
    return null;
  }

  // No domain specified - return core rules
  if (!domain) {
    return coreRules;
  }

  // Check for domain-specific rules
  const domainRules = VALIDATION_RULES_DOMAINS[domain]?.[agentName];

  // No domain rules - return core
  if (!domainRules) {
    return coreRules;
  }

  // Domain rules with override - replace core entirely
  if (domainRules.overrides === true) {
    return {
      ...domainRules,
      name: coreRules.name // Preserve display name
    };
  }

  // Merge domain rules into core rules (extend mode)
  return {
    requiredSections: [
      ...coreRules.requiredSections,
      ...(domainRules.requiredSections || [])
    ],
    requiredPatterns: [
      ...coreRules.requiredPatterns,
      ...(domainRules.requiredPatterns || [])
    ],
    name: coreRules.name
  };
}

/**
 * Register a new domain with validation rules (v5.8.0)
 * @param {string} domainName - The domain name to register
 * @param {object} rules - The validation rules for the domain
 * @returns {boolean} True if registration successful
 */
function registerDomain(domainName, rules) {
  if (!domainName || typeof domainName !== 'string') {
    console.error(`${colors.red}Error: Domain name must be a non-empty string${colors.reset}`);
    return false;
  }

  if (!rules || typeof rules !== 'object') {
    console.error(`${colors.red}Error: Rules must be an object${colors.reset}`);
    return false;
  }

  // Validate structure of rules
  const validAgents = Object.keys(VALIDATION_RULES_CORE);
  const providedAgents = Object.keys(rules);

  for (const agent of providedAgents) {
    if (!validAgents.includes(agent)) {
      console.warn(`${colors.yellow}Warning: Unknown agent '${agent}' in domain rules${colors.reset}`);
    }

    const agentRules = rules[agent];
    if (agentRules.requiredSections && !Array.isArray(agentRules.requiredSections)) {
      console.error(`${colors.red}Error: requiredSections must be an array${colors.reset}`);
      return false;
    }
    if (agentRules.requiredPatterns && !Array.isArray(agentRules.requiredPatterns)) {
      console.error(`${colors.red}Error: requiredPatterns must be an array${colors.reset}`);
      return false;
    }
  }

  // Register the domain
  VALIDATION_RULES_DOMAINS[domainName] = rules;
  console.log(`${colors.green}Domain '${domainName}' registered successfully${colors.reset}`);
  return true;
}

/**
 * Get list of available domains
 * @returns {string[]} Array of domain names
 */
function getAvailableDomains() {
  return Object.keys(VALIDATION_RULES_DOMAINS);
}

/**
 * Get domain rules for a specific domain
 * @param {string} domainName - The domain name
 * @returns {object|null} Domain rules or null
 */
function getDomainRules(domainName) {
  return VALIDATION_RULES_DOMAINS[domainName] || null;
}

/**
 * Validate agent output
 * @param {string} agentName - The agent name
 * @param {string} output - The output content to validate
 * @param {string|null} domain - Optional domain for domain-specific rules (v5.8.0)
 */
function validateAgentOutput(agentName, output, domain = null) {
  // v5.8.0: Use getRules for domain-aware rule resolution
  const rules = getRules(agentName, domain);

  if (!rules) {
    // No validation rules for this agent - pass
    return {
      valid: true,
      agent: agentName,
      message: 'No validation rules defined (pass by default)'
    };
  }

  const validation = {
    valid: true,
    agent: agentName,
    agentDisplay: rules.name,
    domain: domain, // v5.8.0: Track domain used for validation
    issues: [],
    warnings: [],
    stats: {
      length: output.length,
      sectionsFound: 0,
      sectionsRequired: rules.requiredSections.length,
      patternsMatched: 0,
      patternsRequired: rules.requiredPatterns.length
    }
  };

  // v8.7.0 (Sprint 02): minLength gate removed entirely — see
  // reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md:92,
  // which names "length minimums" under "do not adopt" (a Goodhart trap:
  // it rewards padding, not completed work). The pattern/section checks
  // below are what actually verify the work happened.

  // Check required sections
  rules.requiredSections.forEach(section => {
    const regex = new RegExp(section, 'i');
    if (regex.test(output)) {
      validation.stats.sectionsFound++;
    } else {
      validation.warnings.push(`Missing recommended section: "${section}"`);
    }
  });

  // Check required patterns
  rules.requiredPatterns.forEach((pattern, index) => {
    if (pattern.test(output)) {
      validation.stats.patternsMatched++;
    } else {
      validation.valid = false;
      validation.issues.push(
        `Missing required pattern #${index + 1}: ${pattern.toString()}`
      );
    }
  });

  // Calculate completeness score
  const sectionScore = validation.stats.sectionsFound / validation.stats.sectionsRequired;
  const patternScore = validation.stats.patternsMatched / validation.stats.patternsRequired;
  validation.completeness = Math.round(((sectionScore + patternScore) / 2) * 100);

  return validation;
}

/**
 * Display validation results
 */
function displayValidationResults(validation) {
  console.log('');
  console.log(`${colors.cyan}+============================================================+${colors.reset}`);
  console.log(`${colors.cyan}|  AGENT OUTPUT VALIDATION (v5.8.0)                          |${colors.reset}`);
  console.log(`${colors.cyan}+============================================================+${colors.reset}`);
  console.log('');

  // Agent info
  console.log(`${colors.bright}Agent:${colors.reset} ${validation.agentDisplay || validation.agent}`);
  // v5.8.0: Show domain if used
  if (validation.domain) {
    console.log(`${colors.bright}Domain:${colors.reset} ${validation.domain}`);
  }
  console.log(`${colors.bright}Status:${colors.reset} ${getValidationStatusDisplay(validation)}`);
  console.log(`${colors.bright}Completeness:${colors.reset} ${getCompletenessDisplay(validation.completeness)}`);
  console.log('');

  // Stats
  console.log(`${colors.cyan}Statistics:${colors.reset}`);
  console.log(`  Output length: ${validation.stats.length} chars`);
  console.log(`  Required sections: ${validation.stats.sectionsFound}/${validation.stats.sectionsRequired}`);
  console.log(`  Required patterns: ${validation.stats.patternsMatched}/${validation.stats.patternsRequired}`);
  console.log('');

  // Issues
  if (validation.issues.length > 0) {
    console.log(`${colors.red}Issues (BLOCKING):${colors.reset}`);
    validation.issues.forEach(issue => {
      console.log(`  ${colors.red}✗${colors.reset} ${issue}`);
    });
    console.log('');
  }

  // Warnings
  if (validation.warnings.length > 0) {
    console.log(`${colors.yellow}Warnings:${colors.reset}`);
    validation.warnings.forEach(warning => {
      console.log(`  ${colors.yellow}⚠${colors.reset} ${warning}`);
    });
    console.log('');
  }

  // Recommendation
  if (!validation.valid) {
    console.log(`${colors.yellow}Recommendation:${colors.reset}`);
    console.log(`  Agent output incomplete - consider re-running ${validation.agentDisplay}`);
    console.log(`  or manually verify output quality.`);
    console.log('');
  } else if (validation.completeness < 80) {
    console.log(`${colors.yellow}Note:${colors.reset}`);
    console.log(`  Output passed validation but completeness is below 80%.`);
    console.log(`  Consider improving output quality for better results.`);
    console.log('');
  } else {
    console.log(`${colors.green}✓ Agent output meets quality standards${colors.reset}`);
    console.log('');
  }
}

/**
 * Get validation status display
 */
function getValidationStatusDisplay(validation) {
  if (validation.valid) {
    return `${colors.green}✓ VALID${colors.reset}`;
  } else {
    return `${colors.red}✗ INVALID${colors.reset}`;
  }
}

/**
 * Get completeness display
 */
function getCompletenessDisplay(completeness) {
  let color = colors.gray;

  if (completeness >= 90) {
    color = colors.green;
  } else if (completeness >= 70) {
    color = colors.yellow;
  } else {
    color = colors.red;
  }

  return `${color}${completeness}%${colors.reset}`;
}

/**
 * Load agent output from report file
 */
function loadAgentOutput(reportPath) {
  try {
    if (!fs.existsSync(reportPath)) {
      return null;
    }

    return fs.readFileSync(reportPath, 'utf-8');
  } catch (error) {
    console.error(`${colors.red}Error loading report: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Detect agent name from report filename
 */
function detectAgentName(filename) {
  const agentPatterns = {
    'researcher': /researcher/i,        // NEW: v5.10.0
    'architect': /architect/i,
    'api-guardian': /api-guardian/i,
    'builder': /builder/i,
    'tester': /tester/i,
    'scribe': /scribe/i,
    'github-manager': /github-manager/i
  };

  for (const [agent, pattern] of Object.entries(agentPatterns)) {
    if (pattern.test(filename)) {
      return agent;
    }
  }

  return null;
}

/**
 * Parse CLI arguments (v5.8.0)
 * Supports: --domain=<name>, --list-domains, --help
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const result = {
    reportPath: null,
    agentName: null,
    domain: null,
    listDomains: false,
    help: false
  };

  for (const arg of args) {
    if (arg === '--help' || arg === '-h') {
      result.help = true;
    } else if (arg === '--list-domains') {
      result.listDomains = true;
    } else if (arg.startsWith('--domain=')) {
      result.domain = arg.split('=')[1];
    } else if (!result.reportPath) {
      result.reportPath = arg;
    } else if (!result.agentName) {
      result.agentName = arg;
    }
  }

  return result;
}

/**
 * Show usage help
 */
function showHelp() {
  console.log('');
  console.log(`${colors.cyan}Agent Output Validator (v5.8.0)${colors.reset}`);
  console.log('');
  console.log('Usage:');
  console.log('  validate-agent-output.js <report-file> [agent-name] [options]');
  console.log('');
  console.log('Options:');
  console.log('  --domain=<name>    Apply domain-specific validation rules');
  console.log('  --list-domains     List available domains');
  console.log('  --help, -h         Show this help message');
  console.log('');
  console.log('Examples:');
  console.log('  validate-agent-output.js reports/v5.8.0/02-builder-report.md builder');
  console.log('  validate-agent-output.js reports/v5.8.0/02-builder-report.md builder --domain=react-native');
  console.log('  validate-agent-output.js --list-domains');
  console.log('');
  console.log('Available Domains:');
  getAvailableDomains().forEach(domain => {
    console.log(`  - ${domain}`);
  });
  console.log('');
}

/**
 * Check workflow violations (v5.9.0)
 * Blocks execution if workflow rules are violated
 */
function checkWorkflowViolation(agentType, validation) {
  const stateFile = path.join(process.cwd(), '.ccgm-state.json');

  // If state file doesn't exist, allow execution (not in workflow mode)
  if (!fs.existsSync(stateFile)) {
    return null;
  }

  try {
    const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));

    // Check if @scribe is called but a declared gate is not approved.
    // v8.7.0 (Sprint 02): @validator no longer exists - its deterministic
    // checks run via the verify-changes.js SubagentStop hook, not as agent
    // state tracked here. @tester is opt-in (sprint frontmatter `ux_gate:
    // auto`), so its absence from state is not a violation; only an
    // explicit BLOCKED verdict from a tester run that actually happened
    // blocks @scribe.
    if (agentType === 'scribe') {
      const testerStatus = state.qualityGates?.tester?.status || state.qualityGates?.tester;

      if (testerStatus === 'BLOCKED') {
        return {
          blocked: true,
          reason: 'WORKFLOW_VIOLATION',
          message: '@scribe cannot run before the UX gate is approved',
          details: {
            testerStatus
          }
        };
      }
    }

    // Check if agent is in expected sequence
    const expectedSequence = state.expectedAgents || [];
    const completedAgents = state.completedAgents || [];

    if (expectedSequence.length > 0 && !expectedSequence.includes(agentType)) {
      // Not blocking yet, just warning
      console.warn(`${colors.yellow}Warning: ${agentType} not in expected sequence: ${expectedSequence.join(' → ')}${colors.reset}`);
    }

    return null;
  } catch (error) {
    // If we can't read state file, don't block
    console.warn(`${colors.yellow}Warning: Could not read workflow state: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Hook mode (v8.5 fix): Claude Code hooks (SubagentStop etc.) invoke this script
 * with NO argv and deliver a JSON payload on stdin. The old wiring passed no
 * arguments, so every hook fire died in the usage branch with exit 1 and no
 * report was ever validated. In hook mode we:
 *  - read the stdin payload (for cwd),
 *  - locate the most recently modified report under reports/ (last 15 min),
 *  - validate it, and exit 2 (blocking, per hook contract) on violations.
 * If no recent report exists we exit 0 — a hook must never break unrelated work.
 */
function findLatestReport(baseDir) {
  const reportsDir = path.join(baseDir, 'reports');
  if (!fs.existsSync(reportsDir)) return null;
  let best = null;
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith('.md')) {
        const mtime = fs.statSync(full).mtimeMs;
        if (!best || mtime > best.mtime) best = { path: full, mtime };
      }
    }
  };
  try { walk(reportsDir); } catch { return null; }
  if (!best) return null;
  const fifteenMinutes = 15 * 60 * 1000;
  return (Date.now() - best.mtime) <= fifteenMinutes ? best.path : null;
}

function runHookMode(domain) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { raw += d; });
  process.stdin.on('end', () => {
    let payload = {};
    try { payload = JSON.parse(raw || '{}'); } catch { /* tolerate non-JSON */ }
    const cwd = payload.cwd || process.cwd();

    const reportPath = findLatestReport(cwd);
    if (!reportPath) process.exit(0);

    const output = loadAgentOutput(reportPath);
    if (!output) process.exit(0);

    const agent = detectAgentName(path.basename(reportPath));
    if (!agent) process.exit(0);

    const validation = validateAgentOutput(agent, output, domain);
    displayValidationResults(validation);

    const violation = checkWorkflowViolation(agent, validation);
    if (violation) {
      console.error(`WORKFLOW VIOLATION: ${violation.reason} — ${violation.message}`);
      process.exit(2); // blocking exit code per Claude Code hook contract
    }
    if (validation.completeness < 30) {
      console.error(`Agent report critically incomplete (${validation.completeness}% < 30%): ${reportPath}`);
      process.exit(2);
    }
    process.exit(0);
  });
}

/**
 * Main CLI interface
 */
function main() {
  const args = parseArgs();

  // Handle --help
  if (args.help) {
    showHelp();
    process.exit(0);
  }

  // Handle --list-domains
  if (args.listDomains) {
    console.log('');
    console.log(`${colors.cyan}Available Domains:${colors.reset}`);
    const domains = getAvailableDomains();
    if (domains.length === 0) {
      console.log('  (no domains registered)');
    } else {
      domains.forEach(domain => {
        const rules = getDomainRules(domain);
        const agentCount = Object.keys(rules).length;
        console.log(`  ${colors.green}${domain}${colors.reset} - ${agentCount} agent(s) configured`);
      });
    }
    console.log('');
    process.exit(0);
  }

  // Validate required arguments
  if (!args.reportPath) {
    // Hook mode: no argv, JSON payload on stdin (Claude Code hook contract)
    if (!process.stdin.isTTY) {
      runHookMode(args.domain);
      return;
    }
    console.error('Usage: validate-agent-output.js <report-file> [agent-name] [--domain=<name>]');
    console.error('');
    console.error('Use --help for more information.');
    process.exit(1);
  }

  // Load output
  const output = loadAgentOutput(args.reportPath);

  if (!output) {
    console.error(`${colors.red}Could not load report: ${args.reportPath}${colors.reset}`);
    process.exit(1);
  }

  // Detect agent name if not provided
  let detectedAgent = args.agentName;
  if (!detectedAgent) {
    detectedAgent = detectAgentName(path.basename(args.reportPath));
  }

  if (!detectedAgent) {
    console.error(`${colors.yellow}Warning: Could not detect agent name from filename${colors.reset}`);
    console.error(`${colors.yellow}Validation skipped - provide agent name as second argument${colors.reset}`);
    process.exit(0);
  }

  // Validate domain if provided
  if (args.domain && !getDomainRules(args.domain)) {
    console.warn(`${colors.yellow}Warning: Unknown domain '${args.domain}' - using core rules only${colors.reset}`);
    args.domain = null;
  }

  // Validate with optional domain
  const validation = validateAgentOutput(detectedAgent, output, args.domain);

  // Display results
  displayValidationResults(validation);

  // v5.9.0: Check for workflow violations (BLOCKING)
  const workflowViolation = checkWorkflowViolation(detectedAgent, validation);
  if (workflowViolation) {
    console.log('');
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log(`${colors.red}|  WORKFLOW VIOLATION - EXECUTION BLOCKED                    |${colors.reset}`);
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Reason:${colors.reset} ${workflowViolation.reason}`);
    console.log(`${colors.bright}Message:${colors.reset} ${workflowViolation.message}`);
    console.log('');
    if (workflowViolation.details) {
      console.log(`${colors.bright}Details:${colors.reset}`);
      Object.entries(workflowViolation.details).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log('');
    }
    console.log(`${colors.yellow}Fix the issues and retry.${colors.reset}`);
    console.log('');
    process.exit(1);
  }

  // v5.9.0: Check completeness score - block if critically low
  if (validation.completeness < 30) {
    console.log('');
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log(`${colors.red}|  CRITICAL: COMPLETENESS TOO LOW - EXECUTION BLOCKED        |${colors.reset}`);
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Completeness Score:${colors.reset} ${validation.completeness}% (minimum: 30%)`);
    console.log('');
    console.log(`${colors.yellow}Agent output is critically incomplete.${colors.reset}`);
    console.log(`${colors.yellow}Please ensure all required sections and patterns are present.${colors.reset}`);
    console.log('');
    process.exit(1);
  }

  // Exit successfully for warnings only
  if (!validation.valid) {
    console.log(`${colors.yellow}Note: Validation warnings present but not blocking.${colors.reset}`);
    console.log('');
  }

  process.exit(0);
}

// Export for use by other scripts
module.exports = {
  // Core validation (v5.6.0)
  validateAgentOutput,
  displayValidationResults,
  VALIDATION_RULES,

  // Domain support (v5.8.0)
  VALIDATION_RULES_CORE,
  VALIDATION_RULES_DOMAINS,
  getRules,
  registerDomain,
  getAvailableDomains,
  getDomainRules
};

// CLI mode
if (require.main === module) {
  main();
}
