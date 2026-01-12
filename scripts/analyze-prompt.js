#!/usr/bin/env node

/**
 * User Prompt Analyzer (v5.8.0)
 *
 * UserPromptSubmit Hook Implementation
 *
 * Analyzes user input to provide:
 * - Task type detection (feature/bug/refactor/docs)
 * - Complexity assessment (low/medium/high)
 * - Suggested workflow
 * - Estimated time and agent sequence
 * - Meta-decision rule application (v5.8.0)
 *
 * Features:
 * - Pattern-based task classification
 * - Intelligent workflow suggestions
 * - Context-aware optimization tips
 * - Proactive guidance
 * - Meta-decision layer for special cases (v5.8.0)
 */

const fs = require('fs');
const path = require('path');

// v5.7.0 - Phase 2: Domain Pack Integration
const domainDetectorPath = path.join(__dirname, '..', 'Orchester-Design', 'scripts', 'domain-detector.js');
let detectDomain = null;

// Lazy load domain detector if available
try {
  if (fs.existsSync(domainDetectorPath)) {
    const domainDetector = require(domainDetectorPath);
    detectDomain = domainDetector.detectDomain;
  }
} catch (error) {
  // Domain detector not available - continue with CC_GodMode core only
}

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
 * Task type detection patterns
 */
const TASK_PATTERNS = {
  feature: {
    patterns: [
      /add|implement|create|build|new|feature/i,
      /integrate|introduce|establish/i
    ],
    keywords: ['add', 'new', 'create', 'implement', 'feature', 'build'],
    weight: 10
  },

  bug: {
    patterns: [
      /fix|bug|error|problem|issue|broken/i,
      /crash|fail|wrong|incorrect/i
    ],
    keywords: ['fix', 'bug', 'error', 'issue', 'broken', 'crash'],
    weight: 15
  },

  refactor: {
    patterns: [
      /refactor|optimize|improve|restructure|clean/i,
      /enhance|reorganize|consolidate/i
    ],
    keywords: ['refactor', 'optimize', 'improve', 'clean', 'enhance'],
    weight: 8
  },

  api: {
    patterns: [
      /api|endpoint|route|type|interface/i,
      /contract|schema|graphql|openapi/i
    ],
    keywords: ['api', 'endpoint', 'route', 'type', 'interface', 'schema'],
    weight: 12
  },

  documentation: {
    patterns: [
      /document|readme|changelog|docs/i,
      /write docs|update docs/i
    ],
    keywords: ['document', 'readme', 'changelog', 'docs'],
    weight: 5
  },

  release: {
    patterns: [
      /release|publish|deploy|version/i,
      /prepare release|bump version/i
    ],
    keywords: ['release', 'publish', 'deploy', 'version'],
    weight: 7
  },

  issue: {
    patterns: [
      /issue #\d+|process issue|work on issue/i,
      /github issue|close issue/i
    ],
    keywords: ['issue', '#', 'github'],
    weight: 10
  },

  // v5.7.0: Legal/Domain task types
  legal: {
    patterns: [
      /legal opinion|analyze case|review contract|strategic advice/i,
      /lawsuit|litigation|legal analysis|precedent/i,
      /legal research|court case|legal memo/i
    ],
    keywords: ['legal', 'contract', 'lawsuit', 'court', 'patent', 'attorney'],
    weight: 12
  }
};

/**
 * Meta-Decision Layer (v5.8.0)
 *
 * Override rules for special cases that require workflow modifications.
 * These rules are applied AFTER initial analysis to handle edge cases.
 */
