---
agent: orchestrator
date: 2026-07-28
task: Quellendigest — Originalartikel als Referenz für die v8.7.0-Analyse
source: https://x.com/trq212/article/2080710971228918066
author: Thariq (@trq212), Claude Code / Anthropic
published: 2026-07-24
retrieval: Volltext über authentifizierte Browser-Session gelesen (X blockt anonymen Abruf)
note: Strukturierter Digest, kein Volltext-Reprint. Kurzzitate sind als solche markiert.
---

# Quellendigest — „The new rules of context engineering for Claude 5 models"

Thariq (@trq212), Anthropic / Claude Code — 24.07.2026

## Kernbefund

Anthropic hat beim Übergang auf die Claude-5-Generation (Opus 5, Fable 5) **über 80 % des
Claude-Code-System-Prompts entfernt — ohne messbaren Verlust auf den internen Coding-Evals.**

Begründung im Artikel: Claude Code war über den System-Prompt, über CLAUDE.md-Dateien und über
Skills **über-constrained**. In eigenen Transkripten fanden sie widersprüchliche Anweisungen
innerhalb eines einzigen Requests — Beispiel aus dem Artikel: „leave documentation as
appropriate" gegen „DO NOT add comments". Claude löst solche Konflikte zwar meist richtig auf,
muss aber **erst über den Konflikt nachdenken, bevor es über die Aufgabe nachdenkt**. Das ist
reiner Verlust.

Der Begriff im Artikel dafür: **Unhobbling** — Guardrails entfernen, die für schwächere Modelle
Worst Cases verhinderten und bei Claude 5 nur noch Reibung erzeugen.

Zweiter Treiber: Claude Code hat inzwischen **eigene Mechanismen** (Memory, Artifacts, Skills,
deferred Tools). CLAUDE.md war früher die einzige Quelle für Gedächtnis, Information und
Steuerung — das ist sie nicht mehr.

## Die sechs „Then / Now"-Umkehrungen

| # | Then (Mythos) | Now (aktuelle Regel) |
|---|---------------|----------------------|
| 1 | Claude Regeln geben | Claude **Urteilsvermögen** nutzen lassen |
| 2 | Claude Beispiele geben | **Interfaces designen** |
| 3 | Alles nach vorn laden | **Progressive Disclosure** |
| 4 | Sich wiederholen | **Schlichte Tool-Beschreibungen** |
| 5 | Memory in CLAUDE.md | **Auto-Memory** |
| 6 | Simple Specs | **Rich References** |

### 1. Regeln → Urteilsvermögen
Die alte Anweisung war laut Artikel u. a.: keine Kommentare als Default, nie mehrzeilige
Docstrings, keine Planungs-/Analyse-Dokumente ohne expliziten Auftrag. Das war für einen Teil
der Prompts schlicht falsch (User-Präferenzen, komplexer Code, der Blockkommentare braucht) —
man hat den Tradeoff bei älteren Modellen akzeptiert.

Ersetzt durch eine einzige Urteils-Anweisung (Kurzzitat): *„Write code that reads like the
surrounding code"* — plus Kommentardichte, Naming, Idiom.

**Muster:** absolute Verbote → kontextsensitives Prinzip.

### 2. Beispiele → Interface-Design
Früher galt: Tool-Nutzung immer mit Beispielen zeigen. Bei den neuen Modellen **verengen
Beispiele den Explorationsraum**. Stattdessen: Tools, Skripte und Dateien so gestalten, dass die
Parameter selbst die Absicht ausdrücken. Beispiel aus dem Artikel: Beim Todo-Tool sagt allein
das Status-Enum (`pending` / `in_progress` / `completed`) schon, wie es zu benutzen ist; nur die
Regel „genau ein Item in_progress" muss zusätzlich stehen.

### 3. Alles vorne → Progressive Disclosure
Code-Review- und Verifikations-Wissen stand früher im System-Prompt — selten gebraucht, aber
dann kritisch. Heute in **eigene Skills** ausgelagert, die Claude selektiv zieht.

Gilt ausdrücklich auch für **Tools**: „deferred loading" — Tool-Definitionen werden erst per
ToolSearch geladen und belegen bis dahin keinen Kontext. So sind mehr Tools möglich, ohne
Kontext zu kosten.

