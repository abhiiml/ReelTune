import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';
import { IntegrationsService } from '../integrations/integrations.service.js';
import { Logger } from '@nestjs/common';
import { google } from 'googleapis';

@Processor('sync-queue')
export class YoutubeSyncProcessor extends WorkerHost {
  private readonly logger = new Logger(YoutubeSyncProcessor.name);

  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
  ) {
    super();
  }

  async process(job: Job<{ userId: string; playlistId: string }, unknown, string>): Promise<unknown> {
    const { userId, playlistId } = job.data;
    // We only process if the job name is youtube-sync
    if (job.name !== 'youtube-sync') {
      return;
    }

    this.logger.log(`Processing sync for playlist ${playlistId} to YouTube`);

    try {
      // 1. Get decrypted token (handles refresh)
      const accessToken = await this.integrationsService.getDecryptedYouTubeToken(userId);

      // 2. Fetch the playlist and its songs
      const playlist = await this.prisma.playlist.findUnique({
        where: { id: playlistId },
        include: {
          songs: {
            include: { song: true },
            orderBy: { position: 'asc' }
          }
        }
      });

      if (!playlist) throw new Error('Playlist not found');

      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });
      const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

      // 3. Create YouTube Playlist
      const createRes = await youtube.playlists.insert({
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: playlist.name,
            description: playlist.description || 'Synced from ReelTune',
          },
          status: {
            privacyStatus: playlist.isPrivate ? 'private' : 'public',
          }
        }
      });

      const ytPlaylistId = createRes.data.id;
      if (!ytPlaylistId) {
        throw new Error('Failed to create YouTube playlist');
      }

      let matched = 0;
      const skipped = 0;
      let unavailable = 0;
      const trackVideoIds: string[] = [];

      await job.updateProgress(10); // created playlist

      const totalSongs = playlist.songs.length;

      // 4. Iterate and search/match songs
      for (let i = 0; i < totalSongs; i++) {
        const item = playlist.songs[i];
        const song = item.song;
        let ytVideoId: string | null = null;

        if (song.youtubeId) {
          ytVideoId = song.youtubeId;
        } else {
          // Search YouTube
          const query = `${song.title} ${song.artists[0] || ''}`;
          try {
            const searchRes = await youtube.search.list({
              part: ['id'],
              q: query,
              type: ['video'],
              videoCategoryId: '10', // Music
              maxResults: 1
            });
            
            const videoId = searchRes.data.items?.[0]?.id?.videoId;
            if (videoId) {
              ytVideoId = videoId;
              // update the db to cache it
              await this.prisma.song.update({
                where: { id: song.id },
                data: { youtubeId: videoId }
              });
            }
          } catch (e) {
            this.logger.warn(`Failed to search YouTube for ${query}`, e);
          }
        }

        if (ytVideoId) {
          trackVideoIds.push(ytVideoId);
          matched++;
        } else {
          unavailable++;
        }

        // update progress (from 10 to 90)
        await job.updateProgress(10 + Math.floor(((i + 1) / totalSongs) * 80));
      }

      // 5. Add tracks to playlist
      if (trackVideoIds.length > 0) {
        for (let i = 0; i < trackVideoIds.length; i++) {
          const videoId = trackVideoIds[i];
          try {
            await youtube.playlistItems.insert({
              part: ['snippet'],
              requestBody: {
                snippet: {
                  playlistId: ytPlaylistId,
                  resourceId: {
                    kind: 'youtube#video',
                    videoId: videoId
                  }
                }
              }
            });
          } catch (e) {
             this.logger.warn(`Failed to add video ${videoId} to playlist`, e);
          }
        }
      }

      await job.updateProgress(100);

      const result = {
        total: totalSongs,
        matched,
        skipped,
        unavailable,
        youtubePlaylistUrl: `https://music.youtube.com/playlist?list=${ytPlaylistId}`
      };

      this.logger.log(`Sync complete: ${JSON.stringify(result)}`);
      return result;

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Sync failed: ${msg}`, stack);
      throw error;
    }
  }
}
