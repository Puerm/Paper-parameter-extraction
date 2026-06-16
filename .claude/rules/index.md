# Rules Index

Use this file as the entry point for progressive rule loading. Do not load every rule by default.

## Always Load

- `.claude/rules/universal/ai-collaboration-principles.mdc`
- `.claude/rules/universal/completion-claims.mdc`
- `.claude/rules/universal/environment-boundaries.mdc`
- `.claude/rules/universal/secrets-and-production.mdc`
- `.claude/rules/universal/cli-first-tooling.mdc`
- `.claude/rules/universal/error-handling.mdc`
- `.claude/rules/universal/rule-precedence.mdc`

## Load By Task

### Naming Or Public Surface

Load when creating new public names, renaming code, changing API fields, database fields, config keys, events, exported types, templates, rules, or skills.

- `.claude/rules/universal/naming-conventions.mdc`

### Git Operations

Load only when the user asks to stage, commit, push, amend, revert, prepare commit messages, or inspect commit readiness.

- `.claude/rules/universal/git-commits.mdc`

### Specs, Plans, Or Delivery Traceability

Load when creating or updating specs, design docs, task plans, ADRs, delivery reports, OpenSpec changes, or trace matrices.

- `.claude/rules/universal/spec-plan-traceability.mdc`
- `.claude/rules/universal/docs-as-code.mdc`

### Frontend

Load when editing React, TypeScript frontend code, UI state, hooks, CSS, Tailwind, layout, interaction, or frontend tests.

- `.claude/rules/frontend/typescript-standards.mdc`
- `.claude/rules/frontend/react-standards.mdc`
- `.claude/rules/frontend/css-tailwind.mdc`

### Backend API

Load when editing routes, controllers, handlers, DTOs, schemas, OpenAPI docs, API tests, authentication, authorization, pagination, filtering, sorting, idempotency, or API compatibility.

- `.claude/rules/backend/api-standards.mdc`
- `.claude/rules/universal/naming-conventions.mdc`

### Backend Data And Consistency

Load when editing database schema, migrations, repository code, transactions, state machines, money, time, identity, tokens, idempotency, concurrent updates, or data repair scripts.

- `.claude/rules/backend/database-standards.mdc`
- `.claude/rules/backend/transaction-consistency.mdc`
- `.claude/rules/backend/money-time-and-identity.mdc`
- `.claude/rules/universal/naming-conventions.mdc`

### Input, Content, And Security Boundary

Load when editing input validation, normalization, rich text, user-generated content, file names, URLs, logging of user input, or render/storage safety.

- `.claude/rules/backend/input-normalization-security.mdc`

### Realtime, Rate Limiting, Workers, Or Microservices

Load when editing WebSocket, SSE, long polling, broadcasts, rate limits, background jobs, queues, service-to-service calls, or distributed workflows.

- `.claude/rules/backend/rate-limiting-and-realtime.mdc`
- `.claude/rules/backend/microservices.mdc`
- `.claude/rules/backend/transaction-consistency.mdc`

## Loading Discipline

- Start with the always-load rules and this index.
- Add only the smallest rule set that matches the current task.
- If a task crosses domains, load the relevant domain sections and ignore unrelated rules.
- Do not load templates unless creating or updating a document from that template.
- Do not load skills unless the user requests that workflow or the task clearly matches its trigger.
