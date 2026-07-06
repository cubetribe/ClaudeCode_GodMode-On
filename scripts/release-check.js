#!/usr/bin/env node

/**
 * CC_GodMode Release Consistency Check (new in v9, ADR-004)
 *
 * Enforces the release invariant:
 *   VERSION == top CHANGELOG version == latest git tag == latest GitHub release
 * with exactly one tolerated intermediate state:
 *   VERSION may be AHEAD of the latest tag only while a release is in flight
 *   (current branch matches release/* , or --allow-ahead is passed).
 *
 * Also reports CHANGELOG versions >= TAG_LAW_SINCE that have no matching tag
 * (the "phantom release" class: e.g. 7.1.1 / 8.0.1 before their backfill).
 *
 * Usage:
 *   node scripts/release-check.js            # human mode
 *   node scripts/release-check.js --ci       # strict: any violation exits 1
 *   node scripts/release-check.js --allow-ahead
 *
 * GitHub release comparison uses `gh` when available and is skipped otherwise
 * (git tags remain the offline source of release truth).
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const TAG_LAW_SINCE = [7, 0, 0]; // tag+release law applies from v7.0.0 onward

const c = { reset: '\x1b[0m', red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', bright: '\x1b[1m' };

function sh(cmd) {
  try { return execSync(cmd, { cwd: ROOT, encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }).trim(); }
  catch { return null; }
}

function parseV(s) {
  const m = String(s).trim().replace(/^v/, '').match(/^(\d+)\.(\d+)\.(\d+)$/);
  return m ? [Number(m[1]), Number(m[2]), Number(m[3])] : null;
}
function cmpV(a, b) { for (let i = 0; i < 3; i++) { if (a[i] !== b[i]) return a[i] - b[i]; } return 0; }
function fmt(v) { return v.join('.'); }

function main() {
  const args = process.argv.slice(2);
  const ci = args.includes('--ci');
  const allowAhead = args.includes('--allow-ahead');

  const problems = [];
  const warnings = [];

  // 1. VERSION file
  const versionRaw = fs.readFileSync(path.join(ROOT, 'VERSION'), 'utf-8').trim();
  const version = parseV(versionRaw);
  if (!version) { console.error(`${c.red}VERSION is not valid semver: "${versionRaw}"${c.reset}`); process.exit(1); }

  // 2. Top CHANGELOG version (first "## [x.y.z]" heading; [Unreleased] is skipped)
  const changelog = fs.readFileSync(path.join(ROOT, 'CHANGELOG.md'), 'utf-8');
  const headings = [...changelog.matchAll(/^## \[([^\]]+)\]/gm)].map(m => m[1]);
  const topEntry = headings.find(h => h.toLowerCase() !== 'unreleased');
  const topV = topEntry ? parseV(topEntry) : null;
  if (!topV) problems.push('CHANGELOG.md has no version heading.');
  else if (cmpV(topV, version) !== 0) problems.push(`VERSION=${fmt(version)} but top CHANGELOG entry is [${topEntry}].`);

  // 3. Latest git tag (semver-sorted, v-prefixed)
  const tagsRaw = sh('git tag -l "v[0-9]*"');
  const tags = (tagsRaw ? tagsRaw.split('\n') : []).map(parseV).filter(Boolean).sort(cmpV);
  const latestTag = tags.length ? tags[tags.length - 1] : null;
  if (!latestTag) warnings.push('No semver git tags found.');
  else {
    const d = cmpV(version, latestTag);
    if (d < 0) problems.push(`VERSION=${fmt(version)} is BEHIND latest tag v${fmt(latestTag)}.`);
    if (d > 0) {
      // In CI PR checkouts HEAD is detached — GITHUB_HEAD_REF carries the branch name
      const branch = process.env.GITHUB_HEAD_REF || sh('git rev-parse --abbrev-ref HEAD') || '';
      if (allowAhead || /^release\//.test(branch)) {
        warnings.push(`VERSION=${fmt(version)} ahead of latest tag v${fmt(latestTag)} — OK (release in flight on ${branch || 'n/a'}).`);
      } else {
        problems.push(`VERSION=${fmt(version)} is ahead of latest tag v${fmt(latestTag)} with no release in flight (branch: ${branch}). Finish the release tail (tag + GitHub release) or revert the bump.`);
      }
    }
  }

  // 4. Phantom releases: changelogged versions >= TAG_LAW_SINCE without a tag
  const tagSet = new Set(tags.map(fmt));
  const phantoms = headings
    .map(parseV).filter(Boolean)
    .filter(v => cmpV(v, TAG_LAW_SINCE) >= 0)
    .filter(v => !tagSet.has(fmt(v)))
    .filter(v => cmpV(v, version) !== 0 || cmpV(v, latestTag || [0, 0, 0]) < 0); // current in-flight version handled above
  for (const p of [...new Set(phantoms.map(fmt))]) {
    problems.push(`CHANGELOG has [${p}] but no tag v${p} exists (phantom release — backfill the tag or mark the entry as folded into a later release).`);
  }

  // 5. Latest GitHub release (optional, needs gh + network)
  const ghLatest = sh('gh release view --json tagName -q .tagName 2>/dev/null');
  if (ghLatest && latestTag) {
    const ghV = parseV(ghLatest);
    if (ghV && cmpV(ghV, latestTag) !== 0) {
      problems.push(`Latest GitHub release is ${ghLatest} but latest tag is v${fmt(latestTag)} — tag exists without a published release (or vice versa).`);
    }
  } else if (!ghLatest) {
    warnings.push('GitHub release comparison skipped (gh unavailable or offline).');
  }

  // Report
  console.log(`\n${c.cyan}${c.bright}CC_GodMode Release Check${c.reset}  VERSION=${fmt(version)}  top CHANGELOG=${topEntry || '—'}  latest tag=${latestTag ? 'v' + fmt(latestTag) : '—'}\n`);
  for (const w of warnings) console.log(`  ${c.yellow}⚠${c.reset} ${w}`);
  for (const p of problems) console.log(`  ${c.red}✗${c.reset} ${p}`);
  if (problems.length === 0) console.log(`  ${c.green}✓ Release invariant holds.${c.reset}`);
  console.log('');

  process.exit(problems.length > 0 ? 1 : 0);
}

main();
