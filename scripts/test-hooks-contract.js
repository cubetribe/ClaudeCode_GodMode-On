#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * test-hooks-contract.js (v8.6.0 sprint-01 hook-repair; v8.7.0 sprint-02
 * adds probes for scripts/verify-changes.js, the deterministic
 * SubagentStop hook that replaces @validator's typecheck/lint/test/build
 * checks, plus in-process probes for the checks/tester/security gate
 * semantics in pre-push-check.js and workflow-state.js: a gate at `null`
 * never blocks a push, only a gate that actually ran and did not approve)
 *
 * Contract test for Claude Code hook wiring in config/claude-settings.json.
 *
 * Background: Claude Code hooks (PostToolUse, SubagentStop, etc.) invoke the
 * configured command with NO argv and deliver a JSON payload on stdin — there
 * are no $CLAUDE_* environment variables. v8.0.0 shipped hooks wired with
 * "$CLAUDE_FILE_PATH" etc.; the scripts read empty argv and silently no-op.
 * This broke Core Rule 4's automatic @api-guardian trigger for months,
 * undetected, because nothing asserted the wiring shape.
 *
 * This script makes that class of breakage impossible to miss:
 *  1. Hard-asserts no hook command references a $CLAUDE_* variable.
 *  2. Resolves every wired hook's target script to its REPO copy (CI has no
 *     ~/.claude install) and asserts it exists.
 *  3. Spawns each resolvable repo script exactly as wired, from a disposable
 *     temp fixture cwd, feeding realistic stdin payloads, and asserts
 *     behavior (exit codes + expected output markers).
 *  4. Asserts no probed script ever prints a "Usage:" string when invoked
 *     the way the hook wiring invokes it (that means wrong-args wiring).
 *
 * Plain Node, no dependencies. Exit 0 = all checks passed. Exit 1 = failure.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const SETTINGS_PATH = path.join(REPO_ROOT, 'config', 'claude-settings.json');
const PLUGIN_JSON_PATH = path.join(REPO_ROOT, '.claude-plugin', 'plugin.json');
const SETTINGS_TEMPLATE_PATH = path.join(REPO_ROOT, 'templates', 'settings.local.json.template');

// v8.6.0 addendum: forbid never-populated Claude Code hook input vars
// ($CLAUDE_FILE_PATH, $CLAUDE_USER_PROMPT, $CLAUDE_SUBAGENT_TYPE,
// $CLAUDE_SUBAGENT_OUTPUT, etc.) — these are NOT set by the hook runtime and
// wiring them in is the exact v8.0.0 regression class. ${CLAUDE_PLUGIN_ROOT}
// IS a legitimate, runtime-populated Claude Code plugin path variable and
// must remain allowed.
const FORBIDDEN_CLAUDE_VAR_RE = /\$CLAUDE_(?!PLUGIN_ROOT\b)/;

const results = []; // { name, pass, detail }

function check(name, pass, detail) {
  results.push({ name, pass, detail: detail || '' });
  const icon = pass ? 'PASS' : 'FAIL';
  const line = `[${icon}] ${name}`;
  console.log(detail ? `${line}\n       ${detail}` : line);
}

function collectHookCommands(settings) {
  // settings.hooks = { EventName: [ { matcher?, hooks: [ { type, command, timeout } ] } ] }
  const out = [];
  const hooks = settings.hooks || {};
  for (const [eventName, entries] of Object.entries(hooks)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const hookList = entry && entry.hooks;
      if (!Array.isArray(hookList)) continue;
      for (const h of hookList) {
        if (h && typeof h.command === 'string') {
          out.push({ event: eventName, command: h.command, timeout: h.timeout });
        }
      }
    }
  }
  return out;
}

/**
 * Resolve a wired command's script path to the REPO copy.
 * e.g. "node ~/.claude/scripts/session-start.js" -> "scripts/session-start.js"
 * e.g. "node scripts/check-api-impact.js \"$CLAUDE_FILE_PATH\"" -> "scripts/check-api-impact.js"
 * Returns { scriptArgBasename, repoPath, argsAfterScript }
 */
