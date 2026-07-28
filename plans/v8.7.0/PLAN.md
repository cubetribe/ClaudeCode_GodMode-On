# Plan v8.7.0 — "License Hardening"

> Goal: make the repo's proprietary, non-commercial license machine-readable and
> human-visible on every scrapeable surface, close the legal gaps in the LICENSE text
> (optional attribution, missing re-hosting prohibition, fork contradiction), and stop
> aggregator platforms from mislabeling the work as MIT/open-source. Forks and PRs on
> GitHub stay welcome; re-hosting on third-party platforms becomes explicitly prohibited
> and attributable as willful.

## Audit basis

Full research digest (dynamic workflow, 14 agents, every finding live-verified):
internal report, kept outside the public repository.

Key verified findings driving this plan:

1. **Active infringers:** SkillsMP re-hosts 13 of 14 skills as full text with ZIP
   download; SkillHub re-hosts agent-teams with a **fabricated MIT label** (hardcoded
   display fallback `dbSkill.license || 'MIT'` in their code — their API stores
   `license: null`); a ClawHub user re-uploaded GodMode v5.11.3 wholesale as his own
   skill (MIT-0, zero attribution); a GitHub aggregator repo calls the project
   "open-source" in three languages.
2. **Root cause:** GitHub's license API returns `NOASSERTION` for any custom license
   (licensee only matches the 44 choosealicense texts — a NC/proprietary license can
   NEVER get a GitHub badge). Scrapers fill that vacuum with defaults. All 14 SKILL.md
   frontmatters carry no `license` field although the Agent-Skills spec supports one —
   and SkillHub reads exactly that field **with priority** over repo metadata.
3. **LICENSE gaps:** §5 makes attribution explicitly optional ("appreciated but not
   required"); §4 literally bans forks (contradicting intent and GitHub ToS D.5);
   no scraping/re-hosting prohibition; copyright year stuck at 2025.
4. **MIT decoys:** example snippets with `"license": "MIT"` in
   `config/domain-config.schema.json` and `docs/policies/DOMAIN_PACK_SPEC.md` are the
   plausible source for naive scanners' false MIT labels.
5. **Distribution leaks:** installer copies agents/skills/scripts/CLAUDE.md to
   `~/.claude/` without the LICENSE; 14/19 scripts and 5/6 prompt files carry no
   copyright; CONTRIBUTING has no contributor-license clause (blocks any future
   commercial licensing of contributed code).

Strategy constraint (from the research): scraping a public repo cannot be prevented
technically, and standard NC licenses (PolyForm NC, CC BY-NC-*) would MISS the goal —
they permit non-commercial re-hosting with attribution. The sharpened custom license is
the only fit. The repo hardening makes every future mislabeling provably negligent and
gives every scraped copy a self-identifying notice. Enforcement against the four live
cases (takedowns, DMCA chain) is a separate track owned by the maintainer — explicitly
out of scope for this plan.

## Sprint index

| Sprint | Slug | Content | Version Relevance | Execution |
|---|---|---|---|---|
| 01 | license-hardening | LICENSE v2, NOTICE, README badge + notice, SKILL.md license frontmatter + footers, agent/prompt/doc footers, script headers, package.json/plugin.json metadata, MIT-decoy fix, CONTRIBUTING clause, installer LICENSE copy | minor | parallel within sprint (4 disjoint builder scopes) |
| 02 | release | bump 8.6.0→8.7.0 via tooling, changelog promotion, invariant checks, PR (with permission) | — (aggregates: minor) | last |

## Global ownership matrix (hot files)

| Hot file | Writer | When |
|---|---|---|
| `CHANGELOG.md` [Unreleased] | @scribe only | sprint-01 integration (serialized) |
| `VERSION` + touchpoints | `scripts/version-bump.js` only | sprint 02 |
| `README.md` | @builder-1 only (single writer inside sprint-01) | sprint 01 |
| `plans/v8.7.0/**` | orchestrator only | status/Result updates |
| `ROADMAP.md` | orchestrator | sprint 02 (if entry needed) |

## Decisions taken in planning

- **Keep the custom license (sharpened), no switch to PolyForm/CC** — only a custom
  text covers "forks yes / re-hosting no / NC / attribution required" simultaneously
  (research report §3). GitHub badge is unattainable for ANY non-OSS license, so the
  machine-readable story moves to frontmatter/package metadata/NOTICE instead.
- **GitHub topics stay** — they aid discovery by humans too; removing them would not
  stop `filename:SKILL.md` code-search crawling anyway. Defense = metadata + notices.
- **Enforcement (takedowns) is out of plan scope** — maintainer decides separately
  ("Plan B"); research report §4/§5 documents the paths.
- **Canonical legal texts are defined once in the sprint file** and injected verbatim
  into all builder dispatches — no agent paraphrasing of legal wording.
