# ReelTune AI Coding Rules

# AUTONOMOUS EXECUTION POLICY

You have permission to operate autonomously on this project.

DO NOT repeatedly ask me for permission to perform normal development actions.

For all routine development work, make the decision yourself and proceed.

## YOU ARE AUTHORIZED TO

- Create files and folders.
- Modify existing project files.
- Delete files that are clearly obsolete or generated incorrectly.
- Install required dependencies.
- Update package.json / lockfiles.
- Run package managers.
- Run development servers when necessary.
- Run tests.
- Run linting.
- Run type checking.
- Run build commands.
- Run database migrations required by the current task.
- Generate Prisma client/code.
- Create database schemas/models according to the documentation.
- Update API contracts and corresponding implementations when required.
- Refactor code when necessary to complete the current task.
- Fix errors discovered during implementation.
- Retry failed commands when the failure is recoverable.
- Inspect logs and diagnose errors.
- Update documentation when implementation changes require it.
- Create test files.
- Create configuration files.
- Update environment templates.
- Make reasonable implementation decisions when multiple equivalent approaches exist.
- Continue through dependent steps required to complete the current task.

## DO NOT ASK FOR PERMISSION FOR

Do NOT stop and ask:

"Should I create this file?"

"Can I install this dependency?"

"Would you like me to modify this?"

"Should I run the tests?"

"Can I fix this error?"

"Should I continue?"

"Do you want me to proceed?"

"Should I update the configuration?"

"May I refactor this?"

"Can I run the build?"

"Would you like me to implement the next required step?"

For routine project operations, the answer is automatically YES.

Proceed without waiting.

## DECISION-MAKING

When a reasonable technical decision is required:

1. Check AGENTS.md.
2. Check the relevant project documentation.
3. Check the existing code.
4. Choose the solution that best matches the documented architecture.
5. Implement it.
6. Test it.
7. Continue.

Do not interrupt me for minor implementation decisions.

Prefer consistency with the existing architecture over introducing new technology.

## WHEN SOMETHING FAILS

If a command fails:

1. Read the error.
2. Diagnose the cause.
3. Attempt the appropriate fix.
4. Run the command again.
5. Continue if successful.

Do NOT immediately ask me what to do.

You may make multiple reasonable attempts to resolve normal development errors.

If the failure is caused by missing credentials, unavailable external services, or an action that genuinely cannot be completed without information unavailable to you, continue everything else that can be completed and clearly report the blocker at the end.

## DEPENDENCIES

If a dependency is required by the documented architecture or current task:

Install it automatically.

Do not ask for confirmation.

Use the project's existing package manager.

Do not install unnecessary dependencies.

## FILE OPERATIONS

You may freely create, edit, move, rename, and remove project files when necessary.

Before deleting something:

- Verify that it is obsolete, duplicated, generated, or directly contradicted by the current architecture.

Do not delete user data or unrelated files.

## DATABASE

You may:

- Create/update Prisma schemas.
- Generate Prisma clients.
- Create migrations.
- Apply development migrations.
- Seed development data when required.

Do not destroy production databases.

Never run destructive production database operations.

For local development, use the documented database workflow automatically.

## ENVIRONMENT VARIABLES AND SECRETS

You may create and update:

.env.example
configuration files
development environment configuration

NEVER invent credentials.

NEVER expose secrets.

NEVER commit .env files containing real secrets.

If a required secret is missing:

- configure the variable correctly
- continue all work that does not require the secret
- report the missing variable at the end

Do not repeatedly ask for the same secret.

## GIT

You may inspect:

- git status
- git diff
- git log
- branches

You may create branches when the documented workflow requires them.

Do NOT automatically push to GitHub or rewrite remote history unless explicitly instructed.

Do NOT automatically create commits unless the project workflow explicitly requires automatic commits.

You may prepare the project for a commit and report the recommended commit message.

## TESTING

After implementing a feature:

1. Run relevant tests.
2. Run type checking.
3. Run linting.
4. Run the build when appropriate.
5. Fix failures automatically.
6. Re-run validation.

Do not stop after the first failed test.

## SCOPE CONTROL

Autonomy does NOT mean implementing everything at once.

Follow docs/PLAN.md.

Complete the current task fully before moving to the next task.

You do NOT need to ask permission before moving from one task to the next if the plan explicitly defines the next task as the natural continuation.

However, keep the implementation logically scoped.

Do not start unrelated features.

## DOCUMENTATION

Documentation is the source of truth.

Priority:

1. AGENTS.md
2. Architecture/design documentation
3. API contracts
4. Data model
5. PLAN.md
6. Existing implementation
7. Your own assumptions

If documentation and implementation conflict:

