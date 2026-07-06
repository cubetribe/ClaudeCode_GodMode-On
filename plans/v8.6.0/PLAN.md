# Plan v8.6.0 — "Fable 5 Light"

> Goal: bring the Opus-4.8-ultracode orchestrator as close to Fable-5 output quality as
> orchestration structurally can — by repairing the deterministic enforcement layer,
> healing install drift, making routing auditable, and scoping the compensation levers
> to where they actually work. Codename "Fable 5 Light" (CHANGELOG + Release title only).

## Audit basis

Full analysis digest (2 dynamic-workflow runs, 15 agents, adversarially verified):
`reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md`.

Key verified findings driving this plan:

1. **`check-api-impact.js` is a silent no-op in repo AND install** — wired with
   `"$CLAUDE_FILE_PATH"` (config/claude-settings.json:29), an env var Claude Code never
   populates; the script reads `process.argv[2]` only. Core Rule 4's automatic
   @api-guardian trigger is dead. (Empirically confirmed: empty arg ⇒ exit 0, silent.)
2. **`analyze-prompt.js` is a zombie** — dropped from repo hook wiring in v8.5.0 but
   still shipped in `scripts/` and still broken-wired in the live install.
3. **Install drift**: live `~/.claude/` is at 8.0.0 (agents without Sprint Contract, no
   `skills/sprint-planning/`, pre-stdin `validate-agent-output.js`, broken env-var hook
   wiring incl. SubagentStop). `apply-global-claude-setup.sh` never touches
   `settings.json`, so re-installing does not heal hook wiring.
4. **Routing decisions are unaudited** — Smart Routing gate-skips leave no record.
5. **Compensation levers are unscoped** — adversarial verification is finding-agnostic
   (facts and design treated alike), no cost thresholds, no human gate for the
   judgment class that no same-tier verification can catch (decomposition quality,
   design taste, correlated verifier misses).

Strategy constraint (from the analysis): orchestration compensates **reliability, not
capability**. This plan buys parity on routine + checkable work and makes the residual
judgment gap visible and human-managed. It does not make Opus 4.8 a Fable 5 — hence
"Light".

## Sprint index

| Sprint | Slug | Content | Version Relevance | Execution |
|---|---|---|---|---|
| 01 | hook-repair | check-api-impact stdin port, analyze-prompt deprecation, hook contract test + CI step | patch | sequential |
| 02 | install-sync | installer `--fix-hooks`, session-start drift warning, execute live sync | patch | sequential (after 01) |
| 03 | routing-audit | Routing Decision Log, escalation decision tree, finding-conflict adjudication, arch-brief required fields | minor | sequential (after 01) |
| 04 | compensation-playbook | facts-only adversarial verification, human gate for judgment class, cost thresholds, hot-file queue | minor | sequential (after 03 — shares META-DECISIONS.md) |
| 05 | release | bump 8.5.0→8.6.0, changelog promotion, invariant checks, PR (with permission) | — (aggregates: minor) | last |

Sprints run **sequentially** (03/04 share `docs/orchestrator/META-DECISIONS.md`;
02 syncs 01's outputs). Parallel fan-out happens *within* sprints on disjoint files.

## Global ownership matrix (hot files)

| Hot file | Writer | When |
|---|---|---|
| `CHANGELOG.md` [Unreleased] | @scribe only | at each sprint integration (serialized) |
| `VERSION` + touchpoints | `scripts/version-bump.js` only | sprint 05 |
| `ROADMAP.md` | orchestrator | sprint 05 (status flip) |
| `plans/v8.6.0/**` | orchestrator only | status/Result updates |
| `README.md` | not touched this plan (badge via sync-version in sprint 05) | sprint 05 |

## Decisions taken in planning

- **D1**: Codename "Fable 5 Light" appears only in the CHANGELOG entry title block and
  the GitHub Release title (v8.5 codename law).
- **D2**: The human-review gate for judgment-class decisions is added to the Quality
  Gates / META-DECISIONS escalation layer, NOT as a renumbered Core Rule — additive,
  backward-compatible ⇒ plan stays MINOR.
- **D3**: `analyze-prompt.js` is deprecated (v8.5 precedent: workflow-state.js), not
  rewritten: its meta-decision keyword analysis duplicates what the orchestrator does
  natively at ultracode effort, and UserPromptSubmit wiring was already dropped in 8.5.
- **D4**: Hook contract test runs in CI (release-consistency.yml) AND locally via
  `npm run hooks:test`; it simulates real stdin payloads so wiring/API drift can never
  again fail silently.
- **D5**: Live-install sync (sprint 02) includes repairing `~/.claude/settings.json`
  hooks via the new `--fix-hooks` flag (with timestamped backup) and refreshing the
  GodMode core of `~/.claude/CLAUDE.md` while preserving the user's personal tail
  (stack defaults, department table, scheduled automations) — same procedure as the
  documented 2026-06-30 v8 install.

## Delta log

- 2026-07-06: Plan created (analysis digest in sprint-00). Approved by maintainer:
  full plan, codename "Fable 5 Light", target v8.6.0.
