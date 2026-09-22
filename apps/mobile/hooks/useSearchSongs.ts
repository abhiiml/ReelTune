import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { Song } from '@reeltune/types';

export function useSearchSongs(query: string) {
  return useQuery<Song[]>({
    queryKey: ['searchSongs', query],
    queryFn: () => fetchApi<Song[]>(`/songs/search?q=${encodeURIComponent(query)}`),
    enabled: query.length > 0, // only fetch if query has text
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
