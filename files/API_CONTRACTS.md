# ReelTune — API Contracts

Base URL: `/api/v1`
Auth: `Authorization: Bearer <supabase_access_token>` on all routes marked 🔒

## Standard Envelopes

**Success**
```json
{ "success": true, "data": { ... } }
```

**Paginated**
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": { "page": 1, "limit": 20, "total": 247, "hasMore": true }
}
```

**Error** (never silently fail)
```json
{
  "success": false,
  "statusCode": 404,
  "error": "SONG_NOT_FOUND",
  "message": "This song couldn't be found.",
  "actions": ["SEARCH_MANUALLY", "SKIP"]
}
```
`actions` drives the recovery buttons in the UI. Every error must include at least one.

---

## AUTH

### POST /auth/register
```json
// Request
{ "email": "rahul@example.com", "password": "...", "name": "Rahul" }

// 201
{ "success": true, "data": {
  "user": { "id": "...", "email": "...", "name": "Rahul", "avatarUrl": null, "onboardingDone": false },
  "session": { "accessToken": "...", "refreshToken": "...", "expiresAt": 1758300000 }
}}
```

### POST /auth/login
```json
// Request
{ "email": "rahul@example.com", "password": "..." }
// 200 — same shape as register
```

### GET /auth/me 🔒
```json
// 200
{ "success": true, "data": {
  "id": "...", "email": "...", "name": "Rahul", "avatarUrl": null,
  "onboardingDone": true,
  "connectedServices": ["SPOTIFY"],
  "stats": { "songsSaved": 247, "playlists": 12, "favorites": 43 }
}}
```

### POST /auth/logout 🔒 → `{ "success": true, "data": { "loggedOut": true } }`

---

## SONGS

### GET /songs/search?q=&limit=20 🔒
```json
// 200
{ "success": true, "data": [
  {
    "id": "song_a1b2",
    "title": "Die With A Smile",
    "artists": ["Lady Gaga", "Bruno Mars"],
    "album": "Mayhem",
    "artworkUrl": "https://i.scdn.co/image/...",
    "durationMs": 251667,
    "isrc": "USUG12405639",
    "spotifyId": "2plbrEY59IikOBgBGLjaoe",
    "youtubeId": null,
    "isSaved": false
  }
]}
```
`isSaved` is computed per-user so the UI can show the save state immediately.

### GET /songs/:id 🔒
Returns the full song object plus:
```json
"releaseDate": "2024-08-16", "genre": "Pop",
"savedAt": "2026-09-18T14:22:00Z",
"inPlaylists": [{ "id": "pl_1", "name": "Road Trip" }]
```

### POST /songs/save 🔒
```json
// Request
{
  "songId": "song_a1b2",
  "source": "INSTAGRAM",
  "sourceUrl": "https://instagram.com/reel/abc123",
  "confidence": 0.96,
  "playlistId": "pl_1"
}

// 201 — new save
{ "success": true, "data": {
  "savedSongId": "ss_xyz", "alreadySaved": false,
  "song": { ... }, "addedToPlaylist": { "id": "pl_1", "name": "Road Trip" }
}}

// 200 — duplicate (NOT an error — show the "already saved" modal)
{ "success": true, "data": {
  "alreadySaved": true,
  "savedAt": "2026-08-01T10:00:00Z",
  "inPlaylists": [
    { "id": "pl_1", "name": "Reels Finds" },
    { "id": "pl_2", "name": "Gym" }
  ]
}}
```

### DELETE /songs/:id/save 🔒 → `{ "success": true, "data": { "removed": true } }`

### GET /users/me/songs?page=1&limit=20&sort=recent&favorites=true 🔒
`sort`: `recent` | `title` | `artist` | `lastPlayed`
Returns paginated saved songs, each with `savedSongId`, `source`, `isFavorite`, `savedAt` merged into the song object.

---

## RECOGNITION

### POST /recognition/instagram 🔒
```json
// Request
{ "reelUrl": "https://www.instagram.com/reel/C1a2b3c4/" }