const META_DECISION_LAYER = {
  // Rule 1: Security Override
  // Any security-related issue escalates to high complexity and adds @validator priority
  securityOverride: {
    id: 'META-001',
    name: 'Security Override',
    triggers: [
      /security|vulnerability|CVE|exploit|injection|XSS|CSRF|auth bypass/i,
      /sensitive data|credentials|password|token leak/i,
      /privilege escalation|unauthorized access/i
    ],
    action: {
      forceComplexity: 'high',
      addAgents: ['validator'],
      priorityAgent: 'validator',
      addTips: [
        'SECURITY: @validator will perform security-focused review',
        'SECURITY: Consider adding security tests',
        'SECURITY: Review for OWASP Top 10 vulnerabilities'
      ]
    },
    description: 'Escalates security-related tasks to high priority with @validator focus'
  },

  // Rule 2: Breaking Change Escalation
  // Breaking changes MUST go through @api-guardian regardless of task type
  breakingChangeEscalation: {
    id: 'META-002',
    name: 'Breaking Change Escalation',
    triggers: [
      /breaking change|backward incompatible|deprecate/i,
      /remove api|delete endpoint|change interface/i,
      /major version|v\d+\.0\.0/i
    ],
    action: {
      forceAgents: ['architect', 'api-guardian', 'builder', 'validator', 'tester', 'scribe'],
      forceWorkflow: '@architect -> @api-guardian -> @builder -> @validator -> @tester -> @scribe',
      addTips: [
        'BREAKING: @api-guardian is MANDATORY for this change',
        'BREAKING: Document migration path for consumers',
        'BREAKING: Consider deprecation period before removal'
      ]
    },
    description: 'Forces API change workflow for any breaking changes'
  },

  // Rule 3: Performance Critical Path
  // Performance-related changes need @tester with specific focus
  performanceCriticalPath: {
    id: 'META-003',
    name: 'Performance Critical Path',
    triggers: [
      /performance|optimize|slow|latency|throughput/i,
      /memory leak|CPU usage|bottleneck/i,
      /core web vitals|lighthouse score|page speed/i
    ],
    action: {
      priorityAgent: 'tester',
      addTips: [
        'PERFORMANCE: @tester will run performance benchmarks',
        'PERFORMANCE: Establish baseline metrics before changes',
        'PERFORMANCE: Consider A/B testing for user-facing improvements'
      ]
    },
    description: 'Adds performance testing focus to workflow'
  },

  // Rule 4: Emergency Hotfix
  // Hotfixes skip @architect for faster deployment
  emergencyHotfix: {
    id: 'META-004',
    name: 'Emergency Hotfix',
    triggers: [
      /hotfix|emergency|urgent fix|production down/i,
      /critical bug|blocker|P0|severity.?1/i,
      /immediate|ASAP|right now/i
    ],
    action: {
      skipAgents: ['architect'],
      forceWorkflow: '@builder -> @validator -> @tester',
      forceComplexity: 'low',
      addTips: [
        'HOTFIX: Skipping @architect for faster resolution',
        'HOTFIX: Create follow-up issue for proper fix if needed',
        'HOTFIX: Ensure regression tests are added'
      ]
    },
    description: 'Streamlines workflow for emergency fixes'
  },

  // Rule 5: Documentation-Only Optimization
  // Pure documentation changes skip quality gates
  documentationOnlyOptimization: {
    id: 'META-005',
    name: 'Documentation-Only Optimization',
    triggers: [
      /^(update|fix|improve|add).*(readme|changelog|docs|documentation|comments?)$/i,
      /^documentation only|^docs only|^doc update$/i,
      /typo in.*(readme|docs|documentation)/i
    ],
    action: {
      forceAgents: ['scribe'],
      forceWorkflow: '@scribe',
      skipAgents: ['validator', 'tester', 'builder'],
      forceComplexity: 'low',
      addTips: [
        'DOCS-ONLY: Simplified workflow - @scribe only',
        'DOCS-ONLY: No code quality gates needed',
        'DOCS-ONLY: Verify links and formatting'
      ]
    },
    description: 'Optimizes pure documentation updates'
  }
};

/**
 * Complexity indicators
 */
