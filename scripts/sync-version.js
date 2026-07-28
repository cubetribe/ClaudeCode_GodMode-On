#!/usr/bin/env node

/**
 * CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
 * Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
 */

/**
 * CC_GodMode Version Sync (v8.5 rewrite)
 *
 * Single machine-readable manifest of EVERY file that carries the current
 * framework version. `--check` is a hard gate (exit 1 on any mismatch or
 * unresolvable pattern); `--sync` rewrites all touchpoints from VERSION.
 *
 * Design rules (ADR-004 / plans/v8.5.0):
 * - VERSION (repo root) is the single source of truth.
 * - Release codenames live ONLY in CHANGELOG.md and the GitHub Release title.
 *   Version lines in docs/prompts are plain `vX.Y.Z` — this script normalizes
 *   legacy `vX.Y.Z — <codename>` lines when syncing.
 * - package.json is intentionally version-free (not a published package).
 * - Paths resolve from the repo root, never from cwd.
 *
 * Usage:
 *   node scripts/sync-version.js --check   # verify all touchpoints (exit 1 on drift)
 *   node scripts/sync-version.js --sync    # rewrite all touchpoints from VERSION
 *   node scripts/sync-version.js --list    # print the touchpoint manifest
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const V = '\\d+\\.\\d+\\.\\d+';

const colors = {
  reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m',
  yellow: '\x1b[33m', cyan: '\x1b[36m', bright: '\x1b[1m'
};

/**
 * Touchpoint manifest. Each entry: file + list of patterns.
 * `find` must match the CURRENT version context (any semver), `make(v)` produces
 * the canonical replacement. `count` = expected number of matches (default 1).
 * Banner lines inside ║…║ boxes are re-padded to their original width.
 */
const MANIFEST = [
  { file: 'VERSION', whole: true },
  { file: '.claude-plugin/plugin.json', patterns: [
    { find: new RegExp(`"version":\\s*"${V}"`), make: v => `"version": "${v}"` },
  ]},
  { file: 'CLAUDE.md', patterns: [
    { find: new RegExp(`^# CC_GodMode v${V}.*$`, 'm'), make: v => `# CC_GodMode v${v}` },
    { find: new RegExp(`^\\*\\*Current Version:\\*\\* v${V}.*$`, 'm'), make: v => `**Current Version:** v${v}` },
  ]},
  { file: 'templates/CLAUDE-ORCHESTRATOR.md', patterns: [
    { find: new RegExp(`^# CC_GodMode v${V}.*$`, 'm'), make: v => `# CC_GodMode v${v}` },
    { find: new RegExp(`^\\*\\*CC_GodMode v${V}[^*]*\\*\\*$`, 'm'), make: v => `**CC_GodMode v${v}**` },
  ]},
  { file: 'README.md', patterns: [
    { find: new RegExp(`Version-${V}-blue`), make: v => `Version-${v}-blue` },
    { find: new RegExp(`^\\*\\*CC_GodMode v${V}[^*]*\\*\\*$`, 'm'), make: v => `**CC_GodMode v${v}**` },
  ]},
  { file: 'docs/AGENT_MODEL_SELECTION.md', patterns: [
    { find: new RegExp(`CC_GodMode v${V} uses`), make: v => `CC_GodMode v${v} uses` },
  ]},
  { file: 'CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md', patterns: [
    { find: new RegExp(`^> \\*\\*Version:\\*\\* ${V}`, 'm'), make: v => `> **Version:** ${v}` },
    { find: new RegExp(`CC_GodMode Installation v${V}[^║\\n]*?(?=\\s*║)`), make: v => `CC_GodMode Installation v${v}`, banner: true },
    { find: new RegExp(`CC_GodMode Installation Successful! v${V}[^║\\n]*?(?=\\s*║)`), make: v => `CC_GodMode Installation Successful! v${v}`, banner: true },
    { find: new RegExp(`Version:( +)${V}`), make: (v, m) => `Version:${m[1]}${v}`, banner: true },
  ]},
  { file: 'CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md', patterns: [
    { find: new RegExp(`^> \\*\\*Version:\\*\\* ${V}`, 'm'), make: v => `> **Version:** ${v}` },
    { find: new RegExp(`CC_GodMode \\*\\*v${V}[^*]*\\*\\*`), make: v => `CC_GodMode **v${v}**` },
  ]},
  { file: 'CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md', patterns: [
    { find: new RegExp(`^> \\*\\*Version:\\*\\* ${V}`, 'm'), make: v => `> **Version:** ${v}` },
  ]},
  { file: 'CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md', patterns: [
    { find: new RegExp(`^> \\*\\*Version:\\*\\* ${V}`, 'm'), make: v => `> **Version:** ${v}` },
  ]},
  { file: 'CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md', patterns: [
    { find: new RegExp(`^> \\*\\*Version:\\*\\* ${V}`, 'm'), make: v => `> **Version:** ${v}` },
    { find: new RegExp(`\\*\\*CC_GodMode v${V}( - [^*]*)?\\*\\*`), make: v => `**CC_GodMode v${v} - Enhanced Restart Prompt with Behavior Enforcement**` },
  ]},
  { file: 'CC-GodMode-Prompts/QUICK_START.md', patterns: [
    { find: new RegExp(`^> \\*\\*Version:\\*\\* ${V}`, 'm'), make: v => `> **Version:** ${v}` },
  ]},
];

