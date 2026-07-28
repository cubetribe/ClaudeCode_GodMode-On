---
sprint: 03
slug: coherence-sweep
agent: builder-3 (skills)
scope: meta-decisions, greenfield-bootstrap, research, release (SKILL.md, both copies)
---

# Builder Report — Skills (meta-decisions, greenfield-bootstrap, research, release)

## Auftrag 1 — Eskalationsmodell zusammenführen (H18)

Replaced the flat five-point "Escalation Mechanism" list in `skills/meta-decisions/SKILL.md`
with the authoritative three-tier decision tree from `docs/orchestrator/META-DECISIONS.md`
§ Escalation Decision Tree (Tier 1 self-resolution, Tier 2 orchestrator resolution, Tier 3
MANDATORY human escalation vs. OPTIONAL logged judgment call). The sentence "a unanimous
agent PASS does not waive them" is present verbatim (`grep -F` confirmed, on a single
unwrapped line so the literal match holds). `grep -c "MANDATORY\|[Jj]udgment-class"` = 3
(> 0, was 0 before). The RARE matrix was left untouched — it already matches the version
`META-DECISIONS.md` was pulled to (Responsible=@builder, Accountable=Orchestrator, Reviewed
by=deterministic hook + @tester/@security/code-review, Escalated to=User); no `@validator`
reference existed in this file.

## Auftrag 2 — Architecture-Gate auf eine Schwelle (H19)

`greenfield-bootstrap/SKILL.md` no longer says "@architect first for any real feature".
Both the "Default route" step 4 and the "Hand-off targets" table now point to the Core
Rule 3 split gate (inline 3–5 bullet brief for small/medium work, @architect only for new
modules/breaking changes/cross-domain design/uncertainty) and explicitly say an empty repo
is not by itself a reason for a stricter gate. `grep -rn "first for any real feature"
skills/` returns no hits.

## Auftrag 3 — dekorative Grenzwerte (research)

Chose to keep the numbers but relabel them as guideline/target, not enforced limit — the
figures are still useful pacing information for the agent, and deleting them loses that
context for no gain. Changed "Timeout: 30 seconds MAX per task" to "Target budget: ~30
seconds per task (guideline, not an enforced limit...)" with an explicit note that
`agents/researcher.md` has no Timeout field and no hook enforces it. Renamed "Phase
Timeouts" to "Phase Budget (Guideline, Not Enforced)" and prefixed each figure with `~`.
Also softened the skill's frontmatter `description` from "with timeout limits" to "with a
non-enforced time budget guideline". Left "Graceful Degradation" section as-is (partial
report concept is independent of whether the number is a hard cutoff).

## Auftrag 4 — Versions-Header (release)

`skills/release/SKILL.md:7` header changed from "(v8.5)" to "(v8.6.0)" — full SemVer, as
required for `scripts/sync-version.js` manifest compatibility. Checked for `@validator`
residue (none) and for @scribe-writes-VERSION claims: the file already correctly scopes
@scribe to CHANGELOG only ("Only the release sprint writes VERSION; only @scribe writes
CHANGELOG.") — no fix needed there. The one remaining "v8.5" hit
(`docs/orchestrator/META-DECISIONS.md` line 10: "The pre-v8.5 'Version-First' rule ... is
retired") is a correct historical reference to the retired rule's name, not a drifted
version header — left unchanged.

## Diff verification (both copies)

Ran `diff` between `ON/skills/<name>/SKILL.md` and `~/.claude/skills/<name>/SKILL.md` for
all four files after syncing the install copies. Remaining diff in every case is exactly
one line — the `license:` frontmatter field present only in the repo copy, per the
install's existing convention (install copies also lack the repo's closing footer block,
consistent with how they were before this sprint). No content difference beyond that line
in any of the four files.

### Files Modified

- `skills/meta-decisions/SKILL.md` (repo) — escalation tree, judgment-class sentence
- `skills/greenfield-bootstrap/SKILL.md` (repo) — architecture gate aligned to Core Rule 3
- `skills/research/SKILL.md` (repo) — timeout reframed as non-enforced guideline
- `skills/release/SKILL.md` (repo) — version header v8.5 → v8.6.0
- `~/.claude/skills/meta-decisions/SKILL.md` (install mirror)
- `~/.claude/skills/greenfield-bootstrap/SKILL.md` (install mirror)
- `~/.claude/skills/research/SKILL.md` (install mirror)
- `~/.claude/skills/release/SKILL.md` (install mirror)

### Files Created

- None.

### Quality Gates

- [x] `grep -c "MANDATORY\|[Jj]udgment-class" skills/meta-decisions/SKILL.md` → 3 (>0)
- [x] `grep -F "a unanimous agent PASS does not waive them" skills/meta-decisions/SKILL.md` → present, verbatim
- [x] `grep -rn "first for any real feature" skills/` → no hits
- [x] `grep -n "scribe.*writes VERSION"` across the four files → no hits (release/SKILL.md correctly scopes @scribe to CHANGELOG only)
- [x] `diff` repo vs. install copy for all four files → only the `license:` frontmatter line differs
- [ ] Tests: no test suite covers markdown skill content directly; verification is via the `grep`/`diff` assertions above, matching the sprint's deterministic Test Strategy. Did not run `node scripts/sync-version.js --check` or `node scripts/test-hooks-contract.js` — those touch files outside this write scope (@builder-5's scope) and were not re-run here.

Write scope respected: only `skills/meta-decisions/SKILL.md`, `skills/greenfield-bootstrap/SKILL.md`,
`skills/research/SKILL.md`, `skills/release/SKILL.md` (repo + install mirrors) plus this report.
No conflicting foreign uncommitted changes were present in scope at start (`git status --short`
was clean for these paths before editing).
