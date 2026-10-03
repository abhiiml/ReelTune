import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { RecognitionService } from './recognition.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@Controller('recognition')
export class RecognitionController {
  constructor(private readonly recognitionService: RecognitionService) {}

  @Post('audio')
  @UseGuards(SupabaseAuthGuard)
  async recognizeAudio(@Body() body: { audioUrl: string }) {
    if (!body.audioUrl) {
      throw new BadRequestException('audioUrl is required');
    }

    try {
      const result = await this.recognitionService.recognizeAudio(body.audioUrl);
      return { success: true, ...result };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Audio recognition failed';
      return {
        success: false,
        message,
        candidates: [],
      };
    }
  }

  @Post('instagram')
  @UseGuards(SupabaseAuthGuard)
  async recognizeFromReel(@Body() body: { reelUrl: string }) {
    if (!body.reelUrl) {
      throw new BadRequestException('reelUrl is required');
    }

    try {
      return await this.recognitionService.recognizeFromReel(body.reelUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Reel recognition failed';
      return {
        success: false,
        message,
        candidates: [],
      };
    }
  }
}
