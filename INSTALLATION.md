# Installation Guide 🛠️

> *Choose your adventure*

---

## Prerequisites

### Required
- **Claude Code CLI** (v2.0+) - [Install Guide](https://code.claude.com/docs/en/getting-started)
- **Node.js** (v18+) - For hooks and MCP servers
- **Git** - For version control

### Recommended
- **Docker** - For consistent MCP server execution
- **GitHub CLI** (`gh`) - For @github-manager fallback

---

## 🚀 Option A: YOLO Mode (Recommended for the Brave)

**Prerequisites:**
- Claude Code CLI installed
- Nerves of steel
- Basic trust in AI

### Step 1: Clone the repo

```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
```

### Step 2: Start Claude in God Mode

```bash
claude --dangerously-skip-permissions
```

### Step 3: Enter the magic prompt

```
Execute the complete CC_GodMode installation.
You have full access to my system.

Install:
1. All 7 agents to ~/.claude/agents/
2. The hook script to ~/.claude/scripts/
3. Extend ~/.claude/settings.json with the hooks
4. Install all required MCP servers
5. Create the templates

Read INSTALLATION.md and execute all steps automatically.
Confirm at the end what you did.
YOLO.
```

### Step 4: Sit back and relax

Claude does the rest. You'll get a summary at the end.

---

## 🛡️ Option B: Safe Mode (For the Cautious)

**Prerequisites:**
- Claude Code CLI installed
- Patience
- Reading ability

### Step 1: Clone the repo

```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
```

### Step 2: Start Claude normally

```bash
claude
```

### Step 3: Enter the cautious prompt

```
I want to install CC_GodMode step by step.
Read INSTALLATION.md and guide me through each step.
Ask for permission before EVERY file change.
Explain what you're doing.
```

### Step 4: Confirm each step

Claude will show you each command and ask for permission.

---

## 📝 Option C: Manual Installation (For Control Freaks)

### Step 1: Create directories

```bash
mkdir -p ~/.claude/agents
mkdir -p ~/.claude/scripts
```

### Step 2: Copy all 7 agents

```bash
cp agents/architect.md ~/.claude/agents/
cp agents/api-guardian.md ~/.claude/agents/
cp agents/builder.md ~/.claude/agents/
cp agents/validator.md ~/.claude/agents/
cp agents/tester.md ~/.claude/agents/
cp agents/scribe.md ~/.claude/agents/
cp agents/github-manager.md ~/.claude/agents/
```

### Step 3: Install hook script

```bash
cp scripts/check-api-impact.js ~/.claude/scripts/
chmod +x ~/.claude/scripts/check-api-impact.js
```

### Step 4: Extend settings.json

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "node ~/.claude/scripts/check-api-impact.js \"$CLAUDE_FILE_PATH\""
          }
        ]
      }
    ]
  }
}
```

### Step 5: Install MCP Servers

See [MCP Server Installation](#-mcp-server-installation) below.

---

## 🔌 MCP Server Installation

CC_GodMode uses MCP (Model Context Protocol) servers for enhanced capabilities.

### Required MCP Servers

| MCP Server | Agent | Purpose |
|------------|-------|---------|
| **Playwright** | @tester | Browser automation, E2E testing |
| **GitHub** | @github-manager | Issues, PRs, Releases |

### Recommended MCP Servers

| MCP Server | Agent | Purpose |
|------------|-------|---------|
| **Lighthouse** | @tester | Performance & accessibility audits |
| **A11y** | @tester | WCAG compliance testing |

---

### Playwright MCP (Required for @tester)

**Official Microsoft Playwright MCP Server**

- **NPM:** [@playwright/mcp](https://www.npmjs.com/package/@playwright/mcp)
- **GitHub:** [microsoft/playwright-mcp](https://github.com/microsoft/playwright-mcp)

```bash
# Install via Claude CLI (recommended)
claude mcp add playwright -- npx @playwright/mcp@latest

# Install browsers if needed
npx playwright install chromium
```

**Verify installation:**
```bash
claude mcp list | grep playwright
```

---

### GitHub MCP (Required for @github-manager)

**Official GitHub MCP Server**

- **GitHub:** [github/github-mcp-server](https://github.com/github/github-mcp-server)
- **Docker:** `ghcr.io/github/github-mcp-server`

> **Note:** The npm package `@modelcontextprotocol/server-github` is DEPRECATED. Use Docker instead.

```bash
# Set your GitHub token
export GITHUB_TOKEN="your_personal_access_token"

# Install via Claude CLI (Docker - recommended)
claude mcp add github \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
  ghcr.io/github/github-mcp-server
```

**Create GitHub Token:**
1. Go to https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:org`, `workflow`
4. Copy token and set as `GITHUB_TOKEN`

**Fallback:** If Docker is not available, install GitHub CLI (`gh`):
```bash
# macOS
brew install gh

# Then authenticate
gh auth login
```

