# Skills Index

Use this file as the entry point for progressive skill loading. Do not load every
skill by default.

## Default Starting Points

- `skills/using-superpowers/SKILL.md` - Start here when the task is a normal software-development workflow and no narrower skill is obvious.
- `skills/systematic-debugging/SKILL.md` - Bugs, production issues, unclear reproduction paths, and deployment/runtime failures.
- `skills/writing-plans/SKILL.md` - Complex or cross-module work that needs an implementation plan before edits.
- `skills/executing-plans/SKILL.md` - Execute an approved plan with checkpoints.
- `skills/verification-before-completion/SKILL.md` - Final proof before claiming completion.
- `skills/requesting-code-review/SKILL.md` - Ask for a focused code review before merge or handoff.

## External Claude Code Skills

### Superpowers

Source: `obra/superpowers`

- `skills/brainstorming/SKILL.md` - Refine unclear product or engineering ideas before implementation.
- `skills/writing-plans/SKILL.md` - Produce implementation plans with concrete files and verification.
- `skills/executing-plans/SKILL.md` - Execute plans in batches with human checkpoints.
- `skills/subagent-driven-development/SKILL.md` - Use subagents for planned implementation and review loops.
- `skills/dispatching-parallel-agents/SKILL.md` - Coordinate independent parallel agent work.
- `skills/systematic-debugging/SKILL.md` - Root-cause debugging workflow.
- `skills/test-driven-development/SKILL.md` - Red-green-refactor workflow.
- `skills/verification-before-completion/SKILL.md` - Evidence before completion claims.
- `skills/requesting-code-review/SKILL.md` - Request review.
- `skills/receiving-code-review/SKILL.md` - Address review feedback.
- `skills/using-git-worktrees/SKILL.md` - Isolated parallel branch work.
- `skills/finishing-a-development-branch/SKILL.md` - Finish branch, verify, and decide merge/PR handling.
- `skills/writing-skills/SKILL.md` - Create or revise skills.

### UI, Testing, Presentations, and Codebase Maps

- `skills/ui-ux-pro-max/SKILL.md` - UI/UX design intelligence, design systems, accessibility, layout, typography, and UI review.
- `skills/webapp-testing/SKILL.md` - Official Anthropic Playwright workflow for local webapp testing.
- `skills/pptx/SKILL.md` - Official Anthropic PPTX skill for reading, creating, editing, and visually verifying decks.
- `skills/graphify/SKILL.md` - Build/query a project knowledge graph for architecture and codebase questions.

## Claude Code Plugins

Plugin sources live under `plugins/`. They are not loaded with `@skill`; install
or invoke them through Claude Code plugin commands.

- `plugins/code-review/` - Anthropic official code-review plugin. Prefer `/code-review` for PR review automation.

## Local Claude Code Tooling

- `.claude/` - GSD Core from `open-gsd/gsd-core`, installed with `npx @opengsd/gsd-core@latest --claude --local`. Use `/gsd-*` slash commands instead of loading it with `@skill`.

## Retained Team Vibe Skills

These remain because they encode Team Vibe-specific conventions or project
governance not fully replaced by external skills. Load the native wrapper skill;
the wrapper then references the retained source markdown file.

### Code Review

- `skills/api-design-review/SKILL.md` - API routes, DTOs, error codes, compatibility, and authorization boundaries.
- `skills/architecture-tradeoff-review/SKILL.md` - Compare architectural options and refactor routes.
- `skills/backend-integration-review/SKILL.md` - Transactions, concurrency, cross-module integration, data consistency.
- `skills/docs-code-consistency-review/SKILL.md` - README, SPEC, ADR, deployment docs versus implementation.
- `skills/requirements-traceability-review/SKILL.md` - Trace SPEC acceptance criteria to implementation and tests.
- `skills/security-audit/SKILL.md` - Auth, permissions, injection, secrets, sensitive data, audit chain.

### Generators

- `skills/api-generator/SKILL.md` - Generate clients, types, or interface docs from API contracts.
- `skills/doc-generator/SKILL.md` - Generate or update project documentation.

### Team Workflows

- `skills/dual-system-audit/SKILL.md` - Local development versus remote deployment drift.
- `skills/harness-engineering-workflow/SKILL.md` - Team-specific PLAN/CODE/REVIEW/VERIFY delivery pipeline.
- `skills/onboarding-workflow/SKILL.md` - Onboard a project to Team Vibe Config.
- `skills/pr-comparison-workflow/SKILL.md` - Compare multiple candidate PRs or implementations.
- `skills/refactor-workflow/SKILL.md` - Behavior-preserving structural improvement.
- `skills/skill-accumulation-workflow/SKILL.md` - Turn retrospectives into rules, skills, or templates.
- `skills/spec-driven-development/SKILL.md` - SPEC-driven feature or POC workflow.
- `skills/tooling-decision-workflow/SKILL.md` - Decide whether to introduce a CLI, script, plugin, or external tool.

## Replacement Notes

Removed local duplicate skills are documented in
`skills/EXTERNAL_SOURCES.md`. The short version:

- General planning/execution/debugging now comes from Superpowers.
- Generic PR review now comes from Superpowers plus Anthropic's code-review plugin.
- UI implementation/review now comes from UI UX Pro Max plus webapp-testing.
- Test generation is replaced by Superpowers' TDD workflow.

## Loading Discipline

- When the user names a skill, load only that skill and its direct references.
- For ordinary software work, start from `using-superpowers` unless a narrower skill clearly applies.
- For UI changes, pair `ui-ux-pro-max` with `webapp-testing` when runtime verification is possible.
- For PR review automation, prefer the `plugins/code-review` plugin path over old local review skills.
- If a retained Team Vibe skill conflicts with rules, follow `rules/universal/rule-precedence.mdc` and `rules/index.md`.
