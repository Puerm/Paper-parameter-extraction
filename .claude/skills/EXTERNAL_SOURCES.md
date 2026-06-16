# External Skill Sources

This file records the Claude Code V2 migration decisions for external skills,
plugins, and tools.

## Installed As Skills

| Source | Installed Path | Decision |
|---|---|---|
| `https://github.com/obra/superpowers` | `skills/brainstorming`, `skills/writing-plans`, `skills/executing-plans`, `skills/systematic-debugging`, and related Superpowers skills | Primary replacement for generic planning, execution, debugging, TDD, verification, and code-review workflow skills. |
| `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill` | `skills/ui-ux-pro-max` | Primary replacement for local frontend design implementation and visual/UX review skills. |
| `https://github.com/anthropics/skills/tree/main/skills/webapp-testing` | `skills/webapp-testing` | Official webapp runtime testing skill. Complements UI review with Playwright verification. |
| `https://github.com/anthropics/skills/tree/main/skills/pptx` | `skills/pptx` | Official PPTX creation/editing/review skill. |
| `https://github.com/safishamsi/graphify` | `skills/graphify` | Codebase graph and architecture-query skill. |

## Installed As Plugin Reference

| Source | Installed Path | Decision |
|---|---|---|
| `https://github.com/anthropics/claude-plugins-official/tree/main/plugins/code-review` | `plugins/code-review` | Official PR review plugin. Use `/code-review`; do not load as `@skill`. |

## Installed As Local Claude Code Tooling

| Source | Installed Path | Decision |
|---|---|---|
| `https://github.com/open-gsd/gsd-core` | `.claude/commands/gsd`, `.claude/agents`, `.claude/gsd-core`, `.claude/hooks` | Installed with `npx @opengsd/gsd-core@latest --claude --local`. GSD Core is a slash-command/agent/hook system, not a plain `SKILL.md` skill. |

## External Tools Not Vendored As Skills

| Source | Decision |
|---|---|
| `https://github.com/thedotmack/claude-mem` | Keep as separately installed Claude Code plugin/tool. It depends on hooks, a worker service, MCP tools, and a local database, so copying only its skill files would be misleading. |
| `https://github.com/gsd-build/get-shit-done` | Superseded by `https://github.com/open-gsd/gsd-core`, which is now installed locally under `.claude/`. |
| `https://github.com/HKUDS/LightRAG` | Not a Claude Code skill. Treat as a RAG framework/library candidate for a separate architecture decision. |

## Removed Local Duplicate Skills

The following Team Vibe skills were removed because external skills/plugins now
cover the same primary use case:

- `skills/code-review/general-risk-review.md`
- `skills/code-review/multi-agent-review.md`
- `skills/code-review/react-review.md`
- `skills/code-review/visual-ux-review.md`
- `skills/generators/test-generator.md`
- `skills/workflows/agent-collaboration-workflow.md`
- `skills/workflows/delivery-readiness-evaluation.md`
- `skills/workflows/diagnose-first-workflow.md`
- `skills/workflows/frontend-design-implementation.md`
- `skills/workflows/long-task-execution-workflow.md`
- `skills/workflows/plan-first-workflow.md`

## Retained Local Skills

Local skills remain when they contain Team Vibe-specific conventions, review
criteria, or templates that the external skills do not know:

- API design review
- Architecture tradeoff review
- Backend integration review
- Documentation/code consistency review
- Requirements traceability review
- Security audit
- Dual-system deployment audit
- Harness engineering workflow
- Onboarding workflow
- PR comparison workflow
- Refactor workflow
- Skill accumulation workflow
- SPEC-driven development
- Tooling decision workflow

## Pending

The user originally mentioned ten candidate repositories. This migration pass
now records the nine links provided so far plus the corrected GSD Core source.
Add any remaining candidate here before the next replacement round.
