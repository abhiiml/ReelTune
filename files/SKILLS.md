# ReelTune — AI Context & Rules File

## What Is This App
ReelTune is a cross-platform music discovery and playlist management app.
Core user flow:
Instagram Reel → Share to ReelTune → Song identified → Saved to library → Organized into playlists → Synced to Spotify/YouTube

One-sentence definition: ReelTune lets users save songs they discover on Instagram Reels, automatically identifies them, organizes them into playlists, and syncs those playlists to Spotify and YouTube.

---

## Monorepo Structure (always follow this)
```
reeltune/
├── apps/
│   ├── mobile/        # React Native + Expo + Expo Router
│   ├── web/           # Next.js + Tailwind (lightweight companion)
│   └── api/           # NestJS backend
├── packages/
│   ├── types/         # Shared TypeScript types — used by all apps
│   ├── config/        # Shared config (eslint, tsconfig bases)
│   └── utils/         # Shared utility functions
├── package.json
└── pnpm-workspace.yaml
```

---

## Tech Stack (non-negotiable — do not suggest alternatives)
| Layer           | Technology                          |
|-----------------|-------------------------------------|
| Mobile          | React Native + Expo + Expo Router   |
| Styling (mobile)| NativeWind (Tailwind for RN)        |
| State           | Zustand (app state)                 |
| Server state    | TanStack Query                      |
| Web             | Next.js + Tailwind CSS              |
| Backend         | NestJS (TypeScript)                 |
| ORM             | Prisma                              |
| Database        | PostgreSQL                          |
| Auth            | Supabase Auth                       |
| Cache           | Redis                               |
| Jobs            | BullMQ + Redis                      |
| Music metadata  | Spotify Web API                     |
| YouTube         | YouTube Data API v3                 |
| Recognition     | Dedicated recognition service (AudD or ACRCloud) |
| Storage         | Supabase Storage                    |
| Deployment      | Railway (API + DB + Redis) + Expo EAS (mobile) |
| Monitoring      | Sentry (errors) + PostHog (analytics) |
| Package manager | pnpm                                |

---

## Language Rules
- TypeScript EVERYWHERE. No .js files in this project.
- `strict: true` in all tsconfig.json files.
- Shared types always live in `packages/types` — never duplicate them in individual apps.
- Import shared types as `@reeltune/types`.

---

## Naming Conventions
| Thing                  | Convention              | Example              |
|------------------------|-------------------------|----------------------|
| Files                  | kebab-case              | `song-card.tsx`      |
| React components       | PascalCase              | `SongCard`           |
| Functions & variables  | camelCase               | `savedSongs`         |
| Database tables        | snake_case              | `saved_songs`        |
| API routes             | /api/v1/kebab-case      | `/api/v1/playlists`  |
| Prisma models          | PascalCase singular     | `Song`, `SavedSong`  |
| NestJS files           | feature.type.ts         | `songs.service.ts`   |
| Env variables          | SCREAMING_SNAKE_CASE    | `SPOTIFY_CLIENT_ID`  |

---

## Design System (never deviate)

### Colors
```
Primary background:   #080706   (almost-black warm)
Secondary background: #11100E
Card:                 #181512
Elevated card:        #211B16
Primary accent:       #D99A5B   (warm caramel/orange — ReelTune's brand color)
Accent highlight:     #F0C28F
Primary text:         #F5F1EB
Secondary text:       #A9A29A
Muted text:           #6F6A64
Success:              #8FBF9A
Error:                #D77A70
```
Spotify/YouTube keep their own brand colors ONLY when representing those integrations.

### Typography
Font: **Manrope** (import from Google Fonts)
```
Display:  42px / Bold
H1:       32px / Bold
H2:       24px / Semibold
H3:       18px / Semibold
Body:     15px / Regular
Small:    13px / Medium
Caption:  11px / Medium
```

### Spacing (8px base)
Use: 4, 8, 12, 16, 24, 32, 40, 48, 64

### Border Radius
```
Buttons:       14px
Cards:         20px
Artwork:       16px
Bottom sheets: 28px
Inputs:        14px
```

### Icons
Use **Lucide Icons only** (outline style). Never mix icon libraries.
Approved icons: Search, Heart, Plus, Music, MoreHorizontal, Play, Share2, Link, Check, Settings, User, ChevronRight

### Reusable Components (build these, don't redesign per screen)
Button, IconButton, SongCard, SongRow, AlbumArtwork, PlaylistCard,
PlaylistHeader, SearchBar, BottomSheet, Modal, Toast, ProgressBar,
ServiceButton, TabBar, NavigationBar, EmptyState, LoadingState, AudioWave

---

## NestJS Backend Architecture
```
apps/api/src/
├── auth/
├── users/
├── songs/
├── playlists/
├── recognition/
├── integrations/
│   ├── spotify/
│   └── youtube/
├── sync/
├── notifications/
└── common/
    ├── guards/
    ├── decorators/
    ├── filters/
    └── interceptors/
```
- Business logic lives in **Services**, not Controllers.
- Use NestJS DTOs + class-validator for all request validation.
- Use NestJS Guards for auth protection on every private route.
- Never put external API calls in Controllers.