function resolveRepoScript(command) {
  // Tokenize respecting simple double-quoted segments.
  const tokens = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  // Find first token ending in .js
  let scriptToken = null;
  let scriptIdx = -1;
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i].replace(/^"|"$/g, '');
    if (t.endsWith('.js')) {
      scriptToken = t;
      scriptIdx = i;
      break;
    }
  }
  if (!scriptToken) return null;

  const basename = path.basename(scriptToken);
  const repoPath = path.join(REPO_ROOT, 'scripts', basename);
  const argsAfterScript = tokens.slice(scriptIdx + 1).map(t => t.replace(/^"|"$/g, ''));

  return { scriptToken, basename, repoPath, argsAfterScript };
}

function makeFixtureCwd() {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ccgm-hooks-contract-'));
}

function runScript(repoPath, { args = [], stdin = '', cwd, timeoutMs = 15000 } = {}) {
  const res = spawnSync(process.execPath, [repoPath, ...args], {
    input: stdin,
    cwd,
    encoding: 'utf8',
    timeout: timeoutMs,
  });
  return {
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    error: res.error,
    signal: res.signal,
  };
}

function assertNoUsageError(name, res) {
  const combined = `${res.stdout}\n${res.stderr}`;
  const hasUsage = /Usage:/.test(combined);
  check(
    `${name}: no "Usage:" output (wiring passes correct args)`,
    !hasUsage,
    hasUsage ? `Found "Usage:" in output — script fell back to its error/help path.\n       stdout: ${truncate(res.stdout)}\n       stderr: ${truncate(res.stderr)}` : ''
  );
}

