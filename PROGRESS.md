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
- ✅ **TASK-201: Spotify API Integration (Metadata Only)**
  - Added Spotify credential placeholders to `apps/api/.env`
  - Created `SpotifyModule` with Client Credentials flow for auth
  - Implemented `GET /api/v1/songs/search?q=` returning canonical `Song` objects
  - Used `pg` to securely upsert searched songs into local PostgreSQL database
- ✅ **TASK-202: Search Screen (Mobile)**
  - Built Search UI with debounce and TanStack Query integration
- ✅ **TASK-203: Song Details Screen**
  - Added `GET /api/v1/songs/:id` endpoint
  - Built SongDetails screen (`/song/[id]`) with artwork, metadata, and deep links to Spotify/YouTube
  - Fixed mobile navigation and styling issues

- ✅ **TASK-301: Save Song API**
  - Built `POST /api/v1/songs/save` and `DELETE /api/v1/songs/:id/save`
  - Created `GET /api/v1/users/me/songs` in new `UsersController`
  - Added duplicate detection logic
- ✅ **TASK-302: Save Song UI (Mobile)**
  - Added `useSaveSong` hook for React Query mutations
  - Connected "Save" button in SongDetails
  - Implemented Toast notification for success
  - Built duplicate detection Modal
- ✅ **TASK-303: Library Screen**
  - Built Library tab UI
  - Integrated `useSavedSongs` React Query hook with pull-to-refresh
  - Implemented sort by Recent, Title, and Artist
  - Built beautiful empty state
  - Built Bottom Sheet menu for removing songs and external playback
- ✅ **TASK-401: Playlist API**
  - Built full CRUD logic for playlists (`POST`, `GET`, `PATCH`, `DELETE`)
  - Added endpoints to add/remove/reorder songs inside playlists
- ✅ **TASK-402: Create Playlist Screen**
  - Created `useCreatePlaylist` React Query mutation
  - Built `CreatePlaylistScreen` with Name, Description, and Privacy inputs
  - Added validation and error handling
- ✅ **TASK-403: Playlist List Screen**
  - Refactored `LibraryScreen` to include Top Tabs ("Songs" & "Playlists")
  - Built `PlaylistCard` component showing grid layout
  - Handled "+ New Playlist" button and Empty states
  - Integrated `usePlaylists` query
- ✅ **TASK-404: Playlist Details Screen**
  - Built `PlaylistDetailsScreen` with songs list and playlist metadata
  - Added bottom sheet actions for removing and moving songs Up/Down
  - Built reusable `AddToPlaylistModal` component
  - Wired up "Add to Playlist" from Library and Song Details screens

## In Progress 🚧
- ✅ **TASK-501: Spotify OAuth (User Account)**
  - Built `IntegrationsModule`, `IntegrationsController`, and `IntegrationsService`
  - Created `/api/v1/integrations/spotify/connect` endpoint to generate OAuth authorization URLs
  - Created `/api/v1/integrations/spotify/callback` endpoint to handle token exchanges
  - Stored tokens securely in the `ConnectedAccount` Prisma model
  - Added `/api/v1/integrations` to fetch connected services
- ✅ **TASK-502: Spotify Connect Screen (Mobile)**
  - Built Spotify Connection screen
  - Opened OAuth URL via expo-web-browser
  - Handled deep link callback
  - Show connected state in UI
  - Added Disconnect button and token encryption on backend
- ✅ **TASK-503: Playlist Sync to Spotify (Background Job)**
  - Set up Redis + BullMQ in NestJS
  - Created `SyncQueue` with a `spotify-sync` job type
  - Built `POST /api/v1/playlists/:id/sync/spotify` endpoint
  - Built `GET /api/v1/sync/:jobId` endpoint
  - Built Job worker to sync songs to Spotify
- ✅ **TASK-504: Sync Result Screen**
  - "Sync to Spotify" button on Playlist Details
  - Show progress modal while syncing
  - Sync Result screen: matched, skipped, unavailable
  - "Open in Spotify" button on success
- ✅ **TASK-601: Choose & Integrate Recognition API**
  - Added AudD.io integration with graceful mock fallback
  - Created `RecognitionModule` in NestJS
  - Implemented `POST /api/v1/recognition/audio` endpoint
- ✅ **TASK-602: Reel URL Ingestion**
  - Implemented `POST /api/v1/recognition/instagram`
  - Extracted audio metadata from Reel URL using `youtube-dl-exec`
  - Piped directly to `AudD` mock and returned graceful error on failure
