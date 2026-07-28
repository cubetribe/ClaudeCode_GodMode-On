#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * Domain Pack Loader (v5.8.0)
 *
 * Core vs Domain-Pack Architecture Implementation
 *
 * Enables domain-specific agent configurations and validation rules
 * while maintaining a clean separation from core functionality.
 *
 * Resolution Order: Project > Global > Core
 *
 * Features:
 * - Automatic domain pack discovery
 * - Agent resolution with fallback chain
 * - Domain pack validation
 * - Hot-reloading support (future)
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

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
 * Domain Pack Configuration Defaults
 */
const DOMAIN_PACK_DEFAULTS = {
  searchPaths: {
    project: './domains',
    global: path.join(os.homedir(), '.claude', 'domains')
  },
  coreAgentsPath: path.join(os.homedir(), '.claude', 'agents'),
  configFileName: 'domain-config.json',
  agentsDir: 'agents',
  validationRulesFile: 'validation-rules.json'
};

/**
 * Domain Pack Loader Class
 */
class DomainPackLoader {
  constructor(options = {}) {
    this.options = { ...DOMAIN_PACK_DEFAULTS, ...options };
    this.loadedDomains = new Map();
    this.domainCache = new Map();
    this.projectRoot = options.projectRoot || process.cwd();
  }

  /**
   * Discover all available domain packs
   * Searches both project-local and global directories
   *
   * @returns {Object} Discovery results with domain metadata
   */
  discoverDomainPacks() {
    const discovered = {
      project: [],
      global: [],
      all: [],
      errors: []
    };

    // Search project-local domains
    const projectDomainsPath = path.join(this.projectRoot, this.options.searchPaths.project);
    if (fs.existsSync(projectDomainsPath)) {
      try {
        const projectDomains = this.scanDomainDirectory(projectDomainsPath, 'project');
        discovered.project = projectDomains;
        discovered.all.push(...projectDomains);
      } catch (e) {
        discovered.errors.push({
          path: projectDomainsPath,
          error: e.message
        });
      }
    }

    // Search global domains
    const globalDomainsPath = this.options.searchPaths.global;
    if (fs.existsSync(globalDomainsPath)) {
      try {
        const globalDomains = this.scanDomainDirectory(globalDomainsPath, 'global');
        discovered.global = globalDomains;
        // Only add global domains that aren't overridden by project
        globalDomains.forEach(domain => {
          if (!discovered.project.find(p => p.name === domain.name)) {
            discovered.all.push(domain);
          }
        });
      } catch (e) {
        discovered.errors.push({
          path: globalDomainsPath,
          error: e.message
        });
      }
    }

    return discovered;
  }

  /**
   * Scan a directory for domain packs
   *
   * @param {string} dirPath - Directory to scan
   * @param {string} source - Source identifier ('project' or 'global')
   * @returns {Array} Array of domain metadata objects
   */
  scanDomainDirectory(dirPath, source) {
    const domains = [];

    if (!fs.existsSync(dirPath)) {
      return domains;
    }

    const entries = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith('.')) continue; // Skip hidden directories

      const domainPath = path.join(dirPath, entry.name);
      const configPath = path.join(domainPath, this.options.configFileName);

