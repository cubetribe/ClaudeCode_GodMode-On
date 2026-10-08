---
agent: general-purpose (Analyse-Subagent)
date: 2026-07-28
task: Kritische Analyse der Token-Ökonomie und Instruktions-Last des CC_GodMode-Systems (v8.6.0)
scope: read-only — keine bestehende Datei geändert
method: harte Messung via wc -c / find / python3; keine Schätzungen außer explizit markiert
related:
  - 05-verified-opus5-facts.md (verifizierte Anthropic-Primärquellen)
  - 01-research-thariq-article.md
---

# Token-Last-Analyse CC_GodMode v8.6.0

Alle Zahlen gemessen am 2026-07-28 gegen die **installierte** Kopie unter `~/.claude/`
und das Repo unter `.../cc--god_mode/ON` (Branch `feat/v8.7.0-license-hardening`).
Token-Schätzung durchgängig Bytes/4.

---

## 1. Die kritische Zahl: was IMMER geladen ist

Pro Session in diesem Repo. Zeilen 1, 3, 5, 7 werden von **jedem Subagenten erneut bezahlt**.

| # | Artefakt | Bytes | ~Tokens | Eigentümer |
|---|----------|------:|--------:|------------|
| 1 | `~/.claude/CLAUDE.md` (global) | 20.475 | 5.119 | GodMode |
| 2 | `./CLAUDE.md` (Repo) — **byte-identisch mit global Z. 1–202** | 14.832 | 3.708 | GodMode, 100 % Duplikat |
| 3 | Skill-Listing, 44 lokale Skills (name+description) | 10.403 | 2.601 | davon 3.107 B = GodMode |
| 4 | Skill-Listing, 31 Plugin-Skills | 11.559 | 2.890 | Plugins |
| 5 | Agent-Listing, 15 GodMode-Agents (name+description) | 2.378 | 595 | GodMode |
| 6 | SessionStart-Hook-Banner | 1.860 | 465 | GodMode |
| 7 | Projekt-Memory-Index (`MEMORY.md`) | 574 | 144 | GodMode |
| | **Summe gemessen** | **62.081** | **15.522** | |
| 8 | MCP Deferred-Tool-Namen, ~326 Namen aus 15 Servern | ~15.000 *(geschätzt)* | ~3.750 | MCP-Config |
| 9 | MCP-Server-Instruktionsblöcke | ~7.000 *(geschätzt)* | ~1.750 | MCP-Config |
| | **Gesamt always-loaded** | **~84.000** | **~21.000** | |

**GodMode-verantwortlicher Anteil: 43.226 B ≈ 10.806 Tokens** (Zeilen 1, 2, 5, 6, 7 + GodMode-Anteil von 3).

Zeile 8/9 sind als einzige geschätzt (Zählung der Deferred-Tool-Liste dieser Session,
Namenslänge gemittelt). Sie sind nicht GodMode zuzurechnen, aber sie zeigen: 15 aktive
MCP-Server kosten mehr als die komplette globale CLAUDE.md.

### Korrekt on-demand (wird NICHT vorne geladen) — das ist gut gebaut

| Artefakt | Bytes | ~Tokens | Ladezeitpunkt |
|----------|------:|--------:|---------------|
| 15 GodMode-`SKILL.md`-Bodies | 70.514 | 17.629 | nur bei Skill-Aufruf |
| 15 Agent-Bodies | 110.652 | 27.663 | einer pro Dispatch |
| `docs/orchestrator/*.md` (6 Dateien) | 38.325 | 9.581 | nur via References |
| `docs/templates/REPORT_TEMPLATES.md` | 19.494 | 4.874 | on-demand |

**Das Skill-System funktioniert wie vorgesehen.** 70 KB Workflow-Wissen liegen hinter
Lazy-Loading. Das ist die Anthropic-Empfehlung (a) korrekt umgesetzt und darf nicht angefasst werden.

---

## 2. Was ein Subagent-Start kostet

GodMode-fixer Overhead pro Subagent (CLAUDE.md 20.475 + GodMode-Skill-Listing 3.107 +
Agent-Listing 2.378 + Memory 574) = **26.534 B ≈ 6.634 Tokens**, plus die eigene Agent-Datei:

