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
    if (!this.clientId || !this.clientSecret) {
      throw new HttpException(
        'Spotify credentials are not configured on the server.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return;
    }

    this.logger.log('Authenticating with Spotify...');
    const authHeader = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${authHeader}`,
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Spotify auth failed: ${errorText}`);
      throw new HttpException('Failed to authenticate with Spotify', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const data = (await response.json()) as SpotifyTokenResponse;
    this.accessToken = data.access_token;
    // Expire 1 minute early to be safe
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
  }

  async searchTracks(query: string): Promise<Partial<Song>[]> {
    await this.authenticate();

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      this.logger.error(`Spotify search failed: ${errorText}`);
      throw new HttpException('Failed to search Spotify', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const data = (await response.json()) as any;
    const tracks = data.tracks?.items || [];

    return tracks.map((track: any) => this.mapToInternalSong(track));
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
