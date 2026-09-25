# ReelTune Deployment Architecture

This document describes the $0 production architecture for ReelTune.

## Target Architecture
* **Frontend**: Expo Mobile App (TestFlight/Play Console)
* **Backend API**: Render Free Web Service (NestJS API)
* **Database**: Supabase PostgreSQL (Managed Free Tier)
* **Storage/Auth**: Supabase Storage & Auth (Managed Free Tier)
* **Background Jobs**: In-Memory Queue Service (Replaces Redis/BullMQ to comply with Render Free limitations)

## Backend (Render Free Web Service)
The NestJS API is designed to deploy seamlessly on Render's Free tier using the monorepo structure.

### Render Configuration
Create a new **Web Service** on Render connected to your GitHub repository and configure the following:

* **Build Command**: 
  ```bash
  pnpm install --frozen-lockfile && pnpm --filter api run db:generate && pnpm --filter api run build
  ```
* **Start Command**:
  ```bash
  pnpm --filter api exec prisma migrate deploy && pnpm --filter api run start:prod
  ```
* **Root Directory**: Leave blank (monorepo root).
* **Environment Variables**: Configure the variables exactly as listed in `apps/api/.env.example`.

### Important Limitations (In-Memory Queue)
Because the background jobs (like Spotify/YouTube Sync) have been migrated to an in-memory queue to eliminate the Redis requirement, please note the following:
* **Volatility**: Active background sync jobs will be lost if the Render instance restarts, sleeps due to inactivity, or redeploys mid-job.
* **Durability**: This is acceptable for the current MVP. The client simply polls and timeouts, and users can safely retry a sync.
* **Future Scaling**: BullMQ and Redis can be restored later using the exact same public Sync API without any changes required on the mobile app.

## Database Migrations (Supabase)
The project now strictly uses Prisma 5 (not Prisma 8 RC).
* Migrations are tracked in `apps/api/prisma/migrations`.
* The production baseline has been established via `prisma migrate diff` + `resolve`.
* Render will automatically execute `prisma migrate deploy` on every startup, safely synchronizing schema changes to Supabase without data loss.

## Mobile (Expo EAS)
Before initiating Expo Application Services (EAS) builds, ensure that the API is fully deployed to Render and that the `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` is updated to point to the live Render domain (e.g., `https://your-reeltune-api.onrender.com`). The mobile `lib/api.ts` file will automatically append `/api/v1`.
