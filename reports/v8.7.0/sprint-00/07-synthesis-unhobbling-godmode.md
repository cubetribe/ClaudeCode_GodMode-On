---
agent: orchestrator
date: 2026-07-28
task: Synthese — Was der Unhobbling-Artikel und die Opus-5-Docs für CC_GodMode bedeuten
inputs:
  - 00-source-article-thariq.md (Volltext-Digest, authentifiziert gelesen)
  - 01-research-thariq-article.md (Umfeld, Gegenpositionen)
  - 02-research-opus5-bestpractice.md (Opus-5-Recherche)
  - 03-analysis-token-load.md (gemessene Token-Last)
  - 04-analysis-architecture-fit.md (Überschneidung mit nativen Features)
  - 05-verified-opus5-facts.md (Primärquellen-Verifikation)
status: Entscheidungsvorlage — keine Implementierung
---

# Unhobbling CC_GodMode

## 1. Die Ausgangslage in einer Zahl

Ein Full-Gates-Feature-Lauf verbrennt **~63.000 Token an reinem Instruktions-Overhead, bevor
die erste Codezeile entsteht.** Davon sind ~10.800 Token pro Session GodMode-verantwortlicher
Dauerkontext, der Rest fixer Subagent-Overhead (~6.634 Token pro Subagent-Start, sechsmal).

Anthropic hat im selben Zeitraum **80 % seines eigenen Claude-Code-System-Prompts gelöscht** —
ohne messbaren Eval-Verlust.

Das ist nicht dasselbe Problem in unterschiedlicher Größe. Es ist dasselbe Problem, und wir
stehen auf der falschen Seite davon.

## 2. Was der Artikel wirklich sagt — und was er nicht sagt

Thariq Shihipar, Claude Code / Anthropic, 24.07.2026:
https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models

**Die Diagnose ist nicht „zu viele Token".** Sie lautet: Claude findet in *einem einzigen
Request* widersprüchliche Anweisungen aus System-Prompt, Skills und User-Prompt — und muss
**erst den Konflikt auflösen, bevor es über die Aufgabe nachdenken kann.** Der Schaden ist nicht
primär Kosten, sondern verbrauchte Denkleistung.

Damit ist auch klar, was **nicht** gemeint ist: Der Artikel sagt nirgends „macht eure Systeme
kleiner". Er sagt: macht sie **widerspruchsfrei** und ladet sie **zum richtigen Zeitpunkt**.
Ein großes System mit sauberer Progressive Disclosure ist regelkonform. Ein kleines System mit
drei Stellen, die dasselbe unterschiedlich sagen, ist es nicht.

Die sechs Umkehrungen, gegen GodMode gehalten:

| Regel | GodMode-Status |
|---|---|
| Regeln → Urteilsvermögen | **verletzt** — Core Rules sind Imperative („No Skipping", „MANDATORY") |
| Beispiele → Interface-Design | **teilweise** — Agent-Prompts enthalten ASCII-Banner-Templates (≥2.589 Tok) |
| Alles vorne → Progressive Disclosure | **gemischt** — Skill-Bodies vorbildlich lazy (70 KB bei 0 Tok), CLAUDE.md dagegen Zentralarchiv |
| Wiederholung → Instruktion ins Tool | **verletzt** — Verdict-Contract in 21 Dateien, Risk-Signale in 5, „~10 Subagents" an 9 Stellen |
| CLAUDE.md-Memory → Auto-Memory | **verletzt** — Memory-MCP-Guidance parallel zur bereits laufenden Auto-Memory |
| Simple Specs → Rich References | **ungenutzt** — keine Rubrics, keine HTML-Artifacts, keine Test-Suite-als-Spec |

## 3. Der härtere Teil: die offiziellen Opus-5-Docs

Der Artikel ist Empfehlung. Die Modell-Doku ist Spezifikation — und sie kollidiert an drei
Stellen wörtlich mit Core Rules.

**Kollision A — Core Rule 5 (Dual Quality Gates).**
> *„Claude Opus 5 verifies its own work without being told to. If your prompt contains explicit
> verification instructions … remove them: instructions like these cause over-verification on
> Claude Opus 5, and removing them reduces wasted tokens with no loss in quality. **The same
> applies to legacy harness scaffolding that adds separate verification steps.**"*

„Legacy harness scaffolding that adds separate verification steps" ist eine Definition von
Core Rule 5.

