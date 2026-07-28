---
sprint: 02
slug: gate-restructure
plan: plans/v8.7.0/PLAN.md
status: done
execution: sequential
owner: orchestrator
ux_gate: skip
---

# Sprint 02 — Gate-Umbau: @validator auflösen, @tester optional

## Goal

Das Verifikationsmodell von CC_GodMode entspricht wieder dem, was das ausführende Modell
tatsächlich braucht. Nach diesem Sprint gibt es genau eine Aussage darüber, wer nach @builder
prüft — statt der heutigen Lage, in der `docs/orchestrator/AGENTS.md` drei Gates verdrahtet,
`QUALITY-GATES.md` zwei kennt und `meta-decisions` eines überspringen darf.

Grundlage sind die offiziellen Opus-5-Docs (belegt in
`reports/v8.7.0/sprint-00/05-verified-opus5-facts.md`):

> „Claude Opus 5 verifies its own work without being told to. … The same applies to legacy harness
> scaffolding that adds separate verification steps."

und, für die Gegenrichtung:

> „Claude Opus 5 coordinates teams of subagents well, with effective writer-verifier patterns."

Die Unterscheidung, die dieser Sprint umsetzt: Ein Verifier, der **dieselbe Evidenz** noch einmal
liest, ist Verschwendung. Ein Verifier, der eine **zweite Evidenzquelle** öffnet, bleibt wertvoll.

## Entscheidungen (Maintainer, 2026-07-28)

1. **@validator wird aufgelöst** — nicht ersatzlos gestrichen, sondern gespalten:
   - Der **deterministische Teil** (Typecheck, Lint, Tests, Build) wandert in einen Hook nach dem
     Vorbild von `check-api-impact.js`. Ein Compiler ist keine zweite Meinung, sondern ein Fakt —
     Anthropics Warnung gilt modellbasierter Nachkontrolle, nicht Werkzeugen. Kosten: ~0 Kontext
     bei Erfolg, Ausgabe nur bei Fehlern.
   - Der **Urteilsteil** (Code Review) wird bei Bedarf über das native `/code-review` gezogen
     statt über einen stehenden Agenten.
2. **@tester bleibt, wird aber opt-in.** Er ist der einzige echte Writer-Verifier im System, weil
   er Browser, Screenshots, a11y und CWV öffnet — Evidenz, die @builder nie hatte. Aber er kostet
   ~10.773 Token plus Bild-Token pro Lauf und lief in der gesamten Report-Historie nie.
3. **Der Default kehrt sich um: `human` statt `auto`.**

## Scope

**Neues Sprint-Frontmatter-Feld `ux_gate: auto | human | skip`**
- Entschieden **einmal bei der Sprint-Planung**, schriftlich, bevor die Ausführung startet.
  Während des Laufs wird nicht mehr gefragt — der Loop bleibt ungestört.
- Gefragt wird **nur**, wenn die Write-Scope-Tabelle des Sprints UI-Pfade berührt. Andernfalls
  setzt der Orchestrator stumm `skip`.
- Default bei Unklarheit: `human`.
- `auto` erfordert einen erreichbaren `playwright`-MCP; ist er es nicht, fällt der Sprint auf
  `human` zurück und protokolliert das im Routing Log statt zu blockieren.

**Core Rule 5** — von „Dual Quality Gates, beide müssen bestehen" zu einem Prinzip: nach @builder
prüft der deterministische Hook immer; ein UX-Gate läuft, wenn der Sprint es angefordert hat; ein
Review-Durchgang wird gezogen, wenn Risiko oder Zweifel es rechtfertigen.

**Core Rule 6** — von „@tester MUST screenshot, 3 Viewports" zu „wenn `ux_gate: auto`, dann 3
Viewports (375×667 / 768×1024 / 1920×1080), Console-Errors und CWV; sonst entfällt das Gate".

**Core Rule 8 (Defekt D1)** — Report-Pflicht nur für Agenten mit `Write`. Verifiziert: nur
`architect`, `builder`, `researcher`, `scribe` haben es; `docs-dx`, `quality-operations`,
`workflow-design`, `workspace-governance` haben ausschließlich `Read, Grep, Glob` und können die
Pflicht physisch nicht erfüllen. Entweder Werkzeug ergänzen oder Pflicht auf den Verdict
reduzieren — pro Agent zu entscheiden, nicht pauschal.

**Kohärenz-Sweep** über alle Stellen, die das Gate-Modell aussprechen. Halbe Änderung ist
ausdrücklich verboten: entweder alle Stellen oder keine.

## Non-Goals

- Kein Streichen von @tester. Die Fähigkeit bleibt, nur ihr Default dreht sich.
- Keine Änderung an Core Rule 2 (Delegationsschwelle) — eigener Sprint, eigene Entscheidung.
- Keine Neuvermessung der Effort-Matrix — braucht einen echten Eval-Sweep, keine Meinung.
- Keine VERSION-/CHANGELOG-Writes außer `[Unreleased]` durch @scribe bei der Integration.
- Kein Anfassen von `reports/**`, `plans/v8.5.0/**`, `plans/v8.6.0/**`, `archive/**` — Historie.
- Keine Behebung der übrigen Widersprüche aus `03b-contradiction-sweep.md` (H2, H3, H4, H5, H9,
  H14, H15, H17, H18, H21) — das ist Sprint 03, weil die Write Scopes überlappen.

