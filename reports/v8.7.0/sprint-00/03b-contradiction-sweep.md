---
agent: general-purpose (Sub-Sweep der Token-Analyse)
date: 2026-07-28
task: Widerspruchs-Sweep über CLAUDE.md, skills/*/SKILL.md, docs/orchestrator/*, agents/*, scripts/
scope: alle Befunde am Dateisystem verifiziert
verdict: 21 harte Widersprüche, 13 weiche Divergenzen, 11 veraltete Fakten
---

# Widerspruchs-Sweep

Kontext: Thariqs Artikel beschreibt als Kernschaden *„several conflicting messages in a single
request"* — Claude muss den Konflikt auflösen, bevor es über die Aufgabe nachdenken kann. Dieser
Sweep misst, wie oft das bei CC_GodMode passiert.

## Harte Widersprüche

**H1 — Report-Pfad: vier inkompatible Formen derselben Regel.**
Kanonisch (`docs/templates/REPORT_TEMPLATES.md:45`): `reports/vX.Y.Z/sprint-NN/<prefix>-<agent>-report.md`.
Abweichend: `skills/cost-efficiency/SKILL.md:28` (`reports/vX.X.X/01-architect-report.md` — **kein**
`sprint-NN`), `skills/research/SKILL.md:71` (gleicher Defekt), `skills/departments/SKILL.md:45`
(`reports/v[VERSION]/`), `agents/scribe.md:344` (widerspricht `scribe.md:69` in derselben Datei).
**Kritisch: Der Default-Routing-Pfad — Smart Routing — zeigt auf die falsche Form.**

**H2 — @scribe schreibt VERSION / datierte CHANGELOG-Headings.**
`docs/orchestrator/VERSIONING.md:24` ist explizit: *„Never at work start, never per task, never by
an implementer agent."* Dagegen: `skills/workflows/SKILL.md:49` („@scribe → VERSION bump"),
`:136-137`, `REPORT_TEMPLATES.md:605-607,631-632,641` (Template verlangt `**New Version:**`,
`[x] VERSION file updated`, datiertes `### [NEW_VERSION] - [DATE]`), `agents/scribe.md:385`
(widerspricht `:65` und `:372` derselben Datei), `docs/AGENTS.md:21`.
`validate-agent-output.js` erzwingt die **falsche** Seite: verlangt `/VERSION/i` + SemVer in jedem
scribe-Report.

**H3 — Bug-Fix-/Refactor-Workflows enden ohne @scribe.**
CLAUDE.md:65 und VERSIONING.md:41 („No exceptions, even for one-line fixes") gegen
`WORKFLOWS.md:59,70,99` und `skills/workflows/SKILL.md:20,22` (enden bei `@validator ∥ @tester`).
`skills/workflows/SKILL.md` widerspricht **sich selbst**: Tabelle Z. 20 ohne @scribe, Prosa Z. 61 mit.

**H4 — emergencyHotfix überspringt Pflicht-Gates.**
`skills/meta-decisions/SKILL.md:17,96` („skip @tester, @scribe — speed over process") gegen
Core Rules 5/6/7/11, VERSIONING.md:41 und `docs/AGENTS.md:53` („Neither gate can be skipped").

**H5 — @security ist ein drittes Gate, das die Gate-Doku nicht kennt.**
`docs/orchestrator/AGENTS.md:29-30,50,53` verdrahtet @security parallel zu @validator/@tester.
Das Wort `@security` kommt in `QUALITY-GATES.md` und `skills/quality-gates/SKILL.md` **nirgends** vor;
beide Entscheidungsmatrizen haben genau zwei Spalten. Ein BLOCKED von @security hat **kein
definiertes Routing**. `validate-agent-output.js` hat keinen `security`-Regelsatz — die Reports sind
ungeprüft.

**H6 — @tester Mindestlänge 400 vs. 800 in derselben kanonischen Datei.**
`REPORT_TEMPLATES.md:35` sagt 800, `:494` sagt 400. Ground Truth
(`validate-agent-output.js:151`): 800. Die Datei, die sich selbst als *„the CANONICAL definition"*
bezeichnet (Z. 7), ist intern falsch.

**H7 — @tester-Pflichtmuster im kanonischen Template unvollständig.**
`REPORT_TEMPLATES.md:495-496` listet vier Sektionen. `validate-agent-output.js:132-150` blockiert
zusätzlich ohne `/(\.playwright-mcp\/|screenshots?\/)/`, `/\.(png|jpg|jpeg)/`,
`/Console\s*(Error|Message)/`, `/(LCP|CLS|INP|FCP)/` sowie die Sektionen `Screenshots Created`,
`Console Errors`, `Performance Metrics`.
**Wer dem kanonischen Template exakt folgt, fällt durch den Hook.**

**H8 — Core Web Vitals: FID statt INP.** `REPORT_TEMPLATES.md:554-556` nennt FID (von Google
zugunsten INP zurückgezogen); überall sonst INP/FCP, inkl. der erzwingenden Regex.

**H9 — RARE-Matrix bedeutet zwei verschiedene Dinge.**
`META-DECISIONS.md:40-45`: Responsible=@architect entscheidet, Accountable=@validator,
Recommends, Executes=@builder.
`skills/meta-decisions/SKILL.md:56-59`: Responsible=@builder, Accountable=Orchestrator,
Reviewed by=@validator+@tester, Escalated to=User.
Gleiches Akronym, vier andere Auflösungen, @builder und @architect vertauscht. Beide beanspruchen,
*das* RARE-Modell zu sein.

**H10 — `analyze-prompt.js`: live vs. deprecated.** `META-DECISIONS.md:15-19` erklärt das Skript für
seit v8.6.0 deprecated und die Verdrahtung für in v8.5.0 entfernt. `skills/meta-decisions/SKILL.md:25`
zeigt es im Decision-Flow als lebenden Mechanismus.

**H11 — `isolation: worktree` als „bereits gesetzt" behauptet — ist es nicht.**
`skills/quality-gates/SKILL.md:83`: *„already set in validator.md/tester.md; no repo tooling
required"*. Verifiziert: keines der beiden Frontmatter enthält ein `isolation`-Feld. Z. 90 folgert
darauf aufbauend „no file conflicts possible" — auf falscher Prämisse.

**H12 — 11 von 15 Agenten sollen Reports schreiben, haben aber kein `Write`.**
Ohne `Write`: `api-guardian`, `validator`, `tester`, `security`, `github-manager`,
`ci-security-guardian`, `docs-dx`, `quality-operations`, `runtime-platform`, `workflow-design`,
`workspace-governance` — jeder trägt dennoch eine `**Save to:** reports/…`-Anweisung.
Schreiben können nur `architect`, `builder`, `researcher`, `scribe`.

**H13 — Department-/Security-Agenten: „Read + Write" vs. „read-only".**
`~/.claude/CLAUDE.md` (Department-Tabelle) und `docs/AGENTS.md:32,42` sagen „Read + Write".
Dagegen `docs/orchestrator/AGENTS.md:63` („advisory, report-only"), `agents/security.md:31`
(„read-only gate"), `agents/ci-security-guardian.md:32` („I never modify repository files") und die
Frontmatter selbst (kein `Write`).

**H14 — Kritische API-Pfadliste: fünf divergente Versionen.**
CLAUDE.md:49 und `skills/cost-efficiency/SKILL.md:70` nennen 5 Pfade;
`skills/workflows/SKILL.md:91-96` ergänzt `schema.graphql`, `**/interfaces/**`;
`WORKFLOWS.md:127-133` ergänzt `types/`, `openapi.json`, `schema.graphql`, **ohne** `interfaces`;
`skills/api-change/SKILL.md:13-22` ergänzt `swagger.json`, `**/dto/**`, `**/contracts/**`.
Eine Änderung unter `**/dto/**` ist nach einer Datei pflicht-guardian und nach vier unsichtbar.

**H15 — Merge-Strategie: Squash vs. Merge-Commit — und ein konkurrierender Workflow.**
Repo-Recht: Merge-Commit (`VERSIONING.md:53-54`, `CONTRIBUTING.md:208`,
`agents/github-manager.md:133-134`).
`skills/github-master/SKILL.md:18,133,146-147`: „squash merges", „linear history", „squash merge only".
Dieser Skill ist global installiert, triggert genau auf der Release-Oberfläche — und definiert einen
**eigenen 5-Stufen-Workflow** (`:43-111`): ohne @tester, ohne parallele Gates, ohne @api-guardian,
mit eigenem Output-Contract statt `STATUS:` und mit Per-Task-Versionsklassifikation
(`candidate_next_version`, `:105-106`), die VERSIONING.md:24 ausdrücklich verbietet.

**H16 — MODES.md widerspricht sich beim Datum des Smart-Routing-Defaults.** Z. 11: „v8.0.0". Z. 34: „v7.0.0".

**H17 — Retry-Limits: 3 vs. 2.** `skills/quality-gates/SKILL.md:48` („Maximum 3 retry cycles before
escalation") gegen `META-DECISIONS.md:62` („max 2 attempts") und `:93` (>2 Zyklen sind OPTIONAL —
loggen, nicht eskalieren).

**H18 — Eskalationsmodell zweifach unvereinbar.** `META-DECISIONS.md:55-102` definiert einen
Drei-Stufen-Baum mit MANDATORY-Set und dem ausdrücklichen Satz, dass einstimmiges Agenten-PASS das
Gate nicht aufhebt. `skills/meta-decisions/SKILL.md:63-69` ersetzt das durch eine flache
Fünf-Punkte-Liste **ohne** Judgment-Class-Gate, ohne MANDATORY/OPTIONAL-Trennung, ohne
Finding-Conflict-Adjudication.

**H19 — greenfield-bootstrap erzwingt @architect und hebelt das Architecture-Gate-Split aus.**
`skills/greenfield-bootstrap/SKILL.md:31-32,47` („@architect first for any real feature") gegen
Core Rule 3 und `skills/cost-efficiency/SKILL.md:27-29` („No @architect subagent invocation needed").

**H20 — REPORT_TEMPLATES.md: „alle 15 Agenten" (Z. 16) vs. „alle 8 Agenten" (Z. 89).** Dieselbe Datei.

**H21 — Repo-CLAUDE.md ≠ globale CLAUDE.md.** Z. 1–199 byte-identisch. Nur global (fehlt im
publizierten Artefakt): `## Stack & Platform Defaults`, `## Department Agents` (zweite,
widersprüchliche Department-Tabelle, s. H13), `### Scheduled automations`. Der globale
Git-Safety-Block enthält zudem eine Regel, die im Repo-Recht nirgends steht
(`~/.claude/CLAUDE.md:239`). **Die Repo-Kopie ist das veröffentlichte Artefakt; geladen wird die
globale. Sie sind nicht synchronisiert.**

## Meistduplizierte Regel

**Report-Ort und -Benennung — in 27 Dateien wiederholt.** Beide CLAUDE.md, 6 Skills, 4
Orchestrator-Docs und **alle 15 Agent-Dateien** (jede zweimal: Sprint-Contract-Write-Scope und
`**Save to:**`) ⇒ ~42 Einzelaussagen. Zugleich die Regel mit den meisten divergenten Formen (4) —
und die, deren kanonische Form ausgerechnet das Default-Routing falsch wiedergibt.

Platz 2: Dual-Parallel-Gates (17 Dateien). Platz 3: Push-braucht-Erlaubnis (12 Dateien).

## Weiche Divergenzen (Auszug)

- **Verdict-Contract** (8 Dateien): CLAUDE.md:94-99 und QUALITY-GATES.md:164-170 lassen die
  `BLOCKED (scope|conflict|quality)`-Kategorien weg, die `REPORT_TEMPLATES.md:29-33` verpflichtend macht.
- **Report-Mindestlängen** (3 Dateien): alle drei vergessen `researcher: 500`, das das Skript
  tatsächlich erzwingt — und listen `security`, das es nicht erzwingt.
- **Concurrency „~10 Subagents"**: nahezu wörtlich dreifach dupliziert.
- **Screenshots 3 Viewports** (5 Dateien): nur `agents/tester.md:147-151` nennt die konkreten
  Auflösungen.

## Veraltete Fakten (Auszug)

1. `skills/prototype-mode/SKILL.md:36` nennt „Version-first release flow" — in v8.5 zurückgezogen.
2. `MODES.md:70,158` nennt „Full-Gates (Standard)" — umbenannt laut MODES.md:46 selbst.
3. `REPORT_TEMPLATES.md:89` „all 8 CC_GodMode agents" — es sind 15.
4. `validate-agent-output.js` hat **keine** Regeln für `security` und die 6 Department-Agenten,
   obwohl alle 7 validierte Reports liefern sollen.
5. Drei Dateien erzwingen „Force @validator security check" — alle drei stammen aus der Zeit vor dem
   dedizierten @security-Agenten (v7.1) und routen nie dorthin.
6. **Versions-Header hinken:** `VERSION`=8.6.0, aber `VERSIONING.md:1`, `skills/release/SKILL.md:6`,
   `skills/sprint-planning/SKILL.md` sagen v8.5; `MODES.md:3` „Updated: 2026-06-11".
7. CLAUDE.md-Skills-Tabelle listet 14 Skills; installiert sind 15 — `github-master` fehlt (und
   konkurriert laut H15 mit dem Release-Recht).
8. `skills/research/SKILL.md:36-45` „Timeout: 30 seconds MAX" — kein Mechanismus erzwingt das,
   die Angabe ist dekorativ.
9. `skills/quality-gates/SKILL.md:94-98` „40% faster" widerspricht den 60–80 % in
   `docs/AGENT_MODEL_SELECTION.md:46`, `MODES.md:152` und `skills/dynamic-workflows/`.

## Geprüft und in Ordnung

Alle 15 Agent-Dateien vorhanden und zu jedem Roster passend. Jedes referenzierte Skript, jeder
Workflow, jedes Template, jede Policy-Datei existiert. Model-/Effort-Frontmatter deckt sich exakt mit
`docs/AGENT_MODEL_SELECTION.md:22-38`, `CLAUDE.md:118`, `MODES.md:11` und
`docs/orchestrator/AGENTS.md`. Repo↔global Skill-Parität: alle 14 gemeinsamen Skills byte-identisch
bis auf `license:`-Frontmatter und Footer — keine semantische Drift.
