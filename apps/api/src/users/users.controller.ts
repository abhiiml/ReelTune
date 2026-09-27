import { Controller, Get, Post, Delete, Req, Param, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UsersService } from './users.service.js';
import { SupabaseAuthGuard } from '../auth/guards/supabase-auth.guard.js';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly prismaService: PrismaService,
  ) {}

  @UseGuards(SupabaseAuthGuard)
  @Get('me/songs')
  async getMySongs(@Req() req: { user: { id: string } }) {
    return this.usersService.getSavedSongs(req.user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get('me/playlist-suggestions')
  async getPlaylistSuggestions(@Req() req: { user: { id: string } }) {
    return this.usersService.getPlaylistSuggestions(req.user.id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete('me')
  async deleteMe(@Req() req: { user: { id: string } }) {
    // Relying on Prisma's onDelete: Cascade to clean up playlists, savedSongs, connectedAccounts
    await this.prismaService.user.delete({
      where: { id: req.user.id },
    });
    return { success: true };
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id')
  async getUserProfile(@Param('id') id: string) {
    return this.usersService.getUserProfile(id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Post(':id/follow')
  async followUser(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.usersService.followUser(req.user.id, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Delete(':id/follow')
  async unfollowUser(@Req() req: { user: { id: string } }, @Param('id') id: string) {
    return this.usersService.unfollowUser(req.user.id, id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id/followers')
  async getFollowers(@Param('id') id: string) {
    return this.usersService.getFollowers(id);
  }

  @UseGuards(SupabaseAuthGuard)
  @Get(':id/following')
  async getFollowing(@Param('id') id: string) {
    return this.usersService.getFollowing(id);
  }
}