const COMPLEXITY_INDICATORS = {
  high: {
    patterns: [
      /architecture|redesign|migration|breaking/i,
      /multiple files|many files|complex/i,
      /significant change|major update/i
    ],
    keywords: ['architecture', 'breaking', 'migration', 'complex', 'major'],
    indicators: ['multiple', 'many', 'all', 'entire', 'system-wide']
  },

  medium: {
    patterns: [
      /update|modify|change|extend/i,
      /several|some|few files/i
    ],
    keywords: ['update', 'modify', 'extend', 'enhance'],
    indicators: ['several', 'some', 'few', 'couple']
  },

  low: {
    patterns: [
      /small|minor|quick|simple/i,
      /one file|single file|typo/i
    ],
    keywords: ['small', 'minor', 'quick', 'simple', 'typo'],
    indicators: ['one', 'single', 'just', 'only']
  }
};

/**
 * Workflow suggestions based on task type
 */
const WORKFLOW_SUGGESTIONS = {
  feature: {
    workflow: '@architect → @builder → @validator → @tester → @scribe',
    agents: ['architect', 'builder', 'validator', 'tester', 'scribe'],
    estimatedTime: {
      low: '2-3 hours',
      medium: '4-8 hours',
      high: '1-2 days'
    },
    tips: [
      'Start with @architect for design decisions',
      'Ensure comprehensive testing',
      'Update documentation'
    ]
  },

  bug: {
    workflow: '@builder → @validator → @tester',
    agents: ['builder', 'validator', 'tester'],
    estimatedTime: {
      low: '30-60 minutes',
      medium: '1-2 hours',
      high: '3-5 hours'
    },
    tips: [
      'Reproduce the bug first',
      'Add regression tests',
      'Verify fix doesn\'t break other functionality'
    ]
  },

  refactor: {
    workflow: '@architect → @builder → @validator → @tester',
    agents: ['architect', 'builder', 'validator', 'tester'],
    estimatedTime: {
      low: '1-2 hours',
      medium: '3-5 hours',
      high: '1-2 days'
    },
    tips: [
      'Ensure no behavior changes',
      'Run full test suite',
      'Consider incremental approach for large refactors'
    ]
  },

  api: {
    workflow: '@architect → @api-guardian → @builder → @validator → @tester → @scribe',
    agents: ['architect', 'api-guardian', 'builder', 'validator', 'tester', 'scribe'],
    estimatedTime: {
      low: '2-3 hours',
      medium: '4-6 hours',
      high: '1-2 days'
    },
    tips: [
      '@api-guardian is MANDATORY for API changes',
      'Check all consumers',
      'Consider backward compatibility',
      'Update API documentation'
    ]
  },

  documentation: {
    workflow: '@scribe',
    agents: ['scribe'],
    estimatedTime: {
      low: '30 minutes',
      medium: '1-2 hours',
      high: '3-4 hours'
    },
    tips: [
      'Include code examples',
      'Update CHANGELOG if needed',
      'Verify all links work'
    ]
  },

  release: {
    workflow: '@scribe → @github-manager',
    agents: ['scribe', 'github-manager'],
    estimatedTime: {
      low: '30 minutes',
      medium: '1 hour',
      high: '2 hours'
    },
    tips: [
      'Verify VERSION file updated',
      'CHANGELOG complete',
      'All tests passing',
      'Get user permission before push'
    ]
  },

  issue: {
    workflow: '@github-manager → [dynamic based on issue type]',
    agents: ['github-manager'],
    estimatedTime: {
      low: 'Variable',
      medium: 'Variable',
      high: 'Variable'
    },
    tips: [
      'Let @github-manager analyze issue first',
      'Workflow will be determined by issue content',
      'PR will reference issue automatically'
    ]
  },

  // v5.7.0: Legal/Domain workflows
  legal: {
    workflow: '[Domain Pack: Anwaltsorchester]',
    agents: [],
    estimatedTime: {
      low: '1-2 hours',
      medium: '2-4 hours',
      high: '4-8 hours'
    },
    tips: [
      'Using domain-specific legal orchestration',
      'Anwaltsorchester agents will handle this request',
      'Legal analysis follows specialized workflow'
    ]
  }
};

/**
 * Analyze user prompt (v5.8.0 - Enhanced with meta-decision layer)
 */
