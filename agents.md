# Project Instructions for AI Agents

## Tech Stack & Project Purpose
This project is a high-performance, reusable NestJS Rate Limiting library distributed as an npm package. 

It supports multiple rate-limiting algorithms: Fixed Window, Token Bucket, Sliding Window Log, Sliding Window Counter, and Leaky Bucket.

It provides dual-storage drivers: in-memory `Map` and `Redis` (powered by highly optimized Lua scripts).

The library is designed for maximum extensibility, allowing developers to inject custom key extractors, error factories, and option factories for dynamic runtime configuration.

* **Core Stack:** Node.js, TypeScript, NestJS, Turborepo
* **Testing:** Bun Test Runner (via `bun test`), `@nestjs/testing`
* **Tools:** Biome (linting/formatting), Knip (dead code analysis), Turbo (task runner)

## Project Structure
* `/lib` - The main NestJS rate limiting library code (Target for features and architecture)
* `/e2e` - Mini-application containing E2E test suites (Used to verify rate limiting behavior under load)
* `/scripts` - Infrastructure, CI/CD, and release automation scripts

## Critical Workflow Commands
You MUST use these specific scripts from the root directory to execute tasks. Never run naked package scripts from inside sub-workspaces.
* **Build entire project:** `bun build`
* **Build library only:** `bun build:lib`
* **Run unit tests:** `bun test:unit`
* **Run integration tests:** `bun test:integration`
* **Run E2E tests:** `bun test:e2e`
* **Format & fix code style:** `bun format:fix`
* **Lint & fix code issues:** `bun lint:fix`
* **Check dead code:** `bun knip`

## Guardrails & Security Boundaries
1. **No Automated Commits:** You are STRICTLY PROHIBITED from creating, amending, or pushing Git commits automatically. Any file modifications must be left unstaged for human review.
2. **Directory Lock (/scripts):** You MUST NOT modify, add, or delete any files inside the `/scripts` directory. If a task requires infrastructure changes, ask the human operator first.
3. **Public API Exports:** This is a library. Any new algorithm, storage driver, module, custom provider interface, or type created in `/lib` MUST be explicitly exported via the public entry point (e.g., `lib/src/index.ts`) so the `/e2e` application can consume it.
4. **Scope Isolation:** Before starting a task, verify if it belongs to `/lib` or `/e2e`. Never mix changes between them in a single plan.
5. **Code Quality:** After modifying any TypeScript files, you MUST run `bun run lint:fix` and ensure the build succeeds.
6. **Dependencies:** Do not add new production dependencies without explicit human confirmation.

## Testing Guidelines
* All tests are executed using the **Bun Test Runner** wrapped inside Turbo tasks.
* When modifying or adding rate limiting algorithms, ensure that corresponding functional and performance E2E test suites are updated or added in the `/e2e` workspace.
* Always verify that changes in `/lib` do not break tests in `/e2e`. Run `bun run test:unit` to validate the entire codebase before concluding your work.
