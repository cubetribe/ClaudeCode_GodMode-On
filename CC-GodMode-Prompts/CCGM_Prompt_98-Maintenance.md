> **Version:** 5.11.0 **Type:** MAINTENANCE **Prerequisite:** SystemInstall and
> ProjectActivation completed **Frequency:** Periodically (when checking for
> updates)

# CC_GodMode Update Check

Use this prompt to check if your CC_GodMode installation is up to date.

---

## Quick Update Check

Copy and paste this into Claude:

```
Please check if my CC_GodMode installation needs an update:

1. Run: node ~/.claude/scripts/auto-update.js --check
2. Tell me the result (up to date, update available, or dev version)
3. If an update is available, show me what's new
4. Ask if I want to proceed with the update
```

---

## Full Update Workflow

For a complete update with preview, use this prompt:

````
I want to update my CC_GodMode installation. Please help me:

## Step 1: Check Current State
Run: node ~/.claude/scripts/auto-update.js --check

## Step 2: Preview Changes (if update available)
Run: node ~/.claude/scripts/auto-update.js --dry-run

Show me:
- Which files will be added
- Which files will be updated
- Which files will be deleted
- Which files are protected (skipped)

## Step 3: Confirm Update
Ask me: "Do you want to proceed with the update? (yes/no)"

## Step 4: Apply Update (only if I say yes)
Run: node ~/.claude/scripts/auto-update.js --update

## Step 5: Verify & Update Project
- Show the update results
- Confirm the new version is installed
- **IMPORTANT:** Remind me to update my current project files if needed:
  ```bash
  # Update local project prompts
  cp ~/.claude/CC-GodMode-Prompts/*.md ./CC-GodMode-Prompts/
  ```
```

---

## Rollback (if something goes wrong)

```
I need to rollback my CC_GodMode installation:

1. Run: node ~/.claude/scripts/auto-update.js --rollback
2. Confirm which version was restored
3. Verify the installation works
```
---

## CLI Reference

| Command | Description |
|---------|-------------|
| `node ~/.claude/scripts/auto-update.js --check` | Check if updates are available |
| `node ~/.claude/scripts/auto-update.js --dry-run` | Preview changes without applying |
| `node ~/.claude/scripts/auto-update.js --update` | Download and apply updates |
| `node ~/.claude/scripts/auto-update.js --rollback` | Restore from latest backup |

---

## What Gets Updated

The auto-update system updates these paths:
- `agents/` - Agent definition files
- `scripts/` - Automation scripts
- `CC-GodMode-Prompts/` - Prompt files (01-SystemInstall, 02-ProjectActivation, 98-Maintenance, 99-ContextRestore)
- `config/` - Configuration files
- `templates/` - Template files
- `CLAUDE.md` - Main orchestrator instructions
- `VERSION` - Version number
- `CHANGELOG.md` - Change history
- `README.md` - Documentation
- `CC-GodMode-Prompts/CCGM_Prompt_98-Maintenance.md` - Update check documentation

**Note:** If you copied prompts to your project root for easier access, you may want to re-copy them after an update:

```bash
# macOS/Linux
cp ~/.claude/CC-GodMode-Prompts/*.md ./

# Windows PowerShell
Copy-Item "$env:USERPROFILE\.claude\CC-GodMode-Prompts\*.md" .\ -Force
````

## What NEVER Gets Updated

These files are protected and will never be modified:

- `settings.json` - Your personal settings
- `mcp.json` / `mcp_config.json` - MCP server configuration
- `.env` / `.env.local` - Environment variables
- `credentials.json` - Any stored credentials

---

## Safety Features

1. **Automatic Backup**: Before any update, a full backup is created
2. **Dry Run Mode**: Preview all changes before applying
3. **Rollback Support**: Easily restore previous versions
4. **Protected Files**: Personal config files are never touched
5. **Lock Protection**: Prevents simultaneous updates

Backups are stored in: `~/.claude/backups/`

---

## Troubleshooting

### "Another update is in progress"

```bash
rm ~/.claude/.update-lock
```

### "Could not check for updates"

- Check your internet connection
- Verify GitHub is accessible
- The repository might be private

### Update partially failed

```
Run: node ~/.claude/scripts/auto-update.js --rollback
```

---

## Manual Update Alternative

If the auto-update doesn't work, you can always update manually:

```bash
cd ~/.claude
git pull origin main
```

Note: Manual git pull may overwrite local changes. The auto-update system is
safer as it creates backups and protects config files.
