#Requires -Version 5.1
<#
.SYNOPSIS
  Install (or verify) the CC_GodMode runtime into the user-level Claude home (~/.claude).

.DESCRIPTION
  Idempotent installer that mirrors the repository's agents, scripts, skills, and
  templates into ~/.claude. Existing files are backed up (timestamped) before being
  overwritten, so a re-run after `git pull` safely brings the runtime up to date.

.PARAMETER Check
  Verify the installed runtime instead of installing. Exits non-zero on any drift.

.PARAMETER ClaudeHome
  Override the target Claude home directory (default: $env:CLAUDE_HOME or ~/.claude).

.PARAMETER Repo
  Override the repository root used as the install source (default: this script's parent).

.EXAMPLE
  .\scripts\apply-global-claude-setup.ps1
  Install/refresh the runtime in ~/.claude.

.EXAMPLE
  .\scripts\apply-global-claude-setup.ps1 -Check
  Verify the installed runtime matches the repository.
#>
[CmdletBinding()]
param(
  [switch]$Check,
  [string]$ClaudeHome,
  [string]$Repo
)

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

# Target locations in ~/.claude
$dstAgents    = Join-Path $claudeHome 'agents'
$dstScripts   = Join-Path $claudeHome 'scripts'
$dstSkills    = Join-Path $claudeHome 'skills'
$dstTemplates = Join-Path $claudeHome 'templates'
$dstOrchestrator = Join-Path $dstTemplates 'CLAUDE-ORCHESTRATOR.md'
$dstProjectActivation = Join-Path $dstTemplates 'CCGM_Prompt_02-ProjectActivation.md'
$versionMarker = Join-Path $claudeHome '.cc-godmode-version'

$repoVersion = (Get-Content -LiteralPath $srcVersion -Raw).Trim()

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

# Version marker
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllText($versionMarker, $repoVersion, $utf8NoBom)

Write-Host ''
Write-Host "Installed CC_GodMode v$repoVersion." -ForegroundColor Green
if (Test-Path -LiteralPath $backupRoot) {
  Write-Host "Previous files archived under: $backupRoot"
}
Write-Host "Verify with: .\scripts\apply-global-claude-setup.ps1 -Check"
Write-Host "Note: MCP servers (memory, playwright, ...) and settings.json hooks are NOT touched by this script."
Write-Host "      See CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md for those optional steps."
