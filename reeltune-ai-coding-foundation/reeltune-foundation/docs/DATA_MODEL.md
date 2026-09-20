# ReelTune Data Model

PostgreSQL is the source of truth. Prisma is the ORM. IDs are UUIDs unless a provider-specific ID is explicitly named.

## Entities

### User
- id UUID PK
- authUserId string UNIQUE
- email string nullable
- displayName string nullable
- createdAt timestamp
- updatedAt timestamp

### Song
Canonical platform-independent song.
- id UUID PK
- title string
- artists string[]
- albumName string nullable
- albumImageUrl string nullable
- durationMs int nullable
- isrc string nullable UNIQUE
- spotifyId string nullable UNIQUE
- youtubeId string nullable
- sourceUrl string nullable
- metadataConfidence decimal nullable
- createdAt timestamp
- updatedAt timestamp

### SavedSong
- id UUID PK
- userId FK -> User
- songId FK -> Song
- sourceType enum: INSTAGRAM_REEL, SEARCH, MANUAL, RECOGNITION, OTHER
- sourceUrl string nullable
- savedAt timestamp
- UNIQUE(userId, songId)

### Playlist
- id UUID PK
- userId FK -> User
- name string
- description string nullable
- coverImageUrl string nullable
- isPublic boolean default false
- createdAt timestamp
- updatedAt timestamp

### PlaylistSong
- id UUID PK
- playlistId FK -> Playlist
- songId FK -> Song
- position int
- addedAt timestamp
- UNIQUE(playlistId, songId)
- UNIQUE(playlistId, position)

### ConnectedAccount
- id UUID PK
- userId FK -> User
- provider enum: SPOTIFY, YOUTUBE
- providerUserId string
- accessTokenEncrypted string
- refreshTokenEncrypted string nullable
- expiresAt timestamp nullable
- scopes string[]
- createdAt timestamp
- updatedAt timestamp
- UNIQUE(userId, provider)

### RecognitionJob
- id UUID PK
- userId FK -> User
- sourceUrl string nullable
- sourceType enum
- status enum: QUEUED, PROCESSING, SUCCEEDED, LOW_CONFIDENCE, FAILED
- provider string nullable
- confidence decimal nullable
- errorCode string nullable
- createdAt timestamp
- completedAt timestamp nullable

### RecognitionCandidate
- id UUID PK
- jobId FK -> RecognitionJob
- songId FK -> Song nullable
- title string
- artist string nullable
- confidence decimal
- rank int

### SyncJob
- id UUID PK
- userId FK -> User
- playlistId FK -> Playlist
- provider enum: SPOTIFY, YOUTUBE
- status enum: QUEUED, PROCESSING, SUCCEEDED, PARTIAL, FAILED
- externalPlaylistId string nullable
- createdAt timestamp
- completedAt timestamp nullable

### SyncItem
- id UUID PK
- syncJobId FK -> SyncJob
- songId FK -> Song
- externalTrackId string nullable
- status enum: MATCHED, ADDED, SKIPPED, FAILED
- reason string nullable

## Relationships
User 1--N SavedSong N--1 Song
User 1--N Playlist 1--N PlaylistSong N--1 Song
User 1--N ConnectedAccount
User 1--N RecognitionJob 1--N RecognitionCandidate N--1 Song
User 1--N SyncJob 1--N SyncItem N--1 Song

## Invariants
- Internal Song.id is canonical.
- Saving a song is idempotent.
- Playlist positions are contiguous after reorder operations.
- Sync can be retried without duplicating external tracks when provider IDs are known.
- Provider tokens are encrypted at rest and never returned to clients.
