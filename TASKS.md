# ReelTune — MVP Task Breakdown

Each task is independently testable. Complete them in order.
Mark a task done ✅ only when it passes its acceptance criteria.

---

## PHASE 0 — PROJECT SETUP
> Goal: Working monorepo that runs locally with a "hello world" deploy.

### TASK-001: Initialize Monorepo
- [ ] Create `reeltune/` monorepo with pnpm workspaces
- [ ] Create `apps/api`, `apps/mobile`, `apps/web`, `packages/types`, `packages/utils`, `packages/config`
- [ ] Add root `package.json` + `pnpm-workspace.yaml`
- [ ] Configure shared TypeScript base (`packages/config/tsconfig.base.json`)
- [ ] Configure shared ESLint base
- [ ] Initialize Git, add `.gitignore` (node_modules, .env, dist, .expo)
- ✅ Done when: `pnpm install` succeeds from root with no errors

### TASK-002: API Scaffold
- [ ] Init NestJS app in `apps/api`
- [ ] Add Prisma + connect to local PostgreSQL
- [ ] Add health check endpoint: `GET /api/v1/health → { status: 'ok' }`
- [ ] Add `.env.example` (copy from the provided template)
- [ ] Set up validation pipe globally (class-validator)
- ✅ Done when: `GET /api/v1/health` returns 200

### TASK-003: Mobile App Scaffold
- [ ] Init Expo app in `apps/mobile` with TypeScript template
- [ ] Add Expo Router
- [ ] Add NativeWind (configure tailwind for React Native)
- [ ] Install fonts (Manrope via expo-font)
- [ ] Set up theme constants file (colors, spacing, typography from design system)
- [ ] Create basic 5-tab navigation shell (Home, Search, Save, Library, Profile — placeholder screens)
- ✅ Done when: App runs on simulator with 5 tabs visible in the design system's dark theme

### TASK-004: Shared Types Package
- [ ] Define shared TypeScript types in `packages/types`:
  - `User`, `Song`, `SavedSong`, `Playlist`, `PlaylistSong`, `ConnectedAccount`
  - `ApiResponse<T>`, `PaginatedResponse<T>`
  - `RecognitionResult`, `SyncJob`, `SyncResult`
- [ ] Export from `packages/types/index.ts`
- ✅ Done when: Mobile and API can both import `Song` from `@reeltune/types` with no TS errors

### TASK-005: Prisma Schema
- [ ] Write full Prisma schema (User, Song, SavedSong, Playlist, PlaylistSong, ConnectedAccount)
- [ ] Run first migration
- [ ] Add seed script with 3 test songs and 1 test user
- ✅ Done when: `npx prisma migrate dev` runs clean + seed populates the DB

---

## PHASE 1 — AUTHENTICATION
> Goal: Users can register, log in, and stay logged in.

### TASK-101: Supabase Auth Setup
- [ ] Create Supabase project, enable email + Google auth
- [ ] Add Supabase credentials to `.env`
- [ ] Create NestJS `AuthModule` with Supabase client
- [ ] `POST /api/v1/auth/register` — creates Supabase user + Prisma User record
- [ ] `POST /api/v1/auth/login` — validates credentials, returns session token
- [ ] `GET /api/v1/auth/me` — returns current user (requires auth)
- [ ] Create `JwtAuthGuard` — apply to all protected routes
- ✅ Done when: Register → login → call /me returns user object

### TASK-102: Mobile Auth Screens
- [x] Build Login screen (email + Google sign-in button)
- [x] Build Register screen
- [x] Implement Supabase auth in mobile using `@supabase/supabase-js`
- [x] Store session in Zustand + persist with SecureStore
- [x] Redirect logged-in users to Home; unauthenticated to Login
- [x] Add "Forgot password" flow (Supabase handles email)
- ✅ Done when: New user can register, close app, reopen, and be logged in automatically

### TASK-103: User Profile Basics
- [x] `GET /api/v1/users/me` — returns user profile
- [x] Profile screen shows name, email, avatar placeholder
- [x] Logout button clears Supabase session and Zustand state
- ✅ Done when: Profile screen shows user data and logout works

---

## PHASE 2 — SONG DATA & SEARCH
> Goal: Users can search for any song and see its details.

### TASK-201: Spotify API Integration (Metadata Only)
- [ ] Register ReelTune app on Spotify Developer Dashboard
- [ ] Add Spotify credentials to `.env`
- [ ] Create `SpotifyModule` in NestJS with Client Credentials flow (for search — no user auth needed)
- [ ] Implement `GET /api/v1/songs/search?q=` — calls Spotify search API, maps to internal `Song` type
- [ ] Store found songs in local `songs` table (upsert on ISRC or Spotify ID)
- ✅ Done when: `GET /api/v1/songs/search?q=blinding+lights` returns structured song results

