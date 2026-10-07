---
agent: researcher
date: 2026-10-05
sources:
  - https://raw.githubusercontent.com/anthropics/claude-code/main/CHANGELOG.md
  - https://code.claude.com/docs/en/model-config
  - https://code.claude.com/docs/en/hooks
  - https://code.claude.com/docs/en/sub-agents
  - https://code.claude.com/docs/en/skills
  - https://code.claude.com/docs/en/plugins-reference
  - https://code.claude.com/docs/en/workflows
  - https://code.claude.com/docs/en/agent-teams
---

# Claude Code changes Jul-Oct 2026 relevant to CC_GodMode

Caveat: WebFetch output is summarized by a small model. The CHANGELOG extract is a highlight list, not exhaustive. Items not in the fetched pages are UNVERIFIED. No exact release dates were returned.

## 1. Subagent frontmatter and models
Source: https://code.claude.com/docs/en/sub-agents
- Fields: `name`, `description` (required); `model`, `tools`, `disallowedTools`, `effort`, `permissionMode`, `maxTurns` (v2.1.246+), `background`, `omitClaudeMd` (v2.1.271+), `isolation: worktree`, `memory: user|project|local`, `skills`, `mcpServers`, `hooks`, `initialPrompt`, `color`, `experimental.cacheTtl` (5m|1h, v2.1.248+).
- `model` values: `sonnet|opus|haiku|fable|inherit` or full ID (e.g. `claude-opus-5-5`). `best` and `opusplan` are NOT listed for subagent frontmatter (UNVERIFIED whether accepted; they are documented as /model aliases only).
- `effort` valid: `low|medium|high|xhigh|max` (levels depend on model).
- `permissionMode` adds `manual` (alias of default, v2.1.200+). Plugin subagents ignore `hooks`, `mcpServers`, `permissionMode`.
- Model resolution order changed in v2.1.251: per-invocation param > frontmatter > `CLAUDE_CODE_SUBAGENT_MODEL` > main model (env var was first before). `CLAUDE_CODE_SUBAGENT_MODEL_FORCE=1` (v2.1.257+) forces env var over frontmatter (agent-teams page).
- `teammateDefaultModel` setting removed in v2.1.234 (https://code.claude.com/docs/en/agent-teams).

## 2. Model aliases (https://code.claude.com/docs/en/model-config)
- `best` = Fable (5.1, or 5 per provider) where available, else Opus 5.5.
- `fable` = Fable 5.1 default. `opus` = Opus 5.5. `sonnet` = Sonnet 5.5 (CHANGELOG v2.1.284: Sonnet 5.5 default, 1M ctx, $2/$10). `haiku` = latest Haiku. `default` = Opus 5.5 on most plans. `opusplan` = Opus in plan mode, Sonnet for execution.
- So the package's "Opus 4.8 + Fable 5" assumption is stale: now Opus 5.5, Sonnet 5.5, Fable 5.1.
- Effort: Fable 5.1/5, Opus 5.5/5/4.8/4.7, Sonnet 5.5/5 support `low|medium|high|xhigh|max`; 4.6 models lack `xhigh`. Default effort is `medium` on Opus 5.5 and Sonnet 5.5 (new), `high` elsewhere. Interactive sessions default to auto permission mode (CHANGELOG v2.1.283).

## 3. Hooks (https://code.claude.com/docs/en/hooks)
- `TaskCompleted` and `TeammateIdle` are STILL valid (also confirmed on agent-teams page); both can block with exit 2. Docs state no deprecated events.
- Full list: SessionStart, Setup, SessionEnd, UserPromptSubmit, UserPromptExpansion, Stop, StopFailure, PreToolUse, PostToolUse, PostToolUseFailure, PostToolBatch, PermissionRequest, PermissionDenied, SubagentStart, SubagentStop, TeammateIdle, TaskCreated, TaskCompleted, FileChanged, CwdChanged, DirectoryAdded, ConfigChange, InstructionsLoaded, WorktreeCreate, WorktreeRemove, MessageDisplay, Notification, PreCompact, PostCompact, PreModelSwitch, PostModelSwitch, Elicitation, ElicitationResult.
- New vs package: TaskCreated, PostToolBatch, PostToolUseFailure, StopFailure, PermissionDenied, UserPromptExpansion, Pre/PostModelSwitch, MessageDisplay, Setup, DirectoryAdded.
- Common input now includes `prompt_id`, `scratchpad_dir`, `effort.level`, `agent_id`, `agent_type`. Hook types: `command|http|mcp_tool|prompt|agent`; `async`/`asyncRewake`; exec-form `args` (plugins-reference). PostToolUse output supports `updatedToolOutput`.
- CHANGELOG v2.1.289/v2.1.288: one agent id across plugin hook events; plugin `tool.call` hook mentioned (UNVERIFIED semantics).

## 4. Skills and plugins
- SKILL.md (https://code.claude.com/docs/en/skills): fields `name, description, when_to_use, argument-hint, arguments, disable-model-invocation, user-invocable, allowed-tools, disallowed-tools, model, effort, context (fork), agent, background, hooks, paths, shell, metadata, license, compatibility`. `license` accepted, not acted on. Unknown fields silently ignored in Claude Code, but a hard error when packaging for claude.ai (allowed there: name, description, license, compatibility, metadata, allowed-tools). Booleans accept yes/on/1 (v2.1.218+). No deprecated fields; `commands/` still works but skills preferred.
- plugin.json (https://code.claude.com/docs/en/plugins-reference): only `name` required. New fields: `displayName`, `defaultEnabled`, `dependencies`, `settings` (only `agent`, `subagentStatusLine`), `userConfig` (`options` v2.1.271+), `channels`, `workflows` (dir `workflows/`), `outputStyles`, `lspServers`, `metadata` (v2.1.222+), `experimental.{themes,monitors,evals}`, directory-listing fields (`icon`, `documentationUrl`, `supportUrl`, `privacyPolicyUrl`, `termsOfServiceUrl`). Unknown top-level keys are stripped (warning); strict objects reject unknown keys. Paths must start with `./`. Names starting `claude-`, `anthropic-`, `cc-plugin-` etc. are errors in `claude plugin validate`. `claude plugin validate [--strict]` is the authoritative check. CHANGELOG v2.1.285: `claude plugin install --config`; v2.1.282 reverted the `claude-ai` name reservation.

## 5. Workflows / ultracode / teams / agent view
- Dynamic workflows: documented as normal feature, no "preview" label; available on all paid plans, API, Bedrock, Vertex, Foundry; Pro enables via /config. Script-based (`agent()`, `pipeline()`, `parallel()`, `phase()`), `/workflows`, `/deep-research` bundled, `/workflow-authoring` skill (v2.1.248+), plugin `workflows/`. Limits: 16 concurrent agents default (env `CLAUDE_CODE_WORKFLOW_MAX_CONCURRENT_AGENTS` 1-256), 1,000 agents/run. Disable: `disableWorkflows`, `CLAUDE_CODE_DISABLE_WORKFLOWS=1`. Size guideline `workflowSizeGuideline` (unrestricted|small|medium|large). (https://code.claude.com/docs/en/workflows)
- Ultracode: orchestration toggle, not an effort level. `/effort ultracode [on|off]`, keyword `ultracode` in a prompt triggers a one-off workflow (not via -p or relayed content, v2.1.210+). CONFLICT: model-config/workflows pages say `claude --effort ultracode` sets xhigh; CHANGELOG v2.1.284 says it no longer forces xhigh and stays on at any effort. Treat as UNVERIFIED which is current; changelog is newer.
- Agent teams: STILL experimental, off by default; needs `CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`. When enabled, a named subagent launches as a teammate. No nested teams, one team per session. Hooks TeammateIdle/TaskCreated/TaskCompleted apply. (https://code.claude.com/docs/en/agent-teams)
- Agent view (`claude agents`): exists with docs page /docs/en/agent-view (referenced); CHANGELOG v2.1.286-287 shows active development (`n:` filter). Preview/GA status UNVERIFIED (page not fetched).

## 6. Deprecations / removals found
- `teammateDefaultModel` removed (v2.1.234).
- Env-var-first subagent model order reversed (v2.1.251).
- Top-level plugin `themes`/`monitors` keys deprecated in favor of `experimental.*` (warning only).
- No hook events or skill fields deprecated.

## Not verified
Exact release dates, full CHANGELOG (only a summary was obtained), `best`/`opusplan` in subagent `model`, agent-view GA status, Opus 4.8 retirement dates.