      // Check if valid domain pack (has config file)
      if (fs.existsSync(configPath)) {
        try {
          const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
          domains.push({
            name: entry.name,
            path: domainPath,
            source,
            config,
            version: config.version || '1.0.0',
            description: config.description || 'No description',
            agents: this.detectDomainAgents(domainPath)
          });
        } catch (e) {
          console.warn(`${colors.yellow}Warning: Invalid config in ${domainPath}: ${e.message}${colors.reset}`);
        }
      }
    }

    return domains;
  }

  /**
   * Detect agents provided by a domain pack
   *
   * @param {string} domainPath - Path to domain pack
   * @returns {Array} List of agent names
   */
  detectDomainAgents(domainPath) {
    const agentsPath = path.join(domainPath, this.options.agentsDir);

    if (!fs.existsSync(agentsPath)) {
      return [];
    }

    const agents = [];
    const entries = fs.readdirSync(agentsPath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isFile() && entry.name.endsWith('.md')) {
        agents.push(entry.name.replace('.md', ''));
      }
    }

    return agents;
  }

  /**
   * Load a specific domain pack
   *
   * @param {string} domainName - Name of the domain to load
   * @returns {Object|null} Loaded domain data or null if not found
   */
  loadDomain(domainName) {
    // Check cache first
    if (this.loadedDomains.has(domainName)) {
      return this.loadedDomains.get(domainName);
    }

    // Discover if not already
    const discovered = this.discoverDomainPacks();
    const domainMeta = discovered.all.find(d => d.name === domainName);

    if (!domainMeta) {
      console.warn(`${colors.yellow}Domain '${domainName}' not found${colors.reset}`);
      return null;
    }

    // Load full domain data
    const domain = {
      ...domainMeta,
      agents: {},
      validationRules: null
    };

    // Load agents
    const agentsPath = path.join(domainMeta.path, this.options.agentsDir);
    if (fs.existsSync(agentsPath)) {
      for (const agentName of domainMeta.agents) {
        const agentPath = path.join(agentsPath, `${agentName}.md`);
        if (fs.existsSync(agentPath)) {
          domain.agents[agentName] = {
            path: agentPath,
            content: fs.readFileSync(agentPath, 'utf-8')
          };
        }
      }
    }

    // Load validation rules if present
    const rulesPath = path.join(domainMeta.path, this.options.validationRulesFile);
    if (fs.existsSync(rulesPath)) {
      try {
        domain.validationRules = JSON.parse(fs.readFileSync(rulesPath, 'utf-8'));
      } catch (e) {
        console.warn(`${colors.yellow}Warning: Could not load validation rules: ${e.message}${colors.reset}`);
      }
    }

    // Cache and return
    this.loadedDomains.set(domainName, domain);
    return domain;
  }

  /**
   * Resolve an agent with fallback chain: Project > Global > Core
   *
   * @param {string} agentName - Name of the agent (e.g., 'builder', 'validator')
   * @param {string|null} domainName - Optional domain to check first
   * @returns {Object} Resolution result with path and source
   */
  resolveAgent(agentName, domainName = null) {
    const result = {
      found: false,
      agentName,
      domainName,
      path: null,
      source: null, // 'project-domain', 'global-domain', 'core'
      fallbackUsed: false
    };

    // Step 1: Check project domain (if specified)
    if (domainName) {
      const projectDomainPath = path.join(
        this.projectRoot,
        this.options.searchPaths.project,
        domainName,
        this.options.agentsDir,
        `${agentName}.md`
      );

      if (fs.existsSync(projectDomainPath)) {
        result.found = true;
        result.path = projectDomainPath;
        result.source = 'project-domain';
        return result;
      }
    }

    // Step 2: Check global domain (if specified)
    if (domainName) {
      const globalDomainPath = path.join(
        this.options.searchPaths.global,
        domainName,
        this.options.agentsDir,
        `${agentName}.md`
      );

      if (fs.existsSync(globalDomainPath)) {
        result.found = true;
        result.path = globalDomainPath;
        result.source = 'global-domain';
        result.fallbackUsed = true;
        return result;
      }
    }

    // Step 3: Fall back to core agents
    const coreAgentPath = path.join(
      this.options.coreAgentsPath,
      `${agentName}.md`
    );

    if (fs.existsSync(coreAgentPath)) {
      result.found = true;
      result.path = coreAgentPath;
      result.source = 'core';
      result.fallbackUsed = domainName !== null;
      return result;
    }

    // Not found anywhere
    return result;
  }

  /**
   * Get validation rules with domain overlay
   *
   * @param {string} agentName - Agent name
   * @param {string|null} domainName - Optional domain name
   * @returns {Object|null} Merged validation rules
   */
  getValidationRules(agentName, domainName = null) {
    // Import core validation rules
    let coreRules = null;
    try {
      const validator = require('./validate-agent-output');
      coreRules = validator.getRules(agentName);
    } catch (e) {
      console.warn(`${colors.yellow}Could not load core validation rules: ${e.message}${colors.reset}`);
    }

    if (!domainName) {
      return coreRules;
    }

    // Load domain and get its rules
    const domain = this.loadDomain(domainName);
    if (!domain || !domain.validationRules) {
      return coreRules;
    }

    const domainRules = domain.validationRules[agentName];
    if (!domainRules) {
      return coreRules;
    }

    // Merge rules
    if (!coreRules) {
      return domainRules;
    }

    if (domainRules.overrides === true) {
      return { ...domainRules, name: coreRules.name };
    }

    return {
      requiredSections: [
        ...(coreRules.requiredSections || []),
        ...(domainRules.requiredSections || [])
      ],
      requiredPatterns: [
        ...(coreRules.requiredPatterns || []),
        ...(domainRules.requiredPatterns || [])
      ],
      minLength: domainRules.minLength || coreRules.minLength,
      name: coreRules.name
    };
  }

  /**
   * List all available agents (core + domain)
   *
   * @param {string|null} domainName - Optional domain to include
   * @returns {Array} List of agent resolution info
   */
  listAgents(domainName = null) {
    const coreAgents = ['architect', 'api-guardian', 'builder', 'validator', 'tester', 'scribe', 'github-manager'];
    const results = [];

    for (const agent of coreAgents) {
      results.push(this.resolveAgent(agent, domainName));
    }

    // Add domain-specific agents not in core
    if (domainName) {
      const domain = this.loadDomain(domainName);
      if (domain && domain.agents) {
        for (const agentName of Object.keys(domain.agents)) {
          if (!coreAgents.includes(agentName)) {
            results.push({
              found: true,
              agentName,
              domainName,
              path: domain.agents[agentName].path,
              source: domain.source === 'project' ? 'project-domain' : 'global-domain',
              fallbackUsed: false
            });
          }
        }
      }
    }

    return results;
  }

  /**
   * Validate a domain pack structure
   *
   * @param {string} domainPath - Path to domain pack
   * @returns {Object} Validation result
   */
  validateDomainPack(domainPath) {
    const result = {
      valid: true,
      errors: [],
      warnings: []
    };

    // Check config file exists
    const configPath = path.join(domainPath, this.options.configFileName);
    if (!fs.existsSync(configPath)) {
      result.valid = false;
      result.errors.push('Missing domain-config.json');
      return result;
    }

    // Validate config JSON
    let config;
    try {
      config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      result.valid = false;
      result.errors.push(`Invalid JSON in domain-config.json: ${e.message}`);
      return result;
    }

    // Required fields
    if (!config.name) {
      result.errors.push('Config missing required field: name');
      result.valid = false;
    }
    if (!config.version) {
      result.warnings.push('Config missing recommended field: version');
    }
    if (!config.description) {
      result.warnings.push('Config missing recommended field: description');
    }

    // Check agents directory
    const agentsPath = path.join(domainPath, this.options.agentsDir);
    if (!fs.existsSync(agentsPath)) {
      result.warnings.push('No agents directory found');
    } else {
      const agents = fs.readdirSync(agentsPath).filter(f => f.endsWith('.md'));
      if (agents.length === 0) {
        result.warnings.push('Agents directory is empty');
      }
    }

    return result;
  }

  /**
   * Clear all caches
   */
  clearCache() {
    this.loadedDomains.clear();
    this.domainCache.clear();
  }
}