| Agent | eigene Datei | ~Tok | + fix 6.634 | **Start-Kosten** |
|-------|-------------:|-----:|------------:|-----------------:|
| builder | 6.253 | 1.563 | | **8.197** |
| architect | 6.495 | 1.624 | | **8.258** |
| api-guardian | 7.737 | 1.934 | | **8.568** |
| validator | 8.295 | 2.074 | | **8.708** |
| scribe | 12.876 | 3.219 | | **9.853** |
| tester | 16.554 | 4.139 | | **10.773** |

**Ein Full-Gates-Feature-Lauf (6 Agents) = 54.357 Tokens reiner Instruktions-Overhead,
bevor eine einzige Codezeile gelesen wird.** Plus Orchestrator 8.827 → **~63.000 Tokens pro Feature**.

Rechnet man die nicht-GodMode-Fixkosten dazu (Plugin-Skills 2.890 + MCP ~5.500),
liegt der reale Boden pro Subagent bei ~15.000–19.000 Tokens.

---

## 3. Instruktions-Last: Imperative gezählt

Case-insensitive über CLAUDE.md + 15 Agents + 14 GodMode-Skills (195.089 Wörter, 26.732 Zeilen):

| Begriff | Treffer |
|---------|--------:|
| never | 63 |
| must | 44 |
| do not | 42 |
| required | 40 |
| critical | 32 |
| verify | 30 |
| always | 14 |
| mandatory | 14 |

**Bewertung: die Imperativ-Dichte ist NICHT das Hauptproblem.** 63 „never" auf 195k Wörter
ist moderat, und die globale CLAUDE.md kommt mit 8 „never" / 4 „must" / 2 „mandatory" aus.
Wer hier kürzt, optimiert an der falschen Stelle.

**Das Problem ist Volumen und Duplikation, nicht Tonfall.**

Die Imperative, die echten Schaden verhindern (behalten): `NEVER git push` (Core Rule 9),
`NEVER write reports to /tmp` (Core Rule 8), `never a guessed HEAD~1`, `I NEVER edit the
VERSION file directly`, `Never paste a discovered secret in full`, `never a floating tag`
(SHA-Pinning). Diese sechs kodieren Repo-Recht bzw. verhindern stillen Datenverlust —
ein Modell kann sie nicht ableiten.

Reines Rauschen: die Persönlichkeits-Adjektive in **allen 15** Agents
(„You are **meticulous** and **relentless**", „**thorough** and **forward-thinking**")
plus je ein Stimmungs-Epigraph. `security.md:135` `**Minimum output:** 400 characters`
ist willkürlich und manipulierbar. `researcher.md:262` `**MAXIMUM 30 SECONDS** per research
task` ist unerfüllbar — ein Modell hat keine Wanduhr.

---

## 4. Duplikation, gemessen

### 4.1 Die Repo-CLAUDE.md ist ein exaktes Duplikat

`diff <(head -202 ~/.claude/CLAUDE.md) <(head -202 ./CLAUDE.md)` → **identisch**.
Die globale Datei ergänzt nur „Stack & Platform Defaults" + „Department Agents" (Z. 203–286).

Wer in diesem Repo arbeitet, lädt **14.832 B ≈ 3.708 Tokens komplett doppelt** — jede Session.
Informationsverlust beim Ersetzen durch einen Projekt-Delta-Stub: **null**.

Dritte Kopie: `templates/CLAUDE-ORCHESTRATOR.md` (15.036 B). Ihr Header behauptet, sie werde
„regenerated from CLAUDE.md at release time" — sie ist aber **stale**: der Absatz
„Judgment-class decisions … are mandatory human escalations" fehlt.

### 4.2 Die Skills-Tabelle in CLAUDE.md dupliziert die Frontmatter

Wort-Overlap zwischen CLAUDE.md-Tabellenzeile und der `description` im jeweiligen `SKILL.md`
(die ohnehin im Systemprompt steht):

| Skill | Overlap | | Skill | Overlap |
|-------|--------:|--|-------|--------:|
| workflows | **100 %** | | api-change | 86 % |
| release | **100 %** | | greenfield-bootstrap | 86 % |
| agent-teams | **100 %** | | sprint-planning | 80 % |
| research | 80 % | | prototype-mode | 62 % |
| issue-processing | 60 % | | quality-gates | 57 % |
| departments | 57 % | | cost-efficiency | 56 % |
| meta-decisions | 33 % | | dynamic-workflows | 20 % |

Median ~70 %, vier Zeilen bei 100 %. Das ist exakt der Anti-Pattern (b) aus dem Anthropic-Post:
Tool-/Skill-Beschreibungen gehören in das Tool, nicht in den Hauptprompt.

