import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

interface CreatePlaylistVariables {
  name: string;
  description?: string;
  isPrivate?: boolean;
}

interface PlaylistResponse {
  id: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export function useCreatePlaylist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: CreatePlaylistVariables) =>
      fetchApi<PlaylistResponse>('/playlists', {
        method: 'POST',
        body: JSON.stringify(variables),
      }),
    onSuccess: () => {
      // Refresh the playlists list
      queryClient.invalidateQueries({ queryKey: ['playlists'] });
    },
  });
}
