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
- ✅ **TASK-101: Supabase Auth Setup**
  - NestJS `AuthModule` with `SupabaseService`, `SupabaseAuthGuard`, and `AuthController`
  - `POST /api/v1/auth/register` — creates Supabase user + inserts into `user` table via `pg`
  - `POST /api/v1/auth/login` — validates credentials, returns `accessToken` + `refreshToken`
  - `GET /api/v1/auth/me` — returns user profile (JWT-guarded via `SupabaseAuthGuard`)
  - User `test@reeltune.com` verified in Supabase Dashboard → Authentication → Users
- ✅ **TASK-102: Mobile Auth Screens**
  - Setup Zustand store `useAuthStore` with SecureStore persistence
  - Built `app/(auth)/login.tsx`, `register.tsx`, `forgot-password.tsx`
  - Added route redirection logic to `app/_layout.tsx` using `useSegments` and `useRouter`
- ✅ **TASK-103: User Profile Basics**
  - `GET /api/v1/auth/me` fulfills the backend requirement for getting the user profile
  - Profile screen fetches and displays name, email, and avatar placeholder
  - Logout button properly triggers `signOut` in `useAuthStore` clearing session

## In Progress 🚧
- 🚧 **TASK-201: Spotify API Integration (Metadata Only)** — Planning phase

## Decisions Made (Not in SKILLS.md)
- **NativeWind v4 Babel Config**: Removed `nativewind/babel` from `babel.config.js` as NativeWind v4 relies entirely on the Metro bundler (`withNativeWind`).
- **Tailwind Version**: Downgraded to `tailwindcss@^3.3.2` because NativeWind v4 threw errors with Tailwind CSS v4.
- **Expo Router Strict Hrefs**: Used `as any` for `href` casting in generic link components (`ExternalLink.tsx`) to satisfy Expo Router's stringent route enum typing.
- **Prisma 8 RC Migration**: The project is using Prisma 8 RC (`8.0.0-rc.15`). The old `prisma/schema.prisma` is now `src/prisma/contract.prisma`, and commands like `prisma migrate dev` are replaced by `prisma contract emit` and `prisma db migrate`.
- **Database Seeding Strategy**: Due to Prisma 8 RC's changing ORM API syntax, we bypassed the ORM specifically for the seed script (`apps/api/prisma/seed.ts`), utilizing `pg` directly via `tsx` to insert test rows. This ensures absolute stability for dev environments.
- **Auth DB Writes via `pg`**: Both `register` and `getMe` in `AuthController` use direct `pg` queries instead of Prisma ORM, because Prisma 8 RC's `db.orm.public.User` API is unstable/broken at runtime. This is a permanent workaround until Prisma 8 reaches stable.
- **User table column**: The DB column is `displayName` (not `name`). The API `RegisterDto` accepts `name` for the request body but maps it to `displayName` in the INSERT.

## Gotchas / Watch Out For
- **Prisma 8 Database Connection**: Ensure `DATABASE_URL` is URL-encoded appropriately (e.g. `@` → `%40`) within `.env`.
- **Seeding Execution**: Run the seed script with `npx tsx --env-file=.env prisma/seed.ts` instead of `ts-node` to prevent ESM loader issues.
- **`apps/api/.env` vs root `.env`**: The API reads from `apps/api/.env`. Root `.env` only has `DATABASE_URL` and `PORT`. Always add new API secrets to `apps/api/.env`.
- **Supabase ANON_KEY in mobile**: The mobile app uses `@supabase/supabase-js` directly with the anon key. This is fine for client auth (RLS policies protect data). Never use the service role key in mobile.

## Exact Next Step
**TASK-201 — Spotify API Integration:**
- Register ReelTune app on Spotify Developer Dashboard
- Add Spotify credentials to `.env`
- Create `SpotifyModule` in NestJS with Client Credentials flow
- Implement `GET /api/v1/songs/search?q=`
