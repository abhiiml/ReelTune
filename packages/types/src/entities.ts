export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Song {
  id: string; // ReelTune internal ID
  title: string;
  artists: string[];
  album: string;
  artwork: string; // URL
  duration: number; // in milliseconds
  isrc: string | null;
  spotifyId: string | null;
  youtubeId: string | null;
  metadata: Record<string, any>; // JSON
}

export interface SavedSong {
  id: string;
  userId: string;
  songId: string;
  savedAt: Date;
  song?: Song; // Populated via join
}

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
  songs?: PlaylistSong[];
}

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  position: number;
  addedAt: Date;
  song?: Song;
}

export interface ConnectedAccount {
  id: string;
  userId: string;
  provider: 'spotify' | 'youtube';
  providerAccountId: string;
  accessToken: string; // Encrypted in DB
  refreshToken: string | null; // Encrypted in DB
  expiresAt: Date | null;
  connectedAt: Date;
}
