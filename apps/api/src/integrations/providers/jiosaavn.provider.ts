import { Injectable } from '@nestjs/common';
import { Song } from '@reeltune/types';
import {
  MusicProvider,
  DestinationPlaylist,
  AddTrackResult,
} from './music-provider.interface.js';

@Injectable()
export class JioSaavnProvider implements MusicProvider {
  readonly name = 'jiosaavn';
  readonly displayName = 'JioSaavn';

  async isConnected(_userId: string): Promise<boolean> {
    return false;
  }

  async getPlaylists(_userId: string): Promise<DestinationPlaylist[]> {
    return [];
  }

  async searchAndAddTrack(
    _userId: string,
    playlistId: string | null,
    _song: Song,
  ): Promise<AddTrackResult> {
    return {
      status: 'PROVIDER_NOT_CONNECTED',
      playlistId: playlistId || '',
      playlistName: 'JioSaavn',
      provider: this.name,
      message: 'JioSaavn integration is currently unavailable.',
    };
  }
}
