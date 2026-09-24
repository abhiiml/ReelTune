import { Injectable, Logger } from '@nestjs/common';
import { Song } from '@reeltune/types';

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

  private async authenticate(): Promise<boolean> {
    if (!this.clientId || !this.clientSecret) {
      return false;
    }

    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return true;
    }

    this.logger.log('Fetching new Spotify access token via Client Credentials flow...');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64'),
      },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
      }),
    });

    if (!response.ok) {
      this.logger.error(`Failed to authenticate with Spotify: ${response.statusText}`);
      return false;
    }

    const data = await response.json();
    this.accessToken = data.access_token;
    // Buffer expiration by 1 minute
    this.tokenExpiresAt = Date.now() + (data.expires_in * 1000) - 60000;
    
    return true;
  }

  async searchTracks(query: string): Promise<Partial<Song>[]> {
    const isAuthenticated = await this.authenticate();
    
    if (!isAuthenticated) {
      this.logger.warn('Spotify credentials not found or authentication failed. Returning empty search results.');
      return [];
    }

    this.logger.log(`Searching Spotify for query: ${query}`);

    try {
      const url = `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${this.accessToken}`,
        },
      });

      if (!response.ok) {
        this.logger.error(`Spotify search failed: ${response.statusText}`);
        return [];
      }

      const data = await response.json();
      const tracks = data.tracks?.items || [];

      return tracks.map((track: any) => this.mapToInternalSong(track));
    } catch (error) {
      this.logger.error(`Error during Spotify search: ${error instanceof Error ? error.message : String(error)}`);
      return [];
    }
  }

  private mapToInternalSong(spotifyTrack: Record<string, unknown>): Partial<Song> {
    const track = spotifyTrack as {
      name: string;
      artists: { name: string }[];
      album: { name: string; images: { url: string }[] };
      duration_ms: number;
      external_ids: { isrc?: string };
      id: string;
    };
    return {
      title: track.name,
      artists: track.artists.map((a) => a.name),
      album: track.album.name,
      artwork: track.album.images?.[0]?.url || '',
      duration: track.duration_ms,
      isrc: track.external_ids?.isrc || null,
      spotifyId: track.id,
      youtubeId: null,
      metadata: spotifyTrack,
    };
  }
}

