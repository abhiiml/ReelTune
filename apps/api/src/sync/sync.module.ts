import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SyncController } from './sync.controller.js';
import { SyncService } from './sync.service.js';
import { SpotifySyncProcessor } from './spotify-sync.processor.js';
import { YoutubeSyncProcessor } from './youtube-sync.processor.js';
import { PrismaModule } from '../prisma/prisma.service.js';
import { IntegrationsModule } from '../integrations/integrations.module.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'sync-queue',
    }),
    PrismaModule,
    IntegrationsModule,
  ],
  controllers: [SyncController],
  providers: [SyncService, SpotifySyncProcessor, YoutubeSyncProcessor],
})
export class SyncModule {}
