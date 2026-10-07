---
agent: builder-1 (readme)
date: 2026-10-07
sprint: 05
---

# Builder report: README.md (Sprint 05)

## Files-Changed
- `README.md`

## Changes
- H1 "GodMode Core for Claude Code" + "currently published as CC_GodMode" (badges, URLs, IDs, version strings untouched).
- New "Choose your GodMode" section after the license notice (canonical 3-row table, links, subscription/licensing sentence).
- Daily Usage: `/model opus`, optional `/effort xhigh`, `/effort ultracode` as session-only switch (needs dynamic workflows in /config; keyword `ultracode` per prompt); `best` -> Fable 5.1 (~2.5x) optional; Claude Code 2.1.286 / 2.1.28x+.
- Opus 4.8 / "best resolves to Opus 4.8" replaced (What Is This?, Parallel-First); no xhigh claim for ultracode.
- ASCII example: version-bump line replaced with plan/sprint wording.
- Rules item 2 merged: "Delegate when it pays" + Smart Routing default (still 10 items).
- Version section: 14 skills; "Version-at-release workflow".

## Verification
- `node scripts/sync-version.js --check`: see orchestrator output below
- grep for `4.8`, `best.*Opus`, `13 skills`, `Version-first`: empty
