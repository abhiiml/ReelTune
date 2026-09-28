import { Module } from '@nestjs/common';
import { IntegrationsController } from './integrations.controller.js';
import { IntegrationsService } from './integrations.service.js';
import { ReelTuneProvider } from './providers/reeltune.provider.js';
import { SpotifyProvider } from './providers/spotify.provider.js';
import { AppleMusicProvider } from './providers/apple-music.provider.js';
import { YouTubeProvider } from './providers/youtube.provider.js';
import { JioSaavnProvider } from './providers/jiosaavn.provider.js';
import { ProviderRegistryService } from './providers/provider-registry.service.js';
import { DestinationsService } from './destinations/destinations.service.js';
import { DestinationsController } from './destinations/destinations.controller.js';
import { PrismaModule } from '../prisma/prisma.service.js';

@Module({
  imports: [PrismaModule],
  controllers: [IntegrationsController, DestinationsController],
  providers: [
    IntegrationsService,
    ReelTuneProvider,
    SpotifyProvider,
    AppleMusicProvider,
    YouTubeProvider,
    JioSaavnProvider,
    ProviderRegistryService,
    DestinationsService,
  ],
  exports: [IntegrationsService, ProviderRegistryService, DestinationsService],
})
export class IntegrationsModule {}
