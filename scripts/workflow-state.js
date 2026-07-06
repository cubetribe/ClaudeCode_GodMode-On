#!/usr/bin/env node

/**
 * ⚠ DEPRECATED since v8.5.0 (ADR-004) — kept for reference only.
 *
 * This single-task state manager was never wired to any hook or agent: nothing
 * writes .ccgm-state.json automatically, and its schema disagrees with what
 * pre-push-check.js/validate-agent-output.js read (validator as string vs.
 * object). The v8.5 plan-first workflow uses tracked sprint files
 * (plans/vX.Y.Z/sprint-NN-*.md, status in frontmatter) as the state surface.
 * A multi-sprint successor is on the ROADMAP backlog.
 *
 * CC_GodMode Workflow State Manager
 *
 * Persists workflow state across /compact operations.
 * Enables resumption of interrupted workflows.
 *
 * Features:
 * - Initialize new workflow with task type and version
 * - Update workflow stage and agent progress
 * - Track dual quality gate status
 * - Persist state to .ccgm-state.json
 * - Generate human-readable resume instructions
 *
 * Copyright (c) 2025 Dennis Westermann
 * www.dennis-westermann.de
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('crypto');

// Configuration
const STATE_FILE = '.ccgm-state.json';
const SCHEMA_PATH = path.join(__dirname, '..', 'docs', 'schemas', 'workflow-state.schema.json');

// Workflow stages
const STAGES = {
  INITIALIZED: 'INITIALIZED',
  ARCHITECTURE: 'ARCHITECTURE',
  API_ANALYSIS: 'API_ANALYSIS',
  IMPLEMENTATION: 'IMPLEMENTATION',
  QUALITY_GATES: 'QUALITY_GATES',
  DOCUMENTATION: 'DOCUMENTATION',
  RELEASE_PREP: 'RELEASE_PREP',
  COMPLETED: 'COMPLETED'
};

// Agent-to-stage mapping
const AGENT_STAGES = {
  '@architect': STAGES.ARCHITECTURE,
  '@api-guardian': STAGES.API_ANALYSIS,
  '@builder': STAGES.IMPLEMENTATION,
  '@validator': STAGES.QUALITY_GATES,
  '@tester': STAGES.QUALITY_GATES,
  '@scribe': STAGES.DOCUMENTATION,
  '@github-manager': STAGES.RELEASE_PREP
};

/**
 * Generate a simple UUID-like identifier
 * (Using crypto.randomUUID would be better, but requires Node 16+)
 */
