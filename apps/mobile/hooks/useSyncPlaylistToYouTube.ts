import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export function useSyncPlaylistToYouTube() {
  return useMutation({
    mutationFn: async (playlistId: string) => {
      return fetchApi<{ jobId: string }>(`/playlists/${playlistId}/sync/youtube`, {
        method: 'POST'
      });
    },
  });
}