### TASK-202: Search Screen (Mobile)
- [x] Build Search screen with search bar
- [x] Hook to `/api/v1/songs/search` via TanStack Query with debounce (300ms)
- [x] Display results as SongRow list items (artwork, title, artist)
- [x] Loading state (skeleton rows) + empty state + error state
- ✅ Done when: User can type "Blinding Lights" and see The Weeknd's track with album art

### TASK-203: Song Details Screen
- [x] `GET /api/v1/songs/:id` — returns full song with metadata
- [x] Build SongDetails screen: artwork (large), title, artist, album, duration
- [x] "Play on Spotify" button (deep links to Spotify app)
- [x] "Play on YouTube" button (opens YouTube link)
- [x] Save button (stub for now)
- ✅ Done when: Tapping a search result opens a details screen with all metadata

---

## PHASE 3 — SAVE SONGS & LIBRARY
> Goal: Users can save songs and view their personal library.

### TASK-301: Save Song API
- [x] `POST /api/v1/songs/save` — saves a song to user's library (creates SavedSong record)
- [x] Duplicate detection: if song already saved, return `{ alreadySaved: true, playlists: [...] }` instead of saving again
- [x] `DELETE /api/v1/songs/:id/save` — removes song from library
- [x] `GET /api/v1/users/me/songs` — returns user's saved songs (paginated, sortable)
- ✅ Done when: Save → fetch library shows the song; save again returns duplicate warning

### TASK-302: Save Song UI (Mobile)
- [x] Add Save button to SongDetails screen (calls save API)
- [x] Show Toast on success: "Song saved!" with playlist name
- [x] Show duplicate modal: "Already saved — add to another playlist?" with playlist list
- [x] Optimistic update: button turns filled/active immediately
- ✅ Done when: User can save a song from search results in ≤ 3 taps

### TASK-303: Library Screen
- [x] Build Library screen with saved songs list
- [x] SongRow component with: artwork, title, artist, heart icon, ⋮ menu
- [x] ⋮ menu actions: Add to Playlist, Favorite, Remove, Open Spotify, Open YouTube
- [x] Sort options: Recently Saved, Song Name, Artist
- [x] Empty state: "No songs yet — discover something!"
- [x] Pull-to-refresh
- ✅ Done when: Saved songs appear in library and can be removed

---

## PHASE 4 — PLAYLISTS
> Goal: Users can create playlists and add/remove/reorder songs.

### TASK-401: Playlist API
- [x] `POST /api/v1/playlists` — create playlist (name, description, privacy)
- [x] `GET /api/v1/playlists` — list user's playlists
- [x] `GET /api/v1/playlists/:id` — get playlist with songs
- [x] `PATCH /api/v1/playlists/:id` — rename, update description, toggle privacy
- [x] `DELETE /api/v1/playlists/:id` — delete playlist
- [x] `POST /api/v1/playlists/:id/songs` — add song
- [x] `DELETE /api/v1/playlists/:id/songs/:songId` — remove song
- [x] `PATCH /api/v1/playlists/:id/reorder` — update song positions
- ✅ Done when: Full CRUD works via Postman/Thunder Client

### TASK-402: Create Playlist Screen
- [x] Build Create Playlist modal/screen (name field, description, privacy toggle)
- [x] Validate: name required, max 50 chars
- [x] On success: navigate to new playlist
- ✅ Done when: User can create a playlist and it appears in their list

### TASK-403: Playlist List Screen
- [x] Build Playlist List screen (grid of playlist cards)
- [x] PlaylistCard shows: artwork (or default), name, song count
- [x] "+ New Playlist" button
- [x] Empty state
- ✅ Done when: Created playlists show up as cards

### TASK-404: Playlist Details Screen
- [x] Build Playlist Details screen: header (artwork, name, count, play/sync buttons), song list
- [x] Add song to playlist (from ⋮ menu on SongRow or from song details)
- [x] Remove song from playlist (swipe or ⋮ menu)
- [x] Drag-to-reorder on desktop web (mobile: up/down arrows or long press)
- ✅ Done when: User can add songs to a playlist and see them in order

---

## PHASE 5 — SPOTIFY USER INTEGRATION & SYNC
> Goal: Users can connect Spotify and sync playlists.

