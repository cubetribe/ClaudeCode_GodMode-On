---
agent: architect
version: v7.0.0
date: 2026-06-11
status: complete
task: Design the v7.0.0 "Fable Release" change set — Fable 5 orchestrator awareness, effort fields, verdict format, smart-routing default, architecture gate split, README/keyword optimization
---

# Architectural Plan: v7.0.0 — The Fable Release

## ARCHITECTURAL DECISIONS

### Design Approach
v7.0.0 is a **MAJOR, docs-and-config-only** release. There is no application code — CC_GodMode is a prompt/skill/agent-definition system. The change set tunes orchestration behavior for Claude Fable 5 as the orchestrator while keeping subagents on cheaper models, and inverts routing so cost-aware risk-based routing is the default.

Six themes, all additive to the uncommitted v6.4.0 working tree:
1. Effort fields in all agent frontmatter (+ bring 6 department agents under version control).
2. Verdict format (structured return to orchestrator; full reports still written to disk).
3. Smart Routing as default (Full-Gates becomes the explicit escalation path).
4. Fable-tuned orchestrator prompt (soften legacy scaffolding, add autonomy/silence/delegation clauses).
5. Architecture gate split (inline brief for small/medium; @architect only for high-risk).
6. README + plugin.json + AGENT_MODEL_SELECTION keyword/matrix updates.

