# CC_GodMode v5.0 Roadmap

> **Status:** PLANNING - Not yet implemented
> **Created:** 2025-01-05
> **Updated:** 2025-01-05 (Simplified after review)
> **Goal:** Better knowledge transfer between agents through Shared Memory

---

## What already works well (v4.1.0)

| Component | Status |
|------------|--------|
| **Claude Code as Orchestrator** | Works excellently |
| **Task tool with subagent_type** | Simple and effective |
| **7 specialized agents** | Clear task separation |
| **Version-First Workflow** | Good structure |

**Conclusion:** The orchestration itself needs NO changes!

---

## Problem Analysis (What needs improvement)

| Problem | Impact |
|---------|------------|
| **Too many reports** | Large projects generate hundreds of report files |
| **Knowledge gets lost** | Context between agent calls and sessions is not persistent |
| **Agents don't know about each other** | @builder doesn't know what @architect decided |
| **Hooks not optimal** | Currently only API-impact-check, no memory update |
| **Complex initialization** | Many manual steps for new project |

---

## Planned Solution: Memory MCP for Shared Knowledge

### A single MCP server is enough!

| MCP Server | Purpose | Installation |
|------------|-------|--------------|
| **[@modelcontextprotocol/server-memory](https://www.npmjs.com/package/@modelcontextprotocol/server-memory)** | Knowledge Graph for Shared Context | `claude mcp add memory -- npx -y @modelcontextprotocol/server-memory` |

**Why only this one?**
- Official Anthropic server
- IDE-independent (stdio-based)
- Works with Claude Code, VS Code, Cursor, Windsurf, Antigravity, etc.
- No external dependencies (no RabbitMQ, no Docker)
- Simple installation via npx

---

## Architecture v5.0 (Simplified)

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLAUDE CODE (Orchestrator)                   │
│                                                                  │
│       Unchanged! Task tool + subagent_type works.                │
└──────────────────────────────┬──────────────────────────────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
         ▼                     ▼                     ▼
   ┌───────────┐        ┌───────────┐        ┌───────────┐
   │ @architect│        │ @builder  │        │ @validator│
   │ @api-     │        │ @tester   │        │ @scribe   │
   │  guardian │        │           │        │ @github-  │
   │           │        │           │        │  manager  │
   └───────────┘        └───────────┘        └───────────┘
         │                     │                     │
         │    READ + WRITE                           │
         └─────────────────────┼─────────────────────┘
                               │
                               ▼
              ┌─────────────────────────────────┐
              │        MEMORY MCP (NEW!)         │
              │                                  │
              │  Shared Knowledge Graph:         │
              │  ┌───────────────────────────┐  │
              │  │ Entity: "v5.0.0-feature"  │  │
              │  │ ├─ architect_decision     │  │
              │  │ ├─ api_impact             │  │
              │  │ ├─ implementation_status  │  │
              │  │ └─ files_changed          │  │
              │  └───────────────────────────┘  │
              │                                  │
              │  Persistent across sessions!     │
              └─────────────────────────────────┘
```

**The difference:**
- **Old:** Agents write reports → Next agent must read report file
- **New:** Agents write to memory → Next agent has immediate structured access

---

## Changes in Detail

### 1. Reports → Knowledge Graph + Summary

**Old (v4.1.0):**
```
reports/v4.1.0/
├── 00-architect-report.md      ← 7 separate files
├── 01-api-guardian-report.md
├── 02-builder-report.md
├── 03-validator-report.md
├── 04-tester-report.md
├── 05-scribe-report.md
└── 06-github-manager-report.md
```

**New (v5.0):**
```
Memory MCP (during workflow):
└── Entity: "workflow-v5.0.0"
    ├── architect: { decision: "...", files: [...] }
    ├── builder: { status: "done", changes: [...] }
    └── validator: { passed: true, issues: [] }

reports/v5.0.0/
└── summary-report.md    ← ONLY 1 file at the end by @scribe
```

### 2. Agent Communication → Memory MCP

**Old:**
```
@architect writes → reports/00-architect-report.md
@builder reads    ← reports/00-architect-report.md (must parse file!)
```

**New:**
```
@architect writes → Memory MCP (Entity: "v5.0.0-auth-feature")
@builder reads    ← Memory MCP (structured data, no parsing)
```

### 3. Rework Hooks

**Current (v4.1.0):**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "node scripts/check-api-impact.js $FILE_PATH" }
        ]
      }
    ]
  }
}
```

**New (v5.0):**
```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          { "type": "command", "command": "node scripts/check-api-impact.js $FILE_PATH" },
          { "type": "command", "command": "node scripts/update-memory.js $FILE_PATH" }
        ]
      }
    ],
    "Stop": [
      {
        "hooks": [
          { "type": "command", "command": "node scripts/workflow-summary.js" }
        ]
      }
    ]
  }
}
```

**New Hook Scripts:**
| Script | Trigger | Purpose |
|--------|---------|-------|
| `check-api-impact.js` | PostToolUse (Write/Edit) | API Breaking Change Warning (exists) |
| `update-memory.js` | PostToolUse (Write/Edit) | Log file changes to memory (NEW) |
| `workflow-summary.js` | Stop | Create summary at end of session (NEW) |

### 4. Self-Installing System (INIT-V5.md)

**Concept:** User copies a prompt into Claude Code → System installs itself.

**The installation prompt automatically executes:**

1. **Check prerequisites** (Node 18+, Claude CLI, Git)
2. **Clone repository** from GitHub
3. **Install agents** to `~/.claude/agents/`
4. **Install scripts** to `~/.claude/scripts/`
5. **Install Memory MCP** via `claude mcp add`
6. **Configure hooks** in `~/.claude/settings.json`
7. **Verify installation**
8. **Cleanup** (delete temporary files)

**Advantages:**
- No manual `git clone` needed
- No manual configuration
- Everything in one step
- Error messages on issues
- Installation report at the end

**File:** `INIT-V5.md` (already created)

---

## Migration Path v4.1.0 → v5.0

### Phase 1: Memory MCP Setup
- [ ] Install Memory MCP: `claude mcp add memory -- npx -y @modelcontextprotocol/server-memory`
- [ ] Verify: `claude mcp list`

### Phase 2: Hook Extension
- [ ] Create `scripts/update-memory.js`
- [ ] Create `scripts/workflow-summary.js`
- [ ] Update hooks in `.claude/settings.local.json`

### Phase 3: Agent Adaptation
- [ ] All 7 agents: Memory MCP integration in prompts
- [ ] @scribe: Summary report logic instead of 7 individual reports

### Phase 4: Documentation
- [ ] Create INIT-V5.md
- [ ] Update CLAUDE.md
- [ ] Update README.md

### Phase 5: Testing
- [ ] Complete workflow test with Memory
- [ ] Test memory persistence across sessions

---

## Memory MCP - Planned Usage

### Entity Schema for Workflows

```javascript
// Workflow Entity (created by Orchestrator)
{
  name: "workflow-v5.0.0",
  entityType: "workflow",
  observations: [
    "Version: 5.0.0",
    "Type: feature",
    "Started: 2025-01-05T10:00:00Z"
  ]
}

// Agent Results (added by each agent)
{
  name: "workflow-v5.0.0-architect",
  entityType: "agent-result",
  observations: [
    "Decision: Use JWT + Redis for auth",
    "Files: src/auth/*, src/middleware/*",
    "API-Impact: Breaking change, needs v2"
  ]
}

// Relation between Entities
{
  from: "workflow-v5.0.0",
  to: "workflow-v5.0.0-architect",
  relationType: "has_result"
}
```

### Memory MCP Tools

| Tool | Usage |
|------|------------|
| `create_entities` | Create workflow/agent-result |
| `add_observations` | Add status updates |
| `create_relations` | Link entities |
| `search_nodes` | Find previous decisions |
| `read_graph` | Read entire workflow state |

---

## Open Questions

1. **Memory Cleanup:** After release - delete old workflow entities?
2. **Multi-Project:** Entities with project prefix? (e.g., `projectA-workflow-v5.0.0`)
3. **Fallback:** What if Memory MCP is not running? → Report files as fallback?

---

## Sources

- [@modelcontextprotocol/server-memory](https://www.npmjs.com/package/@modelcontextprotocol/server-memory)
- [MCP Memory Server GitHub](https://github.com/modelcontextprotocol/servers/tree/main/src/memory)

---

## Effort (estimated)

| Phase | Scope |
|-------|--------|
| Phase 1: Memory MCP Setup | 30 minutes |
| Phase 2: Hook Extension | 1-2 hours |
| Phase 3: Agent Adaptation | 2-3 hours |
| Phase 4: Documentation | 1 hour |
| Phase 5: Testing | 1 hour |
| **Total** | **~1 day** |

---

*This document is a planning document. Changes will only be implemented after approval.*