### 4.3 Der Copy-Paste-Tax im Agent-Korpus

Aus dem parallelen Deep-Read-Audit über alle 15 Agents (3.516 Zeilen / 14.880 Wörter):
**1.554 von 3.516 Zeilen ≈ 44 % sind duplizierter Orchestrator-/System-Kontext.**

Blöcke, die in 3+ Dateien nahezu wortgleich stehen:

| Block | Dateien |
|-------|--------:|
| Verdict-Contract (`STATUS: … / report: <path>`) | **15/15** |
| `## Sprint Contract (v8.5 — canonical definition: …)` | **15/15** |
| `## Model Configuration` (Assigned Model / Rationale / Cost Impact) | **15/15** |
| Department „Context intake" — byte-identisch bis auf den Report-Dateinamen | 6/6 |
| `### During Work` Emoji-Fortschrittstheater (`🔍 Scanning…`) | 8 |
| `## Tools (MCP-Server)`-Tabelle (wiederholt die Frontmatter `tools:`) | 8 |
| Report-Ordner-Hygiene („re-runs append -r2, -r3") | 7 |
| `## What I DO NOT Do` („That's @builder / @scribe / @validator") | 5–7 |

Gemessene Bytes der reinen Boilerplate-Sektionen
(`## Model Configuration` + `## Tools (MCP-Server)` + `## What I DO NOT Do` + `## Workflow Position`)
über alle 15 Agents: **16.174 B ≈ 4.043 Tokens.**

`## Model Configuration` ist Dispatch-Metadaten **innerhalb des bereits dispatchten Agenten** —
er kann daraus nichts mehr entscheiden. Totgewicht in 15/15 Dateien.

Dekorative Banner (Box-Drawing + Emoji-Zeilen), Untergrenze: **10.358 B ≈ 2.589 Tokens.**
Realistisch deutlich mehr, da nur Zeilen *mit* Sonderzeichen gezählt wurden; das Audit zählte
`tester.md` Banner = 64 Zeilen, `researcher.md` = 79 Zeilen über zwei Banner,
`validator.md` = 56 Zeilen, `github-manager.md` = 44 Zeilen erfundener Beispiel-Tabellen.

**Jeder dieser Banner wird unmittelbar darunter widerrufen** durch
`"return ONLY this structured verdict"` (3 Zeilen). Der Agent bekommt zwei
sich ausschließende Ausgabeformate.

Intra-Datei-Duplikate: `scribe.md` druckt die Keep-a-Changelog-Kategorien zweimal wortgleich
(Z. 122–143 ≡ 287–308) und den „REQUEST TO ORCHESTRATOR"-Block zweimal (Z. 258–286 ≡ 316–346).
`architect.md` druckt sein Decision-Template zweimal (Z. 59–80 ≡ 103–124).
`api-guardian.md` seinen Impact-Report zweimal (Z. 69–104, dann 126–144).

Tote Formate, die niemand parst: `### Structured Error Output (JSON)` in `tester.md:423–444`
und `researcher.md:328–351`. Das faktische Interface ist der Verdict-Contract.

---

## 5. Widersprüche

### W1 — Modell-Strategie: Drei-Wege-Konflikt (hoch)
- `CLAUDE.md`: „optimized for **Claude Opus 4.8** at ultracode effort", „`best` alias: it resolves to Opus 4.8"
- `settings.json`: `"model": "claude-fable-5[1m]"`, `"effortLevel": "xhigh"`
- Tatsächlich laufendes Modell: **Opus 5**

Drei Quellen, drei Antworten. Der ganze Absatz (740 B) ist Konfigurations-Dokumentation
im Laufzeit-Prompt — er gehört in `docs/`, nicht in die always-loaded CLAUDE.md.

### W2 — Core Rule 8 vs. Tool-Grants (kritisch, funktional gebrochen)
Core Rule 8: „**every agent** AND every subagent/swarm **writes its markdown report**".

**11 von 15 Agents haben weder `Write` noch `Edit`.** Vier davon haben gar keinen Schreibpfad —
`tools: Read, Grep, Glob`:

| Agent | tools | kann Report schreiben? |
|-------|-------|------------------------|
| `docs-dx` | Read, Grep, Glob | **nein** |
| `quality-operations` | Read, Grep, Glob | **nein** |
| `workflow-design` | Read, Grep, Glob | **nein** |
| `workspace-governance` | Read, Grep, Glob | **nein** |

Ihre Instruktion „I write ONLY my report to `reports/…`" ist physisch unmöglich.
Sieben weitere (`api-guardian`, `ci-security-guardian`, `github-manager`, `runtime-platform`,
`security`, `tester`, `validator`) haben nur `Bash` und müssten per Heredoc schreiben —
was keine Datei sanktioniert.

Das ist kein Token-Problem, sondern ein echter Systemdefekt: Core Rule 8 ist für 11/15 Agents
nicht erfüllbar.

### W3 — Core Rule 2 vs. verifizierte Opus-5-Docs (hoch)
Core Rule 2: „**Delegate by default**".
Anthropic-Doku (siehe `05-verified-opus5-facts.md`): *„Do not delegate work you can finish
yourself in a handful of tool calls, and do not use subagents to verify or double-check your
own work."* Opus 5 delegiert laut Docs ohnehin zu bereitwillig — die Regel verstärkt einen
bereits übersteuerten Reflex.

### W4 — Core Rule 5 vs. verifizierte Opus-5-Docs (hoch)
Core Rule 5: „Dual Quality Gates — @validator AND @tester run in PARALLEL, **both must pass**".
Anthropic-Doku: *„Claude Opus 5 verifies its own work without being told to. If your prompt
contains explicit verification instructions … remove them … The same applies to legacy harness
scaffolding that adds separate verification steps."*

Wichtige Nuance, nicht blind kürzen: dieselbe Doku lobt Writer-Verifier-Muster ausdrücklich,
**wenn der Verifier eine echte zweite Perspektive prüft**. @tester (Browser, Screenshots,
Lighthouse, a11y) ist genau das — er sieht, was @builder nicht sehen kann. @validator dagegen
liest denselben Diff noch einmal. Der Verdacht auf Über-Verifikation trifft @validator, nicht @tester.

### W5 — `security.md` widerspricht sich selbst (mittel)
Frontmatter: `model: opus`, `effort: low`. Eigene Begründung Z. 167–169: „Security review is
high-stakes, adversarial reasoning — missed findings are expensive. The most capable model is
justified here." `effort: low` deckelt genau das Budget, das dort gebraucht wird.
Zusätzlich: **@security fehlt komplett in der Effort-Matrix der CLAUDE.md.**

Analog: `scribe` läuft auf `haiku` / `effort: low` — als alleiniger Schreiber von `CHANGELOG.md`
und Treiber des Release-Rechts, der folgenschwersten Single-Writer-Rolle im System.

### W6 — SessionStart-Hook kennt 7 Agents, CLAUDE.md 15 (niedrig)
`scripts/session-start.js:82–90` hardcodet: `@architect @api-guardian @builder @validator
@tester @scribe @github-manager`. Es fehlen **@researcher** (laut CLAUDE.md ein Core-Agent),
@security und alle 6 Department-Agents. Der Banner meldet „Agents Ready" und listet die Hälfte.

### W7 — `github-master` ist ungoverned (niedrig)
Installiert unter `~/.claude/skills/github-master/` (22.373 B, 7 Dateien),
**nicht im Repo** und **nicht in der Skills-Tabelle der CLAUDE.md**.
Es hat mit 386 B die **längste `description` aller 44 lokalen Skills** — kostet also dauerhaft
Platz im Systemprompt, ohne im Governance-Modell zu existieren.

### W8 — Core-Agent-Descriptions ohne Dispatch-Trigger (mittel)
Die 6 Department-Agents und @security tragen explizite Auslösebedingungen
(„Invoke when touching `.github/workflows/**` …"). Alle **8 Core-Agents** tragen reine
Rollen-Etiketten ohne Trigger. Das Feld, auf dem der Orchestrator routet, ist genau dort
am schwächsten, wo am häufigsten geroutet wird.

### W9 — Framework-Annahme in globalen Agents (mittel)
`architect.md:17` und `builder.md` definieren ihren Scope als „React/Node.js/TypeScript
enterprise applications"; `validator.md` verdrahtet `npx tsc --noEmit` als Gate #1.
Diese Dateien liegen in `~/.claude/agents/` und werden in Swift-/Flutter-/Shell-Repos
dispatcht — während dieselbe CLAUDE.md `swiftui`- und `flutter`-Profile deklariert.

### W10 — Doppelte Auflistung derselben Modi innerhalb einer Datei (niedrig)
Die Tabelle „## Modes" (832 B) und die Tabelle „## Skills (On-Demand Knowledge)" (1.514 B)
mappen beide dieselben sechs Einträge (cost-efficiency, workflows, prototype-mode,
departments, agent-teams, dynamic-workflows) — in derselben Datei, ~700 B auseinander.

### Wo KEIN Widerspruch besteht (geprüft, positiv)

- **Routing-Default ist überall konsistent** „Smart Routing": `CLAUDE.md`,
  `docs/orchestrator/WORKFLOWS.md:7`, `skills/cost-efficiency/SKILL.md:3,6,8`,
  `skills/workflows/SKILL.md:3,8`. Fünf Quellen, eine Aussage.
- **Agent-Anzahl** „15 (8 core + 1 security gate + 6 department)" steht genau einmal
  und stimmt mit den 15 Dateien in `~/.claude/agents/` überein.
- **Die Effort-Matrix der CLAUDE.md deckt sich mit der Frontmatter aller Agents** —
  architect=high, builder/tester/api-guardian=medium, Rest=low. Einzige Lücke: @security (W5).
- **Alle 14 referenzierten Pfade existieren** (`docs/orchestrator/*`, `docs/policies/
  DOMAIN_PACK_SPEC.md`, `docs/AGENT_MODEL_SELECTION.md`, `scripts/version-bump.js`,
  `sync-version.js`, `release-check.js`, `.github/workflows/release-tag.yml`).

---

## 6. Top-10 Streichkandidaten

| # | Kandidat | Bytes | ~Tok | Risiko | Begründung |
|---|----------|------:|-----:|--------|------------|
| 1 | Repo-`./CLAUDE.md` → Projekt-Delta-Stub | 14.832 | **3.708** | **null** | byte-identisch mit global Z. 1–202 |
| 2 | Agent-Boilerplate-Sektionen (15×) | 16.174 | **4.043** | niedrig | Model Configuration = Dispatch-Daten im Dispatchten; Tools-Tabelle = Frontmatter |
| 3 | Agent-Banner / ASCII-Report-Templates | ≥10.358 | **≥2.589** | niedrig | direkt widerrufen durch „return ONLY this structured verdict" |
| 4 | `### Scheduled automations` in CLAUDE.md | 1.754 | **438** | null | zwei Cron-Prompts für **andere** Projekte, selbst als „document only" markiert |
| 5 | `## Skills (On-Demand Knowledge)`-Tabelle | 1.514 | **378** | null | Median 70 % Wort-Overlap mit Frontmatter, 4 Zeilen bei 100 % |
| 6 | `## Stack & Platform Defaults` | 2.404 | **601** | niedrig | Lehrbuchwissen („Keep business logic out of views"); Git-Safety-Teil dupliziert Core Rule 9 |
| 7 | `## Department Agents` Tabelle + Aktivierung | 1.849 | **462** | niedrig | dupliziert das Agent-Listing im Systemprompt |
| 8 | `## Modes`-Tabelle | 832 | **208** | null | 6/6 Zeilen erscheinen erneut in der Skills-Tabelle derselben Datei |
| 9 | `## Start`-Checkliste | 799 | **199** | niedrig | Neuformulierung von Core Rule 1/3 + Routing + Workflows |
| 10 | „Model strategy"-Absatz | 740 | **185** | null | faktisch stale (W1); Konfig-Doku gehört nach `docs/` |
| — | *(Bonus)* tote JSON-Schemata + „MAXIMUM 30 SECONDS" | ~1.400 | ~350 | null | nichts parst sie; Zeitlimit unerfüllbar |

**Summe reine CLAUDE.md-Schnitte (4–10): 9.892 B ≈ 2.473 Tokens = 48 % der globalen CLAUDE.md,
ohne dass eine einzige Regel verloren geht.**

**Kombinierte Wirkung:**
- Always-loaded pro Session: **−24.724 B ≈ −6.181 Tokens** (Kandidat 1 + 4–10)
- Pro Subagent: CLAUDE.md fällt 20.475 → ~10.583 B → **−2.473 Tok × 6 Agents = −14.838 Tok**
  pro Full-Gates-Feature
- Agent-Schlankheit (2 + 3): ~−800 Tok × 6 = **−4.800 Tok**
- **Gesamt ≈ −20.000 Tokens pro Feature-Lauf**, bei ~63.000 Tok Ausgangs-Overhead ≈ **−32 %**

---

## 7. Top-5 „unbedingt behalten"

1. **Die HEAD~1-Regel** — `api-guardian.md:25`, `validator.md:27`, `security.md:29`:
   *„never a guessed HEAD~1 (fix loops and parallel sprints make HEAD~1 unreliable)"*,
   und: fehlt die Range, wird nachgefragt. **Die wertvollste nicht-ableitbare Instruktion im
   ganzen Korpus.** Ohne sie validiert ein Gate stillschweigend fremde Arbeit und meldet PASS.

2. **Das Release-Preflight in `github-manager.md:30–33, 133–160`** — ausführbare Assertions
   (`VERSION` == oberste CHANGELOG-Überschrift, Tag-Existenz-Check, `release-check.js`),
   „die Release-Version kommt NUR aus der VERSION-Datei", „`release/*` und Feature-PRs mergen
   mit einem **MERGE COMMIT**" → `gh pr merge --merge --delete-branch`, plus
   „NEVER push, tag, merge, or publish without the user's explicit permission".
   Das ist Repo-Recht, das kein Modell erraten kann.

3. **Write-Scope-Bindung in `builder.md:25–27`** — die verbindliche Scope-Tabelle, die
   explizite Never-Write-Liste (`VERSION`, `CHANGELOG.md`, `ROADMAP.md`, `plans/**`) und
   `git status`/`git diff` vor dem Schreiben → `BLOCKED (conflict)`.
   Zusammen mit **`architect.md:29`** (jedes Design liefert eine File-Ownership-Tabelle,
   überlappende Ownership zwischen Parallel-Units ist verboten) und der Hot-Files-Regel
   der CLAUDE.md ist das **das Fundament, das Parallel-Fan-out überhaupt sicher macht.**
   Anfassen verboten.

4. **Das Hook-Design.** `check-api-impact.js` emittiert **3.113 B nur bei API-Pfaden und
   exakt 0 B sonst** (gemessen); `validate-agent-output.js` emittiert 0 bei No-op.
   Das ist Anthropic-Empfehlung (b) — Instruktion im Werkzeug, nicht im Prompt —
   bereits vorbildlich umgesetzt. Ebenso: **alle 14 in der CLAUDE.md referenzierten Pfade
   existieren** (verifiziert), kein toter Verweis.

5. **Die operativen Policy-Tabellen von `tester.md:48–56, 95–101, 356–370`** —
   3-Viewport-Pflicht, Speicherort `.playwright-mcp/`, die CWV-Schwellen und vor allem die
   Blocking-vs-Non-Blocking-Liste (Console-JS-Fehler / LCP > 4 s / CLS > 0.25 blocken;
   Kontrast-Warnungen nicht). Reine Policy, nicht ableitbar.
   Ebenso `security.md:97, 161`: „any Critical or High → BLOCKED" und
   *„Never paste a discovered secret in full into the report — redact and point to it."*

**Und das Lazy-Loading-Design des Skill-Systems insgesamt** (70 KB GodMode-Workflow-Wissen
hinter On-Demand-Ladung, 0 B im Systemprompt) ist die strukturell richtigste Entscheidung
im ganzen System.

---

## 8. Fazit

Das System ist **nicht durch Ton oder Verbotsdichte überinstrumentiert** — 63 „never" auf
195k Wörter ist unauffällig, und die Kern-Verbote kodieren echtes Repo-Recht.

Überinstrumentiert ist es durch **Duplikation**:
- eine komplette CLAUDE.md-Kopie (14.832 B), die nichts hinzufügt
- 44 % des Agent-Korpus ist wiederholter Orchestrator-Kontext
- Skill-Beschreibungen stehen zweimal (Frontmatter + CLAUDE.md-Tabelle, 70 % Overlap)
- Modi stehen zweimal in derselben Datei
- Ausgabeformate stehen zweimal und widersprechen sich

Dazu ein funktionaler Defekt (W2: 11/15 Agents können den vorgeschriebenen Report nicht
schreiben, 4 davon gar nicht) und ein stale Modell-Absatz (W1), der drei verschiedene
Antworten auf dieselbe Frage gibt.

**Reihenfolge der Arbeit:** erst W2 reparieren (Systemdefekt, kein Token-Thema),
dann Kandidat 1 (3.708 Tok, null Risiko, reine Löschung),
dann 4–10 (2.473 Tok, null bis niedriges Risiko),
dann 2–3 im Agent-Korpus (~6.600 Tok, braucht eine Runde Sorgfalt pro Datei).
W3/W4 sind Design-Entscheidungen für den Menschen, keine Aufräumarbeit — insbesondere
die Frage, ob @validator neben @tester noch eine echte zweite Perspektive liefert.