### Critical Discovery — Department Agent Sync Gap (RESOLVED)
The 6 department agents (`ci-security-guardian`, `docs-dx`, `quality-operations`, `runtime-platform`, `workflow-design`, `workspace-governance`) exist **only** in `~/.claude/agents/` (the user's live install). They are:
- NOT in the repo `agents/` directory (repo has 8 core agents only),
- NOT listed in `.claude-plugin/plugin.json`,
- NOT installed by `CCGM_Prompt_01-SystemInstall-Auto.md` or `-Manual.md` (both copy only the 8 core agents via `cp agents/*.md`),
- Referenced only in the user's private global `~/.claude/CLAUDE.md` (which is NOT a repo file).

**Decision:** Bring all 6 department agents into the repo as version-controlled sources. The install glob `cp /tmp/.../agents/*.md ~/.claude/agents/` will then auto-sync them. Their canonical frontmatter (already verified from the live files) is the starting point; builder adds `effort: low` and otherwise copies the existing content from `~/.claude/agents/<name>.md` verbatim.

### Install / Sync Model (RESOLVED)
- **Repo is the source of truth.** Builder edits repo files only.
- Agent install path: `agents/*.md` glob → `~/.claude/agents/`. Adding department files to repo `agents/` makes them install automatically; no glob change needed, but the prompt's **expected-agents list** and counts must be updated (8 → 14).
- Orchestrator template install: repo root `CLAUDE.md` → `~/.claude/templates/CLAUDE-ORCHESTRATOR.md`. NOTE: the install prompt copies the repo **root `CLAUDE.md`** to the template, while the repo ALSO has `templates/CLAUDE-ORCHESTRATOR.md` (the in-repo template copy). Both repo files must be kept in sync by builder. (This is an existing quirk; do not try to "fix" the dual-source design in this release — just update both.)
- Skills install via `cp -R skills/* ~/.claude/skills/`.
- **The user's live `~/.claude/CLAUDE.md` is OUT OF SCOPE.** It is a private global file, not a repo artifact. Builder must NOT edit `~/.claude/CLAUDE.md` or `~/.claude/agents/*` directly. v7.0.0 ships repo sources + install prompts; the user re-runs install (or copies) to pick up changes. Document this in the @scribe migration note.

### Verdict Format — No Validation Conflict (RESOLVED)
`scripts/validate-agent-output.js` enforces min-length on the **full report file** written to `reports/vX.X.X/` (architect 1000, api-guardian 800, builder 500, validator 400, tester 800, scribe 300, github-manager 200). The new verdict is only the **return message to the orchestrator**, not the file. Therefore:
- Agents continue writing full reports to disk (validation unaffected).
- Agents return: `STATUS: APPROVED|BLOCKED|DONE` + max 3 bullet findings + absolute path to full report.
- Orchestrator opens the full report only on BLOCKED (or on explicit need).
No script change required. The rule is documentation/instruction-level.

### Data Flow (routing inversion)
```
Request → Orchestrator (Fable 5) classifies risk
  ├─ LOW/MED risk  → Smart Routing (default): inline arch brief, scoped agents, scoped validation
  └─ HIGH risk     → Full-Gates path: @architect + @api-guardian (if contract) + @validator ∥ @tester + @scribe
Risk signals (force Full-Gates): API/schema/type paths, security surfaces (.github/workflows, auth),
  release artifacts (VERSION/CHANGELOG), user-facing UI, new modules, breaking changes.
```

### Integration Points
Hooks (`check-api-impact.js`, `validate-agent-output.js`, `analyze-prompt.js`) are unchanged — they remain the deterministic safety net under Smart Routing. The `effort` field is consumed by Claude Code ≥2.1.152 natively; no script reads it.

---

## IMPLEMENTATION STRATEGY

Execution order matters: agent frontmatter and new department files first (mechanical), then routing/prompt docs (interdependent), then README/manifest (depend on final naming), then sync the install prompts last.

### Phase 1 — Agent Frontmatter + Department Agents (mechanical)

**1a. Add `effort` to the 8 core agents** (`agents/<name>.md`, frontmatter only — do not touch body):

| File | model (target) | effort (add) | Change |
|------|----------------|--------------|--------|
| `agents/architect.md` | `opus` (keep) | `high` | add `effort: high` |
| `agents/builder.md` | `sonnet` (keep) | `medium` | add `effort: medium` |
| `agents/validator.md` | `sonnet` (keep) | `low` | add `effort: low` (keep `isolation: worktree`) |
| `agents/tester.md` | `sonnet` (keep) | `medium` | add `effort: medium` (keep `isolation: worktree`) |
| `agents/scribe.md` | `sonnet → haiku` | `low` | change `model: haiku`, add `effort: low` |
| `agents/researcher.md` | `haiku` (keep) | `low` | add `effort: low` |
| `agents/api-guardian.md` | `sonnet` (keep) | `medium` | add `effort: medium` |
| `agents/github-manager.md` | `haiku` (keep) | `low` | add `effort: low` |

Exact target frontmatter (preserve existing `tools`, `description`, `isolation` lines):

```yaml
# architect.md
---
name: architect
description: System architect for high-level planning, design decisions, and module structure
tools: Read, Grep, Glob, WebFetch
model: opus
effort: high
---
```
```yaml
# builder.md
---
name: builder
description: Implements code according to specifications from @architect and @api-guardian
tools: Read, Write, Edit, Bash, Glob, Grep
model: sonnet
effort: medium
---
```
```yaml
# validator.md
---
name: validator
description: Quality assurance and verification - final quality gate before documentation
tools: Read, Grep, Glob, Bash
model: sonnet
effort: low
isolation: worktree
---
```
```yaml
# tester.md
---
name: tester
description: UX Quality Engineer for E2E Testing, Visual Regression, Accessibility, and Performance Audits
tools: Read, Bash, Glob, mcp__playwright, mcp__lighthouse, mcp__a11y
model: sonnet
effort: medium
isolation: worktree
---
```
```yaml
# scribe.md  (MODEL CHANGE)
---
name: scribe
description: Technical writer for documentation - README, CHANGELOG, API_CONSUMERS.md, VERSION management
tools: Read, Write, Edit, Glob, Grep
model: haiku
effort: low
---
```
```yaml
# researcher.md
---
name: researcher
description: Knowledge Discovery Specialist for web research, documentation lookup, and technology evaluation
tools: WebSearch, WebFetch, Read, Glob, mcp__memory
model: haiku
effort: low
---
```
```yaml
# api-guardian.md
---
name: api-guardian
description: API Lifecycle Expert for contract validation, breaking change detection, and consumer impact analysis
tools: Read, Grep, Glob, Bash
model: sonnet
effort: medium
---
```
```yaml
# github-manager.md
---
name: github-manager
description: GitHub Project Management Specialist for issues, PRs, releases, repository sync, and CI/CD orchestration
tools: Read, Grep, Glob, Bash, mcp__github
model: haiku
effort: low
---
```

**1b. Create 6 department agents in repo `agents/`** by copying each file's current content from `~/.claude/agents/<name>.md` verbatim and adding `effort: low`. Target frontmatter:

```yaml
# agents/ci-security-guardian.md
---
name: ci-security-guardian
description: Optional department agent for GitHub Actions, repository protection, and CI/security guardrails. Invoke when touching .github/workflows/**, CODEOWNERS, dependabot.yml, or any repository security surface.
tools: Read, Grep, Glob, Bash
model: sonnet
effort: low
---
```
```yaml
# agents/docs-dx.md
---
name: docs-dx
description: Read-only documentation and developer-experience reviewer. Invoke when public-facing docs, prompts, setup instructions, or user-facing clarity are in scope.
tools: Read, Grep, Glob
model: sonnet
effort: low
---
```
```yaml
# agents/quality-operations.md
---
name: quality-operations
description: Read-only quality-operations specialist for validation scope, regression gates, and eval-oriented workflow checks. Invoke when defining the test plan or validation strategy for a changed scope.
tools: Read, Grep, Glob
model: sonnet
effort: low
---
```
```yaml
# agents/runtime-platform.md
---
name: runtime-platform
description: Read-only runtime and platform specialist for toolchain, sandbox, environment, and OS behavior. Invoke when environment constraints, toolchain prerequisites, or OS-specific behavior affect a task.
tools: Read, Grep, Glob, Bash
model: sonnet
effort: low
---
```
```yaml
# agents/workflow-design.md
---
name: workflow-design
description: Read-only workflow designer for orchestration, skill boundaries, prompt structure, and durable handoff artifacts. Invoke when the task involves changing how agents coordinate, skill routing, or handoff reliability.
tools: Read, Grep, Glob
model: sonnet
effort: low
---
```
```yaml
# agents/workspace-governance.md
---
name: workspace-governance
description: Read-only governance specialist for AGENTS layering, repo rules, release law, and change-scope policy. Invoke when touching VERSION, CHANGELOG, CLAUDE.md, or release artifacts.
tools: Read, Grep, Glob
model: sonnet
effort: low
---
```
Builder MUST read each `~/.claude/agents/<name>.md` and copy the full body (not just frontmatter) into the new repo file.

### Phase 2 — Verdict Format (instruction-level, 4 locations)

Add the verdict contract to:
- `docs/orchestrator/QUALITY-GATES.md` — new "## Agent Return Contract" section: agents write full report to `reports/vX.X.X/NN-<agent>-report.md` and return only `STATUS` + ≤3 bullets + report path; orchestrator reads full report only on BLOCKED.
- `skills/quality-gates/SKILL.md` — same contract, plus note it does not change `validate-agent-output.js` min-length (which checks the file, not the return).
- `docs/templates/REPORT_TEMPLATES.md` — add a top-level "## Orchestrator Return Verdict (separate from the on-disk report)" block with the exact verdict shape. Keep all existing file templates and min-lengths unchanged.
- Each of the 8 core agent bodies — add/adjust the "Verdict Output" / "Report Output" instruction so the agent's closing message is the structured verdict (full report still saved to file). (Architect, validator, tester already have "After Completion" blocks; builder extend those to add the explicit `path:` line.)

Verdict shape to standardize:
```
STATUS: APPROVED | BLOCKED | DONE
- finding 1 (≤1 line)
- finding 2
- finding 3
report: <absolute path to full report>
```

### Phase 3 — Smart Routing as Default + Architecture Gate Split

**3a. `CLAUDE.md` (repo root)** — the highest-impact edit:
- Update header to `# CC_GodMode v7.0.0` and "Current Version: v7.0.0 — The Fable Release".
- **Rule 2** "NEVER implement" → soften to: "Delegate implementation by default. Trivial one-line/typo/comment fixes the orchestrator may do directly and note; anything non-trivial → @builder." Keep hard rules hard.
- **Rule 3** "@architect is the Gate" → rewrite: "Architecture gate (split): for small/medium tasks the orchestrator writes a 3–5 bullet inline architecture brief into `reports/vX.X.X/01-architect-report.md`; invoke @architect (Opus) only for new modules, breaking changes, cross-domain designs, or when uncertain."
- **Rules 4 & 9 stay hard** (api-guardian mandatory; never push without permission).
- **Modes table:** invert posture — add a "Smart Routing (default)" row pointing at `skills/cost-efficiency/`; rename old Standard to "Full-Gates" pointing at `skills/workflows/` for critical work.
- Add a new "## Routing" section: default = Smart Routing; risk signals that force Full-Gates (list above).
- Add "## Fable 5 Orchestrator" section: autonomy clause (minor decisions → decide & note; scope/destructive → ask), silence-default (one sentence per finding/direction-change/blocker), explicit delegation triggers (spawn subagent when task needs Write/Bash/MCP, multi-file change, or specialized review; work directly for trivial one-liners and pure classification).

**3b. `templates/CLAUDE-ORCHESTRATOR.md`** — mirror ALL of 3a (this is the install-time copy). Update its Rules block, Modes table, add Routing + Fable sections, bump version footer to v7.0.0. (It is far more verbose than root CLAUDE.md; keep its structure, just edit the matching sections.)

**3c. `skills/cost-efficiency/SKILL.md`** — reframe from "use when user asks" to "DEFAULT routing policy." Update the intro and "Do Not Use" → "Escalate to Full-Gates when" with the risk-signal list. Add the inline-architecture-brief rule for small/medium tasks.

**3d. `skills/workflows/SKILL.md`** — add a note at top: "These are the Full-Gates workflows, used for high-risk work and when Smart Routing escalates. Default routing is Smart Routing (`skills/cost-efficiency/`)." Add architecture-gate-split note to the Feature/Refactor workflows (inline brief vs. @architect invocation).

**3e. `docs/orchestrator/MODES.md`** — change "Standard Mode remains the default" to "Smart Routing is the default; Full-Gates (formerly Standard) is the explicit path for high-risk work." Update the Mode Summary table accordingly. Keep the Platform Notes section (it already documents `effort`). Add a one-line note that v7.0.0 sets effort per agent.

**3f. `docs/orchestrator/WORKFLOWS.md`** — align workflow descriptions with the gate split and Smart-Routing default (mirror the CLAUDE.md routing language). Update critical-API-paths section to double as the Full-Gates risk-signal list.

### Phase 4 — README + Manifest + Model-Selection doc

**4a. `README.md`** — keyword optimization, no stuffing:
- Title area: keep "CC_GodMode" but add a tagline line such as "Claude Fable 5 orchestrator for Claude Code multi-agent development — token-efficient subagents, risk-based quality gates."
- Version badge 6.4.0 → 7.0.0; Agents badge "8 Specialists" → "8 Core + 6 Department".
- Intro/"What Is This?": natural mention of "Claude Fable 5 as the orchestrator," "Claude Code subagents," "token efficiency."
- New "## Fable 5 Ready" section: explains Fable orchestrator + cheap subagents, effort tuning, Smart Routing default, 30–50% token reduction per standard feature, risk-based gates.
- Feature bullets: weave "Fable orchestrator," "token efficiency," "multi-agent" naturally.
- Update agent count narrative (8 core + 6 department), Version section, and the v7.0 entry line.

**4b. `.claude-plugin/plugin.json`**:
- `version`: `6.4.0` → `7.0.0`.
- `description`: add Fable 5 + token-efficiency framing.
- `keywords`: add `claude-fable-5`, `fable-orchestrator`, `claude-code`, `subagents`, `token-efficiency`.
- `agents`: append the 6 department agent paths (`agents/ci-security-guardian.md`, etc.) so the plugin installs all 14.

**4c. `docs/AGENT_MODEL_SELECTION.md`**:
- Update scribe entry to `haiku` + rationale (CHANGELOG/doc writing is templated; haiku + effort low is sufficient under Fable orchestration).
- Add an "Effort Field" section documenting the full matrix (model + effort per agent, incl. 6 department agents).
- Add a "Fable 5 Orchestrator Economics" section: Fable $10/$50 per MTok ~2x Opus; orchestrator stays Fable, subagents cheap; Smart-Routing default targets 30–50% spend reduction per standard feature.
- Update workflow cost examples to reflect scribe=haiku and Smart-Routing default.

### Phase 5 — Install Prompt Sync (do last, after final naming)

**5a. `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md`** and **5b. `-Manual.md`**:
- Version 6.4.0 → 7.0.0; "What's New" → v7.0.0 Fable Release summary.
- Agent count 8 → 14; expected-agents list add the 6 department files.
- Welcome banner "Install 8 specialized AI agents" → "14 agents (8 core + 6 department)".
- Installation report counts (`Agents: [X]/8` → `/14`).
- "What Gets Installed" table + Uninstall section: add the 6 department agents.
- The `cp agents/*.md` command itself needs NO change (glob already covers new files).

### Phase 6 — VERSION / CHANGELOG (note only)
- `VERSION` already `7.0.0` (verified). Do NOT touch.
- CHANGELOG v7.0.0 entry is @scribe's job — note in plan, do not write here.

### Dependencies
- Phase 4 (README/manifest) depends on Phase 1 final agent names/models.
- Phase 5 depends on Phase 1 (agent list) being final.
- Phases 2 and 3 are independent of each other but both feed the @scribe CHANGELOG.

---

## RISK ASSESSMENT

### High Risk
- **Editing the user's live `~/.claude/` files.** Builder must NOT write to `~/.claude/agents/*` or `~/.claude/CLAUDE.md`. Only repo sources + install prompts change. Mitigation: explicit "do not touch ~/.claude" constraint in builder handoff.
- **scribe model downgrade (sonnet→haiku) affecting CHANGELOG/VERSION quality.** Mitigation: keep scribe's report template + min-length validation; effort low + haiku is acceptable for templated doc work, but @validator should confirm v7.0.0 CHANGELOG quality this cycle as a live test.

### Medium Risk
- **Dual orchestrator source drift** (`CLAUDE.md` vs `templates/CLAUDE-ORCHESTRATOR.md`). Mitigation: builder edits both in the same pass; validator diffs the two for semantic parity.
- **Softening "NEVER implement" could cause over-direct work by a non-Fable orchestrator.** Mitigation: scope the allowance tightly to "trivial one-line fixes," keep delegation triggers explicit.
- **Routing inversion may confuse existing users.** Mitigation: clear MODES.md mapping (Standard → Full-Gates rename) and a CHANGELOG migration note.

### Low Risk
- **Effort field on unsupported Claude Code versions** — ignored gracefully by older clients; install prompt already documents ≥2.1.152.
- **plugin.json agent list growth** — purely additive.

### What NOT to Touch (protect uncommitted v6.4.0 work)
- `VERSION` (already 7.0.0).
- Any `scripts/*.js` — no script logic changes are required by this release.
- Hook configuration in `plugin.json` and install prompts (only version/description/keywords/agents arrays change).
- `~/.claude/**` (user's live install) — entirely out of scope for builder writes.
- Existing v6.4.0 mode skills bodies beyond the specific routing-default edits listed (prototype-mode, departments, agent-teams, release, api-change, research, meta-decisions, issue-processing SKILLs stay as-is).
- CHANGELOG.md (scribe-owned).

---

## HANDOFF TO @builder

### Implementation Checklist (in order)
- [ ] Phase 1a: add `effort` to 8 core agent frontmatter; change scribe `model` to `haiku`.
- [ ] Phase 1b: create 6 department agents in repo `agents/` (copy full body from `~/.claude/agents/`, add `effort: low`).
- [ ] Phase 2: add verdict contract to QUALITY-GATES.md, skills/quality-gates/SKILL.md, REPORT_TEMPLATES.md, and the 8 core agent bodies.
- [ ] Phase 3: rewrite routing/gate rules in CLAUDE.md + templates/CLAUDE-ORCHESTRATOR.md; reframe cost-efficiency SKILL as default; annotate workflows SKILL; update MODES.md + WORKFLOWS.md.
- [ ] Phase 4: README keyword optimization + "Fable 5 Ready" section; plugin.json version/description/keywords/agents; AGENT_MODEL_SELECTION matrix + Fable economics.
- [ ] Phase 5: sync both install prompts (counts 8→14, version, lists, banners).
- [ ] Phase 6: leave VERSION; flag CHANGELOG for @scribe.

### Critical Constraints
- Do NOT write to `~/.claude/` (agents, CLAUDE.md, skills). Repo sources + install prompts only.
- Do NOT change any `scripts/*.js`.
- Edit frontmatter precisely; preserve existing `tools`/`isolation`/`description` lines.
- Keep both orchestrator files (root `CLAUDE.md` and `templates/CLAUDE-ORCHESTRATOR.md`) semantically in sync.
- Keep hard safety rules hard: api-guardian mandatory, never push without permission.

### Success Criteria
- All 14 agent files in repo `agents/` carry correct `model` + `effort`; scribe is `haiku`.
- plugin.json lists 14 agents, version 7.0.0, new keywords/description.
- Smart Routing documented as default; Full-Gates as explicit escalation; risk-signal list present and consistent across CLAUDE.md / cost-efficiency SKILL / MODES / WORKFLOWS.
- Verdict contract present in all 4 doc locations + agent bodies; min-length validation untouched.
- Install prompts reference 14 agents and v7.0.0.
- README contains target keywords naturally + "Fable 5 Ready" section.

---

## ACCEPTANCE CRITERIA FOR @validator

1. **Frontmatter matrix** — grep each `agents/*.md`: architect=opus/high, builder=sonnet/medium, validator=sonnet/low, tester=sonnet/medium, scribe=haiku/low, researcher=haiku/low, api-guardian=sonnet/medium, github-manager=haiku/low, all 6 department=sonnet/low. No agent missing `effort:`.
2. **Department agents under version control** — 14 `.md` files in repo `agents/`; each new file has a non-empty body (not frontmatter-only) matching its `~/.claude` source.
3. **plugin.json** — valid JSON; version `7.0.0`; `agents` array length 14; new keywords present; description mentions Fable 5.
4. **Dual orchestrator parity** — `CLAUDE.md` and `templates/CLAUDE-ORCHESTRATOR.md` both contain: softened-implementation rule, architecture-gate-split rule, Smart-Routing-default, Fable autonomy/silence/delegation section, v7.0.0 footer. Hard rules (api-guardian mandatory, no push without permission) still present verbatim-strength.
5. **Routing consistency** — the risk-signal list (API/schema, security, release artifacts, user-facing UI, new modules, breaking changes) appears consistently in CLAUDE.md, cost-efficiency SKILL, MODES.md, WORKFLOWS.md.
6. **Verdict contract** — present in QUALITY-GATES.md, skills/quality-gates/SKILL.md, REPORT_TEMPLATES.md, and all 8 core agent bodies; full-report-to-disk behavior + min-length rules explicitly preserved.
7. **No forbidden changes** — `git status`/diff shows no edits to `scripts/*.js`, `VERSION`, CHANGELOG.md (scribe-owned), or any `~/.claude/` path; no unrelated v6.4.0 working-tree files modified.
8. **Install prompts** — both reference 14 agents and v7.0.0; expected-agent lists, counts, banners, and Uninstall sections updated; `cp agents/*.md` command intact.
9. **README** — version badges/footer = 7.0.0; "Fable 5 Ready" section present; target keywords appear naturally (no stuffed keyword blocks).
10. **Markdown sanity** — all edited `.md` files parse (no broken frontmatter fences, no orphaned code fences).
