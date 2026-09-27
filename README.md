# ReelTune 🎵

ReelTune is a modern music discovery, recognition, and playlist management application that seamlessly synchronizes with Spotify, YouTube Music, and Apple Music. Built with a heavy focus on premium aesthetics and responsive design, ReelTune provides users with an intuitive, unified interface to manage their favorite tracks across disparate music platforms.

## Core Features 🚀
- **Instagram Reel Ingestion (Core Differentiator):** Share an Instagram Reel directly to ReelTune. The app auto-extracts the audio, fingerprints it, and saves the identified song to your library in under 10 seconds.
- **AI-Powered Discovery:** Uses Gemini 2.5 Flash as a multimodal fallback for song identification and AI Mood Classification to automatically tag songs (Chill, Energy, Romantic) and suggest smart playlists.
- **Cross-Platform Syncing:** Keep your custom playlists perfectly synchronized across Spotify, YouTube Music, and Apple Music.
- **Social Features:** Follow friends, discover public playlists, and like your favorite curations with a sleek, Instagram-style profile system.
- **Shareable Web Previews:** Share playlists via public web links with rich metadata, album art, and deep links into the native app.
- **Rich Aesthetics:** Dark mode by default, glassmorphism UI, fluid micro-animations, and dynamic color extraction from album art.

## Tech Stack 🛠️
This is a modern monorepo built for scalability and strict type safety across all environments.

### Mobile App (`apps/mobile`)
- **Framework:** React Native + Expo + Expo Router
- **Styling:** NativeWind (Tailwind CSS v3)
- **State Management:** Zustand + TanStack Query
- **Typography:** Manrope (Google Fonts)

### Backend API (`apps/api`)
- **Framework:** NestJS
- **ORM:** Prisma 5
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (JWT)
- **Background Processing:** In-Memory Job Queue (Render Free Tier optimized)

### Web App (`apps/web`)
- **Framework:** Next.js 15
- **Styling:** Tailwind CSS + Lucide React

### Shared Packages
- **Types (`packages/types`):** Strictly typed entity interfaces (`User`, `Song`, `Playlist`) shared between mobile and API.
- **Config (`packages/config`):** Shared TypeScript and ESLint configurations.

## Architecture & Monorepo Setup
The project leverages `pnpm` workspaces for seamless package sharing.

### Quick Start
1. **Install dependencies:**
   ```bash
   pnpm install
   ```
2. **Setup environment:**
   Create an `apps/api/.env` file and fill in your Supabase connection strings, Spotify/YouTube Client IDs, Gemini API Key, AudD API Key, etc. (See `apps/api/.env.example` for details).
3. **Database Migration:**
   ```bash
   cd apps/api
   npx prisma generate
   npx prisma migrate dev
   pnpm run db:seed
   ```
4. **Run the Backend API:**
   ```bash
   cd apps/api
   pnpm run start:dev
   ```
5. **Run the Mobile App:**
   ```bash
   cd apps/mobile
   npx expo start
   ```
6. **Run the Web App:**
   ```bash
   cd apps/web
   pnpm run dev
   ```

## Development Progress
Check out `PROGRESS.md` for an up-to-date checklist of completed features and active development notes. `TASKS.md` contains the full breakdown of the MVP and future scopes.

---
*Built with ❤️ and strictly typed.*