// 200 — high confidence (>= 0.70)
{ "success": true, "data": {
  "identified": true,
  "confidence": 0.96,
  "method": "METADATA",              // METADATA | AUDIO_FINGERPRINT
  "song": { "id": "song_a1b2", "title": "...", "artists": [...], "artworkUrl": "...", "spotifyId": "..." },
  "candidates": []
}}

// 200 — low confidence (< 0.70) — show top 3
{ "success": true, "data": {
  "identified": false,
  "confidence": 0.62,
  "method": "AUDIO_FINGERPRINT",
  "song": null,
  "candidates": [
    { "song": { ... }, "confidence": 0.62 },
    { "song": { ... }, "confidence": 0.41 },
    { "song": { ... }, "confidence": 0.28 }
  ]
}}

// 200 — failed (NOT a 500 — this is an expected outcome)
{ "success": true, "data": {
  "identified": false, "confidence": 0, "song": null, "candidates": [],
  "message": "We couldn't identify this Reel's song.",
  "actions": ["TRY_AGAIN", "PASTE_URL", "SEARCH_MANUALLY"]
}}
```
Timeout: 15s hard limit. Return the failed shape above rather than hanging.

### POST /recognition/audio 🔒
`multipart/form-data` with `audio` file (max 15s, mp3/m4a/wav). Same response shape.

---

## PLAYLISTS

### GET /playlists 🔒
```json
{ "success": true, "data": [
  { "id": "pl_1", "name": "Reels Finds", "description": "...", "artworkUrl": null,
    "privacy": "PRIVATE", "isFavorite": true, "songCount": 32,
    "previewArtwork": ["url1", "url2", "url3", "url4"],
    "createdAt": "...", "updatedAt": "..." }
]}
```

### POST /playlists 🔒
```json
// Request — name required, max 50 chars; description max 200
{ "name": "Road Trip", "description": "Long drives", "privacy": "PRIVATE" }
// 201 → playlist object with songCount: 0
```

### GET /playlists/:id 🔒
Returns the playlist object plus `"songs": [ { ...song, "position": 0, "addedAt": "..." } ]`
and `"syncStatus": { "spotify": { "lastSyncedAt": "...", "externalUrl": "..." }, "youtube": null }`

### PATCH /playlists/:id 🔒 — any of `{ name, description, privacy, isFavorite }`
### DELETE /playlists/:id 🔒 → `{ "deleted": true }`

### POST /playlists/:id/songs 🔒
```json
// Request — position optional, defaults to end
{ "songId": "song_a1b2", "position": 0 }
// 201
{ "success": true, "data": { "added": true, "position": 0, "songCount": 33 } }
// 409 if already in playlist
{ "success": false, "statusCode": 409, "error": "SONG_ALREADY_IN_PLAYLIST",
  "message": "This song is already in Road Trip.", "actions": ["VIEW_PLAYLIST", "DISMISS"] }
```

### DELETE /playlists/:id/songs/:songId 🔒 → `{ "removed": true, "songCount": 32 }`

### PATCH /playlists/:id/reorder 🔒
```json
// Request — full ordered list of song IDs
{ "songIds": ["song_c", "song_a", "song_b"] }
// 200
{ "success": true, "data": { "reordered": true } }
```

---

## INTEGRATIONS

### GET /integrations 🔒
```json
{ "success": true, "data": {
  "spotify": { "connected": true, "displayName": "rahul_music", "connectedAt": "...", "expiresAt": "..." },
  "youtube": { "connected": false, "displayName": null }
}}
```
**Never** include `accessToken` or `refreshToken` in this response.

### GET /integrations/spotify/connect 🔒
`302` redirect to Spotify authorize URL.
Scopes: `playlist-modify-private playlist-modify-public playlist-read-private user-read-email`
Flow: Authorization Code with PKCE.

### GET /integrations/spotify/callback
Query: `?code=&state=`
Exchanges code, encrypts and stores tokens, then `302` → `reeltune://settings/spotify?connected=true`