function truncate(s, n = 300) {
  if (!s) return '(empty)';
  return s.length > n ? s.slice(0, n) + '…' : s;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

let overallOk = true;

console.log('='.repeat(70));
console.log('Hook Contract Test — CC_GodMode v8.6.0 (sprint-01 hook-repair)');
console.log('='.repeat(70));
console.log('');

// 1. Parse settings + hard assert no $CLAUDE_* substrings.
let settings;
try {
  settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
  check('config/claude-settings.json parses as JSON', true);
} catch (e) {
  check('config/claude-settings.json parses as JSON', false, e.message);
  console.log('');
  console.log('FATAL: cannot continue without valid settings JSON.');
  process.exit(1);
}

const hookCommands = collectHookCommands(settings);
check(
  'at least one hook is wired',
  hookCommands.length > 0,
  `found ${hookCommands.length} hook command(s)`
);

const offendingCommands = hookCommands.filter(h => FORBIDDEN_CLAUDE_VAR_RE.test(h.command));
check(
  'config/claude-settings.json: no hook command references a forbidden $CLAUDE_* var (the v8.0.0 regression)',
  offendingCommands.length === 0,
  offendingCommands.length > 0
    ? `offending: ${offendingCommands.map(h => `[${h.event}] ${h.command}`).join(' | ')}`
    : ''
);
if (offendingCommands.length > 0) overallOk = false;

// 1b. Same regression class, additional wiring surfaces found by @builder-A:
// .claude-plugin/plugin.json ("hooks" object, same shape as claude-settings.json)
// and templates/settings.local.json.template (a template a user copies into
// their own project — must not ship the same env-var bug to new adopters).
// Missing file = soft skip (template may not exist in every checkout).
function checkExtraHookFile(label, filePath) {
  if (!fs.existsSync(filePath)) {
    check(`${label}: present (soft-skip if missing)`, true, `not found at ${filePath} — skipped`);
    return;
  }
  let json;
  try {
    json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    check(`${label}: parses as JSON`, false, e.message);
    overallOk = false;
    return;
  }
  check(`${label}: parses as JSON`, true);

  const commands = collectHookCommands(json);
  const offending = commands.filter(h => FORBIDDEN_CLAUDE_VAR_RE.test(h.command));
  check(
    `${label}: no hook command references a forbidden $CLAUDE_* var (\${CLAUDE_PLUGIN_ROOT} allowed)`,
    offending.length === 0,
    offending.length > 0
      ? `offending: ${offending.map(h => `[${h.event}] ${h.command}`).join(' | ')}`
      : `checked ${commands.length} hook command(s)`
  );
  if (offending.length > 0) overallOk = false;
}

checkExtraHookFile('.claude-plugin/plugin.json', PLUGIN_JSON_PATH);
checkExtraHookFile('templates/settings.local.json.template', SETTINGS_TEMPLATE_PATH);

// 2. Resolve every wired hook's script to the repo copy; assert existence.
const resolved = [];
for (const h of hookCommands) {
  const r = resolveRepoScript(h.command);
  if (!r) {
    check(`${h.event}: hook command resolves to a *.js script`, false, `command: ${h.command}`);
    overallOk = false;
    continue;
  }
  const exists = fs.existsSync(r.repoPath);
  check(
    `${h.event}: repo script exists for ${r.basename}`,
    exists,
    exists ? r.repoPath : `expected at ${r.repoPath} (resolved from wired command: ${h.command})`
  );
  if (!exists) {
    overallOk = false;
    continue;
  }
  resolved.push({ event: h.event, ...r });
}

console.log('');
console.log('-'.repeat(70));
console.log('Behavioral probes');
console.log('-'.repeat(70));

// Dedup by basename — same script may be wired to multiple events.
const byBasename = new Map();
for (const r of resolved) {
  if (!byBasename.has(r.basename)) byBasename.set(r.basename, r);
}

// --- session-start.js -------------------------------------------------------
if (byBasename.has('session-start.js')) {
  const r = byBasename.get('session-start.js');
  const fixture = makeFixtureCwd();
  try {
    const res = runScript(r.repoPath, { args: r.argsAfterScript, stdin: '', cwd: fixture });
    check(
      'session-start.js: exits 0 with no stdin',
      res.status === 0,
      res.status !== 0 ? `exit ${res.status}, stderr: ${truncate(res.stderr)}` : ''
    );
    if (res.status !== 0) overallOk = false;
    assertNoUsageError('session-start.js', res);
  } finally {
    fs.rmSync(fixture, { recursive: true, force: true });
  }
} else {
  check('session-start.js: wired and probed', false, 'not found among wired hooks — skipped');
}

// --- check-api-impact.js ----------------------------------------------------
if (byBasename.has('check-api-impact.js')) {
  const r = byBasename.get('check-api-impact.js');

  // Probe (a): API file payload -> expect exit 0 AND stdout mentions the file
  // or an API-impact marker. This assertion depends on builder-A's stdin port
  // landing; if check-api-impact.js still only reads argv, this will FAIL
  // and that failure is EXPECTED mid-sprint (see report "open items").
  {
    const fixture = makeFixtureCwd();
    try {
      const apiFileRel = 'src/api/users.ts';
      const apiFileAbs = path.join(fixture, apiFileRel);
      fs.mkdirSync(path.dirname(apiFileAbs), { recursive: true });
      fs.writeFileSync(
        apiFileAbs,
        `export interface User {\n  id: string;\n  email: string;\n}\n`
      );
      const payload = JSON.stringify({
        tool_input: { file_path: apiFileRel },
        cwd: fixture,
      });
      const res = runScript(r.repoPath, { args: r.argsAfterScript, stdin: payload, cwd: fixture });
      const mentionsImpact =
        res.stdout.includes(apiFileRel) ||
        /API[\/ ]?TYPE FILE CHANGE DETECTED|API-IMPACT|api-guardian/i.test(res.stdout);
      check(
        'check-api-impact.js: API-file stdin payload -> exit 0',
        res.status === 0,
        res.status !== 0 ? `exit ${res.status}, stderr: ${truncate(res.stderr)}` : ''
      );
      check(
        'check-api-impact.js: API-file stdin payload -> stdout mentions file or API-impact marker',
        mentionsImpact,
        mentionsImpact ? '' : `stdout did not reference "${apiFileRel}" or an impact marker — likely still argv-only (stdin port not yet landed): ${truncate(res.stdout)}`
      );
      if (res.status !== 0 || !mentionsImpact) overallOk = false;
      assertNoUsageError('check-api-impact.js (API payload)', res);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }

  // Probe (b): non-API file payload -> exit 0, no impact warning.
  {
    const fixture = makeFixtureCwd();
    try {
      const docFileRel = 'docs/x.md';
      const payload = JSON.stringify({
        tool_input: { file_path: docFileRel },
        cwd: fixture,
      });
      const res = runScript(r.repoPath, { args: r.argsAfterScript, stdin: payload, cwd: fixture });
      const noImpactWarning = !/API[\/ ]?TYPE FILE CHANGE DETECTED|BREAKING CHANGE ANALYSIS/i.test(res.stdout);
      check(
        'check-api-impact.js: non-API stdin payload -> exit 0',
        res.status === 0,
        res.status !== 0 ? `exit ${res.status}, stderr: ${truncate(res.stderr)}` : ''
      );
      check(
        'check-api-impact.js: non-API stdin payload -> no impact warning printed',
        noImpactWarning,
        noImpactWarning ? '' : `unexpected impact output for non-API file: ${truncate(res.stdout)}`
      );
      if (res.status !== 0 || !noImpactWarning) overallOk = false;
      assertNoUsageError('check-api-impact.js (non-API payload)', res);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }

  // Probe (c): garbage stdin -> exit 0 (tolerant parsing, never breaks unrelated work).
  {
    const fixture = makeFixtureCwd();
    try {
      const res = runScript(r.repoPath, { args: r.argsAfterScript, stdin: 'not valid json {{{', cwd: fixture });
      check(
        'check-api-impact.js: garbage stdin -> exit 0 (never breaks unrelated work)',
        res.status === 0,
        res.status !== 0 ? `exit ${res.status}, stderr: ${truncate(res.stderr)}` : ''
      );
      if (res.status !== 0) overallOk = false;
      assertNoUsageError('check-api-impact.js (garbage stdin)', res);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }
} else {
  check('check-api-impact.js: wired and probed', false, 'not found among wired hooks — skipped');
}

// --- validate-agent-output.js ------------------------------------------------
if (byBasename.has('validate-agent-output.js')) {
  const r = byBasename.get('validate-agent-output.js');

  // A minimal, self-contained "passing builder report" body that satisfies
  // VALIDATION_RULES_CORE.builder (requiredSections + requiredPatterns +
  // minLength 500) without depending on this repo's own reports.
  const passingBuilderReport = `---
agent: builder
version: v0.0.0
date: 2026-01-01
status: complete
task: fixture report for hooks contract test
---

# Builder Report (fixture)

## Design Decisions
This is a synthetic fixture report used only by scripts/test-hooks-contract.js
to exercise validate-agent-output.js in hook mode. It intentionally satisfies
all of the core @builder validation rules: required sections, required
patterns, and the minimum length threshold, so that the hook probe can assert
a clean exit 0 for a well-formed report.

### Files Created
- fixture/only.ts - not a real file, fixture content only

### Files Modified
- fixture/only.ts:1 - not a real change, fixture content only

### Quality Gates
- [x] typecheck passes (fixture)
- [x] tests pass (fixture)

### Tests
- fixture.test.ts - fixture assertions only

This paragraph exists purely to push the fixture body comfortably past the
500-character minimum length required by the @builder validation rule set,
without adding any real signal beyond what is already declared above.
`;

  const incompleteReport = `# oops\n\ntoo short`;

  // Sub-probe 1: passing report -> exit 0.
  {
    const fixture = makeFixtureCwd();
    try {
      const reportDir = path.join(fixture, 'reports', 'v0.0.0', 'sprint-99');
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(path.join(reportDir, '03-builder-report.md'), passingBuilderReport);

      const payload = JSON.stringify({ cwd: fixture });
      const res = runScript(r.repoPath, { args: r.argsAfterScript, stdin: payload, cwd: fixture });
      check(
        'validate-agent-output.js: fresh PASSING builder report -> exit 0',
        res.status === 0,
        res.status !== 0 ? `exit ${res.status}, stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}` : ''
      );
      if (res.status !== 0) overallOk = false;
      assertNoUsageError('validate-agent-output.js (passing report)', res);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }

  // Sub-probe 2: critically incomplete report -> exit 2.
  {
    const fixture = makeFixtureCwd();
    try {
      const reportDir = path.join(fixture, 'reports', 'v0.0.0', 'sprint-99');
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(path.join(reportDir, '03-builder-report.md'), incompleteReport);

      const payload = JSON.stringify({ cwd: fixture });
      const res = runScript(r.repoPath, { args: r.argsAfterScript, stdin: payload, cwd: fixture });
      check(
        'validate-agent-output.js: critically incomplete report -> exit 2 (blocking)',
        res.status === 2,
        res.status !== 2 ? `exit ${res.status} (expected 2), stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}` : ''
      );
      if (res.status !== 2) overallOk = false;
      assertNoUsageError('validate-agent-output.js (incomplete report)', res);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }

  // Sub-probe 3: no recent report at all -> exit 0.
  {
    const fixture = makeFixtureCwd();
    try {
      const payload = JSON.stringify({ cwd: fixture });
      const res = runScript(r.repoPath, { args: r.argsAfterScript, stdin: payload, cwd: fixture });
      check(
        'validate-agent-output.js: no recent report -> exit 0 (never breaks unrelated work)',
        res.status === 0,
        res.status !== 0 ? `exit ${res.status}, stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}` : ''
      );
      if (res.status !== 0) overallOk = false;
      assertNoUsageError('validate-agent-output.js (no report)', res);
    } finally {
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }
} else {
  check('validate-agent-output.js: wired and probed', false, 'not found among wired hooks — skipped');
}

// --- verify-changes.js (v8.7.0 - Sprint 02: Gate-Umbau) ---------------------
// This hook is deliberately NOT wired via config/claude-settings.json (that
// file is outside this sprint's write scope - only ~/.claude/settings.json
// is, and that's a local install file, not something CI can read). Probe it
// directly by its known repo path instead of via hookCommands discovery.
{
  const VERIFY_CHANGES_PATH = path.join(REPO_ROOT, 'scripts', 'verify-changes.js');
  const exists = fs.existsSync(VERIFY_CHANGES_PATH);
  check('verify-changes.js: exists in scripts/', exists, exists ? VERIFY_CHANGES_PATH : `expected at ${VERIFY_CHANGES_PATH}`);

  if (exists) {
    // Probe (a): a real git repo with a staged change but no recognized
    // project type (no package.json / pubspec.yaml / xcodeproj) -> exit 0,
    // zero bytes of output ("unknown means pass through, never block").
    {
      const fixture = makeFixtureCwd();
      try {
        const git = spawnSync('git', ['init', '-q'], { cwd: fixture, encoding: 'utf8' });
        spawnSync('git', ['config', 'user.email', 'test@example.com'], { cwd: fixture, encoding: 'utf8' });
        spawnSync('git', ['config', 'user.name', 'Test'], { cwd: fixture, encoding: 'utf8' });
        fs.writeFileSync(path.join(fixture, 'README.md'), 'hello\n');
        spawnSync('git', ['add', 'README.md'], { cwd: fixture, encoding: 'utf8' });

        const gitAvailable = !git.error;
        if (!gitAvailable) {
          check('verify-changes.js: no recognized project -> exit 0, zero output (soft-skip, git unavailable)', true, 'git not available - probe skipped');
        } else {
          const payload = JSON.stringify({ cwd: fixture });
          const res = runScript(VERIFY_CHANGES_PATH, { stdin: payload, cwd: fixture });
          const zeroOutput = res.stdout === '' && res.stderr === '';
          check(
            'verify-changes.js: no recognized project type -> exit 0',
            res.status === 0,
            res.status !== 0 ? `exit ${res.status}, stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}` : ''
          );
          check(
            'verify-changes.js: no recognized project type -> zero-byte output',
            zeroOutput,
            zeroOutput ? '' : `expected empty stdout/stderr, got stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}`
          );
          if (res.status !== 0 || !zeroOutput) overallOk = false;
          assertNoUsageError('verify-changes.js (no recognized project)', res);
        }
      } finally {
        fs.rmSync(fixture, { recursive: true, force: true });
      }
    }

    // Probe (b): no changes at all (clean git repo, or no repo) -> exit 0,
    // zero-byte output.
    {
      const fixture = makeFixtureCwd();
      try {
        spawnSync('git', ['init', '-q'], { cwd: fixture, encoding: 'utf8' });
        const payload = JSON.stringify({ cwd: fixture });
        const res = runScript(VERIFY_CHANGES_PATH, { stdin: payload, cwd: fixture });
        const zeroOutput = res.stdout === '' && res.stderr === '';
        check(
          'verify-changes.js: no changes -> exit 0',
          res.status === 0,
          res.status !== 0 ? `exit ${res.status}, stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}` : ''
        );
        check(
          'verify-changes.js: no changes -> zero-byte output',
          zeroOutput,
          zeroOutput ? '' : `expected empty stdout/stderr, got stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}`
        );
        if (res.status !== 0 || !zeroOutput) overallOk = false;
        assertNoUsageError('verify-changes.js (no changes)', res);
      } finally {
        fs.rmSync(fixture, { recursive: true, force: true });
      }
    }

    // Probe (c): garbage stdin -> exit 0, never breaks unrelated work.
    {
      const fixture = makeFixtureCwd();
      try {
        const res = runScript(VERIFY_CHANGES_PATH, { stdin: 'not valid json {{{', cwd: fixture });
        check(
          'verify-changes.js: garbage stdin -> exit 0 (never breaks unrelated work)',
          res.status === 0,
          res.status !== 0 ? `exit ${res.status}, stdout: ${truncate(res.stdout)}, stderr: ${truncate(res.stderr)}` : ''
        );
        if (res.status !== 0) overallOk = false;
        assertNoUsageError('verify-changes.js (garbage stdin)', res);
      } finally {
        fs.rmSync(fixture, { recursive: true, force: true });
      }
    }
  } else {
    overallOk = false;
  }
}

// --- gate semantics (v8.7.0 sprint-02: @validator dissolved, checks/tester/
// security model) -------------------------------------------------------
// Not a hook-wiring probe like the ones above — this asserts the *contract*
// that made this sprint necessary: a gate at `null` (never required for this
// sprint) must never block a push, while a gate that actually ran and did
// not approve must block it. Exercised in-process against real fixture cwds,
// not spawned, since these are plain requires with no argv/stdin surface.
{
  const PRE_PUSH_PATH = path.join(REPO_ROOT, 'scripts', 'pre-push-check.js');
  const WORKFLOW_STATE_PATH = path.join(REPO_ROOT, 'scripts', 'workflow-state.js');

  function withFixtureState(state, fn) {
    const fixture = makeFixtureCwd();
    const prevCwd = process.cwd();
    try {
      fs.writeFileSync(path.join(fixture, '.ccgm-state.json'), JSON.stringify(state));
      process.chdir(fixture);
      return fn();
    } finally {
      process.chdir(prevCwd);
      fs.rmSync(fixture, { recursive: true, force: true });
    }
  }

  if (fs.existsSync(PRE_PUSH_PATH)) {
    delete require.cache[require.resolve(PRE_PUSH_PATH)];
    const { checkWorkflowState } = require(PRE_PUSH_PATH);

    // (a) checks APPROVED, tester/security never ran (null) -> push-eligible.
    {
      const result = withFixtureState(
        { workflowComplete: true, qualityGates: { checks: 'APPROVED', tester: null, security: null } },
        checkWorkflowState
      );
      check(
        'pre-push-check.js: checks=APPROVED, tester/security=null -> passed (never-run gate does not block)',
        result.passed === true,
        result.passed ? '' : `expected passed:true, got: ${JSON.stringify(result)}`
      );
      if (result.passed !== true) overallOk = false;
    }

    // (b) tester actually ran and is BLOCKED -> not push-eligible.
    {
      const result = withFixtureState(
        { workflowComplete: true, qualityGates: { checks: 'APPROVED', tester: 'BLOCKED', security: null } },
        checkWorkflowState
      );
      check(
        'pre-push-check.js: tester=BLOCKED -> not passed',
        result.passed === false,
        result.passed === false ? '' : `expected passed:false, got: ${JSON.stringify(result)}`
      );
      if (result.passed !== false) overallOk = false;
    }

    // (c) checks itself missing/null -> not push-eligible (mandatory gate).
    {
      const result = withFixtureState(
        { workflowComplete: true, qualityGates: { checks: null, tester: null, security: null } },
        checkWorkflowState
      );
      check(
        'pre-push-check.js: checks=null -> not passed (mandatory gate missing)',
        result.passed === false,
        result.passed === false ? '' : `expected passed:false, got: ${JSON.stringify(result)}`
      );
      if (result.passed !== false) overallOk = false;
    }
  } else {
    check('pre-push-check.js: exists for gate-semantics probe', false, `expected at ${PRE_PUSH_PATH}`);
    overallOk = false;
  }

  if (fs.existsSync(WORKFLOW_STATE_PATH)) {
    delete require.cache[require.resolve(WORKFLOW_STATE_PATH)];
    const ws = require(WORKFLOW_STATE_PATH);

    withFixtureState(null, () => {
      // No state file yet at this fixture cwd -> initWorkflow starts fresh.
      const state = ws.initWorkflow('bug', '0.0.0', 'gate-semantics fixture');
      const gatesOk =
        state.qualityGates.checks === null &&
        state.qualityGates.tester === null &&
        state.qualityGates.security === null;
      check(
        'workflow-state.js: initWorkflow() qualityGates shape is {checks,tester,security}, all null',
        gatesOk,
        gatesOk ? '' : `got: ${JSON.stringify(state.qualityGates)}`
      );
      if (!gatesOk) overallOk = false;

      const rejectedOldGate = ws.setGateResult('validator', 'APPROVED') === null;
      check(
        'workflow-state.js: setGateResult("validator", ...) is rejected (agent no longer exists)',
        rejectedOldGate,
        rejectedOldGate ? '' : 'setGateResult accepted a "validator" gate name'
      );
      if (!rejectedOldGate) overallOk = false;

      ws.setGateResult('security', 'APPROVED');
      const afterSecurity = ws.getResumeInfo();
      const securityTracked = afterSecurity.qualityGates.security === 'APPROVED';
      check(
        'workflow-state.js: setGateResult("security", "APPROVED") is tracked in getResumeInfo()',
        securityTracked,
        securityTracked ? '' : `got: ${JSON.stringify(afterSecurity.qualityGates)}`
      );
      if (!securityTracked) overallOk = false;
    });
  } else {
    check('workflow-state.js: exists for gate-semantics probe', false, `expected at ${WORKFLOW_STATE_PATH}`);
    overallOk = false;
  }
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log('');
console.log('='.repeat(70));
const passCount = results.filter(r => r.pass).length;
console.log(`Summary: ${passCount}/${results.length} checks passed`);
console.log('='.repeat(70));

if (!overallOk) {
  console.log('');
  console.log('FAILED checks:');
  results.filter(r => !r.pass).forEach(r => console.log(`  - ${r.name}`));
  console.log('');
  process.exit(1);
}

console.log('');
console.log('All hook contract checks passed.');
process.exit(0);
