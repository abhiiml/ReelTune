import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SongsService } from './songs.service.js';

@Controller('songs')
export class SongsController {
  constructor(private readonly songsService: SongsService) {}

  @Get('search')
  async search(@Query('q') query: string) {
    if (!query) {
      throw new HttpException('Search query is required', HttpStatus.BAD_REQUEST);
    }
    return this.songsService.search(query);
  }
}
