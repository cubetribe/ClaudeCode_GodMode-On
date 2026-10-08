---
sprint: 05
slug: core-branding-opus55
plan: plans/v8.7.0/PLAN.md
status: done
execution: parallel
owner: orchestrator
ux_gate: skip
---

# Sprint 05 — GodMode Core für Claude Code + Opus 5.5

## Goal

Das Paket tritt öffentlich als **GodMode Core for Claude Code** auf (Produktfamilie, festgelegt im
Codex-Pendant mit GodMode Core 3.1.1 am 2026-10-04) und verlinkt gegenseitig auf GodMode Core for
Codex und GodMode Pro. Gleichzeitig wird es auf den aktuellen Stand von Claude Code (2.1.286) und
Opus 5.5 gebracht: Opus 5.5 ist die Top-Empfehlung, die Ultracode-Bedienung stimmt, die
Kostenregel stimmt, und Core Rule 2 folgt Anthropics Delegationslinie.

## Maintainer-Entscheidungen (2026-10-07)

1. **Core Rule 2 wird umgestellt** auf Anthropics Formulierung (siehe Kanonischer Text unten).
2. **Gemeinsamer Release als 9.0.0** — dieser Sprint läuft vor dem Release-Sprint 06.
3. **Empfohlenes Orchestrator-Modell: `/model opus` (→ Opus 5.5)**, nicht `best` (→ Fable 5.1, wo
   verfügbar, 2,5× Listenpreis).
4. **Branding wie Codex:** öffentlicher Name „GodMode Core for Claude Code — currently CC_GodMode".
   Repo-Name `ClaudeCode_GodMode-On`, Plugin-ID `cc-godmode`, Agent-/Skill-Namen, Pfade bleiben
   stabil. LICENSE/NOTICE werden **nicht** geändert.

## Faktenbasis (verifiziert)

Reports: `reports/v8.7.0/sprint-05/00-researcher-claude-code-changes-report.md`,
`reports/v8.7.0/sprint-05/00-researcher-opus-5-5-model-report.md`,
`reports/v8.7.0/sprint-05/00-orchestrator-ultracode-verification.md`.

| Fakt | Wert |
|---|---|
| Opus 5.5 | `claude-opus-5-5`, $4/$20 pro MTok, 1M Kontext, 128K Output, Default-Effort `medium`, Release 2026-09-22; Claude-Code-Default für Pro/Max/Team/Enterprise/API |
| Sonnet 5.5 | `claude-sonnet-5-5`, $2/$10, 1M Kontext |
| Fable 5.1 | `claude-fable-5-1`, $10/$50 — **2,5×** Opus 5.5 (Input/Output) |
| Haiku 4.5 | `claude-haiku-4-5-20251001`, $1/$5, 200K Kontext |
| Aliase | `opus`→Opus 5.5, `sonnet`→Sonnet 5.5, `fable`→Fable 5.1, `best`→Fable 5.1 wo verfügbar sonst Opus 5.5, `opusplan`→Opus 5.5 Plan / Sonnet 5.5 Ausführung, `haiku`→Haiku 4.5 |
| Legacy (nicht deprecated) | Opus 4.8, Sonnet 4.6, Fable 5 |
| Effort | `low | medium | high | xhigh | max`; `ultracode` ist **keine** Effort-Stufe |
| Ultracode | Schalter: `/effort ultracode` (bzw. `/effort ultracode on|off`), nur für die Session, Effort bleibt unverändert, braucht aktivierte Dynamic Workflows (`/config`), modellabhängig verfügbar; alternativ Schlüsselwort `ultracode` im einzelnen Prompt |
| Opus-5.5-Guidance | keine expliziten Verifikationsschritte/„use a subagent to verify"; Opus delegiert von sich aus eher → explizite Kriterien und Obergrenzen; Effort senken statt „weniger denken" prompten; Effort-Wechsel invalidiert Prompt-Cache |
| Agent Teams | weiterhin experimentell (`CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1`) |

## Kanonische Texte (verbatim in die Dispatches)

**Core Rule 2 (neu):**

> 2. **Delegate when it pays** — Delegate to a subagent for large tasks that are genuinely
>    independent and parallelizable, or that need a specialist's tools or a separate write scope.
>    Work you can finish yourself in a handful of tool calls, you do yourself and note. Never
>    delegate to verify or double-check your own work — that is what the deterministic checks are for.

