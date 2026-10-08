---
agent: analysis (architecture-fit reviewer)
version: v8.7.0 (target)
date: 2026-07-28
task: Kritische Architektur- und Wirksamkeitsprüfung des CC_GodMode-Orchestrierungssystems gegen native Claude-Code-Features und die Claude-5-Generation (Opus 5 / Fable 5)
status: complete
scope: read-only analysis — keine bestehende Datei geändert
---

# Architektur- und Wirksamkeitsprüfung — CC_GodMode v8.6.0 gegen Claude 5

Files Changed: keine (nur dieser Report).

Basis: Repo-Stand `feat/v8.7.0-license-hardening`, VERSION 8.6.0, installierte Kopie
`~/.claude/` (Claude Code 2.1.220). Gelesen: `CLAUDE.md`, `README.md`,
`docs/orchestrator/*.md`, `DECISIONS.md`, `ROADMAP.md`, `CHANGELOG.md` (v8.0.1–v8.6.0
+ `[Unreleased]`), `plans/v8.5.0–v8.7.0`, alle 14 `skills/*/SKILL.md`, alle 15
`agents/*.md`, `scripts/`, `config/claude-settings.json`, `reports/**`.

---

## 0. Vorbemerkung — was hier NICHT das Urteil ist

Dieses System ist nicht schlecht gebaut. Es ist **sehr gut gebaut für ein Modell, das es
nicht mehr gibt**. Das ist ein wichtiger Unterschied und der Report hält ihn durch:
fast jede Regel, die ich unten als Ritual markiere, war zum Zeitpunkt ihrer Einführung
eine korrekte Antwort auf ein echtes, belegtes Problem. Der Report kritisiert die
*Passung zur heutigen Plattform*, nicht die Sorgfalt.

Zwei Dinge fallen zugunsten des Eigentümers auf, bevor die Kritik beginnt:

1. **Die Selbstaudit-Kultur ist außergewöhnlich.**
   `reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md` ist eine der
   ehrlichsten Systemselbstkritiken, die man in einem eigenen Repo findet — sie hat den
   eigenen toten Hook gefunden (§3.2 Nr. 1), die eigene Install-Drift (Nr. 3) und die
   eigenen unwirksamen Hebel benannt (§2.4). Das ist selten.
2. **Die Release-Law ist objektiv erstklassige Arbeit** (siehe §5.2). Sie hat einen
   real belegten Bug behoben: 42 CHANGELOG-Versionen gegen 3 GitHub-Releases
   (`DECISIONS.md:435-437`).

Genau deshalb ist der Rest dieses Reports direkt formuliert.

---

## 1. Überschneidungs-Audit: GodMode vs. native Claude-Code-Features

Legende: **NATIV** = Claude Code liefert das inzwischen selbst, GodMode baut nach ·
**DÜNN** = GodMode wrappt ein natives Feature mit dünnem Mehrwert ·
**EIGEN** = echter, nicht-nativer Mehrwert.

