#!/usr/bin/env bash
#
# Install (or verify) the CC_GodMode runtime into the user-level Claude home (~/.claude).
#
# Idempotent installer that mirrors the repository's agents, scripts, skills, and
# templates into ~/.claude. Existing files are backed up (timestamped) before being
# overwritten, so a re-run after `git pull` safely brings the runtime up to date.
#
# Usage:
#   ./scripts/apply-global-claude-setup.sh                 Install/refresh the runtime
#   ./scripts/apply-global-claude-setup.sh --check          Verify the installed runtime
#   ./scripts/apply-global-claude-setup.sh --fix-hooks      Repair ~/.claude/settings.json hook wiring only
#   ./scripts/apply-global-claude-setup.sh --fix-hooks ...  Composes with a normal install run
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
SRC_SETTINGS="${REPO_ROOT}/config/claude-settings.json"
REPO_VERSION="$(tr -d ' \t\r\n' < "${REPO_ROOT}/VERSION")"

DST_AGENTS="${CLAUDE_HOME}/agents"
DST_SCRIPTS="${CLAUDE_HOME}/scripts"
DST_SKILLS="${CLAUDE_HOME}/skills"
DST_TEMPLATES="${CLAUDE_HOME}/templates"
DST_ORCHESTRATOR="${DST_TEMPLATES}/CLAUDE-ORCHESTRATOR.md"
DST_PROJECT_ACTIVATION="${DST_TEMPLATES}/CCGM_Prompt_02-ProjectActivation.md"
DST_SETTINGS="${CLAUDE_HOME}/settings.json"
VERSION_MARKER="${CLAUDE_HOME}/.cc-godmode-version"

