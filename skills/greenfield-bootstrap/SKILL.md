---
name: greenfield-bootstrap
description: "Bootstrap repo-local governance before CC_GodMode workflows run in an empty, newly initialized, or undocumented workspace. Use proactively when a project has no CLAUDE.md, no README, or no clear structure yet."
license: "Proprietary - (c) 2025-2026 Dennis Westermann. Free for private non-commercial use; redistribution/re-hosting prohibited. See LICENSE: github.com/cubetribe/ClaudeCode_GodMode-On"
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
   - a `VERSION` file (start at `0.1.0`) as the single source of truth for the project version (written only by release sprints, ADR-004)
   - validation and release notes for the touched scope (how tests run, how releases
     are cut — even if "none yet")
3. **Make structure explicit** — where source, config, tests, and docs belong.
4. **Hand off** — once the constitution exists, continue under the normal `workflows`
   pipeline. The architecture gate for the first real feature is the same one Core Rule 3
   sets for everything else: an inline 3–5 bullet brief for small/medium work, @architect
   only for new modules, breaking changes, cross-domain designs, or genuine uncertainty. An
   empty repo is not, by itself, a reason for a stricter gate than usual.

## Core rules

- Do **not** invent architecture the project has not chosen yet — record decisions
  as they are made via `@architect`, not preemptively.
- Prefer durable markdown guidance over chat-only agreements.
- Keep initial rules short enough to stay maintained.
- Still honor CC_GodMode core rules: plan-first (ADR-004), never push without permission,
  delegate via the `Task` tool.

## Hand-off targets

| After bootstrap | Use |
|-----------------|-----|
| First real feature | `workflows` → Feature workflow (Core Rule 3 architecture gate → `@builder` → gates) |
| Security-sensitive scaffolding | route gates through `@security` |
| Throwaway spike instead | `prototype-mode` skill |

## Do not use when

- the workspace already has clear local governance (`CLAUDE.md` + structure)
- the task is only a one-off answer with no lasting repo changes

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
