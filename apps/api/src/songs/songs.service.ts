import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SpotifyService } from '../integrations/spotify/spotify.service.js';
import { Song } from '@reeltune/types';

@Injectable()
export class SongsService {
  private readonly logger = new Logger(SongsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly spotifyService: SpotifyService,
  ) {}

  async search(query: string): Promise<Song[]> {
    const spotifyTracks = await this.spotifyService.searchTracks(query);

    if (spotifyTracks.length === 0) {
      return [];
    }

    const upsertedSongs = await Promise.all(
      spotifyTracks.map((track) =>
        this.prisma.song.upsert({
          where: { spotifyId: track.spotifyId! },
          create: {
            title: track.title!,
            artists: track.artists!,
            album: track.album!,
            artwork: track.artwork!,
            duration: track.duration!,
            isrc: track.isrc ?? null,
            spotifyId: track.spotifyId!,
            youtubeId: track.youtubeId ?? null,
            metadata: track.metadata ?? undefined,
          },
          update: {
            title: track.title!,
            artists: track.artists!,
            album: track.album!,
            artwork: track.artwork!,
            metadata: track.metadata ?? undefined,
          },
        }),
      ),
    );

    // Map Prisma result to @reeltune/types Song shape
    return upsertedSongs.map((song) => ({
      id: song.id,
      title: song.title,
      artists: song.artists,
      album: song.album,
      artwork: song.artwork,
      duration: song.duration,
      isrc: song.isrc,
      spotifyId: song.spotifyId,
      youtubeId: song.youtubeId,
      metadata: (song.metadata as Record<string, unknown>) ?? {},
    }));
  }
}