function analyzeUserPrompt(prompt, context = {}) {
  const analysis = {
    timestamp: new Date().toISOString(),
    prompt: prompt.slice(0, 100) + (prompt.length > 100 ? '...' : ''),
    taskType: detectTaskType(prompt),
    complexity: assessComplexity(prompt),
    confidence: 0,
    suggestedWorkflow: null,
    estimatedTime: null,
    tips: [],
    // v5.7.0: Domain analysis
    domain: null,
    orchestrationType: null,
    // v5.8.0: Meta-decision tracking
    metaDecisions: [],
    hasMetaDecisions: false
  };

  // v5.7.0: Detect domain if available
  if (detectDomain) {
    try {
      const domainAnalysis = detectDomain(
        prompt,
        context.recentFiles || [],
        context.cwd || process.cwd()
      );

      analysis.domain = domainAnalysis;
      analysis.orchestrationType = domainAnalysis.type === 'domain-pack' ? 'domain' : 'technical';
    } catch (error) {
      // Domain detection failed - continue with technical orchestration
      analysis.orchestrationType = 'technical';
    }
  } else {
    // Domain detector not available - use technical orchestration
    analysis.orchestrationType = 'technical';
  }

  // Get workflow suggestion
  if (analysis.taskType !== 'unknown') {
    const suggestion = WORKFLOW_SUGGESTIONS[analysis.taskType];

    if (suggestion) {
      analysis.suggestedWorkflow = suggestion.workflow;
      analysis.estimatedTime = suggestion.estimatedTime[analysis.complexity] || 'Variable';
      analysis.tips = suggestion.tips || [];
      analysis.agents = suggestion.agents || [];
    }
  }

  // Calculate confidence
  analysis.confidence = calculateConfidence(prompt, analysis);

  // v5.8.0: Apply meta-decision rules (AFTER initial analysis)
  applyMetaDecisions(prompt, analysis);

  // Recalculate estimated time if complexity was overridden
  if (analysis.complexityOverridden && analysis.taskType !== 'unknown') {
    const suggestion = WORKFLOW_SUGGESTIONS[analysis.taskType];
    if (suggestion) {
      analysis.estimatedTime = suggestion.estimatedTime[analysis.complexity] || 'Variable';
    }
  }

  return analysis;
}

/**
 * Detect task type from prompt
 */
function detectTaskType(prompt) {
  const scores = {};

  // Score each task type
  Object.entries(TASK_PATTERNS).forEach(([type, config]) => {
    let score = 0;

    // Check patterns
    config.patterns.forEach(pattern => {
      if (pattern.test(prompt)) {
        score += config.weight;
      }
    });

    // Check keywords
    config.keywords.forEach(keyword => {
      if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
        score += config.weight / 2;
      }
    });

    scores[type] = score;
  });

  // Find highest score
  let maxScore = 0;
  let bestType = 'unknown';

  Object.entries(scores).forEach(([type, score]) => {
    if (score > maxScore) {
      maxScore = score;
      bestType = type;
    }
  });

  // Return unknown if confidence too low
  if (maxScore < 5) {
    return 'unknown';
  }

  return bestType;
}

/**
 * Assess complexity from prompt
 */
function assessComplexity(prompt) {
  const scores = {
    high: 0,
    medium: 0,
    low: 0
  };

  // Score each complexity level
  Object.entries(COMPLEXITY_INDICATORS).forEach(([level, config]) => {
    // Check patterns
    config.patterns.forEach(pattern => {
      if (pattern.test(prompt)) {
        scores[level] += 3;
      }
    });

    // Check keywords
    config.keywords.forEach(keyword => {
      if (prompt.toLowerCase().includes(keyword.toLowerCase())) {
        scores[level] += 2;
      }
    });

    // Check indicators
    config.indicators.forEach(indicator => {
      if (prompt.toLowerCase().includes(indicator.toLowerCase())) {
        scores[level] += 1;
      }
    });
  });

  // Default to medium if no strong signals
  if (scores.high === 0 && scores.medium === 0 && scores.low === 0) {
    return 'medium';
  }

  // Find highest score
  let maxScore = 0;
  let complexity = 'medium';

  Object.entries(scores).forEach(([level, score]) => {
    if (score > maxScore) {
      maxScore = score;
      complexity = level;
    }
  });

  return complexity;
}

