---
agent: builder-3 (docs-skills)
date: 2026-10-07
sprint: 05 (plan v8.7.0)
status: DONE
---

# Builder-3 Report: docs and skills model/ultracode alignment

## Files-Changed
- docs/AGENT_MODEL_SELECTION.md: aliases and pricing table to Opus 5.5 / Sonnet 5.5 / Haiku 4.5 / Fable 5.1, orchestrator on `opus`, ultracode as separate switch, economics section rewritten to the 2.5x rule, legacy note
- skills/dynamic-workflows/SKILL.md: ultracode trigger text (switch, effort unchanged, /config requirement, keyword), settings example, ~2.5x rule and worked example
- docs/ARCHITECTURE.md, docs/INSTALLATION.md, docs/orchestrator/MODES.md, docs/orchestrator/WORKFLOWS.md, docs/policies/CONTEXT_SCOPE_POLICY.md, docs/STORY.md, skills/agent-teams/SKILL.md: model facts and ultracode wording

## Verification
- sync-version.js --check: all 14 touchpoints consistent with 8.6.0 (no version strings touched)
- No hits for "non-trivial goes", "Delegate by default", teammateDefaultModel in docs/skills (nothing to align; agent-teams already states experimental + env flag)

## Intentionally kept hits
- docs/AGENT_MODEL_SELECTION.md:77-78, 135: Opus 4.8 / Sonnet 4.6 / Fable 5 named as legacy (still available, not deprecated); correct current-tense facts.
- docs/AGENT_MODEL_SELECTION.md:106: "Fable 5 Light" names the historical v8.6.0 release.
- docs/AGENT_MODEL_SELECTION.md Effort-field "calibration note" left unchanged (agent frontmatter sweep is a non-goal).
- Generic "Opus"/"Sonnet" agent-tier mentions (@architect (Opus)) remain valid via aliases.

## Notes
- "cache read about 1.25x" taken from the researcher report (0.25/0.20).
