import { Module } from '@nestjs/common';
import { ShareController } from './share.controller.js';
import { ShareService } from './share.service.js';
import { RecognitionModule } from '../recognition/recognition.module.js';
import { SongsModule } from '../songs/songs.module.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';
import { PrismaModule } from '../prisma/prisma.service.js';

@Module({
  imports: [RecognitionModule, SongsModule, IntegrationsModule, PrismaModule],
  controllers: [ShareController],
  providers: [ShareService],
  exports: [ShareService],
})
export class ShareModule {}
