---
agent: builder-7 (public docs + prompts)
date: 2026-07-28
sprint: v8.7.0/sprint-02
task: Gate-Umbau — @validator dissolution + @tester opt-in reflected in all user/contributor-facing docs
---

# Builder Report — Public Docs & Prompts (Sprint 02)

## Summary

Updated all files in the assigned write scope to reflect the canonical gate model already
written into `CLAUDE.md`: @validator dissolved into a deterministic hook (post-`@builder`,
0 context on success) + on-demand `/code-review`; @tester made opt-in via `ux_gate: auto |
human | skip` (default `human`). Agent roster count corrected from 15 (8 core) to 14 (7 core)
everywhere in scope. Ran `node scripts/sync-version.js --check` — green (12/12 touchpoints,
no version strings were touched).

## Conflict Check

`git status` showed all scoped files already modified (uncommitted) at task start. Diffed
each — all pre-existing changes were the Sprint 01 license-footer additions (README badge,
CONTRIBUTING contributor-license clause, doc footers), explicitly called out in the dispatch
as "bleibt erhalten." No foreign work-in-progress conflicting with this sprint's task was
found; proceeded per Sprint Contract.

### Files Created

None. This sprint task (docs coherence sweep) is edit-only — no new files were created.

### Files Modified

- `README.md` — badge (7 Core), orchestrator example flow, Agents section, Rules 5–7, FAQ
  (@validator → hook/@tester opt-in), Version section, Documentation link text.
- `CONTRIBUTING.md` — bug-report template example (`@validator` → `@api-guardian`).
- `docs/AGENTS.md` — Core Agents (7), "Where did @validator go?" note, replaced "Dual Quality
  Gates" diagram with "Verification Matches the Evidence", updated all 4 workflow diagrams.
- `docs/AGENT_ARCHITECTURE.md` — maintenance note updated (14 agents, flags stale
  `validator.md` references in the example tree below as historical/incorrect).
- `docs/AGENT_MODEL_SELECTION.md` — removed @validator from effort matrix, cost curve, and
  Summary table; added calibration-note caveat (effort values not re-swept); removed the
  @validator model section; recomputed workflow/monthly $ totals by simple subtraction of
  @validator's former line item (flagged as directional, not re-measured); updated
  Cost-Efficiency Mode guidance and Key Takeaways.
- `docs/ARCHITECTURE.md` — agent counts (14/7), dual-location diagram, added v8.7 Evolution
  entry.
- `docs/INSTALLATION.md` — ContextRestore trigger line updated to hook/ux_gate language.
- `docs/STORY.md` — no change (validator mention is a historical fact about PRs #22/#23,
  correctly left as a past-tense record).
- `docs/policies/RARE_MATRIX.md` — full rewrite of @validator-bearing tables/diagrams (Core
  Development Activities, Decision assignments, Escalation Responsibilities, Parallel Gates
  diagram → "Evidence-Matched Verification" diagram, Decision Matrix Detail, all 3
  workflow-specific ASCII diagrams). Added the judgment-class escalation row using the
  second RACI convention per dispatch item 5 (Responsible=@builder, Accountable=Orchestrator,
  Reviewed by=checks/Gates, Escalated to=User).
- `docs/policies/CONTEXT_SCOPE_POLICY.md` — replaced the `### @validator` section with
  `### Deterministic Hook (replaces @validator, v8.7.0)`; updated all in-scope/out-of-scope
  cross-references, budget allocation, context optimization strategies, handoff example/chain,
  section 6 (parallel execution model), added Version History entry.
- `docs/policies/DOMAIN_PACK_SPEC.md` — removed `validator.md` from the example directory
  listing and `newFeature` workflow array; updated the `backend` built-in domain pack's
  "Agents Modified" column (validator → api-guardian).
- `docs/policies/SECURITY_TOOLING_POLICY.md` — removed @validator's column from the Tool
  Access Matrix (7 agent columns now); updated bash-allowlist sections and the pre-push
  checklist; added Version History entry.
