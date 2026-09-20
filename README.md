# ReelTune 🎵

ReelTune is a modern music discovery and playlist management application that seamlessly synchronizes with Spotify and YouTube. Built with a heavy focus on premium aesthetics and responsive design, ReelTune provides users with an intuitive, unified interface to manage their favorite tracks across disparate music platforms.

## Core Features 🚀
- **Unified Library:** Save and manage songs from both Spotify and YouTube in a single interface.
- **Cross-Platform Syncing:** Keep your custom playlists perfectly synchronized across external providers.
- **Music Recognition:** Identify songs playing around you (via AudD/ACRCloud) and instantly save them to your library.
- **Rich Aesthetics:** Dark mode by default, glassmorphism UI, fluid micro-animations, and dynamic color extraction from album art.

## Tech Stack 🛠️
This is a modern monorepo built for scalability and strict type safety across all environments.

### Mobile App (`apps/mobile`)
- **Framework:** React Native + Expo + Expo Router
- **Styling:** NativeWind (Tailwind CSS v3)
- **Typography:** Manrope (Google Fonts)

### Backend API (`apps/api`)
- **Framework:** NestJS
- **ORM:** Prisma 8 RC
- **Database:** PostgreSQL (Supabase)
- **Authentication:** Supabase Auth (JWT)

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
   Copy `.env.example` to `.env` and fill in your Supabase connection strings, Spotify Client IDs, etc.
   Copy `.env.example` to `apps/api/.env` for Prisma access.
3. **Database Migration:**
   ```bash
   cd apps/api
   npx prisma db migrate
   pnpm run seed
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

## Development Progress
Check out `PROGRESS.md` for an up-to-date checklist of completed features and active development notes.

---
*Built with ❤️ and strictly typed.*
