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

  async getPlaylistSuggestions(userId: string) {
    const savedSongs = await this.prisma.savedSong.findMany({
      where: { userId },
      include: { song: true },
    });

    const userPlaylists = await this.prisma.playlist.findMany({
      where: { userId },
      select: { name: true },
    });

    const existingNames = new Set(userPlaylists.map((p: { name: string }) => p.name.toLowerCase()));

    const tagMap = new Map<string, string[]>();

    for (const saved of savedSongs) {
      const tags = (saved.song.metadata as { tags?: string[] })?.tags;
      if (Array.isArray(tags)) {
        for (const tag of tags) {
          if (!tagMap.has(tag)) tagMap.set(tag, []);
          tagMap.get(tag)!.push(saved.song.id);
        }
      }
    }

    const suggestions = [];

    for (const [tag, songIds] of tagMap.entries()) {
      if (songIds.length >= 3 && !existingNames.has(tag.toLowerCase())) {
        suggestions.push({
          tag,
          title: `Create a ${tag} playlist`,
          description: `You've saved ${songIds.length} ${tag.toLowerCase()} songs.`,
          songIds,
        });
      }
    }

    return suggestions.sort((a, b) => b.songIds.length - a.songIds.length);
  }

  async getUserProfile(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        displayName: true,
        avatarUrl: true,
        _count: {
          select: { followers: true, following: true },
        },
        playlists: {
          where: { isPrivate: false },
          select: {
            id: true,
            name: true,
            description: true,
            isPrivate: true,
            createdAt: true,
            updatedAt: true,
            _count: {
              select: { songs: true }
            }
          }
        }
      }
    });

    if (!user) {
      const { HttpException, HttpStatus } = await import('@nestjs/common');
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    return {
      id: user.id,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      followerCount: user._count.followers,
      followingCount: user._count.following,
      publicPlaylists: user.playlists.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        isPrivate: p.isPrivate,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        songCount: p._count.songs
      })),
    };
  }

  async followUser(followerId: string, followingId: string) {
    const { HttpException, HttpStatus } = await import('@nestjs/common');

    if (followerId === followingId) {
      throw new HttpException('You cannot follow yourself', HttpStatus.BAD_REQUEST);
    }
    
    const targetUser = await this.prisma.user.findUnique({ where: { id: followingId } });
    if (!targetUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    try {
      await this.prisma.follow.create({
        data: {
          followerId,
          followingId,
        }
      });
      return { success: true };
    } catch (e: unknown) {
      if (e !== null && typeof e === 'object' && 'code' in e && (e as { code: string }).code === 'P2002') {
         return { success: true, alreadyFollowing: true };
      }
      throw e;
    }
  }

  async unfollowUser(followerId: string, followingId: string) {
    try {
      await this.prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          }
        }
      });
      return { success: true };
    } catch {
       return { success: true };
    }
  }

  async getFollowers(id: string) {
    const followers = await this.prisma.follow.findMany({
      where: { followingId: id },
      include: {
        follower: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          }
        }
      }
    });
    return followers.map(f => f.follower);
  }

  async getFollowing(id: string) {
    const following = await this.prisma.follow.findMany({
      where: { followerId: id },
      include: {
        following: {
          select: {
            id: true,
            displayName: true,
            avatarUrl: true,
          }
        }
      }
    });
    return following.map(f => f.following);
  }
}