/**
 * Singleton instance
 */
let loaderInstance = null;

/**
 * Get or create singleton loader instance
 */
function getDomainPackLoader(options = {}) {
  if (!loaderInstance) {
    loaderInstance = new DomainPackLoader(options);
  }
  return loaderInstance;
}

/**
 * CLI interface
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const loader = getDomainPackLoader();

  switch (command) {
    case 'discover':
      console.log('');
      console.log(`${colors.cyan}Discovering Domain Packs...${colors.reset}`);
      console.log('');
      const discovered = loader.discoverDomainPacks();

      if (discovered.project.length > 0) {
        console.log(`${colors.green}Project Domains (./domains):${colors.reset}`);
        discovered.project.forEach(d => {
          console.log(`  - ${d.name} v${d.version}`);
          console.log(`    ${colors.gray}${d.description}${colors.reset}`);
          console.log(`    Agents: ${d.agents.length > 0 ? d.agents.join(', ') : 'none'}`);
        });
        console.log('');
      }

      if (discovered.global.length > 0) {
        console.log(`${colors.blue}Global Domains (~/.claude/domains):${colors.reset}`);
        discovered.global.forEach(d => {
          console.log(`  - ${d.name} v${d.version}`);
          console.log(`    ${colors.gray}${d.description}${colors.reset}`);
          console.log(`    Agents: ${d.agents.length > 0 ? d.agents.join(', ') : 'none'}`);
        });
        console.log('');
      }

      if (discovered.all.length === 0) {
        console.log(`${colors.yellow}No domain packs found.${colors.reset}`);
        console.log(`Create a domain pack in ./domains/ or ~/.claude/domains/`);
        console.log('');
      }

      if (discovered.errors.length > 0) {
        console.log(`${colors.red}Errors:${colors.reset}`);
        discovered.errors.forEach(e => {
          console.log(`  ${e.path}: ${e.error}`);
        });
        console.log('');
      }
      break;

    case 'resolve':
      const agentName = args[1];
      const domainName = args[2];

      if (!agentName) {
        console.error('Usage: domain-pack-loader.js resolve <agent-name> [domain-name]');
        process.exit(1);
      }

      console.log('');
      console.log(`${colors.cyan}Resolving agent: ${agentName}${domainName ? ` (domain: ${domainName})` : ''}${colors.reset}`);
      const resolution = loader.resolveAgent(agentName, domainName);

      if (resolution.found) {
        console.log(`${colors.green}Found!${colors.reset}`);
        console.log(`  Path: ${resolution.path}`);
        console.log(`  Source: ${resolution.source}`);
        if (resolution.fallbackUsed) {
          console.log(`  ${colors.yellow}(fallback used)${colors.reset}`);
        }
      } else {
        console.log(`${colors.red}Not found${colors.reset}`);
      }
      console.log('');
      break;

    case 'validate':
      const packPath = args[1];

      if (!packPath) {
        console.error('Usage: domain-pack-loader.js validate <domain-pack-path>');
        process.exit(1);
      }

      console.log('');
      console.log(`${colors.cyan}Validating domain pack: ${packPath}${colors.reset}`);
      const validation = loader.validateDomainPack(packPath);

      if (validation.valid) {
        console.log(`${colors.green}Valid domain pack!${colors.reset}`);
      } else {
        console.log(`${colors.red}Invalid domain pack${colors.reset}`);
      }

      if (validation.errors.length > 0) {
        console.log(`${colors.red}Errors:${colors.reset}`);
        validation.errors.forEach(e => console.log(`  - ${e}`));
      }
      if (validation.warnings.length > 0) {
        console.log(`${colors.yellow}Warnings:${colors.reset}`);
        validation.warnings.forEach(w => console.log(`  - ${w}`));
      }
      console.log('');
      break;

    case 'list':
      const listDomain = args[1];
      console.log('');
      console.log(`${colors.cyan}Available Agents${listDomain ? ` (with domain: ${listDomain})` : ''}:${colors.reset}`);
      const agents = loader.listAgents(listDomain);

      agents.forEach(a => {
        if (a.found) {
          const sourceColor = a.source === 'core' ? colors.gray :
                             a.source === 'project-domain' ? colors.green : colors.blue;
          console.log(`  ${colors.bright}${a.agentName}${colors.reset} [${sourceColor}${a.source}${colors.reset}]`);
        } else {
          console.log(`  ${colors.red}${a.agentName} (not found)${colors.reset}`);
        }
      });
      console.log('');
      break;

    default:
      console.log('');
      console.log(`${colors.cyan}Domain Pack Loader (v5.8.0)${colors.reset}`);
      console.log('');
      console.log('Usage:');
      console.log('  domain-pack-loader.js discover                     Find all domain packs');
      console.log('  domain-pack-loader.js resolve <agent> [domain]     Resolve agent path');
      console.log('  domain-pack-loader.js validate <path>              Validate a domain pack');
      console.log('  domain-pack-loader.js list [domain]                List available agents');
      console.log('');
      console.log('Resolution Order: Project Domain > Global Domain > Core');
      console.log('');
      console.log('Paths:');
      console.log(`  Project domains: ./domains/`);
      console.log(`  Global domains:  ~/.claude/domains/`);
      console.log(`  Core agents:     ~/.claude/agents/`);
      console.log('');
  }
}

// Export for use by other scripts
module.exports = {
  DomainPackLoader,
  getDomainPackLoader,
  DOMAIN_PACK_DEFAULTS
};

// CLI mode
if (require.main === module) {
  main();
}
