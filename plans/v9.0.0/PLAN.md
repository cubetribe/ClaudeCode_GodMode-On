# Plan v9.0.0 — Sprint-Native GodMode

> Master plan for the v9.0.0 release. Produced by a full repository audit (9 subsystem readers,
> 5 adversarial problem validators, 10 best-practice researchers, 2026-07-06). Status of each
> sprint lives in its sprint file frontmatter. This plan is the source of truth for scope and
> ordering; ROADMAP.md tracks the initiative, CHANGELOG.md `[Unreleased]` accumulates the entries.

## Why v9.0.0

The audit confirmed (with file:line evidence) that the v8 process is single-task-only and that
its release chain has structural holes. Highlights, all **confirmed**:

1. **Version-First is a race by design.** Two parallel workstreams both read VERSION, claim the
   same next version, share one `reports/vX.X.X/` folder (fixed filenames → silent overwrites)
   and the same CHANGELOG prepend point. VERSION has 2–3 legitimate writers with no demarcation
   (Orchestrator before work per Core Rule 1, @scribe before push, any second session).
2. **Phantom releases.** 42 CHANGELOG versions vs. 3 tags/GitHub releases; `[8.0.1]` and
   `[7.1.1]` merged + changelogged but never tagged/released; local orphan tags v1.0.0/v1.1.0;
   codename "The Ultracode Release" assigned to both 8.0.0 (CHANGELOG) and 8.0.1
   (CLAUDE.md/README/template). Nothing verifies the release tail after a release-PR merge.
3. **Two de-facto version sources.** VERSION is declared single source of truth in three docs,
   but @github-manager derives the tag version by grepping the first CHANGELOG heading —
   a direct tag-corruption path (up to a literal `Unreleased` tag).
4. **Version touchpoints unmanaged.** ~15 places carry the current version;
   `sync-version.js` covers 8 (missing plugin.json — the marketplace-visible version —,
   README, the template, AGENT_MODEL_SELECTION) and contains a hardcoded v5.x codename pattern;
   `version-bump.js` covers only VERSION+CHANGELOG; no script tags.
5. **Changelog gaps.** No `[Unreleased]` section (guaranteed prepend conflicts for parallel
   branches); merged PRs #24/#26/#29/#30 have no entry under any version; entries are mutated
   after publication; date defects (2025/2026 year typos).
6. **Agent prompts are not parallel/sprint-ready.** 14/15 without write scopes; zero
   conflict-detection or stop-on-foreign-changes rules; no sprint/plan intake anywhere
   (`grep -ri sprint` → 0 hits repo-wide); verdict contract present in only 8/15 files with
   3 different status sets; @architect/@researcher must write reports but have no Write tool.
7. **Enforcement layer is dead.** No CI; SubagentStop hook calls `validate-agent-output.js`
   with zero arguments (never validates); `.ccgm-state.json` is written by nothing;
   `parallel-quality-gates.js` is a simulation; `pre-push-check.js` checks no tag consistency
   and is wired nowhere.
8. **No living planning surface.** No roadmap (only the archived v5 one), no sprint artifact,
   no release-status artifact; DECISIONS.md dead since v5.8.0 (no ADRs for the v6/v7/v8 pivots).

## Target architecture (summary)

- **Plan-first replaces Version-First** (ADR-004). Non-trivial work starts with
  `plans/vX.Y.Z/PLAN.md` + sprint files (template: `docs/templates/SPRINT_TEMPLATE.md`).
  VERSION is written exactly once, in the release sprint, by the release process.
- **Sprint files** carry Goal / Scope / Non-Goals / Write-Scope ownership table / Risks /
  Acceptance criteria / Test strategy / Changelog note / Version relevance / execution mode.
  Parallel execution only for disjoint write scopes; hot files (VERSION, CHANGELOG, ROADMAP,
  README, plan files) are single-writer and always sequential.
- **Changelog:** `[Unreleased]` section at top; entries added at sprint integration
  (serialized, single writer); promoted to `[X.Y.Z] - date` by the release tooling.
- **Version tooling:** one machine-readable touchpoint manifest; `sync-version.js` rewritten
  to cover ALL touchpoints with `--check` as a hard gate; `version-bump.js` composes
  bump → sync → `[Unreleased]` promotion and checks git-tag uniqueness;
  new `release-check.js` enforces the invariant
  `VERSION == top CHANGELOG version == latest tag == latest GitHub release (or open release/* branch)`.
- **CI:** `.github/workflows/release-consistency.yml` runs the checks on every PR/push;
  auto-tag + draft GitHub Release when VERSION changes on main (closes the release tail
  structurally).
- **Agents:** every agent file gets four standard blocks — Context Intake (must-read paths,
  incl. assigned sprint file), Write Scope, Conflict & Stop rules (foreign changes in scope ⇒
  `STATUS: BLOCKED (conflict)`), unified Return Verdict. @github-manager reads the version from
  VERSION only. Implementer agents get an explicit "never touch VERSION/CHANGELOG" line.
- **Reports** stay local (gitignored) as working artifacts under `reports/vX.Y.Z/sprint-NN/`;
  the durable audit trail is the tracked sprint file (`Result` section) — docs stop citing
  gitignored reports as public evidence.

## Sprint index

| # | File | Focus | Execution |
|---|---|---|---|
| 0 | (done — audit lives in this PLAN + chat record) | Audit & problem validation | sequential |
| 1 | sprint-01-planning-system.md | ROADMAP, plans/, sprint template, ADR-004 | sequential |
| 2 | sprint-02-versioning-changelog.md | Version tooling, manifest, [Unreleased], release-check | sequential |
| 3 | sprint-03-ci-gates.md | CI workflows, hook fix, deprecate dead scripts | sequential |
| 4 | sprint-04-agent-prompts.md | 15 agent prompts: standard blocks + specific fixes | sequential (parallelizable by file in future runs) |
| 5 | sprint-05-orchestration.md | CLAUDE.md v9, sprint-planning skill, contradiction fixes | sequential |
| 6 | sprint-06-docs.md | README/INSTALLATION/QUICK_START/CONTRIBUTING/registries/CHANGELOG tail | sequential |
| 7 | sprint-07-release.md | Backfill v8.0.1 tag, final checks, v9.0.0 bump + release PR | sequential, push only with explicit user permission |

## Global ownership (hot files during this plan)

| File | Single writer |
|---|---|
| VERSION, CHANGELOG.md | release sprint tooling (S7) / [Unreleased] entries at sprint integration |
| ROADMAP.md, plans/** | Orchestrator |
| CLAUDE.md, skills/**, docs/** | S5/S6 (one sprint at a time) |
| agents/** | S4 |
| scripts/**, .github/** | S2/S3 |

## Decisions taken in planning (see also ADR-004)

- v9.0.0 is a MAJOR bump: replacing Core Rule 1 (Version-First) is a breaking CLAUDE.md change
  per the repo's own semver table.
- VERSION is NOT bumped at plan start — deliberate, documented break with the old rule; the
  bump happens in S7 via the new tooling.
- v8.0.1 phantom release is resolved by backfilling tag+release on merge commit `114346e`
  (the state where all surfaces consistently claim 8.0.1) during S7, before v9.0.0 ships.
- `workflow-state.js` / `.ccgm-state.json` / `parallel-quality-gates.js` are deprecated, not
  rebuilt: sprint files are the new state surface; honest labels beat dead automation.
- reports/ stays gitignored; durable results go into sprint files.
