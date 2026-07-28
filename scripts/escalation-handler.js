#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * Escalation Handler (v5.8.0)
 *
 * Abort/Escalation Mechanism for CC_GodMode
 *
 * Provides a 3-tier resolution system for handling workflow issues:
 * - Tier 1: Auto-resolution (retry, fallback)
 * - Tier 2: Orchestrator intervention (workflow adjustment)
 * - Tier 3: User escalation (requires human decision)
 *
 * Features:
 * - Configurable escalation thresholds
 * - Audit logging for all escalations
 * - Default OFF to preserve existing behavior
 * - Graceful degradation
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
 * Escalation Configuration
 * v5.9.0: ENABLED for blocking hook enforcement
 */
const ESCALATION_CONFIG = {
  enabled: true,  // Enabled in v5.9.0 for workflow enforcement
  tier1: {
    maxRetries: 3,
    retryDelayMs: 1000,
    autoResolvable: [
      'TIMEOUT',
      'MCP_UNAVAILABLE',
      'TRANSIENT_ERROR'
    ]
  },
  tier2: {
    orchestratorTimeout: 30000,
    escalatableFrom: [
      'VALIDATION_FAILED',
      'CONSUMER_MISMATCH',
      'QUALITY_GATE_BLOCKED'
    ]
  },
  tier3: {
    requiresUserInput: [
      'AMBIGUOUS_REQUIREMENT',
      'SECURITY_CONCERN',
      'BREAKING_CHANGE_DETECTED',
      'RESOURCE_LIMIT_EXCEEDED',
      'ARCHITECTURAL_DECISION'
    ]
  },
  logging: {
    enabled: true,
    logDir: 'reports',
    logFile: 'escalation-log.json'
  }
};

/**
 * Escalation categories and their default tier assignments
 */
const ESCALATION_CATEGORIES = {
  // Tier 1: Auto-resolvable
  TIMEOUT: { tier: 1, description: 'Operation timed out', action: 'retry' },
  MCP_UNAVAILABLE: { tier: 1, description: 'MCP server not responding', action: 'fallback' },
  TRANSIENT_ERROR: { tier: 1, description: 'Temporary error', action: 'retry' },

  // Tier 2: Orchestrator intervention
  VALIDATION_FAILED: { tier: 2, description: 'Agent output validation failed', action: 'adjust_workflow' },
  CONSUMER_MISMATCH: { tier: 2, description: 'API consumer count mismatch', action: 'rerun_agent' },
  QUALITY_GATE_BLOCKED: { tier: 2, description: 'Quality gate blocked workflow', action: 'feedback_loop' },
  DEPENDENCY_MISSING: { tier: 2, description: 'Required dependency not found', action: 'install_or_skip' },

  // Tier 3: User escalation
  AMBIGUOUS_REQUIREMENT: { tier: 3, description: 'Requirements unclear', action: 'user_clarification' },
  SECURITY_CONCERN: { tier: 3, description: 'Potential security issue', action: 'user_approval' },
  BREAKING_CHANGE_DETECTED: { tier: 3, description: 'Breaking change requires approval', action: 'user_approval' },
  RESOURCE_LIMIT_EXCEEDED: { tier: 3, description: 'Resource limits exceeded', action: 'user_decision' },
  ARCHITECTURAL_DECISION: { tier: 3, description: 'Architecture decision needed', action: 'user_decision' },
  UNKNOWN: { tier: 3, description: 'Unknown error category', action: 'user_decision' }
};

/**
 * Escalation Handler Class
 */
class EscalationHandler {
  constructor(config = {}) {
    this.config = { ...ESCALATION_CONFIG, ...config };
    this.escalationLog = [];
    this.currentContext = null;
  }

  /**
   * Enable escalation handling
   */
  enable() {
    this.config.enabled = true;
    this.log('Escalation handling enabled');
  }

  /**
   * Disable escalation handling
   */
  disable() {
    this.config.enabled = false;
    this.log('Escalation handling disabled');
  }

