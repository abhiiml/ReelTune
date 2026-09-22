import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export function useRemoveSongFromPlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ playlistId, songId }: { playlistId: string; songId: string }) =>
      fetchApi<{ success: boolean }>(`/playlists/${playlistId}/songs/${songId}`, {
        method: 'DELETE',
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playlist', variables.playlistId] });
      queryClient.invalidateQueries({ queryKey: ['playlists'] }); // Updates counts
    },
  });
}