/**
 * Calculate confidence score
 */
function calculateConfidence(prompt, analysis) {
  let confidence = 0;

  // Prompt length indicator
  if (prompt.length > 50) confidence += 20;
  if (prompt.length > 100) confidence += 10;

  // Task type detection
  if (analysis.taskType !== 'unknown') confidence += 40;

  // Complexity signals
  if (analysis.complexity !== 'medium') confidence += 15;

  // Specific keywords
  const hasSpecificKeywords = /file|component|function|api|test/i.test(prompt);
  if (hasSpecificKeywords) confidence += 15;

  return Math.min(confidence, 100);
}

/**
 * Apply Meta-Decision Rules (v5.8.0)
 *
 * Checks prompt against meta-decision rules and modifies analysis accordingly.
 * Rules are applied in order of priority (security > breaking > performance > hotfix > docs).
 *
 * @param {string} prompt - The user's prompt
 * @param {object} analysis - The initial analysis object
 * @returns {object} - Modified analysis with applied meta-decisions
 */
function applyMetaDecisions(prompt, analysis) {
  const appliedRules = [];

  // Check each meta-decision rule
  Object.entries(META_DECISION_LAYER).forEach(([ruleKey, rule]) => {
    // Check if any trigger pattern matches
    const isTriggered = rule.triggers.some(pattern => pattern.test(prompt));

    if (isTriggered) {
      appliedRules.push({
        id: rule.id,
        name: rule.name,
        description: rule.description
      });

      const action = rule.action;

      // Apply forceComplexity
      if (action.forceComplexity) {
        analysis.complexity = action.forceComplexity;
        analysis.complexityOverridden = true;
      }

      // Apply forceWorkflow
      if (action.forceWorkflow) {
        analysis.suggestedWorkflow = action.forceWorkflow;
        analysis.workflowOverridden = true;
      }

      // Apply forceAgents
      if (action.forceAgents) {
        analysis.agents = action.forceAgents;
        analysis.agentsOverridden = true;
      }

      // Apply addAgents
      if (action.addAgents) {
        const currentAgents = analysis.agents || [];
        action.addAgents.forEach(agent => {
          if (!currentAgents.includes(agent)) {
            currentAgents.push(agent);
          }
        });
        analysis.agents = currentAgents;
      }

      // Apply skipAgents
      if (action.skipAgents && analysis.agents) {
        analysis.agents = analysis.agents.filter(
          agent => !action.skipAgents.includes(agent)
        );
      }

      // Apply priorityAgent
      if (action.priorityAgent) {
        analysis.priorityAgent = action.priorityAgent;
      }

      // Apply addTips
      if (action.addTips) {
        analysis.tips = [...(action.addTips), ...(analysis.tips || [])];
      }
    }
  });

  // Store applied rules in analysis
  if (appliedRules.length > 0) {
    analysis.metaDecisions = appliedRules;
    analysis.hasMetaDecisions = true;
  } else {
    analysis.metaDecisions = [];
    analysis.hasMetaDecisions = false;
  }

  return analysis;
}

/**
 * Display analysis results (v5.8.0 - Enhanced with meta-decision display)
 */
