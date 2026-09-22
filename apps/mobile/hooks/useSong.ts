import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';
import { Song } from '@reeltune/types';

export function useSong(id: string) {
  return useQuery<Song>({
    queryKey: ['song', id],
    queryFn: () => fetchApi<Song>(`/songs/${id}`),
    enabled: !!id,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
