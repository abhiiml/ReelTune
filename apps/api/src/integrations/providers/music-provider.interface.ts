import type { Song } from '@reeltune/types';

export interface DestinationPlaylist {
  id: string;
  name: string;
  provider: string;
  isDefault?: boolean;
  songCount?: number;
  externalUrl?: string;
}

export type AddTrackStatus = 
  | 'ADDED' 
  | 'ALREADY_EXISTS' 
  | 'MATCH_FAILED' 
  | 'PROVIDER_NOT_CONNECTED' 
  | 'PLAYLIST_NOT_FOUND';

export interface AddTrackResult {
  status: AddTrackStatus;
  playlistId: string;
  playlistName: string;
  provider: string;
  externalTrackId?: string;
  externalTrackUrl?: string;
  message?: string;
}

export interface MusicProvider {
  readonly name: string;
  readonly displayName: string;

  isConnected(userId: string): Promise<boolean>;
  getPlaylists(userId: string): Promise<DestinationPlaylist[]>;
  searchAndAddTrack(
    userId: string,
    playlistId: string | null,
    song: Song,
  ): Promise<AddTrackResult>;
}