function generateSessionId() {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${randomStr}`;
}

/**
 * Get absolute path to state file in project root
 */
function getStateFilePath() {
  return path.join(process.cwd(), STATE_FILE);
}

/**
 * Load current state from file
 * Returns null if file doesn't exist
 */
function loadState() {
  const statePath = getStateFilePath();

  if (!fs.existsSync(statePath)) {
    return null;
  }

  try {
    const content = fs.readFileSync(statePath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`Error loading state file: ${error.message}`);
    return null;
  }
}

/**
 * Save state to file
 */
function saveState(state) {
  const statePath = getStateFilePath();

  try {
    // Update lastUpdated timestamp
    state.lastUpdated = new Date().toISOString();

    // Write with pretty formatting for human readability
    fs.writeFileSync(statePath, JSON.stringify(state, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error(`Error saving state file: ${error.message}`);
    return false;
  }
}

/**
 * Validate state against schema (basic validation)
 */
function validateState(state) {
  const required = ['sessionId', 'version', 'taskType', 'taskDescription', 'workflowStage',
                   'agentsCompleted', 'agentsPending', 'qualityGates', 'startedAt', 'lastUpdated'];

  for (const field of required) {
    if (!(field in state)) {
      return { valid: false, error: `Missing required field: ${field}` };
    }
  }

  // Validate task type
  const validTaskTypes = ['feature', 'bug', 'api', 'refactor', 'release', 'docs'];
  if (!validTaskTypes.includes(state.taskType)) {
    return { valid: false, error: `Invalid taskType: ${state.taskType}` };
  }

  // Validate workflow stage
  if (!Object.values(STAGES).includes(state.workflowStage)) {
    return { valid: false, error: `Invalid workflowStage: ${state.workflowStage}` };
  }

  // Validate quality gates
  const validGateStatuses = ['PENDING', 'APPROVED', 'BLOCKED', null];
  if (!validGateStatuses.includes(state.qualityGates.validator)) {
    return { valid: false, error: `Invalid validator status: ${state.qualityGates.validator}` };
  }
  if (!validGateStatuses.includes(state.qualityGates.tester)) {
    return { valid: false, error: `Invalid tester status: ${state.qualityGates.tester}` };
  }

  return { valid: true };
}

/**
 * Initialize a new workflow
 *
 * @param {string} taskType - One of: feature, bug, api, refactor, release, docs
 * @param {string} version - Target version (semver format)
 * @param {string} description - Human-readable task description
 * @param {object} options - Optional configuration
 * @returns {object} - Created state object
 */
function initWorkflow(taskType, version, description, options = {}) {
  const existingState = loadState();

  if (existingState) {
    console.warn('Warning: Existing workflow state found. Use clearState() first or continue existing workflow.');
    return existingState;
  }

  // Determine initial workflow based on task type
  let agentsPending = [];
  let requiresArchitect = false;
  let isApiChange = false;

  switch (taskType) {
    case 'feature':
      agentsPending = ['@architect', '@builder', '@validator', '@tester', '@scribe'];
      requiresArchitect = true;
      break;

    case 'bug':
      agentsPending = ['@builder', '@validator', '@tester'];
      break;

    case 'api':
      agentsPending = ['@architect', '@api-guardian', '@builder', '@validator', '@tester', '@scribe'];
      requiresArchitect = true;
      isApiChange = true;
      break;

    case 'refactor':
      agentsPending = ['@architect', '@builder', '@validator', '@tester'];
      requiresArchitect = true;
      break;

    case 'release':
      agentsPending = ['@scribe', '@github-manager'];
      break;

    case 'docs':
      agentsPending = ['@scribe'];
      break;

    default:
      throw new Error(`Invalid task type: ${taskType}`);
  }

  const state = {
    sessionId: generateSessionId(),
    version,
    taskType,
    taskDescription: description,
    workflowStage: STAGES.INITIALIZED,
    agentsCompleted: [],
    agentsPending,
    qualityGates: {
      validator: null,
      tester: null
    },
    filesChanged: [],
    pushApproved: false,
    startedAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    metadata: {
      isApiChange,
      requiresArchitect,
      estimatedDuration: options.estimatedDuration || null
    }
  };

  // Validate before saving
  const validation = validateState(state);
  if (!validation.valid) {
    throw new Error(`Invalid state: ${validation.error}`);
  }

  saveState(state);
  return state;
}

/**
 * Update current workflow stage
 *
 * @param {string} stage - New stage (use STAGES constants)
 * @returns {object|null} - Updated state or null
 */
function updateStage(stage) {
  const state = loadState();

  if (!state) {
    console.error('No active workflow found');
    return null;
  }

  if (!Object.values(STAGES).includes(stage)) {
    console.error(`Invalid stage: ${stage}`);
    return null;
  }

  state.workflowStage = stage;
  saveState(state);
  return state;
}

/**
 * Mark an agent as complete
 *
 * @param {string} agentName - Agent name (e.g., '@builder')
 * @returns {object|null} - Updated state or null
 */
function markAgentComplete(agentName) {
  const state = loadState();

  if (!state) {
    console.error('No active workflow found');
    return null;
  }

  // Remove from pending
  state.agentsPending = state.agentsPending.filter(a => a !== agentName);

  // Add to completed (if not already there)
  if (!state.agentsCompleted.includes(agentName)) {
    state.agentsCompleted.push(agentName);
  }

  // Update stage based on agent
  const agentStage = AGENT_STAGES[agentName];
  if (agentStage && state.workflowStage !== STAGES.COMPLETED) {
    state.workflowStage = agentStage;
  }

  // Check if workflow is complete
  if (state.agentsPending.length === 0) {
    state.workflowStage = STAGES.COMPLETED;
  }

  saveState(state);
  return state;
}

/**
 * Set quality gate result
 *
 * @param {string} gate - 'validator' or 'tester'
 * @param {string} result - 'PENDING', 'APPROVED', or 'BLOCKED'
 * @returns {object|null} - Updated state or null
 */
function setGateResult(gate, result) {
  const state = loadState();

  if (!state) {
    console.error('No active workflow found');
    return null;
  }

  if (gate !== 'validator' && gate !== 'tester') {
    console.error(`Invalid gate: ${gate}`);
    return null;
  }

  const validResults = ['PENDING', 'APPROVED', 'BLOCKED'];
  if (!validResults.includes(result)) {
    console.error(`Invalid result: ${result}`);
    return null;
  }

  state.qualityGates[gate] = result;
  saveState(state);
  return state;
}

/**
 * Add files to changed list
 *
 * @param {string[]} files - Array of file paths
 * @returns {object|null} - Updated state or null
 */
function addChangedFiles(files) {
  const state = loadState();

  if (!state) {
    console.error('No active workflow found');
    return null;
  }

  if (!state.filesChanged) {
    state.filesChanged = [];
  }

  // Add unique files only
  files.forEach(file => {
    if (!state.filesChanged.includes(file)) {
      state.filesChanged.push(file);
    }
  });

  saveState(state);
  return state;
}

/**
 * Set push approval status
 *
 * @param {boolean} approved - Whether push is approved
 * @returns {object|null} - Updated state or null
 */
function setPushApproved(approved) {
  const state = loadState();

  if (!state) {
    console.error('No active workflow found');
    return null;
  }

  state.pushApproved = approved;
  saveState(state);
  return state;
}

/**
 * Get current workflow state
 *
 * @returns {object|null} - Current state or null
 */
function getState() {
  return loadState();
}

/**
 * Clear workflow state (delete state file)
 */
function clearState() {
  const statePath = getStateFilePath();

  if (fs.existsSync(statePath)) {
    try {
      fs.unlinkSync(statePath);
      return true;
    } catch (error) {
      console.error(`Error clearing state: ${error.message}`);
      return false;
    }
  }

  return true; // Already cleared
}

/**
 * Generate human-readable resume instructions
 *
 * @returns {object|null} - Resume info or null if no active workflow
 */
function getResumeInfo() {
  const state = loadState();

  if (!state) {
    return null;
  }

  // Calculate workflow progress
  const totalAgents = state.agentsCompleted.length + state.agentsPending.length;
  const progress = totalAgents > 0
    ? Math.round((state.agentsCompleted.length / totalAgents) * 100)
    : 0;

  // Determine next action
  let nextAction = 'Continue workflow';
  if (state.agentsPending.length > 0) {
    nextAction = `Call ${state.agentsPending[0]}`;
  } else if (state.workflowStage === STAGES.COMPLETED) {
    nextAction = 'Workflow complete - ready for push';
  }

  // Check if quality gates are blocking
  let gateStatus = null;
  if (state.qualityGates.validator === 'BLOCKED' || state.qualityGates.tester === 'BLOCKED') {
    gateStatus = 'BLOCKED - Fix issues and re-run gates';
  } else if (state.qualityGates.validator === 'APPROVED' && state.qualityGates.tester === 'APPROVED') {
    gateStatus = 'APPROVED - Ready for documentation';
  } else if (state.qualityGates.validator !== null || state.qualityGates.tester !== null) {
    gateStatus = 'IN PROGRESS';
  }

  // Calculate elapsed time
  const startTime = new Date(state.startedAt);
  const now = new Date();
  const elapsedMinutes = Math.round((now - startTime) / 1000 / 60);

  return {
    sessionId: state.sessionId,
    version: state.version,
    taskType: state.taskType,
    description: state.taskDescription,
    stage: state.workflowStage,
    progress: `${progress}%`,
    completed: state.agentsCompleted,
    pending: state.agentsPending,
    qualityGates: {
      validator: state.qualityGates.validator || 'NOT_STARTED',
      tester: state.qualityGates.tester || 'NOT_STARTED',
      status: gateStatus
    },
    nextAction,
    elapsedTime: elapsedMinutes > 60
      ? `${Math.floor(elapsedMinutes / 60)}h ${elapsedMinutes % 60}m`
      : `${elapsedMinutes}m`,
    filesChanged: state.filesChanged ? state.filesChanged.length : 0,
    pushApproved: state.pushApproved
  };
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'init':
      const [taskType, version, ...descParts] = args.slice(1);
      const description = descParts.join(' ');
      if (!taskType || !version || !description) {
        console.error('Usage: workflow-state.js init <taskType> <version> <description>');
        process.exit(1);
      }
      const state = initWorkflow(taskType, version, description);
      console.log('Workflow initialized:', state);
      break;

    case 'status':
      const resumeInfo = getResumeInfo();
      if (resumeInfo) {
        console.log(JSON.stringify(resumeInfo, null, 2));
      } else {
        console.log('No active workflow');
      }
      break;

    case 'complete':
      const agentName = args[1];
      if (!agentName) {
        console.error('Usage: workflow-state.js complete <agentName>');
        process.exit(1);
      }
      markAgentComplete(agentName);
      console.log(`Marked ${agentName} as complete`);
      break;

    case 'clear':
      clearState();
      console.log('Workflow state cleared');
      break;

    default:
      console.log('CC_GodMode Workflow State Manager');
      console.log('Usage:');
      console.log('  workflow-state.js init <taskType> <version> <description>');
      console.log('  workflow-state.js status');
      console.log('  workflow-state.js complete <agentName>');
      console.log('  workflow-state.js clear');
  }
}

// Export functions
module.exports = {
  STAGES,
  AGENT_STAGES,
  initWorkflow,
  updateStage,
  markAgentComplete,
  setGateResult,
  addChangedFiles,
  setPushApproved,
  getState,
  clearState,
  getResumeInfo
};