### TASK-501: Spotify OAuth (User Account)
- [x] `GET /api/v1/integrations/spotify/connect` — redirects to Spotify auth
- [x] `GET /api/v1/integrations/spotify/callback` — handles OAuth callback, stores access/refresh tokens in `connected_accounts` table (encrypted, never sent to client)
- [x] Token refresh logic (Spotify tokens expire in 1 hour — auto-refresh before expiry)
- [x] `GET /api/v1/integrations` — returns which services are connected
- ✅ Done when: User can connect Spotify and the DB shows their tokens

### TASK-502: Spotify Connect Screen (Mobile)
- [x] Build Spotify Connection screen (big Spotify logo, "Connect" button)
- [x] Open OAuth URL via expo-web-browser
- [x] Handle deep link callback (`reeltune://settings/spotify/callback`)
- [x] Show "Connected as [Spotify username]" after success
- [x] Disconnect button (removes ConnectedAccount record)
- ✅ Done when: User sees their Spotify username after connecting

### TASK-503: Playlist Sync to Spotify (Background Job)
- [x] Set up Redis + BullMQ in NestJS
- [x] Create `SyncQueue` with a `spotify-sync` job type
- [x] `POST /api/v1/playlists/:id/sync/spotify` — creates BullMQ job, returns `{ jobId }`
- [x] `GET /api/v1/sync/:jobId` — returns job status + progress
- [x] Job worker: for each song, find Spotify track by spotifyId (if stored) or search by title+artist, add to Spotify playlist
- [x] Job result: `{ total, matched, skipped, unavailable }`
- ✅ Done when: Syncing a 5-song playlist creates a matching Spotify playlist

### TASK-504: Sync Result Screen
- [x] "Sync to Spotify" button on Playlist Details
- [x] Show progress modal while syncing (poll /sync/:jobId every 2s)
- [x] Sync Result screen: matched (✅), skipped (⚠️), unavailable (✕) with song names
- [x] "Open in Spotify" button on success
- ✅ Done when: User sees exactly which songs synced and which didn't

---

## PHASE 6 — SONG RECOGNITION (THE CORE DIFFERENTIATOR)
> Goal: Users can share a Reel and the song is automatically identified.

### TASK-601: Choose & Integrate Recognition API
- [x] Select recognition service (AudD.io recommended for audio fingerprinting; ACRCloud is alternative)
- [x] Create account, get API key, add to `.env`
- [x] Create `RecognitionModule` in NestJS (decoupled service)
- [x] Recognition service interface:
  - Input: audio URL or raw audio bytes or Reel URL
  - Output: `{ title, artist, confidence, candidates: [...] }`
- [x] `POST /api/v1/recognition/audio` — accepts audio upload, returns recognition result
- ✅ Done when: Uploading a 10-second clip of a known song returns correct title + artist with confidence score

### TASK-602: Reel URL Ingestion
- [x] `POST /api/v1/recognition/instagram` — accepts `{ reelUrl: string }`
- [x] Backend attempts to extract audio metadata from the Reel URL
- [x] If metadata available → match song → return result
- [x] If no metadata → attempt audio download (where legally/technically possible) → send to recognition API
- [x] If recognition fails → return `{ success: false, message: 'Could not identify', candidates: [] }`
- ✅ Done when: Pasting a Reel URL returns a song or a graceful "couldn't identify" response

### TASK-603: Save From Reel Screen (Mobile)
- [x] Build "Save" tab screen (central + button destination)
- [x] Input 1: "Paste Reel URL" text field + Identify button
- [x] Input 2: "Record Audio" button (expo-av recording, ≤15 seconds) (Skipped for MVP - Focus on URL Ingestion)
- [x] Show loading state with animated AudioWave/pulse while identifying
- [x] Show Recognition Result card:
  - High confidence (≥70%): Song card with "Save" CTA
  - Failed: "Couldn't identify" + "Search Manually" button
- ✅ Done when: Pasting a Reel URL → tapping Identify → song result appears within 10 seconds

### TASK-604: iOS Share Extension (Optional but important for core UX)
- [x] Add Expo Share Extension (or Expo Bare Workflow custom native module)
- [x] Register `reeltune://save?url=` as a deep link scheme
- [x] When user taps "Share → ReelTune" in Instagram, app opens to Save screen with URL pre-filled
- [x] Auto-trigger identification on open
- ✅ Done when: Sharing a Reel from Instagram opens ReelTune and starts identification automatically

---

## PHASE 7 — YOUTUBE INTEGRATION
> Goal: Users can connect YouTube and sync playlists there too.

### TASK-701: YouTube OAuth
- [x] Set up Google Cloud project, enable YouTube Data API v3
- [x] `GET /api/v1/integrations/youtube/connect` → Google OAuth redirect
- [x] `GET /api/v1/integrations/youtube/callback` → store Google tokens
- ✅ Done when: User can connect their Google/YouTube account

