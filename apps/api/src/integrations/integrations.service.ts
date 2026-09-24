import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import * as crypto from 'crypto';
import { google } from 'googleapis';

@Injectable()
export class IntegrationsService {
  constructor(private readonly prisma: PrismaService) {}

  private getEncryptionKey(): Buffer {
    const keyStr = process.env.TOKEN_ENCRYPTION_KEY || process.env.ENCRYPTION_KEY;
    if (!keyStr || keyStr.length !== 64) {
      throw new Error('TOKEN_ENCRYPTION_KEY is missing or invalid. Must be a 32-byte hex string (64 characters).');
    }
    return Buffer.from(keyStr, 'hex');
  }

  encryptToken(text: string): string {
    const iv = crypto.randomBytes(12);
    const key = this.getEncryptionKey();
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    
    return `${iv.toString('hex')}:${encrypted}:${authTag}`;
  }

  decryptToken(encryptedData: string): string {
    const parts = encryptedData.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted token format');
    }
    const [ivHex, encryptedHex, authTagHex] = parts;
    
    const key = this.getEncryptionKey();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }


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

    // Encrypt tokens
    const encryptedAccessToken = this.encryptToken(data.access_token);
    const encryptedRefreshToken = data.refresh_token ? this.encryptToken(data.refresh_token) : null;

    // Save to Prisma
    await this.prisma.connectedAccount.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'spotify'
        }
      },
      update: {
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt: new Date(Date.now() + data.expires_in * 1000),
      },
      create: {
        userId,
        provider: 'spotify',
        providerAccountId: username || externalId,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
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

  async disconnectSpotify(userId: string) {
    await this.prisma.connectedAccount.deleteMany({
      where: {
        userId,
        provider: 'spotify'
      }
    });
  }

  async getDecryptedSpotifyToken(userId: string): Promise<string> {
    const account = await this.prisma.connectedAccount.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } }
    });

    if (!account || !account.accessToken) {
      throw new BadRequestException('Spotify not connected');
    }

    // Check if token is expired or close to expiring (within 5 minutes)
    if (account.expiresAt && account.expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
      if (!account.refreshToken) {
        throw new BadRequestException('Spotify token expired and no refresh token available');
      }

      const { clientId, clientSecret } = this.getSpotifyConfig();
      const decryptedRefresh = this.decryptToken(account.refreshToken);
      const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

      const params = new URLSearchParams();
      params.append('grant_type', 'refresh_token');
      params.append('refresh_token', decryptedRefresh);

      const response = await fetch('https://accounts.spotify.com/api/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${authHeader}`
        },
        body: params.toString()
      });

      if (!response.ok) {
        throw new BadRequestException('Failed to refresh Spotify token');
      }

      const data = await response.json();
      const newEncryptedAccess = this.encryptToken(data.access_token);
      let newEncryptedRefresh = account.refreshToken;
      if (data.refresh_token) {
        newEncryptedRefresh = this.encryptToken(data.refresh_token);
      }

      await this.prisma.connectedAccount.update({
        where: { id: account.id },
        data: {
          accessToken: newEncryptedAccess,
          refreshToken: newEncryptedRefresh,
          expiresAt: new Date(Date.now() + data.expires_in * 1000),
        }
      });

      return data.access_token;
    }

    return this.decryptToken(account.accessToken);
  }

  private getYouTubeConfig() {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:3000/api/v1/integrations/youtube/callback';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('YouTube integration is not configured on the server.');
    }

    return { clientId, clientSecret, redirectUri };
  }

  getYouTubeConnectUrl(): string {
    const { clientId, clientSecret, redirectUri } = this.getYouTubeConfig();
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/youtube.readonly'],
    });
  }

  async handleYouTubeCallback(userId: string, code: string): Promise<void> {
    const { clientId, clientSecret, redirectUri } = this.getYouTubeConfig();
    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
    const response = await youtube.channels.list({ part: ['snippet'], mine: true });
    
    let externalId = 'unknown';
    let username = 'YouTube User';
    
    if (response.data.items && response.data.items.length > 0) {
      const channel = response.data.items[0];
      externalId = channel.id || 'unknown';
      username = channel.snippet?.title || externalId;
    }

    if (!tokens.access_token) {
        throw new BadRequestException('No access token returned from Google');
    }

    const encryptedAccessToken = this.encryptToken(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token ? this.encryptToken(tokens.refresh_token) : null;
    const expiresAt = tokens.expiry_date ? new Date(tokens.expiry_date) : new Date(Date.now() + 3600 * 1000);

    await this.prisma.connectedAccount.upsert({
      where: {
        userId_provider: {
          userId,
          provider: 'youtube'
        }
      },
      update: {
        accessToken: encryptedAccessToken,
        ...(encryptedRefreshToken ? { refreshToken: encryptedRefreshToken } : {}),
        expiresAt,
      },
      create: {
        userId,
        provider: 'youtube',
        providerAccountId: username,
        accessToken: encryptedAccessToken,
        refreshToken: encryptedRefreshToken,
        expiresAt,
      }
    });
  }

  async disconnectYouTube(userId: string) {
    await this.prisma.connectedAccount.deleteMany({
      where: {
        userId,
        provider: 'youtube'
      }
    });
  }

  async getDecryptedYouTubeToken(userId: string): Promise<string> {
    const account = await this.prisma.connectedAccount.findUnique({
      where: { userId_provider: { userId, provider: 'youtube' } }
    });

    if (!account || !account.accessToken) {
      throw new BadRequestException('YouTube not connected');
    }

    // Check if token is expired or close to expiring (within 5 minutes)
    if (account.expiresAt && account.expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
      if (!account.refreshToken) {
        throw new BadRequestException('YouTube token expired and no refresh token available');
      }

      const { clientId, clientSecret, redirectUri } = this.getYouTubeConfig();
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      
      const decryptedRefresh = this.decryptToken(account.refreshToken);
      oauth2Client.setCredentials({ refresh_token: decryptedRefresh });

      const { credentials } = await oauth2Client.refreshAccessToken();

      const newEncryptedAccess = this.encryptToken(credentials.access_token!);
      let newEncryptedRefresh = account.refreshToken;
      if (credentials.refresh_token) {
        newEncryptedRefresh = this.encryptToken(credentials.refresh_token);
      }

      await this.prisma.connectedAccount.update({
        where: { id: account.id },
        data: {
          accessToken: newEncryptedAccess,
          refreshToken: newEncryptedRefresh,
          expiresAt: credentials.expiry_date ? new Date(credentials.expiry_date) : new Date(Date.now() + 3600 * 1000),
        }
      });

      return credentials.access_token!;
    }

    return this.decryptToken(account.accessToken);
  }
}

