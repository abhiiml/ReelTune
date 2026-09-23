import { Module } from '@nestjs/common';
import { RecognitionController } from './recognition.controller.js';
import { RecognitionService } from './recognition.service.js';
import { AuthModule } from '../auth/auth.module.js';
import { SongsModule } from '../songs/songs.module.js';

@Module({
  imports: [AuthModule, SongsModule],
  controllers: [RecognitionController],
  providers: [RecognitionService],
  exports: [RecognitionService],
})
export class RecognitionModule {}
