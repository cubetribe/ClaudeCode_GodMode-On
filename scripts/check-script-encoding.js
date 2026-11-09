#!/usr/bin/env node
/**
 * check-script-encoding.js
 *
 * Guards the single defect that made v9.0.0 impossible to install on Windows:
 * a *.ps1 file stored as UTF-8 WITHOUT a byte-order mark.
 *
 * Windows PowerShell 5.1 - still the shell every Windows 11 machine ships
 * with, and the only one present unless PowerShell 7 is installed separately -
 * does not sniff for UTF-8. A BOM-less script is decoded as the system ANSI
 * codepage. Under cp1252 the UTF-8 bytes of an em dash (E2 80 94) decode to
 * three characters whose last one is U+201D RIGHT DOUBLE QUOTATION MARK, and
 * PowerShell accepts that as a string delimiter. Strings are cut apart and the
 * file fails at PARSE time, which means nothing runs at all: no agents, no
 * skills, no templates, no version marker and no hook wiring. The failure is
 * invisible on macOS and under pwsh 7, both of which decode UTF-8 correctly.
 *
 * Rule enforced: every *.ps1 file starts with a UTF-8 BOM (EF BB BF).
 * It is required unconditionally rather than only for files that currently
 * contain non-ASCII bytes, because a later commit adding a single dash or
 * arrow to a prose string would otherwise re-break the installer silently.
 *
 * Usage: node scripts/check-script-encoding.js
 * Exit 0 = every script is safe to run on Windows, exit 1 = at least one is not.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SKIP_DIRS = new Set(['node_modules', '.git', '.local-artifacts']);
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);

function collect(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      collect(path.join(dir, entry.name), out);
    } else if (entry.name.toLowerCase().endsWith('.ps1')) {
      out.push(path.join(dir, entry.name));
    }
  }
  return out;
}

/** Decode the non-ASCII runs of a buffer, so the report names the real culprits. */
function describeNonAscii(buf) {
  const found = new Map();
  for (let i = 0; i < buf.length; i++) {
    if (buf[i] < 0x80) continue;
    let len = 1;
    if ((buf[i] & 0xe0) === 0xc0) len = 2;
    else if ((buf[i] & 0xf0) === 0xe0) len = 3;
    else if ((buf[i] & 0xf8) === 0xf0) len = 4;
    const seq = buf.subarray(i, i + len);
    const ch = seq.toString('utf8');
    const hex = [...seq].map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
    const key = `${JSON.stringify(ch)} (${hex})`;
    found.set(key, (found.get(key) || 0) + 1);
    i += len - 1;
  }
  return [...found.entries()].map(([k, n]) => `${k} x${n}`);
}

const files = collect(REPO_ROOT);
const failures = [];

for (const file of files) {
  const rel = path.relative(REPO_ROOT, file).split(path.sep).join('/');
  const buf = fs.readFileSync(file);
  if (buf.subarray(0, 3).equals(BOM)) {
    console.log(`[ok]      ${rel} (UTF-8 BOM)`);
    continue;
  }
  const nonAscii = describeNonAscii(buf);
  failures.push({ rel, nonAscii });
  console.log(`[FAIL]    ${rel} (no UTF-8 BOM)`);
  if (nonAscii.length > 0) {
    console.log(`          non-ASCII present, so PowerShell 5.1 WILL mis-parse this file:`);
    nonAscii.forEach(d => console.log(`            ${d}`));
  } else {
    console.log(`          currently pure ASCII, but add one dash and it breaks silently`);
  }
}

console.log('');
if (files.length === 0) {
  console.log('No *.ps1 files found - nothing to check.');
  process.exit(0);
}

if (failures.length > 0) {
  console.log(`Script encoding check FAILED (${failures.length}/${files.length} file(s)).`);
  console.log('');
  console.log('Fix: re-save the file as "UTF-8 with BOM". From this repo:');
  console.log('  node -e "const f=require(\'fs\'),p=process.argv[1],b=f.readFileSync(p);' +
    'if(b[0]!==0xEF)f.writeFileSync(p,Buffer.concat([Buffer.from([0xEF,0xBB,0xBF]),b]))" <file.ps1>');
  process.exit(1);
}

console.log(`Script encoding check passed (${files.length} file(s)).`);
process.exit(0);