**Aber die Nuance entscheidet.** Dieselbe Doku lobt ausdrücklich: *„Claude Opus 5 coordinates
teams of subagents well, with effective writer-verifier patterns."* Der Unterschied ist, ob der
Verifier **dieselbe Evidenz nochmal liest** oder **eine zweite, unabhängige Evidenzquelle**
öffnet:

- **@validator** liest denselben Diff, den @builder geschrieben hat, mit denselben Werkzeugen
  (`Read, Grep, Glob, Bash`). Das ist Über-Verifikation im Sinne der Doku.
- **@tester** öffnet den Browser, macht Screenshots, misst Core Web Vitals, prüft a11y. Das ist
  ein echter Writer-Verifier — eine Evidenzquelle, die @builder gar nicht hatte.

Die Doku entwertet @validator. Sie stützt @tester.

**Kollision B — Core Rule 2 („Delegate by default").**
> *„Delegate to a subagent only for large tasks that are genuinely independent and
> parallelizable … Do not delegate work you can finish yourself in a handful of tool calls, and
> do not use subagents to verify or double-check your own work."*

Core Rule 2 zwingt ab „nicht-trivial" zu @builder. Anthropic zieht die Grenze bei „mehr als eine
Handvoll Tool-Calls". Dazwischen liegt der häufigste reale Task — und für den kostet GodMode
6.634 Token Overhead plus Kontextverlust, um Arbeit auszulagern, die der Orchestrator in vier
Tool-Calls erledigt hätte.

**Kollision C — Review-Prompts.**
> *„If your review prompt says 'only report high-severity issues' or 'be conservative,' the model
> may follow that instruction literally and report less; ask it to report everything and filter in
> a separate pass instead."*

Betrifft die Prompts von @validator und @security direkt.

**Nicht-Kollision, wichtig zu benennen:** GodModes „Silence default" ist *richtig* — Opus 5
narriert und korrigiert mehr, die Doku empfiehlt explizite Gegensteuerung. Und die
Judgment-Class-Human-Gate-Regel (`QUALITY-GATES.md:117-158`) gewinnt mit stärkeren Modellen an
Wert, weil einstimmige gleichrangige Agenten korrelierte, nicht unabhängige Evidenz liefern.

## 4. Was gemessen wurde

**Immer geladen, pro Session: 62.081 Bytes ≈ 15.522 Token.** Davon GodMode-verantwortlich
43.226 B ≈ 10.806 Token.

Der größte Einzelposten ist reine Duplikation: die Repo-`CLAUDE.md` ist auf den Zeilen 1–202
**byte-identisch** mit der globalen — 3.708 Token, die zweimal im selben Kontext stehen.

Subagent-Overhead: fix 6.634 Token, bevor die agenteigene Datei dazukommt. Ein
Full-Gates-Durchlauf mit sechs Agenten kommt so auf ~54.357 Token, mit Orchestrator ~63.000.

**Vorbildlich und unangetastet lassen:** Das Skill-System. 70.514 Bytes Skill-Bodies liegen
hinter On-Demand-Laden und kosten im Prompt **0 Byte**. Genauso `check-api-impact.js`: liefert
3.113 Bytes ausschließlich bei API-Pfaden, gemessen exakt 0 sonst. Das ist Anthropics Regel
„Instruktion gehört ins Tool" bereits sauber implementiert — von GodMode selbst gebaut, bevor
der Artikel erschien.

## 4b. Der eigentliche Treffer: 21 harte Widersprüche

Thariqs Diagnose lautet nicht „zu viele Token", sondern *„several conflicting messages in a single
request"*. Ein separater Sweep über beide `CLAUDE.md`, alle `skills/*/SKILL.md`, `docs/orchestrator/*`,
alle 15 `agents/*.md` und `scripts/` hat gemessen, wie oft das bei uns passiert — alle Befunde am
Dateisystem verifiziert. Vollständig in `03b-contradiction-sweep.md`.

**Ergebnis: 21 harte Widersprüche, 13 weiche Divergenzen, 11 veraltete Fakten.**

Die sechs schwersten:

1. **Der Report-Pfad existiert in vier inkompatiblen Formen** — in **27 Dateien** wiederholt,
   ~42 Einzelaussagen. Und ausgerechnet das **Default-Routing** (`skills/cost-efficiency/SKILL.md:28`)
   nennt die falsche: ohne `sprint-NN`-Segment. Das ist die meistduplizierte Regel des Systems und
   zugleich die mit den meisten Varianten.

2. **Wer dem kanonischen @tester-Template exakt folgt, fällt durch den Hook.**
   `REPORT_TEMPLATES.md:495-496` listet vier Pflichtsektionen; `validate-agent-output.js:132-150`
   blockiert zusätzlich ohne Screenshot-Pfade, Bilddateien, Console-Errors und CWV-Werte. Dieselbe
   Datei nennt die Mindestlänge einmal mit 800 (`:35`) und einmal mit 400 (`:494`) — und bezeichnet
   sich in Zeile 7 selbst als *„the CANONICAL definition"*.

3. **@scribe soll VERSION schreiben und darf es nicht.** `VERSIONING.md:24` verbietet es
   ausdrücklich („never by an implementer agent"); fünf andere Stellen verlangen es — und
   `validate-agent-output.js` **erzwingt die verbotene Seite**, indem es SemVer-Muster in jedem
   scribe-Report fordert. `agents/scribe.md` widerspricht sich dabei selbst (`:385` gegen `:65`/`:372`).

4. **@security ist ein drittes Gate, das die Gate-Doku nicht kennt.** `docs/orchestrator/AGENTS.md`
   verdrahtet es parallel zu @validator/@tester — in `QUALITY-GATES.md` und
   `skills/quality-gates/SKILL.md` kommt das Wort `@security` **nicht vor**. Beide
   Entscheidungsmatrizen haben zwei Spalten. **Ein BLOCKED von @security hat kein definiertes
   Routing**, und seine Reports werden von keiner Regel validiert.

5. **Ein global installierter Skill konkurriert mit dem Release-Recht.** `skills/github-master/`
   fordert Squash-Merges und lineare Historie, wo das Repo-Recht Merge-Commits vorschreibt — und
   definiert einen eigenen 5-Stufen-Workflow ohne @tester, ohne parallele Gates, ohne
   @api-guardian, mit eigenem Output-Contract und einer Per-Task-Versionsklassifikation, die
   `VERSIONING.md:24` explizit verbietet. Der Skill triggert genau auf der Release-Oberfläche und
   fehlt in der Skills-Tabelle der CLAUDE.md.

6. **Die kritische API-Pfadliste existiert in fünf Fassungen.** Eine Änderung unter `**/dto/**` ist
   nach einer Datei zwingend @api-guardian-pflichtig und nach vier anderen unsichtbar.

Dazu: `isolation: worktree` wird in `skills/quality-gates/SKILL.md:83` als *„already set in
validator.md/tester.md"* beschrieben — beide Frontmatter enthalten kein solches Feld, und Zeile 90
folgert darauf aufbauend „no file conflicts possible". Die RARE-Matrix bedeutet an zwei Stellen
zwei verschiedene Dinge, mit vertauschten Rollen für @architect und @builder. Retry-Limits stehen
einmal bei 3 und einmal bei 2.

**Das ist die Kernaussage dieser Analyse.** Die 20.000 einsparbaren Token sind angenehm, aber
zweitrangig. Der eigentliche Schaden ist, dass das Modell bei jedem Sprint-Report entscheiden muss,
welche von vier Pfadangaben gilt — und dass es diese Entscheidung trifft, bevor es über die
Aufgabe nachdenkt.

## 5. Was Claude Code inzwischen selbst mitbringt

| GodMode-Mechanismus | Natives Äquivalent | Urteil |
|---|---|---|
| @validator (276 Z.) | Skill `/code-review` | nativ; Repo kennt es (`MODES.md:118`), nutzt es nie |
| @security (179 Z.) | Skill `/security-review` | nativ, deckungsgleicher Auftrag |
| @researcher (407 Z.) | `Explore`-Agent + WebSearch | nativ überlappend |
| @architect | `Plan`-Agent + Plan Mode | nativ überlappend |
| Memory-MCP-Guidance | Auto-Memory | nativ, läuft bereits |
| ADR-002 MCP-Health-Check | `claude mcp list` | nativ + toter Code |
| `skills/agent-teams/` | Agent Teams | nativ + tot (`disable-model-invocation: true`) |
| — | **`/doctor`** | **ungenutzt — misst exakt unser Hauptproblem** |
| `check-api-impact.js` | keins | **eigen, bester Mechanismus im System** |

## 6. Defekte, die unabhängig vom Artikel zu beheben sind

**D1 — Core Rule 8 ist für die Mehrheit der Agenten unerfüllbar.** Verifiziert am Dateisystem:
nur 4 von 15 Agenten haben `Write` (architect, builder, researcher, scribe). Vier Agenten
— `docs-dx`, `quality-operations`, `workflow-design`, `workspace-governance` — haben
ausschließlich `Read, Grep, Glob`: für sie ist die Report-Pflicht physisch unmöglich. Sieben
weitere könnten nur per `Bash`-Redirect schreiben, was kein Prompt ihnen sagt.

**D2 — Die Modellpositionierung ist eine Generation alt und dreifach widersprüchlich.**
`CLAUDE.md` sagt „optimiert für Opus 4.8, `best` löst auf Opus 4.8 auf". `settings.json` fährt
`claude-fable-5[1m]` bei `effortLevel: xhigh`. Real läuft Opus 5. Die Preistabelle in
`dynamic-workflows/SKILL.md:256` rechnet mit 4.8-Preisen.

Verifiziert (Report 06): `best` ist **kein fixes Modell** — es löst auf `claude-fable-5` auf, wenn
die Organisation Fable-5-Zugang hat, sonst auf das neueste Opus, also Opus 5. Die
CLAUDE.md-Beschreibung „resolves to Opus 4.8" ist seit Claude Code 2.1.219 falsch. Die Notation
`[1m]` ist gültig und bedeutet 1M-Token-Kontextfenster. `effortLevel` akzeptiert
`low|medium|high|xhigh|max`; `xhigh` ist gültig.

Folge, die niemand bemerkt hat: Das gesamte **Compensation-Playbook aus v8.6.0 ist für diese
Installation gegenstandslos** — der eigene Skill (`dynamic-workflows/SKILL.md:276-279`) erklärt
den ~2×-Apparat bei vorhandenem Fable-Zugang ausdrücklich für hinfällig, und der Zugang ist
vorhanden.

**D3 — Die Effort-Matrix wurde nie neu vermessen.** Anthropic verlangt wörtlich: *„If you carried
effort settings over from an earlier model, run a fresh effort sweep on your evals rather than
reusing them."* GodModes Matrix (architect=high, builder=medium, validator/scribe/researcher=low)
stammt aus der 4.8-Ära. Zusätzlich: `security` läuft auf `opus` + `effort: low` — das
widerspricht der eigenen Begründung — und fehlt in der Matrix ganz. `scribe` schreibt als
alleiniger CHANGELOG-Autor auf `haiku`/`low`.

**D4 — Erfundene Messwerte in DECISIONS.md.** ADR-001 behauptet „40 % faster (8–12min → 5–7min),
performance metrics collected" (`DECISIONS.md:68,118-122`), gibt aber vier Zeilen höher zu, dass
das zugrundeliegende Skript eine Simulation mit Stub-Agenten ist (`:45-48`).

**D5 — Ungedeckte Kernfähigkeit.** Core Rule 6 verlangt Screenshots in 3 Viewports. In der
gesamten Report-Historie erwähnt genau eine Datei Screenshots — und das ist ein Audit-Digest.
`agents/tester.md` ist mit 546 Zeilen der größte Prompt des Systems für eine nie ausgeführte
Fähigkeit. Die MCP-Server `playwright`, `github`, `memory` sind laut SessionStart-Banner aktuell
nicht verbunden.

**D6 — Toter Code und Drift.** 9 von 21 Skripten unverdrahtet (~154 KB), 7 davon ohne
Deprecation-Markierung. `templates/CLAUDE-ORCHESTRATOR.md` behauptet Auto-Sync mit `CLAUDE.md`,
ist aber bereits gedriftet (der Judgment-Class-Absatz fehlt).

**D7 — Das minLength-Report-Gate ist eine selbst diagnostizierte Goodhart-Falle.**
`validate-agent-output.js` blockiert mit Exit 2 bei zu kurzen Reports. Die eigene
v8.6.0-Analyse führt „length minimums" namentlich unter *„nicht adoptieren"*
(`00-analysis-gtd-and-fable-gap-digest.md:92`). Verschärfend: Opus 5 schreibt laut Doku ohnehin
längere Deliverables — das Gate erzwingt Fülltext gegen ein Modell, das bereits zu Fülltext
neigt.

## 7. Der eigentliche Befund

Die Versionshistorie zeigt in v8.x **keine Vereinfachungs-, sondern eine Ehrlichkeits-Bewegung.**
Entfernt wurde ausschließlich, was *nachweislich kaputt* war: Version-First, vier Skripte,
`isolation: worktree`. Nie etwas bloß Überflüssiges. „Fable 5 Light" heißt nicht schlank, sondern
abgeschwächte Fable-Parität.

Der Beleg liegt im eigenen Repo: v8.6.0s Analyse listet „Thicker documentation / CLAUDE.md" als
unwirksamen Hebel (`:88`). Danach wuchs `CLAUDE.md` von 10.164 B (v8.0.0) auf 14.832 B — **+46 %**,
v8.6.0 allein +464 Zeilen Law und Docs.

**v8.7.0 müsste zum ersten Mal etwas streichen, das nicht kaputt ist.** Das ist die eigentliche
Schwelle, und sie ist psychologisch, nicht technisch.

## 8. Vorschlag: drei Stufen, aufsteigendes Risiko

### Stufe 1 — Duplikation entfernen (kein Regelverlust, kein Urteil nötig)

Rein mechanisch, jede Regel bleibt genau einmal erhalten:

| Maßnahme | ~Token | Risiko |
|---|---:|---|
| Repo-`CLAUDE.md` → Delta-Stub (Z. 1–202 sind exaktes Duplikat) | 3.708 | null |
| Agent-Boilerplate entfernen (`Model Configuration`, `Tools`, `DO NOT`, `Workflow Position`, 15×) | 4.043 | niedrig |
| ASCII-Banner/Report-Templates aus Agent-Prompts (Beispiele verengen den Suchraum) | ≥2.589 | niedrig |
| `### Scheduled automations` — Cron-Prompts fremder Projekte | 438 | null |
| `## Skills`-Tabelle (Median 70 % Overlap mit Frontmatter, 4× 100 %) | 378 | null |
| `## Department Agents` (dupliziert das Agent-Listing) | 462 | niedrig |
| `## Stack & Platform Defaults` (Lehrbuchwissen, nicht Repo-Gotcha) | 601 | niedrig |
| `## Modes` (6/6 Zeilen stehen erneut in der Skills-Tabelle derselben Datei) | 208 | null |
| `## Start`-Checkliste (Neuformulierung von Core Rule 1/3 + Routing) | 199 | null |
| „Model strategy"-Absatz (stale, s. D2) | 185 | null |

Allein die CLAUDE.md-Schnitte: **2.473 Token = 48 % der globalen Datei ohne Regelverlust.**
Gesamtwirkung **≈ −20.000 Token pro Feature-Lauf (−32 %)**.

Zusätzlich in Stufe 1, weil reine Defektbehebung: D1 (Write-Rechte oder Report-Pflicht anpassen),
D2 (Modellpositionierung geraderücken), D4 (erfundene Metriken aus ADR-001 streichen),
D6 (toten Code markieren, Template-Drift beheben).

### Stufe 2 — Regeln in Prinzipien überführen (Urteil nötig, Substanz bleibt)

Nach Umkehrung 1. **Nicht** ersatzloses Streichen, sondern Umformulierung von Imperativ zu
kontextsensitivem Prinzip. Beispiel im Artikel: aus „never write multi-line comments" wurde
*„Write code that reads like the surrounding code"*.

- **Core Rule 2** → von „Delegate by default" zu Anthropics eigener Formulierung: delegieren bei
  großen, echt unabhängigen, parallelisierbaren Tracks; nicht bei Arbeit, die in einer Handvoll
  Tool-Calls erledigt ist; nie zur Verifikation eigener Arbeit.
- **Core Rule 7** („No Skipping") → ersetzen durch das, was im Repo bereits besser funktioniert:
  das **Routing Log** (`SPRINT_TEMPLATE.md:50-65`). Nicht „nicht überspringen", sondern
  „Übersprungenes steht protokolliert". Das ist die richtige Governance-Form und wird
  nachweislich ausgefüllt.
- **D7** — minLength-Gate ersatzlos entfernen, stattdessen Längenkalibrierung nach Doku-Empfehlung
  („cover the substance, but do not pad").
- **@validator- und @security-Prompts** entschärfen: „report everything, filter in a separate
  pass" statt Konservativitäts-Instruktionen (Kollision C).

### Stufe 3 — Strukturelle Entscheidungen (menschlich, nicht delegierbar)

Diese vier gehören ausdrücklich **nicht** an einen Agenten. Sie sind Judgment-Class im Sinne der
eigenen `QUALITY-GATES.md`:

1. **@validator behalten oder durch `/code-review` ersetzen?** Die Doku entwertet den zweiten
   Lesedurchgang derselben Evidenz. @tester ist davon nicht betroffen.
2. **Die drei nie benutzten Department-Agents** (@quality-operations, @runtime-platform,
   @workflow-design — null Reports in der gesamten Historie) streichen oder aktivieren?
3. **Core Rule 6 (Screenshot-Pflicht)**: MCP-Stack reparieren und die Fähigkeit endlich nutzen,
   oder die Regel auf das reduzieren, was tatsächlich läuft?
4. **Der Verifikations-Stack als Ganzes**: drei Schichten (SubagentStop-Hook, @validator,
   @tester) gegen ein Modell, das laut Doku selbst verifiziert.

## 9. Sofort verfügbar, vor jeder Umbaumaßnahme

`/doctor` in einer interaktiven Claude-Code-Session. Verifiziert (Report 06): Es gibt zwei
Varianten mit unterschiedlichem Umfang.

- **`claude doctor`** (CLI, non-interaktiv): nur Installations-Health und
  Settings-Validierung, read-only. Wurde hier bereits ausgeführt — „No installation issues found".
- **`/doctor`** (in der Session): fünf Prüfungen — Health, ungültige Settings, ungenutzte
  Extensions, **doppelte Subagents** und **CLAUDE.md-Trim**. Kann Fixes nach Bestätigung
  **anwenden** (ab v2.1.206).

Die letzten beiden Prüfungen adressieren exakt die hier gemessenen Hauptprobleme. Das ist die
einzige Instanz in dieser Analyse, die Anthropics eigene Heuristik direkt auf unsere Dateien
anwendet — und sie ist kostenlos. Ergebnis als Baseline nehmen, dann Stufe 1 fahren, dann erneut
messen.

**Nicht bestätigt:** Ein Hook-Verdacht des Orchestrators hat sich als falsch erwiesen — die in
`settings.json` registrierten Events `TaskCompleted` und `TeammateIdle` sind gültig. Claude Code
2.1.220 unterstützt 30 Hook-Events; unbekannte Namen werden still ignoriert, ohne Fehler.

**Ebenfalls verifiziert — Progressive Disclosure ist ein Drei-Stufen-Modell:** Beim Session-Start
lädt pro Skill nur Name + `description` (~20–100 Token). Der SKILL.md-Body lädt erst bei Aufruf
(Empfehlung: <500 Zeilen). Unterstützende Dateien kosten vorab null. Das bestätigt die Messung:
GodModes 70 KB Skill-Bodies sind korrekt lazy — der Fehler liegt ausschließlich in der CLAUDE.md
und den Agent-Prompts.

## 10. Was nicht angetastet werden darf

Aus beiden Analysen übereinstimmend:

1. **`check-api-impact.js`** — deterministisch, modellunabhängig, ~1,05× Kosten bei ~100 % Recall,
   0 Byte Kontext außerhalb von API-Pfaden. Kein natives Äquivalent. Die Richtung, in die das
   ganze System gehen sollte.
2. **Release-Law ADR-004/005** — Single-Writer, CI-geprüfte Invariante
   `VERSION == CHANGELOG == Tag == Release`. Hat einen messbaren Defekt behoben (42
   CHANGELOG-Versionen gegen 3 Releases). Die beste Arbeit im Repo.
3. **Write-Scope-Ownership** (`SPRINT_TEMPLATE.md:29-37`) — Worktrees lösen Datei-, nicht
   Eigentumskonflikte. Hat in v8.7.0 Sprint 01 real gegriffen.
4. **Judgment-Class Human Gate** (`QUALITY-GATES.md:117-158`) — gewinnt mit stärkeren Modellen an
   Wert, nicht weniger.
5. **Die HEAD~1-Regel** (`api-guardian:25`, `validator:27`, `security:29`) — „never a guessed
   HEAD~1". Die wertvollste nicht-ableitbare Instruktion im System; ohne sie validiert ein Gate
   fremde Arbeit und meldet PASS.
6. **Verification Scoping „Fakten ja, Urteil nein"** (`dynamic-workflows/SKILL.md:122-148`) —
   originäre Einsicht, so scharf nirgends bei Anthropic dokumentiert.
7. **Das Lazy-Loading des Skill-Systems** — 70 KB hinter On-Demand, 0 Byte im Prompt.

Punkte 1, 6 und 7 sind bemerkenswert: Sie setzen Anthropics neue Regeln bereits um, entstanden
aber vor dem Artikel. Das System hat die richtige Intuition — es hat sie nur nicht auf sich
selbst angewendet.