| # | GodMode-Mechanismus | Beleg | Natives Claude-Code-Feature (2.1.220) | Urteil |
|---|---|---|---|---|
| 1 | 15 Subagents via Task-Tool, `subagent_type` | `docs/orchestrator/AGENTS.md:7` | Agent-Tool mit `subagent_type`; `.claude/agents/*.md` mit `model`/`effort`/`tools` | **EIGEN (korrekt genutzt)** — GodMode baut nichts nach, es *benutzt* die native Fläche. Richtig so. |
| 2 | `@architect` (opus, 212 Z.) | `agents/architect.md` | Nativer **`Plan`-Agent** + Plan Mode + `ExitPlanMode` | **NATIV überlappend.** Rolle bleibt sinnvoll (Repo-Konventionen), aber „Architektur planen" ist keine GodMode-Erfindung mehr. |
| 3 | `@researcher` (haiku, 407 Z.) + `skills/research/` | `agents/researcher.md` | Nativer **`Explore`-Agent**, WebSearch/WebFetch, Context7-MCP | **NATIV überlappend.** `Explore` ist für Fan-out-Suche stärker spezialisiert als @researcher. |
| 4 | `@validator` (Code-Gate, 276 Z.) | `agents/validator.md` | Native Skill **`/code-review`** (seit 2.1.152, im Repo bekannt: `docs/orchestrator/MODES.md:118`) | **NATIV überlappend.** Das Repo *weiß* von `/code-review` und nutzt es nirgends. |
| 5 | `@security` (opus, 179 Z.) | `agents/security.md` | Native Skill **`/security-review`** („security review of the pending changes on the current branch") | **NATIV überlappend** — nahezu deckungsgleicher Auftrag. |
| 6 | `@github-manager` (haiku, 404 Z.) | `agents/github-manager.md` | `gh` CLI + GitHub-MCP + native Skill `/review` | **DÜNN.** Der Mehrwert ist die Release-Law-Bindung (VERSION als einzige Quelle), nicht die GitHub-Bedienung. |
| 7 | `skills/dynamic-workflows/` (291 Z.) | `skills/.../SKILL.md:56-92,169-213` | Natives **`/workflows`**, ultracode, `/batch`, Worktrees | **Gemischt.** Z. 56–92 (Trigger), 169–183 (Concurrency), 186–213 (Worktrees/batch) sind **Bedienungsanleitung für ein natives Feature**. Z. 122–165 (Fakten-vs-Urteil-Scoping, Seam-Check) sind **EIGEN und wertvoll**. |
| 8 | `skills/agent-teams/` (126 Z.) | `skills/agent-teams/SKILL.md:4` | Natives Agent-Teams (experimentell) | **NATIV + tot.** Frontmatter `disable-model-invocation: true` — der Skill kann vom Modell nie gezogen werden. 126 Zeilen Wartung für null Ausführung. |
| 9 | Plan-First: `plans/vX.Y.Z/PLAN.md` + Sprint-Files | `CLAUDE.md:11`, `docs/templates/SPRINT_TEMPLATE.md` | **Plan Mode** + `ExitPlanMode` + TodoWrite | **Teilweise NATIV.** Native Planung ist ephemer; GodMode persistiert sie. Der *Persistenz*-Anteil ist EIGEN, die *Planungs-Ceremony* ist nativ abgedeckt. |
| 10 | Reports-Pflicht in `reports/vX.Y.Z/sprint-NN/` (Core Rule 8) | `CLAUDE.md:18` | Session-Transkripte (`~/.claude/history.jsonl`, `sessions/`), `search_session_transcripts` | **Teilweise NATIV.** Nativ gibt es die Historie — aber *nicht* im Repo, nicht reviewbar, nicht im PR. Siehe §3.1: differenziertes Urteil. |
| 11 | Memory-MCP-Nutzung durch @researcher/@architect | `docs/orchestrator/AGENTS.md:13-14`, `skills/research/` | **Auto-Memory** (`~/.claude/projects/*/memory/MEMORY.md`) — **läuft bereits und enthält GodMode-Einträge** | **NATIV, überholt.** Der Artikel-Digest nennt genau das (Umkehrung 5, `00-source-article-thariq.md:82-84`). |
| 12 | `effort:`-Frontmatter pro Agent | `CLAUDE.md:118`, `agents/builder.md:6` | Natives `effort`-Feld | **EIGEN (korrekt genutzt).** Die Zuordnung selbst ist GodMode-Wissen. |
| 13 | Worktree-Isolation für Gates | v8.6.0 entfernt: `CHANGELOG.md` „Gate agents reviewed stale state" | Natives `isolation: "worktree"`, `EnterWorktree`/`ExitWorktree` | **NATIV — und v8.6 hat richtig entschieden**, es wieder auszubauen. Gutes Beispiel für gesunde Selbstkorrektur. |
| 14 | `check-api-impact.js` (PostToolUse-Hook) | `config/claude-settings.json:29-40` | **Kein natives Äquivalent** | **EIGEN — der wertvollste Mechanismus im ganzen System.** Siehe §5.1. |
| 15 | `validate-agent-output.js` (minLength-Gate) | `scripts/validate-agent-output.js:61-179,427,756` | Hook-Fläche nativ, Regel eigen | **EIGEN — aber schädlich.** Siehe §3.2. |
| 16 | `mcp-health-check.js` / ADR-002 3-Tier-Health-Check | `DECISIONS.md:125-243` | `claude mcp list`, MCP-Auth-Statusmeldungen | **NATIV + toter Code.** Skript ist **nirgends verdrahtet** (§3.4); `CLAUDE.md:184` ersetzt es durch eine manuelle Anweisung. Der ADR beschreibt ein System, das nicht läuft. |
| 17 | `analyze-prompt.js` / Meta-Decision-Regeln | `docs/orchestrator/META-DECISIONS.md:15-19` | Modell-Urteil (Opus 5) | **NATIV.** Das Repo hat das selbst erkannt und deprecated — korrekt. |
| 18 | Output Styles | — | Nativ vorhanden | **Ungenutzt.** Keine Erwähnung im Repo. |
| 19 | `/doctor` (rightsizing für CLAUDE.md + Skills) | — | Nativ, laut Quellartikel genau für dieses Problem gebaut (`00-source-article-thariq.md:120-122`) | **Ungenutzte Lücke.** Das Werkzeug, das GodModes Hauptproblem misst, ist nirgends referenziert. |

**Zusammenfassung des Audits:** von 19 geprüften Mechanismen sind **6 vollständig oder
weitgehend nativ dupliziert** (2,3,4,5,11,16), **3 teilweise** (7,9,10), **2 ungenutzte
native Chancen** (18,19). Der harte Kern an echtem Eigenwert ist klein, aber real:
Hook-Enforcement (14), Release-Law (§5.2), Write-Scopes (§5.3), Judgment-Gate (§5.4).

---

## 2. Der zentrale strukturelle Befund: das System hat seinen eigenen Anti-Pattern diagnostiziert und ihn dann fortgesetzt

Das ist der wichtigste Einzelbefund dieses Reports, weil er nicht von außen kommt —
er ist im Repo dokumentiert.

`reports/v8.6.0/sprint-00/00-analysis-gtd-and-fable-gap-digest.md:88` listet unter
**„Ineffektive Hebel (nicht adoptieren)"**:

> „**Thicker documentation/CLAUDE.md** — instruction-following is already tier-insensitive;
> the gap is judgment failures, not missing instructions. Extra doc mass aggravates
> long-context degradation."

Und Zeile 92, ebenfalls unter „nicht adoptieren":

> „**Format validation as quality proxy** (length minimums) — Goodhart: validates that a
> report has 1000+ chars, not that the architecture is sound."

Was danach passiert ist, messbar:

| Stand | `CLAUDE.md` | Δ |
|---|---|---|
| v8.0.0 (`71d1578`) | 10.164 B | — |
| v8.5.0 (`d7c6078`) | 14.199 B | +40 % |
| v8.6.0 (`b023bae`) | 14.436 B | +42 % |
| HEAD (v8.7.0-dev) | 14.832 B | **+46 %** |

v8.6.0 — die Release, deren eigene Analyse „mehr Doku hilft nicht" sagt — hat in
Law-/Docs-/Skill-Dateien (ohne Reports/Plans/CHANGELOG) **464 Zeilen hinzugefügt und 50
gelöscht** (`git diff --stat a86f362^ f503257`). Und `validate-agent-output.js` mit
seinen minLength-Regeln (`:61-179`) ist bis heute **blockierend verdrahtet**
(`config/claude-settings.json:44-70`, Exit 2 bei `:756`) — der als Goodhart-Falle
benannte Mechanismus läuft weiter.

**Das ist keine Schlamperei, sondern ein Systemeffekt:** ein Framework, dessen einziges
Ausdrucksmittel Markdown-Regeln sind, kann auf jede Erkenntnis nur mit *mehr Markdown*
antworten — auch auf die Erkenntnis „weniger Markdown". Solange „Regel ergänzen" der
einzige verfügbare Zug ist, wächst das System monoton. Das ist der Punkt, an dem
Anthropics Unhobbling-Befund (>80 % System-Prompt gelöscht, kein Eval-Verlust) direkt
trifft.

**Sekundärbefund Duplikation** (der „Wiederholung"-Anti-Pattern, Umkehrung 4 im
Quellartikel):

| Inhalt | Anzahl Fundstellen | Beispiele |
|---|---|---|
| Risk-Signal-Liste (6 Signale) | **5 Dateien** | `CLAUDE.md:49`, `skills/cost-efficiency/SKILL.md:71`, `docs/orchestrator/MODES.md:37`, `docs/orchestrator/WORKFLOWS.md:10`, `templates/CLAUDE-ORCHESTRATOR.md:57` |
| Concurrency-Cap „~10 Subagents" | **6 Dateien, 9 Stellen** | `CLAUDE.md:142`, `README.md:127`, `docs/ARCHITECTURE.md:14`, `WORKFLOWS.md:35`, `MODES.md:29`, `skills/dynamic-workflows/SKILL.md:37,46,173` |
| Verdict-Contract (`STATUS: …`) | **21 Dateien** | alle 15 `agents/*.md` + `CLAUDE.md` + `QUALITY-GATES.md` + `REPORT_TEMPLATES.md` + `SPRINT_TEMPLATE.md` + `skills/quality-gates/` + Template |
| Parallel-First-Doktrin | **9 aktive Dateien** | `CLAUDE.md`, `README.md`, `docs/AGENTS.md`, `ARCHITECTURE.md`, `MODES.md`, `WORKFLOWS.md`, `QUALITY-GATES.md`, 2 Skills |

Dazu: `templates/CLAUDE-ORCHESTRATOR.md` (15.036 B) ist eine **fast byte-identische
Kopie** von `CLAUDE.md` (14.832 B) — `diff` zeigt genau zwei abweichende Blöcke, und
einer davon ist eine *Regression*: dem Template fehlt der Judgment-Class-Satz
(`CLAUDE.md:103`), den v8.6.0 als zentrale neue Law eingeführt hat. Die Kopie ist
bereits auseinandergedriftet.

---

## 3. Wirksamkeitsprüfung — Wert vs. Ritual

### 3.1 Reports-Pflicht (Core Rule 8) — **differenziertes Urteil: 40 % Wert, 60 % Ritual**

*Wert (behalten):* Der Auslöser war real — v8.5.0 stellte fest, dass Reports in `/tmp`
bei Session-Abbruch verschwinden. Für **Release-Sprints, API-Änderungen und
Security-Findings** ist ein im Repo committeter, im PR reviewbarer Audit-Trail etwas,
das native Session-Transkripte nicht leisten: sie sind nicht im Diff, nicht im Review,
nicht beim Nachfolger.

*Ritual (streichen):* Die Regel gilt **ausnahmslos für jeden Agenten und jeden
Subagenten** (`CLAUDE.md:18,138`). Konsequenz im Ist-Zustand: `reports/v8.7.0/sprint-01/`
enthält **9 Reports für einen einzigen Sprint**, darunter vier separate Builder-Reports
plus zwei r2-Wiederholungen. Für eine Änderung, die im Kern „Lizenz-Footer an Dateien
anhängen" ist. Diese Dateien werden nach dem Merge mit hoher Wahrscheinlichkeit nie
wieder gelesen — der Verdict-Contract sagt sogar explizit, dass der Orchestrator den
Volltext **nur bei BLOCKED** liest (`QUALITY-GATES.md:174`). Ein Artefakt, dessen
eigener Vertrag festlegt, dass es im Normalfall ungelesen bleibt, ist per Definition
Zeremonie.

*Verschärfend:* die minLength-Regel (§3.2) belohnt genau das Aufblähen dieser ungelesenen
Dateien.

### 3.2 minLength-Report-Validierung — **reines Ritual, aktiv schädlich**

`scripts/validate-agent-output.js:61-179` erzwingt Mindestlängen (architect 1000,
api-guardian 800, tester 800, builder 500, validator 400, scribe 300, github-manager 200
Zeichen), `:427-431` markiert Unterschreitung als `invalid`, `:756` beendet mit Exit 2 =
**blockierend** nach Claude-Code-Hook-Contract. Verdrahtet auf `SubagentStop`,
`TaskCompleted` und `TeammateIdle` (`config/claude-settings.json:44-70`).

Das eigene v8.6.0-Audit (`…gap-digest.md:92`) hat diesen Mechanismus namentlich als
Goodhart-Falle unter „nicht adoptieren" geführt. Er läuft trotzdem. Ein Gate, das
Zeichenzahl prüft, produziert bei einem Modell, das ohnehin zu lang antwortet
(`02-research-opus5-bestpractice.md:20-21`: „Response-Standardlänge länger als 4.8 —
Conciseness-Instruktion erforderlich"), exakt null Signal — es zwingt nur Füllmasse in
Dateien, die niemand liest.

**Empfehlung: ersatzlos entfernen.** Die *Struktur*-Prüfung (Frontmatter vorhanden,
`STATUS:` parsebar, Files-Changed-Liste da) ist behaltenswert; die Längenprüfung nicht.

### 3.3 Sprint-Ceremony — **Wert bei ≥3 Sprints, Ritual darunter**

Die Sprint-Files leisten eines, das nativ fehlt: **Write-Scope-Ownership**
(`SPRINT_TEMPLATE.md:29-37`). Für den v8.7.0-Sprint-01 mit vier parallelen Buildern auf
disjunkten Scopes war das nachweislich funktional — der Validator hat einen
Scope-Table-Fehler gefunden (`reports/v8.7.0/sprint-01/04-validator-report.md`,
„hook-test.ts header orphaned by scope-table gap") und BLOCKED zurückgegeben. Das ist
ein echter Fang.

Ritual wird es bei Einzel-Sprint-Plänen: `plans/v8.7.0/PLAN.md` beschreibt einen Plan
mit **genau zwei Sprints, davon einer der Release-Sprint** — also *ein* Arbeits-Sprint.
Dafür wurden PLAN.md (4,7 KB) + Sprint-File (16,1 KB) geschrieben. Das native Plan Mode
hätte denselben Zweck ohne Dateiverwaltung erfüllt. Die Escape-Klausel „kleine
Single-Scope-Aufgaben laufen als implizites `sprint-00`" (`CLAUDE.md:11`) ist
unterspezifiziert: es gibt kein Kriterium, ab wann etwas „nicht-trivial" ist, also ist
die Default-Richtung im Zweifel immer „mehr Ceremony".

### 3.4 Die 6 Department-Agents — **überwiegend Ritual, belegbar**

`docs/orchestrator/AGENTS.md:63`: „Department agents are advisory (report-only)."
Tatsächliche eigene Reports über die **gesamte** getrackte Repo-Historie
(`reports/**` ab v6.4.0):

| Agent | Eigene Reports | Belege |
|---|---|---|
| @docs-dx | **2** | `reports/v7.0.0/05-docs-dx-report.md`, `reports/v8.7.0/sprint-01/docs-dx-report.md` |
| @ci-security-guardian | **2** | `reports/v7.0.0/08-…-pr21-review.md`, `reports/v8.6.0/sprint-01/ci-security-guardian-report.md` |
| @workspace-governance | **1** | `reports/v7.0.0/06-workspace-governance-report.md` |
| @quality-operations | **0** | nur Erwähnungen in fremden Dateien |
| @runtime-platform | **0** | nur Erwähnungen |
| @workflow-design | **0** | nur Erwähnungen |

**Drei von sechs Department-Agents haben in der gesamten Repo-Geschichte nie einen
einzigen Report produziert.** Sie erscheinen in der Agent-Registry, in der
Handoff-Matrix (`AGENTS.md:56-61`), in der README-Zählung („15 Agenten", `README.md:12,136`)
und in den Install-Prompts — aber nie in der Arbeit. Das sind ~350 Zeilen Agent-Prompts
plus Registry-Pflege für Rollen, die faktisch Dekoration sind. Auffällig ist außerdem,
dass @docs-dx und @ci-security-guardian — die zwei, die *tatsächlich* laufen — als
einzige einen scharf umrissenen, prüfbaren Auftrag haben. Das ist der Hinweis, welche
zwei man behalten sollte.

### 3.5 Core Rule 6 „@tester MUST screenshot, jede Seite, 3 Viewports" — **Ritual in diesem Repo**

`CLAUDE.md:16` formuliert dies als ausnahmslose Kernregel. Realität: über alle Reports
hinweg erwähnt **genau eine Datei** überhaupt Screenshots/Viewports — und das ist ein
Audit-Digest, kein Test-Report. Der Routing-Log des aktuellen Sprints begründet den Skip
korrekt: „no UI surface to screenshot — repo is CLI/Markdown; playwright MCP
unavailable" (`plans/v8.7.0/sprint-01-license-hardening.md`, Routing Log).

`agents/tester.md` ist mit **546 Zeilen der größte Agent-Prompt des Systems** — für eine
Fähigkeit, die in diesem Repo nie ausgeführt wurde. Für die Web-Projekte des Eigentümers
ist die Regel sinnvoll; als *globale* Kernregel im global installierten `~/.claude/CLAUDE.md`
ist sie eine Regel, die in der Mehrzahl der Sessions nur Begründungsaufwand für ihren
eigenen Skip erzeugt. Das gehört in einen Projekt-Skill, nicht in die Kern-Law.

### 3.6 Dual Quality Gates — **Wert, aber der Beleg dafür ist erfunden**

Das Prinzip (unabhängige Code- und UX-Prüfung, Decision-Matrix) ist solide. Die
*Begründung* hält keiner Prüfung stand: `DECISIONS.md:68` behauptet „**40 % faster
quality validation** (8-12min reduced to 5-7min)" mit „Performance metrics collected"
(`:118-122`). Diese Zahlen haben keine Datengrundlage im Repo, und ADR-001 gibt vier
Zeilen höher selbst zu, dass die referenzierte Implementierung eine Attrappe ist
(`DECISIONS.md:45-48`: „the referenced `scripts/parallel-quality-gates.js` is a
decision-matrix simulation (stubbed agents), not an executor"). Ein ADR, der gemessene
Prozentwerte für ein simuliertes Skript ausweist, beschädigt die Glaubwürdigkeit der
übrigen — durchweg gut belegten — ADRs.

### 3.7 Architecture-Gate (split) — **Wert, gut kalibriert**

`CLAUDE.md:13` + `skills/cost-efficiency/SKILL.md:26-52`: Inline-Brief mit fünf
Pflichtfeldern für klein/mittel, @architect nur für neue Module/Breaking Changes. Das ist
eine *echte* Kostenoptimierung mit klarem Trigger, und der Inline-Brief im aktuellen
Sprint (`reports/v8.7.0/sprint-01/01-architect-report.md`, 34 Zeilen) zeigt, dass er
benutzt wird. **Behalten.** Einziger Einwand: „Rejected alternative" als Pflichtfeld
erzwingt bei trivialen Entscheidungen eine erfundene Alternative — ein Feld, das
Fake-Inhalt produzieren kann, sobald es formal erzwungen wird.

### 3.8 Versionierungs-Law — **höchster Wert im System, siehe §5.2**

### 3.9 Toter Code — 9 von 21 Skripten unverdrahtet

Weder in `config/claude-settings.json`, `.claude-plugin/plugin.json`, `package.json`,
den Installern noch in CI referenziert:

`auto-update.js` (24,6 KB), `check-update.js` (7,6 KB), `domain-pack-loader.js`
(18,6 KB), `escalation-handler.js` (20,8 KB), `mcp-health-check.js` (11,8 KB),
`parallel-quality-gates.js` (14,0 KB, offiziell Simulation), `test-phase2-integration.js`
(11,0 KB), `workflow-state.js` (14,2 KB, v8.5.0 deprecated), `analyze-prompt.js`
(31,6 KB, v8.6.0 deprecated — nur noch im Installer erwähnt).

Summe: **~154 KB nicht ausgeführtes JavaScript**, das bei jedem Install mitkopiert wird.
Zwei davon (`workflow-state.js`, `analyze-prompt.js`) sind sauber deprecated — die
anderen sieben nicht. `mcp-health-check.js` ist der heikelste Fall: ADR-002
(`DECISIONS.md:125-243`) beschreibt es als akzeptiertes, implementiertes
3-Tier-System mit „95 % reduction in mid-workflow MCP failures" — verdrahtet ist nichts,
und `CLAUDE.md:184` ersetzt es durch die manuelle Anweisung „Check MCP — `claude mcp list`".

---

## 4. Failure Modes unter Opus 5 — wo das System aktiv schadet

Grundlage: `reports/v8.7.0/sprint-00/02-research-opus5-bestpractice.md` (offizielle
Anthropic-Prompting-Docs für Opus 5) und `00-source-article-thariq.md`.

### FM-1 — Delegationszwang gegen explizite Anthropic-Guidance · **Schwere: HOCH**

`CLAUDE.md:12`: „Delegate by default … Trivial one-line/typo/comment fixes … anything
non-trivial goes to @builder." `CLAUDE.md:114-115`: „Work directly only for trivial
one-liners and pure classification/routing."

Offizielle Opus-5-Guidance (`02-research-opus5-bestpractice.md:90-94`) sagt das Gegenteil:
Delegation lohnt bei „wide multi-file investigation" und unabhängigen Tracks —
**nicht** bei „Kleine Tasks (<5 Tool Calls)" und **nicht** bei
„Verification/Double-Checking (Self-Correction ist built-in)".

Zwischen „One-Liner" und „5 Tool Calls" liegt der **häufigste reale Task** — ein Fix über
zwei, drei Dateien. GodMode schickt den zwingend an einen Sonnet-Subagenten mit
Kontextverlust, während Opus 5 mit 1M-Kontext ihn in-context besser löst. Die Regel
kostet hier Qualität *und* Tokens.

### FM-2 — Verifikations-Stack gegen built-in Self-Correction, für ein Modell, das der Nutzer gar nicht fährt · **Schwere: HOCH**

Anthropic wörtlich (`02-research-opus5-bestpractice.md:102-104`): „Claude Opus 5 verifies
without being told. Instructions like 'double-check,' 'verify,' 'use subagent to verify'
cause waste."

GodMode hat drei gestapelte Verifikationsschichten: Dual Gates (`CLAUDE.md:15`),
adversariale Skeptiker-Panels (`skills/dynamic-workflows/SKILL.md:96-120`) und
Judge-Panels (`QUALITY-GATES.md:82-88`). Der komplette v8.6.0-„Compensation Playbook"
wurde ausdrücklich gebaut, um **Opus 4.8 auf Fable-5-Niveau zu heben**
(`CHANGELOG.md`, v8.6.0-Intro).

Zwei Dinge machen das heute doppelt fragwürdig:

1. **Die Prämisse ist weg.** Der Kompensationsbedarf war ein Opus-4.8-Problem. Opus 5
   ist laut Docs u. a. bei Code-Review stärker (höhere Precision/Recall, weniger False
   Positives — `02-research-opus5-bestpractice.md:22`).
2. **Der Nutzer fährt das kompensierte Modell gar nicht.** `~/.claude/settings.json`
   setzt `"model": "claude-fable-5[1m]"`. Der eigene Skill sagt dazu
   (`skills/dynamic-workflows/SKILL.md:276-279`): „On orgs with Fable 5 access, the `best`
   alias already resolves to it automatically … these thresholds matter for **Opus-only
   environments** where that auto-upgrade path does not apply."
   Der gesamte ~2×-Regel-Apparat (`SKILL.md:239-279`) ist für diese Installation
   **strukturell wirkungslos** — er berechnet einen Break-even gegen ein Modell, das
   bereits läuft.

### FM-3 — Rollenzwang zerschneidet Urteil, das Opus 5 zusammenhängend fällen könnte · **Schwere: HOCH**

`agents/builder.md` verbietet dem Builder explizit: API-Design (`:77`),
Consumer-Discovery (`:78`), Cross-File-Validierung (`:79`), Dokumentation (`:80`), und
schärft nach (`:184`): „**I do NOT search for consumers myself** — @api-guardian does that!"

Für ein Modell mit 1M-Kontext und konsistentem Instruction-Following über das ganze
Fenster (`02-research-opus5-bestpractice.md:23`) ist das eine künstliche Amnesie: Eine
zusammenhängende Änderung wird auf drei Kontexte verteilt, die einander nur über
**drei Bullet-Points** erreichen (`CLAUDE.md:92-99`, max. 3 Findings). Der Builder darf
den Call-Site nicht ansehen, den er gerade bricht — obwohl er die Datei offen hat.

Das ist die klassische Guardrail aus der „Then"-Spalte: sinnvoll, als schwächere Modelle
beim Wandern durch fremde Dateien Schaden anrichteten; heute reiner Informationsverlust.

### FM-4 — „Silence default" + versteckte Subagent-Ausgabe = der Nutzer sieht nichts · **Schwere: MITTEL-HOCH**

`CLAUDE.md:111`: „**Silence default:** One sentence per finding, direction-change, or
blocker. **Do not summarize what agents already reported.**"

Der Konflikt: In Claude Code ist die Endausgabe eines Subagenten **nicht die
Nutzerausgabe** — der Parent muss relayen, was zählt. Die Regel verbietet exakt diesen
Relay. Kombiniert mit dem 3-Bullet-Maximum und „Orchestrator liest den Volltext nur bei
BLOCKED" (`QUALITY-GATES.md:174`) entsteht die Kette:

> Sprint mit 4 Buildern + 2 Gates → jeder liefert ≤3 Bullets → Orchestrator liest die
> APPROVED-Reports nicht → Orchestrator darf nicht zusammenfassen → **der Nutzer erfährt
> vom Ergebnis mehrerer Agentenstunden praktisch nichts.**

Bei APPROVED-Verdicts werden die Findings damit **strukturell verworfen**: sie stehen in
einer Datei, die laut Vertrag niemand liest, und dürfen nicht berichtet werden. Das ist
kein Kommunikationsstil, das ist Informationsvernichtung an der wichtigsten Schnittstelle
des Systems — der zum Menschen.

### FM-5 — Modellpositionierung ist eine ganze Generation veraltet · **Schwere: MITTEL**

`CLAUDE.md:107`: „optimized for **Claude Opus 4.8** at ultracode effort … The `best`
alias: it resolves to **Opus 4.8**". Ebenso `README.md:89,125`,
`docs/orchestrator/MODES.md:136`, und die Preistabelle in
`skills/dynamic-workflows/SKILL.md:256-257` („Fable 5 costs roughly 2× Opus 4.8 …
$10/$50 vs $5/$25").

Installiert ist Claude Code **2.1.220**; Default-Modell der Generation ist Opus 5
(`02-research-opus5-bestpractice.md:51`). Praktisch gerettet wird das System durch den
`best`-Alias, der weiterhin korrekt auflöst — die *Dokumentation* ist trotzdem an jeder
Stelle falsch, und jede darauf aufbauende Rechnung (2×-Regel, Effort-Zuordnung,
Kompensationsökonomie) rechnet mit den Parametern der Vorgängergeneration.

Konkreter Folgefehler: die Effort-Matrix (`CLAUDE.md:118`) ist für 4.8 kalibriert. Für
Opus 5 gilt laut Docs „Efficiency at lower effort — `low`/`medium` bringen starke
Qualität bei Bruchteilen der Tokens" (`02-research-opus5-bestpractice.md:25`). Die
Zuordnung ist damit systematisch zu hoch, kostet also Geld ohne Gegenwert.

### Weitere Failure Modes (kürzer)

- **FM-6 — Der Skill-Katalog wird vorab vollständig geladen.** `CLAUDE.md:157-176`
  listet alle 14 Skills mit Beschreibung — obwohl das native Skill-System genau dafür
  Progressive Disclosure bietet und Skill-Descriptions bereits im Kontext stehen. Die
  Tabelle ist eine Dublette des nativen Mechanismus (Umkehrung 3 im Quellartikel).
- **FM-7 — `disable-model-invocation: true` bei `agent-teams`** (`skills/agent-teams/SKILL.md:4`)
  macht den Skill unauffindbar für das Modell, während `CLAUDE.md:81` ihn weiter als
  wählbaren Modus führt. Widerspruch zwischen Law und Implementierung.
- **FM-8 — Zwei Wahrheitsquellen für die Orchestrator-Law.** `CLAUDE.md` und
  `templates/CLAUDE-ORCHESTRATOR.md` sind bereits inhaltlich auseinander (fehlender
  Judgment-Class-Satz, §2).
- **FM-9 — „No Skipping within the selected path" (`CLAUDE.md:17`)** verbietet dem
  Orchestrator, mitten im Lauf eine als unnötig erkannte Stufe zu überspringen — genau
  das Urteilsvermögen, auf das Anthropic bei Claude 5 setzt. Der Routing-Log wäre der
  richtige Mechanismus (dokumentierter Skip), das Verbot ist der falsche.

---

## 5. Kern-Wert — was architektonisch gut ist und bleiben muss

### 5.1 Der `check-api-impact.js`-Hook — der beste Mechanismus im System

`config/claude-settings.json:29-40`, PostToolUse auf `Write|Edit`. Deterministisch,
modellunabhängig, ~1,05× Kostenmultiplikator bei ~100 % Recall — die eigene Analyse
stuft ihn korrekt als „**Best ROI of any lever**" ein (`…gap-digest.md:77`). Kein natives
Claude-Code-Feature ersetzt ihn. v8.6.0 hat ihn repariert, nachdem er seit v8.0.0 ein
stiller No-op war, und mit 28 Contract-Checks in CI abgesichert
(`scripts/test-hooks-contract.js`, `npm run hooks:test`).

**Das ist die Richtung, in die das ganze System sich entwickeln sollte:** Regeln, die
nicht auf Modell-Compliance angewiesen sind, sondern mechanisch greifen. Ein Hook schlägt
zehn Markdown-Absätze.

### 5.2 Die Release-Law (ADR-004/ADR-005) — echte, belegte Ingenieursarbeit

Single-Writer für `VERSION`/`CHANGELOG.md`, `[Unreleased]`-Flow, maschinengeprüfte
Invariante `VERSION == CHANGELOG == Tag == GitHub Release`
(`scripts/release-check.js`, `.github/workflows/release-consistency.yml`,
`release-tag.yml`). Behoben wurde ein **messbarer** Defekt: 42 CHANGELOG-Versionen gegen
3 Releases, `[7.1.1]` und `[8.0.1]` gemerged aber nie getaggt (`DECISIONS.md:435-437`).

Das ist modellunabhängig, CI-durchgesetzt, falsifizierbar und proportional zum Problem.
**Unverändert behalten.** Es ist auch der Teil, den kein natives Feature abdeckt.

### 5.3 Write-Scope-Ownership für parallele Arbeit

`SPRINT_TEMPLATE.md:29-37` + `BLOCKED (scope|conflict)` in allen Agent-Contracts
(`agents/builder.md:25-27`). Native Worktrees lösen *Datei*-Konflikte, aber nicht die
*Eigentums*-Semantik („wem gehört diese Datei in diesem Lauf"). Bei vier parallelen
Buildern in v8.7.0 Sprint 01 hat der Mechanismus real gegriffen. **Behalten** — aber nur
dort, wo tatsächlich parallel geschrieben wird.

### 5.4 Judgment-Class Human Gate und die Correlated-Miss-Begründung

`QUALITY-GATES.md:117-158` + `META-DECISIONS.md:104-118`. Die Kernaussage — Einstimmigkeit
gleichrangiger Agenten ist *korrelierte*, nicht *unabhängige* Evidenz, und darf eine
menschliche Entscheidung deshalb nicht ersetzen — ist intellektuell der stärkste Teil des
Repos und **gewinnt mit stärkeren Modellen an Bedeutung, statt zu verlieren**: je
überzeugender ein Modell falsch liegen kann, desto wertvoller ist die Regel, bei
Geschmacks- und Architekturfragen nicht abzustimmen, sondern zu eskalieren.

Ebenso stark: **Verification Scoping — Fakten ja, Urteil nein**
(`skills/dynamic-workflows/SKILL.md:122-148`) mit dem Litmus-Test „widerlegbar durch
Nachsehen (Fakt) vs. widerlegbar nur durch Erzeugen einer besseren Alternative (Urteil)".
Das ist eine originäre, nicht-triviale Einsicht, die Anthropic in dieser Schärfe nirgends
dokumentiert. **Unbedingt behalten.**

### 5.5 Routing Log

`SPRINT_TEMPLATE.md:50-65`. Eine Zeile pro Routing-Entscheidung und pro Agent-Skip, vor
dem Dispatch. Billig, prüfbar, und im aktuellen Sprint tatsächlich sauber ausgefüllt
(`plans/v8.7.0/sprint-01-license-hardening.md` — zwei Zeilen mit vollständiger
Skip-Begründung). Das ist die **richtige** Form von Governance: nicht „du darfst nicht
skippen", sondern „du darfst skippen, aber es steht dann da". **Behalten und ausbauen** —
er ist der natürliche Ersatz für Core Rule 7 (FM-9).

### 5.6 Smart Routing als Default

`skills/cost-efficiency/SKILL.md`. Risikobasiert, mit klarer Eskalationsliste. Die
Grundidee — nicht jede Aufgabe bekommt jede Stufe — ist genau richtig und deckt sich mit
Anthropics eigener Empfehlung, Ultracode nur für große Audits zu nutzen
(`02-research-opus5-bestpractice.md:80`). **Behalten**, aber die Risk-Signal-Liste an
*einer* Stelle definieren statt an fünf (§2).

---

## 6. Historie — wohin sich v8.x entwickelt hat

| Release | Bewegung | Richtung |
|---|---|---|
| v8.0.0 | Parallel-First, Ultracode, `dynamic-workflows`-Skill, Fable→Opus-Sweep | **Ausbau** (+ Doktrin, + Skill, + Modus) |
| v8.0.1 | Nur Doku: Zwei-Schritt-Aktivierung korrigiert | Korrektur |
| v8.5.0 | Plan-First (ADR-004), Release-Law (ADR-005), Sprint-Files, Reports getrackt, CI-Invariante | **Ausbau + erste echte Härtung.** Zwei Skripte deprecated. |
| v8.6.0 | Hook-Reparatur, Installer `--fix-hooks`, Routing-Log, Escalation-Tree, Finding-Adjudication, Compensation-Playbook, Judgment-Gate | **Reparatur + Ausbau.** Erste ehrliche Selbstdiagnose. |

**Gab es schon eine Vereinfachungs-Bewegung? Nein — es gab eine *Ehrlichkeits*-Bewegung.**

Das ist ein wichtiger Unterschied. v8.5.0 und v8.6.0 haben Dinge *entfernt*, die
**nachweislich kaputt** waren (Version-First, `workflow-state.js`,
`parallel-quality-gates.js`, `analyze-prompt.js`, `isolation: worktree` bei den Gates).
Sie haben nie etwas entfernt, das bloß **unnötig** war. Die Codenamen sagen es selbst:
v8.5.0 „Sprint-Native" und v8.6.0 „Fable 5 **Light**" — beides Namen für *mehr System*,
nicht für weniger. „Light" bezeichnet dort nicht Schlankheit, sondern eine
abgeschwächte Fable-Parität.

Die Netto-Bilanz über v8.0.0 → HEAD: `CLAUDE.md` **+46 %**, ein neuer Modus, vier neue
Governance-Prozeduren, +6 Department-Agents (davon 3 nie benutzt), −4 deprecated Skripte
(die weiterhin im Repo liegen). Das System ist gewachsen, während seine eigene Analyse
Wachstum als unwirksamen Hebel identifiziert hat (§2).

**Gelernt wurde nachweislich:**
1. Deterministische Enforcement schlägt Prosa (Hook-Reparatur, CI-Invariante) — die
   richtigste Lehre im ganzen Repo.
2. Einstimmigkeit gleichrangiger Agenten ist keine Evidenz (Correlated-Miss-Floor).
3. Adversariale Verifikation funktioniert nur auf Fakten, nicht auf Urteilen.
4. Mehr Subagents ohne Verifikation replizieren nur denselben blinden Fleck.

Alle vier sind korrekt und wertvoll. Keine davon hat zu einer Streichung geführt.

---

## 7. Empfohlene Richtung für v8.7.0+ (nicht beauftragt, zur Entscheidung)

Priorisiert nach Wirkung/Aufwand. Keine dieser Maßnahmen berührt §5.

1. **`/doctor` laufen lassen** auf `~/.claude/CLAUDE.md` und alle 14 Skills. Anthropic hat
   das Werkzeug exakt für dieses Problem gebaut (`00-source-article-thariq.md:120-122`).
   Nulltes Risiko, sofortige Messung statt Schätzung.
2. **minLength-Validierung entfernen** (`validate-agent-output.js:61-179,427-431`),
   Strukturprüfung behalten. Die eigene Analyse fordert das seit v8.6.0.
3. **Deduplizieren statt kürzen.** Risk-Signale, Concurrency-Cap, Verdict-Contract und
   Parallel-Doktrin je genau **einmal** definieren, überall sonst verlinken. Das
   reduziert Masse ohne Verlust von Law — die konfliktärmste Form von Unhobbling.
4. **`templates/CLAUDE-ORCHESTRATOR.md` generieren statt pflegen** (es ist bereits
   gedriftet) oder durch einen Verweis ersetzen.
5. **Department-Agents auf 2 reduzieren** (@docs-dx, @ci-security-guardian — die einzigen
   mit Ausführungsnachweis). Die anderen vier archivieren.
6. **Core Rule 2 umformulieren**: Delegation ab „unabhängige, parallelisierbare Tracks
   oder breite Multi-File-Untersuchung", nicht ab „nicht-trivial". Deckt sich mit
   Anthropics Guidance und mit FM-1.
7. **Core Rule 6 (Screenshots) aus der globalen Law in einen Web-Projekt-Skill** verschieben.
8. **Core Rule 7 („No Skipping") durch den Routing-Log ersetzen**: Skips sind erlaubt,
   wenn protokolliert. Der Mechanismus existiert bereits und funktioniert.
9. **„Silence default" reparieren** (FM-4): der Orchestrator *muss* dem Menschen
   berichten — Subagent-Output ist keine Nutzerausgabe.
10. **Modellpositionierung auf Claude 5 aktualisieren**, inkl. Effort-Re-Sweep
    (low/medium statt xhigh für Routine) und Neubewertung der ~2×-Regel — für eine
    Installation mit Fable-5-Zugang ist der gesamte Kompensations-Stack inert.
11. **Tote Skripte entfernen oder formal deprecaten** (7 unmarkierte, ~110 KB), ADR-002
    als „superseded" markieren, da das beschriebene System nicht läuft.

---

## 8. Fazit in drei Sätzen

CC_GodMode löst drei Probleme, die Claude Code auch 2026 nicht löst — deterministisches
Hook-Enforcement, eine maschinengeprüfte Release-Invariante und Schreib-Eigentum bei
paralleler Arbeit — und löst sie gut. Um diesen Kern herum liegt eine dicke Schicht aus
Regeln, Rollen und Zeremonien, die für schwächere Modelle gebaut wurde, inzwischen
teilweise nativ existiert und bei Claude 5 messbar Reibung statt Qualität erzeugt. Die
richtige nächste Version ist nicht v8.7 mit mehr Governance, sondern eine, die zum ersten
Mal etwas streicht, das nicht kaputt ist — sondern nur überflüssig.

---

*Analyse-Report, read-only. Keine bestehende Datei wurde geändert.*
