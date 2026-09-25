-- CreateTable
CREATE TABLE "user" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "displayName" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "song" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artists" TEXT[],
    "album" TEXT NOT NULL,
    "artwork" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "isrc" TEXT,
    "spotifyId" TEXT,
    "youtubeId" TEXT,
    "metadata" JSONB,

    CONSTRAINT "song_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "savedSong" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "savedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "savedSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlist" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isPrivate" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "playlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "playlistSong" (
    "id" TEXT NOT NULL,
    "playlistId" TEXT NOT NULL,
    "songId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "playlistSong_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "connectedAccount" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT,
    "expiresAt" TIMESTAMP(3),
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "connectedAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "song_spotifyId_key" ON "song"("spotifyId");

-- CreateIndex
CREATE UNIQUE INDEX "song_youtubeId_key" ON "song"("youtubeId");

-- CreateIndex
CREATE UNIQUE INDEX "savedSong_userId_songId_key" ON "savedSong"("userId", "songId");

-- CreateIndex
CREATE UNIQUE INDEX "playlistSong_playlistId_songId_key" ON "playlistSong"("playlistId", "songId");

-- CreateIndex
CREATE UNIQUE INDEX "connectedAccount_userId_provider_key" ON "connectedAccount"("userId", "provider");

-- AddForeignKey
ALTER TABLE "savedSong" ADD CONSTRAINT "savedSong_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "savedSong" ADD CONSTRAINT "savedSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist" ADD CONSTRAINT "playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlistSong" ADD CONSTRAINT "playlistSong_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "playlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlistSong" ADD CONSTRAINT "playlistSong_songId_fkey" FOREIGN KEY ("songId") REFERENCES "song"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "connectedAccount" ADD CONSTRAINT "connectedAccount_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
