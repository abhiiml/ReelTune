import { Controller, Get, Post, Delete, Query, Param, Body, Req, UseGuards, HttpException, HttpStatus } from '@nestjs/common';
import { SongsService } from './songs.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { SaveSongDto } from './dto/save-song.dto.js';

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

  @Get(':id')
  async getById(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('Song ID is required', HttpStatus.BAD_REQUEST);
    }
    const song = await this.songsService.getById(id);
    if (!song) {
      throw new HttpException('Song not found', HttpStatus.NOT_FOUND);
    }
    return song;
  }

  @UseGuards(SupabaseAuthGuard)
  @Post('save')
  async saveSong(@Req() req: { user: { id: string } }, @Body() saveDto: SaveSongDto) {
    const userId = req.user.id;
    return this.songsService.saveSong(userId, saveDto.songId);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id/save')
  async unsaveSong(@Req() req: { user: { id: string } }, @Param('id') songId: string) {
    const userId = req.user.id;
    return this.songsService.unsaveSong(userId, songId);
  }
}