**Model strategy (neu, CLAUDE.md „Ultracode Orchestrator"):**

> **Model strategy:** Run the orchestrator on `opus` (Opus 5.5) — the recommended default and the
> model this system is tuned for. `best` resolves to Fable 5.1 where the org has access (about
> 2.5× Opus 5.5's list price) and is an optional upgrade for tasks where Opus 5.5 at higher effort
> falls short; no feature depends on it. Subagents stay on tiered aliases (`haiku` for simple ops,
> `sonnet` for implementation, `opus` for architecture and security).

**Produktfamilie (README, Kurzform):**

| Product | Best fit | What it provides |
|---|---|---|
| **GodMode Core for Claude Code** — this repository (currently CC_GodMode) | You operate your own Claude Code setup | Self-installed orchestrator rules, 14 agents, 14 skills, hooks and release tooling, under its own license terms |
| [**GodMode Core for Codex**](https://github.com/cubetribe/CODEX_GodMode_ON) | You operate your own Codex setup | The separately maintained Codex workflow package |
| [**GodMode Pro by Nerdsmiths**](https://godmode.nerdsmiths.de/) | You want an integrated application and assisted setup | A separate proprietary desktop application for project control, result review, maintained integrations, and scoped onboarding and support |

Dazu der Satz: Core has no package subscription; Claude access and usage are paid separately.
Free availability for private, non-commercial use does not make it open source and does not change
the license. Pro has its own availability, pricing and service terms (Landingpage).

## Scope

1. README: Produktfamilie, Titel/Untertitel, Modell-/Ultracode-Bedienung, veraltete Zahlen
   (13 Skills, „Version-first workflow"), Opus-4.8-Stellen.
2. CLAUDE.md + `templates/CLAUDE-ORCHESTRATOR.md` (Spiegel): Core Rule 2, Model strategy,
   lokale Produktnotiz durch finale Kurzzeile ersetzen.
3. Modell-/Kosten-Doku: `docs/AGENT_MODEL_SELECTION.md`, `skills/dynamic-workflows/SKILL.md`
   (~2× → ~2,5×), übrige Opus-4.8/Fable-5-Stellen in docs/skills.
4. Manifeste und Prompts: `.claude-plugin/plugin.json` (Beschreibung, Keywords, falsche „15 agents
   (8 core …)"), `package.json`-Beschreibung, `CC-GodMode-Prompts/*`, `scripts/analyze-prompt.js`.

## Non-Goals

- Keine Änderung an LICENSE, NOTICE, Lizenz-Badge, Lizenztext-Footern.
- Keine Umbenennung von Repo, Plugin-ID, Agenten, Skills, Pfaden.
- Keine Versionsstrings (`8.6.0`) anfassen — `sync-version.js` besitzt sie.
- Keine Änderung an Agent-Frontmatter-Modellen/Efforts (Aliase lösen automatisch auf; ein
  Effort-Sweep braucht Evals und ist eigener Sprint).
- Historische Dokumente (`CHANGELOG.md` alte Einträge, `DECISIONS.md`, `ROADMAP.md`-Zeile
  „Fable 5 Light", `reports/**`, `archive/**`, ältere `plans/**`) bleiben historisch.

## Files / Write Scope (ownership)

| Path / Glob | Writer | Notes |
|---|---|---|
| `README.md` | @builder-1 (readme) | Hot File, Single Writer |
| `CLAUDE.md`, `templates/CLAUDE-ORCHESTRATOR.md` | @builder-2 (law) | Template spiegelt CLAUDE.md unterhalb seines Header-Kommentars |
| `docs/**` (ohne `docs/templates/**`), `skills/**` | @builder-3 (docs-skills) | |
| `.claude-plugin/plugin.json`, `package.json` (nur `description`), `CC-GodMode-Prompts/**`, `scripts/analyze-prompt.js` | @builder-4 (manifests-prompts) | |
| `CHANGELOG.md` `[Unreleased]` | @scribe only | Integration, serialisiert |
| `plans/v8.7.0/**` | orchestrator | |
| `reports/v8.7.0/sprint-05/*` | jeder Agent mit `Write` | |

## Risks

- **Template-Drift CLAUDE.md ↔ Template** → @builder-2 besitzt beide, Abnahme per `diff`.
- **Behauptungen ohne Beleg** (z. B. Benchmarks, „optimal") → nur die Fakten der Tabelle oben.
- **`best` vs. `opus`** wird an vielen Stellen erklärt → überall dieselbe Aussage (Model strategy).

## Acceptance Criteria

1. `grep -rnE "Opus 4\.8|claude-opus-4-8|sonnet-4-6|/effort ultracode.*xhigh|resolves to Opus 4" --exclude-dir={node_modules,archive,reports,.git,plans} . | grep -v CHANGELOG.md | grep -v DECISIONS.md` liefert nur bewusst historische Treffer (im Report begründet).
2. README enthält Produktfamilien-Tabelle mit den drei Links und `/model opus` + `/effort ultracode`.
3. Core Rule 2 ist in CLAUDE.md und Template wortgleich der kanonische Text; `diff` zwischen
   CLAUDE.md und Template-Body zeigt nur den Header.
4. `node scripts/sync-version.js --check`, `node scripts/test-hooks-contract.js`,
   `node scripts/release-check.js` (bzw. dessen Pre-Release-Modus) grün.
5. `claude plugin validate` gegen `.claude-plugin/plugin.json` ohne Fehler.

## Test Strategy

Grep- und Skriptläufe wie oben, Plugin-Validator mit Claude Code 2.1.286. Kein Modell-Gate:
reine Doku-/Regeltext-Änderung, `ux_gate: skip` (kein UI im Write Scope).

## Routing Log

- 2026-10-07 | path: smart-routing | signals: CLAUDE.md rules (Core Rule 2), README | skipped: @architect (keine neue Struktur; Regeltext vom Maintainer entschieden), @api-guardian (keine API/Type-Pfade), @tester (ux_gate: skip, kein UI), @security (keine Sicherheitsfläche) | ux_gate: skip

## Changelog Note

`Changed` — öffentlicher Name GodMode Core for Claude Code mit Produktfamilie und Querverlinkung;
Opus 5.5 als empfohlenes Orchestrator-Modell (`/model opus`), Ultracode als Schalter
(`/effort ultracode`); Core Rule 2 „Delegate when it pays"; Fable-Kostenregel ~2,5×.
`Fixed` — veraltete Modellzuordnungen (Opus 4.8/Sonnet 4.6), falsche Agentenzahl im Plugin-Manifest.

## Version Relevance

**major** — Core Rule 2 ändert das Orchestratorverhalten (CLAUDE.md rules, `VERSIONING.md:32-33`).

## Result

Done 2026-10-07. Vier parallele Builder auf disjunkten Scopes, alle `DONE`, keine Scope-Verletzung.
Abnahme über eigene Läufe, nicht über Verdicts.

**Akzeptanzkriterien**

1. ✓ Grep auf `Opus 4.8|claude-opus-4-8|sonnet-4-6|resolves to Opus 4|Delegate by default` (ohne
   CHANGELOG/DECISIONS/reports/archive/plans) trifft nur noch zwei bewusste Legacy-Hinweise in
   `docs/AGENT_MODEL_SELECTION.md` (Opus 4.8/Sonnet 4.6/Fable 5 als Legacy benannt).
2. ✓ README: Produktfamilien-Tabelle mit Codex- und Pro-Link, `/model opus` + `/effort ultracode`.
3. ✓ Core Rule 2 wortgleich in CLAUDE.md und Template; Body-`diff` leer.
4. ✓ `sync-version.js --check` (14 Touchpoints), `test-hooks-contract.js`, `release-check.js` grün.
   `verify-install.js` meldet 2 Fehler (LICENSE/NOTICE-Kopie fehlt) — betrifft die lokale
   Installation des Maintainers (Stand vor Sprint 01), nicht das Repo; behoben durch einen
   Installer-Lauf nach dem Release.
5. ✓ `claude plugin validate .` (2.1.286) besteht; einzige Warnung: Root-`CLAUDE.md` wird vom
   Plugin nicht als Kontext geladen (vorbestehend, by design — Aktivierung per Projekt-Kopie).
   Zusätzlich echter Ladetest: `claude -p --plugin-dir .` lädt `cc-godmode` mit 14 Agenten und
   14 Skills.

**Befunde**

- Builder 4 korrigierte 42 vorbestehende Validator-Fehler im Manifest (Pfade ohne `./`, Skills
  als Datei statt Verzeichnis) — durch Ladetest bestätigt.
- Der Ladetest zeigte nebenbei: Die globale `~/.claude/CLAUDE.md` des Maintainers trägt noch die
  alte Rule 2. Sie liegt außerhalb des Repos und wird nicht vom Installer verwaltet.
- Das Terminal-`claude` der Maschine steht auf 2.1.220; die Desktop-App läuft auf 2.1.286.
- `plans/v9.1.0/` (untracked, Planung „Leitstand") gehört nicht zu diesem Release und bleibt
  unversioniert.
