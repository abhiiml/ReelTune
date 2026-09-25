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
    
    return this.recognitionService.recognizeAudio(body.audioUrl);
  }

  @Post('instagram')
  @UseGuards(SupabaseAuthGuard)
  async recognizeFromReel(@Body() body: { reelUrl: string }) {
    if (!body.reelUrl) {
      throw new BadRequestException('reelUrl is required');
    }

    return this.recognitionService.recognizeFromReel(body.reelUrl);
  }
}
