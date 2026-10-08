---
sprint: 03
slug: coherence-sweep
agent: builder-6 (script-audit)
task: Prüfauftrag tote Skripte (Scope Item 7)
---

# Script-Audit — Verdrahtung von `scripts/*`

## Methode

Ein Skript gilt als **verdrahtet**, wenn mindestens eines zutrifft:

1. Referenz aus `package.json` (`scripts`-Block)
2. Referenz aus `config/claude-settings.json`, `~/.claude/settings.json` oder
   `~/.claude/settings.local.json` (Hook-Konfiguration)
3. Referenz aus einem Workflow unter `.github/workflows/`
4. Es **ist** selbst eines der drei Installer-Entry-Points
   (`scripts/apply-global-claude-setup.sh`, `.ps1`, `scripts/install-mcps.sh`) — diese werden vom
   Nutzer direkt aufgerufen, nicht aus anderen Skripten heraus, und zählen deshalb axiomatisch als
   verdrahtet, nicht weil sie referenziert werden, sondern weil sie der Referenzpunkt sind
5. `require()` aus einem Skript, das nach 1–4 selbst verdrahtet ist (transitiv aufgelöst)

Erwähnung in Markdown, Kommentaren mit CLI-Beispielen („Usage: node script.js") oder Reports zählt
**nicht**. Eine wildcard-Kopie durch den Installer (`for s in "${SRC_SCRIPTS}"/*.js; do cp …`)
zählt ebenfalls **nicht** als Verdrahtung — sie kopiert jede Datei blind, ohne sie namentlich
aufzurufen; das ist Distribution, keine Invokation.

Geprüfte Quellen: `package.json`, `config/claude-settings.json`,
`~/.claude/settings.json`, `~/.claude/settings.local.json`, `.github/workflows/*.yml`,
`scripts/apply-global-claude-setup.sh`, `scripts/apply-global-claude-setup.ps1`,
`scripts/install-mcps.sh`, sowie ein `require()`-Grep über alle `scripts/*.js`.

## Ergebnistabelle (21 Skripte)

| Skript | Größe | Verdrahtet über | Banner vorhanden? |
|---|---|---|---|
| `analyze-prompt.js` | 32K | UNVERDRAHTET | Ja — bestehender `⚠ DEPRECATED since v8.6.0`-Banner |
| `apply-global-claude-setup.ps1` | 12K | Regel 4 — ist selbst Installer-Entry-Point | n/a (Installer) |
| `apply-global-claude-setup.sh` | 16K | Regel 4 — ist selbst Installer-Entry-Point | n/a (Installer) |
| `auto-update.js` | 28K | UNVERDRAHTET | Ja — neu gesetzt (dieser Sprint) |
| `check-api-impact.js` | 12K | Regel 2 — `config/claude-settings.json:29` (`node scripts/check-api-impact.js`), `~/.claude/settings.json` PostToolUse | n/a |
| `check-update.js` | 8.0K | UNVERDRAHTET | Ja — neu gesetzt (dieser Sprint) |
| `domain-pack-loader.js` | 20K | Regel 5 — `require()` in `session-start.js:31` (session-start ist Regel 2) | n/a |
| `escalation-handler.js` | 24K | UNVERDRAHTET | Ja — neu gesetzt (dieser Sprint) |
| `install-mcps.sh` | 8.0K | Regel 4 — ist selbst Installer-Entry-Point (wird zusätzlich von `apply-global-claude-setup.sh:359-362` per `cp` verteilt, aber das allein wäre keine Verdrahtung — Regel 4 trägt hier eigenständig) | n/a (Installer) |
| `mcp-health-check.js` | 12K | Regel 5 — `require('./mcp-health-check.js')` in `session-start.js:274` | n/a |
| `parallel-quality-gates.js` | 16K | UNVERDRAHTET | Teilweise — trug bereits einen informellen „⚠ SIMULATION ONLY"-Hinweis (anderer Fokus: dass die Gates nicht real sind, nicht dass die Datei unverdrahtet ist); expliziter UNWIRED-Banner jetzt ergänzt (dieser Sprint) |
| `pre-push-check.js` | 12K | Regel 1 — `package.json:20` (`"pre-push": "node scripts/pre-push-check.js"`); zusätzlich Regel 5 über `test-hooks-contract.js:599` | n/a |
| `release-check.js` | 8.0K | Regel 1 — `package.json:19`; Regel 3 — beide Workflows | n/a |
| `session-start.js` | 28K | Regel 2 — `config/claude-settings.json:17`, `~/.claude/settings.json` SessionStart | n/a |
| `sync-version.js` | 12K | Regel 1 — `package.json:16-17`; Regel 3 — `release-consistency.yml:26` (@builder-5-Scope, nicht angefasst) | n/a |
| `test-hooks-contract.js` | 28K | Regel 1 — `package.json:21`; Regel 3 — `release-consistency.yml:32` (@builder-5-Scope, nicht angefasst) | n/a |
| `test-phase2-integration.js` | 12K | UNVERDRAHTET | Ja — neu gesetzt (dieser Sprint) |
| `validate-agent-output.js` | 28K | Regel 2 — `config/claude-settings.json:40,51,62`, `~/.claude/settings.json` SubagentStop/TaskCompleted/TeammateIdle | n/a |
| `verify-changes.js` | 12K | Regel 2 — **nur** in `~/.claude/settings.json:47` (global, SubagentStop), **nicht** in `config/claude-settings.json` (repo-kanonisch) | n/a — siehe Drift-Befund unten |
| `version-bump.js` | 20K | Regel 1 — `package.json:18` | n/a |
| `workflow-state.js` | 16K | Regel 5 — `require()` in `session-start.js:45` und in `test-hooks-contract.js:649` | n/a |

## Befund gegen die ursprüngliche Behauptung

**Ursprüngliche Behauptung:** 9 von 21 Skripten unverdrahtet, ~154 KB toter Code, 7 davon ohne
Deprecation-Markierung.

**Korrigiert auf: 6 von 21 Skripten unverdrahtet, ~107,5 KB Gesamtgröße (110.050 Bytes:
`analyze-prompt.js` 31.567 + `auto-update.js` 24.581 + `check-update.js` 7.555 +
`escalation-handler.js` 20.748 + `parallel-quality-gates.js` 14.608 +
`test-phase2-integration.js` 10.991), davon 1 bereits vollständig gebannert
(`analyze-prompt.js`), 1 mit informellem aber unvollständigem Hinweis
(`parallel-quality-gates.js`), 5 ohne jeden Banner vor diesem Sprint.**

Die Erstanalyse war weder in die eine noch die andere Richtung grob falsch — sie hat reale
unverdrahtete Skripte gefunden, aber die Zahl war zu hoch (9 statt 6) und die Methode zu grob
belegt, um sie unverändert weiterzutragen. Der am 2026-07-28 zuvor durchgeführte einfache
Gegen-Check („kein einziges unverdrahtetes Skript") war seinerseits zu grob in die andere
Richtung: er hat vermutlich Docstring-Erwähnungen wie `node auto-update.js --check` als
Verdrahtung gezählt. Beide Vorbefunde werden durch diese regelbasierte Prüfung ersetzt.

## Nebenbefund — Drift zwischen globaler und repo-kanonischer Hook-Konfiguration

`verify-changes.js` ist über `~/.claude/settings.json` (das **gelebte** globale Setup) verdrahtet,
fehlt aber in `config/claude-settings.json` (der **repo-kanonischen** Quelle, aus der
`apply-global-claude-setup.sh` bei einer Neuinstallation synchronisiert). Nach Regel 2 zählt es
heute als verdrahtet — aber eine Neuinstallation aus dem Repo würde diese Wirkung nicht
reproduzieren, weil die repo-kanonische Datei den SubagentStop-Eintrag für `verify-changes.js`
nicht enthält (dort stehen nur `session-start.js`, `check-api-impact.js` und dreimal
`validate-agent-output.js`). Das ist kein Skript-Audit-Fund im engeren Sinn, sondern eine
Konfigurationsdrift, die außerhalb des Write Scope dieses Auftrags liegt (gehört zu
`config/claude-settings.json`, nicht zum Skript-Audit) — hier nur dokumentiert, damit sie nicht
unbemerkt bleibt.

## Nicht angefasst

- `scripts/sync-version.js`, `scripts/test-hooks-contract.js` — Write Scope @builder-5, nicht
  berührt (nur gelesen, um Regel 3/5 zu belegen).
- Keine Löschungen. Keine Funktionsänderungen an den 5 gebannerten Skripten — nur ein
  Kopfkommentar-Block wurde jeweils vor dem bestehenden Docblock eingefügt, Lizenz-Header blieb
  in allen Fällen unverändert erhalten (verifiziert per Read nach Edit).

## Files Created

- keine

## Files Modified

- `scripts/auto-update.js` — UNWIRED-Banner vor bestehendem Docblock eingefügt, Lizenz-Header
  unverändert
- `scripts/check-update.js` — UNWIRED-Banner vor bestehendem Docblock eingefügt, Lizenz-Header
  unverändert
- `scripts/escalation-handler.js` — UNWIRED-Banner vor bestehendem Docblock eingefügt,
  Lizenz-Header unverändert
- `scripts/parallel-quality-gates.js` — UNWIRED-Banner ergänzend zum bestehenden
  „SIMULATION ONLY"-Hinweis eingefügt, Lizenz-Header unverändert
- `scripts/test-phase2-integration.js` — UNWIRED-Banner vor bestehendem Docblock eingefügt,
  Lizenz-Header unverändert
- `reports/v8.7.0/sprint-03/03-builder-script-audit-report.md` — dieser Report (neu)

## Quality Gates

- [x] `node -c` (Syntax-Check) auf allen 5 modifizierten Skripten — Pass
- [x] Lizenz-Header in allen 5 Dateien nach Edit per Read verifiziert — unverändert vorhanden
- [x] Keine Zeile Funktionscode verändert — nur Kopfkommentare eingefügt (bestätigt per Diff-Lektüre)
- [x] Kein Löschvorgang ausgeführt
- [ ] Kein Testlauf nötig — reine Kommentaränderung an unverdrahteten Skripten, keine Test-Suite
      deckt diese Dateien ab (`test-hooks-contract.js` prüft nur verdrahtete Skripte)

Tests: keine automatisierten Tests für dieses Arbeitspaket anwendbar (Kommentar-only-Änderung an
Dateien, die per Definition nirgends ausgeführt werden); `npm run hooks:test`
(`test-hooks-contract.js`) bleibt unberührt, da es die geänderten Dateien nicht referenziert.

## Ready for the deterministic hook

- [x] Alle Änderungen abgeschlossen
- [x] Kein Funktionscode betroffen (Kommentar-only)
- [x] Report vollständig