## Files / Write Scope (ownership)

| Path / Glob | Writer | Notes |
|---|---|---|
| `CLAUDE.md`, `templates/CLAUDE-ORCHESTRATOR.md` | @builder-1 (law) | Hot File, Single Writer. Template ist derzeit gedriftet — mit angleichen (H21) |
| `docs/orchestrator/QUALITY-GATES.md`, `docs/orchestrator/WORKFLOWS.md`, `docs/orchestrator/AGENTS.md`, `docs/orchestrator/MODES.md` | @builder-2 (orchestrator-docs) | @security-Verdrahtung hier klären oder explizit vertagen |
| `skills/quality-gates/SKILL.md`, `skills/workflows/SKILL.md`, `skills/cost-efficiency/SKILL.md`, `skills/prototype-mode/SKILL.md`, `skills/departments/SKILL.md` | @builder-3 (skills) | jede Änderung zusätzlich nach `~/.claude/skills/` spiegeln |
| `agents/validator.md` (→ `archive/`), `agents/tester.md` | @builder-4 (agents) | validator.md nicht löschen, sondern archivieren |
| `scripts/validate-agent-output.js`, `scripts/parallel-quality-gates.js`, `scripts/session-start.js`, neuer Hook | @builder-5 (scripts) | minLength-Gate für @tester entfällt mit; Hook-Contract-Tests mitziehen |
| `docs/templates/SPRINT_TEMPLATE.md`, `docs/templates/REPORT_TEMPLATES.md` | @builder-6 (templates) | `ux_gate` ins Sprint-Frontmatter; Verdict-Contract unverändert lassen |
| `CHANGELOG.md` `[Unreleased]` | @scribe only | bei Integration, serialisiert |
| `reports/v8.7.0/sprint-02/*` | jeder Agent (eigener Report) | kanonische Nummerierung |

## Risks

- **Halbe Änderung erzeugt neue Widersprüche.** Genau der Fehler, den dieser Sprint behebt. Gegenmittel:
  Abnahme über einen `grep`-Sweep, nicht über Stichproben.
- **Der neue Hook ist projektabhängig.** `npx tsc --noEmit` gilt nicht für Swift- oder
  Flutter-Repos. Der Hook muss erkennen, was das Projekt ist, und bei Unbekanntem sauber
  durchlassen statt zu blockieren.
- **@security hat bis heute kein definiertes Routing** (H5). Wer das Gate-Modell anfasst, muss
  entscheiden — oder die Lücke ausdrücklich als offen protokollieren, statt sie erneut zu erben.
- **`skills/github-master/` konkurriert mit dem Release-Recht** (H15) und ist global installiert.
  Berührt diesen Sprint nicht direkt, kann aber im Gate-Kontext falsch triggern.

## Acceptance Criteria

1. `grep -rn "@validator" --include="*.md" --include="*.js"` liefert außerhalb von `reports/`,
   `plans/v8.5.0/`, `plans/v8.6.0/`, `archive/` und `CHANGELOG.md` **keinen** Treffer mehr, der
   @validator als laufendes Gate beschreibt.
2. Die Aussage „wer prüft nach @builder" ist an **allen** verbleibenden Fundstellen identisch.
3. `ux_gate` ist im Sprint-Template dokumentiert, hat `human` als Default und wird nur bei
   UI-Write-Scope abgefragt.
4. Der deterministische Hook läuft, erzeugt bei Erfolg **0 Byte** Kontext und wird von
   `test-hooks-contract.js` abgedeckt.
5. Kein Agent trägt mehr eine Report-Pflicht, die sein Werkzeugsatz nicht erfüllen kann.
6. `node scripts/validate-agent-output.js` enthält keine Regel mehr für einen Agenten, den es
   nicht mehr gibt.

## Test Strategy

Deterministisch, nicht modellbasiert: `test-hooks-contract.js` für den neuen Hook; ein
`grep`-Sweep als ausführbare Assertion für die Kohärenzkriterien 1–3; ein Trockenlauf eines
Bug-Fix-Sprints mit `ux_gate: skip` und einer mit `auto`.

`ux_gate: skip` für diesen Sprint selbst — der Write Scope berührt keine UI.

## Changelog Note

`Changed` — Verifikationsmodell an die Claude-5-Generation angepasst: @validator in einen
deterministischen Hook plus bedarfsweises `/code-review` aufgelöst, UX-Gate über `ux_gate`
opt-in statt Pflicht. `Fixed` — Report-Pflicht für Agenten ohne Schreibrecht.

## Version Relevance

