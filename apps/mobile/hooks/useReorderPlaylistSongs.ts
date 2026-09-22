import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export function useReorderPlaylistSongs() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songIds }: { playlistId: string; songIds: string[] }) =>
      fetchApi<{ success: boolean }>(`/playlists/${playlistId}/reorder`, {
        method: 'PATCH',
        body: JSON.stringify({ songIds }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
    },
  });
}
