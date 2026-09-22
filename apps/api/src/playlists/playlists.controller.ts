import { Controller, Get, Post, Patch, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { PlaylistsService } from './playlists.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';
import { CreatePlaylistDto } from './dto/create-playlist.dto.js';
import { UpdatePlaylistDto } from './dto/update-playlist.dto.js';
import { AddSongDto } from './dto/add-song.dto.js';
import { ReorderSongsDto } from './dto/reorder-songs.dto.js';

@UseGuards(SupabaseAuthGuard)
@Controller('playlists')
export class PlaylistsController {
  constructor(private readonly playlistsService: PlaylistsService) {}

  @Post()
  async createPlaylist(@Req() req: { user: { id: string } }, @Body() dto: CreatePlaylistDto) {
    return this.playlistsService.createPlaylist(req.user.id, dto);
  }

  @Get()
  async getPlaylists(@Req() req: { user: { id: string } }) {
    return this.playlistsService.getPlaylists(req.user.id);
  }

  @Get(':id')
  async getPlaylist(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.playlistsService.getPlaylist(req.user.id, id);
  }

  @Patch(':id')
  async updatePlaylist(
    @Req() req: { user: { id: string } },
    @Param('id') id: string,
    @Body() dto: UpdatePlaylistDto
  ) {
    return this.playlistsService.updatePlaylist(req.user.id, id, dto);
  }

  @Delete(':id')
  async deletePlaylist(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.playlistsService.deletePlaylist(req.user.id, id);
  }

  @Post(':id/songs')
  async addSongToPlaylist(
    @Req() req: { user: { id: string } },
    @Param('id') playlistId: string,
    @Body() dto: AddSongDto
  ) {
    return this.playlistsService.addSongToPlaylist(req.user.id, playlistId, dto);
  }

  @Delete(':id/songs/:songId')
  async removeSongFromPlaylist(
    @Req() req: { user: { id: string } },
    @Param('id') playlistId: string,
    @Param('songId') songId: string
  ) {
    return this.playlistsService.removeSongFromPlaylist(req.user.id, playlistId, songId);
  }

  @Patch(':id/reorder')
  async reorderSongs(
    @Req() req: { user: { id: string } },
    @Param('id') playlistId: string,
    @Body() dto: ReorderSongsDto
  ) {
    return this.playlistsService.reorderSongs(req.user.id, playlistId, dto);
  }
}
