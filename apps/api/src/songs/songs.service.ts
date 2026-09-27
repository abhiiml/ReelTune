import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { SpotifyService } from '../integrations/spotify/spotify.service.js';
import { Song } from '@reeltune/types';
import { Prisma } from '@prisma/client';

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

  async getById(id: string): Promise<Song | null> {
    const song = await this.prisma.song.findUnique({
      where: { id },
    });

    if (!song) return null;

    return {
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
    };
  }
  async saveSong(userId: string, songId: string) {
    // Check if it's already saved
    const existing = await this.prisma.savedSong.findUnique({
      where: {
        userId_songId: {
          userId,
          songId,
        },
      },
    });

    if (existing) {
      // Per spec: return { alreadySaved: true, playlists: [...] }
      // Playlists feature is Phase 4, we'll return an empty array for now.
      return { alreadySaved: true, playlists: [] };
    }

    const savedSong = await this.prisma.savedSong.create({
      data: {
        userId,
        songId,
      },
      include: {
        song: true,
      },
    });

    // Fire and forget AI mood classification.
    // IMPORTANT: On Render Free tier, this best-effort background task 
    // may be lost if the server sleeps or restarts before completion.
    // We intentionally avoid Redis/BullMQ to keep the architecture $0.
    this.classifyMood(songId).catch((e) => {
      this.logger.error(`Background mood classification error: ${e.message}`);
    });

    return {
      alreadySaved: false,
      savedSong,
    };
  }

  async classifyMood(songId: string) {
    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song) return;
    
    const metadata = (song.metadata as Record<string, unknown>) || {};
    if (metadata.tags) return; // Already classified

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      this.logger.warn('GEMINI_API_KEY not set. Skipping AI mood classification.');
      return;
    }

    try {
      this.logger.log(`Attempting to classify mood for song: ${song.title}`);
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      
      const prompt = `Classify the mood of the song "${song.title}" by "${song.artists.join(', ')}". Choose exactly 2 to 3 tags from this exact list: [Chill, Energy, Romantic, Focus, Workout, Sad, Happy, Party]. Return ONLY a JSON array of strings (e.g. ["Chill", "Focus"]). Do not return markdown.`;
      
      const response = await ai.models.generateContent({
         model: 'gemini-2.5-flash',
         contents: prompt
      });
      
      const text = response.text;
      if (!text) return;
      
      const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const tags = JSON.parse(cleaned);
      
      if (Array.isArray(tags)) {
        metadata.tags = tags;
        await this.prisma.song.update({
          where: { id: songId },
          data: { metadata: metadata as Prisma.InputJsonValue }
        });
        this.logger.log(`Successfully classified mood for "${song.title}": ${tags.join(', ')}`);
      }
    } catch (error: unknown) {
      this.logger.error(`Mood classification failed for "${song?.title}": ${error instanceof Error ? error.message : 'Unknown'}`);
    }
  }

  async unsaveSong(userId: string, songId: string) {
    try {
      await this.prisma.savedSong.delete({
        where: {
          userId_songId: {
            userId,
            songId,
          },
        },
      });
      return { success: true };
    } catch {
      // If it doesn't exist, prisma throws P2025. We can safely ignore or return false.
      return { success: false, message: 'Song not in library' };
    }
  }
}
