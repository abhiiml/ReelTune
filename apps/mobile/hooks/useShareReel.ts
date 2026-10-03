import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../lib/api';

export interface ShareReelPayload {
  url: string;
  provider?: string;
  playlistId?: string;
}

export interface ShareReelResponse {
  success: boolean;
  status:
    | 'ADDED'
    | 'ALREADY_EXISTS'
    | 'RECOGNITION_FAILED'
    | 'INVALID_URL'
    | 'REEL_UNAVAILABLE'
    | 'MATCH_FAILED'
    | 'PROVIDER_NOT_CONNECTED'
    | 'PLAYLIST_NOT_FOUND';
  message: string;
  song?: {
    id: string;
    title: string;
    artists: string[];
    album: string;
    artwork: string;
    spotifyId?: string | null;
    youtubeId?: string | null;
  };
  destination?: {
    provider: string;
    providerDisplayName: string;
    playlistId: string;
    playlistName: string;
    externalTrackUrl?: string;
  };
  actions?: string[];
}

export function useShareReel() {
  return useMutation<ShareReelResponse, Error, ShareReelPayload>({
    mutationFn: async (payload: ShareReelPayload) => {
      return fetchApi<ShareReelResponse>('/share/reel', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  });
}
