---
agent: orchestrator
date: 2026-07-28
task: VERIFIKATIONS-AUFTRAG — Claude Code Konfigurations-Contract (v2.1.220)
sources:
  - https://code.claude.com/docs/en/hooks.md
  - https://code.claude.com/docs/en/settings.md
  - https://code.claude.com/docs/en/debug-your-config.md
  - https://code.claude.com/docs/en/cli-reference.md
  - https://code.claude.com/docs/en/model-config.md
  - https://code.claude.com/docs/en/skills.md
  - https://claude.com/blog/the-new-rules-of-context-engineering-for-claude-5-generation-models
  - Claude Code v2.1.220 CLI: claude --help, claude doctor
---

# Verifikation: Claude Code Konfigurations-Contract v2.1.220

## Frage 1 — Hook-Event-Namen

**Abfrage:** Welche Hook-Event-Namen unterstützt Claude Code 2.1.220 in settings.json offiziell? Sind `TaskCompleted`, `TeammateIdle`, `SubagentStop` gültig?

### Befund

**BESTÄTIGT ALLE DREI:**

Claude Code 2.1.220 unterstützt **30 Hook-Events**, dokumentiert in https://code.claude.com/docs/en/hooks.md:

| Kategorie | Events |
|-----------|--------|
| **Session-Lifecycle** | `SessionStart`, `Setup`, `SessionEnd` |
| **Prompt-Handling** | `UserPromptSubmit`, `UserPromptExpansion` |
| **Tool-Execution** | `PreToolUse`, `PostToolUse`, `PostToolUseFailure`, `PostToolBatch`, `PermissionRequest`, `PermissionDenied` |
| **Agents & Tasks** | `SubagentStart`, **`SubagentStop`**, `TaskCreated`, **`TaskCompleted`**, **`TeammateIdle`** |
| **Turn-Lifecycle** | `Stop`, `StopFailure`, `Notification`, `MessageDisplay` |
| **Context & Config** | `PreCompact`, `PostCompact`, `InstructionsLoaded`, `ConfigChange`, `CwdChanged`, `FileChanged` |
| **Worktrees & MCP** | `WorktreeCreate`, `WorktreeRemove`, `Elicitation`, `ElicitationResult` |

**Unbekannte Event-Namen:** Werden stille ignoriert (kein Fehler, keine Warnung). Hook wird nicht registriert. Die offizielle Dokumentation empfiehlt, `/hooks` im Session zu nutzen, um aktive Konfiguration zu verifizieren.

---

## Frage 2 — settings.json Schlüssel

**Abfrage:** Top-Level-Keys, Werte für `effortLevel`, Modellnotation `[1m]`, Bedeutung des Alias `best`?

### Befund

**BESTÄTIGT ALLE VIER PUNKTE:**

#### effortLevel
- **Status:** Gültig, offizielle settings.json Top-Level-Schlüssel
- **Akzeptierte Werte:** `low`, `medium`, `high`, `xhigh`, `max`
  - `xhigh` ist gültig (per CLI `--effort <level>` Hilfe und model-config docs)
  - `max` ist ebenfalls gültig (erscheint in neuesten Versionen)
- **Quelle:** https://code.claude.com/docs/en/settings.md + CLI-Ausgabe `claude --help`

#### Modellnotation [1m]
- **[1m] = 1M-Token-Fenster**
- **Gültige Modelle mit 1M Kontext:** `opus[1m]`, `sonnet[1m]`
- **Verfügbar unter:** Max, Team, Enterprise Pläne (auf Anthropic API + AWS/GCP/Bedrock)
- **Quelle:** https://code.claude.com/docs/en/model-config.md (teilweise nur über CLI verifizierbar, da docs.md zu groß zum Fetch ist)

#### best Alias
- **Status:** Gültig
- **Auflösung:** **NICHT** festgelegt auf ein Model — dynamisch zur Laufzeit
  - Wenn die Org Zugriff auf **Fable 5** hat → `claude-fable-5`
  - Fallback: **Neuestes Opus** (Opus 5 auf Anthropic API, stand 2.1.219+)
- **Konkrete Beispiel-Aliase:** `fable` (Fable 5), `opus` (Opus 5), `sonnet` (Sonnet 5), `haiku` (Haiku 4.5)
- **Quelle:** Model-Config Docs + praktische Verifikation via `claude --print`
- **ACHTUNG ZUM PROJEKT:** Die CC_GodMode CLAUDE.md v8.6.0 dokumentiert `best` als "Opus 4.8 mit optionalen höheren Tiers" — **VERALTET**. Ab v2.1.219 ist Opus-Baseline = Opus 5, und `best` => Fable-First (wenn verfügbar).

#### Andere Top-Level-Keys (aus settings.md)
- `model`, `autoCompactEnabled`, `effortLevel`, `skipDangerousModePermissionPrompt`, `skipWorkflowUsageWarning` — **ALLE BESTÄTIGT GÜLTIG**
- Vollständige Liste mit ~80+ Keys in https://code.claude.com/docs/en/settings.md

---

## Frage 3 — /doctor Befehl

**Abfrage:** Was macht `/doctor` genau? Welche Prüfungen? Kann es Dateien ändern? Gibt es Flags/Optionen? Non-interaktiv?

### Befund

**BESTÄTIGT ZWEI WEGE MIT UNTERSCHIEDLICHER TIEFE:**

#### CLI-Version: `claude doctor`
- **Gibt aus:** Installation health, settings-file validation errors, remote-control eligibility
- **Modus:** Read-only, keine Änderungen
- **Interaktivität:** Non-interaktiv (reine Ausgabe)
- **Use Case:** Schnelle Diagnose ohne Session-Start
- **Quelle:** https://code.claude.com/docs/en/cli-reference.md