function displayAnalysis(analysis) {
  // Only display if confidence is reasonable
  if (analysis.confidence < 40) {
    return; // Don't show low-confidence suggestions
  }

  console.log('');
  console.log(`${colors.cyan}+============================================================+${colors.reset}`);
  console.log(`${colors.cyan}|  WORKFLOW SUGGESTION (v5.8.0)                              |${colors.reset}`);
  console.log(`${colors.cyan}+============================================================+${colors.reset}`);
  console.log('');

  // Task info
  console.log(`${colors.bright}Task Type:${colors.reset} ${getTaskTypeDisplay(analysis.taskType)}`);
  console.log(`${colors.bright}Complexity:${colors.reset} ${getComplexityDisplay(analysis.complexity)}${analysis.complexityOverridden ? ` ${colors.yellow}(overridden)${colors.reset}` : ''}`);
  console.log(`${colors.bright}Confidence:${colors.reset} ${getConfidenceDisplay(analysis.confidence)}`);

  // v5.7.0: Domain information
  if (analysis.domain && analysis.orchestrationType) {
    console.log(`${colors.bright}Orchestration:${colors.reset} ${getOrchestrationType(analysis.orchestrationType, analysis.domain)}`);
  }

  console.log('');

  // v5.8.0: Meta-Decision Rules Applied
  if (analysis.hasMetaDecisions && analysis.metaDecisions.length > 0) {
    console.log(`${colors.yellow}+------------------------------------------------------------+${colors.reset}`);
    console.log(`${colors.yellow}|  META-DECISION RULES APPLIED                               |${colors.reset}`);
    console.log(`${colors.yellow}+------------------------------------------------------------+${colors.reset}`);
    analysis.metaDecisions.forEach(rule => {
      console.log(`  ${colors.yellow}[${rule.id}]${colors.reset} ${colors.bright}${rule.name}${colors.reset}`);
      console.log(`  ${colors.gray}${rule.description}${colors.reset}`);
    });
    console.log('');
  }

  // Suggested workflow
  if (analysis.suggestedWorkflow) {
    console.log(`${colors.bright}Suggested Workflow:${colors.reset}${analysis.workflowOverridden ? ` ${colors.yellow}(overridden)${colors.reset}` : ''}`);
    console.log(`  ${colors.cyan}${analysis.suggestedWorkflow}${colors.reset}`);
    console.log('');

    console.log(`${colors.bright}Estimated Time:${colors.reset} ${analysis.estimatedTime}`);
    console.log('');
  }

  // Priority Agent (v5.8.0)
  if (analysis.priorityAgent) {
    console.log(`${colors.bright}Priority Agent:${colors.reset} ${colors.yellow}@${analysis.priorityAgent}${colors.reset}`);
    console.log('');
  }

  // Tips
  if (analysis.tips.length > 0) {
    console.log(`${colors.bright}Tips:${colors.reset}`);
    analysis.tips.forEach(tip => {
      // Color-code tips based on prefix
      let tipColor = colors.gray;
      if (tip.startsWith('SECURITY:')) tipColor = colors.red;
      else if (tip.startsWith('BREAKING:')) tipColor = colors.yellow;
      else if (tip.startsWith('PERFORMANCE:')) tipColor = colors.blue;
      else if (tip.startsWith('HOTFIX:')) tipColor = colors.yellow;
      else if (tip.startsWith('DOCS-ONLY:')) tipColor = colors.cyan;

      console.log(`  ${tipColor}*${colors.reset} ${tip}`);
    });
    console.log('');
  }
}

/**
 * Get task type display
 */
function getTaskTypeDisplay(taskType) {
  const colors_map = {
    'feature': colors.green,
    'bug': colors.red,
    'refactor': colors.blue,
    'api': colors.yellow,
    'documentation': colors.cyan,
    'release': colors.bright,
    'issue': colors.yellow,
    'legal': colors.yellow,  // v5.7.0
    'unknown': colors.gray
  };

  const color = colors_map[taskType] || colors.gray;
  return `${color}${taskType.toUpperCase()}${colors.reset}`;
}

/**
 * Get complexity display
 */
function getComplexityDisplay(complexity) {
  const colors_map = {
    'low': colors.green,
    'medium': colors.yellow,
    'high': colors.red
  };

  const color = colors_map[complexity] || colors.gray;
  return `${color}${complexity.toUpperCase()}${colors.reset}`;
}

/**
 * Get confidence display
 */
function getConfidenceDisplay(confidence) {
  let color = colors.gray;

  if (confidence >= 80) {
    color = colors.green;
  } else if (confidence >= 60) {
    color = colors.yellow;
  } else {
    color = colors.red;
  }

  return `${color}${confidence}%${colors.reset}`;
}

