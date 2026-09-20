# ReelTune Progress

## Fully Complete ✅

- ✅ **T001: Initialize Monorepo**
- ✅ **T002: TypeScript / ESLint / Prettier Baseline**
- ✅ **T003-partial: Environment Template**
- ✅ **TASK-002: API Scaffold**
- ✅ **TASK-003: Mobile App Scaffold**
- ✅ **TASK-004: Shared Types Package**
- ✅ **TASK-005: Prisma Schema**
  - Configured Prisma 8 RC (`contract.prisma`) mapping perfectly to `@reeltune/types`
  - Applied the initial database schema to the Supabase remote PostgreSQL database
  - Created a robust seed script leveraging `pg` (to avoid Prisma 8 RC API instability)
  - Successfully seeded the remote database with 1 test user and 3 test songs

## In Progress 🚧
*None*

## Decisions Made (Not in SKILLS.md)
- **NativeWind v4 Babel Config**: Removed `nativewind/babel` from `babel.config.js` as NativeWind v4 relies entirely on the Metro bundler (`withNativeWind`).
- **Tailwind Version**: Downgraded to `tailwindcss@^3.3.2` because NativeWind v4 threw errors with Tailwind CSS v4.
- **Expo Router Strict Hrefs**: Used `as any` for `href` casting in generic link components (`ExternalLink.tsx`) to satisfy Expo Router's stringent route enum typing.
- **Prisma 8 RC Migration**: The project is using Prisma 8 RC (`8.0.0-rc.15`). The old `prisma/schema.prisma` is now `src/prisma/contract.prisma`, and commands like `prisma migrate dev` are replaced by `prisma contract emit` and `prisma db migrate`.
- **Database Seeding Strategy**: Due to Prisma 8 RC's changing ORM API syntax, we bypassed the ORM specifically for the seed script (`apps/api/prisma/seed.ts`), utilizing `pg` directly via `tsx` to insert test rows. This ensures absolute stability for dev environments.

## Gotchas / Watch Out For
- **Prisma 8 Database Connection**: Ensure `DATABASE_URL` is URL-encoded appropriately (e.g. `@` -> `%40`) within `.env`. 
- **Seeding Execution**: Run the seed script with `npx tsx --env-file=.env prisma/seed.ts` instead of `ts-node` to prevent ESM loader issues.

## Exact Next Step
Continue from `TASKS.md` Phase 1:

- **Next: TASK-101 — Supabase Auth Setup**
  - Enable Email and Google Auth in the Supabase dashboard (User action)
  - Create NestJS `AuthModule` with Supabase client
  - Implement `POST /api/v1/auth/register` to sync Supabase Auth users to our Prisma `User` table