---

## Mobile Navigation
5-tab bottom nav: **Home | Search | + (Save) | Library | Profile**
The central + button is the most important action in the app — style it prominently.

### Expo Router Screens
```
/                    → Home
/search              → Search
/save                → Save from Reel (central CTA)
/library             → Saved Songs
/library/[id]        → Song Details
/playlists           → Playlist List
/playlists/[id]      → Playlist Details
/playlists/create    → Create Playlist
/profile             → Profile & Settings
/settings/spotify    → Spotify Connection
/settings/youtube    → YouTube Connection
/recognize           → Song Recognition flow
/sync/[jobId]        → Sync Progress
```

---

## Data Architecture (critical — do not violate)

### Internal Song Object (canonical entity)
```typescript
{
  id: string           // ReelTune internal ID — the source of truth
  title: string
  artists: string[]
  album: string
  artwork: string
  duration: number
  isrc: string | null  // industry standard cross-platform ID
  spotifyId: string | null
  youtubeId: string | null
  metadata: JSON
}
```
**NEVER make Spotify the source of truth.** The internal Song is always canonical.
Playlists are platform-agnostic — sync creates a copy on Spotify/YouTube, it doesn't move the data.

---

## Instagram Integration Rules
- NEVER assume Instagram provides unrestricted API access to Reel audio.
- Always support ALL 4 ingestion methods:
  1. Share Reel → ReelTune (primary)
  2. Paste Reel URL (fallback)
  3. Manual song search (always available)
  4. Audio upload/recording (stretch)
- Recognition is a **separate decoupled service** — output is always `{ title, artist, confidence }`.
- Always display confidence score to user. Never pretend identification is certain.
- If confidence < 70%: show top 3 candidates and offer manual search.

---

## Playlist Sync Rules
- ALL sync operations are async via BullMQ queue — never synchronous.
- Return `jobId` immediately from the API; client polls `/api/v1/sync/:jobId` for progress.
- Never block an HTTP request while processing songs.
- Sync result must always show: matched count, skipped count, unavailable count.

---

## API Design Rules
- All routes: `/api/v1/resource`
- Auth: JWT bearer token on all protected routes
- Never expose Spotify/YouTube tokens to the frontend — backend holds them
- Rate limit all endpoints (especially recognition and search)
- Every error returns: `{ statusCode, message, error }` — never silently fail

### API Surface (reference)
```
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me

GET  /api/v1/songs/search?q=
GET  /api/v1/songs/:id
POST /api/v1/songs/save
DELETE /api/v1/songs/:id/save
GET  /api/v1/users/me/songs

POST /api/v1/recognition/instagram
POST /api/v1/recognition/audio

GET    /api/v1/playlists
POST   /api/v1/playlists
GET    /api/v1/playlists/:id
PATCH  /api/v1/playlists/:id
DELETE /api/v1/playlists/:id
POST   /api/v1/playlists/:id/songs
DELETE /api/v1/playlists/:id/songs/:songId
PATCH  /api/v1/playlists/:id/reorder

GET /api/v1/integrations/spotify/connect
GET /api/v1/integrations/spotify/callback
GET /api/v1/integrations/youtube/connect
GET /api/v1/integrations/youtube/callback

POST /api/v1/playlists/:id/sync/spotify
POST /api/v1/playlists/:id/sync/youtube
GET  /api/v1/sync/:jobId
```

---

## Security Rules (never break)
- NEVER store Spotify/YouTube refresh tokens on the client (mobile or web).
- NEVER commit `.env` files.
- NEVER put API keys in source code.
- Hash passwords with Argon2.
- Use Supabase Auth for user auth — don't roll your own JWT from scratch.
- Encrypt OAuth tokens at rest.
- CORS: whitelist allowed origins explicitly.
- Input validation on every endpoint via class-validator DTOs.

---

## Error Handling Patterns (always follow)
Every error state must have a recovery action shown to the user.
```
Song identification failed  → [Try Again] [Paste Reel URL] [Search Song]
Spotify connection failed   → [Reconnect Spotify] [Try Again]
Song unavailable on Spotify → [Search Manually] [Skip]
Playlist sync partial fail  → Show matched/skipped/unavailable counts with [View Results]
```
Never use generic "Something went wrong" without an action the user can take.

---

## PostHog Analytics Events (instrument these)
```
song_saved              { source: 'instagram' | 'search' | 'url' | 'audio' }
song_identification_success { confidence: number }
song_identification_failed
playlist_created
spotify_connected
youtube_connected
playlist_synced         { total, matched, skipped, unavailable }
```

---

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






## DO NOT
- Write `.js` files — TypeScript only
- Add new colors outside the design system
- Use a different icon library
- Duplicate shared types — import from `@reeltune/types`
- Put business logic in NestJS controllers
- Call Spotify/YouTube APIs from the mobile app directly
- Do sync operations synchronously (always use BullMQ)
- Design around only the Instagram share mechanism — always build fallbacks
- Make Spotify the source of truth for Song data
- Turn the app into a streaming service — it is a discovery/organization/sync layer only