- `config/CLAUDE-projekt.md` — agent table, orchestration rules, workflows, and the API-change
  checklist updated to hook + opt-in @tester.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md` — all agent counts (14/7), removed
  `validator.md` from expected-files list and uninstall commands (bash + PowerShell), updated
  report-structure ASCII art.
- `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Manual.md` — same class of fixes (counts,
  expected-files list, uninstall command).
- `CC-GodMode-Prompts/CCGM_Prompt_02-ProjectActivation.md` — subagent_type list, Subagents
  table, Workflows table + note, Quality Gates diagram → evidence-matched diagram, Rules,
  Quick Reference handoff chain and report-structure ASCII art. Version string (8.6.0) left
  untouched per instruction.
- `CC-GodMode-Prompts/CCGM_Prompt_99-ContextRestore.md` — Rules 1–3 rewritten, all 3 workflow
  ASCII diagrams, Decision Matrix table, self-interruption table, agent reference table,
  "LONG-STANDING FEATURES" bullet, MINIMAL VERSION block, warning signs list, meta-decision
  table row. Version string (8.6.0) left untouched.
- `CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md`, `CC-GodMode-Prompts/QUICK_START.md` —
  checked, no @validator/gate-model references found; no changes needed.
- `DECISIONS.md` — appended a dated (2026-07-28) correction note directly under ADR-001's
  "Performance metrics collected" block, per instruction: the 40%/8-12min→5-7min figures come
  from the decision-matrix simulation, not a measurement; ADR text itself left unchanged
  (historical record).

### Quality Gates

- `node scripts/sync-version.js --check` → **PASS**, 12/12 touchpoints consistent with
  VERSION=8.6.0. No version strings modified in any prompt file (required — these files are
  checked invariants).
- `grep -rn "@validator"` across all files in this write scope → **PASS**. Every remaining hit
  is an explanatory/historical note ("dissolved v8.7.0", "no longer exists", "what happened
  to"), none describe @validator as a running gate. `docs/STORY.md`'s hit is a past-tense
  narrative fact (v7.0.0/v7.1.0 PRs) and was correctly left unchanged.
- Markdown structure spot-checked (headings/tables render, no orphaned fences) in each edited
  file via Read after each Edit — **PASS**.

### Tests

No automated test suite applies to markdown documentation. Verification was:
1. `node scripts/sync-version.js --check` (deterministic, see Quality Gates above) — PASS.
2. Full-scope `grep` sweep for `@validator` across all 18 files in the write scope, manually
   reviewing every hit — PASS (0 references describe it as an active gate).
3. Manual re-read of every edited section via the Read tool immediately after each Edit call
   to confirm intended wording landed correctly.

## Open Items for Maintainer / Other Builders

1. **GitHub repo description** ("v7.1", "Optimized for Claude Fable 5") cannot be changed from
   this repo — flagged only, not fixed.
2. **`docs/orchestrator/META-DECISIONS.md`** (out of my scope, @builder-2's) needs the same
   RACI convention now set in `docs/policies/RARE_MATRIX.md`
   (Responsible=@builder/Accountable=Orchestrator/Reviewed by=Gates/Escalated to=User) to
   fully resolve contradiction H9 — I set my file to the second convention per dispatch
   instruction 5 but could not touch the orchestrator doc.
3. **@security effort level discrepancy**: dispatch instruction 3 asked me to add @security
   with `effort: medium`, but @security was already present in
   `docs/AGENT_MODEL_SELECTION.md` and in the already-updated canonical `CLAUDE.md` at
   `effort: low`. I kept `low` to stay consistent with the binding `CLAUDE.md` text rather
   than introduce a second contradiction; flagging this premise mismatch for the maintainer.
   No new effort numbers were invented either way.
4. **`docs/AGENT_ARCHITECTURE.md`** still contains a stale, already-flagged-outdated
   `validator.md` example agent tree (7-agent-generation cp/diff walkthrough). I added a
   pointer note explaining the drift rather than rewriting the whole illustrative tree, since
   the file's own existing maintenance note already disclaims it as outdated and a full
   rewrite of that walkthrough was not in the sprint's stated scope.
5. **Dollar figures in `docs/AGENT_MODEL_SELECTION.md`** had a pre-existing internal
   inconsistency (e.g. a diagram summing to $5.70 vs. a separately-quoted $6.10 for the same
   workflow) predating this sprint. I did not reconcile that unrelated inconsistency — only
   subtracted @validator's removed line item consistently within each section — per the
   non-goal "Keine Neuvermessung der Effort-Matrix."

## Ready for Integration

- [x] Acceptance criterion 1 (no @validator-as-running-gate references outside excluded
      paths) verified by grep sweep across full write scope.
- [x] Acceptance criterion 2 (consistent "who verifies after @builder" statement) — all
      touched files now say: hook always, @tester if `ux_gate: auto`, @security on security
      surfaces, `/code-review` on risk/doubt.
- [x] `sync-version.js --check` green.
- [ ] Acceptance criteria 3–6 belong to other builders' write scopes (templates, scripts,
      agents) — not verifiable from this scope alone.