  /**
   * Check if escalation handling is enabled
   */
  isEnabled() {
    return this.config.enabled;
  }

  /**
   * Set workflow context for escalation tracking
   */
  setContext(context) {
    this.currentContext = {
      version: context.version || 'unknown',
      workflow: context.workflow || 'unknown',
      agent: context.agent || null,
      timestamp: new Date().toISOString(),
      ...context
    };
  }

  /**
   * Main escalation handler
   * Routes to appropriate tier based on error category
   */
  async handleEscalation(category, details = {}) {
    if (!this.config.enabled) {
      // When disabled, log and return without intervention
      console.warn(`${colors.yellow}[ESCALATION DISABLED] ${category}: ${details.message || 'No details'}${colors.reset}`);
      return {
        handled: false,
        tier: 0,
        action: 'none',
        message: 'Escalation handling is disabled'
      };
    }

    const categoryInfo = ESCALATION_CATEGORIES[category] || ESCALATION_CATEGORIES.UNKNOWN;
    const escalation = {
      id: this.generateEscalationId(),
      category,
      tier: categoryInfo.tier,
      description: categoryInfo.description,
      action: categoryInfo.action,
      details,
      context: this.currentContext,
      timestamp: new Date().toISOString()
    };

    // Log escalation
    this.logEscalation(escalation);

    // Route to appropriate tier handler
    switch (categoryInfo.tier) {
      case 1:
        return await this.tier1Resolution(escalation);
      case 2:
        return await this.tier2Resolution(escalation);
      case 3:
        return await this.tier3Escalation(escalation);
      default:
        return await this.tier3Escalation(escalation);
    }
  }

  /**
   * Tier 1: Auto-resolution
   * Handles transient errors with retry/fallback
   */
  async tier1Resolution(escalation) {
    console.log(`${colors.blue}[TIER 1] Auto-resolving: ${escalation.category}${colors.reset}`);

    const result = {
      tier: 1,
      escalationId: escalation.id,
      category: escalation.category,
      handled: false,
      action: null,
      retries: 0
    };

    if (escalation.action === 'retry') {
      // Attempt retry with exponential backoff
      for (let i = 0; i < this.config.tier1.maxRetries; i++) {
        result.retries = i + 1;
        console.log(`${colors.gray}  Retry attempt ${i + 1}/${this.config.tier1.maxRetries}...${colors.reset}`);

        // Simulate retry delay
        await this.delay(this.config.tier1.retryDelayMs * Math.pow(2, i));

        // Check if retry callback was provided
        if (escalation.details.retryCallback) {
          try {
            const retryResult = await escalation.details.retryCallback();
            if (retryResult.success) {
              result.handled = true;
              result.action = 'retry_succeeded';
              result.data = retryResult.data;
              console.log(`${colors.green}  Retry successful!${colors.reset}`);
              break;
            }
          } catch (e) {
            console.log(`${colors.yellow}  Retry ${i + 1} failed: ${e.message}${colors.reset}`);
          }
        } else {
          // No callback, just mark as needing manual retry
          result.action = 'manual_retry_needed';
          break;
        }
      }

      if (!result.handled) {
        console.log(`${colors.yellow}  Auto-resolution failed, escalating to Tier 2${colors.reset}`);
        escalation.tier = 2;
        return await this.tier2Resolution(escalation);
      }
    } else if (escalation.action === 'fallback') {
      // Use fallback if available
      if (escalation.details.fallbackFn) {
        try {
          result.data = await escalation.details.fallbackFn();
          result.handled = true;
          result.action = 'fallback_used';
          console.log(`${colors.green}  Fallback successful${colors.reset}`);
        } catch (e) {
          console.log(`${colors.yellow}  Fallback failed: ${e.message}${colors.reset}`);
          escalation.tier = 2;
          return await this.tier2Resolution(escalation);
        }
      } else {
        result.action = 'no_fallback_available';
        escalation.tier = 2;
        return await this.tier2Resolution(escalation);
      }
    }

    this.updateEscalationLog(escalation.id, result);
    return result;
  }

