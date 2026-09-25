import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { JobQueueService } from './job-queue.service.js';
import { SpotifySyncProcessor } from './spotify-sync.processor.js';
import { YoutubeSyncProcessor } from './youtube-sync.processor.js';
import { PrismaModule } from '../prisma/prisma.service.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';

@Module({
  imports: [
    PrismaModule,
    IntegrationsModule,
  ],
  controllers: [SyncController],
  providers: [
    JobQueueService,
    SyncService,
    SpotifySyncProcessor,
    YoutubeSyncProcessor
  ],
})
export class SyncModule {}
