import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service.js';
import { Song } from '@reeltune/types';
import {
  MusicProvider,
  DestinationPlaylist,
  AddTrackResult,
} from './music-provider.interface.js';

@Injectable()
export class ReelTuneProvider implements MusicProvider {
  readonly name = 'reeltune';
  readonly displayName = 'ReelTune Library';
  private readonly logger = new Logger(ReelTuneProvider.name);

  constructor(private readonly prisma: PrismaService) {}

  async isConnected(_userId: string): Promise<boolean> {
    return true;
  }

  async getPlaylists(userId: string): Promise<DestinationPlaylist[]> {
    const playlists = await this.prisma.playlist.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { songs: true },
        },
      },
    });

    if (playlists.length === 0) {
      // Create a default "Reels Finds" playlist for the user
      const defaultPlaylist = await this.prisma.playlist.create({
        data: {
          userId,
          name: 'Reels Finds',
          description: 'Auto-saved songs from Instagram Reels',
          isPrivate: false,
        },
      });

      return [
        {
          id: defaultPlaylist.id,
          name: defaultPlaylist.name,
          provider: this.name,
          isDefault: true,
          songCount: 0,
        },
      ];
    }

    return playlists.map((p, idx) => ({
      id: p.id,
      name: p.name,
      provider: this.name,
      isDefault: idx === 0,
      songCount: p._count?.songs ?? 0,
    }));
  }

  async searchAndAddTrack(
    userId: string,
    playlistId: string | null,
    song: Song,
  ): Promise<AddTrackResult> {
    let targetPlaylistId = playlistId;
    let targetPlaylistName = 'Reels Finds';

    if (!targetPlaylistId) {
      // Find or create default playlist
      let defaultPlaylist = await this.prisma.playlist.findFirst({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });

      if (!defaultPlaylist) {
        defaultPlaylist = await this.prisma.playlist.create({
          data: {
            userId,
            name: 'Reels Finds',
            description: 'Auto-saved songs from Instagram Reels',
            isPrivate: false,
          },
        });
      }

      targetPlaylistId = defaultPlaylist.id;
      targetPlaylistName = defaultPlaylist.name;
    } else {
      const playlist = await this.prisma.playlist.findUnique({
        where: { id: targetPlaylistId },
      });
      if (playlist) {
        targetPlaylistName = playlist.name;
      }
    }

    // Check if song is already in this playlist
    const existing = await this.prisma.playlistSong.findUnique({
      where: {
        playlistId_songId: {
          playlistId: targetPlaylistId,
          songId: song.id,
        },
      },
    });

    if (existing) {
      return {
        status: 'ALREADY_EXISTS',
        playlistId: targetPlaylistId,
        playlistName: targetPlaylistName,
        provider: this.name,
        message: `Already in ${targetPlaylistName}`,
      };
    }

    // Calculate next position
    const lastSong = await this.prisma.playlistSong.findFirst({
      where: { playlistId: targetPlaylistId },
      orderBy: { position: 'desc' },
    });
    const position = lastSong ? lastSong.position + 1 : 0;

    await this.prisma.playlistSong.create({
      data: {
        playlistId: targetPlaylistId,
        songId: song.id,
        position,
      },
    });

    this.logger.log(`Added song "${song.title}" to ReelTune playlist "${targetPlaylistName}"`);

    return {
      status: 'ADDED',
      playlistId: targetPlaylistId,
      playlistName: targetPlaylistName,
      provider: this.name,
      message: `Added to ${targetPlaylistName}`,
    };
  }
}
