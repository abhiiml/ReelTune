import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { SpotifyService } from '../integrations/spotify/spotify.service.js';
import { Song } from '@reeltune/types';
import * as crypto from 'crypto';

@Injectable()
export class SongsService {
  private readonly logger = new Logger(SongsService.name);

  constructor(private readonly spotifyService: SpotifyService) {}

  async search(query: string): Promise<Song[]> {
    const spotifyTracks = await this.spotifyService.searchTracks(query);

    if (spotifyTracks.length === 0) {
      return [];
    }

    const { Client } = await import('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();

    const savedSongs: Song[] = [];

    try {
      for (const track of spotifyTracks) {
        // Upsert by spotifyId
        const result = await client.query(
          `
          INSERT INTO "Song" ("id", "title", "artists", "album", "artwork", "duration", "isrc", "spotifyId", "youtubeId", "metadata")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
          ON CONFLICT ("spotifyId") DO UPDATE SET
            "title" = EXCLUDED."title",
            "artists" = EXCLUDED."artists",
            "album" = EXCLUDED."album",
            "artwork" = EXCLUDED."artwork",
            "metadata" = EXCLUDED."metadata"
          RETURNING *;
          `,
          [
            crypto.randomUUID(),
            track.title,
            track.artists, 
            track.album,
            track.artwork,
            track.duration,
            track.isrc,
            track.spotifyId,
            track.youtubeId,
            track.metadata,
          ]
        );
        
        savedSongs.push(result.rows[0] as Song);
      }
    } catch (e: unknown) {
      if (e instanceof Error) {
        this.logger.error(`Database error during song upsert: ${e.message}`, e.stack);
      } else {
        this.logger.error('Database error during song upsert: Unknown error');
      }
      throw new HttpException('Database error', HttpStatus.INTERNAL_SERVER_ERROR);
    } finally {
      await client.end();
    }

    return savedSongs;
  }
}
