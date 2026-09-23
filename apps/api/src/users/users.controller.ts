import { Controller, Get, Delete, Req, UseGuards } from '@nestjs/common';
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
  @Delete('me')
  async deleteMe(@Req() req: { user: { id: string } }) {
    // Relying on Prisma's onDelete: Cascade to clean up playlists, savedSongs, connectedAccounts
    await this.prismaService.user.delete({
      where: { id: req.user.id },
    });
    return { success: true };
  }
}
