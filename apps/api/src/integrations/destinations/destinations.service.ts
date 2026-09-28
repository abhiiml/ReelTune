import { Injectable, Logger } from '@nestjs/common';
import { ProviderRegistryService } from '../providers/provider-registry.service.js';
import { PrismaService } from '../../prisma/prisma.service.js';

export interface UserDestinationPref {
  provider: string;
  playlistId: string | null;
  playlistName: string | null;
}

@Injectable()
export class DestinationsService {
  private readonly logger = new Logger(DestinationsService.name);
  // In-memory fallback map for preferences per user to ensure seamless operation without database locks
  private readonly userPreferences = new Map<string, UserDestinationPref>();

  constructor(
    private readonly providerRegistry: ProviderRegistryService,
    private readonly prisma: PrismaService,
  ) {}

  async getDestinationOptions(userId: string) {
    const providers = this.providerRegistry.getAllProviders();
    const options = await Promise.all(
      providers.map(async (p) => {
        const isConnected = await p.isConnected(userId);
        const playlists = isConnected ? await p.getPlaylists(userId) : [];
        return {
          provider: p.name,
          displayName: p.displayName,
          isConnected,
          playlists,
        };
      }),
    );

    return options;
  }

  async getPreferences(userId: string): Promise<UserDestinationPref> {
    // 1. Check in-memory state
    if (this.userPreferences.has(userId)) {
      const pref = this.userPreferences.get(userId)!;
      // Validate provider is still connected
      const provider = this.providerRegistry.getProvider(pref.provider);
      if (provider && (await provider.isConnected(userId))) {
        return pref;
      }
    }

    // 2. Default: ReelTune provider
    const reeltune = this.providerRegistry.getProvider('reeltune');
    const playlists = reeltune ? await reeltune.getPlaylists(userId) : [];
    const defaultPl = playlists[0];

    const defaultPref: UserDestinationPref = {
      provider: 'reeltune',
      playlistId: defaultPl?.id || null,
      playlistName: defaultPl?.name || 'Reels Finds',
    };

    this.userPreferences.set(userId, defaultPref);
    return defaultPref;
  }

  async updatePreferences(
    userId: string,
    dto: { provider: string; playlistId?: string | null; playlistName?: string | null },
  ): Promise<UserDestinationPref> {
    const provider = this.providerRegistry.getProvider(dto.provider);
    if (!provider) {
      throw new Error(`Invalid provider: ${dto.provider}`);
    }

    const isConnected = await provider.isConnected(userId);
    if (!isConnected) {
      throw new Error(`Provider "${provider.displayName}" is not connected.`);
    }

    let playlistName = dto.playlistName || null;
    if (dto.playlistId && !playlistName) {
      const playlists = await provider.getPlaylists(userId);
      const match = playlists.find((p) => p.id === dto.playlistId);
      if (match) playlistName = match.name;
    }

    const updated: UserDestinationPref = {
      provider: dto.provider.toLowerCase(),
      playlistId: dto.playlistId || null,
      playlistName: playlistName || 'Default Playlist',
    };

    this.userPreferences.set(userId, updated);
    this.logger.log(`Updated destination preference for user ${userId}: ${JSON.stringify(updated)}`);

    return updated;
  }
}
