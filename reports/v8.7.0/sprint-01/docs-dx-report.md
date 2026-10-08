---
agent: docs-dx
version: v8.7.0-dev
date: 2026-07-13
status: APPROVED
---

# @docs-dx Report — Sprint 01 "license-hardening"

## Task
Read-only DX/documentation review of the user-facing license-hardening surfaces per `plans/v8.7.0/sprint-01-license-hardening.md`: README.md (badge row, blockquote hint, License section), NOTICE, CONTRIBUTING.md (Contributor License section placement), footer samples in SKILL.md/agents files, CLAUDE.md footer, and cross-consistency between README/LICENSE/NOTICE.

## Findings

### README.md — APPROVED
- Badge row (lines 9–15) renders correctly; the Proprietary badge is first and links to `LICENSE`.
- The blockquote one-liner (line 19) sits directly under the badge row, is concise, non-alarming in tone, and links both `LICENSE` and `NOTICE`. It states the core deal (private use free, forks/PRs welcome, re-hosting prohibited, attribution required) in one readable sentence.
- License section (lines 223–231) is consistent with LICENSE/NOTICE: 2025-2026 copyright, attribution required, forks/PRs on GitHub expressly welcome, re-hosting on third-party platforms prohibited, links to both LICENSE and NOTICE.

### NOTICE — APPROVED
- Self-contained and self-explanatory: a reader who finds only this file on a scraper platform gets the full picture (proprietary, not MIT/Apache, forks welcome on GitHub, re-hosting prohibited, attribution required) plus the explicit statement that off-repo/off-fork discovery implies unauthorized redistribution. Good design for the sprint's stated goal (survives re-hosting).

### CONTRIBUTING.md — APPROVED
- "Contributor License" section (lines 175–190) is placed after the code-contribution/testing flow and before "Code of Conduct" — a sensible, non-buried location a PR author will actually reach.
- No contradiction with the "Release Law for Contributors" section further down; both sections are complementary (contribution IP grant vs. release/versioning process).

### Footer samples — APPROVED
- `agents/docs-dx.md` and `skills/sprint-planning/SKILL.md` both end with the canonical footer verbatim, rendering as a clean horizontal-rule-separated italic line; it does not interrupt or contradict the preceding content.
- `CLAUDE.md` footer (in the live orchestrator prompt) is a single declarative sentence with no imperative language — confirmed it does not alter orchestrator behavior, matching the sprint's own risk assessment.

### Cross-consistency (README / LICENSE / NOTICE) — APPROVED
- All three sources agree: private/non-commercial free use, commercial use needs permission, GitHub forks/PRs expressly welcome, third-party re-hosting/scraping/mirroring prohibited, attribution required, 2025-2026 copyright. No contradictions found.

## Minor Issues (non-blocking — recommendations only)

1. **File:** `templates/CLAUDE-ORCHESTRATOR.md`
   **Line(s):** 2
   **Severity:** OUTDATED
   **Issue:** The HTML header comment still says `CC_GodMode project orchestrator template (v8.5).` while the rendered `# CC_GodMode v8.6.0` title (line 9) and the footer at the bottom both correctly say v8.6.0. This is residual drift from before the sprint 01 AC ("fix the v8.5.0 footer drift") — the *footer* is fixed, but this header comment was apparently not in scope and was missed.
   **Recommended wording:** Drop the version number from the comment entirely (since the file already states it mirrors CLAUDE.md and is kept in sync by tooling): `CC_GodMode project orchestrator template.` — this avoids future drift altogether rather than requiring a manual bump each release.

2. **File:** `CC-GodMode-Prompts/CCGM_Prompt_01-SystemInstall-Auto.md`
   **Line(s):** 893–895
   **Severity:** SUGGESTION
   **Issue:** The canonical footer (line 893) is immediately followed by a leftover one-liner, `Private use permitted. Commercial use requires permission.` (line 895), which restates part of the footer's content in a different, shorter phrasing. The sprint scope explicitly called for "normalize the existing block in `CCGM_Prompt_01-SystemInstall-Auto.md`" — this looks like the pre-existing block wasn't fully removed after the canonical footer was added.
   **Recommended wording:** Remove line 895 (`Private use permitted. Commercial use requires permission.`) so the canonical footer is the single license statement in the file.

## Verdict

**APPROVED**

No misleading statements, no contradictions between README/LICENSE/NOTICE, no factual errors. The two items above are cosmetic drift/duplication, not errors that mislabel or misstate the license — they do not block the sprint. Recommend @builder-4 (owns `templates/*`) and @builder-3 (owns `CC-GodMode-Prompts/*`) apply the two one-line cleanups in a follow-up commit or the next touch of these files.
