import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getSavedSongs(userId: string) {
    const savedSongs = await this.prisma.savedSong.findMany({
      where: { userId },
      include: {
        song: true,
      },
      orderBy: {
        savedAt: 'desc',
      },
    });

    return {
      value: savedSongs,
      totalCount: savedSongs.length,
    };
  }
}
