import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export interface Playlist {
  id: string;
  userId: string;
  name: string;
  description: string | null;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    songs: number;
  };
}

export function usePlaylists() {
  return useQuery<Playlist[]>({
    queryKey: ['playlists'],
    queryFn: () => fetchApi<Playlist[]>('/playlists'),
  });
}
