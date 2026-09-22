import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller.js';
import { SongsService } from './songs.service.js';
import { SpotifyModule } from '../integrations/spotify/spotify.module.js';
import { PrismaModule } from '../prisma/prisma.service.js';

@Module({
  imports: [SpotifyModule, PrismaModule],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
