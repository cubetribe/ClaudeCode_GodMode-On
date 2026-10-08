# Domain Pack Specification

**Version:** v5.8.0
**Last Updated:** 2026-01-08
**Status:** Draft

---

## Overview

Domain Packs enable customization of CC_GodMode for specific project types, frameworks, or organizational standards. They allow extending or overriding core agent behaviors, validation rules, and workflows without modifying the core system.

**Key Principles:**
- **Core remains stable** - Domain packs extend, don't break core
- **Resolution order is predictable** - Project > Global > Core
- **Backwards compatible** - Projects without domain packs work normally
- **Discoverable** - Domain packs self-document their capabilities

---

## Architecture

```
Resolution Chain
================

    Project Domain Pack          Global Domain Pack           Core Agents
    (./domains/{name}/)          (~/.claude/domains/{name}/)  (~/.claude/agents/)
           |                              |                          |
           v                              v                          v
    +---------------+              +---------------+           +------------+
    | domain-config |              | domain-config |           | agent.md   |
    | agents/       |   ------>    | agents/       |   ----->  | (default)  |
    | validation/   |   fallback   | validation/   |   fallback|            |
    +---------------+              +---------------+           +------------+
           ^                              ^                          ^
           |                              |                          |
           +------------- resolveAgent(name, domain) ----------------+
                          Returns first found
```

---

## Directory Structure

### Project-Level Domain Pack

```
project-root/
  domains/
    {domain-name}/
      domain-config.json      # Required: Domain configuration
      agents/                 # Optional: Agent prompt overrides
        builder.md
        tester.md
      validation-rules.json   # Optional: Validation rule extensions
      hooks/                  # Optional: Domain-specific hooks
        pre-workflow.js
        post-agent-builder.js
      templates/              # Optional: Report templates
        builder-report.md
```

### Global Domain Pack

```
~/.claude/
  domains/
    {domain-name}/
      domain-config.json
      agents/
      validation-rules.json
```

---

## Configuration File

### domain-config.json (Required)

```json
{
  "name": "react-native",
  "version": "1.0.0",
  "description": "Domain pack for React Native mobile development",
  "author": "Team Name",
  "license": "proprietary",

  "compatibility": {
    "minVersion": "5.8.0",
    "maxVersion": "6.0.0"
  },

  "agents": {
    "builder": {
      "extends": "core:builder",
      "prompt": "agents/builder.md",
      "model": "sonnet",
      "mcpServers": ["appium"]
    },
    "tester": {
      "extends": "core:tester",
      "prompt": "agents/tester.md",
      "tools": ["Bash", "Read", "Write"]
    }
  },

  "validationRules": {
    "builder": {
      "requiredSections": ["Platform Compatibility"],
      "requiredPatterns": ["(iOS|Android)"],
      "overrides": false
    }
  },

  "workflows": {
    "newFeature": ["architect", "builder", "tester", "mobile-qa", "scribe"]
  },

  "hooks": {
    "preWorkflow": ["hooks/check-expo-version.js"],
    "postAgent": {
      "builder": ["hooks/lint-native-code.js"]
    }
  },

  "tags": ["mobile", "react-native", "ios", "android"]
}
```

---

## Agent Override Files

### Extending Core Agents

When an agent file exists in the domain pack, it can either **extend** or **replace** the core agent.

**Extending (Recommended):**
```markdown
# @builder - React Native Extension

> Extends core @builder with React Native specifics

---

## Additional Responsibilities

- Verify platform-specific code compatibility
- Run iOS and Android builds
- Handle native module integration

## Platform Considerations

### iOS
- Check CocoaPods dependencies
- Verify Xcode version compatibility

### Android
- Check Gradle configuration
- Verify Android SDK version

---

## Original Core Responsibilities

[All core @builder responsibilities remain in effect]
```

**Replacing (Use with caution):**
```markdown
# @builder - Custom Implementation

> Replaces core @builder entirely

**WARNING:** This agent completely replaces the core builder.
All core functionality must be re-implemented.

[Full agent implementation]
```

---

## Validation Rules

### validation-rules.json

```json
{
  "builder": {
    "requiredSections": [
      "Platform Compatibility",
      "iOS Considerations",
      "Android Considerations"
    ],
    "requiredPatterns": [
      "Platform\\.(OS|select)",
      "(iOS|Android)"
    ],
    "minLength": 800,
    "overrides": false
  },
  "tester": {
    "requiredSections": [
      "Device Testing",
      "Simulator Results"
    ],
    "overrides": false
  }
}
```

