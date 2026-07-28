#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * verify-changes.js (v8.7.0 - Sprint 02: Gate-Umbau)
 *
 * SubagentStop hook. Fires right after @builder and replaces @validator's
 * deterministic half (typecheck / lint / test / build). A compiler result is
 * a fact, not a second opinion — this hook runs ONLY what the project itself
 * defines, never a guessed command. Modeled on scripts/check-api-impact.js:
 * deterministic, tolerant of garbage input, and exactly 0 bytes of stdout on
 * a clean pass.
 *
 * Contract (binding, see plans/v8.7.0/sprint-02-gate-restructure.md):
 *  - Reads the SubagentStop JSON payload from stdin (same shape as the other
 *    hooks). Garbage/empty stdin is tolerated and never blocks.
 *  - Changed files = `git diff --name-only` (unstaged) + `git diff --name-only
 *    --cached` (staged). No changes -> exit 0, zero output.
 *  - Project-type detection is the ONLY source of what runs:
 *      package.json      -> only the npm scripts that actually exist among
 *                            typecheck/lint/test/build (never a guessed
 *                            `npx tsc --noEmit`).
 *      pubspec.yaml       -> `dart analyze`, only if `dart` is on PATH.
 *      *.xcodeproj /
 *      Package.swift      -> report "a build would be needed" only; never
 *                            shells out to xcodebuild (too slow for a hook).
 *      none of the above  -> exit 0, zero output. Unknown always means
 *                            "pass through", never "block".
 *  - Every check runs under a timeout. A timeout is reported (not silent)
 *    but never blocks: exit 0.
 *  - Output appears ONLY for a real, unambiguous failure of a project-defined
 *    check, and is kept to: which check, which file, which line (whatever
 *    the tool itself reported) - no success prose.
 *  - Exit code 2 ONLY for a hard, unambiguous failure of a project-defined
 *    check. Everything else (no project recognized, tool missing, timeout,
 *    broken stdin) exits 0.
 */

'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PER_CHECK_TIMEOUT_MS = 60000;
const NPM_SCRIPT_ORDER = ['typecheck', 'lint', 'test', 'build'];

/**
 * Run a command with a timeout. Never throws.
 * Returns { ok, timedOut, status, stdout, stderr, missing }.
 */
function runCommand(cmd, args, cwd) {
  let res;
  try {
    res = spawnSync(cmd, args, {
      cwd,
      encoding: 'utf8',
      timeout: PER_CHECK_TIMEOUT_MS,
    });
  } catch (e) {
    return { ok: false, timedOut: false, status: null, stdout: '', stderr: String(e && e.message || e), missing: true };
  }

  if (res.error) {
    // ENOENT etc. - tool not present. Treat as "can't run", never blocking.
    const missing = res.error.code === 'ENOENT';
    return { ok: false, timedOut: false, status: null, stdout: res.stdout || '', stderr: String(res.error.message || res.error), missing };
  }

  if (res.signal) {
    // Killed by timeout (or otherwise) - report but never block.
    return { ok: false, timedOut: true, status: res.status, stdout: res.stdout || '', stderr: res.stderr || '', missing: false };
  }

  return {
    ok: res.status === 0,
    timedOut: false,
    status: res.status,
    stdout: res.stdout || '',
    stderr: res.stderr || '',
    missing: false,
  };
}

function isOnPath(bin) {
  const probe = spawnSync(process.platform === 'win32' ? 'where' : 'which', [bin], { encoding: 'utf8' });
  return !probe.error && probe.status === 0;
}

function truncate(output, maxLines = 20) {
  const lines = (output || '').split('\n').filter(Boolean);
  return lines.slice(0, maxLines).join('\n');
}

/**
 * Determine the changed file set: unstaged + staged diffs.
 * Any git failure (not a repo, git missing) -> [] (never blocks).
 */
function getChangedFiles(cwd) {
  const unstaged = runCommand('git', ['diff', '--name-only'], cwd);
  const staged = runCommand('git', ['diff', '--name-only', '--cached'], cwd);

  if (unstaged.missing && staged.missing) return null; // git itself unavailable

  const files = new Set();
  [unstaged, staged].forEach((r) => {
    if (r.stdout) {
      r.stdout.split('\n').map((l) => l.trim()).filter(Boolean).forEach((f) => files.add(f));
    }
  });
  return Array.from(files);
}

/**
 * package.json project: run only the npm scripts that actually exist.
 * Returns an array of failure report strings (empty = all clean/none run).
 * Sets sawTimeout=true (via callback) if any check timed out.
 */
