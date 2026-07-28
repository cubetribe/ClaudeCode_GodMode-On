---
sprint: 03
slug: coherence-sweep
plan: plans/v8.7.0/PLAN.md
status: done
execution: parallel
owner: orchestrator
ux_gate: skip
---

# Sprint 03 — Kohärenz-Sweep: eine Regel, eine Formulierung

## Goal

Jede Regel steht danach an genau einer Stelle geschrieben; alle anderen Stellen verweisen darauf,
statt sie zu wiederholen. Wo Wiederholung unvermeidbar ist, macht ein Skript die Drift unmöglich,
statt sie später zu entdecken.

Grundlage ist Thariq Shihipars Befund (`reports/v8.7.0/sprint-00/00-source-article-thariq.md`):
Der Schaden entsteht nicht durch Umfang, sondern dadurch, dass Claude widersprüchliche Anweisungen
auflösen muss, **bevor** es über die Aufgabe nachdenken kann. Sprint 02 hat das Gate-Modell
vereinheitlicht. Dieser Sprint räumt den Rest.

## Ausgangslage — am 2026-07-28 nachgeprüft, nicht aus der alten Liste übernommen

Von den 21 harten Widersprüchen aus `reports/v8.7.0/sprint-00/03b-contradiction-sweep.md` sind
H1, H3–H12, H16, H17 und H20 in Stufe 1 und Sprint 02 behoben. Verifiziert **noch offen**:

| ID | Befund | Status |
|---|---|---|
| H14 | Kritische API-Pfadliste in 5 Fassungen | unverändert offen |
| H15 | `skills/github-master/` fordert Squash-Merges + lineare Historie gegen das Merge-Commit-Recht | unverändert offen |
| H18 | `skills/meta-decisions/SKILL.md` kennt weder MANDATORY-Set noch Judgment-Class-Gate (0 Treffer gegen 6 in `META-DECISIONS.md`) | unverändert offen |
| H19 | `greenfield-bootstrap` erzwingt @architect „first for any real feature" gegen Core Rule 3 | unverändert offen |
| H2 (Rest) | @scribe als VERSION-Schreiber in `skills/workflows/SKILL.md:50,137`, `docs/AGENTS.md:20`, `agents/scribe.md:266,379` | teilweise offen |
| H13 (Rest) | `docs/AGENTS.md:43` führt @ci-security-guardian als „Read + Write" — die Datei selbst sagt „I never modify repository files" | teilweise offen |

Dazu die veralteten Versions-Header: `docs/orchestrator/VERSIONING.md:1` und
`skills/release/SKILL.md:7` sagen v8.5 bei VERSION 8.6.0; `docs/orchestrator/MODES.md:3` sagt
„Updated: 2026-06-11". `VERSIONING.md:3` räumt die Drift selbst ein — sie ist trotzdem seit v8.6.0
nicht bewegt worden.

**Nicht bestätigt und deshalb als Prüfauftrag geplant, nicht als Fakt:** die Angabe aus der
Erstanalyse, 9 von 21 Skripten seien unverdrahtet (~154 KB toter Code). Ein Gegen-Check am
2026-07-28 fand mit einfacher Referenzsuche kein einziges unverdrahtetes Skript — die Methode war
zu grob (sie zählt Erwähnungen in Doku als Verdrahtung). Der Sprint klärt das mit einer belastbaren
Methode, statt die Zahl weiterzutragen.

## Scope

### 1. Eine kanonische API-Pfadliste (H14)

Heute nennen fünf Dateien fünf verschiedene Mengen. Eine Änderung unter `**/dto/**` ist nach einer
Datei zwingend @api-guardian-pflichtig und nach vier unsichtbar.

**Entscheidung: die Vereinigungsmenge gewinnt, und sie steht künftig an genau einer Stelle.**
Kanonische Quelle wird `skills/api-change/SKILL.md` — sie ist bereits die vollständigste. Alle
anderen Stellen (`CLAUDE.md`, `skills/cost-efficiency/`, `skills/workflows/`,
`docs/orchestrator/WORKFLOWS.md`) verweisen darauf, statt die Liste zu wiederholen.

Bewusste Folge: mehr Pfade lösen künftig das @api-guardian-Gate aus als in vier der fünf Fassungen
bisher. Das ist die sichere Richtung — ein Contract-Bruch, der durchrutscht, kostet mehr als ein
Gate, das einmal zu viel läuft.

