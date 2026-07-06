---
agent: workspace-governance
version: v7.0.0
date: 2026-06-11
status: APPROVED
task: Governance review of v7.0.0 "The Fable Release" — release law, semver class, two-release sequence, scope policy
---

# Governance Review: v7.0.0 — VERDICT: APPROVED

## Findings

1. **MAJOR classification justified.** Three independently MAJOR-qualifying items per `skills/release/SKILL.md:17` ("Breaking CLAUDE.md change → MAJOR"): (a) routing default inversion (Smart Routing replaces Full-Gates as default), (b) Core Rule 2 softened from "NEVER implement" to "delegate by default, trivial fixes allowed", (c) architecture gate split replacing a previously mandatory @architect invocation.

2. **Hard safety rules preserved verbatim-strength.** Rule 4 (@api-guardian MANDATORY) and Rule 9 (NEVER git push without explicit user permission) verified unchanged in CLAUDE.md, templates/CLAUDE-ORCHESTRATOR.md, and docs/orchestrator/MODES.md. Smart Routing skill explicitly states it does not weaken security/contract/release gates.

3. **Global CLAUDE.md sync gap (note for scribe/CHANGELOG).** The user's private `~/.claude/CLAUDE.md` still carries v6.4.0 content incl. old Rule 2 wording. Project-level files take precedence in project sessions, but sessions outside this project run the old rules until re-install. CHANGELOG must include a migration note: existing users must re-run the install prompt (or manually sync) to update the global orchestrator file.

4. **Release sequence: two sequential commits, not squashed.**
   - Commit 1: `chore(release): v6.4.0 — The Modes Release` (the existing uncommitted v6.4.0 working-tree changes; CHANGELOG entry already present).
   - Commit 2: `chore(release): v7.0.0 — The Fable Release` (after @scribe writes the v7.0.0 CHANGELOG entry).
   Basis: "NEVER push the same version twice" (`skills/release/SKILL.md:33`), "each push = new version number" (`docs/orchestrator/VERSIONING.md:43`). Squashing would obscure v6.4.0 release history.

5. **Scope policy.** `/reports/` is gitignored (`.gitignore:12–13`) — agent reports stay out of both commits; never `git add -f` them. Pre-push checklist requires gate approval records to exist in reports/v7.0.0/ before sign-off (validator/tester gate reports must be present — satisfied by 04-validator-report.md plus this and the docs-dx report standing in for the UI-tester gate, which is N/A for a docs/config-only release).
