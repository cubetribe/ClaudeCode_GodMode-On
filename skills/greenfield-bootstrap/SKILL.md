---
name: greenfield-bootstrap
description: "Bootstrap repo-local governance before CC_GodMode workflows run in an empty, newly initialized, or undocumented workspace. Use proactively when a project has no CLAUDE.md, no README, or no clear structure yet."
---

# Greenfield Bootstrap

Use this skill before the normal `workflows` pipeline when the current workspace is
empty, newly initialized, or missing the local governance needed for safe multi-step
implementation. It establishes just enough structure that `@architect` and `@builder`
have firm ground to stand on.

## Required outcome

- a minimal, truthful repo-local constitution before feature work starts
- structure that is tied to the *actual* project, not an invented one
- small enough that it can realistically stay maintained

## Default route

1. **Inspect** the workspace and confirm what already exists (files, language,
   package manager, VCS state). Do not assume.
2. **Create the smallest governance surface needed:**
   - a project `CLAUDE.md` (copy `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` and trim
     to the project) so the Orchestrator and agents have rules
   - a basic `README.md` with purpose + how to run, if none exists
   - a `VERSION` file (start at `0.1.0`) so the version-first rule has an anchor
   - validation and release notes for the touched scope (how tests run, how releases
     are cut — even if "none yet")
3. **Make structure explicit** — where source, config, tests, and docs belong.
4. **Hand off** — once the constitution exists, continue under the normal `workflows`
   pipeline (`@architect` first for any real feature).

## Core rules

- Do **not** invent architecture the project has not chosen yet — record decisions
  as they are made via `@architect`, not preemptively.
- Prefer durable markdown guidance over chat-only agreements.
- Keep initial rules short enough to stay maintained.
- Still honor CC_GodMode core rules: version-first, never push without permission,
  delegate via the `Task` tool.

## Hand-off targets

| After bootstrap | Use |
|-----------------|-----|
| First real feature | `workflows` → Feature workflow (`@architect` → `@builder` → gates) |
| Security-sensitive scaffolding | route gates through `@security` |
| Throwaway spike instead | `prototype-mode` skill |

## Do not use when

- the workspace already has clear local governance (`CLAUDE.md` + structure)
- the task is only a one-off answer with no lasting repo changes