### GET /integrations/youtube/connect 🔒
Scope: `https://www.googleapis.com/auth/youtube`

### GET /integrations/youtube/callback → `302` → `reeltune://settings/youtube?connected=true`

### DELETE /integrations/:provider 🔒 → `{ "disconnected": true }`
`provider`: `spotify` | `youtube`

---

## SYNC

### POST /playlists/:id/sync/spotify 🔒
```json
// Request — optional
{ "externalPlaylistId": null, "createNew": true }

// 202 Accepted — returns immediately, never blocks
{ "success": true, "data": {
  "jobId": "job_9f8e", "status": "QUEUED", "totalSongs": 32,
  "pollUrl": "/api/v1/sync/job_9f8e"
}}

// 400 if not connected
{ "success": false, "statusCode": 400, "error": "SPOTIFY_NOT_CONNECTED",
  "message": "Connect Spotify to sync this playlist.", "actions": ["CONNECT_SPOTIFY"] }
```

### POST /playlists/:id/sync/youtube 🔒 — identical shape

### GET /sync/:jobId 🔒
Poll every 2s while `PROCESSING`.
```json
// PROCESSING
{ "success": true, "data": {
  "jobId": "job_9f8e", "status": "PROCESSING", "provider": "SPOTIFY",
  "progress": { "processed": 18, "total": 32, "percent": 56 }
}}

// COMPLETED
{ "success": true, "data": {
  "jobId": "job_9f8e", "status": "COMPLETED", "provider": "SPOTIFY",
  "summary": { "total": 32, "matched": 29, "skipped": 2, "unavailable": 1 },
  "externalPlaylistUrl": "https://open.spotify.com/playlist/...",
  "results": [
    { "songId": "song_a", "title": "Die With A Smile", "status": "MATCHED", "confidence": 1.0, "externalId": "spotify:track:..." },
    { "songId": "song_b", "title": "Some B-side", "status": "SKIPPED", "confidence": 0.55, "reason": "Low match confidence" },
    { "songId": "song_c", "title": "Rare Remix", "status": "UNAVAILABLE", "reason": "Not available on Spotify" }
  ],
  "completedAt": "..."
}}

// FAILED
{ "success": true, "data": {
  "jobId": "job_9f8e", "status": "FAILED",
  "error": "Spotify token expired and refresh failed.",
  "actions": ["RECONNECT_SPOTIFY", "TRY_AGAIN"]
}}
```

### Sync matching algorithm (worker)
1. If `song.spotifyId` exists → use it directly, `confidence = 1.0`
2. Else if `song.isrc` exists → search Spotify by `isrc:<ISRC>`, `confidence = 1.0`
3. Else → search `track:<title> artist:<artist>`, score on title + artist + duration (±3s)
4. `confidence >= 0.80` → MATCHED (and backfill `spotifyId` on the Song record)
5. `0.50–0.79` → SKIPPED (surface for user review)
6. `< 0.50` or no results → UNAVAILABLE

---

## RATE LIMITS
| Endpoint group   | Limit            |
|------------------|------------------|
| `/auth/*`        | 10 / min / IP    |
| `/songs/search`  | 30 / min / user  |
| `/recognition/*` | 10 / min / user  |
| `/sync/*` (POST) | 5 / hour / user  |
| Everything else  | 100 / min / user |

Exceeded:
```json
{ "success": false, "statusCode": 429, "error": "RATE_LIMIT_EXCEEDED",
  "message": "Too many requests. Try again in 30 seconds.",
  "retryAfter": 30, "actions": ["TRY_AGAIN_LATER"] }
```

---

## DEEP LINKS
```
reeltune://save?url=<encoded_reel_url>   → Save screen, auto-identify
reeltune://song/:id                      → Song details
reeltune://playlist/:id                  → Playlist details
reeltune://settings/spotify?connected=true
reeltune://settings/youtube?connected=true
```
HTTPS equivalents (universal links): `https://reeltune.app/save?url=` etc.