/**
 * Get orchestration type display (v5.7.0)
 */
function getOrchestrationType(orchestrationType, domainData) {
  if (orchestrationType === 'domain') {
    return `${colors.yellow}DOMAIN${colors.reset} - ${domainData.displayName} (Score: ${domainData.score})`;
  } else {
    return `${colors.cyan}TECHNICAL${colors.reset} - CC_GodMode Core`;
  }
}

/**
 * Check for dangerous patterns in prompt (v5.9.0)
 * Blocks execution if safety rules are violated
 */
function checkDangerousPatterns(prompt, analysis) {
  const stateFile = path.join(process.cwd(), '.ccgm-state.json');
  let workflowComplete = false;
  let qualityGatesApproved = false;

  // Check workflow state if available
  if (fs.existsSync(stateFile)) {
    try {
      const state = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
      workflowComplete = state.workflowComplete === true;
      qualityGatesApproved = state.qualityGates?.validator?.status === 'APPROVED' &&
                            state.qualityGates?.tester?.status === 'APPROVED';
    } catch (error) {
      // Ignore state file errors
    }
  }

  // Check for push attempts when workflow not complete
  // v5.11.1: Fixed false positives - only detect ACTUAL push intent

  // Patterns that indicate ACTUAL push intent (action verbs + push keywords)
  const pushIntentPatterns = [
    /\b(?:please|do|run|execute|start|begin|now|can you|should we|let's|time to)\s+(?:push|deploy|publish)/i,
    /\b(?:git\s+)?push\b/i,  // Actual git push command
    /\b(?:push|deploy|publish)\s+(?:to|now|this|it|code|changes)\b/i,
    /\b(?:ready to|time to|let's)\s+(?:push|deploy|release|publish)/i
  ];

  // Patterns that indicate INSTRUCTION/DOCUMENTATION (should NOT trigger)
  const instructionalPatterns = [
    /\b(?:never|don't|do not|cannot|must not|should not)\s+(?:push|deploy|publish)/i,
    /\b(?:no|without)\s+(?:push|deploy|publish)/i,
    /\bpermission.*(?:push|deploy|publish)/i,
    /\b(?:push|deploy|publish).*permission\b/i,
    /\b(?:rule|workflow|process).*(?:push|deploy|publish)/i,
    /\b(?:push|deploy|publish).*(?:rule|workflow|process)\b/i
  ];

  // Check if this is instructional content (should NOT block)
  const isInstructional = instructionalPatterns.some(pattern => pattern.test(prompt));

  // Check for actual push intent
  const hasPushIntent = pushIntentPatterns.some(pattern => pattern.test(prompt));

  // Additional confidence check: Long prompts with few matches are likely instructional
  const promptLength = prompt.length;
  const pushKeywordCount = (prompt.match(/\b(?:push|deploy|publish|release)\b/gi) || []).length;
  const isLikelyInstructional = promptLength > 1000 && pushKeywordCount <= 3;

  // Only block if there's actual push intent AND it's not instructional AND workflow not complete
  if (hasPushIntent && !isInstructional && !isLikelyInstructional && !workflowComplete) {
    return {
      blocked: true,
      reason: 'PREMATURE_PUSH_ATTEMPT',
      message: 'Cannot push/deploy before workflow is complete',
      details: {
        workflowComplete: workflowComplete,
        qualityGatesApproved: qualityGatesApproved,
        suggestion: 'Complete the full workflow before pushing'
      }
    };
  }

  // Check for gate-skipping attempts
  // v5.11.1: Fixed false positives - only detect ACTUAL gate-skip intent

  // Patterns that indicate ACTUAL gate-skip intent (action verbs + skip keywords)
  const skipIntentPatterns = [
    /\b(?:please|can you|let's|do|should we)\s+skip\s+(?:the\s+)?(?:validator|tester|quality|gates?|test)/i,
    /\b(?:don't|do not)\s+run\s+(?:the\s+)?(?:validator|tester|quality|gates?|test)/i,
    /\bbypass\s+(?:the\s+)?(?:quality\s+)?gates?\b/i,
    /\bskip\s+(?:to|directly to|straight to)\b/i,
    /\bwithout\s+(?:running|testing|validating)\b/i
  ];

  // Patterns that indicate INSTRUCTION/DOCUMENTATION (should NOT trigger)
  const instructionalSkipPatterns = [
    /\bif\s+you.*without\b/i,  // Conditional instruction: "if you call @builder without @architect"
    /\bmust\s+(?:both\s+)?(?:run|execute|approve)\b/i,  // Requirement: "must both run"
    /\bstop.*this\s+violates\b/i,  // Violation warning: "STOP - this violates"
    /\bcannot\s+skip\b/i,  // Prohibition: "cannot skip"
    /\bmandatory.*(?:validator|tester|quality|gates?)\b/i,  // Mandate: "mandatory quality gates"
    /\b(?:validator|tester).*(?:are|is)\s+mandatory\b/i,  // Mandate: "validator is mandatory"
    /\b(?:never|don't|do not)\s+skip\b/i  // Prohibition: "never skip"
  ];

  // Check if this is instructional content (should NOT block)
  const isInstructionalSkip = instructionalSkipPatterns.some(pattern => pattern.test(prompt));

  // Check for actual gate-skip intent
  const hasSkipIntent = skipIntentPatterns.some(pattern => pattern.test(prompt));

  // Additional confidence check: Long prompts with few skip keywords are likely instructional
  // (reuse promptLength from push detection above)
  const skipKeywordCount = (prompt.match(/\b(?:skip|bypass|without|omit)\b/gi) || []).length;
  const isLikelyInstructionalSkip = promptLength > 1000 && skipKeywordCount <= 3;

  // Only block if there's actual skip intent AND it's not instructional
  if (hasSkipIntent && !isInstructionalSkip && !isLikelyInstructionalSkip) {
    return {
      blocked: true,
      reason: 'GATE_SKIP_ATTEMPT',
      message: 'Cannot skip quality gates - they are mandatory',
      details: {
        suggestion: 'Quality gates (@validator and @tester) must both approve before proceeding',
        enforcement: 'This is enforced by CC_GodMode workflow rules'
      }
    };
  }

  return null;
}

/**
 * Main CLI interface
 */
function main() {
  const prompt = process.argv.slice(2).join(' ');

  if (!prompt) {
    console.error('Usage: analyze-prompt.js <user prompt>');
    console.error('');
    console.error('Example: analyze-prompt.js "Add authentication to user API"');
    process.exit(1);
  }

  // Analyze prompt
  const analysis = analyzeUserPrompt(prompt);

  // v5.9.0: Check for dangerous patterns (BLOCKING)
  const dangerousPattern = checkDangerousPatterns(prompt, analysis);
  if (dangerousPattern) {
    console.log('');
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log(`${colors.red}|  DANGEROUS PATTERN DETECTED - EXECUTION BLOCKED            |${colors.reset}`);
    console.log(`${colors.red}+============================================================+${colors.reset}`);
    console.log('');
    console.log(`${colors.bright}Reason:${colors.reset} ${dangerousPattern.reason}`);
    console.log(`${colors.bright}Message:${colors.reset} ${dangerousPattern.message}`);
    console.log('');
    if (dangerousPattern.details) {
      console.log(`${colors.bright}Details:${colors.reset}`);
      Object.entries(dangerousPattern.details).forEach(([key, value]) => {
        console.log(`  ${key}: ${value}`);
      });
      console.log('');
    }
    console.log(`${colors.yellow}Please follow the proper workflow.${colors.reset}`);
    console.log('');
    process.exit(1);
  }

  // Display results
  displayAnalysis(analysis);

  // Exit successfully
  process.exit(0);
}

// Export for use by other scripts
module.exports = {
  analyzeUserPrompt,
  displayAnalysis,
  detectTaskType,
  assessComplexity,
  // v5.8.0: Meta-decision exports
  applyMetaDecisions,
  META_DECISION_LAYER
};

// CLI mode
if (require.main === module) {
  main();
}
