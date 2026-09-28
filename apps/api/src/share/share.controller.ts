import { Controller, Post, Body, UseGuards, Req, BadRequestException } from '@nestjs/common';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { ShareService } from './share.service.js';

interface AuthRequest {
  user: {
    id: string;
    email?: string;
  };
}

@Controller('share')
@UseGuards(SupabaseAuthGuard)
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post('reel')
  async shareReel(
    @Req() req: AuthRequest,
    @Body() body: { url?: string; reelUrl?: string; provider?: string; playlistId?: string },
  ) {
    const rawUrl = body.url || body.reelUrl;
    if (!rawUrl) {
      throw new BadRequestException('A valid Instagram Reel URL is required');
    }

    const userId = req.user.id;
    return this.shareService.processSharedReel(userId, {
      url: rawUrl,
      provider: body.provider,
      playlistId: body.playlistId,
    });
  }
}
