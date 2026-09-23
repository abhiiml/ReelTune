import { Controller, Post, Get, Param, UseGuards, Req } from '@nestjs/common';
import { SyncService } from './sync.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@Controller('api/v1')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('playlists/:id/sync/spotify')
  @UseGuards(SupabaseAuthGuard)
  async syncToSpotify(@Param('id') playlistId: string, @Req() req: { user: { id: string } }) {
    const jobId = await this.syncService.enqueueSpotifySync(req.user.id, playlistId);
    return { jobId };
  }

  @Post('playlists/:id/sync/youtube')
  @UseGuards(SupabaseAuthGuard)
  async syncToYouTube(@Param('id') playlistId: string, @Req() req: { user: { id: string } }) {
    const jobId = await this.syncService.enqueueYouTubeSync(req.user.id, playlistId);
    return { jobId };
  }

  @Get('sync/:jobId')
  @UseGuards(SupabaseAuthGuard)
  async getSyncStatus(@Param('jobId') jobId: string, @Req() req: { user: { id: string } }) {
    return this.syncService.getJobStatus(jobId, req.user.id);
  }
}
