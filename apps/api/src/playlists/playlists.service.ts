import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreatePlaylistDto } from './dto/create-playlist.dto.js';
import { UpdatePlaylistDto } from './dto/update-playlist.dto.js';
import { AddSongDto } from './dto/add-song.dto.js';
import { ReorderSongsDto } from './dto/reorder-songs.dto.js';

@Injectable()
export class PlaylistsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPlaylist(userId: string, dto: CreatePlaylistDto) {
    const playlist = await this.prisma.playlist.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description || null,
        isPrivate: dto.isPrivate ?? false,
      },
    });

    if (dto.songIds && dto.songIds.length > 0) {
      // Security: ensure the user actually has these songs in their library
      const userSavedSongs = await this.prisma.savedSong.findMany({
        where: {
          userId,
          songId: { in: dto.songIds },
        },
        select: { songId: true },
      });
      const validSongIds = new Set(userSavedSongs.map((s: { songId: string }) => s.songId));
      const filteredSongIds = dto.songIds.filter((id) => validSongIds.has(id));

      if (filteredSongIds.length > 0) {
        await this.prisma.playlistSong.createMany({
          data: filteredSongIds.map((songId, index) => ({
            playlistId: playlist.id,
            songId,
            position: index,
          })),
          skipDuplicates: true,
        });
      }
    }

    return playlist;
  }

  async getPlaylists(userId: string) {
    const playlists = await this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });
    return playlists;
  }

  async getPlaylist(userId: string, id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        songs: {
          orderBy: { position: 'asc' },
          include: { song: true },
        },
      },
    });

    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.isPrivate && playlist.userId !== userId) {
      throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
    }

    return playlist;
  }

  async getPublicPlaylist(id: string) {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id },
      include: {
        user: {
          select: { displayName: true },
        },
        songs: {
          orderBy: { position: 'asc' },
          include: { song: true },
        },
        _count: {
          select: { likes: true }
        }
      },
    });

    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.isPrivate) {
      throw new HttpException('This playlist is private', HttpStatus.FORBIDDEN);
    }

    return {
      id: playlist.id,
      name: playlist.name,
      description: playlist.description,
      isPrivate: playlist.isPrivate,
      creator: playlist.user?.displayName || 'ReelTune Curator',
      createdAt: playlist.createdAt,
      updatedAt: playlist.updatedAt,
      songs: playlist.songs.map((ps: { song: unknown }) => ps.song),
      likesCount: playlist._count.likes,
    };
  }

  async updatePlaylist(userId: string, id: string, dto: UpdatePlaylistDto) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.userId !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    return this.prisma.playlist.update({
      where: { id },
      data: {
        name: dto.name,
        description: dto.description,
        isPrivate: dto.isPrivate,
      },
    });
  }

  async deletePlaylist(userId: string, id: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id } });
    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.userId !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    await this.prisma.playlist.delete({ where: { id } });
    return { success: true };
  }

  async addSongToPlaylist(userId: string, playlistId: string, dto: AddSongDto) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.userId !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    const lastSong = await this.prisma.playlistSong.findFirst({
      where: { playlistId },
      orderBy: { position: 'desc' },
    });
    const position = lastSong ? lastSong.position + 1 : 0;

    try {
      const added = await this.prisma.playlistSong.create({
        data: {
          playlistId,
          songId: dto.songId,
          position,
        },
      });
      return added;
    } catch (e: unknown) {
      if (e !== null && typeof e === 'object' && 'code' in e && (e as Record<string, unknown>).code === 'P2002') {
        throw new HttpException('Song is already in this playlist', HttpStatus.CONFLICT);
      }
      throw e;
    }
  }

  async removeSongFromPlaylist(userId: string, playlistId: string, songId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.userId !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    try {
      await this.prisma.playlistSong.delete({
        where: {
          playlistId_songId: {
            playlistId,
            songId,
          }
        }
      });
      return { success: true };
    } catch {
      throw new HttpException('Song not in playlist', HttpStatus.NOT_FOUND);
    }
  }

  async reorderSongs(userId: string, playlistId: string, dto: ReorderSongsDto) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.userId !== userId) throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);

    // Run within transaction to ensure atomic position updates
    await this.prisma.$transaction(
      dto.songIds.map((songId, index) =>
        this.prisma.playlistSong.update({
          where: { playlistId_songId: { playlistId, songId } },
          data: { position: index },
        })
      )
    );

    return { success: true };
  }

  async likePlaylist(userId: string, playlistId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.isPrivate && playlist.userId !== userId) {
      throw new HttpException('Cannot like private playlists', HttpStatus.FORBIDDEN);
    }
    
    try {
      await this.prisma.playlistLike.create({
        data: {
          userId,
          playlistId,
        }
      });
      return { success: true };
    } catch (e: any) {
      if (e?.code === 'P2002') return { success: true, alreadyLiked: true };
      throw e;
    }
  }

  async unlikePlaylist(userId: string, playlistId: string) {
    try {
      await this.prisma.playlistLike.delete({
        where: {
          userId_playlistId: {
            userId,
            playlistId
          }
        }
      });
      return { success: true };
    } catch {
      return { success: true };
    }
  }

  async getPlaylistLikes(playlistId: string) {
    const playlist = await this.prisma.playlist.findUnique({ where: { id: playlistId } });
    if (!playlist) throw new HttpException('Playlist not found', HttpStatus.NOT_FOUND);
    if (playlist.isPrivate) {
      throw new HttpException('Cannot view likes for private playlists', HttpStatus.FORBIDDEN);
    }

    const likes = await this.prisma.playlistLike.findMany({
      where: { playlistId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          }
        }
      }
    });

    return likes.map(l => l.user);
  }
}

