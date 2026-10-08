---
agent: orchestrator
date: 2026-10-07
task: Ultracode-Bedienung direkt an der laufenden Claude-Code-Binary verifizieren (Widerspruch Docs vs. Changelog im Researcher-Report auflösen)
sources:
  - "~/Library/Application Support/Claude/claude-code/2.1.286/…/claude (Claude Code 2.1.286, Desktop-App)"
---

# Ultracode-Verifikation an Claude Code 2.1.286

## Ausgangslage

Der Researcher-Report (`00-researcher-claude-code-changes-report.md`) fand einen Widerspruch:
Die Docs sagen, `--effort ultracode` setze `xhigh`; der Changelog sagt, Ultracode erzwinge
kein `xhigh` mehr und sei ein eigener Schalter. Als UNVERIFIED markiert.

## Methode

String-Analyse der Binary von Claude Code 2.1.286 (die Version, mit der die Desktop-App
läuft). Das Terminal-`claude` dieser Maschine steht noch auf 2.1.220 und ist veraltet.

## Befund (aus dem `/effort`-Command-Handler)

- Parser: `/effort ultracode` oder `/effort ultracode on` schaltet ein, `/effort ultracode off`
  schaltet aus.
- Meldung beim Einschalten: „Ultracode on (this session only): … **Effort stays <level>**."
  Meldung beim Ausschalten: „Ultracode off. Effort stays <level>."
  ⇒ Ultracode ist ein **eigener Schalter**. Die Effort-Stufe bleibt unverändert.
- Voraussetzung: „Ultracode needs dynamic workflows enabled (see /config)."
- Modellabhängig: „Ultracode isn't available on <model>."
- Pro Prompt: Das Schlüsselwort `ultracode` im Prompt opt-in nur für diesen Turn.
- Wirkung (System-Reminder): Bei aktivem Ultracode soll der Workflow-Tool für jede
  substanzielle Aufgabe benutzt werden; Token-Kosten sind ausdrücklich kein Constraint.

## Konsequenz für die Doku

Empfohlene Session-Einrichtung:

```
/model opus            # Opus 5.5 — empfohlener Default
/effort xhigh          # optional, für anspruchsvolle agentische Arbeit
/effort ultracode      # Schalter: automatische Dynamic Workflows, nur diese Session
```

Die bisherige README-Aussage „`/effort ultracode` = xhigh reasoning + workflows" ist für
2.1.286 falsch.
