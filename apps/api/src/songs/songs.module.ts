import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller.js';
import { SongsService } from './songs.service.js';
import { SpotifyModule } from '../integrations/spotify/spotify.module.js';

@Module({
  imports: [SpotifyModule],
  controllers: [SongsController],
  providers: [SongsService],
})
export class SongsModule {}
