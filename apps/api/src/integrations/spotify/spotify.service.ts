import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { Song } from '@reeltune/types';

interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

@Injectable()
export class SpotifyService {
  private readonly logger = new Logger(SpotifyService.name);
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  private get clientId(): string {
    return process.env.SPOTIFY_CLIENT_ID || '';
  }

  private get clientSecret(): string {
    return process.env.SPOTIFY_CLIENT_SECRET || '';
  }

  private async authenticate(): Promise<void> {
    // Skipped: Spotify integration disabled as per instructions
    this.logger.log('Spotify authentication mocked (disabled).');
  }

  async searchTracks(query: string): Promise<Partial<Song>[]> {
    await this.authenticate();

    this.logger.log(`Mocking Spotify search for query: ${query}`);

    // Mock search logic based on query, or return static set if query doesn't match
    const mockTracks = [
      {
        name: 'Blinding Lights',
        artists: [{ name: 'The Weeknd' }],
        album: { name: 'After Hours', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36' }] },
        duration_ms: 200040,
        external_ids: { isrc: 'USUG11904206' },
        id: '0VjIjW4GlUZAMYd2vXMi3b',
      },
      {
        name: 'Starboy',
        artists: [{ name: 'The Weeknd' }, { name: 'Daft Punk' }],
        album: { name: 'Starboy', images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2734718e2b124f79258be7bc452' }] },
        duration_ms: 230453,
        external_ids: { isrc: 'USUG11601660' },
        id: '7MXVkk9YMqq6aad5vH6W3p',
      }
    ];

    // Simple filter to simulate search (if query contains "blinding")
    let results = mockTracks;
    if (query.toLowerCase().includes('blinding')) {
      results = [mockTracks[0]];
    }

    return results.map((track) => this.mapToInternalSong(track));
  }

  private mapToInternalSong(spotifyTrack: any): Partial<Song> {
    return {
      title: spotifyTrack.name,
      artists: spotifyTrack.artists.map((a: any) => a.name),
      album: spotifyTrack.album.name,
      artwork: spotifyTrack.album.images?.[0]?.url || '',
      duration: spotifyTrack.duration_ms,
      isrc: spotifyTrack.external_ids?.isrc || null,
      spotifyId: spotifyTrack.id,
      youtubeId: null,
      metadata: spotifyTrack,
    };
  }
}

