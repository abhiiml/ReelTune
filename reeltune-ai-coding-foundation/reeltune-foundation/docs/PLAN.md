# ReelTune Implementation Plan

Each task should be independently testable and normally fit in 30-60 minutes. Do not start the next task until the current task passes its acceptance criteria.

## Phase 0 — Foundation
- [ ] T001 Monorepo + pnpm workspaces
  - Done when apps/mobile, apps/web, apps/api and packages exist and install succeeds.
- [ ] T002 TypeScript/ESLint/Prettier strict baseline
  - Done when lint and typecheck pass from a clean install.
- [ ] T003 Environment/secrets baseline
  - Done when .env.example exists, .gitignore blocks secrets, and app startup validates required env.
- [ ] T004 CI baseline
  - Done when CI runs install, lint, typecheck, and tests on every PR.
- [ ] T005 Hello-world deployments
  - Done when API health endpoint and web/mobile preview can be built/deployed.

## Phase 1 — Auth
- [ ] T010 Supabase auth integration
- [ ] T011 API auth guard + user provisioning
- [ ] T012 Login/logout/session refresh UI
- [ ] T013 Auth tests

## Phase 2 — Songs
- [ ] T020 Song database schema + migration
- [ ] T021 Search songs endpoint
- [ ] T022 Save/unsave song endpoint
- [ ] T023 Saved songs mobile library
- [ ] T024 Duplicate detection
- [ ] T025 Song tests

## Phase 3 — Playlists
- [ ] T030 Playlist schema + CRUD
- [ ] T031 Add/remove/reorder playlist songs
- [ ] T032 Playlist UI
- [ ] T033 Playlist tests

## Phase 4 — Reel ingestion + recognition
- [ ] T040 Share/URL ingestion contract
- [ ] T041 Reel metadata extraction adapter (supported sources only)
- [ ] T042 Recognition provider interface
- [ ] T043 Recognition worker + confidence scoring
- [ ] T044 Candidate selection UI for low confidence
- [ ] T045 Recognition tests with mocked provider

## Phase 5 — Spotify
- [ ] T050 Spotify OAuth with PKCE-compatible flow
- [ ] T051 Connected account/token lifecycle
- [ ] T052 Spotify track matching
- [ ] T053 Create playlist on Spotify
- [ ] T054 Add tracks to Spotify playlist
- [ ] T055 Sync result UI + per-track failures
- [ ] T056 Spotify integration tests with mocks

## Phase 6 — YouTube
- [ ] T060 YouTube OAuth
- [ ] T061 YouTube track matching
- [ ] T062 Create playlist
- [ ] T063 Add playlist items
- [ ] T064 Sync result UI

## Phase 7 — Product polish
- [ ] T070 Home + Save From Reel flow
- [ ] T071 Search + song detail
- [ ] T072 Library + playlist polish
- [ ] T073 Empty/loading/error states
- [ ] T074 Analytics events
- [ ] T075 Sentry/error monitoring
- [ ] T076 Performance pass
- [ ] T077 Privacy/account deletion/disconnect flows

## Phase 8 — Release
- [ ] T080 Security review
- [ ] T081 API rate-limit review
- [ ] T082 Migration/backup procedure
- [ ] T083 Production environment setup
- [ ] T084 Mobile production build
- [ ] T085 Release smoke test

## Task format for AI sessions
Before coding: identify task ID, affected files, dependencies, acceptance tests, and risks.
After coding: summarize files changed, tests run, known limitations, and next task. Never mark done if acceptance criteria are not verified.
