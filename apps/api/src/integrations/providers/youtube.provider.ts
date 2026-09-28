import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { IntegrationsService } from '../integrations.service.js';
import type { Song } from '@reeltune/types';
import { google } from 'googleapis';
import type {
  MusicProvider,
  DestinationPlaylist,
  AddTrackResult,
} from './music-provider.interface.js';

@Injectable()
export class YouTubeProvider implements MusicProvider {
  readonly name = 'youtube';
  readonly displayName = 'YouTube';
  private readonly logger = new Logger(YouTubeProvider.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async isConnected(userId: string): Promise<boolean> {
    const account = await this.prisma.connectedAccount.findUnique({
      where: { userId_provider: { userId, provider: 'youtube' } },
    });
    return !!account;
  }

  private async getClient(userId: string) {
    const accessToken = await this.integrationsService.getDecryptedYouTubeToken(userId);
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.youtube({ version: 'v3', auth });
  }

  async getPlaylists(userId: string): Promise<DestinationPlaylist[]> {
    const connected = await this.isConnected(userId);
    if (!connected) return [];

    try {
      const youtube = await this.getClient(userId);
      const res = await youtube.playlists.list({
        part: ['snippet', 'contentDetails'],
        mine: true,
        maxResults: 50,
      });

      return (res.data.items || []).map((p) => ({
        id: p.id!,
        name: p.snippet?.title || 'YouTube Playlist',
        provider: this.name,
        songCount: p.contentDetails?.itemCount ?? 0,
        externalUrl: p.id ? `https://www.youtube.com/playlist?list=${p.id}` : undefined,
      }));
    } catch (e: unknown) {
      this.logger.error(`Error fetching YouTube playlists: ${e instanceof Error ? e.message : 'Unknown'}`);
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
        playlistName: 'YouTube',
        provider: this.name,
        message: 'YouTube is not connected. Please connect YouTube in Settings.',
      };
    }

    try {
      const youtube = await this.getClient(userId);

      // 1. Search YouTube for video
      let videoId = song.youtubeId;
      if (!videoId) {
        const query = `${song.title} ${song.artists[0] || ''} audio`;
        const searchRes = await youtube.search.list({
          part: ['id'],
          q: query,
          type: ['video'],
          maxResults: 1,
        });

        videoId = searchRes.data.items?.[0]?.id?.videoId || null;
        if (videoId) {
          await this.prisma.song.update({
            where: { id: song.id },
            data: { youtubeId: videoId },
          }).catch(() => {});
        }
      }

      if (!videoId) {
        return {
          status: 'MATCH_FAILED',
          playlistId: playlistId || '',
          playlistName: 'YouTube',
          provider: this.name,
          message: `Could not find a matching video on YouTube for "${song.title}"`,
        };
      }

      // 2. Resolve target Playlist
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
          const createRes = await youtube.playlists.insert({
            part: ['snippet', 'status'],
            requestBody: {
              snippet: {
                title: 'Reels Finds',
                description: 'Auto-saved songs from ReelTune',
              },
              status: {
                privacyStatus: 'private',
              },
            },
          });
          targetPlaylistId = createRes.data.id || null;
          targetPlaylistName = createRes.data.snippet?.title || 'Reels Finds';
        }
      }

      if (!targetPlaylistId) {
        return {
          status: 'PLAYLIST_NOT_FOUND',
          playlistId: '',
          playlistName: 'YouTube',
          provider: this.name,
          message: 'Could not create or find a YouTube playlist.',
        };
      }

      // 3. Add item
      await youtube.playlistItems.insert({
        part: ['snippet'],
        requestBody: {
          snippet: {
            playlistId: targetPlaylistId,
            resourceId: {
              kind: 'youtube#video',
              videoId,
            },
          },
        },
      });

      return {
        status: 'ADDED',
        playlistId: targetPlaylistId,
        playlistName: targetPlaylistName,
        provider: this.name,
        externalTrackId: videoId,
        externalTrackUrl: `https://www.youtube.com/watch?v=${videoId}`,
        message: `Added to ${targetPlaylistName}`,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add track to YouTube';
      this.logger.error(`YouTube error: ${msg}`);
      return {
        status: 'MATCH_FAILED',
        playlistId: playlistId || '',
        playlistName: 'YouTube',
        provider: this.name,
        message: msg,
      };
    }
  }
}
