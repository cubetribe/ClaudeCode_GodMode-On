#Requires -Version 5.1
<#
.SYNOPSIS
  Install (or verify) the CC_GodMode runtime into the user-level Claude home (~/.claude).

.DESCRIPTION
  Idempotent installer that mirrors the repository's agents, scripts, skills, and
  templates into ~/.claude. Existing files are backed up (timestamped) before being
  overwritten, so a re-run after `git pull` safely brings the runtime up to date.

  A normal install run is also the update path: `git pull` then re-run this script. It merges
  the canonical hook wiring from config/claude-settings.json into ~/.claude/settings.json (only
  the "hooks" key is touched; every other top-level key a user has — model, effortLevel,
  permissions, theme, their own hooks — is preserved as-is).

.PARAMETER Check
  Verify the installed runtime instead of installing. Exits non-zero on any drift.

.PARAMETER ClaudeHome
  Override the target Claude home directory (default: $env:CLAUDE_HOME or ~/.claude).

.PARAMETER Repo
  Override the repository root used as the install source (default: this script's parent).

.PARAMETER NoHooks
  Install/refresh but skip settings.json hook wiring (for users who manage their own hooks).

.PARAMETER FixHooks
  Repair ~/.claude/settings.json hook wiring only (same merge as a normal run's hook step).
  Composes with a normal install run; also works standalone.

.EXAMPLE
  .\scripts\apply-global-claude-setup.ps1
  Install/refresh the runtime in ~/.claude and wire hooks.

.EXAMPLE
  .\scripts\apply-global-claude-setup.ps1 -Check
  Verify the installed runtime matches the repository.

.EXAMPLE
  .\scripts\apply-global-claude-setup.ps1 -NoHooks
  Install/refresh but leave settings.json untouched.

.EXAMPLE
  .\scripts\apply-global-claude-setup.ps1 -FixHooks
  Repair hook wiring only (creates settings.json from the canonical template if missing).
#>
[CmdletBinding()]
param(
  [switch]$Check,
  [string]$ClaudeHome,
  [string]$Repo,
  [switch]$NoHooks,
  [switch]$FixHooks
)

# CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
# Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# --- Path resolution -------------------------------------------------------

function Resolve-AbsolutePath {
  param([string]$Path)
  $resolved = $ExecutionContext.SessionState.Path.GetUnresolvedProviderPathFromPSPath($Path)
  [System.IO.Path]::GetFullPath($resolved)
}

if ([string]::IsNullOrWhiteSpace($Repo)) {
  $Repo = Join-Path $PSScriptRoot '..'
}
$repoRoot = Resolve-AbsolutePath $Repo

if ([string]::IsNullOrWhiteSpace($ClaudeHome)) {
  if (-not [string]::IsNullOrWhiteSpace($env:CLAUDE_HOME)) {
    $ClaudeHome = $env:CLAUDE_HOME
  } else {
    $ClaudeHome = Join-Path $HOME '.claude'
  }
}

# --- CLAUDE_HOME validation ------------------------------------------------

if ([string]::IsNullOrWhiteSpace($ClaudeHome)) {
  Write-Error "CLAUDE_HOME must not be empty."
  exit 1
}

if (-not [System.IO.Path]::IsPathRooted($ClaudeHome)) {
  Write-Error "CLAUDE_HOME must be an absolute (rooted) path (got: '$ClaudeHome')."
  exit 1
}

# Resolve to absolute after validation
$claudeHome = Resolve-AbsolutePath $ClaudeHome

# Reject drive root (e.g. "C:\") — GetPathRoot returns "C:\" for rooted paths at the root
$driveRoot = [System.IO.Path]::GetPathRoot($claudeHome)
if ($claudeHome.TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar) -eq `
    $driveRoot.TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)) {
  Write-Error "CLAUDE_HOME must not be the drive root ('$driveRoot')."
  exit 1
}

# Source locations in the repository
$srcAgents    = Join-Path $repoRoot 'agents'
$srcScripts   = Join-Path $repoRoot 'scripts'
$srcSkills    = Join-Path $repoRoot 'skills'
$srcOrchestrator = Join-Path $repoRoot 'CLAUDE.md'
$srcProjectActivation = Join-Path $repoRoot 'CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md'
$srcVersion   = Join-Path $repoRoot 'VERSION'
$srcLicense   = Join-Path $repoRoot 'LICENSE'
$srcNotice    = Join-Path $repoRoot 'NOTICE'
$srcSettings  = Join-Path $repoRoot 'config/claude-settings.json'

# Target locations in ~/.claude
$dstAgents    = Join-Path $claudeHome 'agents'
$dstScripts   = Join-Path $claudeHome 'scripts'
$dstSkills    = Join-Path $claudeHome 'skills'
$dstTemplates = Join-Path $claudeHome 'templates'
$dstOrchestrator = Join-Path $dstTemplates 'CLAUDE-ORCHESTRATOR.md'
$dstProjectActivation = Join-Path $dstTemplates 'CCGM_Prompt_02-ProjectActivation.md'
$versionMarker = Join-Path $claudeHome '.cc-godmode-version'
$dstSettings  = Join-Path $claudeHome 'settings.json'
$dstLicense   = Join-Path $claudeHome 'LICENSE-CC_GodMode.txt'
$dstNotice    = Join-Path $claudeHome 'NOTICE-CC_GodMode.txt'

# --- Wire-Hooks: merge canonical hook wiring into ~/.claude/settings.json --
#
# Shared by a normal install run (called automatically unless -NoHooks) and the
# standalone -FixHooks repair path. If settings.json already exists, it is
# backed up (timestamped) before being touched and validated as JSON both
# before and after the write; a JSON parse failure aborts without writing. If
# settings.json does not exist yet, it is created fresh (starting from an
# empty object) so a first-time install ends up wired instead of rejected —
# this is what fixes the old "-FixHooks: nothing to merge into" dead end on a
# brand-new install.
#
# Merges the canonical `hooks` object from config/claude-settings.json.
# Replaces/inserts SessionStart, PostToolUse, SubagentStop, TaskCompleted,
# TeammateIdle with canonical entries adjusted to point at
# "<ClaudeHome>/scripts/<basename>" (argument-free). Removes any hook entry
# (any event) that references analyze-prompt.js or a $CLAUDE_* token other
# than ${CLAUDE_PLUGIN_ROOT}. All other top-level keys (model, effortLevel,
# permissions, theme, autoCompactEnabled, ...) and unrelated hook events are
# preserved byte-for-byte — only the "hooks" key is ever touched. Because
# canonical events are replaced wholesale rather than appended to, re-running
# this function is idempotent: it never produces duplicate hook entries.
function Invoke-WireHooks {
  # Note: uses Write-Host (not Write-Error) for failures on purpose — under
  # $ErrorActionPreference = 'Stop' (set at script scope), Write-Error is a
  # terminating error and would abort the whole run instead of letting the
  # caller decide; a failed hook wiring must not take down the rest of an
  # otherwise-successful install.
  if (-not (Test-Path -LiteralPath $srcSettings)) {
    Write-Host "Error: canonical hook source not found: $srcSettings" -ForegroundColor Red
    return $false
  }

  $dstSettingsDir = Split-Path -Parent $dstSettings
  New-Item -ItemType Directory -Force -Path $dstSettingsDir | Out-Null

  $existed = $false
  $backupPath = $null

  if (Test-Path -LiteralPath $dstSettings) {
    $existed = $true

    try {
      Get-Content -LiteralPath $dstSettings -Raw | ConvertFrom-Json -ErrorAction Stop | Out-Null
    } catch {
      Write-Host "Error: $dstSettings is not valid JSON — cannot wire hooks. Repair or remove it manually first." -ForegroundColor Red
      return $false
    }

    $fixTimestamp = Get-Date -Format 'yyyy-MM-ddTHH-mm-ss'
    $backupDir = Join-Path (Join-Path (Join-Path $claudeHome 'backups') 'install-archives') "$fixTimestamp/settings"
    New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
    $backupPath = Join-Path $backupDir 'settings.json'
    Copy-Item -LiteralPath $dstSettings -Destination $backupPath -Force
    Write-Host "  backed up settings.json to $backupPath"
  } else {
    Write-Host "  $dstSettings not found — creating from canonical template"
  }

  $mergeScript = @'
const fs = require("fs");

const targetPath = process.env.CCGM_SETTINGS_TARGET;
const sourcePath = process.env.CCGM_SETTINGS_SOURCE;
const claudeHome = process.env.CCGM_CLAUDE_HOME;

const CANONICAL_EVENTS = ["SessionStart", "PostToolUse", "SubagentStop", "TaskCompleted", "TeammateIdle"];
// $CLAUDE_* token other than ${CLAUDE_PLUGIN_ROOT}
const FORBIDDEN_VAR_RE = /\$CLAUDE_(?!\{?PLUGIN_ROOT\b)/;
const ANALYZE_PROMPT_RE = /analyze-prompt\.js/;

const target = fs.existsSync(targetPath)
  ? JSON.parse(fs.readFileSync(targetPath, "utf8"))
  : {};
const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

// Rewrite canonical hook commands to point at the install scripts dir, with
// the resolved Claude home expanded at merge time (never a literal "~"). The
// canonical source (config/claude-settings.json) is repo-context and may
// reference its script either as "~/.claude/scripts/<name>.js" OR as a
// repo-relative "scripts/<name>.js" (e.g. PostToolUse) — both forms must
// normalize to the SAME absolute install location in the merged output,
// otherwise a relative path resolves against whatever cwd the session
// happens to be in and breaks outside the repo.
function adjustCommand(command) {
  let adjusted = command.replace(
    /(\S*)~\/\.claude\/scripts\/(\S+)/,
    (_m, prefix, basename) => `${prefix}${claudeHome}/scripts/${basename}`
  );
  adjusted = adjusted.replace(
    /(^|\s)scripts\/([^\s/]+\.js)(?=\s|$)/,
    (_m, lead, basename) => `${lead}${claudeHome}/scripts/${basename}`
  );
  return adjusted;
}

function adjustEntries(entries) {
  if (!Array.isArray(entries)) return entries;
  return entries.map(entry => {
    if (!entry || !Array.isArray(entry.hooks)) return entry;
    return {
      ...entry,
      hooks: entry.hooks.map(h => {
        if (h && typeof h.command === "string") {
          return { ...h, command: adjustCommand(h.command) };
        }
        return h;
      }),
    };
  });
}

// Extract the script basename ("session-start.js") from a hook command, used
// to recognize "this is a GodMode-managed hook" independent of the exact path
// prefix (which can drift across CLAUDE_HOME values or older installs).
// Returns null for commands with no *.js basename (e.g. a user's own
// "echo ..." hook), which is what keeps foreign hooks safe.
function basenameOf(command) {
  if (typeof command !== "string") return null;
  const m = command.match(/([^\/\s]+\.js)\b/);
  return m ? m[1] : null;
}

if (!target.hooks || typeof target.hooks !== "object") {
  target.hooks = {};
}

let eventsCreated = 0;
let eventsMerged = 0;
let foreignHooksPreserved = 0;
let staleGodmodeHooksReplaced = 0;

// 1. Per-event, per-entry merge: a foreign hook on e.g. SessionStart survives
//    ALONGSIDE the GodMode hook on SessionStart — canonical events are no
//    longer replaced wholesale. Any existing hook whose script basename
//    matches one this canonical event is about to (re-)install is dropped
//    first (dedup by command/basename — this is what keeps a second run from
//    producing duplicate GodMode entries; it also self-heals a stale path
//    from an older install). Everything else in the event survives.
//    Canonical entries are appended last and keep their internal hook order
//    exactly as authored in config/claude-settings.json (e.g. SubagentStop:
//    verify-changes.js before validate-agent-output.js — deterministic
//    checks before report validation).
for (const eventName of CANONICAL_EVENTS) {
  if (!(source.hooks && Object.prototype.hasOwnProperty.call(source.hooks, eventName))) {
    continue;
  }

  const canonicalEntries = adjustEntries(source.hooks[eventName]);
  const canonicalBasenames = new Set();
  for (const entry of canonicalEntries) {
    if (!entry || !Array.isArray(entry.hooks)) continue;
    for (const h of entry.hooks) {
      const bn = basenameOf(h && h.command);
      if (bn) canonicalBasenames.add(bn);
    }
  }

  const existingEntries = Array.isArray(target.hooks[eventName]) ? target.hooks[eventName] : [];
  const hadBefore = existingEntries.length > 0;

  const keptEntries = [];
  for (const entry of existingEntries) {
    if (!entry || !Array.isArray(entry.hooks)) {
      keptEntries.push(entry);
      continue;
    }
    const keptHooks = entry.hooks.filter(h => {
      const bn = basenameOf(h && h.command);
      if (bn && canonicalBasenames.has(bn)) {
        staleGodmodeHooksReplaced += 1;
        return false;
      }
      return true;
    });
    if (keptHooks.length > 0) {
      foreignHooksPreserved += keptHooks.length;
      keptEntries.push({ ...entry, hooks: keptHooks });
    }
  }

  target.hooks[eventName] = [...keptEntries, ...canonicalEntries];
  if (hadBefore) {
    eventsMerged += 1;
  } else {
    eventsCreated += 1;
  }
}

// 2. Remove any hook entry (any event) referencing analyze-prompt.js or a
//    forbidden $CLAUDE_* token. Operates on ALL events, not just the
//    canonical five, so pre-existing drift elsewhere is cleaned up too.
let offendingRemoved = 0;
for (const eventName of Object.keys(target.hooks)) {
  const entries = target.hooks[eventName];
  if (!Array.isArray(entries)) continue;

  const filteredEntries = [];
  for (const entry of entries) {
    if (!entry || !Array.isArray(entry.hooks)) {
      filteredEntries.push(entry);
      continue;
    }

    const filteredHooks = entry.hooks.filter(h => {
      const cmd = h && typeof h.command === "string" ? h.command : "";
      const offending = ANALYZE_PROMPT_RE.test(cmd) || FORBIDDEN_VAR_RE.test(cmd);
      if (offending) {
        offendingRemoved += 1;
        return false;
      }
      return true;
    });

    if (filteredHooks.length > 0) {
      filteredEntries.push({ ...entry, hooks: filteredHooks });
    }
  }

  if (filteredEntries.length > 0) {
    target.hooks[eventName] = filteredEntries;
  } else {
    delete target.hooks[eventName];
  }
}

if (
  Object.prototype.hasOwnProperty.call(target.hooks, "UserPromptSubmit") &&
  (!Array.isArray(target.hooks.UserPromptSubmit) || target.hooks.UserPromptSubmit.length === 0)
) {
  delete target.hooks.UserPromptSubmit;
}

const otherEventsKept = Object.keys(target.hooks).filter(e => !CANONICAL_EVENTS.includes(e)).length;

fs.writeFileSync(targetPath, JSON.stringify(target, null, 2) + "\n");

console.log(`  canonical events created: ${eventsCreated}`);
console.log(`  canonical events merged: ${eventsMerged}`);
console.log(`  foreign hook entries preserved: ${foreignHooksPreserved}`);
console.log(`  stale GodMode hook entries replaced: ${staleGodmodeHooksReplaced}`);
console.log(`  offending hook entries removed: ${offendingRemoved}`);
console.log(`  other hook events kept unchanged: ${otherEventsKept}`);
'@

  $scriptFile = [System.IO.Path]::GetTempFileName() + '.js'
  Set-Content -LiteralPath $scriptFile -Value $mergeScript -NoNewline -Encoding utf8

  $env:CCGM_SETTINGS_TARGET = $dstSettings
  $env:CCGM_SETTINGS_SOURCE = $srcSettings
  $env:CCGM_CLAUDE_HOME = $claudeHome
  try {
    & node $scriptFile
    $mergeExit = $LASTEXITCODE
  } finally {
    Remove-Item -LiteralPath $scriptFile -ErrorAction SilentlyContinue
    Remove-Item Env:\CCGM_SETTINGS_TARGET -ErrorAction SilentlyContinue
    Remove-Item Env:\CCGM_SETTINGS_SOURCE -ErrorAction SilentlyContinue
    Remove-Item Env:\CCGM_CLAUDE_HOME -ErrorAction SilentlyContinue
  }

  if ($mergeExit -ne 0) {
    Write-Host "Error: hook merge script failed (exit $mergeExit)" -ForegroundColor Red
    return $false
  }

  try {
    Get-Content -LiteralPath $dstSettings -Raw | ConvertFrom-Json -ErrorAction Stop | Out-Null
  } catch {
    Write-Host "Error: merge produced invalid JSON in $dstSettings — this should not happen. Restore from backup." -ForegroundColor Red
    return $false
  }

  Write-Host "  hook wiring complete: $dstSettings"
  if ($existed) {
    Write-Host "  backup: $backupPath"
  }
  return $true
}

$repoVersion = (Get-Content -LiteralPath $srcVersion -Raw).Trim()

# --- Standalone -FixHooks: only run the hook wiring, skip install/check ----

if ($FixHooks -and -not $Check -and -not $PSBoundParameters.ContainsKey('NoHooks') -and $PSBoundParameters.Count -eq 1) {
  Write-Host "Fixing hook wiring in $dstSettings" -ForegroundColor Cyan
  $ok = Invoke-WireHooks
  if ($ok) { exit 0 } else { exit 1 }
}

# --- Check mode ------------------------------------------------------------

if ($Check) {
  $failures = 0
  function Test-Item {
    param([string]$Path, [string]$Label)
    if (Test-Path -LiteralPath $Path) {
      Write-Host "[ok]      $Label"
    } else {
      Write-Host "[missing] $Label : $Path" -ForegroundColor Yellow
      $script:failures++
    }
  }

  Write-Host "Verifying CC_GodMode runtime in $claudeHome" -ForegroundColor Cyan

  # Agents: every repo agent must be installed and carry its name marker
  foreach ($a in Get-ChildItem -LiteralPath $srcAgents -Filter '*.md' -File) {
    $target = Join-Path $dstAgents $a.Name
    Test-Item $target "agent $($a.BaseName)"
    if (Test-Path -LiteralPath $target) {
      if (-not (Select-String -LiteralPath $target -Pattern "name: $($a.BaseName)" -SimpleMatch -Quiet)) {
        Write-Host "[invalid] agent $($a.BaseName) missing 'name:' marker" -ForegroundColor Yellow
        $failures++
      }
    }
  }

  # Skills: every repo skill dir must be installed with a SKILL.md
  foreach ($s in Get-ChildItem -LiteralPath $srcSkills -Directory) {
    $target = Join-Path (Join-Path $dstSkills $s.Name) 'SKILL.md'
    Test-Item $target "skill $($s.Name)"
  }

  # Scripts: the API-impact hook script is the canonical required script
  Test-Item (Join-Path $dstScripts 'check-api-impact.js') 'script check-api-impact.js'

  # Templates
  Test-Item $dstOrchestrator 'template CLAUDE-ORCHESTRATOR.md'
  Test-Item $dstProjectActivation 'template CCGM_Prompt_02-ProjectActivation.md'

  # License artifacts
  Test-Item $dstLicense 'LICENSE-CC_GodMode.txt'
  Test-Item $dstNotice 'NOTICE-CC_GodMode.txt'

  # Version marker
  if (Test-Path -LiteralPath $versionMarker) {
    $installed = (Get-Content -LiteralPath $versionMarker -Raw).Trim()
    if ($installed -eq $repoVersion) {
      Write-Host "[ok]      version $installed matches repository"
    } else {
      Write-Host "[stale]   installed version $installed != repository $repoVersion (run without -Check to update)" -ForegroundColor Yellow
      $failures++
    }
  } else {
    Write-Host "[missing] version marker (.cc-godmode-version)" -ForegroundColor Yellow
    $failures++
  }

  Write-Host ''
  if ($failures -gt 0) {
    Write-Host "CC_GodMode runtime check FAILED ($failures issue(s))." -ForegroundColor Red
    exit 1
  }
  Write-Host "CC_GodMode runtime check passed (v$repoVersion)." -ForegroundColor Green
  exit 0
}

# --- Install mode ----------------------------------------------------------

$timestamp  = Get-Date -Format 'yyyy-MM-ddTHH-mm-ss'
$backupRoot = Join-Path (Join-Path (Join-Path $claudeHome 'backups') 'install-archives') $timestamp

function Backup-IfExists {
  param([string]$Path, [string]$Category)
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $dir = Join-Path $backupRoot $Category
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Copy-Item -LiteralPath $Path -Destination $dir -Recurse -Force
  Write-Host "  backed up $(Split-Path -Leaf $Path)"
}

# Ensure target directories
foreach ($d in @($claudeHome, $dstAgents, $dstScripts, $dstSkills, $dstTemplates)) {
  New-Item -ItemType Directory -Force -Path $d | Out-Null
}

# Capture the previously installed version (if any) before the marker file is
# overwritten below, so the run can report an honest before/after at the end.
$oldVersion = ''
if (Test-Path -LiteralPath $versionMarker) {
  $oldVersion = (Get-Content -LiteralPath $versionMarker -Raw).Trim()
}

Write-Host "Installing CC_GodMode v$repoVersion into $claudeHome" -ForegroundColor Cyan

# Agents
Write-Host "Agents:"
foreach ($a in Get-ChildItem -LiteralPath $srcAgents -Filter '*.md' -File) {
  $target = Join-Path $dstAgents $a.Name
  Backup-IfExists $target 'agents'
  Copy-Item -LiteralPath $a.FullName -Destination $target -Force
}
Write-Host "  installed $((Get-ChildItem -LiteralPath $srcAgents -Filter '*.md' -File).Count) agent(s)"

# Scripts
Write-Host "Scripts:"
foreach ($s in Get-ChildItem -LiteralPath $srcScripts -Filter '*.js' -File) {
  $target = Join-Path $dstScripts $s.Name
  Backup-IfExists $target 'scripts'
  Copy-Item -LiteralPath $s.FullName -Destination $target -Force
}
Write-Host "  installed $((Get-ChildItem -LiteralPath $srcScripts -Filter '*.js' -File).Count) script(s)"

# Skills (one directory per skill)
Write-Host "Skills:"
foreach ($s in Get-ChildItem -LiteralPath $srcSkills -Directory) {
  $target = Join-Path $dstSkills $s.Name
  Backup-IfExists $target 'skills'
  New-Item -ItemType Directory -Force -Path $target | Out-Null
  foreach ($child in Get-ChildItem -LiteralPath $s.FullName -Force) {
    Copy-Item -LiteralPath $child.FullName -Destination $target -Recurse -Force
  }
}
Write-Host "  installed $((Get-ChildItem -LiteralPath $srcSkills -Directory).Count) skill(s)"

# Templates
Write-Host "Templates:"
Backup-IfExists $dstOrchestrator 'templates'
Copy-Item -LiteralPath $srcOrchestrator -Destination $dstOrchestrator -Force
Backup-IfExists $dstProjectActivation 'templates'
Copy-Item -LiteralPath $srcProjectActivation -Destination $dstProjectActivation -Force
Write-Host "  installed CLAUDE-ORCHESTRATOR.md + CCGM_Prompt_02-ProjectActivation.md"

# License artifacts
Write-Host "License:"
if (Test-Path -LiteralPath $srcLicense) {
  Backup-IfExists $dstLicense 'license'
  Copy-Item -LiteralPath $srcLicense -Destination $dstLicense -Force
  Write-Host "  installed LICENSE-CC_GodMode.txt"
}
if (Test-Path -LiteralPath $srcNotice) {
  Backup-IfExists $dstNotice 'license'
  Copy-Item -LiteralPath $srcNotice -Destination $dstNotice -Force
  Write-Host "  installed NOTICE-CC_GodMode.txt"
}

# Version marker
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($versionMarker, $repoVersion, $utf8NoBom)

Write-Host ''
Write-Host "Installed CC_GodMode v$repoVersion." -ForegroundColor Green
if (Test-Path -LiteralPath $backupRoot) {
  Write-Host "Previous files archived under: $backupRoot"
}
Write-Host "Verify with: .\scripts\apply-global-claude-setup.ps1 -Check"

if ([string]::IsNullOrEmpty($oldVersion)) {
  Write-Host "fresh install: $repoVersion"
} elseif ($oldVersion -eq $repoVersion) {
  Write-Host "already up to date (v$repoVersion)"
} else {
  Write-Host "updated: $oldVersion -> $repoVersion"
}

Write-Host ''
if ($NoHooks) {
  Write-Host "Note: -NoHooks set — settings.json hook wiring was skipped; settings.json was not touched."
  Write-Host "      MCP servers (memory, playwright, ...) are not installed by this script; see scripts/install-mcps.sh."
} else {
  Write-Host "Wiring hooks into $($dstSettings):"
  $ok = Invoke-WireHooks
  if (-not $ok) {
    Write-Warning "hook wiring failed (see message above); rest of the install is unaffected."
  }
  Write-Host "Note: MCP servers (memory, playwright, ...) are not installed by this script; see scripts/install-mcps.sh."
}
