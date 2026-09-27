import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import type { PlaylistSuggestion } from '@reeltune/types';

export function usePlaylistSuggestions() {
  return useQuery<PlaylistSuggestion[]>({
    queryKey: ['playlistSuggestions'],
    queryFn: () => fetchApi<PlaylistSuggestion[]>('/users/me/playlist-suggestions'),
  });
}