  /**
   * Tier 2: Orchestrator intervention
   * Adjusts workflow or re-runs agents
   */
  async tier2Resolution(escalation) {
    console.log(`${colors.yellow}[TIER 2] Orchestrator intervention: ${escalation.category}${colors.reset}`);

    const result = {
      tier: 2,
      escalationId: escalation.id,
      category: escalation.category,
      handled: false,
      action: null,
      recommendation: null
    };

    switch (escalation.action) {
      case 'adjust_workflow':
        result.recommendation = this.getWorkflowAdjustment(escalation);
        result.action = 'workflow_adjustment_recommended';
        result.handled = true;
        break;

      case 'rerun_agent':
        result.recommendation = {
          action: 'rerun',
          agent: escalation.context?.agent || 'unknown',
          withFeedback: escalation.details.feedback || null
        };
        result.action = 'agent_rerun_recommended';
        result.handled = true;
        break;

      case 'feedback_loop':
        result.recommendation = {
          action: 'feedback_to_builder',
          blockedBy: escalation.details.blockedBy || ['validator', 'tester'],
          issues: escalation.details.issues || []
        };
        result.action = 'feedback_loop_initiated';
        result.handled = true;
        break;

      case 'install_or_skip':
        result.recommendation = {
          action: 'dependency_resolution',
          missing: escalation.details.dependency || 'unknown',
          options: ['install', 'skip', 'abort']
        };
        result.action = 'dependency_resolution_needed';
        result.handled = true;
        break;

      default:
        // Escalate to Tier 3
        console.log(`${colors.yellow}  Cannot resolve at Tier 2, escalating to Tier 3${colors.reset}`);
        escalation.tier = 3;
        return await this.tier3Escalation(escalation);
    }

    console.log(`${colors.cyan}  Recommendation: ${JSON.stringify(result.recommendation)}${colors.reset}`);
    this.updateEscalationLog(escalation.id, result);
    return result;
  }