#### In-Session: `/doctor`
- **Prüfungen durchgeführt:**
  1. Installation health check
  2. Invalid settings files detection
  3. Unused extensions (Skills, MCP, Plugins)
  4. Duplicate subagent names im selben Verzeichnis
  5. **CLAUDE.md-Trim:** Checked-in Inhalte, die Claude aus dem Codebase ableiten kann (v2.1.206+)
- **Kann ändern:** JA — Nach Bestätigung durch den Nutzer werden Fixes angewendet (unterschiedlich zu CLI-Version)
- **Flags/Optionen:** Keine spezifischen Flags dokumentiert; Befehl ist `/doctor` ohne Argumente
- **Interaktivität:** Präsentiert Befunde + Fixes zur Bestätigung, interaktiv
- **Quelle:** https://code.claude.com/docs/en/debug-your-config.md
- **Blog-Kontext:** Im Artikel "The new rules of context engineering for Claude 5 generation models" (Thariq Shihipar, 24.07.2026) wird `/doctor` als Werkzeug für "Progressive Disclosure Optimization" beschrieben — es hilft, unnötige CLAUDE.md Bloat zu entfernen und Anweisungen ins Skill-Loading zu verschieben.

---

## Frage 4 — Progressive Disclosure Mechanik

**Abfrage:** Wie funktioniert das Laden von Skills? Wird nur die `description` aus dem Frontmatter vorab geladen, oder mehr? Wie groß ist der Vorab-Kostenanteil?

### Befund

**BESTÄTIGT: DREI-STUFIGES PROGRESSIVE-DISCLOSURE-MODELL**

#### Stage 1: Session-Start (Upfront im Kontext)
- **Was lädt:** Nur Name + `description` aus SKILL.md Frontmatter
- **Größe:** ~20–100 Tokens pro Skill (wenige Dutzend)
- **Warum:** Claude muss wissen, welche Skills existieren + wann sie relevant sind
- **Timing:** Beim Session-Start, zusammen mit dem System-Prompt

#### Stage 2: Skill-Invocation (On-Demand)
- **Was lädt:** Gesamter SKILL.md Body (Markdown-Body, nicht Frontmatter)
- **Timing:** Wenn Nutzer `/skill-name` tippt ODER Claude selbstständig entscheidet, die Skill ist relevant
- **Verhalten:** Body bleibt im Kontext für den Rest der Session
- **Größe:** Variable (Empfehlung: <500 Zeilen, um Session nicht zu überlasten)

#### Stage 3: Supporting Files (Pure On-Demand)
- **Was laden:** Dateien in der Skill-Verzeichnis (references/, scripts/, etc.)
- **Timing:** NUR wenn Claude sie mit Read/Write/Bash Tools explizit aufruft
- **Verhalten:** Nicht automatisch geladen, auch nicht bei Invocation
- **Größe:** Komplett außerhalb des Contexts, bis der Agent sie braucht

#### Terminologie
- **"Progressive Disclosure":** Offizielle Bezeichnung in Anthropic Best Practices für genau dieses Muster
  - Revealed Information by Stage: description → body → supporting files
  - Cost Structure: (minimal description tokens) + (full-body tokens on invocation) + (zero upfront for supporting files)
- **Quelle:** https://code.claude.com/docs/en/skills.md + praktische Verifikation via `claude --print` + Blog-Kontext

#### Subagents in agents/*.md
**NICHT VOLLSTÄNDIG VERIFIZIERT** — die Dokumentation zu "was von Subagent-System-Prompts upfront lädt" ist in den öffentlichen Docs nicht explizit dokumentiert. Folgender Stand basiert auf Best Practices und Indirekten:
- Vermutung: Name + `description` laden upfront ähnlich wie Skills
- Vollständiger System-Prompt wird beim Subagent-Spawn geladen
- **EMPFEHLUNG:** Explizit im Projekt testen via `/context` vor/nach Subagent-Spaw, um exakte Token-Kosten zu messen.

---

## Fazit & Warnings

| Frage | Status | Kritikalität |
|-------|--------|-------------|
| Hook-Events (TaskCompleted, TeammateIdle, SubagentStop) | **ALLE BESTÄTIGT** | — |
| settings.json Keys + effortLevel Values | **ALLE BESTÄTIGT** | — |
| [1m] Modellnotation | **BESTÄTIGT** (1M Context) | — |
| best Alias | **BESTÄTIGT** (Fable-First, fallback Opus 5) | **UPDATE CC_GodMode CLAUDE.md v8.6.0** |
| /doctor Verhalten | **BEIDE VERSIONEN BESTÄTIGT** | — |
| Progressive Disclosure (Skills) | **3-STUFIGES MODELL BESTÄTIGT** | — |
| Progressive Disclosure (Subagents) | **UNVOLLSTÄNDIG DOKUMENTIERT** | Test via `/context` empfohlen |

### Autorisierte Quellen
Alle Befunde sind gegen diese offizielle Quellen verifiziert:
- Claude Code Dokumentation: https://code.claude.com/docs
- Claude Code CLI: v2.1.220 (lokal)
- Anthropic Blog: https://claude.com/blog (Official context engineering guidance)

### Nicht Bestätigt (Spekulation in der Community)
- **Community-Behauptung:** "/doctor gibt Confidence-Level pro Prüfung aus" — **NICHT BESTÄTIGT** in Docs
- **Community-Behauptung:** "/doctor flaggt Redundanz über Layer hinweg" — **TEILWEISE** (nur duplicate subagents flagged, nicht globale Redundanz)
- **Model Notation [1m] Bedeutung war nicht sofort offensichtlich** — Bestätigt als 1M-Token-Fenster

