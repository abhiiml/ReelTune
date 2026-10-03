import { Injectable, Logger } from '@nestjs/common';
import { RecognitionService } from '../recognition/recognition.service.js';
import { SongsService } from '../songs/songs.service.js';
import { DestinationsService } from '../integrations/destinations/destinations.service.js';
import { ProviderRegistryService } from '../integrations/providers/provider-registry.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { extractAndNormalizeInstagramUrl } from './utils/url.util.js';
import { Song } from '@reeltune/types';
import { AddTrackStatus } from '../integrations/providers/music-provider.interface.js';

export interface ShareReelInput {
  url: string;
  provider?: string;
  playlistId?: string;
}

export type ShareStatus =
  | AddTrackStatus
  | 'RECOGNITION_FAILED'
  | 'INVALID_URL';

export interface ShareReelResponse {
  success: boolean;
  status: ShareStatus;
  message: string;
  song?: {
    id: string;
    title: string;
    artists: string[];
    album: string;
    artwork: string;
    spotifyId?: string | null;
    youtubeId?: string | null;
  };
  destination?: {
    provider: string;
    providerDisplayName: string;
    playlistId: string;
    playlistName: string;
    externalTrackUrl?: string;
  };
  actions?: string[];
}

@Injectable()
export class ShareService {
  private readonly logger = new Logger(ShareService.name);

  constructor(
    private readonly recognitionService: RecognitionService,
    private readonly songsService: SongsService,
    private readonly destinationsService: DestinationsService,
    private readonly providerRegistry: ProviderRegistryService,
    private readonly prisma: PrismaService,
  ) {}

  async processSharedReel(userId: string, input: ShareReelInput): Promise<ShareReelResponse> {
    this.logger.log(`Processing shared Reel for user ${userId}: ${input.url}`);

    // 1. Validate & normalize URL
    const { isValid, cleanUrl } = extractAndNormalizeInstagramUrl(input.url);
    if (!isValid || !cleanUrl) {
      return {
        success: false,
        status: 'INVALID_URL',
        message: "That doesn't look like an Instagram Reel. Please share a valid Instagram link.",
        actions: ['TRY_AGAIN', 'PASTE_URL'],
      };
    }

    // 2. Perform Recognition
    const recognitionResult = await this.recognitionService.recognizeFromReel(cleanUrl);

    if (
      !recognitionResult ||
      !recognitionResult.success ||
      !('title' in recognitionResult) ||
      !('artist' in recognitionResult) ||
      !recognitionResult.title ||
      !recognitionResult.artist
    ) {
      this.logger.warn(`Song recognition failed for Reel: ${cleanUrl}`);
      const failureMessage =
        ('message' in recognitionResult && typeof recognitionResult.message === 'string' && recognitionResult.message)
          ? recognitionResult.message
          : "We couldn't identify the song from this Reel.";
      return {
        success: false,
        status: 'RECOGNITION_FAILED',
        message: failureMessage,
        actions: ['SEARCH_MANUALLY', 'TRY_AGAIN'],
      };
    }

    const { title, artist } = recognitionResult;
    const songIdFromRecognition = 'songId' in recognitionResult ? recognitionResult.songId : undefined;
    this.logger.log(`Song recognized: "${title}" by ${artist}`);

    // 3. Resolve / Upsert canonical Song record
    let song: Song | null = null;

    if (songIdFromRecognition) {
      song = await this.songsService.getById(songIdFromRecognition);
    }

    if (!song) {
      const searchResults = await this.songsService.search(`${title} ${artist}`);
      if (searchResults.length > 0) {
        song = searchResults[0];
      }
    }

    if (!song) {
      // Fallback: create song record directly in DB
      const created = await this.prisma.song.create({
        data: {
          title,
          artists: [artist],
          album: 'Single',
          artwork: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&q=80',
          duration: 180000,
          metadata: { source: 'instagram_share', url: cleanUrl },
        },
      });
      song = {
        id: created.id,
        title: created.title,
        artists: created.artists,
        album: created.album,
        artwork: created.artwork,
        duration: created.duration,
        isrc: created.isrc,
        spotifyId: created.spotifyId,
        youtubeId: created.youtubeId,
        metadata: {},
      };
    }

    // 4. Save song to user's saved library
    await this.songsService.saveSong(userId, song.id).catch((e) => {
      this.logger.warn(`Could not save song to user library: ${e.message}`);
    });

    // 5. Determine Destination Provider & Playlist
    let targetProviderName = input.provider;
    let targetPlaylistId = input.playlistId;

    if (!targetProviderName) {
      const userPref = await this.destinationsService.getPreferences(userId);
      targetProviderName = userPref.provider;
      targetPlaylistId = targetPlaylistId || userPref.playlistId || undefined;
    }

    const provider = this.providerRegistry.getProvider(targetProviderName);
    if (!provider) {
      return {
        success: false,
        status: 'PROVIDER_NOT_CONNECTED',
        message: `Selected provider "${targetProviderName}" is unavailable.`,
        actions: ['CONNECT_PROVIDER', 'VIEW_PLAYLISTS'],
      };
    }

    const isConnected = await provider.isConnected(userId);
    if (!isConnected) {
      return {
        success: false,
        status: 'PROVIDER_NOT_CONNECTED',
        message: `${provider.displayName} isn't connected yet.`,
        actions: [`CONNECT_${provider.name.toUpperCase()}`, 'SAVE_TO_REELTUNE'],
      };
    }

    // 6. Add track to destination playlist
    const addResult = await provider.searchAndAddTrack(userId, targetPlaylistId || null, song);

    return {
      success: addResult.status === 'ADDED' || addResult.status === 'ALREADY_EXISTS',
      status: addResult.status,
      message:
        addResult.status === 'ALREADY_EXISTS'
          ? `Already in ${addResult.playlistName} ✓`
          : `✓ Added to ${addResult.playlistName}`,
      song: {
        id: song.id,
        title: song.title,
        artists: song.artists,
        album: song.album,
        artwork: song.artwork,
        spotifyId: song.spotifyId,
        youtubeId: song.youtubeId,
      },
      destination: {
        provider: provider.name,
        providerDisplayName: provider.displayName,
        playlistId: addResult.playlistId,
        playlistName: addResult.playlistName,
        externalTrackUrl: addResult.externalTrackUrl,
      },
      actions: addResult.status === 'MATCH_FAILED' ? ['SEARCH_MANUALLY', 'CHOOSE_MATCH'] : ['OPEN_PLAYLIST', 'DONE'],
    };
  }
}