  /**
   * Tier 3: User escalation
   * Requires human decision
   */
  async tier3Escalation(escalation) {
    console.log(`${colors.red}[TIER 3] User escalation required: ${escalation.category}${colors.reset}`);

    const result = {
      tier: 3,
      escalationId: escalation.id,
      category: escalation.category,
      handled: false,
      action: 'user_input_required',
      userPrompt: null
    };

    // Generate user-facing prompt
    result.userPrompt = this.generateUserPrompt(escalation);
    result.handled = false; // User must respond

    console.log('');
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log(`${colors.red}|  ESCALATION REQUIRES USER INPUT                            |${colors.reset}`);
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Escalation ID:${colors.reset} ${escalation.id}`);
    console.log(`${colors.bright}Category:${colors.reset} ${escalation.category}`);
    console.log(`${colors.bright}Description:${colors.reset} ${escalation.description}`);
    console.log('');
    console.log(`${colors.bright}Details:${colors.reset}`);
    console.log(`  ${escalation.details.message || 'No additional details'}`);
    console.log('');
    console.log(`${colors.bright}Required Action:${colors.reset}`);
    console.log(`  ${result.userPrompt.action}`);
    console.log('');
    if (result.userPrompt.options && result.userPrompt.options.length > 0) {
      console.log(`${colors.bright}Options:${colors.reset}`);
      result.userPrompt.options.forEach((opt, i) => {
        console.log(`  ${i + 1}. ${opt}`);
      });
      console.log('');
    }
    console.log(`${colors.gray}Workflow is PAUSED until user provides input.${colors.reset}`);
    console.log('');

    this.updateEscalationLog(escalation.id, result);
    return result;
  }

  /**
   * Generate workflow adjustment recommendation
   */
  getWorkflowAdjustment(escalation) {
    const category = escalation.category;
    const context = escalation.context || {};

    switch (category) {
      case 'VALIDATION_FAILED':
        return {
          action: 'skip_or_retry',
          message: 'Agent output validation failed',
          options: [
            { action: 'retry_agent', agent: context.agent },
            { action: 'skip_validation', warning: 'May reduce quality' },
            { action: 'abort_workflow' }
          ]
        };

      case 'QUALITY_GATE_BLOCKED':
        return {
          action: 'feedback_loop',
          message: 'Quality gate blocked progress',
          options: [
            { action: 'send_feedback_to_builder' },
            { action: 'override_gate', warning: 'Not recommended' },
            { action: 'abort_workflow' }
          ]
        };

      default:
        return {
          action: 'manual_review',
          message: 'Manual review needed',
          options: [
            { action: 'continue' },
            { action: 'abort_workflow' }
          ]
        };
    }
  }

  /**
   * Generate user-facing prompt for Tier 3 escalation
   */
  generateUserPrompt(escalation) {
    const category = escalation.category;

    switch (category) {
      case 'AMBIGUOUS_REQUIREMENT':
        return {
          action: 'Please clarify the requirement',
          options: escalation.details.interpretations || ['Provide clarification'],
          type: 'clarification'
        };

      case 'SECURITY_CONCERN':
        return {
          action: 'Security issue detected - please review and approve or reject',
          options: ['Approve (accept risk)', 'Reject (abort workflow)', 'Modify and retry'],
          type: 'approval',
          severity: 'high'
        };

      case 'BREAKING_CHANGE_DETECTED':
        return {
          action: 'Breaking change detected - this will affect consumers',
          options: ['Approve breaking change', 'Request non-breaking alternative', 'Abort'],
          type: 'approval',
          affectedConsumers: escalation.details.consumers || []
        };

      case 'RESOURCE_LIMIT_EXCEEDED':
        return {
          action: 'Resource limits exceeded',
          options: ['Increase limits', 'Reduce scope', 'Abort'],
          type: 'decision',
          limits: escalation.details.limits || {}
        };

      case 'ARCHITECTURAL_DECISION':
        return {
          action: 'Architectural decision required',
          options: escalation.details.options || ['Continue', 'Abort'],
          type: 'decision',
          context: escalation.details.context || 'No additional context'
        };

      default:
        return {
          action: 'User decision required',
          options: ['Continue', 'Abort'],
          type: 'decision'
        };
    }
  }

  /**
   * Log escalation to file
   */
  logEscalation(escalation) {
    this.escalationLog.push(escalation);

    if (this.config.logging.enabled) {
      this.persistLog();
    }
  }

  /**
   * Update existing escalation in log
   */
  updateEscalationLog(escalationId, result) {
    const index = this.escalationLog.findIndex(e => e.id === escalationId);
    if (index !== -1) {
      this.escalationLog[index].result = result;
      this.escalationLog[index].resolvedAt = new Date().toISOString();
    }

    if (this.config.logging.enabled) {
      this.persistLog();
    }
  }

  /**
   * Persist log to file
   */
  persistLog() {
    try {
      const logDir = this.config.logging.logDir;
      const logFile = this.config.logging.logFile;

      // Use version-based directory if context available
      let targetDir = logDir;
      if (this.currentContext?.version) {
        targetDir = path.join(logDir, `v${this.currentContext.version}`);
      }

      // Ensure directory exists
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const logPath = path.join(targetDir, logFile);

      // Load existing log if present
      let existingLog = [];
      if (fs.existsSync(logPath)) {
        try {
          existingLog = JSON.parse(fs.readFileSync(logPath, 'utf-8'));
        } catch (e) {
          existingLog = [];
        }
      }

      // Merge and save
      const mergedLog = [...existingLog, ...this.escalationLog.filter(
        e => !existingLog.find(ex => ex.id === e.id)
      )];

      fs.writeFileSync(logPath, JSON.stringify(mergedLog, null, 2));
    } catch (e) {
      console.error(`${colors.yellow}Warning: Could not persist escalation log: ${e.message}${colors.reset}`);
    }
  }

  /**
   * Generate unique escalation ID
   */
  generateEscalationId() {
    return `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  }

