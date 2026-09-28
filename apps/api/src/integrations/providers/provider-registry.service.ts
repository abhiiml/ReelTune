import { Injectable } from '@nestjs/common';
import { MusicProvider } from './music-provider.interface.js';
import { ReelTuneProvider } from './reeltune.provider.js';
import { SpotifyProvider } from './spotify.provider.js';
import { AppleMusicProvider } from './apple-music.provider.js';
import { YouTubeProvider } from './youtube.provider.js';
import { JioSaavnProvider } from './jiosaavn.provider.js';

@Injectable()
export class ProviderRegistryService {
  private readonly providers: Map<string, MusicProvider> = new Map();

  constructor(
    private readonly reeltuneProvider: ReelTuneProvider,
    private readonly spotifyProvider: SpotifyProvider,
    private readonly appleMusicProvider: AppleMusicProvider,
    private readonly youtubeProvider: YouTubeProvider,
    private readonly jiosaavnProvider: JioSaavnProvider,
  ) {
    this.register(this.reeltuneProvider);
    this.register(this.spotifyProvider);
    this.register(this.appleMusicProvider);
    this.register(this.youtubeProvider);
    this.register(this.jiosaavnProvider);
  }

  private register(provider: MusicProvider) {
    this.providers.set(provider.name, provider);
  }

  getProvider(name: string): MusicProvider | undefined {
    return this.providers.get(name.toLowerCase());
  }

  getAllProviders(): MusicProvider[] {
    return Array.from(this.providers.values());
  }

  async getConnectedProviders(userId: string): Promise<MusicProvider[]> {
    const list: MusicProvider[] = [];
    for (const provider of this.providers.values()) {
      if (await provider.isConnected(userId)) {
        list.push(provider);
      }
    }
    return list;
  }
}