function checkNpmProject(cwd, report) {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  } catch {
    return; // unreadable/invalid package.json -> treat as unknown, pass through
  }

  const scripts = pkg && typeof pkg.scripts === 'object' ? pkg.scripts : {};
  const toRun = NPM_SCRIPT_ORDER.filter((name) => typeof scripts[name] === 'string' && scripts[name].trim());

  if (toRun.length === 0) return; // project defines none of these -> nothing to run

  const npmBin = process.platform === 'win32' ? 'npm.cmd' : 'npm';

  for (const name of toRun) {
    const result = runCommand(npmBin, ['run', name, '--silent'], cwd);

    if (result.timedOut) {
      report.timeouts.push(`npm run ${name} (>${Math.round(PER_CHECK_TIMEOUT_MS / 1000)}s)`);
      continue;
    }
    if (result.missing) {
      // npm itself not on PATH - can't run this project's own checks. Pass through.
      report.timeouts.push(`npm run ${name}: npm not available - skipped`);
      continue;
    }
    if (!result.ok) {
      const combined = `${result.stdout}\n${result.stderr}`;
      report.failures.push(`npm run ${name}:\n${truncate(combined)}`);
    }
  }
}

/**
 * pubspec.yaml project: dart analyze, only if `dart` is on PATH.
 */
function checkDartProject(cwd, report) {
  if (!isOnPath('dart')) {
    report.timeouts.push('dart analyze: dart not on PATH - skipped');
    return;
  }

  const result = runCommand('dart', ['analyze'], cwd);

  if (result.timedOut) {
    report.timeouts.push(`dart analyze (>${Math.round(PER_CHECK_TIMEOUT_MS / 1000)}s)`);
    return;
  }
  if (result.missing) return; // dart vanished between the PATH probe and the run - pass through
  if (!result.ok) {
    const combined = `${result.stdout}\n${result.stderr}`;
    report.failures.push(`dart analyze:\n${truncate(combined)}`);
  }
}

/**
 * Apple project (*.xcodeproj / Package.swift): never runs xcodebuild in a
 * hook (too slow). Just notes that a build would be needed - informational,
 * never blocking.
 */
function checkAppleProject(cwd, report) {
  report.timeouts.push('Xcode/Swift project detected - a build is required but not run by this hook (too slow)');
}

/**
 * Detect project type from cwd and dispatch to the matching checker.
 * Unknown project type -> no-op (pass through).
 */
function detectAndRun(cwd, report) {
  if (fs.existsSync(path.join(cwd, 'package.json'))) {
    checkNpmProject(cwd, report);
    return;
  }
  if (fs.existsSync(path.join(cwd, 'pubspec.yaml'))) {
    checkDartProject(cwd, report);
    return;
  }

  let hasAppleProject = false;
  try {
    if (fs.existsSync(path.join(cwd, 'Package.swift'))) {
      hasAppleProject = true;
    } else {
      const entries = fs.readdirSync(cwd, { withFileTypes: true });
      hasAppleProject = entries.some((e) => e.isDirectory() && e.name.endsWith('.xcodeproj'));
    }
  } catch {
    hasAppleProject = false;
  }
  if (hasAppleProject) {
    checkAppleProject(cwd, report);
    return;
  }

  // No recognized project type - exit silently. Unknown means pass through.
}

function main(cwd) {
  const changed = getChangedFiles(cwd);
  if (!changed || changed.length === 0) {
    process.exit(0); // no changes (or git unavailable) -> zero output, exit 0
  }

  const report = { failures: [], timeouts: [] };
  detectAndRun(cwd, report);

  if (report.timeouts.length > 0) {
    report.timeouts.forEach((t) => console.error(`TIMEOUT/SKIP: ${t}`));
  }

  if (report.failures.length > 0) {
    report.failures.forEach((f) => console.error(f));
    process.exit(2); // hard, unambiguous failure of a project-defined check
  }

  process.exit(0);
}

function runHookMode() {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (d) => { raw += d; });
  process.stdin.on('end', () => {
    let payload = {};
    try { payload = JSON.parse(raw || '{}'); } catch { /* tolerate garbage stdin */ }

    let cwd = process.cwd();
    if (payload && typeof payload.cwd === 'string' && payload.cwd) {
      cwd = payload.cwd;
    }

    try {
      main(cwd);
    } catch {
      // Any unexpected internal error must never break unrelated work.
      process.exit(0);
    }
  });
}

// Entry point: hook mode only (no CLI usage surface - nothing to leak via
// "Usage:" output, per the hook contract test).
if (!process.stdin.isTTY) {
  runHookMode();
} else {
  process.exit(0);
}