  /**
   * Helper: delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Internal logging
   */
  log(message) {
    console.log(`${colors.gray}[EscalationHandler] ${message}${colors.reset}`);
  }

  /**
   * Get escalation statistics
   */
  getStats() {
    const stats = {
      total: this.escalationLog.length,
      byTier: { 1: 0, 2: 0, 3: 0 },
      byCategory: {},
      resolved: 0,
      pending: 0
    };

    this.escalationLog.forEach(e => {
      stats.byTier[e.tier] = (stats.byTier[e.tier] || 0) + 1;
      stats.byCategory[e.category] = (stats.byCategory[e.category] || 0) + 1;
      if (e.resolvedAt) {
        stats.resolved++;
      } else {
        stats.pending++;
      }
    });

    return stats;
  }

  /**
   * Clear escalation log (for testing)
   */
  clearLog() {
    this.escalationLog = [];
  }
}

/**
 * Singleton instance
 */
let escalationHandlerInstance = null;

/**
 * Get or create singleton instance
 */
function getEscalationHandler(config = {}) {
  if (!escalationHandlerInstance) {
    escalationHandlerInstance = new EscalationHandler(config);
  }
  return escalationHandlerInstance;
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const handler = getEscalationHandler();

  switch (command) {
    case 'status':
      console.log('');
      console.log(`${colors.cyan}Escalation Handler Status${colors.reset}`);
      console.log(`  Enabled: ${handler.isEnabled() ? colors.green + 'Yes' : colors.red + 'No'}${colors.reset}`);
      console.log(`  Config: ${JSON.stringify(ESCALATION_CONFIG, null, 2)}`);
      break;

    case 'enable':
      handler.enable();
      console.log(`${colors.green}Escalation handling enabled${colors.reset}`);
      break;

    case 'disable':
      handler.disable();
      console.log(`${colors.yellow}Escalation handling disabled${colors.reset}`);
      break;

    case 'stats':
      const stats = handler.getStats();
      console.log('');
      console.log(`${colors.cyan}Escalation Statistics${colors.reset}`);
      console.log(`  Total: ${stats.total}`);
      console.log(`  Resolved: ${stats.resolved}`);
      console.log(`  Pending: ${stats.pending}`);
      console.log(`  By Tier: Tier1=${stats.byTier[1]}, Tier2=${stats.byTier[2]}, Tier3=${stats.byTier[3]}`);
      break;

    case 'test':
      // Test mode - simulate an escalation
      console.log(`${colors.cyan}Testing escalation handler...${colors.reset}`);
      handler.enable();
      handler.setContext({ version: '5.8.0', workflow: 'test', agent: 'builder' });
      handler.handleEscalation('TIMEOUT', { message: 'Test timeout error' })
        .then(result => {
          console.log(`${colors.green}Test complete:${colors.reset}`, result);
        });
      break;

    default:
      console.log('');
      console.log(`${colors.cyan}Escalation Handler (v5.8.0)${colors.reset}`);
      console.log('');
      console.log('Usage:');
      console.log('  escalation-handler.js status    Show current status');
      console.log('  escalation-handler.js enable    Enable escalation handling');
      console.log('  escalation-handler.js disable   Disable escalation handling');
      console.log('  escalation-handler.js stats     Show escalation statistics');
      console.log('  escalation-handler.js test      Run a test escalation');
      console.log('');
      console.log(`${colors.yellow}Note: Escalation handling is DISABLED by default.${colors.reset}`);
      console.log('');
  }
}

// Export for use by other scripts
module.exports = {
  EscalationHandler,
  getEscalationHandler,
  ESCALATION_CONFIG,
  ESCALATION_CATEGORIES
};

// CLI mode
if (require.main === module) {
  main();
}
