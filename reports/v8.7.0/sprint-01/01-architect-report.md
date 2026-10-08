---
agent: orchestrator-inline
version: v8.7.0-dev
date: 2026-07-13
status: complete
task: License hardening — machine/human-readable proprietary declaration on every scrapeable surface
---

# Inline Architecture Brief: License Hardening

- **Decision:** Keep and sharpen the existing custom proprietary license (v2 with fork
  carve-out, mandatory attribution, explicit re-hosting/scraping prohibition) and
  propagate one canonical set of legal text blocks — defined once in the sprint file —
  onto every scrapeable surface: SKILL.md frontmatter `license` field (the field SkillHub
  reads with priority), Markdown footers that survive frontmatter stripping, script
  headers, NOTICE, README badge + top notice, package.json/plugin.json metadata.
  Implementation fans out to 4 builders with disjoint write scopes; gates are
  @validator ∥ @docs-dx.
- **Rejected alternative:** Switching to PolyForm Noncommercial / CC BY-NC-* — both
  permit non-commercial re-hosting with attribution, which is exactly what the
  maintainer wants to prohibit; GitHub cannot badge ANY non-OSS license (licensee
  matches only the 44 choosealicense texts), so the standard licenses buy no
  machine-readability either. Also rejected: removing GitHub topics (doesn't stop
  `filename:SKILL.md` code-search crawling; costs legitimate reach) and making the repo
  private / release-asset-only (kills the community/fork goal).
- **Constraints:** Canonical texts are copied verbatim, never paraphrased (legal wording);
  README/CHANGELOG/VERSION single-writer rules per sprint file; footers max one line of
  body text so skill/agent context injection stays negligible; script edits are
  comment-only (no behavioral change); CLAUDE.md and its template must stay in sync via
  `scripts/sync-version.js`.
- **Out-of-scope:** Enforcement against the four live infringers (takedowns/DMCA — the
  maintainer's separate track), GitHub topic/visibility changes, version bump (sprint 02).
- **Affected contracts/APIs:** none (no src/api behavior change; hook-test.ts gets a
  comment header only).
