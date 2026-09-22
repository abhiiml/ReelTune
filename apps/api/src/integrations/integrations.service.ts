import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  private getSpotifyConfig() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    // Assume redirect URI is handled via Web, or deep link. Let's use a standard backend callback
    const redirectUri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:3000/api/v1/integrations/spotify/callback';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Spotify integration is not configured on the server.');
    }

    return { clientId, clientSecret, redirectUri };
  }

  getSpotifyConnectUrl(): string {
    const { clientId, redirectUri } = this.getSpotifyConfig();
    const scopes = ['playlist-modify-public', 'playlist-modify-private', 'user-read-private', 'user-read-email'];
    const state = Math.random().toString(36).substring(7); // Simple state

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      scope: scopes.join(' '),
      redirect_uri: redirectUri,
      state,
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async handleSpotifyCallback(userId: string, code: string): Promise<void> {
    const { clientId, clientSecret, redirectUri } = this.getSpotifyConfig();

    const params = new URLSearchParams();
    params.append('code', code);
    params.append('redirect_uri', redirectUri);
    params.append('grant_type', 'authorization_code');

    const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Spotify token exchange failed:', errorData);
      throw new BadRequestException('Failed to exchange Spotify token');
    }

    const data = await response.json();
    
    // We should also fetch the Spotify User Profile to get their Spotify ID
    const profileResponse = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`
      }
    });
    
    let externalId = 'unknown';
    let username = 'Spotify User';
    
    if (profileResponse.ok) {
      const profile = await profileResponse.json();
      externalId = profile.id;
      username = profile.display_name || profile.id;
    }

    // Save to Prisma
    await this.prisma.connectedAccount.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'spotify'
        }
      },
      update: {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
      create: {
        userId,
        provider: 'spotify',
        providerAccountId: username || externalId,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      }
    });
  }

  async getConnectedServices(userId: string) {
    const accounts = await this.prisma.connectedAccount.findMany({
      where: { userId },
      select: {
        provider: true,
        providerAccountId: true,
        updatedAt: true,
      }
    });
    return accounts;
  }
}

