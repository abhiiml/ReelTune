import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

interface DestinationStoreState {
  activeProvider: string;
  activePlaylistId: string | null;
  activePlaylistName: string | null;
  isInitialized: boolean;
  setDestination: (provider: string, playlistId: string | null, playlistName: string | null) => Promise<void>;
  initialize: () => Promise<void>;
}

const PREF_KEY = 'reeltune_destination_pref';

export const useDestinationStore = create<DestinationStoreState>((set) => ({
  activeProvider: 'reeltune',
  activePlaylistId: null,
  activePlaylistName: 'Reels Finds',
  isInitialized: false,

  initialize: async () => {
    try {
      if (Platform.OS !== 'web') {
        const stored = await SecureStore.getItemAsync(PREF_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          set({
            activeProvider: parsed.provider || 'reeltune',
            activePlaylistId: parsed.playlistId || null,
            activePlaylistName: parsed.playlistName || 'Reels Finds',
            isInitialized: true,
          });
          return;
        }
      }
    } catch {
      // ignore
    }
    set({ isInitialized: true });
  },

  setDestination: async (provider, playlistId, playlistName) => {
    const data = { provider, playlistId, playlistName };
    set({
      activeProvider: provider,
      activePlaylistId: playlistId,
      activePlaylistName: playlistName,
    });
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.setItemAsync(PREF_KEY, JSON.stringify(data));
      }
    } catch {
      // ignore
    }
  },
}));