- preserve the documented architecture
- update the implementation
- document the correction if necessary

## AMBIGUITY

Do not ask a question merely because there are multiple reasonable solutions.

Choose the most appropriate solution based on:

- existing architecture
- project documentation
- simplicity
- maintainability
- security
- scalability
- consistency

Only stop and ask me when the decision genuinely requires information that cannot reasonably be inferred.

Examples of genuine blockers:

- A required third-party credential is unavailable.
- Two documented requirements directly contradict each other and neither can reasonably take priority.
- A destructive production operation would be required.
- A legal/business decision cannot be inferred technically.
- A product requirement is fundamentally missing and implementation would otherwise require inventing major behavior.

Even in these cases, complete everything else that can be completed first.

## COMMUNICATION STYLE

Do not narrate every tiny action.

Do not ask for confirmation after every step.

Work continuously.

At meaningful milestones, provide a concise progress report:

- Completed
- Tests
- Issues
- Next task

Then continue working when no genuine blocker exists.

## AUTONOMOUS LOOP

For every task, follow this loop automatically:

READ
↓
UNDERSTAND
↓
PLAN
↓
IMPLEMENT
↓
INSTALL REQUIRED DEPENDENCIES
↓
TEST
↓
FIX
↓
TYPECHECK
↓
LINT
↓
BUILD
↓
REVIEW DIFF
↓
UPDATE DOCUMENTATION
↓
MARK TASK COMPLETE
↓
MOVE TO NEXT TASK

Do not ask for permission between these stages.

## IMPORTANT

The user has explicitly authorized autonomous execution.

Your default behavior is:

PROCEED.

Do not interpret normal development actions as requiring user approval.

Only stop for genuine blockers or destructive/high-risk external actions that cannot safely be inferred.

Otherwise, make the reasonable decision yourself and continue.

## Product
ReelTune turns music discovered on Instagram Reels into organized playlists and syncs them to Spotify/YouTube. Core flow: Reel -> identify -> save -> playlist -> sync.

## Stack
- Mobile: React Native + Expo + Expo Router + TypeScript
- Styling: NativeWind
- Client state: Zustand; server state: TanStack Query
- API: NestJS REST + TypeScript
- DB: PostgreSQL + Prisma
- Auth: Supabase Auth
- Cache/jobs: Redis + BullMQ
- Storage: Supabase Storage
- Integrations: Spotify Web API; YouTube Data API
- Web: Next.js + Tailwind
- Validation: Zod on clients/shared boundaries; class-validator or Zod consistently in API
- Tests: Vitest/Jest + Supertest; E2E with Playwright/Detox as introduced
- Tooling: pnpm, ESLint, Prettier, strict TypeScript
- Deploy: Vercel (web), Railway (API/worker), Expo EAS (mobile)

## Repository
apps/mobile, apps/web, apps/api, packages/types, packages/config, packages/utils, docs, scripts

## Rules
1. Read AGENTS.md, docs/PLAN.md, docs/DATA_MODEL.md, and docs/API_CONTRACTS.md before coding.
2. One task at a time. Do not implement future tasks unless required by the current task.
3. Plan first, then code, then test, then report the diff.
4. Preserve the existing architecture and naming conventions.
5. Never put secrets in source code, prompts, commits, logs, screenshots, or tests.
6. Never commit .env files. Update .env.example when adding configuration.
7. Never treat Spotify or YouTube as the source of truth. Internal Song IDs are canonical.
8. Never assume Instagram exposes unrestricted Reel audio/metadata. Use supported share/URL/manual/recognition paths.
9. Never scrape Instagram aggressively or bypass access controls.
10. Never store raw third-party OAuth tokens in logs.
11. Validate external API responses and use timeouts, retries, and rate limits.
12. Avoid destructive DB changes without an explicit migration plan.
13. Prefer small reusable functions over giant components/services.
14. Do not silently change API response shapes. Update API_CONTRACTS and tests first.
15. Every feature task must add/update tests for its acceptance criteria.
16. Run lint, typecheck, unit tests, and relevant integration tests before declaring a task done.
17. Keep UI faithful to docs/DESIGN_SYSTEM.md; do not invent a new visual language.
18. Use platform-independent Song entities with spotifyId, youtubeId, and isrc when available.
19. Sync operations must be idempotent and record per-track results.
20. For uncertainty, stop and state the assumption instead of inventing behavior.

## Definition of Done
- Acceptance criteria pass.
- Tests added/updated and passing.
- Typecheck passes.
- Lint/format passes.
- No secrets or debug logging committed.
- API/schema docs updated if contracts changed.
- Migration included if DB changed.
- Commit is focused and describes the task.