function getVersion() {
  const f = path.join(ROOT, 'VERSION');
  if (!fs.existsSync(f)) { console.error(`${colors.red}VERSION file not found at ${f}${colors.reset}`); process.exit(1); }
  const v = fs.readFileSync(f, 'utf-8').trim();
  if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(v)) { console.error(`${colors.red}Invalid semver in VERSION: "${v}"${colors.reset}`); process.exit(1); }
  return v;
}

/** Re-pad a ║…║ banner line to its original width after replacement. */
function repadBannerLine(originalLine, newLine) {
  if (!originalLine.startsWith('║') || !originalLine.endsWith('║')) return newLine;
  const width = originalLine.length;
  let inner = newLine.slice(1, -1).replace(/\s+$/, '');
  if (inner.length > width - 2) return newLine; // longer than box — leave for manual fix
  return '║' + inner + ' '.repeat(width - 2 - inner.length) + '║';
}

function applyPattern(content, p, version) {
  const m = content.match(p.find);
  if (!m) return { content, status: 'missing' };
  const replacement = p.make(version, m);
  if (m[0] === replacement) return { content, status: 'ok' };
  if (p.banner) {
    // operate on the full line containing the match to preserve box padding
    const lineStart = content.lastIndexOf('\n', m.index) + 1;
    const lineEnd = content.indexOf('\n', m.index);
    const line = content.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    const newLineRaw = line.replace(p.find, replacement);
    const newLine = repadBannerLine(line, newLineRaw);
    return { content: content.slice(0, lineStart) + newLine + (lineEnd === -1 ? '' : content.slice(lineEnd)), status: 'updated' };
  }
  return { content: content.replace(p.find, replacement), status: 'updated' };
}

function run(mode) {
  const version = getVersion();
  console.log(`\n${colors.cyan}${colors.bright}CC_GodMode Version ${mode === 'sync' ? 'Sync' : 'Check'}${colors.reset}  target: ${colors.bright}${version}${colors.reset}\n`);

  let drift = 0, missing = 0, updated = 0;

  for (const entry of MANIFEST) {
    const full = path.join(ROOT, entry.file);
    if (!fs.existsSync(full)) { console.log(`  ${colors.yellow}?${colors.reset} ${entry.file} (file not found)`); missing++; continue; }
    let content = fs.readFileSync(full, 'utf-8');

    if (entry.whole) {
      const ok = content.trim() === version;
      console.log(`  ${ok ? colors.green + '✓' : colors.red + '✗'}${colors.reset} ${entry.file}${ok ? '' : ` (found: ${content.trim()})`}`);
      if (!ok) drift++;
      continue;
    }

    const results = [];
    for (const p of entry.patterns) {
      const r = applyPattern(content, p, version);
      results.push(r.status);
      if (r.status === 'updated' && mode === 'sync') content = r.content;
    }
    const bad = results.filter(s => s !== 'ok').length;
    const miss = results.filter(s => s === 'missing').length;

    if (mode === 'sync' && results.includes('updated')) {
      fs.writeFileSync(full, content);
      updated++;
      console.log(`  ${colors.green}✓${colors.reset} synced: ${entry.file} (${results.filter(s => s === 'updated').length} pattern(s))`);
    } else if (bad === 0) {
      console.log(`  ${colors.green}✓${colors.reset} ${entry.file}`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ${entry.file} — ${results.map((s, i) => `p${i + 1}:${s}`).join(', ')}`);
      drift += bad - miss; missing += miss;
    }
  }

  console.log('');
  if (mode === 'sync') {
    console.log(`${colors.green}✓ Sync complete. ${updated} file(s) updated.${colors.reset}`);
    if (missing > 0) { console.log(`${colors.red}✗ ${missing} pattern(s) could not be located — fix manually, then re-run --check.${colors.reset}`); process.exit(1); }
  } else {
    if (drift + missing > 0) {
      console.log(`${colors.red}✗ ${drift} mismatch(es), ${missing} unresolvable pattern(s).${colors.reset}`);
      console.log(`${colors.yellow}Run: node scripts/sync-version.js --sync${colors.reset}`);
      process.exit(1);
    }
    console.log(`${colors.green}✓ All ${MANIFEST.length} touchpoints consistent with VERSION=${version}.${colors.reset}`);
  }
  console.log('');
}

function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) {
    console.log('\nUsage:\n  node scripts/sync-version.js --check | --sync | --list\n');
    process.exit(0);
  }
  if (args.includes('--list')) {
    MANIFEST.forEach(e => console.log(`${e.file}  (${e.whole ? 'whole-file' : e.patterns.length + ' pattern(s)'})`));
    process.exit(0);
  }
  run(args.includes('--sync') ? 'sync' : 'check');
}

main();
module.exports = { MANIFEST, getVersion };
