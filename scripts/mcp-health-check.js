#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * MCP Health Check System (v5.6.0)
 *
 * Three-tier health validation:
 * - Tier 1: Startup (5 seconds) - comprehensive health check
 * - Tier 2: Pre-workflow (2 seconds) - specific MCP validation
 * - Tier 3: Agent-level (0.5 seconds) - dependency check
 *
 * Health Status Levels:
 * - HEALTHY: ✅ Green, full functionality
 * - WARNING: ⚠️  Yellow, degraded but functional
 * - CRITICAL: 🔴 Red, essential functionality unavailable
 * - OFFLINE: ⚫ Gray, completely unavailable
 */

const { execSync } = require('child_process');

// MCP Server Configuration
const MCP_SERVERS = {
  required: ['playwright', 'github', 'memory'],
  optional: ['lighthouse', 'a11y']
};

// Agent-MCP Dependencies
const AGENT_MCP_DEPENDENCIES = {
  'researcher': ['memory'],                           // NEW: v5.10.0 - WebSearch/WebFetch are built-in tools
  'tester': ['playwright', 'lighthouse', 'a11y'],
  'github-manager': ['github'],
  'scribe': ['memory'],
  'architect': ['memory'],
  'api-guardian': ['memory'],
  'builder': [],
  'tester': []
};

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
 * Tier 1: Startup Health Check (5 seconds max)
 * Comprehensive check of all MCP servers
 */