### 2. Versions-Header driftsicher machen

Die drei hinkenden Header nicht nur korrigieren, sondern **in das Manifest von
`scripts/sync-version.js` aufnehmen**, damit `--check` sie künftig erzwingt. Korrektur ohne
Mechanismus wiederholt nur den Fehler in der nächsten Version.

Vorbild ist die Behebung aus Stufe 1: der Header-Versionsstring von
`templates/CLAUDE-ORCHESTRATOR.md` war nie überwacht und driftete deshalb.

### 3. Eskalationsmodell zusammenführen (H18)

`skills/meta-decisions/SKILL.md` ersetzt den Drei-Stufen-Baum aus
`docs/orchestrator/META-DECISIONS.md:55-102` durch eine flache Fünf-Punkte-Liste ohne
MANDATORY/OPTIONAL-Trennung, ohne Judgment-Class-Gate und ohne Finding-Conflict-Adjudication.

Der Skill wird auf den autoritativen Baum gezogen. Der Judgment-Class-Satz — dass einstimmiges
Agenten-PASS ein menschliches Gate nicht aufhebt — muss wörtlich enthalten sein; er gewinnt mit
stärkeren Modellen an Wert, weil gleichrangige Agenten korrelierte statt unabhängige Evidenz
liefern.

### 4. Architecture-Gate: eine Schwelle (H19)

`greenfield-bootstrap/SKILL.md:31-32,47` erzwingt @architect für jedes echte Feature; Core Rule 3
und `cost-efficiency/SKILL.md:27-29` sagen für kleine und mittlere Arbeit ausdrücklich „inline
brief, kein @architect-Subagent". Der Greenfield-Skill wird auf Core Rule 3 gezogen — ein leeres
Repo ist kein Grund für ein anderes Architektur-Gate.

### 5. @scribe und VERSION endgültig trennen (H2-Rest)

`VERSIONING.md:24` ist eindeutig: „never at work start, never per task, never by an implementer
agent." Vier Stellen behaupten weiterhin das Gegenteil. Nachziehen.

### 6. Werkzeug-Deklarationen gegen Wirklichkeit prüfen (H13-Rest)

`docs/AGENTS.md:43` führt @ci-security-guardian als „Read + Write", die Agent-Datei selbst sagt
„I never modify repository files", und die Frontmatter hat kein `Write`. Nachziehen.

