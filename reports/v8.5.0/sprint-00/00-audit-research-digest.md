---
agent: audit-workflow (9 readers / 5 validators / 10 researchers, run wf_3885357b-ee3)
date: 2026-07-06
task: Full repository audit, problem validation, best-practice research for the v8.5.0 overhaul
status: complete
---


## Multi-Agent Orchestration Patterns: Orchestrator-Worker Architecture, Verdict Contracts, Fan-Out/Fan-In, and Parallelization Rules
### key_practices
- Define a stable verdict contract with explicit STATUS (e.g., APPROVED/BLOCKED/DONE) and immutable findings list so orchestrators can parse agent results deterministically without fragile text parsing.
- Decompose tasks into independent subtasks only when there are minimal data dependencies between them; keep tightly coupled operations (e.g., schema edits + test updates) under single-agent control to avoid coordination overhead.
- Use fan-out/fan-in sparingly and only when subtasks have no shared mutable state; distribute immutable input snapshots to parallel agents and merge results via structured aggregation (voting, selection, synthesis), never via direct concurrent writes.
- Use semantic versioning (semver.org) for result schemas and data contracts: additive, backward-compatible changes are minor; breaking structural changes require major versions with dual-version support during transitions.
- Cascade verdict contracts through the agent chain by embedding STATUS + findings into orchestrator context, enabling handoff validation before spawning dependent agents (e.g., don't call @builder until @architect returns STATUS: APPROVED).
- Avoid parallelizing tasks with high communication overhead or sequential discovery dependencies; if discovery is noisy or failure recovery is incremental, keep agents sequential (ReAct over fan-out) to reduce compound errors.
- Spawn agents only when isolated context windows and parallel processing genuinely outweigh setup overhead; for simple deterministic work, inline execution is cheaper than subagent delegation.
- Freeze write scopes between parallel agents: assign each agent exclusive files or modules; if agents must modify the same file, either serialize them or use conflict-free data structures (immutable state trees, append-only logs).
### anti_patterns
- Treating agents as autonomous: agents should return structured verdicts (not narrative text), not make unilateral go/no-go decisions; the orchestrator must validate and gate downstream work.
- Parallelizing without dependency analysis: launching agents without understanding task coupling leads to race conditions, duplicated effort, and corrupted shared state.
- Mutable state sharing across parallel agents: concurrent writes to the same config, schema, or state object create non-deterministic failures that are hard to debug; use immutable snapshots instead.
- Vague agent instructions and unbounded output: agents need clear task boundaries, exact output format, tool guidance, and success criteria; fuzzy handoffs cause duplicated work and missing coverage.
- Sequencing agents by inspection (e.g., reading full report before deciding next step) instead of by contract: verbose reports in context bloat; use compact verdict formats (STATUS + 1-3 bullets) for orchestrator logic.
- Ignoring schema versioning in agent outputs: breaking changes to result format cause silent downstream failures; version all result contracts and enforce validation at handoff boundaries.
- Parallelizing discovery-heavy or state-dependent work: noisy/uncertain tasks benefit from sequential incremental correction (ReAct) not fan-out; parallel discovery compounds errors.
- Skipping error handling in fan-in: collecting agent results without validating schema, checking for timeouts, or handling partial failures leads to silent data corruption in the final verdict.
### applicability
CC_GodMode is a prompt-based multi-agent coordination framework where 15 agents run as parallel subagents in one Claude Code session (optionally in worktrees). The orchestrator (@orchestrator itself, or the user via CLAUDE.md) dispatches agents and chains their outputs via verdict contracts (STATUS + findings). Applying these patterns concretely: (1) formalize verdict contracts (STATUS: APPROVED/BLOCKED/DONE + max 3 bullets) to avoid parsing narrative reports; (2) use smart routing (cost-efficiency skill) to avoid unnecessary parallelization—many tasks (bug fixes, small docs) don't benefit from fan-out; (3) freeze write scopes between parallel agents (e.g., @validator writes validator reports, @tester writes tester reports, never both touch the same code file); (4) version agent output schemas (e.g., report frontmatter) using semver so agents can handle schema evolution; (5) keep discovery-heavy work (like this research task) sequential, and parallelization for independent work (e.g., @validator ∥ @tester both checking a fixed codebase). For the planned sprint orchestration upgrade, these patterns ensure agents compose reliably across sessions without race conditions or silent failures.
### sources
- How we built our multi-agent research system https://www.anthropic.com/engineering/multi-agent-research-system
- Building agents with the Claude Agent SDK https://claude.com/blog/building-agents-with-the-claude-agent-sdk
- Data Contracts for Agents: Keep Tools and Schemas Stable as Systems Evolve https://medium.com/@deolesopan/data-contracts-for-agents-keep-tools-and-schemas-stable-as-systems-evolve-8af6f3e024ba
- When Parallelism Pays Off: Cohesion-Aware Task Partitioning for Multi-Agent Coding https://arxiv.org/pdf/2606.00953
- The Hidden Contract: Why Your Multi-Agent Systems Silently Corrupt Each Other (And How to Fix It) https://medium.com/@nraman.n6/the-hidden-contract-why-your-multi-agent-systems-silently-corrupt-each-other-and-how-to-fix-it-983d25d178a8

## Preventing Parallel Coding Agent Conflicts: File Ownership, Write Scope Isolation, and Task Claiming Patterns
### key_practices
- Map file ownership upfront: create an explicit ownership matrix documenting which files each agent owns; never parallelize agents that share file boundaries.
- Implement single-writer rule: enforce that only one agent can modify a given file at any moment; read-only access by other agents is safe.
- Use git worktrees for isolation: spawn each parallel agent in its own worktree (separate working directory linked to the same repository) to eliminate merge conflicts during parallel work.
- Implement task-claiming via shared state: each agent reads a shared task list, claims available work by marking it 'in-progress' with its identifier, preventing duplicate or conflicting work assignment.
- Freeze write scopes per phase: designate which directories are writable vs. read-only per workflow phase; communicate these boundaries in a shared AGENTS.md or architecture document.
- Define dependency chains: mark tasks with explicit prerequisites so dependent work cannot start until blockers complete, preventing premature or conflicting modifications.
- Use read-write lock pattern: allow multiple concurrent readers of a file, but serialize all writers; implement this via orchestrator rules, not runtime locks.
- Decompose tasks to have non-overlapping file boundaries: design task decomposition such that no two parallel agents touch the same file; this eliminates the need for locks entirely.
### anti_patterns
- Allowing two agents to write to the same file concurrently without task claiming or file locks—will cause silent merge conflicts or data loss.
- Using only sequential execution to avoid conflicts: defeats the parallelism benefit; instead, invest upfront in task decomposition and ownership mapping.
- Implementing ad-hoc file locks without shared state visibility: agents may deadlock or abandon locks if not coordinated through a central task list.
- Mixing write-scope freezes with late discovery of overlapping files: file conflicts discovered after agents start are expensive; discover and prevent them during planning.
- Assigning overlapping write scopes but expecting runtime merging to resolve: increases latency and token cost; prefer preventing overlap via upfront design.
- Failing to document shared context (conventions, style, architectural decisions) in a read-only shared document like AGENTS.md: agents diverge on assumptions, causing integration failures.
- Using general-purpose locks for all coordination: overly complex; simpler patterns (directory ownership, worktree isolation, task claiming) are more reliable and cheaper.
### applicability
CC_GodMode orchestrates 15 agent prompts as parallel subagents within a single Claude Code session, optionally using git worktrees. The framework coordinates agents across shared files (CLAUDE.md, 15 agent prompts, 13 skill files, VERSION, CHANGELOG.md). To prevent parallel agents from overwriting each other, CC_GodMode should adopt four concrete patterns: (1) **File ownership matrix** in AGENTS.md documenting which agent owns which prompt/skill files and which files are read-only during each workflow phase; (2) **Single-writer rule enforcement** where only one agent writes to VERSION/CHANGELOG.md at a time, typically @scribe at release gates; (3) **Git worktree isolation** per parallel agent batch to prevent merge conflicts; and (4) **Task-claiming via orchestrator state** where the Orchestrator maintains a shared task list and agents mark tasks 'in-progress' before claiming work. Since CC_GodMode is solo-maintained with no CI yet, upfront task decomposition (non-overlapping agent scopes) is more cost-effective than runtime locks. The release-plan sprint model should freeze write scopes explicitly: agents read all files, but write only to designated areas (e.g., @builder writes agent prompts, @scribe writes VERSION/CHANGELOG/README). Document this in AGENTS.md under write-scope rules.
### sources
- How Claude Code Parallel Agents Coordinate Through an Orchestrator https://www.mindstudio.ai/blog/claude-code-agent-teams-parallel-agents
- Parallel Agentic Development With Git Worktrees: A Practical Playbook https://www.mindstudio.ai/blog/parallel-agentic-development-git-worktrees
- The Code Agent Orchestra - what makes multi-agent coding work (Addy Osmani) https://addyosmani.com/blog/code-agent-orchestra/
- Claude Code: Orchestrate subagents at scale with dynamic workflows https://code.claude.com/docs/en/workflows
- Parallel Agents Are Just Multithreading: A New Architecture for Peer Agent Coordination https://medium.com/@yashash.gc/parallel-agents-are-just-multithreading-a-new-architecture-for-peer-agent-coordination-079c5340f759

## Git Worktree and Branching Strategies for Parallel AI Agent Work
### key_practices
- Create one worktree per parallel agent, branching from origin/HEAD (or local HEAD if `worktree.baseRef: "head"`) to isolate file edits and prevent concurrent overwrites.
- Add `.claude/worktrees/` to `.gitignore` so worktree directories don't appear as untracked files in the main checkout.
- Use `.worktreeinclude` (with `.gitignore` syntax) to automatically copy gitignored files (e.g., `.env`, config) into each new worktree, avoiding manual per-worktree setup.
- Set per-worktree branch names using a consistent prefix pattern (e.g., `feat-auth`, `fix-db-perf`, `refactor-types`) so task ownership is visible in `git worktree list` and branch listings.
- For solo maintainer releases, use Conventional Commits (type(scope): description) mapped to semantic version bumps via automated tooling (semantic-release or release-please), avoiding manual VERSION edits.
- Limit agent parallelism to genuinely independent work boundaries (by feature, domain, or file ownership); sequence agents that would edit the same file on different branches to prevent merge conflicts.
- Merge worktree branches daily or as soon as the agent commits, before divergence accumulates—unmerged worktrees older than ~7 days cause painful conflicts on rebase.
- Use `git worktree remove` (not `rm -rf`) when cleaning up, followed by `git worktree prune` to remove stale administrative metadata and prevent disk bloat.
- For Claude Code agent orchestration, specify `isolation: worktree` in custom subagent frontmatter; worktrees are automatically created per subagent and removed after completion if no changes exist.
### anti_patterns
- Long-lived feature branches (>7 days without merging to main) combined with parallel agents create exponential merge complexity; they violate trunk-based development's core principle of frequent small integrations.
- Omitting file-ownership coordination before parallelizing agents—if Agent A and Agent B both edit `src/api/types.ts`, worktrees prevent filesystem collisions but leave git merge conflicts unresolved.
- Using `rm -rf` to delete worktrees instead of `git worktree remove`, leaving stale git metadata that clutters `git worktree list` and consumes disk space.
- Ignoring `.env` and config files in `.worktreeinclude`—each worktree is a fresh checkout; without copying gitignored files, agents fail or waste time recreating local configuration.
- Running multiple agents without explicit commit discipline—commits to different branches with no orchestrated merge order lead to ad-hoc conflict resolution and branch history chaos.
- Treating merge queue (GitHub/Mergify) as a substitute for upfront work decomposition—queues serialize integration but don't prevent the conflicts; decompose work first, use queues as a safety net.
- Parallel agents on main branch directly—this breaks isolation and causes immediate file conflicts; always use feature/fix branches in worktrees, never commit from agents to main.
### applicability
CC_GodMode is a single-maintainer prompt/governance framework versioned via a VERSION file and git tags. Worktrees isolate agent sessions (each parallel subagent in its own worktree on a feature/fix branch) and prevent file conflicts in the `.claude/` and `docs/` folders. Conventional Commits + semantic-release or release-please tooling automate VERSION/CHANGELOG bumps from commit message types, eliminating manual version tracking errors. For solo maintainers, trunk-based development (short-lived branches merged daily, no parallel feature branches) minimizes integration overhead while preserving audit trail via git history. Merge queues are optional; for a single maintainer without CI gates, upfront work decomposition (e.g., "@builder modifies skills/X, @scribe modifies CHANGELOG") prevents conflicts more effectively than queue tooling.
### sources
- Run parallel sessions with worktrees — Claude Code Docs https://code.claude.com/docs/en/worktrees
- Git - git-worktree Documentation https://git-scm.com/docs/git-worktree
- Managing a merge queue — GitHub Docs https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue
- Trunk-Based Development — DORA Capabilities https://dora.dev/capabilities/trunk-based-development/
- Trunk-Based Development vs. Gitflow — Flagsmith https://www.flagsmith.com/blog/trunk-based-development-vs-gitflow

## Sprint/Milestone-Based Planning for Autonomous Coding Agents (Plan-First Workflows)
### key_practices
- Define explicit work phases sequentially (Specify → Plan → Tasks → Implement → Optimize → Ship), with reflection gates between each phase before progression, grounded in Spec-Kit and Spec-Flow patterns.
- Decompose work into self-contained tasks with clear verification functions, output format specs, and task boundaries per agent, enabling independent parallel execution and failure isolation.
- Require plan approval gates for complex/risky work: lead reviews agent's plan in read-only mode before implementation, rejecting with feedback if needed, as implemented in Claude Code agent teams.
- Use task dependency modeling (Directed Acyclic Graph) to determine sequential prerequisites vs. parallelizable units, enabling deterministic orchestration without replanning overhead.
- Establish acceptance criteria at spec phase, sequence them into tasks with explicit test conditions, and validate against criteria during optimize phase before each milestone gate.
- Synchronously wait for phase completion before advancing to next (no dynamic replanning mid-phase) to ensure coordination predictability and cost/latency control in multi-agent systems.
- Employ three-tier validation gates: continuous lightweight checks during work (sub-30s, warnings only), full gates before releasing each phase (10–15 min), and pre-flight before production (2 min, blocking).
- Use deterministic context assembly (spine/contract model) to scope each agent's knowledge to dependencies only, preventing sibling-component sprawl and enabling reasoning audit trails.
- Commit after each completed phase with Conventional Commits (feat/fix/refactor/docs scope) to enable automated version bumps and changelog generation tied to acceptance criteria.
- For framework/tooling products without application code, lock API contracts between sprint phases and require explicit approval for breaking changes to agent/skill interfaces.
### anti_patterns
- Dynamic replanning per agent task: recomputing the plan mid-sprint increases latency, coordination overhead, and makes progress opaque; plan once at phase start, execute deterministically.
- Vague output format specs for subagents: leads to wasted effort (e.g., research agents exploring 2021 automotive chips instead of 2025 supply chains); explicitly state output schema, sources required, and task boundaries per agent.
- Skipping acceptance criteria formalization: moving specs to tasks to implementation without checkpoints causes scope creep; define and track acceptance criteria through each milestone gate.
- Treating all tasks as parallel: creates task coordination overhead and blocking dependencies; use DAG modeling to identify true parallelizable units vs. sequential prerequisites.
- Single validation gate at end of sprint: late-stage discovery of misalignment causes rework; stagger gates (continuous → full → pre-flight) to catch issues early when correction is cheap.
- Omitting intent/evidence drift checks: for framework products, silent divergence between spec (CLAUDE.md contracts) and implementation (agent code) causes integration failures; compare graphs and block merges on hard errors.
- Greenlighting all changes without blast-radius review: minor tweaks can cascade; gate approval based on scope (HARD/SOFT/AUTO) and require human sign-off for contract-level changes.
- Unlimited agent provisioning per task: diminishing returns beyond 3–5 focused teammates; coordinate effort scaling explicitly (simple task = 1 agent, complex = 5–10 with divided responsibilities).
- Synchronous round-trip for every subagent interaction: leads agent contention and bottleneck; use fire-and-forget messaging between teammates where possible, only lead orchestrates sequencing.
- Accepting phase completion without verification: assumes quality; require explicit gate pass (not just 'looks good') before marking phase done and triggering next phase start.
### applicability
For CC_GodMode, a plan-first sprint model fits the framework's unique constraints: as a prompt/markdown-based orchestration system with 15 agents and 13 skills (no test suite, no CI, no application code), plan-first workflows shift the burden from runtime coordination to upfront specification. Each release sprint should decompose requested features into explicit phases—spec changes to CLAUDE.md/AGENTS.md (acceptance criteria), architect-designed agent interactions and skill routing rules, builder-implemented prompt updates, and validator/tester review cycles gated by agent behavior changes. Sprints shorter than the full 15-agent workflow collapse into single-phase inline briefs. For complex cross-agent features (e.g., dynamic workflow dispatch spanning 5+ agents), require plan approval before agent prompt edits. Use Conventional Commits to tie each commit to a sprint phase (feat(agents): ..., feat(skills): ...) for automated CHANGELOG generation tied to version bumps. This approach decouples planning (architect role, one-time per sprint) from execution (parallel builder/validator/tester teams), matching CC_GodMode's existing delegation model while preventing silent divergence between documented agent contracts and actual prompt behavior.
### sources
- GitHub Spec-Kit: Spec-Driven Development Toolkit https://github.com/github/spec-kit
- Spec-Driven Development with AI: GitHub Blog https://github.blog/ai-and-ml/generative-ai/spec-driven-development-with-ai-get-started-with-a-new-open-source-toolkit/
- Orchestrate Teams of Claude Code Sessions https://code.claude.com/docs/en/agent-teams
- Anthropic: Multi-Agent Research System https://www.anthropic.com/engineering/multi-agent-research-system
- Spec-Flow: Spec-Driven Development Workflows https://github.com/marcusgoll/Spec-Flow

## Release Management Best Practices for GitHub Repos (Tags, Releases, RCs, Protection)
### key_practices
- Use annotated (not lightweight) tags for all releases with semver format prefixed v (e.g., v8.0.0) to provide full metadata and enable git describe to work correctly.
- Follow Semantic Versioning (MAJOR.MINOR.PATCH) strictly: MAJOR for breaking changes, MINOR for backward-compatible features, PATCH for bug fixes.
- Maintain a CHANGELOG.md using Keep a Changelog format with categories (Added, Changed, Deprecated, Removed, Fixed, Security), ISO 8601 dates, and an Unreleased section at the top.
- Write changelog entries as you ship (during PR review), not after releases, by adding entries to the Unreleased section to avoid forgetting changes.
- Adopt Conventional Commits (type: feat/fix/chore/docs, optional scope, description) to enable automated changelog generation and SemVer determination.
- Mark pre-releases in GitHub UI (check 'This is a pre-release') for RC/alpha/beta versions using format v8.0.0-rc.1 or v8.0.0-beta to signal instability to users.
- Configure branch protection on main to require PR reviews and status checks (if using CI), then allow release bot or maintainer to push tags directly without PR bypassing this.
- Create a release checklist Issue or PR template (Markdown task list) for solo maintainers listing: bump VERSION/package.json/plugin.json, verify CHANGELOG, draft release notes, tag commit, publish on GitHub.
- Generate GitHub release notes programmatically using Conventional Commits via tools like git-cliff or release-please, then manually review and edit for clarity before publishing.
- Use one of three automation paths: (1) release-please for lightweight automation (Google-backed), (2) git-cliff for customizable changelog generation, or (3) manual workflow with checklist for full control.
### anti_patterns
- Using lightweight tags for releases instead of annotated tags; this omits metadata and breaks git describe.
- Writing changelog entries only after release; you will forget changes, especially as a solo maintainer.
- Mixing versioning schemes (e.g., v1.2.3 and 1.2.3) across tags and package.json; stay consistent.
- Skipping the Unreleased section in CHANGELOG.md; it prevents users from seeing what's coming and complicates release prep.
- Creating release PRs that bump versions but do not update CHANGELOG.md; changelog and version must stay in sync.
- Omitting pre-release markers on RCs or alpha/beta builds; users may inadvertently install unstable versions.
- Allowing release automation to commit and push back to the repo without tight controls; it adds complexity and risks merge conflicts.
- Protecting main without an exception for release jobs; if CI/CD pushes tags, grant explicit permissions rather than breaking the workflow.
- Including internal refactors or non-user-facing changes in CHANGELOG.md; changelog is for user communication, not dev diary.
- Inconsistent commit message format; if using conventional commits, enforce it with commitlint + Husky or accept manual releases only.
### applicability
CC_GodMode is a solo-maintained, file-based orchestration framework with no traditional application code or CI/CD. Your release surface is small but critical: VERSION, package.json, plugin.json, CHANGELOG.md, git tags, and GitHub Releases. The recommended workflow tailors tight: use annotated tags with v-prefix for all releases, keep CHANGELOG.md and VERSION in lockstep using Keep a Changelog format, and adopt Conventional Commits now (no enforcement needed yet) to prepare for optional automation later. For solo maintenance without CI, implement a lightweight release checklist (Markdown task list in a GitHub Issue or .github/release-checklist.md) covering bump steps, changelog review, and tag creation. Mark pre-releases (v8.0.1-rc.1) in GitHub UI so plan-first/sprint releases are clearly signaled. Branch protection on main is safe here because you never push release commits; only tag creation bypasses PRs. This keeps governance lightweight while remaining audit-ready as the project scales.
### sources
- Keep a Changelog https://keepachangelog.com/en/0.3.0/
- Semantic Versioning 2.0.0 https://semver.org/
- Conventional Commits https://www.conventionalcommits.org/en/v1.0.0/
- GitHub Docs: Managing Releases in a Repository https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
- GitHub Docs: About Protected Branches https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches

## Semantic Versioning & Single-Source-of-Truth Version Management for Prompt/Framework Products
### key_practices
- Define MAJOR/MINOR/PATCH bumps by the impact on agent behavior, orchestration syntax, or handoff contracts—not just code: MAJOR for breaking changes to CLAUDE.md structure or skill/agent protocol; MINOR for new agents, skills, or backward-compatible features; PATCH for documentation fixes or internal improvements.
- Establish VERSION as the canonical source, derive all other version references (package.json, plugin.json, git tags, GitHub Releases) from it via automated tooling (e.g., release-please, bumpver, or a lightweight shell script).
- Use Conventional Commits (feat, fix, chore, BREAKING CHANGE) in all commits to enable automated version detection and changelog generation; parse these commits to determine version bumps rather than manual decision-making.
- Implement a release PR workflow (e.g., release-please or semantic-release) that keeps a dedicated PR open, updated with each merge to main, containing the next version number and auto-generated changelog entries organized into Added/Changed/Removed/Fixed/Security categories.
- Synchronize version updates atomically: when VERSION bumps, immediately update package.json, plugin.json, and create git tags and GitHub Release in the same commit/action, preventing drift across files.
- Run a pre-push validation that compares VERSION file against git tags and package.json; fail if any mismatch is detected, catching drift before it reaches the repository.
- Document version semantics in a VERSIONING.md or RELEASE.md file with explicit rules for what counts as breaking (e.g., 'removal of an agent parameter breaks downstream orchestration'—major bump required).
- For multi-file projects (CLAUDE.md + 15 agent files + 13 skill files), use a tool like versifyr or a custom script that applies a single version bump across all files that embed version references, rather than manually updating each.
- Maintain a strict [Unreleased] section in CHANGELOG.md at the top; at release time, move it to a dated version entry (ISO 8601 format YYYY-MM-DD), then create a fresh [Unreleased] section for the next cycle.
### anti_patterns
- Manually bumping version in package.json, plugin.json, and VERSION file separately without automation—leads to drift and conflicts on parallel branches.
- Allowing versions in different files to diverge or get out of sync with git tags; the first time a hotfix branch touches VERSION, undetected conflicts will occur.
- Using CalVer or date-based versioning for a product with unpredictable release cadence; stick to SemVer so consumers understand the impact of each upgrade.
- Relying on developers to remember to update CHANGELOG.md manually; use automated tools that parse Conventional Commits to generate changelog entries.
- Storing version in a file without a git tag that matches it; when releases are tagged inconsistently, the repository becomes a source of confusion for tooling and release scripts.
- Applying BREAKING CHANGE bumps (major) without documenting exactly what broke; consumers cannot trust version numbers if they don't know what changed.
- Creating release notes that read like commit hashes rather than user-facing summaries; organize by feature/fix/breaking/security categories and write for orchestration users, not Git historians.
- Skipping patch or minor releases because 'there aren't enough changes'—SemVer loses meaning if every intermediate version is treated as optional.
### applicability
CC_GodMode is uniquely positioned as a markdown-first, single-maintainer framework where the "product" is CLAUDE.md plus 28 prompt/skill files rather than compiled binaries. SemVer still applies, but the interpretation must be tailored: a MAJOR bump occurs when agent behavior contracts, orchestration keywords, or handoff protocols change in ways that break downstream scripts or workflows (e.g., removing a @builder parameter or changing the task verdict format); MINOR adds new agents or skills; PATCH refines documentation. Because there is no CI/CD pipeline yet and the repo is not large, a lightweight approach is viable: keep VERSION as the canonical source (single line: 8.0.0), use a simple shell script or GitHub Action to derive and sync package.json/plugin.json/git tags, and adopt Conventional Commits so the next release maintainer can generate changelogs automatically. The key risk for CC_GodMode is version drift across four sources (VERSION, package.json, plugin.json, git tags) on a solo development timeline; implementing atomic version bumps and a pre-push validation check will prevent the confusion that arises when a user reads different version numbers in different files.
### sources
- Semantic Versioning 2.0.0 Official Specification https://semver.org/
- Conventional Commits Specification v1.0.0 https://www.conventionalcommits.org/en/v1.0.0/
- Keep a Changelog Best Practices https://keepachangelog.com/en/0.3.0/
- Release Please: Automated Release PR Generation (Google) https://github.com/googleapis/release-please
- Semantic Release: Fully Automated Version Management https://github.com/semantic-release/semantic-release

## Changelog Best Practices for Single-Maintainer Prompt/Markdown Frameworks
### key_practices
- Maintain a Keep a Changelog format with [Unreleased], [version] sections, and ISO 8601 dates; categorize changes as Added, Changed, Deprecated, Removed, Fixed, Security to remain consistent and user-focused.
- Adopt Conventional Commits (feat:, fix:, BREAKING CHANGE:) locally in your commit messages to enable deterministic changelog generation and semantic versioning bumps without CI infrastructure.
- Use git-cliff locally via CLI (or npm package) to parse commits and auto-generate changelog entries; it supports offline mode and requires only a cliff.toml config file—no CI/CD needed.
- Link changelog entries to PRs by squashing PR commits into a single Conventional Commit with the PR number in the footer or body (e.g., 'feat: new agents

Closes #42'), then parse that footer during changelog generation.
- For team workflows or branches adding concurrent changelog entries, adopt towncrier-style fragment files (e.g., .changelog/42.feature.md) to avoid end-of-file merge conflicts; compile fragments into CHANGELOG.md at release time.
- Run `git-cliff --latest --output CHANGELOG.md` locally before cutting a release; pair this with manual VERSION file increment (MAJOR.MINOR.PATCH per semver.org rules) and git tag to complete a single-maintainer release cycle.
- Keep the [Unreleased] section populated as you merge PRs by either manually adding entries or piping `git-cliff --unreleased` output into that section; this surfaces upcoming changes to users and reduces pre-release work.
### anti_patterns
- Do not convert raw commit logs directly into changelog entries; they contain noise and implementation details—parse and rewrite them for user clarity.
- Do not rely on CI-only tooling (Release Please, Changesets, semantic-release) if you lack GitHub Actions/CD setup; choose local-first tools (git-cliff) that work standalone.
- Do not edit CHANGELOG.md at the end of the file if multiple branches are active; this causes merge conflicts at every release—use towncrier fragments instead.
- Do not skip linking PRs to changelog entries; it requires discipline to add PR metadata (e.g., PR #42 in commit footer or separate link line) so tooling can cross-reference.
- Do not mix Conventional Commits with unstructured messages on main; enforce one discipline via pre-commit hooks (e.g., commitlint) or enforce squash-merge-only with validated PR titles on GitHub.
- Do not assume changelog generation is fully automatic—manual curation (removing refactors, clarifying jargon, grouping related fixes) is still required for a user-facing changelog.
### applicability
CC_GodMode is a solo-maintained, versioned markdown/prompt framework without a traditional test suite or CI pipeline. The next release cycle adds plan-first + sprint orchestration features. A Keep a Changelog structure with Conventional Commits locally enforced (via husky/commitlint) fits perfectly: squash each PR into a single feat:/fix:/chore: commit with PR metadata, then run `git-cliff` locally before release to auto-generate CHANGELOG.md entries. This avoids CI lock-in, keeps workflow lightweight, and sidesteps merge-conflict pain if contributors later join. Fragment files (towncrier-style) are unnecessary now but worth documenting for future multi-contributor scenarios. Pair changelog automation with VERSION file versioning (MAJOR.MINOR.PATCH) and git tags to complete the release contract already established in your current setup.
### sources
- Keep a Changelog https://keepachangelog.com/en/1.1.0/
- Conventional Commits https://www.conventionalcommits.org/en/v1.0.0/
- Semantic Versioning 2.0.0 https://semver.org/
- git-cliff: A highly customizable Changelog Generator https://github.com/orhun/git-cliff
- git-cliff Documentation — Configuration https://git-cliff.org/docs/configuration/changelog/

## Role Separation for Agent Orchestration: Planner, Implementer, Reviewer, Release Manager
### key_practices
- Designate the orchestrator as the sole planner and decision authority—it decomposes goals, specs work, dispatches subagents in parallel, verifies output quality, and approves merges; workers execute focused tasks independently without reasoning about architecture or correctness.
- Assign reviewers (validator/tester agents) separate prompts and fresh context from implementers; they evaluate completed work against original requirements without access to implementation rationale, reducing confirmation bias.
- Version bumps, CHANGELOG entries, and release artifacts must be managed exclusively by the orchestrator or a release-manager agent with write access only to VERSION, CHANGELOG.md, and git tags; implementers never directly bump versions.
- Use Conventional Commits (feat/fix/BREAKING CHANGE) at commit level so the orchestrator can deterministically classify changes and automate SemVer decisions; enforce this via lint rules, not orchestrator judgment.
- For single-maintainer solo mode (no parallel agents), apply role personas explicitly in system prompts: Orchestrator mode for planning, Builder mode for implementation, Validator mode for review—each with distinct evaluation criteria and explicit scope boundaries.
- Pre-release versions (MAJOR.MINOR.PATCH-rc.N) mark in-progress work and can be created by implementers during development, but stable releases require orchestrator sign-off and immutable version tagging.
### anti_patterns
- Allowing implementers to self-review or justify their own changes; this activates confirmation bias where implementer-reviewers are significantly more generous to their own work than fresh reviewers.
- Letting subagents modify VERSION or CHANGELOG directly; this decouples version intent from architecture decisions and creates merge conflicts at release time.
- Mixing orchestrator reasoning with builder execution in a single prompt; role-switching in mid-session degrades both planning rigor and implementation focus.
- Skipping Conventional Commits and relying on orchestrator to manually parse git log; this breaks automation and couples release decisions to manual inspection.
- Assigning reviewer agents access to implementation context or intermediate artifacts; this biases evaluation toward defending design decisions rather than validating correctness.
- Creating new version numbers for every change; instead, accumulate commits until an orchestrator-initiated release pull request bundles them atomically.
### applicability
CC_GodMode is a prompt-based orchestration framework where the Orchestrator coordinates 15 specialized agents in parallel sessions. Since there is no application code, CI pipeline, or test suite—only prose, prompts, and scripts—traditional code-review gates do not apply. Instead, the role separation model maps directly: the Orchestrator (in CLAUDE.md) owns all high-level decisions, VERSION bumping, and merge authority; individual agents (each a .md file) have zero permissions to modify VERSION, CHANGELOG.md, or create git tags. For the next sprint's plan-first orchestration, this separation prevents agent goal-drift and version-bump conflicts. When run as parallel subagents, explicit role personas in each agent's prompt ensure fresh evaluation contexts (e.g., @validator never sees @builder's rationale first). For solo-maintainer workflow, the same role separation applies through prompt-switching: Orchestrator mode for architecture, Builder mode for implementation, Validator mode for review—each with distinct success criteria. Conventional Commits in commit messages enable future automation (release-please integration) to eliminate manual version decisions at release time.
### sources
- Agent Orchestration Patterns - Azure Architecture Center https://learn.microsoft.com/en-us/azure/architecture/ai-ml/guide/ai-agent-design-patterns
- Loop Engineering: The Feedback Cycle That Turns AI Agents Into Reliable Workers https://flowtivity.ai/blog/loop-engineering-the-feedback-cycle-that-makes-ai-agents-work/
- Multi-Agent Orchestration: How to Build Agent Teams That Actually Work https://www.mindstudio.ai/blog/multi-agent-orchestration-patterns
- Run agents in parallel - Claude Code Docs https://code.claude.com/docs/en/agents
- Claude Code Sub-Agents: Parallel vs Sequential Patterns https://claudefa.st/blog/guide/agents/sub-agent-best-practices

## System Prompt Structure Best Practices for Subagents in Multi-Agent Orchestration
### key_practices
- Start system prompts with identity (1–3 sentences) and explicit safety boundaries marked `IMPORTANT:`, using absolute language (`NEVER`, `MUST NOT`) to establish bidirectional constraints (what is allowed AND forbidden).
- Place role definition and security rules at the top (primacy effect) and repeat critical stop/escalation conditions at the bottom (recency bias) to anchor the most important rules across the attention curve.
- Define a clear `description` field in agent frontmatter that describes *when* to use the agent (e.g., 'Use for read-only security analysis of code') so the orchestrator can auto-delegate based on task type, not just explicit naming.
- Specify inputs and output format as an API contract: list input types first (file paths, log entries, decision context), then define output structure (JSON, Markdown, plain text) with sections in strict order, length limits per section, and no extraneous preamble.
- Declare tool scope and write boundaries explicitly: include a `tools` array (e.g., `['Read', 'Grep', 'Glob']` for read-only) to structurally enforce constraints, not as prompt guidance alone.
- Inject instructions for tool failure modes and escalation: 'If a tool call is denied, do not re-attempt the exact same call—analyze why and adjust, or escalate with saved state and context if beyond scope.'
- Load domain knowledge and external context on-demand via tools rather than pre-loading it into the system prompt; keep core prompts to 1,500–6,000 tokens to maximize signal and preserve reasoning headroom.
- Define stop conditions and escalation triggers: explicitly state when to stop retrying (e.g., 'After 2 failed tool attempts, escalate'), when decisions exceed delegated permissions, and what context (state, error logs, decision rationale) to attach on escalation.
### anti_patterns
- Vague role definitions ('helpful assistant') that waste tokens and create overlapping responsibilities and routing ambiguity—use specific, behavioral anchors instead.
- Burying safety rules in the middle of the prompt where recency and primacy effects do not reinforce them; use the U-shaped attention curve to place constraints at top and bottom.
- Prompt-only scope boundaries without structural tool restrictions; large language models cannot reliably separate instructions from data, so enforce tool access and write permissions via the agent's configuration, not just prompts.
- Leaving escalation rules implicit or missing; agents without clear escalation trigger definitions will either retry infinitely on errors or fail silently when encountering situations outside their training.
- Over-loading the system prompt with domain knowledge instead of having agents fetch it on-demand via tools; this increases latency, bloats token budgets, and prevents dynamic context injection.
- Treating output format as advisory rather than a testable contract; output specs must be precise (exact sections, strict order, length limits per section), validated programmatically, and versioned when they change.
- Failing to document or version the handoff contract (what the orchestrator receives from the subagent); this creates brittle parsing and blocks parallelization, because the parent cannot assemble or synthesize results correctly.
### applicability
CC_GodMode uses markdown-based agent prompts (15 files in ~/.claude/agents/ + .claude/agents/) that run as parallel subagents within Claude Code sessions. Each agent prompt needs to define role, scope, tool access, escalation rules, and return a structured verdict (STATUS/findings/report path) for the Orchestrator to fan-in. Since GodMode is a prompt-first governance framework (no application code, no test suite), structural boundaries cannot be enforced in tests or CI—they depend entirely on prompt design, frontmatter configuration (model, effort, tools, skills), and the Orchestrator's ability to parse and route verdicts correctly. Applying these best practices to GodMode means: (1) ensure each agent frontmatter's `description` field is behaviorally specific so the Orchestrator can auto-route tasks; (2) place role and non-goals at the top of each agent prompt, repeat escalation rules at the bottom; (3) standardize the verdict format (STATUS + 3 findings + report path) so the Orchestrator can reliably parse and synthesize parallel results; (4) declare tool scope (read-only, write, bash access) in frontmatter, not just in prompt text; (5) document when each agent should escalate back to the Orchestrator (e.g., blockers, uncertain risks, out-of-scope decisions); (6) version the verdict contract when handoff structure changes, and update AGENTS.md to reflect new escalation rules.
### sources
- Subagents in the SDK - Claude Code Docs https://code.claude.com/docs/en/agent-sdk/subagents
- Steering Claude Code: skills, hooks, rules, subagents and more https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more
- The Complete Guide to Writing Agent System Prompts — Lessons from Reverse-Engineering Claude Code https://www.indiehackers.com/post/the-complete-guide-to-writing-agent-system-prompts-lessons-from-reverse-engineering-claude-code-6e18d54294
- What Are Agentic Design Patterns? 2026 Pattern Catalog https://www.augmentcode.com/guides/agentic-design-patterns
- Multi-Agent AI Security: Enterprise Risks, Compliance, and Mitigation https://www.augmentcode.com/guides/multi-agent-ai-security-risks-compliance-fixes

## Preventing Race Conditions in Automated Release Pipelines: Version Bumps, Changelogs, and Shared State Files
### key_practices
- Maintain a single pending release PR (or equivalent staging file) that gets continuously updated as commits land, serializing all version and changelog writes through one gated point before merge.
- Compute the next version number once at the start of the release process based on commit history, then write version and changelog atomically in sequence (compute → write files → tag → publish), never re-derive the version.
- Use Conventional Commit messages (e.g., `feat:`, `fix:`, `BREAKING CHANGE:`) to make version determination deterministic and idempotent—running the versioning logic twice produces the same result.
- For parallel agents (e.g., Claude Code teammates in subagents), avoid writing shared files simultaneously; use explicit dependency ordering in task claims (e.g., version task must complete before changelog task).
- Write all affected files (VERSION, package.json, plugin.json, CHANGELOG.md) in a single atomic commit before creating the git tag, so the tag always captures a consistent state.
- Implement idempotent publish/tag operations: check 'is this tag already created?' before acting, so retries after transient failures do not create duplicate releases.
- For git worktree-based parallel agents, retry git operations (commit, tag, push) with exponential backoff (200ms, 400ms, 800ms) since transient .git lock contention is common but self-resolving.
- Keep the Unreleased section at the top of CHANGELOG.md; at release time, move it into a new dated version section—this pattern minimizes merge conflicts and keeps the file structure stable.
### anti_patterns
- Multiple independent release processes attempting to bump versions concurrently; use a single serialization point (e.g., one Release PR, one release agent task) instead.
- Writing VERSION, CHANGELOG, and git tags in separate workflow steps without atomicity guarantees; if step 2 fails after step 1 succeeds, the repo is left in an inconsistent state.
- Re-computing version from scratch each time the release runs; cache or lock the computed version so parallel operations use the same number.
- Allowing git worktree operations to fail silently on lock contention instead of retrying; transient .git locks are expected in high-concurrency scenarios and almost always resolve within 1–2 retries.
- Editing CHANGELOG.md from multiple agents in parallel without explicit section ownership; conflicting edits lead to silent overwrites or merge disasters.
- Using file locks (e.g., `flock`, `lockfile`) as the primary synchronization; Git's native PR mechanism and branch locks are simpler and more reliable for solo-maintainer release workflows.
- Storing release state in files outside git (e.g., `.release-lock` on disk) without cleanup; use git tags and commit history as the source of truth instead.
- Mixing automated and manual version bumps in the same repo; enforce deterministic, commit-based versioning (Semantic Versioning + Conventional Commits) so the process is auditable and repeatable.
### applicability
CC_GodMode is a solo-maintainer, markdown-driven orchestration framework with 15 agent prompts and 13 skill files versioned via VERSION + package.json + plugin.json + CHANGELOG.md + git tags. Parallel agents (subagents in one session or agent teams across sessions) may attempt release-related writes concurrently. The recommended pattern is to serialize all release operations through a single Orchestrator agent task: compute version once from git history (using Conventional Commits in recent PRs), write all config files atomically in one commit, tag, and push—avoiding file locks or complex concurrency primitives. For agent teams using worktrees, explicit task dependencies (version → changelog → tag) and retry logic on transient git lock failures are proportionate. Since there are no CI runners and the maintainer is local, manual triggering of the release task ensures single-threaded execution. Keep the single-release-PR pattern in mind for future CI integration.</applicability>
</invoke>
### sources
- release-please: generate release PRs based on the conventionalcommits.org spec https://github.com/googleapis/release-please
- Orchestrate teams of Claude Code sessions https://code.claude.com/docs/en/agent-teams
- Run parallel sessions with worktrees https://code.claude.com/docs/en/worktrees
- Keep a Changelog https://keepachangelog.com/en/1.1.0/
- semantic-release: Fully automated version management and package publishing https://github.com/semantic-release/semantic-release
