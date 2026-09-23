import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export interface SyncStatusResponse {
  id: string;
  state: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'prioritized' | 'unknown';
  progress: number;
  result?: {
    total: number;
    matched: number;
    skipped: number;
    unavailable: number;
    spotifyPlaylistUrl?: string;
  };
  failedReason?: string;
}

export function useSyncStatus(jobId: string | null) {
  return useQuery({
    queryKey: ['sync-status', jobId],
    queryFn: async () => {
      if (!jobId) throw new Error('No jobId provided');
      return fetchApi<SyncStatusResponse>(`/sync/${jobId}`);
    },
    enabled: !!jobId,
    refetchInterval: (query) => {
      const data = query.state.data as SyncStatusResponse | undefined;
      if (!data) return 2000;
      if (data.state === 'completed' || data.state === 'failed') return false;
      return 2000;
    },
  });
}