Explizit als Mythos benannt: CLAUDE.md und SKILL.md als **Zentralarchiv aller Practices**, weil
Claude sie sonst angeblich nicht findet. Stattdessen: **ein Baum aus Dateien**, die zum richtigen
Zeitpunkt geladen werden.

### 4. Wiederholung → Instruktion gehört ins Tool
Ältere Modelle brauchten Wiederholung und gewichteten Kontext-Ende stärker als Kontext-Anfang.
Deshalb standen Tool-Hinweise doppelt: im System-Prompt **und** in der Tool-Beschreibung. Die
Dubletten wurden gelöscht — **Instruktionen leben in der Tool-Beschreibung, nicht im
System-Prompt**.

### 5. CLAUDE.md-Memory → Auto-Memory
Die `#`-Hotkey-Empfehlung (in CLAUDE.md schreiben lassen) ist überholt. Claude speichert
relevante Memories inzwischen selbst.

### 6. Simple Specs → Rich References
Markdown-Pläne und Spec-Dateien waren der Standard. Claude kann heute reichhaltigere Referenzen
verarbeiten:
- **HTML-Artifacts** statt reiner Markdown-Pläne
- **Code als Spec**: eine detaillierte Test-Suite oder eine Funktion aus einem anderen Codebase,
  die portiert werden soll
- **Rubrics**: erlauben, den eigenen Geschmack prüfbar zu machen (z. B. „was ist gutes
  API-Design") — eingesetzt über **dynamic workflows mit Verifier-Agents**, die gegen die Rubric
  prüfen

## Die Zuordnung: was gehört wohin

**System-Prompt** — produktgebunden. Sagt Claude, in welchem Produkt es läuft und was es tut. Für
Claude Code selbst praktisch nie zu ändern; wer eine **eigene Agent-Harness** baut, soll hier
viel Zeit investieren.

**CLAUDE.md** — leichtgewichtig halten. Kurz sagen, wofür das Repo da ist, und **den Großteil der
Tokens für die Gotchas des Codebase** ausgeben (Artikelbeispiel: alle Typen liegen in genau einer
monolithischen Datei und nirgends sonst). **Nichts hineinschreiben, was Claude durch einen Blick
auf Dateisystem oder Repo ohnehin sieht.** Details per Progressive Disclosure — z. B. eigene
Verifikations-Skill, aus CLAUDE.md heraus referenziert.

**Skills** — leichte Wegweiser, damit Claude Information findet, wenn sie gebraucht wird. **Nicht
over-constrained**, außer in wirklich kritischen Bereichen. Lange Skills in mehrere Dateien
aufteilen (Progressive Disclosure). Der eigentliche Wert: **Skills kodieren die spezifischen
Meinungen, das Wissen und die Practices von dir / deinem Team / deinem Produkt** — nicht
Allgemeinwissen.

**References** — Dateien per `@` einbinden. **Bevorzugt Code**, weil das die klarste,
höchstauflösende Instruktion in einer Sprache ist, die Claude sehr gut kennt. Ausdrücklich: ein
HTML-Mockup eines Designs liefert bessere Ergebnisse als eine Beschreibung oder ein Screenshot.

## Werkzeug

Anthropic hat **`claude doctor` / `/doctor`** ausgeliefert: rightsized Skills und CLAUDE.md-Dateien
gegen genau diese Best Practices — automatisiert. Der Artikel verweist außerdem auf einen
**Fable field guide** für das Prompting fortgeschrittener Modelle.

## Direkte Konsequenzen für CC_GodMode (Orchestrator-Einschätzung, nicht Artikelinhalt)

1. Die globale CLAUDE.md ist ein Zentralarchiv — genau das im Artikel benannte Anti-Pattern.
2. Regeln in Imperativform („NEVER", „MANDATORY", „MUST", „No Skipping") sind Regel-Denken aus
   der „Then"-Spalte.
3. Agent-Definitionen wiederholen Orchestrator-Kontext → Dublettenproblem aus Umkehrung 4.
4. Progressive Disclosure ist über Skills teilweise schon da — aber die CLAUDE.md lädt den
   Skill-Katalog trotzdem komplett vorab.
5. Auto-Memory und Artifacts sind ungenutzte native Fähigkeiten.
6. Rubrics + Verifier-Agents sind der von Anthropic empfohlene Ersatz für starre Gate-Regeln —
   GodMode hat die Gates, aber nicht die Rubrics.