**minor** — Verhaltensänderung am Workflow, keine gebrochene öffentliche Schnittstelle. Die
Entfernung eines Agenten ist für Nutzer sichtbar; sollte die Release-Sprint-Aggregation das als
Bruch werten, gilt der höhere Wert.

## Result

Done 2026-07-28. 86 Dateien, +1.791 / −1.798 Zeilen. Sieben parallele Builder auf disjunkten
Write Scopes, das kanonische Recht vom Orchestrator vorgegeben statt zur Formulierung freigegeben.

**Akzeptanzkriterien**

1. ✓ Kein `@validator` mehr als laufendes Gate außerhalb von `reports/`, `plans/v8.5.0`,
   `plans/v8.6.0`, `archive/`, `DECISIONS.md` (historischer ADR) und `docs/STORY.md`. Verbleibende
   Nennungen sind erklärend (README-FAQ „What happened to @validator?", Auflösungsnotizen).
2. ✓ Die Aussage „wer prüft nach @builder" ist an allen verbleibenden Stellen identisch.
3. ✓ `ux_gate` im Sprint-Template mit Default `human`, Abfrage nur bei UI-Write-Scope, inklusive
   Routing-Log-Format für den `auto→human`-Fallback.
4. ✓ `scripts/verify-changes.js` läuft, liefert bei Erfolg 0 Byte, exit 0 bei Müll-stdin und
   außerhalb erkannter Projekte. `test-hooks-contract.js` 43/43 (vorher 28/28).
5. ✓ Kein Agent trägt eine Report-Pflicht, die sein Werkzeugsatz nicht erfüllen kann.
6. ✓ `validate-agent-output.js` hat keinen Regelsatz für einen nicht existierenden Agenten.

**Scope-Ergänzungen während der Ausführung** (Begründung jeweils Kohärenz, nicht Ausweitung)

- **Core Rule 7** musste mit. „No Skipping" hätte dem opt-in-Gate ab sofort widersprochen. Ersetzt
  durch den Routing Log, der ohnehin geführt wird.
- **Write-Rechte statt Verdict-Return für vier Gates.** Die Dispatch-Anweisung lautete „keine neuen
  Write-Rechte". Das war falsch: api-guardian, security, tester und github-manager hielten alle
  `Bash` — ihre Read-only-Deklaration behauptete eine Sicherheit, die nicht existierte. Die
  Frontmatter bildet jetzt ab, was gilt. Sechs rein beratende Agenten liefern Verdicts.
- **`workflow-state.js` / `pre-push-check.js`** (Nachtrag @builder-8). Beide kodierten das alte
  Modell in ausführbarer Logik; `pre-push-check` hätte ab der Auflösung jeden Push blockiert.
  Neue Semantik: `null` heißt „war nicht gefordert", nicht „fehlt noch" — ein nicht gefordertes
  Gate blockiert nicht.
- **`docs/schemas/workflow-state.schema.json`**, **`.claude-plugin/plugin.json`** (verwies auf die
  gelöschte Agent-Datei), **`session-start.js`**-Banner, sowie `domain-pack-loader.js`,
  `escalation-handler.js`, `mcp-health-check.js`, `docs/AGENT_ARCHITECTURE.md`,
  `config/domain-config.schema.json` — vom Orchestrator im Abnahme-Sweep nachgezogen.

**Beobachtung, die zu einer weiteren Korrektur führte**

Fünf von sieben Buildern verloren Zeit damit, ihren *Report* an `validate-agent-output.js`
anzupassen statt zu arbeiten. Ursache: `requiredPatterns` nagelte die Markdown-Überschriftenebene
fest (`/###\s+Files Created/`), während `requiredSections` nur warnte. Wer `## Files Modified`
schrieb, fiel hart durch, obwohl die Substanz da war. Die Patterns akzeptieren jetzt Ebene 2–4 und
gängige Synonyme. Dieselbe Gattung wie die entfernten Mindestlängen: das Gate maß Form statt
Substanz.

**Nicht angefasst, bewusst**

- Effort-Matrix — als „nicht neu vermessen" markiert statt geraten. Braucht einen echten
  Eval-Sweep.
- Core Rule 2 (Delegationsschwelle) — eigener Sprint, eigene Entscheidung.
- `scripts/analyze-prompt.js` — trägt seit v8.6.0 einen Deprecated-Banner, `session-start.js`
  entfernt aktiv jede Hook-Referenz darauf. Markierter toter Code.
- ADR-001 in `DECISIONS.md` — historische Aufzeichnung, nur mit datierter Korrekturnotiz versehen
  statt umgeschrieben.

**Offen für Sprint 03:** die restlichen Widersprüche aus `03b-contradiction-sweep.md` (H2 scribe/
VERSION im Report-Template teils behoben, H14 fünf divergente API-Pfadlisten, H15
`skills/github-master` gegen das Release-Recht, H18 Eskalationsmodell, H21 CLAUDE.md-Kopien).

**Invarianten bei Abschluss:** `sync-version --check` 12/12 grün, Release-Invariante hält,
`test-hooks-contract` 43/43, VERSION unangetastet.
