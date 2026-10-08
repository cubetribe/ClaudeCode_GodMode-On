---
sprint: 06
slug: release
plan: plans/v8.7.0/PLAN.md
status: done
execution: sequential
owner: orchestrator
ux_gate: skip
---

# Sprint 06 — Release

Letzter Sprint. Führt den Versions-Bump über die Tooling-Kette aus und bringt den Release auf
GitHub. Läuft erst, wenn Sprint 01–05 auf `done` stehen.

## Goal

`VERSION`, `CHANGELOG.md`, Tag und GitHub Release sind konsistent, die Invariante hält, und der
Release ist über einen PR mit Merge-Commit auf `main` gelandet — mit ausdrücklicher Freigabe des
Maintainers für Push, Tag und Veröffentlichung.

## Entschieden: 9.0.0 (major)

**Maintainer-Entscheidung 2026-07-28.** Der Bump lautet
`node scripts/version-bump.js major` ⇒ **8.6.0 → 9.0.0**.

Das `Version Relevance`-Feld von Sprint 02 wurde entsprechend von „minor" auf „major" korrigiert —
es war vom Orchestrator zu niedrig gesetzt worden, während der Commit den Bruch bereits trug.

**Ablage bleibt unter dem Arbeitslabel:** `plans/v8.7.0/` und `reports/v8.7.0/` werden **nicht**
umbenannt. Sie tragen den Namen, unter dem geplant wurde, nicht die Release-Nummer. Ein
rückwirkendes Umbenennen würde Verweise in bereits committeten Reports und Commit-Messages brechen
— genau die stille Inkonsistenz, gegen die Sprint 03 angetreten ist. Das `Result` dieses Sprints
hält den Unterschied ausdrücklich fest.

**Was Nutzer beim Upgrade tun müssen** (gehört in die Release-Notes, nicht nur ins CHANGELOG):
- `subagent_type: validator` existiert nicht mehr — ersatzlos entfernen oder durch `/code-review`
  ersetzen. Die deterministischen Checks laufen jetzt über den Hook `verify-changes.js`.
- Wer eine eigene `~/.claude/settings.json` pflegt: der Installer ergänzt ab dieser Version den
  `hooks`-Block (mergend, mit Backup, abwählbar über `--no-hooks`).
- Sprint-Dateien tragen ein neues Pflichtfeld `ux_gate: auto | human | skip`.
- Wer `qualityGates` aus `.ccgm-state.json` ausliest: die Form ist jetzt
  `{checks, tester, security}`; `null` heißt „war nicht gefordert", nicht „fehlt noch".

## Die Begründung im Einzelnen

**Grundlage der Entscheidung.**
`docs/orchestrator/VERSIONING.md:76-78`: die Klassifikation entsteht durch Aggregation der
`Version Relevance`-Felder — *„never by an implementer agent"*.

Die Sprint-Felder sagen: 01 minor, 02 minor, 03 patch, 04 minor. Aggregiert ⇒ **minor ⇒ 8.7.0**.

**Die Klassifikationsregel derselben Datei sagt etwas anderes** (`VERSIONING.md:32-33`):

> **MAJOR** — breaking changes to CLAUDE.md rules, agent handoff/verdict contracts, workflow
> commands, or install surface

Sprint 02 hat drei dieser vier Kategorien getroffen:
- **CLAUDE.md rules** — Core Rules 5, 6, 7 und 8 neu formuliert
- **Agent-Roster** — @validator ist nicht mehr dispatchbar; wer `subagent_type: validator` benutzt,
  bekommt einen Fehler. 15 → 14 Agenten.
- **Workflow commands** — die Flow-Tabelle nennt `checks` statt `@validator + @tester`

Sprint 04 trifft die vierte: **install surface** — der Installer schreibt künftig
`~/.claude/settings.json`.

Der Commit von Sprint 02 trägt deshalb bereits `refactor(gates)!` mit `BREAKING CHANGE`-Footer.

**Meine Einschätzung: Das `Version Relevance`-Feld von Sprint 02 war zu niedrig gesetzt — von mir.
Nach der Regel ist es major.**

**Präzedenz, die dagegen sprechen könnte:** Das Repo hat schon einmal einen v9.0.0 vorbereitet
(`f81c49e`) und ihn dann bewusst auf v8.5.0 zurückgestuft (`d7c6078`). Es gibt also eine gelebte
Zurückhaltung gegenüber der 9.

### Folge für die Ablage

Bei **9.0.0** sind `plans/v8.7.0/` und `reports/v8.7.0/` fehlbenannt. Zwei Wege:
- **(a) Umbenennen** auf `v9.0.0` — korrekt und konsistent mit der Namenskonvention, erzeugt aber
  Bewegung in ~40 Dateipfaden und macht Verweise in Reports und Commits ungültig.
- **(b) Stehen lassen** — die Ordner tragen dann das Arbeitslabel, unter dem geplant wurde, nicht
  die Release-Nummer. Ehrlich, solange der Release-Sprint das im `Result` festhält.

Empfehlung: **(b)**. Historische Artefakte rückwirkend umzubenennen bricht Verweise in bereits
committeten Reports — genau die Sorte stiller Inkonsistenz, gegen die Sprint 03 angetreten ist.

## Scope

1. **Preflight** — Sprint 01–05 auf `done`, Arbeitsbaum sauber, `[Unreleased]` nicht leer.
2. **Bump** — `node scripts/version-bump.js <major|minor>` nach der Entscheidung oben. Das Skript
   erledigt in einem Zug: Eindeutigkeit gegen CHANGELOG **und** git-Tags prüfen, `[Unreleased]` →
   `## [X.Y.Z] - <Datum>` promoten (bricht ab, wenn leer), `sync-version.js --sync` über alle 14
   Touchpoints.
