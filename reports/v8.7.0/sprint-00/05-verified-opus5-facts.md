---
agent: orchestrator
date: 2026-07-28
task: Direkt verifizierte Opus-5-Fakten aus offiziellen Anthropic-Docs (Korrektur-Layer zu Report 02)
sources:
  - https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5
  - https://platform.claude.com/docs/en/build-with-claude/effort
  - https://platform.claude.com/docs/en/about-claude/models/whats-new-opus-5
---

# Verifizierte Opus-5-Fakten

Vom Orchestrator direkt aus den Primärquellen gezogen. Wo Report 02
(`02-research-opus5-bestpractice.md`) abweicht, gilt dieses Dokument.

## Harte Zahlen

| Fakt | Wert | Quelle |
|------|------|--------|
| API-Model-ID | `claude-opus-5` | whats-new-opus-5 |
| Context Window | 1M Token — Default **und** Maximum, keine kleinere Variante | whats-new-opus-5 |
| Max Output | 128k Token | whats-new-opus-5 |
| Preis | **$5 / M Input, $25 / M Output** — unverändert ggü. Opus 4.8 | whats-new-opus-5 |
| Fast Mode | $10 / M Input, $50 / M Output; Research Preview, **nur Claude API**, nicht Bedrock/Vertex/Foundry | whats-new-opus-5 |
| Prompt-Cache-Minimum | 512 Token (vorher 1024 bei Opus 4.8) | whats-new-opus-5 |
| Thinking | **an by default**; `effort` steuert die Tiefe | whats-new-opus-5 |
| Kostenverhältnis | Opus 5 liefert Frontier-Intelligenz zum **halben Preis von Claude Fable 5** | whats-new-opus-5 |

**Korrektur zu Report 02:** Dort wurden Fast-Mode-Preise ($10/$50) als reguläre Opus-5-Preise
geführt. Falsch — das sind die Fast-Mode-Aufschläge. Regulär bleibt $5/$25.

## Breaking Change

`thinking: {"type": "disabled"}` wird bei Effort `xhigh` oder `max` mit **HTTP 400** abgelehnt.
Pro Request erzwungen. Wer Thinking abschaltet, muss auf Effort ≤ `high`.

Mit abgeschaltetem Thinking treten zwei Artefakte auf: Tool-Calls landen als Text im sichtbaren
Output (laufen nie), und interne XML-Tags lecken durch. Empfehlung der Docs: Thinking anlassen und
stattdessen Effort senken — *„thinking enabled at `low` effort performs better than thinking
disabled at similar cost"*.

## Effort — offizielle Empfehlung für Opus 5

**Start bei `high` (dem Default).** Dann evalbasiert justieren:
- hoch auf `xhigh` für anspruchsvolle Coding-/Agentic-Arbeit
- hoch auf `max` nur, wenn die Aufgabe unbegrenzten Token-Spend rechtfertigt
- **`low` und `medium` liberal einsetzen** als primärer Hebel für Token-Kosten und Latenz,
  überall wo die Evals zeigen, dass die Qualität hält

Ausdrücklich: *„If you carried effort settings over from an earlier model, run a fresh effort sweep
on your evals rather than reusing them."*

Effort-Ladder-Semantik (Doku-Tabelle): `low` = *„Simpler tasks... such as subagents"*.
`xhigh` = long-running agentic/coding über 30 Minuten mit Millionen-Token-Budgets.

Wichtig: **Effort steuert Thinking-Volumen, nicht die sichtbare Antwortlänge.** Für Länge muss
explizit geprompted werden.

Ebenfalls wichtig für GodMode: **Effort-Wechsel invalidiert den Prompt-Cache.** Innerhalb einer
Session konstant halten; über Workloads hinweg variieren.

## Verhaltensänderungen mit direkter GodMode-Relevanz

Alle vier stehen so in den offiziellen Docs:

1. **Selbst-Verifikation ist eingebaut.**
   *„Claude Opus 5 verifies its own work without being told to. If your prompt contains explicit
   verification instructions ('include a final verification step for any non-trivial task', 'use a
   subagent to verify'), remove them: instructions like these cause over-verification on Claude
   Opus 5, and removing them reduces wasted tokens with no loss in quality. The same applies to
   legacy harness scaffolding that adds separate verification steps."*
   → Trifft GodMode Core Rule 5 (Dual Quality Gates) frontal.

2. **Delegiert zu bereitwillig.**
   Empfohlener Gegen-Prompt aus den Docs: *„Delegate to a subagent only for large tasks that are
   genuinely independent and parallelizable... Do not delegate work you can finish yourself in a
   handful of tool calls, and do not use subagents to verify or double-check your own work."*
   → Trifft GodMode Core Rule 2 („Delegate by default") frontal.

3. **Antworten und geschriebene Deliverables sind länger.**
   Braucht explizite Längenkalibrierung, sonst aufgeblähte Dokumente.
   → Trifft GodMode Core Rule 8 (Report-Pflicht): die Reports werden ohne Kalibrierung fett.

4. **Selbstkorrektur wird stärker narriert.**
   → GodMode „Silence default" ist hier bereits richtig positioniert.

## Selbstkorrektur / Re-Checks

*„Avoid instructing re-checks it already performs ('double-check your answer', 're-verify before
responding'); like verification instructions, these compound with the model's own behavior and add
cost without improving results."*

## Code Review — Fallstrick

*„If your review prompt says 'only report high-severity issues' or 'be conservative', the model may
follow that instruction literally and report less; ask it to report everything and filter in a
separate pass instead."*
→ Direkt relevant für die Prompts von @validator und @security.

## Multi-Agent — was Anthropic positiv sagt

*„Claude Opus 5 coordinates teams of subagents well, with effective writer-verifier patterns and
few cases of agents overwriting each other's work."*

Das ist die wichtigste Nuance: Multi-Agent ist **nicht** entwertet. Was entwertet ist, sind
(a) Verifikations-Subagents für die eigene Arbeit und (b) Delegation kleiner Aufgaben. Große,
echt unabhängige, parallelisierbare Tracks bleiben der richtige Einsatz — und Writer-Verifier
funktioniert laut Docs gut, wenn der Verifier eine **echte zweite Perspektive** prüft statt
denselben Output nachzukontrollieren.

## Stale gewordene Angaben in der GodMode-CLAUDE.md

- „optimiert für Claude Opus 4.8 at ultracode effort" — Modellgeneration überholt.
- „Use the `best` alias: it resolves to Opus 4.8" — überholt; Fable 5 ist laut Docs die teurere
  Stufe über Opus 5, das Alias-Verhalten muss neu verifiziert werden.
- Agent-Effort-Matrix (architect=high, builder=medium, validator/scribe/researcher=low) wurde für
  Opus 4.8 gesetzt. Docs verlangen ausdrücklich einen **frischen Effort-Sweep** statt Übernahme.
