import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';
import { IntegrationsService } from '../integrations/integrations.service.js';
import { Logger } from '@nestjs/common';

@Processor('sync-queue')
export class SpotifySyncProcessor extends WorkerHost {
  private readonly logger = new Logger(SpotifySyncProcessor.name);

  constructor(
    private prisma: PrismaService,
    private integrationsService: IntegrationsService,
  ) {
    super();
  }

  async process(job: Job<{ userId: string; playlistId: string }, unknown, string>): Promise<unknown> {
    const { userId, playlistId } = job.data;
    this.logger.log(`Processing sync for playlist ${playlistId} to Spotify`);

    try {
      // 1. Get decrypted token (handles refresh)
      const accessToken = await this.integrationsService.getDecryptedSpotifyToken(userId);

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

      // 3. Get Spotify User Profile (to get userId for creating playlist)
      const meRes = await fetch('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (!meRes.ok) throw new Error('Failed to get Spotify profile');
      const meData = await meRes.json();
      const spotifyUserId = meData.id;

      // 4. Create Spotify Playlist
      const createRes = await fetch(`https://api.spotify.com/v1/users/${spotifyUserId}/playlists`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: playlist.name,
          description: playlist.description || 'Synced from ReelTune',
          public: !playlist.isPrivate,
        })
      });
      if (!createRes.ok) throw new Error('Failed to create Spotify playlist');
      const spotifyPlaylist = await createRes.json();

      let matched = 0;
      const skipped = 0;
      let unavailable = 0;
      const trackUris: string[] = [];

      await job.updateProgress(10); // created playlist

      const totalSongs = playlist.songs.length;

      // 5. Iterate and search/match songs
      for (let i = 0; i < totalSongs; i++) {
        const item = playlist.songs[i];
        const song = item.song;
        let spotifyUri: string | null = null;

        if (song.spotifyId) {
          spotifyUri = `spotify:track:${song.spotifyId}`;
        } else {
          // Search Spotify
          const query = encodeURIComponent(`track:${song.title} artist:${song.artists[0] || ''}`);
          const searchRes = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`, {
            headers: { Authorization: `Bearer ${accessToken}` }
          });
          
          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const track = searchData.tracks?.items?.[0];
            if (track) {
              spotifyUri = track.uri;
              // update the db to cache it
              await this.prisma.song.update({
                where: { id: song.id },
                data: { spotifyId: track.id }
              });
            }
          }
        }

        if (spotifyUri) {
          trackUris.push(spotifyUri);
          matched++;
        } else {
          unavailable++;
        }

        // update progress (from 10 to 90)
        await job.updateProgress(10 + Math.floor(((i + 1) / totalSongs) * 80));
      }

      // 6. Add tracks to playlist
      if (trackUris.length > 0) {
        // Spotify limit is 100 per request, we should chunk it if we expect > 100
        for (let i = 0; i < trackUris.length; i += 100) {
          const chunk = trackUris.slice(i, i + 100);
          await fetch(`https://api.spotify.com/v1/playlists/${spotifyPlaylist.id}/tracks`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ uris: chunk })
          });
        }
      }

      await job.updateProgress(100);

      const result = {
        total: totalSongs,
        matched,
        skipped,
        unavailable,
        spotifyPlaylistUrl: spotifyPlaylist.external_urls?.spotify
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
