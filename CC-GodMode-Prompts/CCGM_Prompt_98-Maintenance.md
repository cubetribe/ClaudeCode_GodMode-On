> **Version:** 9.0.0 **Type:** MAINTENANCE **Prerequisite:** SystemInstall and
> ProjectActivation completed **Frequency:** Periodically (when checking for
> updates)

# CC_GodMode Update Check

This prompt walks you through updating your CC_GodMode installation with the one
command the repo actually runs, and through verifying the result with a real check
instead of a claim.

---

## Quick Update

Copy and paste this into Claude:

```
Please update my CC_GodMode installation:

1. Show me the currently installed version: cat ~/.claude/.cc-godmode-version
2. Show me the repo's version: cd <path-to-your-clone> && cat VERSION
3. If they differ, run: git pull && ./scripts/apply-global-claude-setup.sh
4. Run: node scripts/verify-install.js
5. Tell me the exit code and, if it is non-zero, the exact list of missing items
```

There is one installer and it is the update mechanism too — a normal run of
`apply-global-claude-setup.sh` is idempotent, so running it again is always safe,
whether or not a new version is actually available.

---

## Step 1: Check current state

Compare what is installed against what the repo has:

```bash
cat ~/.claude/.cc-godmode-version   # installed version
cat VERSION                          # repo version (run from your clone)
```

If both show the same version, the installation is already current — no further
steps are required.

---

## Step 2: Update

From inside your clone of the repository:

```bash
git pull && ./scripts/apply-global-claude-setup.sh
```

This single command is both the install and the update path. It is idempotent
(re-running it never creates duplicate hook entries), it backs up
`~/.claude/settings.json` before touching it, and it merges only the
GodMode `hooks` block into your settings — every other key you have there
(`model`, `effortLevel`, `permissions`, your own hooks) is left untouched.

If you manage your own hook wiring and do not want the installer to touch
`settings.json`, add `--no-hooks`:

```bash
git pull && ./scripts/apply-global-claude-setup.sh --no-hooks
```

---

## Step 3: Verify

```bash
node scripts/verify-install.js
```

- **Exit code 0** — the installation is complete: all agents, all skills, the
  hook wiring, the orchestrator template, LICENSE/NOTICE, and the installed
  version all check out against this repo.
- **Exit code non-zero** — the script prints the concrete list of what is
  missing or mismatched (e.g. a missing agent file, a hook pointing at a file
  that no longer exists, a stale installed version). Fix the listed items —
  usually by re-running Step 2 — and check again.

You can also run the same check via the repo's script alias:

```bash
npm run install:verify
```

---

## Step 4: Major upgrades — check for breaking changes

Before updating across a major version bump (e.g. `7.x` → `8.x`), read the
`[Unreleased]` and newest dated section of `CHANGELOG.md` in the repo for
anything listed as a breaking change. Minor and patch upgrades are expected to
be additive and backward compatible; major upgrades are the one case where you
should read the changelog before running Step 2, not after.

---

## Troubleshooting

### `verify-install.js` reports missing hooks

Re-run the installer without `--no-hooks`:

```bash
./scripts/apply-global-claude-setup.sh
```

### `verify-install.js` reports a version mismatch only

The runtime files are current but `~/.claude/.cc-godmode-version` was not
updated — re-run Step 2; the installer writes this file on every successful
run.

### I don't have a local clone

Follow the clone step from the install path first:

```bash
git clone https://github.com/cubetribe/ClaudeCode_GodMode-On.git
cd ClaudeCode_GodMode-On
./scripts/apply-global-claude-setup.sh
```

---

*CC_GodMode — © 2025–2026 Dennis Westermann ([dennis-westermann.de](https://www.dennis-westermann.de)). Proprietary — not open source. Free for private, non-commercial use; redistribution or re-hosting outside GitHub is prohibited; attribution required. Official source: [github.com/cubetribe/ClaudeCode_GodMode-On](https://github.com/cubetribe/ClaudeCode_GodMode-On). See LICENSE.*
