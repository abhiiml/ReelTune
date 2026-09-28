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
export class SpotifyProvider implements MusicProvider {
  readonly name = 'spotify';
  readonly displayName = 'Spotify';
  private readonly logger = new Logger(SpotifyProvider.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly integrationsService: IntegrationsService,
  ) {}

  async isConnected(userId: string): Promise<boolean> {
    const account = await this.prisma.connectedAccount.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
    });
    return !!account;
  }

  async getPlaylists(userId: string): Promise<DestinationPlaylist[]> {
    const connected = await this.isConnected(userId);
    if (!connected) return [];

    try {
      const accessToken = await this.integrationsService.getDecryptedSpotifyToken(userId);
      const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=50', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        this.logger.error(`Failed to fetch Spotify playlists: ${res.statusText}`);
        return [];
      }

      const data = await res.json();
      return (data.items || []).map((p: { id: string; name: string; tracks?: { total?: number }; external_urls?: { spotify?: string } }) => ({
        id: p.id,
        name: p.name,
        provider: this.name,
        songCount: p.tracks?.total ?? 0,
        externalUrl: p.external_urls?.spotify,
      }));
    } catch (e: unknown) {
      this.logger.error(`Error fetching Spotify playlists: ${e instanceof Error ? e.message : 'Unknown'}`);
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
        playlistName: 'Spotify',
        provider: this.name,
        message: 'Spotify is not connected. Please connect Spotify in Settings.',
      };
    }

    try {
      const accessToken = await this.integrationsService.getDecryptedSpotifyToken(userId);

      // 1. Match track on Spotify
      let spotifyTrackUri: string | null = null;
      let externalTrackId: string | null = null;

      if (song.spotifyId) {
        spotifyTrackUri = `spotify:track:${song.spotifyId}`;
        externalTrackId = song.spotifyId;
      } else {
        // Search by ISRC first if available
        if (song.isrc) {
          const isrcRes = await fetch(
            `https://api.spotify.com/v1/search?q=isrc:${encodeURIComponent(song.isrc)}&type=track&limit=1`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );
          if (isrcRes.ok) {
            const isrcData = await isrcRes.json();
            const item = isrcData.tracks?.items?.[0];
            if (item) {
              spotifyTrackUri = item.uri;
              externalTrackId = item.id;
            }
          }
        }

        // Fallback search by title + artist
        if (!spotifyTrackUri) {
          const artist = song.artists?.[0] || '';
          const query = encodeURIComponent(`track:${song.title} artist:${artist}`);
          const searchRes = await fetch(
            `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
            { headers: { Authorization: `Bearer ${accessToken}` } },
          );

          if (searchRes.ok) {
            const searchData = await searchRes.json();
            const item = searchData.tracks?.items?.[0];
            if (item) {
              spotifyTrackUri = item.uri;
              externalTrackId = item.id;
            }
          }
        }

        // Cache spotifyId back to Song record
        if (externalTrackId) {
          await this.prisma.song.update({
            where: { id: song.id },
            data: { spotifyId: externalTrackId },
          }).catch(() => {});
        }
      }

      if (!spotifyTrackUri) {
        return {
          status: 'MATCH_FAILED',
          playlistId: playlistId || '',
          playlistName: 'Spotify',
          provider: this.name,
          message: `Could not find a matching track on Spotify for "${song.title}"`,
        };
      }

      // 2. Resolve target Spotify Playlist
      let targetPlaylistId = playlistId;
      let targetPlaylistName = 'Reels Finds';
      let externalUrl = '';

      if (!targetPlaylistId) {
        // Find existing Reels Finds playlist or create new
        const playlists = await this.getPlaylists(userId);
        const existing = playlists.find((p) => p.name.toLowerCase() === 'reels finds');

        if (existing) {
          targetPlaylistId = existing.id;
          targetPlaylistName = existing.name;
          externalUrl = existing.externalUrl || '';
        } else {
          // Get profile
          const meRes = await fetch('https://api.spotify.com/v1/me', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          if (!meRes.ok) throw new Error('Failed to get Spotify profile');
          const meData = await meRes.json();

          const createRes = await fetch(`https://api.spotify.com/v1/users/${meData.id}/playlists`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: 'Reels Finds',
              description: 'Auto-saved songs from ReelTune',
              public: false,
            }),
          });

          if (!createRes.ok) throw new Error('Failed to create Spotify playlist');
          const newPl = await createRes.json();
          targetPlaylistId = newPl.id;
          targetPlaylistName = newPl.name;
          externalUrl = newPl.external_urls?.spotify || '';
        }
      } else {
        // Fetch playlist name
        const plRes = await fetch(`https://api.spotify.com/v1/playlists/${targetPlaylistId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (plRes.ok) {
          const plData = await plRes.json();
          targetPlaylistName = plData.name || 'Spotify Playlist';
          externalUrl = plData.external_urls?.spotify || '';
        }
      }

      // 3. Check for duplicates in playlist
      const tracksRes = await fetch(
        `https://api.spotify.com/v1/playlists/${targetPlaylistId}/tracks?limit=100`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      );

      if (tracksRes.ok) {
        const tracksData = await tracksRes.json();
        const exists = (tracksData.items || []).some(
          (item: { track?: { uri?: string; id?: string } }) => item.track?.uri === spotifyTrackUri || item.track?.id === externalTrackId,
        );

        if (exists) {
          return {
            status: 'ALREADY_EXISTS',
            playlistId: targetPlaylistId!,
            playlistName: targetPlaylistName,
            provider: this.name,
            externalTrackId: externalTrackId || undefined,
            externalTrackUrl: externalUrl,
            message: `Already in ${targetPlaylistName}`,
          };
        }
      }

      // 4. Add track to Spotify playlist
      const addRes = await fetch(`https://api.spotify.com/v1/playlists/${targetPlaylistId}/tracks`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uris: [spotifyTrackUri] }),
      });

      if (!addRes.ok) {
        const errorText = await addRes.text();
        throw new Error(`Spotify add track failed: ${errorText}`);
      }

      return {
        status: 'ADDED',
        playlistId: targetPlaylistId!,
        playlistName: targetPlaylistName,
        provider: this.name,
        externalTrackId: externalTrackId || undefined,
        externalTrackUrl: externalUrl,
        message: `Added to ${targetPlaylistName}`,
      };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to add track to Spotify';
      this.logger.error(`Spotify add track error: ${msg}`);
      return {
        status: 'MATCH_FAILED',
        playlistId: playlistId || '',
        playlistName: 'Spotify',
        provider: this.name,
        message: msg,
      };
    }
  }
}
