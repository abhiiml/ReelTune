# Environment & Secrets

## .env.example
```env
NODE_ENV=development
API_PORT=3000
WEB_URL=http://localhost:3001
MOBILE_SCHEME=reeltune
DATABASE_URL=
DIRECT_DATABASE_URL=
REDIS_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=
TOKEN_ENCRYPTION_KEY=
SENTRY_DSN=
POSTHOG_API_KEY=
RECOGNITION_API_URL=
RECOGNITION_API_KEY=
```

## Rules
- Local secrets live in `.env.local`/`.env`, never Git.
- Production secrets live in the deployment secret manager.
- Client apps receive only public configuration.
- Spotify/YouTube client secrets and token encryption keys are server-only.
- Rotate compromised credentials immediately.
