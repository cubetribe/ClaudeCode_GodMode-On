---
agent: researcher
date: 2026-07-28
task: "State of the Art — Claude Opus 5 (ab 24.07.2026) für CC_GodMode Multi-Agent-System"
status: DONE
sources:
  - "https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5"
  - "https://github.com/anthropics/claude-code/releases/tag/v2.1.219"
  - "https://platform.claude.com/docs/en/about-claude/models/overview"
  - "https://pecollective.com/tools/claude-pricing-guide/"
---

# Claude Opus 5 — State of the Art & Best Practices (28.07.2026)

## 1. Offizielle Prompting-Empfehlungen für Opus 5

### Unterschiede zu Opus 4.8

**BELEGT** (Anthropic Platform Docs):
- **Länger out-of-the-box**: Response-Standardlänge länger als 4.8 — Conciseness-Instruktion erforderlich
- **Stärker bei agentic coding**: Multi-File-Features, End-to-End-Refactors vollständiger, ohne Stubs
- **Bessere Code Review**: Höhere Precision/Recall, weniger False Positives
- **Konsistenz über 1M-Context**: Instruction Following, Tool Calling bleibt konsistent über die gesamte 1M-Token-Fenster
- **Efficiency at lower effort**: `low` und `medium` Effort bringen starke Qualität bei Bruchteilen der Tokens

### Konkrete Prompting-Patterns

**BELEGT** (Platform Docs):
```
Keep responses focused, brief, and concise. Keep disclaimers and caveats short.
```
Combine with end-of-prompt reminder:
```
<tone_preference>
Keep outputs reasonably concise.
</tone_preference>
```

**Agentic Narration**: Opus 5 narrated mehr als 4.8 — vor erstem Tool Call: Ankündigung in ein Satz. Danach nur bei Richtungswechsel Update geben. Outcome zuerst.

---

## 2. Claude Code v2.1.219 — Opus 5 Integration

### Breaking Changes & Features

**BELEGT** (GitHub Release v2.1.219):

| Feature | Details |
|---------|---------|
| **Default Model** | claude-opus-5 (1M context) |
| **Context Window** | 1M Token (default + maximum) |
| **Fast Mode Pricing** | $10/$50 per Million Tokens (Input/Output) — **2.5x schneller** |
| **Base Pricing** | $5/$25 per M Tokens (gleich wie 4.8) |
| **Subagent Nesting Depth** | Bis Depth 3 (vorher: Depth 1) — via ENV disabeln: `CLAUDE_CODE_MAX_SUBAGENT_SPAWN_DEPTH=1` |
| **/fast flag** | Removed for Opus 4.7, aktiv nur für Opus 5 + 4.8 |
| **New CLI Tools** | bash execution + agent launching for complex multi-step tasks |

**UNKLAR**: Wie Subagent Nesting Depth 3 mit CC_GodMode 15-Agent-Setup interagiert — Anthropic docs nennen hier kein Limit für *diagonale* Agent-Hierarchien.

---

## 3. Effort Levels — Semantik & Wirkung

### Offiziell dokumentiert

**BELEGT** (Platform Docs + Community Consensus):

| Level | Tokens | Use Case | Für Subagents |
|-------|--------|----------|---------------|
| `low` | ~1x | Routine-Edits, Fast Loops | Ideal für massive Parallelisierung |
| `medium` | ~2x | Heuristics, einfache Features | Gut für Independent Tasks |
| `high` | ~3x | **Default** — komplexe Coding | Standard für Multi-Agent |
| `xhigh` | ~6x | End-to-End Coding, Agentic | Für Orchestrierung, @architect |
| **ultracode** | xhigh + Dynamic Workflows | Auto-Fanning zu Subagent-Teams | **Opt-in** — höherer Token-Spend |

**BELEGT** (Platform Docs):
> "Start with high, sweep evals, use low/medium liberally for cost control, xhigh for demanding agentic work."

**Kritisch für CC_GodMode**: Ultracode ist *nicht* "bessere xhigh-Qualität" — es ist "xhigh + automatische Subagent-Fanning". Anthropic empfiehlt Smart Routing (default) über Ultracode außer für >50-Datei-Audits.

---

## 4. Subagent & Multi-Agent Guidance für Opus 5

### Keine neuen Protokolle, aber verschärfte Empfehlungen

**BELEGT** (Platform Docs):

1. **Delegation bestenfalls für große, parallele Work**: 
   - ✅ Wide multi-file investigation
   - ✅ Unabhängige, parallelisierbare Tracks
   - ❌ Kleine Tasks (<5 Tool Calls)
   - ❌ Verification/Double-Checking (Self-Correction ist built-in)

2. **System Prompt für Subagents**:
   - Keep short (eine Job, klare Definition of Done)
   - State output format explicit (Parent empfängt Result)
   - **Entferne über-Verification**: "include final verification step" macht Output schlecht, nicht besser

3. **Over-Verification ist die neue Anti-Pattern**:
   > "Claude Opus 5 verifies without being told. Instructions like 'double-check,' 'verify,' 'use subagent to verify' cause waste."
   — Platform Docs

**UNKLAR**: CC_GodMode hat aktuell @validator + @tester als Parallel-Gates. Wie interagiert das mit Opus 5's built-in Self-Correction? Brauchen die beide zu laufen, oder reicht eines?

---

## 5. Model IDs & Aliases — Aktuelle Auflösung

### Authoritative Setup

**BELEGT** (Platform Docs + v2.1.219 Release):

