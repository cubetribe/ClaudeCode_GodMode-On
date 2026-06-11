#!/usr/bin/env bash
#
# Install (or verify) the CC_GodMode runtime into the user-level Claude home (~/.claude).
#
# Idempotent installer that mirrors the repository's agents, scripts, skills, and
# templates into ~/.claude. Existing files are backed up (timestamped) before being
# overwritten, so a re-run after `git pull` safely brings the runtime up to date.
#
# Usage:
#   ./scripts/apply-global-claude-setup.sh           Install/refresh the runtime
#   ./scripts/apply-global-claude-setup.sh --check   Verify the installed runtime
#
# Environment:
#   CLAUDE_HOME   Override the target Claude home (default: ~/.claude)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." >/dev/null 2>&1 && pwd)"
CLAUDE_HOME="${CLAUDE_HOME:-${HOME}/.claude}"

# --- CLAUDE_HOME validation ------------------------------------------------

if [[ -z "${CLAUDE_HOME}" ]]; then
  echo "Error: CLAUDE_HOME must not be empty." >&2
  exit 1
fi

if [[ "${CLAUDE_HOME}" != /* ]]; then
  echo "Error: CLAUDE_HOME must be an absolute path (got: '${CLAUDE_HOME}')." >&2
  exit 1
fi

if [[ "${CLAUDE_HOME}" == "/" ]]; then
  echo "Error: CLAUDE_HOME must not be the filesystem root '/'." >&2
  exit 1
fi

SRC_AGENTS="${REPO_ROOT}/agents"
SRC_SCRIPTS="${REPO_ROOT}/scripts"
SRC_SKILLS="${REPO_ROOT}/skills"
SRC_ORCHESTRATOR="${REPO_ROOT}/CLAUDE.md"
SRC_PROJECT_ACTIVATION="${REPO_ROOT}/CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md"
REPO_VERSION="$(tr -d ' \t\r\n' < "${REPO_ROOT}/VERSION")"

DST_AGENTS="${CLAUDE_HOME}/agents"
DST_SCRIPTS="${CLAUDE_HOME}/scripts"
DST_SKILLS="${CLAUDE_HOME}/skills"
DST_TEMPLATES="${CLAUDE_HOME}/templates"
DST_ORCHESTRATOR="${DST_TEMPLATES}/CLAUDE-ORCHESTRATOR.md"
DST_PROJECT_ACTIVATION="${DST_TEMPLATES}/CCGM_Prompt_02-ProjectActivation.md"
VERSION_MARKER="${CLAUDE_HOME}/.cc-godmode-version"

# --- Check mode ------------------------------------------------------------

if [[ "${1:-}" == "--check" || "${1:-}" == "-Check" || "${1:-}" == "--Check" ]]; then
  failures=0
  ok()      { printf '[ok]      %s\n' "$1"; }
  missing() { printf '[missing] %s\n' "$1"; failures=$((failures + 1)); }
  invalid() { printf '[invalid] %s\n' "$1"; failures=$((failures + 1)); }

  echo "Verifying CC_GodMode runtime in ${CLAUDE_HOME}"

  for a in "${SRC_AGENTS}"/*.md; do
    name="$(basename "${a}" .md)"
    target="${DST_AGENTS}/${name}.md"
    if [[ -f "${target}" ]]; then
      ok "agent ${name}"
      grep -q "name: ${name}" "${target}" || invalid "agent ${name} missing 'name:' marker"
    else
      missing "agent ${name} : ${target}"
    fi
  done

  for s in "${SRC_SKILLS}"/*/; do
    name="$(basename "${s}")"
    target="${DST_SKILLS}/${name}/SKILL.md"
    [[ -f "${target}" ]] && ok "skill ${name}" || missing "skill ${name} : ${target}"
  done

  [[ -f "${DST_SCRIPTS}/check-api-impact.js" ]] && ok "script check-api-impact.js" || missing "script check-api-impact.js"
  [[ -f "${DST_ORCHESTRATOR}" ]] && ok "template CLAUDE-ORCHESTRATOR.md" || missing "template CLAUDE-ORCHESTRATOR.md"
  [[ -f "${DST_PROJECT_ACTIVATION}" ]] && ok "template CCGM_Prompt_02-ProjectActivation.md" || missing "template CCGM_Prompt_02-ProjectActivation.md"

  if [[ -f "${VERSION_MARKER}" ]]; then
    installed="$(tr -d ' \t\r\n' < "${VERSION_MARKER}")"
    if [[ "${installed}" == "${REPO_VERSION}" ]]; then
      ok "version ${installed} matches repository"
    else
      invalid "installed version ${installed} != repository ${REPO_VERSION} (run without --check to update)"
    fi
  else
    missing "version marker (.cc-godmode-version)"
  fi

  echo
  if [[ "${failures}" -gt 0 ]]; then
    echo "CC_GodMode runtime check FAILED (${failures} issue(s))."
    exit 1
  fi
  echo "CC_GodMode runtime check passed (v${REPO_VERSION})."
  exit 0
fi

# --- Install mode ----------------------------------------------------------

TIMESTAMP="$(date +%Y-%m-%dT%H-%M-%S)"
BACKUP_ROOT="${CLAUDE_HOME}/backups/install-archives/${TIMESTAMP}"

backup_if_exists() {
  local path="$1" category="$2"
  [[ -e "${path}" ]] || return 0
  mkdir -p "${BACKUP_ROOT}/${category}"
  cp -R "${path}" "${BACKUP_ROOT}/${category}/"
  printf '  backed up %s\n' "$(basename "${path}")"
}

mkdir -p "${DST_AGENTS}" "${DST_SCRIPTS}" "${DST_SKILLS}" "${DST_TEMPLATES}"

echo "Installing CC_GodMode v${REPO_VERSION} into ${CLAUDE_HOME}"

echo "Agents:"
agent_count=0
for a in "${SRC_AGENTS}"/*.md; do
  target="${DST_AGENTS}/$(basename "${a}")"
  backup_if_exists "${target}" agents
  cp -p "${a}" "${target}"
  agent_count=$((agent_count + 1))
done
echo "  installed ${agent_count} agent(s)"

echo "Scripts:"
script_count=0
for s in "${SRC_SCRIPTS}"/*.js; do
  target="${DST_SCRIPTS}/$(basename "${s}")"
  backup_if_exists "${target}" scripts
  cp -p "${s}" "${target}"
  script_count=$((script_count + 1))
done
# Copy the install script itself, preserving its exec bit
if [[ -f "${SRC_SCRIPTS}/install-mcps.sh" ]]; then
  target="${DST_SCRIPTS}/install-mcps.sh"
  backup_if_exists "${target}" scripts
  cp -p "${SRC_SCRIPTS}/install-mcps.sh" "${target}"
fi
echo "  installed ${script_count} script(s)"

echo "Skills:"
skill_count=0
for s in "${SRC_SKILLS}"/*/; do
  name="$(basename "${s}")"
  target="${DST_SKILLS}/${name}"
  backup_if_exists "${target}" skills
  mkdir -p "${target}"
  cp -Rp "${s}." "${target}/"
  skill_count=$((skill_count + 1))
done
echo "  installed ${skill_count} skill(s)"

echo "Templates:"
backup_if_exists "${DST_ORCHESTRATOR}" templates
cp -p "${SRC_ORCHESTRATOR}" "${DST_ORCHESTRATOR}"
backup_if_exists "${DST_PROJECT_ACTIVATION}" templates
cp -p "${SRC_PROJECT_ACTIVATION}" "${DST_PROJECT_ACTIVATION}"
echo "  installed CLAUDE-ORCHESTRATOR.md + CCGM_Prompt_02-ProjectActivation.md"

printf '%s' "${REPO_VERSION}" > "${VERSION_MARKER}"

echo
echo "Installed CC_GodMode v${REPO_VERSION}."
[[ -d "${BACKUP_ROOT}" ]] && echo "Previous files archived under: ${BACKUP_ROOT}"
echo "Verify with: ./scripts/apply-global-claude-setup.sh --check"
echo "Note: MCP servers (memory, playwright, ...) and settings.json hooks are NOT touched by this script."
echo "      See CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md for those optional steps."
