# ReelTune API Contracts

Base URL: `/api/v1`
Auth: `Authorization: Bearer <supabase-access-token>` for protected routes.
JSON responses use `{ data, error, meta }` envelopes.

## Standard errors
```json
{"data":null,"error":{"code":"SONG_NOT_FOUND","message":"Song not found"},"meta":{}}
```
Never expose provider tokens, internal stack traces, or secrets.

## Auth/user
GET `/me`
Response: `{ data: { id, email, displayName }, error: null, meta: {} }`

## Songs
GET `/songs/search?q=<query>&limit=20`
Response data: `{ items: SongSummary[], nextCursor: string|null }`

POST `/songs/:songId/save`
Body: `{ "sourceType":"INSTAGRAM_REEL", "sourceUrl":"https://..." }`
Response: `{ data: { saved: true, song: Song }, error:null, meta:{} }`

DELETE `/songs/:songId/save`
Response: `{ data: { saved:false }, error:null, meta:{} }`

GET `/songs/saved?cursor=<cursor>&limit=30`
Response data: `{ items: SavedSongView[], nextCursor: string|null }`

## Reel recognition
POST `/recognition/jobs`
Body:
```json
{"sourceType":"INSTAGRAM_REEL","sourceUrl":"https://www.instagram.com/reel/.../"}
```
Response: `{ data: { jobId, status:"QUEUED" }, error:null, meta:{} }`

GET `/recognition/jobs/:jobId`
Response data:
```json
{"jobId":"uuid","status":"SUCCEEDED","confidence":0.96,"song":Song|null,"candidates":[]}
```

## Playlists
POST `/playlists`
Body: `{ "name":"Late Night Reels", "description":"...", "isPublic":false }`
Response data: `Playlist`

GET `/playlists`
Response data: `{ items: Playlist[] }`

GET `/playlists/:playlistId`
Response data: `PlaylistDetail`

POST `/playlists/:playlistId/songs`
Body: `{ "songId":"uuid" }`
Response data: `PlaylistDetail`

DELETE `/playlists/:playlistId/songs/:songId`
Response data: `{ removed:true }`

PATCH `/playlists/:playlistId/songs/reorder`
Body: `{ "songIds":["uuid1","uuid2"] }`
Response data: `PlaylistDetail`

## Integrations
GET `/integrations`
Response data: `{ items:[{provider, connected, providerUserId}] }`

POST `/integrations/spotify/connect`
Starts/returns OAuth authorization URL. Client completes provider authorization.

DELETE `/integrations/spotify`
Disconnects account and invalidates stored credentials.

POST `/integrations/youtube/connect`
Same pattern for YouTube.

## Sync
POST `/playlists/:playlistId/sync`
Body: `{ "provider":"SPOTIFY" }`
Response data: `{ syncJobId, status:"QUEUED" }`

GET `/sync/:syncJobId`
Response data:
```json
{"syncJobId":"uuid","provider":"SPOTIFY","status":"PARTIAL","externalPlaylistId":"...","items":[{"songId":"uuid","status":"ADDED","externalTrackId":"...","reason":null}]}
```

## Authorization
- User can access only their own SavedSong, Playlist, RecognitionJob, ConnectedAccount, SyncJob.
- Admin-only routes, if later introduced, must use explicit `ADMIN` permission.
- Integration credentials are server-only.

## Idempotency
POST save and POST sync accept optional `Idempotency-Key` headers. Sync must not add the same provider track twice for one internal playlist unless the user explicitly requests a duplicate.

## Versioning
Breaking changes require `/api/v2`. Non-breaking additions must preserve existing response fields.
