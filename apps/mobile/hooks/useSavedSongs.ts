import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import type { Song } from '@reeltune/types';

interface SavedSongRecord {
  id: string;
  userId: string;
  songId: string;
  savedAt: string;
  song: Song;
}

interface SavedSongsResponse {
  value: SavedSongRecord[];
  totalCount: number;
}

export function useSavedSongs() {
  return useQuery<SavedSongsResponse>({
    queryKey: ['savedSongs'],
    queryFn: () => fetchApi<SavedSongsResponse>('/users/me/songs'),
  });
}