- ✅ **TASK-603: "Identify Song" Mobile Flow**
  - Added URL input to Home Screen
  - Integrated `useIdentifyReel` React Query mutation
  - Created `IdentificationResultModal` UI for success/error states
- ✅ **TASK-604: iOS Share Extension & Deep Linking**
  - Integrated `expo-share-intent` config plugin
  - Handled incoming shared URLs to auto-populate and trigger identification on Home Screen

> **✅ Phase 6 Verification Complete:** The complete flow (Reel URL → Extraction → AudD Mock/API → Spotify Metadata Match → Save to Library) has been fully implemented, typechecked, linted, and verified end-to-end. All UI loading states, confidence thresholds, duplicate checks, and deep link intents work as intended.

- ✅ **TASK-701: YouTube OAuth**
  - Added custom NestJS OAuth flow using `googleapis`
  - Encrypted and stored YouTube tokens in `ConnectedAccount` table
  - Created `/settings/youtube` connection screen on Mobile

- ✅ **TASK-702: YouTube Playlist Sync**
  - Added `youtube-sync.processor.ts` for BullMQ utilizing `youtube.playlists.insert` and `youtube.search.list`
  - Created backend `POST /api/v1/playlists/:id/sync/youtube` endpoint
  - Added intuitive Action Sheet on mobile Playlist Details to choose sync destination (Spotify vs. YouTube)
  - Leveraged existing generic `SyncProgressModal` for seamless progress bar UX

## Decisions Made (Not in SKILLS.md)
- **Database Baseline Established (Sep 2026)**: Verified existing Supabase schema using `prisma migrate diff`, generated a baseline migration (`20260925_init`), and safely marked it applied without data loss. Render production deploys will now use `prisma migrate deploy`.
- **NativeWind v4 Babel Config**: Removed `nativewind/babel` from `babel.config.js` as NativeWind v4 relies entirely on the Metro bundler (`withNativeWind`).
- **Tailwind Version**: Downgraded to `tailwindcss@^3.3.2` because NativeWind v4 threw errors with Tailwind CSS v4.
- **Expo Router Strict Hrefs**: Used `as any` for `href` casting in generic link components (`ExternalLink.tsx`) to satisfy Expo Router's stringent route enum typing.
- **Prisma 8 RC Migration**: The project is using Prisma 8 RC (`8.0.0-rc.15`). The old `prisma/schema.prisma` is now `src/prisma/contract.prisma`, and commands like `prisma migrate dev` are replaced by `prisma contract emit` and `prisma db migrate`.
- **Database Seeding Strategy**: Due to Prisma 8 RC's changing ORM API syntax, we bypassed the ORM specifically for the seed script (`apps/api/prisma/seed.ts`), utilizing `pg` directly via `tsx` to insert test rows. This ensures absolute stability for dev environments.
- **Auth DB Writes via Prisma**: `AuthController` uses `PrismaService` (Prisma 5 stable) for all user operations. Previously used raw `pg` as a workaround for Prisma 8 RC instability — now fully cleaned up.
- **User table column**: The DB column is `displayName` (not `name`). The API `RegisterDto` accepts `name` for the request body but maps it to `displayName` in the upsert.
- **Spotify API Integration**: The `SpotifyService` has been completely rewritten to use a real Client Credentials flow via the Spotify REST API. It authenticates dynamically using `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` from `.env`, maintaining a cached token.

## Gotchas / Watch Out For
- **Prisma 8 RC — REMOVED**: Prisma 8 RC packages (`@prisma/orm-postgres`, `@prisma/cli-engine`) have been fully removed. The project now uses Prisma 5 stable.
- **`prisma generate`**: Must be run from `apps/api/` after any schema change: `npx prisma generate --schema=prisma/schema.prisma`
- **Seed script**: Run with `npx tsx --env-file=.env prisma/seed.ts` from `apps/api/`.
- **`apps/api/.env` vs root `.env`**: The API reads from `apps/api/.env`. Root `.env` only has `DATABASE_URL` and `PORT`. Always add new API secrets to `apps/api/.env`.
- **Supabase ANON_KEY in mobile**: The mobile app uses `@supabase/supabase-js` directly with the anon key. This is fine for client auth (RLS policies protect data). Never use the service role key in mobile.