3. **Verifizieren** — `sync-version.js --check`, `release-check.js`, `test-hooks-contract.js`.
   Alle drei müssen grün sein, bevor irgendetwas nach außen geht.
4. **ROADMAP** — Eintrag auf `released` flippen, falls vorhanden.
5. **Release-PR** — `release/vX.Y.Z` → `main`, **Merge-Commit** (`gh pr merge --merge`), niemals
   Squash. Das ist Repo-Recht (`VERSIONING.md:53-54`, `CONTRIBUTING.md:208`) und schlägt die
   gegenteilige Empfehlung jedes installierten Skills — siehe die in Sprint 03 verankerte
   Vorrangregel.
6. **Tag und GitHub Release** — `.github/workflows/release-tag.yml` entwirft den Release aus dem
   CHANGELOG-Abschnitt. Veröffentlichen nur mit ausdrücklicher Freigabe.

## Non-Goals

- Keine inhaltlichen Änderungen. Was nicht in Sprint 01–05 gelandet ist, kommt in die nächste
  Version.
- Kein Force-Push, kein Rewrite geteilter Historie.
- Kein Push ohne ausdrückliche Freigabe (Core Rule 9).

## Files / Write Scope (ownership)

| Path / Glob | Writer | Notes |
|---|---|---|
| `VERSION` + alle 14 Touchpoints | `scripts/version-bump.js` **only** | niemals von Hand |
| `CHANGELOG.md` (Promotion `[Unreleased]` → datierte Überschrift) | `scripts/version-bump.js` **only** | |
| `ROADMAP.md` | orchestrator | Status-Flip |
| `plans/v8.7.0/sprint-06-release.md` | orchestrator | Result |
| PR, Tag, Release | @github-manager | **nur mit Freigabe** |
| `reports/v8.7.0/sprint-06/*` | jeder Agent mit `Write` | |

## Risks

- **`[Unreleased]` enthält Einträge aus fünf Sprints.** Vor dem Bump einmal lesen: ergibt der
  Abschnitt als Release-Notes gelesen Sinn, oder ist er eine Liste ohne Erzählung? Der
  Bump promotet ihn unverändert.
- **Die Klassifikationsentscheidung ist nicht umkehrbar**, sobald der Tag steht. Vorher klären.
- **Vier Commits, ein Release.** Die Historie ist sauber getrennt (Sprint 01, 02, 03, plus 04) —
  das soll der Merge-Commit erhalten, deshalb kein Squash.
- **`playwright` ist weiterhin nicht verbunden.** Für diesen Sprint irrelevant (`ux_gate: skip`),
  aber die Release-Notes sollten nicht behaupten, das UX-Gate sei einsatzbereit.

## Acceptance Criteria

1. `node scripts/sync-version.js --check` grün über alle 14 Touchpoints.
2. `node scripts/release-check.js` meldet `VERSION == oberster CHANGELOG-Eintrag == Tag`.
3. `node scripts/test-hooks-contract.js` vollständig grün.
4. `node scripts/verify-install.js` grün (aus Sprint 04).
5. Der CHANGELOG-Abschnitt der neuen Version enthält die Einträge aller fünf Sprints und liest
   sich als zusammenhängende Release-Notiz.
6. PR ist mit **Merge-Commit** gemergt, nicht gesquasht.
7. Tag und GitHub Release existieren und tragen dieselbe Version wie `VERSION`.

## Test Strategy

Ausschließlich die drei Skript-Invarianten plus `verify-install`. Kein Modell-Gate — an einem
Release gibt es nichts zu beurteilen, nur zu prüfen.

## Changelog Note

Keine eigene. Der Release-Sprint schreibt keinen `[Unreleased]`-Eintrag; er promotet den
vorhandenen.

## Version Relevance

**major** — aggregiert aus Sprint 01 (minor), 02 (**major**, korrigiert), 03 (patch), 04 (minor), 05 (**major**).
Höchster Wert gewinnt. Ergebnis: **9.0.0**.

## Result

Done 2026-10-07 (Maintainer-Freigabe für Release und Push im Chat, 2026-10-07).

- `node scripts/version-bump.js major` ⇒ **8.6.0 → 9.0.0**, `[Unreleased]` → `## [9.0.0] - 2026-10-07`,
  14 Touchpoints synchronisiert. Das vom Skript angelegte leere `reports/v9.0.0/` wurde entfernt —
  Ablage bleibt unter dem Arbeitslabel `v8.7.0` (Entscheidung (b) oben).
- Der Changelog-Abschnitt wurde vor dem Bump zu einer zusammenhängenden Release-Notiz umgebaut
  (Breaking Changes, Upgrading from 8.6.0, Added, Changed, Fixed; deutsche Einträge übersetzt).
- Release-Branch `release/v9.0.0` (enthält Sprints 01–06), ROADMAP-Zeile v9.0.0 als `released`.

**Akzeptanzkriterien**

1. ✓ `sync-version.js --check` — 14/14 Touchpoints auf 9.0.0.
2. ✓ `release-check.js` — Invariante hält (Release in flight auf `release/v9.0.0`); nach Merge
   und Tag erneut zu prüfen.
3. ✓ `test-hooks-contract.js` grün.
4. ⚠ `verify-install.js` — lokale Installation des Maintainers steht auf 8.6.0 und hat noch keine
   LICENSE/NOTICE-Kopie; grün erst nach `./scripts/apply-global-claude-setup.sh` (verändert
   `~/.claude/settings.json` mit Backup — separater Schritt mit Freigabe).
5. ✓ CHANGELOG 9.0.0 enthält alle fünf Sprints als zusammenhängende Notiz.
6. – PR mit Merge-Commit: siehe GitHub.
7. – Tag + Release: über `release-tag.yml` nach Merge.
