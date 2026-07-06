#!/usr/bin/env node

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
      /##\s+(Key Findings|Findings)/i,
      /##\s+Sources/i,
      /\[.*\]\(https?:\/\//i,  // Must have at least one source link
      /(Recommendation|Handoff)/i
    ],
    minLength: 500,
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
      /##\s+ARCHITECTURAL DECISIONS/i,
      /##\s+IMPLEMENTATION/i,
      /##\s+RISK/i
    ],
    minLength: 1000,
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
      /##\s+IMPACT ANALYSIS/i,
      /##\s+CONSUMER/i,
      /##\s+BREAKING/i
    ],
    minLength: 800,
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
      /###\s+Files Created/i,
      /###\s+Files Modified/i,
      /###\s+Quality Gates/i
    ],
    minLength: 500,
    name: '@builder'
  },

  validator: {
    requiredSections: [
      'Code Quality',
      'TypeScript',
      'Tests',
      'Decision'
    ],
    requiredPatterns: [
      /##\s+CODE QUALITY/i,
      /TypeScript/i,
      /Tests/i,
      /(APPROVED|BLOCKED)/i
    ],
    minLength: 400,
    name: '@validator'
  },

  // ENHANCED: @tester with mandatory screenshot enforcement (v5.10.0)
  tester: {
    requiredSections: [
      'E2E Tests',
      'Visual Regression',
      'Screenshots Created',
      'Console Errors',
      'Performance Metrics',
      'Accessibility',
      'Decision'
    ],
    requiredPatterns: [
      /##\s+E2E/i,
      /Visual/i,
      /(\.playwright-mcp\/|screenshots?\/)/i,  // Screenshot path MUST be present (.playwright-mcp/ or screenshots/)
      /\.(png|jpg|jpeg)/i,                     // Screenshot file MUST be named
      /Console\s*(Error|Message)/i,            // Console errors MUST be reported
      /(LCP|CLS|INP|FCP)/i,                    // Performance metrics MUST be included
      /A(11y|ccessibility)/i,
      /(APPROVED|BLOCKED)/i
    ],
    minLength: 800,  // Increased due to mandatory sections
    name: '@tester'
  },

  scribe: {
    requiredSections: [
      'CHANGELOG',
      'VERSION',
      'Documentation'
    ],
    requiredPatterns: [
      /##\s+CHANGELOG/i,
      /VERSION/i,
      /v?\d+\.\d+\.\d+/
    ],
    minLength: 300,
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
    minLength: 200,
    name: '@github-manager'
  }
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
 *       minLength: number,          // Override minimum length (optional)
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
    },
    validator: {
      requiredSections: [
        'API Contract Validation',
        'Database Migration Check'
      ],
      requiredPatterns: [
        /(migration|schema|contract)/i
      ],
      overrides: false
    }
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
      minLength: 500, // Higher minimum for docs
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
    minLength: domainRules.minLength || coreRules.minLength,
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
      requiredLength: rules.minLength,
      sectionsFound: 0,
      sectionsRequired: rules.requiredSections.length,
      patternsMatched: 0,
      patternsRequired: rules.requiredPatterns.length
    }
  };

  // Check minimum length
  if (output.length < rules.minLength) {
    validation.valid = false;
    validation.issues.push(
      `Output too short: ${output.length} chars (minimum: ${rules.minLength})`
    );
  }

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
  console.log(`  Output length: ${validation.stats.length} chars (min: ${validation.stats.requiredLength})`);
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
    'validator': /validator/i,
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

    // Check if @scribe is called but gates not approved
    if (agentType === 'scribe') {
      const validatorApproved = state.qualityGates?.validator?.status === 'APPROVED';
      const testerApproved = state.qualityGates?.tester?.status === 'APPROVED';

      if (!validatorApproved || !testerApproved) {
        return {
          blocked: true,
          reason: 'WORKFLOW_VIOLATION',
          message: '@scribe cannot run before quality gates are approved',
          details: {
            validatorStatus: state.qualityGates?.validator?.status || 'NOT_RUN',
            testerStatus: state.qualityGates?.tester?.status || 'NOT_RUN'
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