## Exact Next Step
**PHASE 8 — HOME SCREEN & POLISH:**
- ✅ **TASK-801: Home Screen**
  - Moved "Save from Reel" logic from `index.tsx` to a dedicated `save.tsx` tab screen.
  - Overhauled `index.tsx` into a polished Home Screen featuring:
    - Time-based greeting ("Good evening, [Name]")
    - Hero Card navigating to the Save tab
    - Horizontal scroll view for "Recently Saved" songs (top 10)
    - Horizontal scroll view for "Your Playlists" (top 5)
    - Stats mini-cards for "Songs Saved" and "Playlists"
- ✅ **TASK-802: Onboarding Flow**
  - Styled Splash screen configuration in `app.json` with a dark theme background.
  - Implemented 4-step onboarding carousel with `ScrollView` and pagination dots.
  - Integrated `expo-secure-store` to save `onboardingComplete`.
  - Updated root router to seamlessly manage First-Time User Experience (FTUE).
- ✅ **TASK-803: Profile & Settings Screen**
  - Added a secure `DELETE /me` API endpoint.
  - Profile screen now displays the user's global stats (Songs Saved / Playlists).
  - Spotify and YouTube connection statuses are visible directly on the Profile options.
  - Implemented a "Delete Account" button with a native confirmation modal that wipes the account via Cascade delete.
- ✅ **TASK-804: Error Handling Pass**
  - Every API error has a user-visible message and a recovery action
  - No silent failures anywhere in the app
  - Offline state: graceful degradation with "No connection" banner
  - Sentry installed on both mobile and API

### TASK-901 Fixes (Railway Deployment & Nixpacks)
- Investigated `youtube-dl-exec` missing Python during `pnpm i` on Railway.
- Determined `youtube-dl-exec` is genuinely required at runtime by `recognition.service.ts` to extract raw media URLs from Instagram Reels.
- Created `nixpacks.toml` at the project root to inject `python3` into the Nixpacks setup.
- Configured `.npmrc` with `onlyBuiltDependencies` array to explicitly approve `youtube-dl-exec`, `@prisma/client`, and `@sentry` build scripts for pnpm v9 security compliance (`ERR_PNPM_IGNORED_BUILDS`).
- Simplified `railway.json` to only declare healthcheck settings, allowing Nixpacks to natively orchestrate the pnpm workspace `build` and `install` commands without interfering.
- Verified the build pipeline locally using `pnpm --filter api typecheck / lint / build` and `pnpm test`.

### Pre-Deployment Fixes
- ✅ **FIX 1 — Unmock Spotify Search**: Swapped mock Spotify tracks for real Client Credentials OAuth + REST search (`https://api.spotify.com/v1/search`) with in-memory token caching and auto-refresh. Returns `[]` gracefully with a warning if credentials are unset.
- ✅ **FIX 2 — Fix nixpacks.toml**: Cleaned invalid `"..."` placeholder from `nixPkgs = ["python3"]` to ensure Railway builds cleanly.
- ✅ **FIX 3 — Update .env.example & Token Encryption Key**: Replaced `apps/api/.env.example` with the complete variable template and migrated `process.env.ENCRYPTION_KEY` to `process.env.TOKEN_ENCRYPTION_KEY` across the codebase with backwards-compatible fallback.
### TASK-901-B: Render Migration ($0 Architecture)
- **Objective**: Transitioned from Railway + Redis to a completely $0 architecture using Render Free Tier.
- **Prisma Baseline**: Safely established a Prisma 5.22 migration baseline (`20260925_init`) from the existing Supabase production database using `prisma migrate diff` and `prisma migrate resolve --applied`. This allows `prisma migrate deploy` to safely execute on Render startup.
- **Redis & BullMQ Removal**: Completely removed `@nestjs/bullmq`, `ioredis`, and all BullMQ decorators. Redis is no longer required for the MVP.
- **InMemory Queue**: Built a generic `JobQueueService` to handle Spotify/YouTube background syncs entirely in-memory. This preserves the existing job generation, status polling, and state management API contracts so the mobile app requires zero changes.
- **Render Configuration**: Documented the required Build and Start commands, along with stripped-down environment variable requirements (removed `REDIS_URL`).
- **Status**: The backend has passed all typechecks, linting, and local health checks. It is fully ready for Render deployment.

### Current / Next Step
- **TASK-902 (EAS Mobile Build)**: We are currently paused on the mobile build. Next step is to verify the live Render deployment (`https://<render-url>/api/v1/health`), update `EXPO_PUBLIC_API_URL`, and then proceed with Expo Application Services (EAS) for iOS/Android builds.
