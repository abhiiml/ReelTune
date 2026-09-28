import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseAuthGuard } from '../../auth/guards/supabase-auth.guard.js';
import { DestinationsService } from './destinations.service.js';

interface AuthRequest {
  user: {
    id: string;
    email?: string;
  };
}

@Controller('destinations')
@UseGuards(SupabaseAuthGuard)
export class DestinationsController {
  constructor(private readonly destinationsService: DestinationsService) {}

  @Get('options')
  async getOptions(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const options = await this.destinationsService.getDestinationOptions(userId);
    return { success: true, data: options };
  }

  @Get('preferences')
  async getPreferences(@Req() req: AuthRequest) {
    const userId = req.user.id;
    const preferences = await this.destinationsService.getPreferences(userId);
    return { success: true, data: preferences };
  }

  @Post('preferences')
  async updatePreferences(
    @Req() req: AuthRequest,
    @Body() body: { provider: string; playlistId?: string | null; playlistName?: string | null },
  ) {
    if (!body.provider) {
      throw new BadRequestException('provider is required');
    }
    const userId = req.user.id;
    try {
      const updated = await this.destinationsService.updatePreferences(userId, body);
      return { success: true, data: updated };
    } catch (e: unknown) {
      throw new BadRequestException(e instanceof Error ? e.message : 'Failed to update preferences');
    }
  }
}
