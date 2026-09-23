import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export function useSyncPlaylistToSpotify() {
  return useMutation({
    mutationFn: async (playlistId: string) => {
      return fetchApi<{ jobId: string }>(`/playlists/${playlistId}/sync/spotify`, {
        method: 'POST'
      });
    },
  });
}
