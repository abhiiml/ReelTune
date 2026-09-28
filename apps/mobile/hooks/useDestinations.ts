import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export interface DestinationPlaylistOption {
  id: string;
  name: string;
  provider: string;
  isDefault?: boolean;
  songCount?: number;
  externalUrl?: string;
}

export interface DestinationProviderOption {
  provider: string;
  displayName: string;
  isConnected: boolean;
  playlists: DestinationPlaylistOption[];
}

export interface DestinationPreference {
  provider: string;
  playlistId: string | null;
  playlistName: string | null;
}

export function useDestinationOptions() {
  return useQuery<DestinationProviderOption[]>({
    queryKey: ['destination-options'],
    queryFn: async () => {
      const res = await fetchApi<{ success: boolean; data: DestinationProviderOption[] }>(
        '/destinations/options',
      );
      return res.data || (res as unknown as DestinationProviderOption[]);
    },
  });
}

export function useDestinationPreferences() {
  return useQuery<DestinationPreference>({
    queryKey: ['destination-preferences'],
    queryFn: async () => {
      const res = await fetchApi<{ success: boolean; data: DestinationPreference }>(
        '/destinations/preferences',
      );
      return res.data || (res as unknown as DestinationPreference);
    },
  });
}

export function useUpdateDestinationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      provider: string;
      playlistId?: string | null;
      playlistName?: string | null;
    }) => {
      return fetchApi<{ success: boolean; data: DestinationPreference }>(
        '/destinations/preferences',
        {
          method: 'POST',
          body: JSON.stringify(payload),
        },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['destination-preferences'] });
      queryClient.invalidateQueries({ queryKey: ['destination-options'] });
    },
  });
}