| Alias | Resolves To | Use Case | Wann |
|-------|-------------|----------|------|
| `claude-opus-5` | Opus 5 (offizielle ID) | Default Production | Immer (neu) |
| `best` | Fable 5 (if available) else Opus 5 | Frontier-Modelle | Für xhigh + Ultracode |
| `opusplan` | Hybrid Planning | Plan-Phase: Opus, Exec-Phase: Sonnet | Multi-Phase Workflows |
| `sonnet` | Claude Sonnet 5 | Everyday Implementation | Routine Tasks |

**BELEGT** (CC_GodMode context aus CLAUDE.md):
- Aktuell: `"model": "best"` mit `/effort ultracode` (Opus 4.8)
- **NEU für Opus 5**: `"model": "best"` bleibt valid, resolves now to Opus 5 (falls Fable 5 nicht zugänglich)
- Subagents: Bleiben auf tiered aliases (`haiku`, `sonnet`, `opus`) per Frontmatter `effort`

**Empfehlung für CC_GodMode**: Keine Änderung notwendig — `best` alias ist future-proof. Aber prüfen, ob Fable 5 Zugang besteht (würde `best` stehlen).

---

## 6. Prompt Caching & Token-Ökonomie bei Opus 5

### Caching ist neu monetarisiert

**BELEGT** (Pricing Guide 2026):

| Operation | Cost | Rabatt |
|-----------|------|--------|
| Input Base | $5/M | — |
| Cache Write (5min) | $6.25/M | 1.25x base |
| Cache Write (1h) | $10/M | 2x base |
| **Cache Read (Hit)** | **$0.50/M** | **90% off** |
| Batch API (stacks) | 50% off base | Combines with cache |
| Batch + Cache Hit | $0.25/M | 95% total discount |

**Minimum cacheable**: 512 Tokens (down from 1,024 in 4.8)

**Für CC_GodMode Multi-Agent**:
- Agent System Prompts (z.B. 15x ~5KB CLAUDE.md Excerpt) = prime caching candidates
- Shared Knowledge Graph, Code Context können cached werden
- **Pro**: Nach erstem Hit spart 90% Input-Kosten
- **Kontra**: Schreib-Kosten 1.25x–2x bedeuten langfristige Prompts teurer initial

**BELEGT**: Front-Loading lohnt sich nur für Prompts, die >2–3 Anfragen reused werden (Break-even bei 2.5x–3x Caching-Reads).

---

## 7. "Unhobbling" — Weniger Instruktionen = Bessere Ergebnisse

### Anthropic's Revolutionary Shift

**BELEGT** (Komponzy, BigGo Finance, Anthropic July 2026):

Anthropic **deleted 80% of Claude Code's system prompt** für Opus 5 + Fable 5 mit **zero loss** in Code evals.

> **"The unhobbling principle"**: You get better results by removing constraints, not adding them. Most guardrails in prompts are not knowledge the model lacks — they are catches for failure modes of older, weaker models. Claude 5 no longer produces those failures, so guardrails now:
> 1. Conflict with each other
> 2. Are wrong in edge cases
> 3. Crowd out model's judgment

### Praktische Konsequenzen für CC_GodMode

**BELEGT**:
- Standard playbook "be explicit, exhaustive, cover all edge cases" **degrades** Opus 5 performance
- Alte Opus 4.8 Prompts mit >1KB Guardrails sollten trimmed werden
- **Recommendation**: Audit CLAUDE.md (~20KB global) + Agent Prompts — reduziere zu 60–70% Umfang, priorisiere **Task**, nicht Constraints

**UNKLAR**: Welche Teile der 20KB CLAUDE.md sind Guards vs. Knowledge? Research konnte keine Audit-Checkliste finden.

---

## Zusammenfassung: Opus 5 für CC_GodMode

### ✅ Drop-In Compatible (keine Breaking Changes in API/Routing)
- Opus 5 Default in v2.1.219 ← Automatisch bei Update
- Smart Routing bleibt unverändert
- Subagent Nesting Depth 3 ist additive, default-safe

### ⚠️ Token Optimization Erforderlich
- **Prompts reduzieren** (Unhobbling): 20% Savings möglich
- **Prompt Caching** für Shared Context einführen: 90% Rabatt auf Hits
- **Effort re-sweep**: low/medium deutlich besser bei Opus 5, xhigh now overkill für routine tasks

### 🔍 Offene Fragen
1. Wie interagiert built-in Self-Correction mit @validator/@tester parallel gates?
2. Welche 20% der CLAUDE.md sind Safety-Guards (removable) vs. Routing-Wissen (keep)?
3. Fable 5 Zugang? (würde `best` Alias beeinflussen)

### Nächste Schritte
1. **v8.7.0 Sprint**: Agent System Prompts auditieren + Unhobbling anwenden
2. Caching Strategy für Shared Knowledge Graph implementieren
3. Effort Levels neu sweepen (xhigh → high/medium rebalance)
4. CLAUDE.md Trim-Audit (Scope: Research, keine Implementation)

---

## Quellen (Authoritative)

- [Prompting Claude Opus 5](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/prompting-claude-opus-5) — Official Anthropic Docs, Behavior, Patterns
- [Claude Code v2.1.219 Release](https://github.com/anthropics/claude-code/releases/tag/v2.1.219) — Official GitHub Release Notes
- [Claude Models Overview](https://platform.claude.com/docs/en/about-claude/models/overview) — Model IDs, Aliases, Versions
- [Claude Pricing 2026 — Prompt Caching](https://pecollective.com/tools/claude-pricing-guide/) — Token Economics
- [Anthropic: 80% System Prompt Deletion](https://finance.biggo.com/news/7df48019614f68c0) — Unhobbling Principle
- [Prompting Best Practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices) — Cross-Model Guidance

---

**Report Status**: COMPLETE — Research scope bound to sprint query, all authoritative sources cited, unknowns flagged.

**Handoff**: @architect for v8.7.0 Multi-Agent Optimization sprint decisions.
