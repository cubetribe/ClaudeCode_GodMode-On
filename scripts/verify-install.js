#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * verify-install.js (v8.7.0 sprint-04 — install/update path)
 *
 * The belastable answer to "can this actually be installed" is a check with
 * an exit code, not a claim in the README. This script IS that check.
 *
 * Verifies a CC_GodMode runtime installed under CLAUDE_HOME (default
 * ~/.claude, override via the CLAUDE_HOME env var — the same variable
 * scripts/apply-global-claude-setup.sh reads):
 *
 *   1. All agents from the repo's agents/ exist under <claude_home>/agents/
 *   2. All skills from the repo's skills/ exist under <claude_home>/skills/
 *      (a directory containing SKILL.md)
 *   3. Every hook wired in config/claude-settings.json is wired in
 *      <claude_home>/settings.json AND its referenced script file exists.
 *      A hook pointing at a missing script is an error, not a footnote —
 *      this exact class of silent defect has hit this repo twice before.
 *   4. <claude_home>/templates/CLAUDE-ORCHESTRATOR.md exists
 *   5. <claude_home>/.cc-godmode-version vs. the repo's VERSION file
 *      (mismatch is a WARNING, not an error — a user is allowed to lag
 *      behind; the message points at the update command)
 *   6. <claude_home>/LICENSE-CC_GodMode.txt and NOTICE-CC_GodMode.txt exist
 *
 * Contract:
 *   - Exit 0  = installation complete. Output is terse, one line per category.
 *   - Exit 1  = at least one error. Output lists concretely what is missing
 *               (a file name, never a vague "agents incomplete").
 *   - Must run from BOTH contexts:
 *       node scripts/verify-install.js               (inside the repo)
 *       node ~/.claude/scripts/verify-install.js      (from the install, no
 *                                                       repo sitting next to it)
 *     In the second case there is no repo to compare against — the script
 *     checks whatever is checkable without a repo reference and says plainly
 *     what it could not verify. It never crashes because the repo is absent.
 *
 * Plain Node, no dependencies.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function isDir(p) {
  try {
    return fs.statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function isFile(p) {
  try {
    return fs.statSync(p).isFile();
  } catch {
    return false;
  }
}

/**
 * A directory "looks like the repo" only if it has the markers that a plain
 * ~/.claude install never has (VERSION, config/claude-settings.json) in
 * addition to agents/ and skills/. This is the deciding check between the
 * two run contexts described above.
 */
function looksLikeRepo(dir) {
  return (
    isDir(path.join(dir, 'agents')) &&
    isDir(path.join(dir, 'skills')) &&
    isFile(path.join(dir, 'VERSION')) &&
    isFile(path.join(dir, 'config', 'claude-settings.json'))
  );
}

function findRepoRoot() {
  const candidate = path.resolve(__dirname, '..');
  return looksLikeRepo(candidate) ? candidate : null;
}

function resolveClaudeHome() {
  const raw = process.env.CLAUDE_HOME && process.env.CLAUDE_HOME.trim();
  if (raw) return path.resolve(raw.replace(/^~/, os.homedir()));
  return path.join(os.homedir(), '.claude');
}

/**
 * Extract the first *.js token from a hook command string, tolerant of
 * simple double-quoted segments (mirrors scripts/test-hooks-contract.js).
 */
function firstScriptToken(command) {
  const tokens = command.match(/(?:[^\s"]+|"[^"]*")+/g) || [];
  for (const t of tokens) {
    const clean = t.replace(/^"|"$/g, '');
    if (clean.endsWith('.js')) return clean;
  }
  return null;
}

/**
 * Resolve a hook command's script token to an actual filesystem path under
 * CLAUDE_HOME, whatever form it was written in:
 *   "~/.claude/scripts/x.js"        -> <claude_home>/scripts/x.js
 *   "${CLAUDE_HOME}/scripts/x.js"   -> <claude_home>/scripts/x.js
 *   "$CLAUDE_HOME/scripts/x.js"     -> <claude_home>/scripts/x.js
 *   "scripts/x.js" (repo-relative)  -> <claude_home>/scripts/x.js
 *   an absolute path already        -> unchanged
 */
function resolveInstalledScriptPath(token, claudeHome) {
  let p = token;
  p = p.replace(/^~/, os.homedir());
  p = p.replace(/\$\{?CLAUDE_HOME\}?/g, claudeHome);
  if (path.isAbsolute(p)) return p;
  // repo-relative form, e.g. "scripts/check-api-impact.js"
  return path.join(claudeHome, p.replace(/^\.\/?/, ''));
}

function collectHookCommands(settingsJson) {
  const out = [];
  const hooks = (settingsJson && settingsJson.hooks) || {};
  for (const [eventName, entries] of Object.entries(hooks)) {
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      const hookList = entry && entry.hooks;
      if (!Array.isArray(hookList)) continue;
      for (const h of hookList) {
        if (h && typeof h.command === 'string') {
          out.push({ event: eventName, command: h.command });
        }
      }
    }
  }
  return out;
}

function readJsonSafe(filePath) {
  try {
    return { ok: true, value: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

function main() {
  const claudeHome = resolveClaudeHome();
  const repoRoot = findRepoRoot();

  const errors = [];
  const warnings = [];
  const lines = [];

  // --- 1. Agents ------------------------------------------------------------
  {
    const dstAgentsDir = path.join(claudeHome, 'agents');
    if (repoRoot) {
      const srcAgentsDir = path.join(repoRoot, 'agents');
      const srcAgents = isDir(srcAgentsDir)
        ? fs.readdirSync(srcAgentsDir).filter((f) => f.endsWith('.md'))
        : [];
      const missing = srcAgents.filter((f) => !isFile(path.join(dstAgentsDir, f)));
      for (const f of missing) {
        errors.push(`agent missing: ${f} (expected at ${path.join(dstAgentsDir, f)})`);
      }
      lines.push(`Agents: ${srcAgents.length - missing.length}/${srcAgents.length} installed`);
    } else if (!isDir(dstAgentsDir)) {
      errors.push(`agents directory missing: ${dstAgentsDir}`);
      lines.push('Agents: FAILED (directory missing)');
    } else {
      const found = fs.readdirSync(dstAgentsDir).filter((f) => f.endsWith('.md'));
      lines.push(
        `Agents: ${found.length} found under ${dstAgentsDir} (no repo nearby — cannot verify against source list)`
      );
    }
  }

  // --- 2. Skills --------------------------------------------------------------
  {
    const dstSkillsDir = path.join(claudeHome, 'skills');
    if (repoRoot) {
      const srcSkillsDir = path.join(repoRoot, 'skills');
      const srcSkills = isDir(srcSkillsDir)
        ? fs.readdirSync(srcSkillsDir).filter((name) => isDir(path.join(srcSkillsDir, name)))
        : [];
      const missing = srcSkills.filter((name) => !isFile(path.join(dstSkillsDir, name, 'SKILL.md')));
      for (const name of missing) {
        errors.push(`skill missing: ${name} (expected ${path.join(dstSkillsDir, name, 'SKILL.md')})`);
      }
      lines.push(`Skills: ${srcSkills.length - missing.length}/${srcSkills.length} installed`);
    } else if (!isDir(dstSkillsDir)) {
      errors.push(`skills directory missing: ${dstSkillsDir}`);
      lines.push('Skills: FAILED (directory missing)');
    } else {
      const found = fs.readdirSync(dstSkillsDir).filter((name) => isFile(path.join(dstSkillsDir, name, 'SKILL.md')));
      lines.push(
        `Skills: ${found.length} found under ${dstSkillsDir} (no repo nearby — cannot verify against source list)`
      );
    }
  }

  // --- 3. Hooks -----------------------------------------------------------
  {
    const dstSettingsPath = path.join(claudeHome, 'settings.json');
    if (!isFile(dstSettingsPath)) {
      errors.push(`settings.json missing: ${dstSettingsPath} (no hooks can be wired)`);
      lines.push('Hooks: FAILED (settings.json missing)');
    } else {
      const parsed = readJsonSafe(dstSettingsPath);
      if (!parsed.ok) {
        errors.push(`settings.json is not valid JSON: ${dstSettingsPath} (${parsed.error})`);
        lines.push('Hooks: FAILED (settings.json invalid JSON)');
      } else {
        const installedCommands = collectHookCommands(parsed.value);

        // 3a. Every script a wired hook command in the install points to
        //     must actually exist. Checked regardless of repo availability.
        let missingScripts = 0;
        for (const h of installedCommands) {
          const token = firstScriptToken(h.command);
          if (!token) continue;
          const resolved = resolveInstalledScriptPath(token, claudeHome);
          if (!isFile(resolved)) {
            errors.push(`hook script missing: [${h.event}] "${h.command}" -> ${resolved} does not exist`);
            missingScripts += 1;
          }
        }

        // 3b. Compare against the canonical hook set, only possible with a repo.
        if (repoRoot) {
          const canonicalPath = path.join(repoRoot, 'config', 'claude-settings.json');
          const canonicalParsed = readJsonSafe(canonicalPath);
          if (!canonicalParsed.ok) {
            errors.push(`canonical config/claude-settings.json is not valid JSON (${canonicalParsed.error})`);
          } else {
            const canonicalCommands = collectHookCommands(canonicalParsed.value);
            const installedKeys = new Set(
              installedCommands
                .map((h) => {
                  const t = firstScriptToken(h.command);
                  return t ? `${h.event}::${path.basename(t)}` : null;
                })
                .filter(Boolean)
            );
            let missingWiring = 0;
            for (const h of canonicalCommands) {
              const t = firstScriptToken(h.command);
              if (!t) continue;
              const key = `${h.event}::${path.basename(t)}`;
              if (!installedKeys.has(key)) {
                errors.push(`hook not wired: [${h.event}] ${path.basename(t)} is expected but not found in ${dstSettingsPath}`);
                missingWiring += 1;
              }
            }
            const total = canonicalCommands.length;
            const wired = total - missingWiring;
            lines.push(
              `Hooks: ${wired}/${total} wired, ${installedCommands.length - missingScripts}/${installedCommands.length} referenced scripts present`
            );
          }
        } else {
          lines.push(
            `Hooks: ${installedCommands.length - missingScripts}/${installedCommands.length} referenced scripts present (no repo nearby — cannot verify against the canonical hook set)`
          );
        }
      }
    }
  }

  // --- 4. Orchestrator template --------------------------------------------
  {
    const templatePath = path.join(claudeHome, 'templates', 'CLAUDE-ORCHESTRATOR.md');
    if (isFile(templatePath)) {
      lines.push('Template: CLAUDE-ORCHESTRATOR.md present');
    } else {
      errors.push(`template missing: ${templatePath}`);
      lines.push('Template: FAILED (CLAUDE-ORCHESTRATOR.md missing)');
    }
  }

  // --- 5. Version marker vs. repo VERSION (warning only) --------------------
  {
    const markerPath = path.join(claudeHome, '.cc-godmode-version');
    const installedVersion = isFile(markerPath) ? fs.readFileSync(markerPath, 'utf8').trim() : null;
    if (!installedVersion) {
      warnings.push(
        `no version marker found at ${markerPath} — run: git pull && ./scripts/apply-global-claude-setup.sh`
      );
      lines.push('Version: unknown (no .cc-godmode-version marker)');
    } else if (repoRoot) {
      const repoVersion = fs.readFileSync(path.join(repoRoot, 'VERSION'), 'utf8').trim();
      if (installedVersion === repoVersion) {
        lines.push(`Version: ${installedVersion} (matches repo)`);
      } else {
        warnings.push(
          `installed version ${installedVersion} != repo VERSION ${repoVersion} — run: git pull && ./scripts/apply-global-claude-setup.sh`
        );
        lines.push(`Version: ${installedVersion} installed, repo is ${repoVersion} (behind — see warning)`);
      }
    } else {
      lines.push(`Version: ${installedVersion} installed (no repo nearby — cannot compare)`);
    }
  }

  // --- 6. License / Notice --------------------------------------------------
  {
    const licensePath = path.join(claudeHome, 'LICENSE-CC_GodMode.txt');
    const noticePath = path.join(claudeHome, 'NOTICE-CC_GodMode.txt');
    const licenseOk = isFile(licensePath);
    const noticeOk = isFile(noticePath);
    if (!licenseOk) errors.push(`license missing: ${licensePath}`);
    if (!noticeOk) errors.push(`notice missing: ${noticePath}`);
    lines.push(`License/Notice: ${[licenseOk && 'LICENSE', noticeOk && 'NOTICE'].filter(Boolean).join(', ') || 'none'} present`);
  }

  // --- Report ----------------------------------------------------------------
  console.log(`CC_GodMode Install Verification — CLAUDE_HOME=${claudeHome}${repoRoot ? '' : ' (no repo found nearby)'}`);
  for (const l of lines) console.log(`  ${l}`);
  if (warnings.length) {
    console.log('');
    console.log('Warnings:');
    for (const w of warnings) console.log(`  - ${w}`);
  }
  if (errors.length) {
    console.log('');
    console.log('Errors:');
    for (const e of errors) console.log(`  - ${e}`);
    console.log('');
    console.log(`Installation verification FAILED (${errors.length} issue(s)).`);
    process.exit(1);
  }
  console.log('');
  console.log('Installation verified OK.');
  process.exit(0);
}

if (require.main === module) main();

module.exports = { resolveClaudeHome, findRepoRoot, looksLikeRepo };
