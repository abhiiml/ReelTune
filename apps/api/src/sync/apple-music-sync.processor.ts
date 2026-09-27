import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { IntegrationsService } from '../integrations/integrations.service.js';
import { JobQueueService } from './job-queue.service.js';

@Injectable()
export class AppleMusicSyncProcessor {
  private readonly logger = new Logger(AppleMusicSyncProcessor.name);

  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
    private jobQueue: JobQueueService,
  ) {}

  async process(jobId: string, data: { userId: string; playlistId: string }): Promise<void> {
    const { userId, playlistId } = data;
    this.logger.log(`Processing sync for playlist ${playlistId} to Apple Music (Job: ${jobId})`);
    
    this.jobQueue.markActive(jobId);

    try {
      const developerToken = process.env.APPLE_MUSIC_DEVELOPER_TOKEN;
      if (!developerToken) {
        throw new Error('Apple Music integration is not configured on the server.');
      }

      // 1. Get decrypted user token
      const musicUserToken = await this.integrationsService.getDecryptedAppleMusicToken(userId);

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

      // 3. Create Apple Music Playlist
      // Fetch storefront first
      const storefrontRes = await fetch('https://api.music.apple.com/v1/me/storefront', {
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'Music-User-Token': musicUserToken
        }
      });
      if (!storefrontRes.ok) throw new Error('Failed to get Apple Music storefront');
      const storefrontData = await storefrontRes.json();
      const storefront = storefrontData.data[0]?.id || 'us';

      const createRes = await fetch(`https://api.music.apple.com/v1/me/library/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${developerToken}`,
          'Music-User-Token': musicUserToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attributes: {
            name: playlist.name,
            description: playlist.description || 'Synced from ReelTune',
          }
        })
      });
      
      if (!createRes.ok) throw new Error('Failed to create Apple Music playlist');
      const applePlaylist = await createRes.json();
      const applePlaylistId = applePlaylist.data[0].id;

      let matched = 0;
      const skipped = 0;
      let unavailable = 0;
      const trackIds: string[] = [];

      this.jobQueue.updateProgress(jobId, 10); // created playlist

      const totalSongs = playlist.songs.length;

      // 4. Iterate and search/match songs
      for (let i = 0; i < totalSongs; i++) {
        const item = playlist.songs[i];
        const song = item.song;
        let appleMusicId: string | null = null;

        // Note: We don't cache appleMusicId yet on Song model, so we search by ISRC or title+artist
        // For Apple Music, ISRC search is highly accurate
        if (song.isrc) {
          const searchRes = await fetch(`https://api.music.apple.com/v1/catalog/${storefront}/songs?filter[isrc]=${song.isrc}`, {
            headers: { Authorization: `Bearer ${developerToken}` }
          });
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const track = searchData.data?.[0];
            if (track) appleMusicId = track.id;
          }
        }

        // Fallback to text search
        if (!appleMusicId) {
          const query = encodeURIComponent(`${song.title} ${song.artists[0] || ''}`);
          const searchRes = await fetch(`https://api.music.apple.com/v1/catalog/${storefront}/search?types=songs&term=${query}&limit=1`, {
            headers: { Authorization: `Bearer ${developerToken}` }
          });
          
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const track = searchData.results?.songs?.data?.[0];
            if (track) appleMusicId = track.id;
          }
        }

        if (appleMusicId) {
          trackIds.push(appleMusicId);
          matched++;
        } else {
          unavailable++;
        }

        // update progress (from 10 to 90)
        this.jobQueue.updateProgress(jobId, 10 + Math.floor(((i + 1) / totalSongs) * 80));
      }

      // 5. Add tracks to playlist
      if (trackIds.length > 0) {
        // Apple Music expects track additions as relationships
        const tracksData = trackIds.map(id => ({ id, type: 'songs' }));
        
        await fetch(`https://api.music.apple.com/v1/me/library/playlists/${applePlaylistId}/tracks`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${developerToken}`,
            'Music-User-Token': musicUserToken,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: tracksData })
        });
      }

      const result = {
        total: totalSongs,
        matched,
        skipped,
        unavailable,
        appleMusicPlaylistId: applePlaylistId
      };

      this.logger.log(`Sync complete: ${JSON.stringify(result)}`);
      this.jobQueue.markCompleted(jobId, result);

    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Sync failed: ${msg}`, stack);
      this.jobQueue.markFailed(jobId, error);
    }
  }
}
