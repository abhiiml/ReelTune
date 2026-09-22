import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export function useUnsaveSong() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (songId: string) =>
      fetchApi<{ success: boolean }>(`/songs/${songId}/save`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      // Refresh the library list
      queryClient.invalidateQueries({ queryKey: ['savedSongs'] });
    },
  });
}