---

### Lighthouse MCP (Recommended for @tester)

**Performance & Accessibility Audits**

- **NPM:** [lighthouse-mcp](https://www.npmjs.com/package/lighthouse-mcp) (10K+ downloads)
- **NPM Alternative:** [@danielsogl/lighthouse-mcp](https://www.npmjs.com/package/@danielsogl/lighthouse-mcp) (more features)
- **GitHub:** [danielsogl/lighthouse-mcp-server](https://github.com/danielsogl/lighthouse-mcp-server)

```bash
# Install via Claude CLI
claude mcp add lighthouse -- npx lighthouse-mcp

# Or with more features (13+ audit tools)
claude mcp add lighthouse -- npx @danielsogl/lighthouse-mcp
```

**Features:**
- Core Web Vitals (LCP, INP, CLS)
- WCAG accessibility compliance
- SEO analysis
- Security assessment

---

### A11y MCP (Recommended for @tester)

**Axe-core Accessibility Testing**

- **NPM:** [a11y-mcp](https://www.npmjs.com/package/a11y-mcp) (5.9K downloads)
- **GitHub:** [priyankark/a11y-mcp](https://github.com/priyankark/a11y-mcp)

```bash
# Install via Claude CLI
claude mcp add a11y -- npx a11y-mcp
```

**Alternative (by ronantakizawa):**
- **NPM:** [a11y-mcp-server](https://www.npmjs.com/package/a11y-mcp-server)
- **GitHub:** [ronantakizawa/a11ymcp](https://github.com/ronantakizawa/a11ymcp)

```bash
claude mcp add a11y -- npx a11y-mcp-server
```

**Features:**
- WCAG 2.1 compliance testing
- Axe-core engine (industry standard)
- Works with localhost (for development)

---

### All-in-One MCP Installation Script

Create `scripts/install-mcps.sh` (included in this repo):

```bash
#!/bin/bash

echo "🔌 Installing CC_GodMode MCP Servers..."
echo ""

# Check prerequisites
command -v node >/dev/null 2>&1 || { echo "❌ Node.js is required. Install from https://nodejs.org"; exit 1; }
command -v claude >/dev/null 2>&1 || { echo "❌ Claude Code CLI is required. Install from https://code.claude.com"; exit 1; }

# 1. Playwright MCP (Required)
echo "📦 [1/4] Installing Playwright MCP..."
claude mcp add playwright -- npx @playwright/mcp@latest
npx playwright install chromium
echo "✅ Playwright MCP installed"
echo ""

# 2. GitHub MCP (Required - needs Docker or gh CLI fallback)
echo "📦 [2/4] Installing GitHub MCP..."
if [ -z "$GITHUB_TOKEN" ]; then
  echo "⚠️  GITHUB_TOKEN not set."
  echo "   Option A: Set token and re-run: export GITHUB_TOKEN='your_token'"
  echo "   Option B: Use gh CLI fallback: brew install gh && gh auth login"
else
  if command -v docker &> /dev/null; then
    claude mcp add github \
      -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
      -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
      ghcr.io/github/github-mcp-server
    echo "✅ GitHub MCP installed (Docker)"
  else
    echo "⚠️  Docker not found. @github-manager will use gh CLI fallback."
    echo "   Install Docker or gh CLI: brew install gh && gh auth login"
  fi
fi
echo ""

# 3. Lighthouse MCP (Recommended)
echo "📦 [3/4] Installing Lighthouse MCP..."
claude mcp add lighthouse -- npx lighthouse-mcp
echo "✅ Lighthouse MCP installed"
echo ""

# 4. A11y MCP (Recommended)
echo "📦 [4/4] Installing A11y MCP..."
claude mcp add a11y -- npx a11y-mcp
echo "✅ A11y MCP installed"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ MCP installation complete!"
echo ""
echo "Verify with: claude mcp list"
echo ""
echo "Expected output:"
echo "  - playwright"
echo "  - github (if Docker + token were available)"
echo "  - lighthouse"
echo "  - a11y"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

Run:
```bash
chmod +x scripts/install-mcps.sh
./scripts/install-mcps.sh
```

---

## 📁 What gets installed where?

### Agents

| File | Destination | Purpose |
|------|-------------|---------|
| `agents/architect.md` | `~/.claude/agents/` | High-level design |
| `agents/api-guardian.md` | `~/.claude/agents/` | API lifecycle |
| `agents/builder.md` | `~/.claude/agents/` | Implementation |
| `agents/validator.md` | `~/.claude/agents/` | Code quality |
| `agents/tester.md` | `~/.claude/agents/` | UX testing |
| `agents/scribe.md` | `~/.claude/agents/` | Documentation |
| `agents/github-manager.md` | `~/.claude/agents/` | GitHub operations |

### Scripts & Config

| File | Destination | Purpose |
|------|-------------|---------|
| `scripts/check-api-impact.js` | `~/.claude/scripts/` | Auto-hook for API changes |
| Hook Config | `~/.claude/settings.json` | Activates the hook |

### MCP Servers

| MCP | Config Location | Purpose |
|-----|-----------------|---------|
| Playwright | `~/.claude/mcp.json` | Browser automation |
| GitHub | `~/.claude/mcp.json` | Repository management |
| Lighthouse | `~/.claude/mcp.json` | Performance audits |
| A11y | `~/.claude/mcp.json` | Accessibility testing |

---

## 🧪 Verify Installation

### Check Agents

```bash
ls -la ~/.claude/agents/

# Should show 7 files:
# architect.md
# api-guardian.md
# builder.md
# validator.md
# tester.md
# scribe.md
# github-manager.md
```

### Check Hook

```bash
ls -la ~/.claude/scripts/

# Should show:
# check-api-impact.js

# Check it's executable
file ~/.claude/scripts/check-api-impact.js
```

### Check Settings

```bash
cat ~/.claude/settings.json | grep -A 10 "hooks"

# Should contain hooks.PostToolUse
```

### Check MCP Servers

```bash
claude mcp list

# Should show:
# playwright
# github (if token was set)
# lighthouse (if installed)
# a11y (if installed)
```

### Test MCP Connection

```bash
# Start Claude and test Playwright
claude
> Use Playwright to navigate to https://example.com and take a screenshot
```

---

## 🆘 Troubleshooting

### "Agents are not recognized"

Check if the files are in the correct directory:
```bash
ls ~/.claude/agents/
```

### "Hook is not running"

Check `~/.claude/settings.json`:
```bash
cat ~/.claude/settings.json | grep -A 10 "hooks"
```

### "Permission denied for hook script"

```bash
chmod +x ~/.claude/scripts/check-api-impact.js
```

### "Node not found"

The hook needs Node.js. Install it:
```bash
# macOS
brew install node

# or via nvm
nvm install --lts
```

### "MCP server not found"

```bash
# Re-install the MCP
claude mcp remove playwright
claude mcp add playwright -- npx @playwright/mcp@latest

# Check MCP logs
claude mcp logs playwright
```

### "GitHub MCP authentication failed"

```bash
# Verify token
echo $GITHUB_TOKEN

# Re-add with fresh token
claude mcp remove github
export GITHUB_TOKEN="new_token_here"
claude mcp add github \
  -e GITHUB_PERSONAL_ACCESS_TOKEN=$GITHUB_TOKEN \
  -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
  ghcr.io/github/github-mcp-server
```

### "Playwright browser not installed"

```bash
# Install browsers
npx playwright install

# Or specific browser
npx playwright install chromium
```

---

## 🎯 After Installation

### Test the Agents

Start Claude Code in a project and try:

```
@architect Analyze the structure of this project
```

```
@tester Take a screenshot of the homepage at localhost:3000
```

### Test the Hook

Edit a file in `src/api/` or `shared/types/`:

```
Create a file src/api/test.ts with the content "export {}"
```

You should see a warning about API changes.

### Start Orchestrator Mode

Copy the prompt from [ORCHESTRATOR-PROMPT-V3.2.md](./ORCHESTRATOR-PROMPT-V3.2.md)

---

## 🔄 Updates

To update CC_GodMode:

```bash
cd ClaudeCode_GodMode-On
git pull

# Update agents
cp agents/*.md ~/.claude/agents/

# Update hook
cp scripts/check-api-impact.js ~/.claude/scripts/

# Update MCPs (if new versions)
claude mcp remove playwright && claude mcp add playwright -- npx @playwright/mcp@latest
```

---

## 🗑️ Uninstallation

If you've had enough:

```bash
# Remove agents
rm ~/.claude/agents/architect.md
rm ~/.claude/agents/api-guardian.md
rm ~/.claude/agents/builder.md
rm ~/.claude/agents/validator.md
rm ~/.claude/agents/tester.md
rm ~/.claude/agents/scribe.md
rm ~/.claude/agents/github-manager.md

# Remove hook
rm ~/.claude/scripts/check-api-impact.js

# Remove MCP servers
claude mcp remove playwright
claude mcp remove github
claude mcp remove lighthouse
claude mcp remove a11y

# Manually remove hook config from settings.json
```

---

## 🎉 Done!

You are now in **God Mode**.

**7 Agents ready:**
- @architect, @api-guardian, @builder, @validator, @tester, @scribe, @github-manager

**MCP Servers connected:**
- Playwright (Browser), GitHub (Repo), Lighthouse (Performance), A11y (Accessibility)

Next step: Read [ORCHESTRATOR-PROMPT-V3.2.md](./ORCHESTRATOR-PROMPT-V3.2.md) for the prompts you need.

---

<div align="center">

*"With great power comes great joy in delegating."*

</div>
