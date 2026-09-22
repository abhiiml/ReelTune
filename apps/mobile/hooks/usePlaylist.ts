import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import type { Playlist } from './usePlaylists';
import type { Song } from '@reeltune/types';

export interface PlaylistSong {
  id: string;
  playlistId: string;
  songId: string;
  position: number;
  addedAt: string;
  song: Song;
}

export interface PlaylistWithSongs extends Playlist {
  songs: PlaylistSong[];
}

export function usePlaylist(id: string) {
  return useQuery<PlaylistWithSongs>({
    queryKey: ['playlist', id],
    queryFn: () => fetchApi<PlaylistWithSongs>(`/playlists/${id}`),
    enabled: !!id,
  });
}
