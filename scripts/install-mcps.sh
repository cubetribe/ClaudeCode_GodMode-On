#!/bin/bash
#
# CC_GodMode - Copyright (c) 2025-2026 Dennis Westermann (www.dennis-westermann.de)
# Proprietary - not open source. See LICENSE. Redistribution/re-hosting prohibited.
#
# CC_GodMode MCP Server Installation Script
# https://github.com/cubetribe/CC_GodMode
#
# This script installs all required and recommended MCP servers for CC_GodMode
#

set -e

echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  🔌 CC_GodMode MCP Server Installation                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Install from https://nodejs.org"
    exit 1
fi
echo "  ✅ Node.js $(node --version)"

if ! command -v claude &> /dev/null; then
    echo "❌ Claude Code CLI is required. Install from https://code.claude.com"
    exit 1
fi
echo "  ✅ Claude Code CLI found"

echo ""

# 1. Playwright MCP (Required)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 [1/4] Installing Playwright MCP (Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Source: https://github.com/microsoft/playwright-mcp"
echo "NPM: @playwright/mcp"
echo ""

claude mcp add playwright -- npx @playwright/mcp@latest || {
    echo "⚠️  Failed to add Playwright MCP. Trying alternative..."
    claude mcp add playwright -- npx playwright-mcp
}

echo ""
echo "🌐 Installing Chromium browser..."
npx playwright install chromium || echo "⚠️  Browser installation skipped"

echo ""
echo "✅ Playwright MCP installed"
echo ""

# 2. GitHub MCP (Required - needs Docker or gh CLI fallback)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 [2/4] Installing GitHub MCP (Required)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Source: https://github.com/github/github-mcp-server"
echo "Docker: ghcr.io/github/github-mcp-server"
echo ""

if [ -z "$GITHUB_TOKEN" ]; then
    echo "⚠️  GITHUB_TOKEN environment variable not set."
    echo ""
    echo "   To use GitHub MCP Server:"
    echo "   1. Create a token at: https://github.com/settings/tokens"
    echo "   2. Select scopes: repo, read:org, workflow"
    echo "   3. Run: export GITHUB_TOKEN='your_token'"
    echo "   4. Re-run this script"
    echo ""
    echo "   Fallback: @github-manager will use 'gh' CLI instead."

    if command -v gh &> /dev/null; then
        echo "   ✅ gh CLI is available as fallback"
    else
        echo "   ⚠️  gh CLI not found. Install with: brew install gh"
    fi
else
    if command -v docker &> /dev/null; then
        echo "🐳 Docker found. Installing via Docker (recommended)..."
        claude mcp add github \
            -e GITHUB_PERSONAL_ACCESS_TOKEN="$GITHUB_TOKEN" \
            -- docker run -i --rm -e GITHUB_PERSONAL_ACCESS_TOKEN \
            ghcr.io/github/github-mcp-server && echo "✅ GitHub MCP installed (Docker)" || {
                echo "⚠️  Docker installation failed."
            }
    else
        echo "⚠️  Docker not found. @github-manager will use gh CLI fallback."
        if ! command -v gh &> /dev/null; then
            echo "   Install gh CLI: brew install gh && gh auth login"
        fi
    fi
fi
echo ""

# 3. Lighthouse MCP (Recommended)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 [3/4] Installing Lighthouse MCP (Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Source: https://github.com/priyankark/lighthouse-mcp"
echo "NPM: lighthouse-mcp"
echo ""

claude mcp add lighthouse -- npx lighthouse-mcp && echo "✅ Lighthouse MCP installed" || {
    echo "⚠️  Lighthouse MCP installation failed. Trying alternative..."
    claude mcp add lighthouse -- npx @danielsogl/lighthouse-mcp
}
echo ""

# 4. A11y MCP (Recommended)
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 [4/4] Installing A11y MCP (Recommended)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Source: https://github.com/priyankark/a11y-mcp"
echo "NPM: a11y-mcp"
echo ""

claude mcp add a11y -- npx a11y-mcp && echo "✅ A11y MCP installed" || {
    echo "⚠️  A11y MCP installation failed. Trying alternative..."
    claude mcp add a11y -- npx a11y-mcp-server
}
echo ""

# Summary
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ✅ MCP Installation Complete!                              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "Installed MCP Servers:"
echo ""
claude mcp list 2>/dev/null || echo "(Run 'claude mcp list' to verify)"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "MCP Server Sources:"
echo "  • Playwright: https://github.com/microsoft/playwright-mcp"
echo "  • GitHub:     https://github.com/github/github-mcp-server"
echo "  • Lighthouse: https://github.com/priyankark/lighthouse-mcp"
echo "  • A11y:       https://github.com/priyankark/a11y-mcp"
echo ""
echo "Next steps:"
echo "  1. Copy agents: cp agents/*.md ~/.claude/agents/"
echo "  2. Read ORCHESTRATOR-PROMPT-V3.md"
echo "  3. Start coding with 'claude'"
echo ""
