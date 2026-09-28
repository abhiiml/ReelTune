import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IntegrationsService } from '../integrations.service.js';
import type { Song } from '@reeltune/types';
import type {
  MusicProvider,
  DestinationPlaylist,
  AddTrackResult,
} from './music-provider.interface.js';

@Injectable()
export class AppleMusicProvider implements MusicProvider {
  readonly name = 'apple-music';
  readonly displayName = 'Apple Music';
  private readonly logger = new Logger(AppleMusicProvider.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async isConnected(userId: string): Promise<boolean> {
    const account = await this.prisma.connectedAccount.findUnique({
      where: { userId_provider: { userId, provider: 'apple-music' } },
    });
    return !!account;
  }

  async getPlaylists(userId: string): Promise<DestinationPlaylist[]> {
    const connected = await this.isConnected(userId);
    if (!connected) return [];

    try {
      const userToken = await this.integrationsService.getDecryptedAppleMusicToken(userId);
      const devToken = process.env.APPLE_MUSIC_DEVELOPER_TOKEN;
      if (!devToken) return [];

      const res = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
        headers: {
          Authorization: `Bearer ${devToken}`,
          'Music-User-Token': userToken,
        },
      });

      if (!res.ok) return [];
      const data = await res.json();
      return (data.data || []).map((p: { id: string; attributes?: { name?: string } }) => ({
        id: p.id,
        name: p.attributes?.name || 'Apple Music Playlist',
        provider: this.name,
      }));
    } catch (e: unknown) {
      this.logger.error(`Failed to fetch Apple Music playlists: ${e instanceof Error ? e.message : 'Unknown'}`);
      return [];
    }
  }

  async searchAndAddTrack(
    userId: string,
    playlistId: string | null,
    song: Song,
  ): Promise<AddTrackResult> {
    const connected = await this.isConnected(userId);
    if (!connected) {
      return {
        status: 'PROVIDER_NOT_CONNECTED',
        playlistId: playlistId || '',
        playlistName: 'Apple Music',
        provider: this.name,
        message: 'Apple Music is not connected. Please connect Apple Music in Settings.',
      };
    }

    try {
      const userToken = await this.integrationsService.getDecryptedAppleMusicToken(userId);
      const devToken = process.env.APPLE_MUSIC_DEVELOPER_TOKEN;
      if (!devToken) {
        return {
          status: 'PROVIDER_NOT_CONNECTED',
          playlistId: playlistId || '',
          playlistName: 'Apple Music',
          provider: this.name,
          message: 'Apple Music developer token is missing on the server.',
        };
      }

      // 1. Search catalog for song
      const query = encodeURIComponent(`${song.title} ${song.artists[0] || ''}`);
      const searchRes = await fetch(
        `https://api.music.apple.com/v1/catalog/us/search?term=${query}&types=songs&limit=1`,
        {
          headers: {
            Authorization: `Bearer ${devToken}`,
          },
        },
      );

      if (!searchRes.ok) {
        return {
          status: 'MATCH_FAILED',
          playlistId: playlistId || '',
          playlistName: 'Apple Music',
          provider: this.name,
          message: `Could not search Apple Music catalog for "${song.title}"`,
        };
      }

      const searchData = await searchRes.json();
      const appleSong = searchData.results?.songs?.data?.[0];
      if (!appleSong) {
        return {
          status: 'MATCH_FAILED',
          playlistId: playlistId || '',
          playlistName: 'Apple Music',
          provider: this.name,
          message: `No matching track found on Apple Music for "${song.title}"`,
        };
      }

      // 2. Resolve Playlist
      let targetPlaylistId = playlistId;
      let targetPlaylistName = 'Reels Finds';

      if (!targetPlaylistId) {
        const playlists = await this.getPlaylists(userId);
        const existing = playlists.find((p) => p.name.toLowerCase() === 'reels finds');
        if (existing) {
          targetPlaylistId = existing.id;
          targetPlaylistName = existing.name;
        } else {
          // Create playlist
          const createRes = await fetch('https://api.music.apple.com/v1/me/library/playlists', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${devToken}`,
              'Music-User-Token': userToken,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              attributes: {
                name: 'Reels Finds',
                description: 'Auto-saved songs from ReelTune',
              },
            }),
          });
          if (createRes.ok) {
            const createData = await createRes.json();
            targetPlaylistId = createData.data?.[0]?.id;
            targetPlaylistName = 'Reels Finds';
          }
        }
      }

      if (!targetPlaylistId) {
        return {
          status: 'PLAYLIST_NOT_FOUND',
          playlistId: '',
          playlistName: 'Apple Music',
          provider: this.name,
          message: 'Could not create or find an Apple Music playlist.',
        };
      }

      // 3. Add to playlist
      const addRes = await fetch(
        `https://api.music.apple.com/v1/me/library/playlists/${targetPlaylistId}/tracks`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${devToken}`,
            'Music-User-Token': userToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: [{ id: appleSong.id, type: 'songs' }],
          }),
        },
      );

      if (!addRes.ok) {
        throw new Error('Failed to add track to Apple Music playlist');
      }

      return {
        status: 'ADDED',
        playlistId: targetPlaylistId,
        playlistName: targetPlaylistName,
        provider: this.name,
        externalTrackId: appleSong.id,
        message: `Added to ${targetPlaylistName}`,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add track to Apple Music';
      this.logger.error(`Apple Music error: ${msg}`);
      return {
        status: 'MATCH_FAILED',
        playlistId: playlistId || '',
        playlistName: 'Apple Music',
        provider: this.name,
        message: msg,
      };
    }
  }
}
