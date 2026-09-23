import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export interface IdentifyReelResponse {
  success: boolean;
  title?: string;
  artist?: string;
  confidence?: number;
  message?: string;
  songId?: string;
}

export function useIdentifyReel() {
  return useMutation({
    mutationFn: async (reelUrl: string) => {
      return fetchApi<IdentifyReelResponse>('/recognition/instagram', {
        method: 'POST',
        body: JSON.stringify({ reelUrl }),
      });
    },
  });
}
