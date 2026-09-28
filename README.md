<div align="center">
  <h1>🎵 ReelTune</h1>
  <p><b>Discover it on Reels. Save it. Play it anywhere.</b></p>
  <p>
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React Native" />
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
    <img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  </p>
</div>

ReelTune is a modern music discovery and playlist organization ecosystem. It solves a specific modern problem: discovering an incredible song in the background of an Instagram Reel, and having an effortless way to identify it, save it, and push it directly to your primary music streaming platform (Spotify, YouTube Music, or Apple Music).

Built as a scalable full-stack monorepo, ReelTune provides users with an intuitive, unified interface to manage their favorite tracks across disparate music platforms.

---

## 📌 Table of Contents
- [Overview](#-overview)
- [Feature Map](#-feature-map)
- [How It Works](#-how-it-works)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Security](#-security)
- [Limitations & Current Status](#-limitations--current-status)
- [Documentation & Assets](#-documentation--assets)

---

## ✨ Overview

Have you ever found a song on an Instagram Reel but didn't want to break your scrolling flow to open Shazam, manually search for it on Spotify, and add it to your playlist? 

ReelTune streamlines this:
1. Copy the Reel URL and paste it into ReelTune (or use the iOS Share Extension).
2. The backend extracts the media, fingerprints the audio, and identifies the exact track.
3. It securely syncs the recognized song straight into your Spotify, YouTube, or Apple Music playlist.

---

## 🚀 Feature Map

| Feature | Status | Details |
|---|:---:|---|
| **Authentication** | ✅ | Secure JWT-based auth backed by Supabase |
| **Song Recognition** | ✅ | Identifies audio from Instagram Reel URLs |
| **AI Fallback** | ✅ | Multimodal Gemini 2.5 Flash analysis if fingerprinting fails |
| **Song Library & Playlists** | ✅ | Manage an internal database of saved songs and custom curations |
| **AI Mood Classification** | ✅ | Auto-tags saved songs (e.g., Chill, Energy) silently |
| **Smart Playlists** | ✅ | 1-tap playlist creation based on AI tags |
| **Shareable Web Previews** | ✅ | Public URLs via Next.js with rich metadata |
| **Social Features** | ✅ | Follow friends, public profiles, and like playlists |
| **Spotify Integration** | ✅ | Full OAuth + Background playlist synchronization |
| **YouTube Integration** | ✅ | Full OAuth + Background playlist synchronization |
| **Apple Music** | 🚧 | Functional sync, but token generation is manual (due to Expo limits) |
| **JioSaavn** | 🛑 | Architectural scaffolded only (no public developer API available) |

---

## 🔄 How It Works

*(See [docs/user-flow.md](./docs/user-flow.md) for the detailed sequence diagram).*

1. **Ingestion**: A user shares an Instagram Reel URL to the app.
2. **Extraction**: The backend utilizes `youtube-dl-exec` natively to extract the raw media stream.
3. **Recognition**: The audio is piped into AudD.io for acoustic fingerprinting. If it fails, the audio buffer is passed to Gemini 2.5 Flash for multimodal identification.
4. **Enrichment**: The title and artist are queried against Spotify's catalog to fetch canonical album art and metadata.
5. **Organization**: The user saves it to their library where an AI worker tags the mood.
6. **Synchronization**: The user adds it to a ReelTune playlist and triggers a background sync to push it to their connected external accounts.

---

## 🏗 Architecture

*(See [docs/architecture.md](./docs/architecture.md) for the full architecture diagram).*

ReelTune uses a robust **$0 MVP Architecture** optimized for free-tier deployments:
- **Clients**: React Native (Mobile) and Next.js (Web Preview) communicate via a typed REST API.
- **Backend**: NestJS orchestrates business logic, OAuth handshakes, and Background Syncing using a custom in-memory queue (eschewing Redis to save deployment costs).
- **Data Layer**: Prisma ORM connects to a PostgreSQL database hosted on Supabase, enforcing strict referential integrity.
- **Auth**: Supabase Auth issues JWTs which the API cryptographically validates.

---

## 📂 Project Structure

This project is a `pnpm` monorepo.

```
reeltune/
├── apps/
│   ├── api/            # NestJS backend (REST API, integrations, queue)
│   ├── mobile/         # React Native / Expo app (iOS & Android)
│   └── web/            # Next.js 15 Web App (Playlist sharing, landing page)
├── packages/
│   ├── config/         # Shared ESLint, TS configs
│   └── types/          # Core entity interfaces shared across all apps
├── docs/               # Architecture diagrams (Mermaid)
├── package.json        # Root workspace configuration
├── PROGRESS.md         # Detailed milestone tracking
└── TASKS.md            # Extensive historical task breakdown
```

---

## 💻 Tech Stack

**Frontend**
- React Native & Expo (Mobile)
- Next.js 15 (Web)
- NativeWind (Tailwind CSS)
- Zustand (State) & TanStack Query (Data fetching)

**Backend**
- NestJS (Node.js framework)
- TypeScript (Strict typing)

**Data & Infrastructure**
- PostgreSQL (via Supabase)
- Prisma (ORM)
- Render (API Deployment using Nixpacks)

**AI & Third-Party APIs**
- AudD.io (Acoustic Fingerprinting)
- Google Gemini 2.5 Flash (Multimodal Fallback & Mood Classification)
- Spotify API & YouTube Data API v3

---

## 🛠 Getting Started

### Prerequisites
- Node.js `v18+`
- `pnpm` (`v9.12+`)
- PostgreSQL database (local or Supabase)

### 1. Installation
Clone the repository and install all workspace dependencies:
```bash
git clone https://github.com/abhiiml/ReelTune.git
cd ReelTune
pnpm install
```

### 2. Database Setup
```bash
cd apps/api
# Push the Prisma schema to your database
npx prisma db push
# Populate with initial test data
pnpm run db:seed
```

### 3. Running Locally

You can run individual workspaces, or start everything at once from the root:
```bash
# Start all apps concurrently
pnpm run dev
```

**Or individually:**
- **API**: `cd apps/api && pnpm run start:dev` (runs on port 3000)
- **Web**: `cd apps/web && pnpm run dev` (runs on port 3001)
- **Mobile**: `cd apps/mobile && npx expo start` (opens Expo Metro Bundler)

---

## 🔐 Environment Variables

Never commit your `.env` files. You must create an `apps/api/.env` file. See `apps/api/.env.example` for reference.

**Required:**
- `DATABASE_URL`: PostgreSQL connection string.
- `DIRECT_URL`: Direct database connection for Prisma migrations.
- `SUPABASE_URL` / `SUPABASE_ANON_KEY`: For authentication.
- `TOKEN_ENCRYPTION_KEY`: 32-character string to encrypt third-party OAuth tokens.

**Optional (Required for full feature set):**
- `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`
- `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET`
- `AUDD_API_KEY`: For audio fingerprinting.
- `GEMINI_API_KEY`: For AI mood tagging and fallback recognition.

---

## 🛡 Security

- **JWT Authentication**: All protected API endpoints use a NestJS Guard that verifies Supabase JWTs.
- **Row-Level Operations**: Controllers rigorously check ownership (e.g., `where: { id: playlistId, userId: req.user.id }`) before mutating data.
- **Encrypted Tokens**: Sensitive OAuth tokens for Spotify and YouTube are encrypted at rest using `TOKEN_ENCRYPTION_KEY` via standard Node `crypto` AES-256-GCM.
- **Safe Exposure**: Public endpoints (like `/api/v1/playlists/public/:id`) explicitly block access if the resource is marked `isPrivate: true`.

---

## ⚠️ Limitations & Current Status

This repository is currently a highly functional MVP with certain boundaries:
- **Instagram Extraction**: Reel extraction relies on `youtube-dl-exec`. If Instagram updates its unauthenticated routing rules, extraction may intermittently fail or require rotating proxies.
- **Apple Music**: Native Expo lacks built-in MusicKit token generators without custom native code. The mobile app currently requires manual user-token entry for Apple Music sync.
- **JioSaavn**: Scaffolded for future use, but currently disabled as JioSaavn does not offer a public developer API.
- **Background Jobs**: Render Free Tier utilizes volatile memory. Long-running syncs (e.g., 500+ songs) might be dropped if the dyno spins down.

---

## 📚 Documentation & Assets

Check the `/docs` directory for maintainable Mermaid diagrams describing the core logic:
- [Architecture Diagram](./docs/architecture.md)
- [Data Flow Diagram](./docs/data-flow.md)
- [User Journey Flow](./docs/user-flow.md)

*Note: UI Mockups and Screenshots will be added in a future documentation pass.*

---
<div align="center">
  <i>Built with strict typing, clean architecture, and a passion for music.</i>
</div>
