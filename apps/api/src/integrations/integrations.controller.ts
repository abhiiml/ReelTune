import { Controller, Get, Post, Body, Query, Res, UseGuards, Req, Delete } from '@nestjs/common';
import { IntegrationsService } from './integrations.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import type { Response } from 'express';

@Controller('integrations')
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get('spotify/connect')
  @UseGuards(SupabaseAuthGuard)
  connectSpotify(@Res() res: Response) {
    const url = this.integrationsService.getSpotifyConnectUrl();
    return res.redirect(url);
  }

  @Get('spotify/callback')
  @UseGuards(SupabaseAuthGuard)
  async spotifyCallback(
    @Req() req: { user: { id: string } }, 
    @Query('code') code: string, 
    @Res() res: Response
  ) {
    if (!code) {
      return res.redirect('reeltune://settings?error=missing_code');
    }

    try {
      const userId = req.user.id;
      await this.integrationsService.handleSpotifyCallback(userId, code);
      // Redirect back to the mobile app
      return res.redirect('reeltune://settings/spotify?connected=true');
    } catch (error) {
      console.error('Spotify callback error:', error);
      return res.redirect('reeltune://settings/spotify?error=exchange_failed');
    }
  }

  @Get()
  @UseGuards(SupabaseAuthGuard)
  getIntegrations(@Req() req: { user: { id: string } }) {
    return this.integrationsService.getConnectedServices(req.user.id);
  }

  @Delete('spotify')
  @UseGuards(SupabaseAuthGuard)
  async disconnectSpotify(@Req() req: { user: { id: string } }) {
    await this.integrationsService.disconnectSpotify(req.user.id);
    return { success: true };
  }

  @Get('youtube/connect')
  @UseGuards(SupabaseAuthGuard)
  connectYouTube(@Res() res: Response) {
    const url = this.integrationsService.getYouTubeConnectUrl();
    return res.redirect(url);
  }

  @Get('youtube/callback')
  @UseGuards(SupabaseAuthGuard)
  async youtubeCallback(
    @Req() req: { user: { id: string } }, 
    @Query('code') code: string, 
    @Res() res: Response
  ) {
    if (!code) {
      return res.redirect('reeltune://settings?error=missing_code');
    }

    try {
      const userId = req.user.id;
      await this.integrationsService.handleYouTubeCallback(userId, code);
      return res.redirect('reeltune://settings/youtube?connected=true');
    } catch (error) {
      console.error('YouTube callback error:', error);
      return res.redirect('reeltune://settings/youtube?error=exchange_failed');
    }
  }

  @Delete('youtube')
  @UseGuards(SupabaseAuthGuard)
  async disconnectYouTube(@Req() req: { user: { id: string } }) {
    await this.integrationsService.disconnectYouTube(req.user.id);
    return { success: true };
  }

  @Post('apple-music/connect')
  @UseGuards(SupabaseAuthGuard)
  async connectAppleMusic(@Req() req: { user: { id: string } }, @Body() body: { musicUserToken: string }) {
    if (!body.musicUserToken) {
      return { success: false, message: 'musicUserToken is required' };
    }
    await this.integrationsService.connectAppleMusic(req.user.id, body.musicUserToken);
    return { success: true };
  }

  @Delete('apple-music')
  @UseGuards(SupabaseAuthGuard)
  async disconnectAppleMusic(@Req() req: { user: { id: string } }) {
    await this.integrationsService.disconnectAppleMusic(req.user.id);
    return { success: true };
  }

  @Post('jiosaavn/connect')
  @UseGuards(SupabaseAuthGuard)
  async connectJioSaavn() {
    return { success: false, message: 'JioSaavn does not provide a public API.' };
  }

  @Delete('jiosaavn')
  @UseGuards(SupabaseAuthGuard)
  async disconnectJioSaavn(@Req() req: { user: { id: string } }) {
    await this.integrationsService.disconnectJioSaavn(req.user.id);
    return { success: true };
  }
}
