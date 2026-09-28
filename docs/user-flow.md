# ReelTune User Journey

This diagram explains the core lifecycle of a song being identified from an Instagram Reel, saved, and eventually synced to an external music library.

## Recognition & Sync Journey

```mermaid
sequenceDiagram
    autonumber
    
    actor User
    participant Mobile as Mobile App
    participant API as NestJS API
    participant Extractor as Media Extractor
    participant Recog as AudD / Gemini
    participant DB as Database
    participant Spotify as Music Platform

    User->>Mobile: Shares Instagram Reel URL
    Mobile->>API: POST /api/v1/recognition/instagram
    
    API->>Extractor: Extract raw audio/video URL
    Extractor-->>API: Stream URL
    
    API->>Recog: Fingerprint / AI Analysis
    Recog-->>API: Match: Title & Artist
    
    API->>Spotify: Metadata Search (OAuth)
    Spotify-->>API: Canonical Metadata & Album Art
    
    API-->>Mobile: Identification Result
    
    User->>Mobile: Tap "Save"
    Mobile->>API: POST /api/v1/songs/save
    API->>DB: Save Song + Tag AI Mood
    API-->>Mobile: Success
    
    User->>Mobile: Tap "Sync Playlist to Spotify"
    Mobile->>API: POST /api/v1/playlists/{id}/sync
    API->>API: Queue Background Job
    API-->>Mobile: Sync Started
    
    API->>Spotify: Bulk Add Tracks to User Library
    Spotify-->>API: Sync Complete
```

## Smart Features
Along with the standard flow, ReelTune implements passive features like **AI Mood Classification** during the save process, and **Smart Playlist Suggestions** that group similarly tagged songs.