Zeile 33 (@security „Read + Write") ist seit Sprint 02 **korrekt** — @security hat `Write`
bekommen. Nicht anfassen.

Zusätzlich: alle 14 Agenten einmal gegen ihre eigene Frontmatter prüfen. Jede Behauptung über
Werkzeuge im Fließtext muss zur `tools:`-Zeile passen. Sprint 02 hat gezeigt, dass diese Sorte
Behauptung unbemerkt falsch sein kann.

### 7. Prüfauftrag: tote Skripte

Feststellen, welche der 21 Skripte tatsächlich nirgends aufgerufen werden. Belastbare Methode:
Verdrahtung heißt Referenz aus `package.json`, aus einer Hook-Konfiguration
(`config/claude-settings.json`, `~/.claude/settings.json`), aus einem GitHub-Workflow, aus einem
Installer-Skript oder `require()` aus einem verdrahteten Skript. Erwähnung in Markdown zählt
**nicht**.

Ergebnis ist zunächst ein Befund, keine Löschung. Was unverdrahtet ist, bekommt einen
Deprecated-Banner nach dem Vorbild von `analyze-prompt.js`; Löschen ist eine eigene Entscheidung.

### 8. `skills/research/SKILL.md` — dekorative Grenzwerte

„Timeout: 30 seconds MAX per task" mit Phasentabelle. Kein Mechanismus erzwingt das,
`agents/researcher.md` hat kein Timeout-Feld, kein Hook implementiert eines. Entweder als
Richtwert kennzeichnen oder streichen. Eine Zahl, die wie ein hartes Limit aussieht und keines
ist, ist dieselbe Gattung wie die entfernte 40-%-Benchmark.

### 9. Skill-Vorrangregel ins Repo-Recht (H15, strukturell)

**Korrektur an der ursprünglichen Planung, Maintainer-Einwand 2026-07-28:** Der geplante Fix lag
ausschließlich in `~/.claude/skills/github-master/` — also außerhalb der Versionskontrolle. Der
Skill ist nachweislich **kein GodMode-Skill** (das Repo führt 14 Skills, er ist keiner davon),
sondern separat installiert. Ihn ins Repo zu vendoren wäre falsch: fremdes Material einverleiben,
das GodMode weder geschrieben hat noch pflegen kann — genau das, wogegen Sprint 01 angetreten ist.

Der repo-seitige Schutz ist deshalb kein Patch am fremden Skill, sondern **eine Vorrangregel im
eigenen Recht**:

> Kollidiert die Anleitung eines Skills mit dem Release-Recht oder den Core Rules dieses Repos,
> gilt das Repo-Recht. Skills kodieren Meinungen; eine Repo-Verfassung schlägt sie.

Ort: `CLAUDE.md`, im Umfeld der Core Rules, plus eine ausführlichere Fassung in
`docs/orchestrator/VERSIONING.md` für den Release-Teil (Merge-Strategie, Versionsklassifikation).

Wirkung: versioniert, wandert mit dem Repo, überlebt jede Neuinstallation und greift für **jeden**
künftigen kollidierenden Skill — nicht nur für diesen einen Fall.

### 9b. `skills/github-master/` zusätzlich lokal einschränken (Komfort, nicht Schutz)

Umsetzung der Maintainer-Entscheidung (siehe Judgment-Class unten). Nur Geltungsbereich, kein
Inhalt:

- `description` im Frontmatter: expliziter Ausschluss für Repos, die ein eigenes Release-Recht
  mitbringen. Der Skill darf dort nicht mehr triggern.
- Im Body eine Vorrangregel an prominenter Stelle: findet sich im Repo eine Verfassung
  (`CLAUDE.md` mit Release-Law, `docs/orchestrator/VERSIONING.md`, `CONTRIBUTING.md` mit
  Merge-Strategie), gilt diese — der Skill tritt zurück, statt seine eigene Strategie anzuwenden.
- Seine Squash-/Linear-History-Empfehlung, sein 5-Stufen-Workflow und sein Output-Contract bleiben
  **unverändert**. Sie sind für andere Projekte gedacht und dort legitim.
- Einzige inhaltliche Ausnahme: die Nennung von `VALIDATOR` in seinem Workflow zeigt auf einen
  Agenten, den es nicht mehr gibt. Auf eine agenten-neutrale Formulierung ziehen, damit der Skill
  nicht auf ein totes Ziel verweist.

## Non-Goals

- **Core Rule 2 (Delegationsschwelle).** Menschliche Entscheidung, eigener Sprint.
- **Die drei nie benutzten Department-Agenten.** Menschliche Entscheidung.
- **Effort-Sweep.** Braucht echte Evals, keine Meinung. Die Matrix bleibt als „nicht vermessen"
  markiert.
- **VERSION-, CHANGELOG- oder ROADMAP-Writes** außer der `[Unreleased]`-Zeile durch @scribe bei
  der Integration.
- **`reports/**`, `plans/v8.5.0/**`, `plans/v8.6.0/**`, `archive/**`, `DECISIONS.md`** — Historie
  wird nicht rückwirkend umgeschrieben.
- **Divergenz zwischen globaler und Repo-`CLAUDE.md`** — seit Stufe 1 gewollt: die globale trägt
  einen nutzereigenen Schluss (Git safety, Department-Zusammenfassung, Verweise), der vordere Teil
  ist zeichengleich.

## Judgment-Class — entschieden

**H15: `skills/github-master/`.** Der Skill ist global installiert, aber **nicht Teil des Repos**.
Er triggert auf „GitHub, git, branches, pull requests, merges, release impact, changelog, version
bumps" — also exakt auf der Release-Oberfläche — und bringt mit:

- Squash-Merges und lineare Historie, wo das Repo-Recht Merge-Commits vorschreibt
  (`VERSIONING.md:54`, `CONTRIBUTING.md:208`, `agents/github-manager.md:133-134`)
- einen eigenen 5-Stufen-Workflow (RESEARCHER → ARCHITECT → BUILDER → VALIDATOR → RELEASE MANAGER)
  ohne @tester, ohne die Gates aus Sprint 02, mit @validator — einem Agenten, den es nicht mehr gibt
- einen eigenen Output-Contract statt `STATUS:`
- Per-Task-Versionsklassifikation (`candidate_next_version`), die `VERSIONING.md:24` verbietet

**Maintainer-Entscheidung 2026-07-28: auf Nicht-GodMode-Repos einschränken.**

Der Skill behält seinen Inhalt und seine Meinung für andere Projekte. Geändert wird ausschließlich,
**wo** er greift: seine `description` bekommt eine explizite Ausschlussbedingung für Repos mit
eigenem Release-Recht, und im Body eine Vorrangregel — trifft er auf eine Repo-Verfassung
(`CLAUDE.md` mit Release-Law, `docs/orchestrator/VERSIONING.md`), gilt diese, nicht der Skill.

Begründung: Das Problem ist nicht sein Inhalt, sondern dass er in einem Repo triggert, das eine
andere Verfassung hat. Skills sollen laut Artikel „particular opinions" kodieren — dann muss aber
klar sein, wo sie gelten.

**Bekannte Grenze dieser Maßnahme:** Der Skill liegt nur unter `~/.claude/skills/github-master/`
und nicht im Repo. Die Änderung ist damit **nicht versioniert** und nicht Teil des Release-PRs —
sie überlebt keine Neuinstallation aus einer fremden Quelle. Das ist hinzunehmen, muss aber im
Sprint-Report stehen, statt später als Überraschung aufzutauchen.

## Files / Write Scope (ownership)

| Path / Glob | Writer | Notes |
|---|---|---|
| `skills/api-change/SKILL.md` (kanonische Liste), `skills/cost-efficiency/SKILL.md`, `skills/workflows/SKILL.md` | @builder-1 (api-paths) | jede Änderung zusätzlich nach `~/.claude/skills/` spiegeln |
| `CLAUDE.md`, `templates/CLAUDE-ORCHESTRATOR.md`, `~/.claude/CLAUDE.md` | orchestrator | Hot File, Single Writer; Template wird aus `CLAUDE.md` regeneriert |
| `docs/orchestrator/WORKFLOWS.md`, `docs/orchestrator/META-DECISIONS.md`, `docs/orchestrator/MODES.md`, `docs/orchestrator/VERSIONING.md` | @builder-2 (orchestrator-docs) | |
| `skills/meta-decisions/SKILL.md`, `skills/greenfield-bootstrap/SKILL.md`, `skills/research/SKILL.md`, `skills/release/SKILL.md` | @builder-3 (skills) | beide Kopien, `diff` am Ende belegen |
| `docs/AGENTS.md`, `agents/*.md` (nur Werkzeug-Behauptungen im Fließtext) | @builder-4 (agents-docs) | keine Frontmatter-Änderungen ohne Rückfrage |
| `scripts/sync-version.js` (Manifest-Erweiterung), `scripts/test-hooks-contract.js` | @builder-5 (tooling) | `--check` muss danach grün bleiben |
| Prüfauftrag tote Skripte (nur Report + Deprecated-Banner) | @builder-6 (script-audit) | keine Löschungen |
| `~/.claude/skills/github-master/SKILL.md` | @builder-7 (scope-fence) | **nur** Geltungsbereich; Inhalt bleibt. Liegt nicht im Repo ⇒ nicht versioniert, nicht Teil des Release-PRs |
| `CHANGELOG.md` `[Unreleased]` | @scribe only | bei Integration, serialisiert |
| `reports/v8.7.0/sprint-03/*` | jeder Agent mit `Write` | kanonische Nummerierung |

Write Scopes sind disjunkt ⇒ @builder-1 bis @builder-6 laufen parallel. `CLAUDE.md` bleibt beim
Orchestrator, weil dort das kanonische Recht steht und in Sprint 02 genau das die Kohärenz
gerettet hat.

## Risks

- **Der Verweis-statt-Wiederholung-Umbau kann Information verlieren.** Wenn `CLAUDE.md` künftig
  auf `skills/api-change/` verweist statt die Pfade zu nennen, muss der Verweis im Fließtext
  auffindbar sein — sonst hat man Progressive Disclosure gegen Auffindbarkeit getauscht.
  Gegenmittel: die Risk-Signal-Liste in `CLAUDE.md` behält die Kategorie („API/schema/type paths"),
  nur die konkrete Pfadaufzählung wandert.
- **Mehr Pfade heißt mehr @api-guardian-Läufe.** Bewusst in Kauf genommen, aber im Routing Log
  beobachten: wenn das Gate messbar zu oft läuft, ist die Vereinigungsmenge zu weit.
- **`sync-version.js`-Manifest erweitern kann `--check` rot machen**, wenn die neuen Touchpoints
  bereits driften. Genau das ist der Zweck — aber es muss im selben Sprint behoben werden, sonst
  blockiert es Sprint 04.
- **Agenten-Verdicts sind in Sprint 02 fünfmal irreführend gewesen** (sie beschrieben die letzte
  Report-Iteration statt der Arbeit). Abnahme deshalb erneut über `git diff --stat` und
  `grep`-Sweep, nicht über Verdicts.

## Acceptance Criteria

1. Die kritische API-Pfadliste steht als Aufzählung in genau **einer** Datei. Ein `grep` nach
   `openapi.yaml` außerhalb von `reports/`, `plans/`, `archive/` und `CHANGELOG.md` liefert genau
   einen Treffer mit Pfadaufzählung; alle anderen sind Verweise.
2. `node scripts/sync-version.js --check` ist grün **und** sein Manifest umfasst
   `docs/orchestrator/VERSIONING.md`, `skills/release/SKILL.md` sowie den Datumsstempel in
   `docs/orchestrator/MODES.md`.
3. `grep -c "MANDATORY\|[Jj]udgment-class"` in `skills/meta-decisions/SKILL.md` ist > 0, und der
   Satz „a unanimous agent PASS does not waive them" steht dort wörtlich.
4. Keine Datei erzwingt mehr @architect für kleine oder mittlere Arbeit.
5. Kein Dokument nennt @scribe als Schreiber von `VERSION` oder datierten Changelog-Überschriften.
6. Für jeden der 14 Agenten stimmt jede Werkzeug-Behauptung im Fließtext mit seiner
   `tools:`-Frontmatter überein.
7. Der Skript-Audit liegt als Report vor; jedes als unverdrahtet identifizierte Skript trägt einen
   Deprecated-Banner. Nichts gelöscht.
8. `node scripts/test-hooks-contract.js` vollständig grün (Stand: 43/43).
9. `skills/github-master/` nennt in seiner `description` einen expliziten Ausschluss für Repos mit
   eigenem Release-Recht und trägt im Body eine Vorrangregel zugunsten der Repo-Verfassung. Seine
   Squash-Empfehlung und sein eigener Workflow sind inhaltlich **unverändert**; nur `VALIDATOR`
   ist agenten-neutral formuliert. Der Sprint-Report hält fest, dass diese Änderung außerhalb der
   Versionskontrolle liegt.

## Test Strategy

Deterministisch. Die Kriterien 1–6 sind als `grep`-Assertions formuliert und werden als solche
ausgeführt, nicht per Stichprobe gelesen. Dazu `sync-version --check`, `release-check` und die
Hook-Contract-Suite.

`ux_gate: skip` — der Write Scope berührt keine UI-Pfade.

## Changelog Note

`Fixed` — verbleibende Regel-Widersprüche aus dem v8.7.0-Kohärenz-Audit: eine kanonische
API-Pfadliste statt fünf divergenter, Eskalationsmodell zusammengeführt, Architecture-Gate auf eine
Schwelle, @scribe endgültig von VERSION getrennt, Werkzeug-Deklarationen an die Frontmatter
angeglichen. `Changed` — Versions-Header stehen unter `sync-version.js`-Aufsicht, statt still zu
driften.

## Version Relevance

**patch** — Widerspruchsbehebung ohne neue Funktion und ohne gebrochene Schnittstelle. Die
Sprint-Aggregation im Release-Sprint entscheidet: Sprint 01 (minor) und Sprint 02 (minor) wiegen
schwerer, das Gesamtergebnis bleibt **minor**.

## Result

Done 2026-07-28. Sechs parallele Builder auf disjunkten Scopes, das kanonische Recht wieder vom
Orchestrator vorgegeben statt zur Formulierung freigegeben.

**Akzeptanzkriterien**

1. ✓ Die API-Pfadaufzählung steht in genau einer Datei (`skills/api-change/SKILL.md`). Siehe
   Nachtrag unten — es waren nicht fünf Fassungen, sondern sieben.
2. ✓ `sync-version --check` grün bei **14** Touchpoints (vorher 12); `docs/orchestrator/VERSIONING.md`
   und `skills/release/SKILL.md` sind aufgenommen, beide auf `v8.6.0` gesetzt.
3. ✓ `skills/meta-decisions/SKILL.md`: 3 Treffer für MANDATORY/judgment-class (vorher 0), der Satz
   „a unanimous agent PASS does not waive them" wörtlich enthalten.
4. ✓ Keine Datei erzwingt @architect für kleine oder mittlere Arbeit.
5. ✓ Kein Dokument nennt @scribe als Schreiber von VERSION oder datierten Changelog-Überschriften.
   Die verbleibende Nennung in `agents/scribe.md:258` ist eine ausdrückliche Abgrenzung.
6. ✓ Werkzeug-Behauptungen aller 14 Agenten decken sich mit ihrer `tools:`-Frontmatter.
7. ✓ Skript-Audit liegt vor, fünf Deprecated-Banner gesetzt, nichts gelöscht.
8. ✓ `test-hooks-contract.js` 48/48 (vorher 43/43).
9. ✓ `skills/github-master/` eingezäunt: `description` schließt Repos mit eigenem Release-Recht
   aus, Vorrangregel im Body. Squash-Empfehlung und eigener Workflow inhaltlich unverändert; nur
   `VALIDATOR` → `VERIFICATION`, weil der Agent seit Sprint 02 nicht mehr existiert.

**Der wichtigste Fund kam erst bei der Abnahme**

Die Pfadliste existierte nicht in fünf, sondern in **sieben** Fassungen. Die sechste stand in
`docs/ARCHITECTURE.md`. Die siebte — und einzig folgenreiche — war die `CONFIG` von
`scripts/check-api-impact.js`: der Hook, der als einziger tatsächlich feuert. Ihm fehlten
`**/dto/**`, `**/contracts/**`, `**/interfaces/**` und `swagger.json`.

Ohne diese Angleichung hätte der Sprint sein eigenes Ziel verfehlt: die Routing-Regel hätte das
@api-guardian-Gate verlangt, während der Hook geschwiegen hätte. Eine Regel, deren
Durchsetzungsmechanismus etwas anderes tut, ist keine Regel. Der Hook ist jetzt angeglichen,
liefert weiterhin **0 Byte** außerhalb von API-Pfaden (gemessen) und schlägt bei `dto/` erstmals an.

**Korrektur an einer eigenen früheren Behauptung**

Die Erstanalyse nannte „9 von 21 Skripten unverdrahtet, ~154 KB". Der Audit mit belastbarer Methode
korrigiert auf **6 von 21, ~107,5 KB**. Die ursprüngliche Zahl war in beide Richtungen falsch.

**Vom Maintainer angestoßene Scope-Korrektur**

Der geplante Fix für H15 lag ausschließlich in `~/.claude/skills/github-master/` — außerhalb der
Versionskontrolle. Auf Einwand des Maintainers kam die strukturelle Ergänzung dazu: eine
**Vorrangregel im Repo-Recht** („Repo law beats skill opinion", `CLAUDE.md` +
`docs/orchestrator/VERSIONING.md`). Sie ist versioniert, überlebt jede Neuinstallation und greift
für jeden künftigen kollidierenden Skill, nicht nur für diesen einen. Der lokale Zaun bleibt
Komfort; der Schutz liegt im Repo.

**Weitere bei der Abnahme eingesammelte Defekte**

- `verify-changes.js` war nur in `~/.claude/settings.json` registriert, nicht in der
  repo-kanonischen `config/claude-settings.json` — meine Lücke aus Sprint 02. Eine Neuinstallation
  hätte den Hook verloren. Jetzt eingetragen, deterministische Checks vor der Report-Validierung.
- `scripts/session-start.js` und `scripts/mcp-health-check.js`: der außerhalb dieses Sprints
  entstandene Health-Cache-Fix lag nur in den Install-Kopien. Ins Repo zurückportiert, Lizenz-Header
  und Sprint-02-Änderungen dabei erhalten. Dieselbe Reinstall-Drift-Gattung wie der Punkt darüber.
- Latenter Bug in `scripts/sync-version.js`: `main()` lief ungeschützt beim `require()`. Wäre erst
  durch den neuen Test scharf geworden.

**Nicht angefasst, bewusst:** Core Rule 2, die drei nie benutzten Department-Agenten, ein echter
Effort-Sweep. Alle drei sind menschliche Entscheidungen.

**Invarianten bei Abschluss:** `sync-version --check` 14/14 grün, Release-Invariante hält,
`test-hooks-contract` 48/48, VERSION unangetastet.
