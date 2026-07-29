---
sprint: 04
slug: install-update-path
plan: plans/v8.7.0/PLAN.md
status: done
execution: parallel
owner: orchestrator
ux_gate: skip
---

# Sprint 04 — Installation und Update: ein Weg, der nachweislich funktioniert

## Goal

Wer das Repo frisch klont, bekommt mit **einem** Befehl ein vollständig funktionierendes GodMode —
inklusive Hooks. Wer bereits installiert hat, bekommt mit **demselben** Befehl das Update. Beides
ist im README dokumentiert und durch einen ausführbaren Check belegt, nicht durch eine Behauptung.

## Ausgangslage — am 2026-07-28 am Dateisystem verifiziert

### Befund 1 (Blocker): Eine Neuinstallation hat keine Hooks

`scripts/apply-global-claude-setup.sh` kopiert `agents/`, `skills/`, `scripts/`, `templates/`,
LICENSE und NOTICE korrekt nach `~/.claude/`. Es schreibt aber **niemals** `~/.claude/settings.json`
— und sagt das selbst: *„MCP servers (memory, playwright, …) and settings.json hooks are NOT
touched by this script."*

Folge: Nach einer Frischinstallation feuert **kein einziger Hook**. Kein `check-api-impact.js`
(Core Rule 4), kein `verify-changes.js` (Core Rule 5, seit Sprint 02 das Rückgrat der
deterministischen Checks), kein `session-start.js`, keine Report-Validierung. Die gesamte
Durchsetzungsschicht ist abwesend, während die gesamte Dokumentation ihre Existenz voraussetzt.

