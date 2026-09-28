import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ShareService } from './share.service.js';
import { extractAndNormalizeInstagramUrl } from './utils/url.util.js';

describe('Instagram URL Extraction & Validation', () => {
  it('extracts and normalizes standard reel URLs', () => {
    const res = extractAndNormalizeInstagramUrl('https://www.instagram.com/reel/DDh2O3pv8mQ/');
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe('https://www.instagram.com/reel/DDh2O3pv8mQ/');
    expect(res.reelId).toBe('DDh2O3pv8mQ');
  });

  it('extracts reel URLs with query tracking params', () => {
    const res = extractAndNormalizeInstagramUrl(
      'https://instagram.com/reel/DDh2O3pv8mQ/?igsh=MWQ1ZGUxMzBkMA==&utm_source=ig_web_button_share_sheet',
    );
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe('https://www.instagram.com/reel/DDh2O3pv8mQ/');
    expect(res.reelId).toBe('DDh2O3pv8mQ');
  });

  it('extracts reel URLs from shared text messages', () => {
    const res = extractAndNormalizeInstagramUrl(
      'Check out this song! https://www.instagram.com/reel/DDh2O3pv8mQ/ so good!',
    );
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe('https://www.instagram.com/reel/DDh2O3pv8mQ/');
  });

  it('extracts share/reel URLs', () => {
    const res = extractAndNormalizeInstagramUrl('https://www.instagram.com/share/reel/DDh2O3pv8mQ');
    expect(res.isValid).toBe(true);
    expect(res.cleanUrl).toBe('https://www.instagram.com/reel/DDh2O3pv8mQ/');
  });

  it('rejects invalid or non-instagram URLs', () => {
    expect(extractAndNormalizeInstagramUrl('').isValid).toBe(false);
    expect(extractAndNormalizeInstagramUrl('https://tiktok.com/@user/video/123').isValid).toBe(false);
    expect(extractAndNormalizeInstagramUrl('hello world').isValid).toBe(false);
  });
});

describe('ShareService Flow', () => {
  let shareService: ShareService;
  let mockRecognitionService: any;
  let mockSongsService: any;
  let mockDestinationsService: any;
  let mockProviderRegistry: any;
  let mockPrisma: any;
  let mockReelTuneProvider: any;

  beforeEach(() => {
    mockRecognitionService = {
      recognizeFromReel: vi.fn(),
    };
    mockSongsService = {
      getById: vi.fn(),
      search: vi.fn(),
      saveSong: vi.fn().mockResolvedValue({ alreadySaved: false }),
    };
    mockDestinationsService = {
      getPreferences: vi.fn().mockResolvedValue({
        provider: 'reeltune',
        playlistId: 'pl_123',
        playlistName: 'Reels Finds',
      }),
    };
    mockReelTuneProvider = {
      name: 'reeltune',
      displayName: 'ReelTune',
      isConnected: vi.fn().mockResolvedValue(true),
      searchAndAddTrack: vi.fn(),
    };
    mockProviderRegistry = {
      getProvider: vi.fn((name) => {
        if (name === 'reeltune') return mockReelTuneProvider;
        return undefined;
      }),
    };
    mockPrisma = {
      song: {
        create: vi.fn(),
      },
    };

    shareService = new ShareService(
      mockRecognitionService,
      mockSongsService,
      mockDestinationsService,
      mockProviderRegistry,
      mockPrisma,
    );
  });

  it('returns INVALID_URL when given an invalid reel URL', async () => {
    const result = await shareService.processSharedReel('user_1', {
      url: 'not-a-valid-url',
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('INVALID_URL');
  });

  it('returns RECOGNITION_FAILED when song cannot be recognized', async () => {
    mockRecognitionService.recognizeFromReel.mockResolvedValue({
      success: false,
      message: 'Could not identify song',
    });

    const result = await shareService.processSharedReel('user_1', {
      url: 'https://www.instagram.com/reel/DDh2O3pv8mQ/',
    });

    expect(result.success).toBe(false);
    expect(result.status).toBe('RECOGNITION_FAILED');
  });

  it('successfully recognizes song and adds to default destination playlist', async () => {
    mockRecognitionService.recognizeFromReel.mockResolvedValue({
      success: true,
      title: 'Die With A Smile',
      artist: 'Lady Gaga, Bruno Mars',
    });

    const mockSong = {
      id: 'song_abc',
      title: 'Die With A Smile',
      artists: ['Lady Gaga', 'Bruno Mars'],
      album: 'Single',
      artwork: 'https://artwork.jpg',
      duration: 250000,
    };

    mockSongsService.search.mockResolvedValue([mockSong]);

    mockReelTuneProvider.searchAndAddTrack.mockResolvedValue({
      status: 'ADDED',
      playlistId: 'pl_123',
      playlistName: 'Reels Finds',
      provider: 'reeltune',
    });

    const result = await shareService.processSharedReel('user_1', {
      url: 'https://www.instagram.com/reel/DDh2O3pv8mQ/',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('ADDED');
    expect(result.song?.title).toBe('Die With A Smile');
    expect(result.destination?.playlistName).toBe('Reels Finds');
    expect(mockSongsService.saveSong).toHaveBeenCalledWith('user_1', 'song_abc');
    expect(mockReelTuneProvider.searchAndAddTrack).toHaveBeenCalledWith(
      'user_1',
      'pl_123',
      mockSong,
    );
  });

  it('handles duplicate gracefully (ALREADY_EXISTS)', async () => {
    mockRecognitionService.recognizeFromReel.mockResolvedValue({
      success: true,
      title: 'Die With A Smile',
      artist: 'Lady Gaga, Bruno Mars',
    });

    const mockSong = {
      id: 'song_abc',
      title: 'Die With A Smile',
      artists: ['Lady Gaga', 'Bruno Mars'],
      album: 'Single',
      artwork: 'https://artwork.jpg',
      duration: 250000,
    };

    mockSongsService.search.mockResolvedValue([mockSong]);

    mockReelTuneProvider.searchAndAddTrack.mockResolvedValue({
      status: 'ALREADY_EXISTS',
      playlistId: 'pl_123',
      playlistName: 'Gym Songs',
      provider: 'reeltune',
    });

    const result = await shareService.processSharedReel('user_1', {
      url: 'https://www.instagram.com/reel/DDh2O3pv8mQ/',
    });

    expect(result.success).toBe(true);
    expect(result.status).toBe('ALREADY_EXISTS');
    expect(result.message).toContain('Already in Gym Songs');
  });
});
