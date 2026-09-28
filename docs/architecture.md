# ReelTune Architecture

ReelTune is designed as a scalable monorepo using pnpm workspaces. The system is split across three main applications (Mobile, Web, API) sharing core configuration and types.

## High-Level Architecture Diagram

```mermaid
graph TD
    %% Core Clients
    subgraph Clients["📱 User Interfaces"]
        Mobile["📱 Mobile App<br/>(React Native / Expo)"]
        Web["🌐 Web App<br/>(Next.js 15)"]
    end

    %% API Layer
    subgraph Backend["⚙️ Backend Services"]
        API["Node.js REST API<br/>(NestJS)"]
        Queue["In-Memory Background Job Queue<br/>(Zero-Dependency)"]
    end

    %% Data Layer
    subgraph Data["💾 Persistence Layer"]
        DB[(PostgreSQL)]
        Prisma["Prisma ORM"]
        Auth["Supabase Auth<br/>(JWT)"]
    end

    %% External Services
    subgraph External["🔌 External Providers"]
        Recognition["🎵 Recognition APIs<br/>(AudD.io / Gemini)"]
        MusicAPI["🎧 Music Platforms<br/>(Spotify, YouTube)"]
    end

    %% Connections
    Mobile -- "REST API / JWT" --> API
    Web -- "REST API / Public Links" --> API
    
    API -- "CRUD" --> Prisma
    Prisma -- "SQL" --> DB
    API -- "Verify JWT" --> Auth
    
    API -- "Extract & Fingerprint" --> Recognition
    API -- "Delegate" --> Queue
    Queue -- "Sync Playlists" --> MusicAPI
    
    %% Styling
    classDef client fill:#f9f9f9,stroke:#333,stroke-width:2px;
    classDef backend fill:#e1f5fe,stroke:#0288d1,stroke-width:2px;
    classDef data fill:#e8f5e9,stroke:#388e3c,stroke-width:2px;
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:2px;
    
    class Mobile,Web client;
    class API,Queue backend;
    class DB,Prisma,Auth data;
    class Recognition,MusicAPI external;
```

## Key Architectural Decisions

1. **Monorepo Structure (`pnpm`)**: Ensures the `packages/types` contract is strongly enforced across the database models, API controllers, and frontend clients. No stale types or disjointed API boundaries.
2. **In-Memory Queue**: To keep costs at $0 during the MVP/Hackathon phase, Redis and BullMQ were removed in favor of a robust in-memory background processor for music platform syncs.
3. **Database Security**: Supabase handles Auth, issuing JWTs. The API (`NestJS`) uses a custom `JwtAuthGuard` to verify these tokens before querying PostgreSQL via Prisma.
4. **Resilient Recognition**: `youtube-dl-exec` runs natively inside the Node environment (supported by Nixpacks in production) to extract raw media URLs. If AudD.io acoustic fingerprinting fails, it gracefully falls back to Google's Gemini 2.5 Flash for multimodal audio analysis.