# --- --fix-hooks: repair ~/.claude/settings.json hook wiring ---------------
#
# Backs up settings.json (timestamped), then merges the canonical `hooks`
# object from config/claude-settings.json into it via an embedded `node -e`
# (parse -> modify -> JSON.stringify, never regex-edit JSON). Replaces/inserts
# SessionStart, PostToolUse, SubagentStop, TaskCompleted, TeammateIdle with
# canonical entries adjusted to point at "${CLAUDE_HOME}/scripts/<basename>"
# (argument-free). Removes any hook entry (any event) that references
# analyze-prompt.js or a $CLAUDE_* token other than ${CLAUDE_PLUGIN_ROOT}.
# All other top-level keys and unrelated hook events are preserved byte-for-byte
# (JSON round-trip). Non-zero exit here is scoped to this step only.
fix_hooks() {
  echo "Fixing hook wiring in ${DST_SETTINGS}"

  if [[ ! -f "${DST_SETTINGS}" ]]; then
    echo "Error: ${DST_SETTINGS} not found — cannot fix hooks (nothing to merge into)." >&2
    return 1
  fi

  if ! node -e "JSON.parse(require('fs').readFileSync(process.argv[1], 'utf8'))" "${DST_SETTINGS}" 2>/dev/null; then
    echo "Error: ${DST_SETTINGS} is not valid JSON — cannot fix hooks. Repair or remove it manually first." >&2
    return 1
  fi

  if [[ ! -f "${SRC_SETTINGS}" ]]; then
    echo "Error: canonical hook source not found: ${SRC_SETTINGS}" >&2
    return 1
  fi

  local fix_timestamp backup_dir backup_path
  fix_timestamp="$(date +%Y-%m-%dT%H-%M-%S)"
  backup_dir="${CLAUDE_HOME}/backups/install-archives/${fix_timestamp}/settings"
  mkdir -p "${backup_dir}"
  backup_path="${backup_dir}/settings.json"
  cp -p "${DST_SETTINGS}" "${backup_path}"
  echo "  backed up settings.json to ${backup_path}"

  CCGM_SETTINGS_TARGET="${DST_SETTINGS}" \
  CCGM_SETTINGS_SOURCE="${SRC_SETTINGS}" \
  CCGM_CLAUDE_HOME="${CLAUDE_HOME}" \
  node -e '
    const fs = require("fs");

    const targetPath = process.env.CCGM_SETTINGS_TARGET;
    const sourcePath = process.env.CCGM_SETTINGS_SOURCE;
    const claudeHome = process.env.CCGM_CLAUDE_HOME;

    const CANONICAL_EVENTS = ["SessionStart", "PostToolUse", "SubagentStop", "TaskCompleted", "TeammateIdle"];
    // $CLAUDE_* token other than ${CLAUDE_PLUGIN_ROOT}
    const FORBIDDEN_VAR_RE = /\$CLAUDE_(?!\{?PLUGIN_ROOT\b)/;
    const ANALYZE_PROMPT_RE = /analyze-prompt\.js/;

    const target = JSON.parse(fs.readFileSync(targetPath, "utf8"));
    const source = JSON.parse(fs.readFileSync(sourcePath, "utf8"));

    // Rewrite canonical hook commands to point at the install scripts dir,
    // with $HOME expanded at merge time (never a literal "~"). The canonical
    // source (config/claude-settings.json) is repo-context and may reference
    // its script either as "~/.claude/scripts/<name>.js" (already absolute-ish)
    // OR as a repo-relative "scripts/<name>.js" (e.g. PostToolUse) — both forms
    // must normalize to the SAME absolute install location in the merged
    // output, otherwise a relative path resolves against whatever cwd the
    // session happens to be in and breaks outside the repo.
    function adjustCommand(command) {
      // Form 1: "~/.claude/scripts/<name>.js" -> "$CLAUDE_HOME/scripts/<name>.js"
      let adjusted = command.replace(
        /(\S*)~\/\.claude\/scripts\/(\S+)/,
        (_m, prefix, basename) => `${prefix}${claudeHome}/scripts/${basename}`
      );
      // Form 2: repo-relative "scripts/<name>.js" (not already ~/.claude- or
      // absolute-prefixed) -> "$CLAUDE_HOME/scripts/<name>.js"
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

    if (!target.hooks || typeof target.hooks !== "object") {
      target.hooks = {};
    }

    let replaced = 0;
    let inserted = 0;
    let removed = 0;
    let kept = 0;

    // 1. Replace/insert canonical events with adjusted canonical entries.
    for (const eventName of CANONICAL_EVENTS) {
      const hadBefore = Object.prototype.hasOwnProperty.call(target.hooks, eventName);
      if (source.hooks && Object.prototype.hasOwnProperty.call(source.hooks, eventName)) {
        target.hooks[eventName] = adjustEntries(source.hooks[eventName]);
        if (hadBefore) {
          replaced += 1;
        } else {
          inserted += 1;
        }
      }
    }

    // 2. Remove any hook entry (any event) referencing analyze-prompt.js or a
    //    forbidden $CLAUDE_* token. Operates on ALL events, not just the
    //    canonical five, so pre-existing drift elsewhere is cleaned up too.
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
            removed += 1;
            return false;
          }
          return true;
        });

        if (filteredHooks.length > 0) {
          filteredEntries.push({ ...entry, hooks: filteredHooks });
        }
        // entries whose hooks array became empty are dropped entirely
      }

      if (filteredEntries.length > 0) {
        target.hooks[eventName] = filteredEntries;
      } else {
        delete target.hooks[eventName];
      }
    }

    // Drop UserPromptSubmit entirely if it became empty (or was already absent).
    if (
      Object.prototype.hasOwnProperty.call(target.hooks, "UserPromptSubmit") &&
      (!Array.isArray(target.hooks.UserPromptSubmit) || target.hooks.UserPromptSubmit.length === 0)
    ) {
      delete target.hooks.UserPromptSubmit;
    }

    kept = Object.keys(target.hooks).filter(e => !CANONICAL_EVENTS.includes(e)).length;

    fs.writeFileSync(targetPath, JSON.stringify(target, null, 2) + "\n");

    console.log(`  canonical events replaced: ${replaced}`);
    console.log(`  canonical events inserted: ${inserted}`);
    console.log(`  offending hook entries removed: ${removed}`);
    console.log(`  other hook events kept unchanged: ${kept}`);
  '

  echo "  hook wiring fixed: ${DST_SETTINGS}"
  echo "  backup: ${backup_path}"
  return 0
}

# --- Argument parsing --------------------------------------------------------
#
# --fix-hooks composes with a normal install run AND works standalone
# (`apply-global-claude-setup.sh --fix-hooks` = only the hook fix, no install).

DO_CHECK=0
DO_FIX_HOOKS=0
OTHER_ARGS=0

for arg in "$@"; do
  case "${arg}" in
    --check|-Check|--Check)
      DO_CHECK=1
      ;;
    --fix-hooks)
      DO_FIX_HOOKS=1
      ;;
    *)
      OTHER_ARGS=$((OTHER_ARGS + 1))
      ;;
  esac
done

if [[ "${DO_FIX_HOOKS}" -eq 1 && "${DO_CHECK}" -eq 0 && "$#" -eq 1 ]]; then
  # Standalone --fix-hooks: only run the hook fix, skip install/check.
  fix_hooks
  exit $?
fi

# --- Check mode ------------------------------------------------------------

if [[ "${DO_CHECK}" -eq 1 ]]; then
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

if [[ "${DO_FIX_HOOKS}" -eq 1 ]]; then
  echo
  fix_hooks || echo "Warning: --fix-hooks step failed (see message above); rest of the install is unaffected." >&2
else
  echo "Note: MCP servers (memory, playwright, ...) and settings.json hooks are NOT touched by this script."
  echo "      Run with --fix-hooks to repair broken hook wiring, or see CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md."
fi
