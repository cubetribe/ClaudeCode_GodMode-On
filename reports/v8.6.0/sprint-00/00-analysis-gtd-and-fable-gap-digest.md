---
agent: analysis-workflow (12 research/verify agents run wf_83d01525-7d8 + 3 recheck agents run wf_2aa23054-3d2)
version: v8.6.0 (target)
date: 2026-07-06
task: Evaluate GTD MCP server as mandatory extension; analyze how Opus 4.8 ultracode orchestration can approach Fable 5 quality; re-verify findings against v8.5.0
status: complete
---

# Analysis Digest — GTD MCP Evaluation & Fable-5-Parity Strategy

Files Changed: none (analysis only). Sprint plan below is PENDING USER APPROVAL.

---

## 1. GTD MCP Server — Evaluation → REJECTED as mandatory extension

**User decision 2026-07-06: no MCP extension. Recorded here as the decision rationale.**

No MCP server named "Getthings Done" exists. Three plausible interpretations were
researched and adversarially verified against the live repos:

| Candidate | Type | Stars | Verdict |
|---|---|---|---|
| hald/things-mcp | Things 3 app bridge (macOS) | 516 | usable-with-caveats — silent failure in `update_todo` (issue #55); macOS-only |
| peerjakobsen/mcp-gtd | Native GTD methodology | 1 | usable-with-caveats — **CC-BY-NC license (non-commercial only)**, not on PyPI, zero adoption |
| ekicyou/gtd-mcp-rs | Native GTD (Rust, TOML) | 1 | usable-with-caveats — outdated MCP SDK pin, compatibility with 2026-07-28 MCP spec unverified |
| jqlts1/omnifocus-mcp-enhanced | OmniFocus bridge | 54 | production-ready — but macOS + OmniFocus license required |
| abhiz123/todoist-mcp-server | Todoist bridge | 391 | usable-with-caveats — due dates offset by one year (issue #15), old SDK v0.5.0 |

Rejection rationale (mandatory-extension test):

1. **Maturity**: every candidate is single-maintainer software with documented bugs;
   the only true GTD-methodology servers have 1 star each, and the best of them
   forbids commercial use by license.
2. **Functional duplication**: v8.5.0 already tracks work state completely — sprint
   files under `plans/vX.Y.Z/` (status frontmatter), tracked `reports/vX.Y.Z/sprint-NN/`,
   CHANGELOG/VERSION single-writer law, memory MCP for findings. A GTD server would
   create a second source of truth for work state; duplicated state surfaces drift.
3. **Portability**: a mandatory server must pass the SessionStart health check on every
   install. Things/OmniFocus are macOS-app-bound; the check would permanently fail on
   any other platform.

Optional path (not pursued for now): things-mcp as an *optional* personal-productivity
server (health-check class "optional", macOS guard) — nice-to-have, not a system component.

---

## 2. Opus 4.8 Ultracode vs. Fable 5 — What orchestration can and cannot compensate

### 2.1 Documented model differences (verified against public sources, 2026-07)

| Aspect | Fable 5 (Mythos-class) | Opus 4.8 |
|---|---|---|
| SWE-Bench Pro | 80.3 % | 69.2 % |
| FrontierCode (Cognition) | 29.3 % | 13.4 % |
| Long-horizon memory | ~3× better retention on extended tasks | degrades on very long sequences |
| Pricing (in/out per MTok) | $10 / $50 | $5 / $25 (2× cheaper) |
| Latency | slower | moderate |
| Context / max output / cutoff | 1M / 128k / Jan 2026 | identical |
| Adaptive thinking | always on (not disableable) | opt-in |

The `best` alias (already the v8 orchestrator default) resolves to Fable 5 automatically
wherever an org has access — this strategy targets environments without Fable access.

### 2.2 Core finding

**Orchestration compensates for reliability, not capability.** Routine orchestrator
duties (risk classification, gate sequencing, verdict-matrix application, failure
recovery) are tier-insensitive: structured rule application works equally well on
Opus 4.8 xhigh. The *checkable* error class (wrong facts, missed call sites, format
violations, coverage gaps) is closable by structure. The *judgment* class is not.

### 2.3 Effective levers (with token-cost multiplier)

| Lever | Cost | Why it works |
|---|---|---|
| Deterministic hooks/scripts | ~1.05× | Regex on file paths triggers @api-guardian at 100 % recall regardless of model tier. Best ROI of any lever. |
| Short bounded task horizons + externalized state | 1.3–2× | Structurally avoids Opus' documented long-horizon degradation instead of out-reasoning it. |
| Adversarial verification of FACTUAL findings only | 2–4× | Counterexample-finding is easier than original synthesis, so same-tier skeptics add real signal. |
| Loop-until-dry for enumeration tasks | 3–10× | Multiple independently framed passes approach the recall a stronger model gets in one pass. |
| Dual parallel gates + decision matrix | ~1.2× | Converts post-build acceptance from judgment to rule application (tier-insensitive). Already in place. |
| Structured handoff templates | ~1.1× | Converts "remember to mention X" (capability) into "fill in field X" (compliance). |
| Judge panels ONLY on verdict conflicts | 2–3× on ~10–20 % of runs | Reduces tie-break variance where explicit adjudication criteria exist. |

### 2.4 Ineffective levers (do not adopt)

- **More subagents without verification** — same model family ⇒ correlated errors; N agents replicate the same blind spot N times and inflate fan-in load.
- **Thicker documentation/CLAUDE.md** — instruction-following is already tier-insensitive; the gap is judgment failures, not missing instructions. Extra doc mass aggravates long-context degradation.
- **Judge panels for design/architecture questions** — verifier collusion: same-tier judges share the prior and majority-vote the error through. Ensembles reduce variance, not bias; the capability gap IS bias.
- **Adversarial verification of decisions (vs. facts)** — "this architecture is suboptimal" has no mechanical counterexample; refutation would require generating the better design, which is exactly the missing capability.
- **Format validation as quality proxy** (length minimums) — Goodhart: validates that a report has 1000+ chars, not that the architecture is sound.
- **Blanket xhigh/ultracode everywhere** — effort raises reliability within the capability envelope, it does not extend the envelope.

### 2.5 Residual gap (not closable by orchestration — requires human gate)

1. Quality of the decomposition itself: all gates validate execution of the plan; none validates the plan against alternatives never generated.
2. Single-context cross-domain synthesis at fan-in; cross-cutting bugs live in the seams between subagent scopes.
3. Taste in ambiguous design decisions — not checkable, not refutable, not vote-able.
4. Correlated-miss floor: defects the same-tier verifier ensemble also misses return confident false negatives (the ~16 pp FrontierCode gap is a proxy for this slice). A unanimous PASS then suppresses the human escalation a lone uncertain verdict would have triggered.
5. Recognition that the request itself is malformed.

### 2.6 Economics warning

Fable 5 costs only 2×/token. The compensation stack compounds multiplicatively
(discovery 3–10× × verification 2–4×). Beyond roughly a **2× total token multiplier,
compensation costs more than Fable 5 would** — while staying below its ceiling.
Compensation must therefore be applied *selectively* (scoped levers above), and the
system needs a cost-warning threshold, which it currently lacks.

---

## 3. Re-check against v8.5.0 (the original analysis targeted v8.0.0)

### 3.1 Already fixed in v8.5.0

- Verdict format machine-parseable + enforced (`docs/templates/REPORT_TEMPLATES.md`, `scripts/validate-agent-output.js` stdin hook mode, wired argument-free on SubagentStop/TaskCompleted/TeammateIdle).
- Report drift (reports are tracked repo artifacts, committed at sprint integration).
- VERSION race / phantom releases (Plan-First ADR-004, `version-bump.js` single writer, CI invariant `release-consistency.yml` + `release-tag.yml`).

### 3.2 Still broken / open (verified 2026-07-06)

| # | Finding | Status | Evidence |
|---|---|---|---|
| 1 | **`check-api-impact.js` hook is a silent no-op** — wired with `"$CLAUDE_FILE_PATH"` env var that Claude Code never populates; script reads `process.argv[2]` only. Core Rule 4 auto-trigger (@api-guardian) is dead in repo AND install. | **still broken in 8.5** | `config/claude-settings.json:29`, `scripts/check-api-impact.js:42`; empirically confirmed: empty arg ⇒ exit 0, no output |
| 2 | `analyze-prompt.js` dropped from repo hook wiring in 8.5 but still shipped in `scripts/` and still wired (broken) in the live install — zombie state, needs formal deprecation or stdin rewrite | still-open | repo config has no UserPromptSubmit hook; `~/.claude/settings.json` still wires it with `$CLAUDE_USER_PROMPT` |
| 3 | **Install drift**: live `~/.claude` is at 8.0.0 — old agents (no Sprint Contract), no `skills/sprint-planning`, old `validate-agent-output.js` (no stdin mode), broken env-var hook wiring incl. SubagentStop. `apply-global-claude-setup.sh` explicitly never touches `settings.json` hooks ⇒ re-running the installer does NOT heal the hook wiring. | still-open | VERSION 8.0.0 vs 8.5.0; installer line "MCP servers and settings.json hooks are NOT touched" |
| 4 | Routing-decision audit log (Smart Routing gate-skips unlogged) | still-open | `skills/cost-efficiency/SKILL.md` defines signals, mandates no log |
| 5 | Adversarial verification not scoped to factual findings (finding-agnostic skeptic loop) | still-open | `skills/dynamic-workflows/SKILL.md` verification section |
| 6 | No human-review gate for judgment-class decisions (residual-gap class §2.5) | still-open | no rule in CLAUDE.md core rules or META-DECISIONS escalation cases |
| 7 | Cost ceiling / pre-execution cost warning for dynamic workflows | partially (prose tradeoff, no thresholds) | `skills/dynamic-workflows/SKILL.md` cost section |
| 8 | Finding-conflict resolution between parallel subagents (v8.5 covers WRITE conflicts via BLOCKED(conflict); conflicting FINDINGS still unadjudicated) | partially | REPORT_TEMPLATES BLOCKED categories |
| 9 | Inline architecture brief (3–5 bullets) has no required-field validation | partially | only the full @architect template is validated |
| 10 | Escalation decision tree (mandatory vs. optional escalation) | partially | META-DECISIONS 3 tiers + 5 cases, no decision tree |

### 3.3 New v8.5-introduced observations (secondary)

- Hot-file single-writer integration has no queuing/precedence rule for concurrent sprints.
- CI workflows (`release-consistency.yml`, `release-tag.yml`) are untested against real concurrent-release scenarios.
- Workflow decomposition itself is not subject to adversarial challenge (accepted: residual-gap class, mitigate via human gate, not more agents).

---

## 4. Recommended sprint plan (target v8.6.0 — PENDING USER APPROVAL)

Version relevance aggregate: MINOR (new optional mechanisms; no core-contract break).

- **Sprint 01 — Hook Repair & Contract Tests** (patch): port `check-api-impact.js` to stdin hook payload + argument-free wiring; formally deprecate or rewrite `analyze-prompt.js`; add a hook contract test simulating stdin payloads for every wired hook (wire into release-consistency CI). Closes findings #1, #2.
- **Sprint 02 — Install Sync & Drift Guard** (patch): installer/migration path that also repairs `settings.json` hook wiring (with backup); session-start drift warning (install version vs. repo release); execute the sync to bring `~/.claude` to current. Closes finding #3.
- **Sprint 03 — Routing Audit & Conflict Adjudication** (minor): routing-decision log line per gate-skip (sprint-file section, machine-checkable); escalation decision tree; finding-conflict adjudication procedure (judge panel only on conflict path, explicit criteria); minimal required-field check for inline arch briefs. Closes findings #4, #8, #9, #10.
- **Sprint 04 — Scoped Compensation Playbook** (minor): rewrite dynamic-workflows verification rules (adversarial verify FACTS only; design questions excluded); add mandatory human-review gate for judgment-class decisions to CLAUDE.md/META-DECISIONS; add cost thresholds (~2× multiplier warning) + `best`-alias note to AGENT_MODEL_SELECTION; hot-file queue rule. Closes findings #5, #6, #7 and the honest-limits documentation.

Execution: Sprint 01 → 02 sequential (02 syncs 01's fixes); Sprint 03 ∥ 04 possible
after 01 (disjoint write scopes except CLAUDE.md — serialize its integration).

Honest expectation: Sprints 01–04 buy parity on routine + checkable work and make the
residual judgment gap visible and human-managed. They do not make Opus 4.8 a Fable 5.
