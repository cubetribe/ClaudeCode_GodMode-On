---
agent: ci-security-guardian
version: v7.0.0
date: 2026-06-11
status: REVIEW COMPLETE — verdict UNSAFE TO MERGE AS-IS (1 BLOCKER, 1 WARNING)
task: Adversarial security review of external community PR #21 (andreas-hafner, "Install Parity Release", 27 files, +990/−53)
---

# Security Review: PR #21 — VERDICT: DO NOT MERGE AS-IS

## Verdict Summary

| Surface | Verdict |
|---|---|
| `.github/CODEOWNERS` | **BLOCKER** |
| Installer scripts (sh + ps1) | SAFE with 1 WARNING + hardening suggestions |
| `agents/security.md` (new agent) | SAFE |
| Diffs to 8 existing agents + CLAUDE.md | SAFE |
| dependabot.yml / .gitignore / plugin.json | SAFE |
| Skills (greenfield-bootstrap, prototype-mode, meta-decisions) | SAFE |
| Install prompts | SAFE (local script paths only, no pipe-from-network) |

## BLOCKER

- `.github/CODEOWNERS` lines 6, 9–15: PR sets `@andreas-hafner` as **sole code owner of `*` (entire repo)** plus `/agents/`, `/skills/`, `/scripts/`, and the installer scripts themselves. An external contributor must never hold mandatory review authority over the paths that get installed into every user's `~/.claude`. As written, future PRs touching agents or the installer could pass review without cubetribe. CODEOWNERS must reference only `@cubetribe`.

## WARNING

- `scripts/apply-global-claude-setup.sh:128`: `chmod +x "${DST_SCRIPTS}"/*.js` makes ALL present and future `.js` files in `~/.claude/scripts/` executable — widens surface for a follow-on supply-chain step. Scope chmod to the files the script itself installs.

## Hardening suggestions (non-blocking)

- `apply-global-claude-setup.sh:19` and `.ps1:50`: `CLAUDE_HOME` env override has no path validation (`CLAUDE_HOME=/etc` would redirect all writes). Add a sanity check (resolved path under `$HOME` or explicit confirm).
- Uninstall brace-expansion in 01-Auto prompt is fragile; advise users to run `--check` after uninstall.

## Positive findings

- Scripts: NO network calls, no pipe-to-shell, no eval/base64/obfuscation, no sudo, no credential reads, no PATH/profile/persistence manipulation. Idempotent+archive claim verified in code (`backup_if_exists` before every `cp`). Operations confined to `~/.claude` + backups subtree.
- `agents/security.md`: read-only reviewer (Read, Grep, Glob, Bash — same as @validator), no Write/Edit, no auto-approve/injection patterns, reports to @builder instead of executing. Well-formed severity model. Additive.
- Agent diffs: only frontmatter description expansions ("Use proactively when…"). No tool/model/routing changes. Hard rules untouched.
- Author profile plausible (account since 2022, 30 public repos, real name).

## Supersede / cherry-pick assessment vs PR #22 (v7.0.0)

- **(a) Superseded by #22:** VERSION 6.4.0, CLAUDE.md version header, most agent description tweaks, plugin.json version.
- **(b) Genuinely valuable (cherry-pick candidates):** installer scripts with `--check` verify mode, `agents/security.md` as additional quality gate, `skills/greenfield-bootstrap/`, `dependabot.yml`.
- **(c) Conflicting (manual resolution needed):** CODEOWNERS (blocker — rewrite), CLAUDE.md, plugin.json, VERSION, CHANGELOG, meta-decisions skill.

## Recommended action

Do not merge #21 as-is. Cherry-pick the valuable artifacts onto a clean branch based on v7.0.0 (after #22 merges), rewrite CODEOWNERS to `@cubetribe` only, fix the chmod scope and CLAUDE_HOME validation, credit @andreas-hafner in CHANGELOG/PR. Suggested as release v7.1.0.