### TASK-702: YouTube Playlist Sync
- [x] Add `youtube-sync` BullMQ job type
- [x] For each song: search YouTube by title + artist, get videoId, add to YouTube playlist
- [x] `POST /api/v1/playlists/:id/sync/youtube` → returns jobId
- [x] Reuse Sync Result screen for YouTube
- ✅ Done when: A playlist syncs to YouTube Music with correct tracks

---

## PHASE 8 — HOME SCREEN & POLISH
> Goal: Home screen feels intentional and the full user journey is smooth.

### TASK-801: Home Screen
- [x] Greeting: "Good evening, [Name]" + "What did you discover?"
- [x] Search bar (navigates to Search tab on tap)
- [x] "Save from Reel" hero card (navigates to Save tab)
- [x] "Recently Saved" horizontal scroll (last 10 songs)
- [x] "Your Playlists" section (last 5 playlists)
- [x] Stats mini-card: X songs saved, Y playlists
- ✅ Done when: Home screen shows real user data on first load

### TASK-802: Onboarding Flow
- [x] Splash screen (ReelTune logo + tagline)
- [x] 4-step onboarding: Discover / Save / Organize / Sync
- [x] "Get Started" leads to Register
- [x] Skip button on each step
- [x] Only shown once (store `onboardingComplete` flag)
- ✅ Done when: New install shows onboarding; returning user goes straight to Home

### TASK-803: Profile & Settings Screen
- [x] User avatar + name + email
- [x] Connected services section (Spotify: connected/disconnected, YouTube: connected/disconnected)
- [x] Stats: songs saved, playlists created, last sync
- [x] "Delete Account" (with confirmation)
- [x] Disconnect Spotify / Disconnect YouTube
- ✅ Done when: All connection states are visible and actions work

### TASK-804: Error Handling Pass
- [x] Every API error has a user-visible message and a recovery action
- [x] No silent failures anywhere in the app
- [x] Offline state: graceful degradation with "No connection" banner
- [x] Sentry installed on both mobile and API
- ✅ Done when: Force-kill the API mid-use → mobile shows a clear error, not a blank screen

---

## PHASE 9 — DEPLOYMENT
> Goal: The app is live and someone else can create an account.

### TASK-901: Backend Deployment
- [ ] Provision Railway project (Node.js service + PostgreSQL + Redis)
- [ ] Set all production env vars in Railway
- [x] Create `railway.json` to handle Prisma migrations and builds automatically
- [ ] `GET https://api.reeltune.app/api/v1/health` returns 200
- ✅ Done when: API is live at a public URL

### TASK-902: Mobile TestFlight/Play Console Build
- [ ] Set up Expo EAS account
- [ ] Configure `eas.json` (development, preview, production profiles)
- [ ] `eas build --platform ios` (TestFlight)
- [ ] `eas build --platform android` (Play Console internal testing)
- ✅ Done when: App installs on a real device from TestFlight or Play Console

### TASK-903: Web App Deployment (Lightweight)
- [ ] Deploy Next.js web app to Vercel
- [ ] Web handles: Spotify OAuth callback, YouTube OAuth callback (redirect to mobile deep link)
- [ ] Landing page / playlist share links work on web
- ✅ Done when: OAuth flow works on real device via web redirect

---

## MVP ACCEPTANCE CRITERIA (final check)
Run this test case end-to-end before calling MVP done:

1. ✅ Create new account
2. ✅ Search "Die With A Smile" → save it
3. ✅ Create playlist "Road Trip"
4. ✅ Add song to playlist
5. ✅ Connect Spotify
6. ✅ Sync playlist → Spotify playlist appears with the track
7. ✅ Share Instagram Reel → song auto-identified → saved in < 10 seconds
8. ✅ Logout → log back in → all data persists

---

## Future (Post-MVP Backlog)
- TASK-F01: For non named songs use ai to analyse and find the song
- TASK-F02: Shareable playlist links (public playlists with web preview)
- TASK-F03: Duplicate detection UI improvements
- TASK-F04: AI Mood Classification (auto-tag songs: Chill, Energy, Romantic, etc.)
- TASK-F05: Smart playlist suggestions ("You've saved 12 similar songs. Create a playlist?")
- TASK-F06: Apple Music integration
- TASK-F07: JioSaavn integration
- TASK-F08: Social features (follow friends, public playlists, likes)
- TASK-F09: Collaborative playlists
- TASK-F10: PostHog analytics dashboard review + growth loop optimization
- TASK-F11: for non named songs use ai to analyse and find the song