Der vorhandene Reparaturweg schließt die Lücke nicht: `--fix-hooks` bricht ab, wenn keine
`settings.json` existiert (*„cannot fix hooks (nothing to merge into)"*). Frischinstallation ⇒
keine `settings.json` ⇒ Reparatur verweigert.

Verschärfend: Der Broken-Wiring-Guard, der genau das melden würde (`session-start.js:60`, aus
v8.6.0), sitzt selbst in einem Hook. Er kann nicht warnen, dass Hooks fehlen, weil er dann nicht
läuft.

### Befund 2: Der dokumentierte Update-Weg zeigt auf totes Skript

`CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md` weist an: *„Run: `node
~/.claude/scripts/auto-update.js --check`"*. Der Skript-Audit aus Sprint 03 hat `auto-update.js`
und `check-update.js` als unverdrahtet belegt und mit Deprecated-Bannern versehen — der Banner sagt
ausdrücklich, der Audit habe *nicht* feststellen können, ob sie je verdrahtet waren.

Der einzige dokumentierte Update-Weg verweist damit auf Code, den das Repo selbst für tot erklärt.

### Befund 3: Das README kennt keinen Update-Abschnitt

`README.md` hat „Install in 30 Seconds". Zu Updates gibt es genau eine Zeile — einen Link auf
`docs/AGENT_ARCHITECTURE.md`. Auf die Frage „wie aktualisiere ich?" antwortet das Schaufenster
nicht.

### Was in Ordnung ist

Die Skills **sind** Teil des Repos (14 unter `skills/`) und werden vom Installer mitkopiert. Das
war die Sorge hinter der Anfrage — sie ist unbegründet. Ebenso installiert werden alle 14 Agenten,
die Skripte, die Templates sowie seit Sprint 01 LICENSE und NOTICE.

## Scope

### 1. Der Installer verdrahtet Hooks (Blocker-Behebung)

Ein normaler Lauf von `apply-global-claude-setup.sh` (und `.ps1`) schreibt die Hook-Konfiguration
aus `config/claude-settings.json` nach `~/.claude/settings.json`.

Bedingungen, nicht verhandelbar:
- **Mergen, nicht überschreiben.** Nutzer haben eigene Einstellungen (`model`, `effortLevel`,
  `permissions`, eigene Hooks). Nur der `hooks`-Block wird zusammengeführt; alles andere bleibt
  unberührt. Die Merge-Logik existiert bereits im `--fix-hooks`-Zweig — wiederverwenden, nicht neu
  bauen.
- **Vorher sichern**, mit Zeitstempel, wie es `--fix-hooks` bereits tut.
- **Idempotent.** Zweiter Lauf erzeugt keine Dubletten.
- Existiert keine `settings.json`, wird sie aus der kanonischen Vorlage **angelegt** statt
  abgelehnt. Das behebt zugleich den `--fix-hooks`-Abbruch.
- Ein Opt-out (`--no-hooks`) für Nutzer, die ihre Hook-Konfiguration selbst verwalten.

Die Zeile „settings.json hooks are NOT touched" wird damit unwahr und muss weg.

### 2. Ein Befehl für Installation und Update

Kein zweiter Mechanismus. Derselbe idempotente Installer ist der Update-Weg:

    git pull && ./scripts/apply-global-claude-setup.sh

Der Installer gibt am Ende Vorher/Nachher-Version aus (`~/.claude/.cc-godmode-version` gegen
`VERSION`), damit sichtbar ist, was passiert ist. Bei gleicher Version: „already up to date", kein
Rauschen.

Begründung gegen eine Wiederbelebung von `auto-update.js`: Ein Selbst-Updater, der aus dem Netz
lädt, entpackt und ersetzt, ist ein zweiter Mechanismus mit eigenen Fehlermodi neben einem
Installer, der ohnehin laufen muss. `git pull` ist für ein Git-Repo der ehrlichere Weg — der Nutzer
sieht, was er bekommt.

### 3. `auto-update.js` und `check-update.js` archivieren

Nach Vorbild von `archive/agents/validator.md`: nach `archive/scripts/` verschieben, nicht löschen.
Sie bleiben nachlesbar, verschwinden aber aus `scripts/`, wo sie den Eindruck erwecken, Teil des
Systems zu sein. Löschen bleibt eine eigene Entscheidung.

### 4. `CCGM_Prompt_98-Maintenance.md` neu schreiben

Kein Verweis auf archivierte Skripte. Der Prompt sagt, was tatsächlich zu tun ist: Repo
aktualisieren, Installer laufen lassen, Ergebnis prüfen. Er darf den Nutzer durch die
Verifikation führen, aber nichts behaupten, was kein Code tut.

### 5. README: Install- und Update-Abschnitt, beide belegt

- „Install in 30 Seconds" gegen die Wirklichkeit prüfen: Wird wirklich alles installiert, was der
  Abschnitt verspricht? Der Schritt „CLAUDE.md ins Projekt kopieren" muss klar drinstehen — das
  Repo installiert **kein** globales `~/.claude/CLAUDE.md`, sondern legt die Vorlage unter
  `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` ab. Das ist Absicht und muss als solche dastehen.
- Neuer Abschnitt **Update** mit dem einen Befehl.
- Neuer Abschnitt **Verify your install** mit dem Check aus Punkt 6.

### 6. Ein ausführbarer Installations-Check

`scripts/verify-install.js` (neu). Prüft und meldet knapp:
- Alle 14 Agenten unter `~/.claude/agents/`
- Alle 14 Skills unter `~/.claude/skills/`
- Die Hooks aus `config/claude-settings.json` sind in `~/.claude/settings.json` verdrahtet und
  zeigen auf existierende Dateien
- `~/.claude/templates/CLAUDE-ORCHESTRATOR.md` vorhanden
- Install-Version gegen Repo-`VERSION`
- LICENSE und NOTICE vorhanden

Exit 0 bei vollständiger Installation, Exit 1 mit konkreter Fehlliste sonst. Als
`npm run install:verify` in `package.json`. **Das** ist die belastbare Antwort auf „kann man das
wirklich installieren" — ein Check, keine Behauptung.

### 7. `docs/INSTALLATION.md` gegen die Wirklichkeit prüfen

Ende-zu-Ende durchgehen: Stimmt jeder Schritt nach den Änderungen aus Punkt 1 und 2 noch? Stimmen
die Pfade? Wird der Hook-Schritt erwähnt?

## Non-Goals

- **Keine MCP-Server-Installation.** `install-mcps.sh` bleibt ein eigener, bewusst getrennter
  Schritt. `playwright` ist aktuell der einzige nicht verbundene Server; das ist eine
  Nutzerentscheidung, kein Installationsdefekt.
- **Kein Selbst-Updater aus dem Netz** (siehe Begründung in Punkt 2).
- **Kein Plugin-Installationsweg** (`.claude-plugin/`) — eigener Kanal, eigener Sprint, falls
  gewünscht.
- **Keine VERSION-, CHANGELOG- oder ROADMAP-Writes** außer der `[Unreleased]`-Zeile durch @scribe.
- **Kein Anfassen von** `reports/**`, `plans/v8.5.0/**`, `plans/v8.6.0/**`, `archive/**`.

## Files / Write Scope (ownership)

| Path / Glob | Writer | Notes |
|---|---|---|
| `scripts/apply-global-claude-setup.sh`, `scripts/apply-global-claude-setup.ps1` | @builder-1 (installer) | Merge-Logik aus `--fix-hooks` wiederverwenden, nicht neu bauen; beide Plattformen gleich verhalten |
| `scripts/verify-install.js` (neu), `package.json` (nur `scripts`-Block) | @builder-2 (verify) | Exit-Codes sind der Contract |
| `README.md` | @builder-3 (readme) | Hot File, Single Writer |
| `docs/INSTALLATION.md`, `docs/AGENT_ARCHITECTURE.md` | @builder-4 (docs) | |
| `CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md`, `CCGM_Prompt_01-SystemInstall-*.md` | @builder-5 (prompts) | Versionsstrings NICHT ändern — `sync-version.js` prüft sie |
| `scripts/auto-update.js`, `scripts/check-update.js` → `archive/scripts/` | @builder-6 (archive) | verschieben, nicht löschen; Lizenz-Header erhalten |
| `scripts/test-hooks-contract.js` | @builder-2 (verify) | Checks für `verify-install.js` ergänzen |
| `CHANGELOG.md` `[Unreleased]` | @scribe only | bei Integration, serialisiert |
| `reports/v8.7.0/sprint-04/*` | jeder Agent mit `Write` | kanonische Nummerierung |

## Risks

- **Der Installer schreibt künftig in die Nutzer-`settings.json`.** Das ist der heikelste Eingriff
  dieses Sprints. Ein fehlerhafter Merge zerstört Nutzerkonfiguration. Gegenmittel: Backup vor
  jedem Schreiben (existiert bereits), Merge nur des `hooks`-Blocks, JSON-Validierung vor und nach
  dem Schreiben, und ein Test, der einen Merge in eine Datei mit fremden Schlüsseln fährt und
  belegt, dass die fremden Schlüssel überleben.
- **`.ps1` und `.sh` können auseinanderlaufen.** Sie sind heute schon zwei Implementierungen
  derselben Absicht. Beide müssen dieselben Bedingungen erfüllen; die Abnahme prüft beide.
- **`verify-install.js` prüft die Installation, läuft aber aus dem Repo.** Es darf nicht
  voraussetzen, im Repo zu liegen — ein Nutzer könnte es aus `~/.claude/scripts/` aufrufen. Beide
  Aufrufwege müssen funktionieren.
- **Agenten-Verdicts waren in Sprint 02 fünfmal irreführend** (sie beschrieben die letzte
  Report-Iteration statt der Arbeit). Abnahme erneut über `git diff --stat` und eigene Läufe, nicht
  über Verdicts.

## Acceptance Criteria

1. Ein Lauf von `apply-global-claude-setup.sh` in einer Umgebung **ohne** `~/.claude/settings.json`
   erzeugt eine gültige `settings.json` mit allen Hooks aus `config/claude-settings.json`.
2. Ein Lauf gegen eine **bestehende** `settings.json` mit fremden Schlüsseln (`model`,
   `effortLevel`, `permissions`, eigene Hooks) erhält diese vollständig und ergänzt nur die
   GodMode-Hooks. Durch Test belegt, nicht durch Augenschein.
3. Zweiter Lauf hintereinander erzeugt keine doppelten Hook-Einträge.
4. `node scripts/verify-install.js` meldet Exit 0 auf dieser Maschine und listet bei einem
   künstlich entfernten Agenten den konkreten Fehler mit Exit 1.
5. `grep -rn "auto-update\|check-update" README.md docs/ CC-GodMode-Prompts/` liefert keinen
   Treffer, der die Skripte als gangbaren Weg beschreibt.
6. `README.md` enthält einen Update-Abschnitt mit dem einen Befehl und einen Verify-Abschnitt.
7. `node scripts/sync-version.js --check` grün (14 Touchpoints), `release-check` hält,
   `test-hooks-contract` vollständig grün (Stand: 48/48).
8. `docs/INSTALLATION.md` beschreibt keinen Schritt, den der Installer nicht ausführt.

## Test Strategy

Deterministisch und ausführbar. Für Kriterium 1–3 baut @builder-2 Testfälle in
`test-hooks-contract.js`, die gegen ein temporäres `CLAUDE_HOME` arbeiten — die echte
`~/.claude/settings.json` des Maintainers darf von keinem Test berührt werden. Kriterium 4 wird
live gefahren. Kriterien 5–8 sind `grep`- und Skriptläufe.

`ux_gate: skip` — kein UI im Write Scope.

## Changelog Note

`Fixed` — eine Neuinstallation verdrahtete bisher keine Hooks; die gesamte Durchsetzungsschicht
(API-Impact, deterministische Checks, Session-Start, Report-Validierung) fehlte nach dem
Erstinstall, und `--fix-hooks` verweigerte die Reparatur mangels vorhandener Datei. `Changed` —
Installation und Update laufen über denselben idempotenten Befehl; neuer `verify-install`-Check;
`auto-update.js`/`check-update.js` archiviert, der Maintenance-Prompt verweist nicht mehr auf sie.

## Version Relevance

**minor** — behebt einen Installationsdefekt und ergänzt einen Verifikationsweg, ohne eine
öffentliche Schnittstelle zu brechen. Der Installer schreibt künftig in `settings.json`; das ist
neues Verhalten, aber additiv und abwählbar.

## Result

Done 2026-07-28. Sechs parallele Builder auf disjunkten Scopes. Zwei meldeten `BLOCKED (quality)`
und widersprachen einander — die Adjudikation ist unten dokumentiert und war der wichtigste Vorgang
dieses Sprints.

**Akzeptanzkriterien**

1. ✓ Frischinstallation ohne `settings.json` erzeugt eine gültige Datei mit allen Hooks.
2. ✓ Merge gegen eine bestehende Datei mit fremden Schlüsseln erhält diese vollständig — und, nach
   der Adjudikation, auch **fremde Hook-Einträge innerhalb derselben Events**. Durch Test belegt.
3. ✓ Zweiter Lauf erzeugt keine Dubletten (`settings.json` byte-identisch).
4. ✓ `verify-install.js` Exit 0 auf vollständiger Installation, Exit 1 mit konkretem Dateinamen bei
   entferntem Agenten.
5. ✓ Kein Treffer mehr für `auto-update`/`check-update` in README, docs oder Prompts.
6. ✓ README hat Update- und Verify-Abschnitt.
7. ✓ `sync-version --check` 14/14, `release-check` hält, `test-hooks-contract` **64/64** (vorher 48).
8. ✓ `docs/INSTALLATION.md` beschreibt keinen Schritt, den der Installer nicht ausführt.

**Die Adjudikation: mein Fehler, nicht der der Builder**

@builder-2s Test belegte, dass der Installer-Merge ganze Hook-*Events* ersetzt statt Einträge
*innerhalb* eines Events zusammenzuführen. Ein Nutzer mit eigenem `SessionStart`-Hook hätte ihn bei
jedem Install und jedem Update verloren.

@builder-1 wies zutreffend darauf hin, dass meine Dispatch-Anweisung zwei einander ausschließende
Dinge verlangte: „Nutzerkonfiguration darf nicht zerstört werden" **und** „die vorhandene
Merge-Logik unverändert wiederverwenden". Die vorhandene Logik *ist* die Zerstörung. Punkt zwei war
mein Fehler.

**Entscheidung: Nutzerschutz gewinnt.** Die Begründung, die beim Schreiben der Anweisung fehlte:
Das Ersetzen ganzer Events war vertretbar, solange es ausschließlich in `--fix-hooks` lief — einem
Befehl, den der Nutzer bewusst aufruft, um genau seine Hook-Verdrahtung zu reparieren. In dem
Moment, wo dieselbe Logik bei jedem Install und jedem Update läuft, wird aus einer akzeptablen
Reparatur ein stiller Datenverlust. Das Verhalten war nie korrekt, es war an seinem alten Ort nur
folgenlos.

Der Merge arbeitet jetzt pro Eintrag mit Dedup über den Skript-Basename. `--fix-hooks` nutzt
dieselbe Funktion und erbt die Verbesserung. Beide Builder haben korrekt gehandelt: Der eine hat
den Defekt gemessen statt ihn zu glauben, der andere hat den Widerspruch gemeldet statt ihn
eigenmächtig aufzulösen.

**Erster echter Lauf von `verify-install.js` — und er fand sofort etwas**

Gegen die Installation des Maintainers: Exit 1, `LICENSE-CC_GodMode.txt` und
`NOTICE-CC_GodMode.txt` fehlen. Korrekt erkannt — die Installation stammt aus der Zeit vor Sprint
01, der den Lizenz-Kopierschritt einführte, und der Installer lief seither nicht. Genau der Fall,
für den der Check gebaut wurde.

**Weitere Funde der Builder, über den Auftrag hinaus**

- `docs/AGENT_ARCHITECTURE.md` wies an, einzelne Agent-Dateien **von Hand per `cp`** zu kopieren —
  und listete dabei nur 6 der 14 Agenten. Wer der Anleitung folgte, bekam eine halbe Installation.
- Der manuelle Install-Prompt führte gar nicht durch die Hook-Verdrahtung. Ohne Korrektur hätten
  wir die Lücke im Skript geschlossen und im Prompt offengelassen.
- Der Auto-Prompt behauptete „15 scripts"; es sind 18 (17 `.js` plus `install-mcps.sh`). Vom
  Orchestrator korrigiert, ASCII-Boxbreite erhalten.

**Bekannte Grenze**

`apply-global-claude-setup.ps1` wurde zeilengleich nachgezogen, konnte hier aber **nicht ausgeführt
werden** — auf dieser Maschine existiert keine PowerShell-Runtime (`command -v pwsh powershell`
liefert nichts). Der Windows-Pfad ist geprüft, nicht getestet. Naheliegender Folgeschritt: ein
Windows-Job in der CI, der die `.ps1` wenigstens parst; GitHub Actions hat Windows-Runner.

**Sicherheit**

Alle Tests liefen gegen ein temporäres `CLAUDE_HOME`. Die echte `~/.claude/settings.json` des
Maintainers wurde vom Orchestrator nach Abschluss geprüft: alle zehn Top-Level-Schlüssel vorhanden,
`model`, `effortLevel`, `permissions` und `theme` unverändert.