### Merge Behavior

When `overrides: false` (default):
- Domain `requiredSections` are **added** to core sections
- Domain `requiredPatterns` are **added** to core patterns
- Domain `minLength` **overrides** core minLength (if specified)

When `overrides: true`:
- Domain rules **completely replace** core rules for that agent

---

## Resolution Algorithm

```javascript
function resolveAgent(agentName, domainName) {
  // 1. Check project domain
  if (exists(`./domains/${domainName}/agents/${agentName}.md`)) {
    return projectDomainAgent;
  }

  // 2. Check global domain
  if (exists(`~/.claude/domains/${domainName}/agents/${agentName}.md`)) {
    return globalDomainAgent;
  }

  // 3. Fall back to core
  if (exists(`~/.claude/agents/${agentName}.md`)) {
    return coreAgent;
  }

  // 4. Agent not found
  return null;
}
```

---

## Usage

### CLI Commands

```bash
# Discover all domain packs
node scripts/domain-pack-loader.js discover

# Resolve agent with domain
node scripts/domain-pack-loader.js resolve builder react-native

# Validate a domain pack
node scripts/domain-pack-loader.js validate ./domains/react-native

# List all agents for a domain
node scripts/domain-pack-loader.js list react-native
```

### In Orchestrator

```markdown
# CLAUDE.md orchestrator configuration

domain: react-native
```

Or per-workflow:
```
User: "New Feature: Add push notifications --domain=react-native"
```

---

## Creating a Domain Pack

### Step 1: Create Directory

```bash
mkdir -p domains/my-domain/agents
```

### Step 2: Create Configuration

```bash
cat > domains/my-domain/domain-config.json << 'EOF'
{
  "name": "my-domain",
  "version": "1.0.0",
  "description": "Custom domain for my project type",
  "compatibility": {
    "minVersion": "5.8.0"
  },
  "agents": {},
  "tags": ["custom"]
}
EOF
```

### Step 3: Add Agent Overrides (Optional)

```bash
# Create custom builder
cat > domains/my-domain/agents/builder.md << 'EOF'
# @builder - My Domain Extension

## Additional Requirements
- Custom requirement 1
- Custom requirement 2
EOF
```

### Step 4: Add Validation Rules (Optional)

```bash
cat > domains/my-domain/validation-rules.json << 'EOF'
{
  "builder": {
    "requiredSections": ["Custom Section"],
    "overrides": false
  }
}
EOF
```

### Step 5: Validate

```bash
node scripts/domain-pack-loader.js validate ./domains/my-domain
```

---

## Best Practices

### DO

- Keep domain packs focused on a single project type
- Document all customizations clearly
- Test domain packs with core CC_GodMode updates
- Use `overrides: false` unless absolutely necessary
- Include version compatibility information

### DON'T

- Create domain packs that break core workflows
- Override core agents without good reason
- Forget to update domain pack version when changing
- Create circular dependencies between domain packs
- Store secrets in domain pack files

---

## Built-in Domain Packs

CC_GodMode ships with reference domain packs:

| Name | Description | Agents Modified |
|------|-------------|-----------------|
| `react-native` | Mobile app development | builder, tester |
| `backend` | Backend/API development | architect, api-guardian |
| `docs` | Documentation projects | scribe |

These are located in the global domains directory and serve as templates for custom domain packs.

---

## Troubleshooting

### Domain Pack Not Detected

```bash
# Check discovery
node scripts/domain-pack-loader.js discover

# Verify config file exists and is valid JSON
cat domains/my-domain/domain-config.json | jq .
```

### Agent Not Resolving from Domain

```bash
# Check resolution chain
node scripts/domain-pack-loader.js resolve builder my-domain
```

### Validation Rules Not Applying

```bash
# Verify rules file
cat domains/my-domain/validation-rules.json | jq .

# Test with domain flag
node scripts/validate-agent-output.js report.md builder --domain=my-domain
```

---

## Version History

- **v5.8.0** - Initial domain pack specification

---

**See Also:**
- `config/domain-config.schema.json` - JSON Schema for validation
- `scripts/domain-pack-loader.js` - Domain pack loader implementation
- `scripts/validate-agent-output.js` - Domain-aware validation