async function tier1HealthCheck() {
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    tier: 1,
    duration: 0,
    servers: {},
    summary: {
      total: 0,
      healthy: 0,
      warning: 0,
      critical: 0,
      offline: 0
    }
  };

  try {
    // Get MCP server list
    const output = execSync('claude mcp list 2>&1', {
      encoding: 'utf-8',
      timeout: 5000,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    const lines = output.split('\n');
    const activeServers = [];

    // Parse active servers
    lines.forEach(line => {
      [...MCP_SERVERS.required, ...MCP_SERVERS.optional].forEach(server => {
        if (line.toLowerCase().includes(server.toLowerCase()) &&
            !line.toLowerCase().includes('error') &&
            !line.toLowerCase().includes('failed')) {
          if (!activeServers.includes(server)) {
            activeServers.push(server);
          }
        }
      });
    });

    // Check each server
    [...MCP_SERVERS.required, ...MCP_SERVERS.optional].forEach(server => {
      const isRequired = MCP_SERVERS.required.includes(server);
      const isActive = activeServers.includes(server);

      let status = 'OFFLINE';
      let severity = 'INFO';

      if (isActive) {
        status = 'HEALTHY';
        severity = 'SUCCESS';
        results.summary.healthy++;
      } else if (isRequired) {
        status = 'CRITICAL';
        severity = 'ERROR';
        results.summary.critical++;
      } else {
        status = 'OFFLINE';
        severity = 'WARNING';
        results.summary.offline++;
      }

      results.servers[server] = {
        status,
        severity,
        required: isRequired,
        active: isActive,
        lastCheck: new Date().toISOString()
      };

      results.summary.total++;
    });

  } catch (error) {
    // MCP command failed - mark all as unknown
    [...MCP_SERVERS.required, ...MCP_SERVERS.optional].forEach(server => {
      results.servers[server] = {
        status: 'UNKNOWN',
        severity: 'ERROR',
        required: MCP_SERVERS.required.includes(server),
        active: false,
        error: error.message,
        lastCheck: new Date().toISOString()
      };
    });
  }

  results.duration = Date.now() - startTime;
  return results;
}

/**
 * Tier 2: Pre-Workflow Health Check (2 seconds max)
 * Check specific MCPs needed for a workflow
 */
async function tier2HealthCheck(requiredServers = []) {
  const startTime = Date.now();

  // Quick check of specific servers
  const tier1Results = await tier1HealthCheck();

  const results = {
    timestamp: new Date().toISOString(),
    tier: 2,
    duration: 0,
    requiredServers,
    allHealthy: true,
    issues: []
  };

  requiredServers.forEach(server => {
    const serverStatus = tier1Results.servers[server];

    if (!serverStatus || serverStatus.status !== 'HEALTHY') {
      results.allHealthy = false;
      results.issues.push({
        server,
        status: serverStatus?.status || 'UNKNOWN',
        severity: serverStatus?.severity || 'ERROR',
        message: `${server} is not healthy - some features may be unavailable`
      });
    }
  });

  results.duration = Date.now() - startTime;
  return results;
}

/**
 * Tier 3: Agent-Level Health Check (0.5 seconds max)
 * Check if agent's MCP dependencies are available
 */
async function tier3HealthCheck(agentName) {
  const startTime = Date.now();
  const requiredMCPs = AGENT_MCP_DEPENDENCIES[agentName] || [];

  const results = {
    timestamp: new Date().toISOString(),
    tier: 3,
    duration: 0,
    agent: agentName,
    requiredMCPs,
    canProceed: true,
    degradedMode: false,
    blockedFeatures: []
  };

  if (requiredMCPs.length === 0) {
    // Agent has no MCP dependencies
    results.canProceed = true;
    results.duration = Date.now() - startTime;
    return results;
  }

  // Use cached Tier 1 results for speed
  const tier1Results = await tier1HealthCheck();

  requiredMCPs.forEach(mcp => {
    const mcpStatus = tier1Results.servers[mcp];

    if (!mcpStatus || mcpStatus.status !== 'HEALTHY') {
      const isOptional = MCP_SERVERS.optional.includes(mcp);

      if (isOptional) {
        // Optional MCP - degraded mode
        results.degradedMode = true;
        results.blockedFeatures.push({
          feature: getMCPFeature(agentName, mcp),
          mcp,
          fallback: 'Manual operation or alternative method available'
        });
      } else {
        // Required MCP - cannot proceed
        results.canProceed = false;
        results.blockedFeatures.push({
          feature: getMCPFeature(agentName, mcp),
          mcp,
          fallback: 'BLOCKED - Agent cannot function without this MCP'
        });
      }
    }
  });

  results.duration = Date.now() - startTime;
  return results;
}

/**
 * Get the feature that depends on a specific MCP for an agent
 */
function getMCPFeature(agentName, mcpName) {
  const features = {
    'researcher': {                                    // NEW: v5.10.0
      'memory': 'Research context, previous findings storage'
    },
    'tester': {
      'playwright': 'Visual regression testing, E2E tests, screenshots',
      'lighthouse': 'Performance audits, Core Web Vitals',
      'a11y': 'Accessibility validation, WCAG compliance'
    },
    'github-manager': {
      'github': 'Issue management, PR creation, release automation'
    },
    'scribe': {
      'memory': 'Changelog context, documentation history'
    },
    'architect': {
      'memory': 'Architecture decisions context'
    },
    'api-guardian': {
      'memory': 'API consumer registry, change history'
    }
  };

  return features[agentName]?.[mcpName] || `${mcpName} integration`;
}

/**
 * Display health check results with colored output
 */
function displayHealthResults(results) {
  if (results.tier === 1) {
    // Tier 1: Full display
    console.log('');
    console.log(`${colors.cyan}MCP Health Status${colors.reset}`);

    Object.entries(results.servers).forEach(([server, status]) => {
      let icon = '○';
      let color = colors.gray;

      switch (status.status) {
        case 'HEALTHY':
          icon = '✓';
          color = colors.green;
          break;
        case 'WARNING':
          icon = '⚠';
          color = colors.yellow;
          break;
        case 'CRITICAL':
          icon = '✗';
          color = colors.red;
          break;
        case 'OFFLINE':
          icon = '○';
          color = colors.gray;
          break;
      }

      const requiredTag = status.required ? `${colors.bright}[REQUIRED]${colors.reset}` : '[optional]';
      console.log(`  ${color}${icon} ${server}${colors.reset} ${requiredTag}`);
    });

    // Summary
    if (results.summary.critical > 0) {
      console.log('');
      console.log(`  ${colors.red}⚠ ${results.summary.critical} critical MCP(s) offline${colors.reset}`);
      console.log(`  ${colors.gray}Some agents may not function properly${colors.reset}`);
    }

  } else if (results.tier === 2) {
    // Tier 2: Issues only
    if (!results.allHealthy) {
      console.log('');
      console.log(`${colors.yellow}⚠ Workflow MCP Dependencies${colors.reset}`);
      results.issues.forEach(issue => {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${issue.message}`);
      });
    }

  } else if (results.tier === 3) {
    // Tier 3: Agent-specific
    if (!results.canProceed) {
      console.log('');
      console.log(`${colors.red}✗ Agent Blocked: ${results.agent}${colors.reset}`);
      results.blockedFeatures.forEach(feature => {
        console.log(`  ${colors.red}✗${colors.reset} ${feature.feature} (${feature.mcp})`);
        console.log(`    ${colors.gray}${feature.fallback}${colors.reset}`);
      });
    } else if (results.degradedMode) {
      console.log('');
      console.log(`${colors.yellow}⚠ Agent in Degraded Mode: ${results.agent}${colors.reset}`);
      results.blockedFeatures.forEach(feature => {
        console.log(`  ${colors.yellow}⚠${colors.reset} ${feature.feature} unavailable`);
        console.log(`    ${colors.gray}${feature.fallback}${colors.reset}`);
      });
    }
  }
}

/**
 * Get graceful degradation suggestions
 */
function getGracefulDegradation(agentName, unavailableMCP) {
  const degradations = {
    'tester': {
      'playwright': 'Manual testing recommended. Visual regression skipped.',
      'lighthouse': 'Performance metrics unavailable. Manual performance testing needed.',
      'a11y': 'Accessibility validation skipped. Manual WCAG compliance check required.'
    },
    'github-manager': {
      'github': 'Use manual GitHub operations. PR creation and issue management unavailable.'
    },
    'scribe': {
      'memory': 'Documentation will be created without historical context.'
    }
  };

  return degradations[agentName]?.[unavailableMCP] ||
         `Continue with reduced functionality. ${unavailableMCP} features unavailable.`;
}

// Export functions for use by other scripts
module.exports = {
  tier1HealthCheck,
  tier2HealthCheck,
  tier3HealthCheck,
  displayHealthResults,
  getGracefulDegradation,
  MCP_SERVERS,
  AGENT_MCP_DEPENDENCIES
};

// CLI mode
if (require.main === module) {
  const tier = process.argv[2] || '1';
  const target = process.argv[3];

  (async () => {
    let results;

    switch (tier) {
      case '1':
        results = await tier1HealthCheck();
        displayHealthResults(results);
        console.log('');
        console.log(`${colors.gray}Check completed in ${results.duration}ms${colors.reset}`);
        break;

      case '2':
        const servers = target ? target.split(',') : [];
        results = await tier2HealthCheck(servers);
        displayHealthResults(results);
        process.exit(results.allHealthy ? 0 : 1);
        break;

      case '3':
        if (!target) {
          console.error('Agent name required for Tier 3 check');
          process.exit(1);
        }
        results = await tier3HealthCheck(target);
        displayHealthResults(results);
        process.exit(results.canProceed ? 0 : 1);
        break;

      default:
        console.error('Invalid tier. Use 1, 2, or 3');
        process.exit(1);
    }
  })();
}
