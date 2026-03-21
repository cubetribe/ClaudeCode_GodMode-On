---
name: research
description: "Research task workflow — @researcher agent for technology evaluation, best practices lookup, documentation discovery, with timeout limits and memory guidelines"
---

# Research Workflow

## Command

```
"Research: [topic]"
```

## Workflow

```
@researcher → report with sources
```

## When to Use @researcher

| Scenario | Use @researcher? |
|----------|------------------|
| New library/framework needed | YES |
| Best practices for unfamiliar domain | YES |
| Security advisory check | YES |
| API documentation lookup | YES |
| Well-known patterns (REST, MVC) | NO |
| Bug fix in existing code | NO |
| Refactoring known code | NO |

## @researcher Configuration

- **Model:** haiku (fast & cost-effective)
- **Tools:** WebSearch, WebFetch, Read, Glob, memory MCP
- **Timeout:** 30 seconds MAX per task

### Phase Timeouts

| Phase | Timeout | Action on Timeout |
|-------|---------|-------------------|
| WebSearch | 10s | Use cached/partial results |
| WebFetch | 8s | Skip this source |
| Analysis | 12s | Report with available data |
| **Total** | **30s** | **Produce partial report** |

## Report Format

```markdown
# Research Report: [Topic]

## Summary
[1-2 sentence overview of findings]

## Findings
1. [Finding with source]
2. [Finding with source]
3. [Finding with source]

## Recommendation
[Clear recommendation with rationale]

## Sources
- [Source 1](URL) — [brief description]
- [Source 2](URL) — [brief description]

## Confidence
[HIGH/MEDIUM/LOW] — [reason]
```

**Save to:** `reports/vX.X.X/00-researcher-report.md`

## Graceful Degradation

If research fails or times out:

1. **Full Report** — All sources found, all analysis complete
2. **Partial Report** — Some sources found, partial analysis
3. **Failure Report** — Research failed, structured error output

Partial report format includes `completion_percentage` and `sources_status` (FULL/PARTIAL/PENDING).

## Memory Usage

After completing research:

- **STORE** in memory: Key decisions, no-go technologies, verified sources
- **STORE** when: High-confidence findings, deprecated tech discoveries
- **QUERY** first: Check memory before starting new research (avoid duplicates)

## Integration with Other Workflows

@researcher is OPTIONAL in Feature and API Change workflows:

```
Feature:    (@researcher) → @architect → @builder → gates → @scribe
API Change: (@researcher) → @architect → @api-guardian → @builder → gates → @scribe
```

Use when the task involves unfamiliar technology. Skip when working with known patterns.