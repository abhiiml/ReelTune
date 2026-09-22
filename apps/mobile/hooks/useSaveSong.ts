import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

interface SaveSongResponse {
  alreadySaved: boolean;
  playlists?: unknown[];
  savedSong?: unknown;
}

export function useSaveSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) =>
      fetchApi<SaveSongResponse>('/songs/save', {
        method: 'POST',
        body: JSON.stringify({ songId }),
      }),
    onSuccess: (data, variables) => {
      // Invalidate queries so that the library refreshes
      queryClient.invalidateQueries({ queryKey: ['savedSongs'] });
      // If we had a query for the specific song's saved status, we would invalidate it here
    },
  });
}
