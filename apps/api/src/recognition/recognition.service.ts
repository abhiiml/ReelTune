import { Injectable, Logger } from '@nestjs/common';
import { RecognitionResult } from '@reeltune/types';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import { SongsService } from '../songs/songs.service.js';

@Injectable()
export class RecognitionService {
  private readonly logger = new Logger(RecognitionService.name);
  private readonly auddApiKey = process.env.AUDD_API_KEY;
  private readonly geminiApiKey = process.env.GEMINI_API_KEY;

  constructor(private readonly songsService: SongsService) {}

  private async recognizeWithAI(audioUrl: string): Promise<RecognitionResult | null> {
    if (!this.geminiApiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. Skipping Gemini AI recognition fallback.');
      return null;
    }

    try {
      this.logger.log('Attempting AI recognition fallback with Gemini...');
      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey: this.geminiApiKey });

      let buffer: Buffer;
      let mimeType = 'audio/mp4';

      if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        try {
          const response = await fetch(audioUrl, { signal: controller.signal });
          clearTimeout(timeoutId);
          if (!response.ok) {
            throw new Error(`Could not fetch audio for AI (status ${response.status})`);
          }
          const arrayBuffer = await response.arrayBuffer();
          buffer = Buffer.from(arrayBuffer);
          mimeType = response.headers.get('content-type') || 'audio/mp4';
        } catch (fetchErr) {
          clearTimeout(timeoutId);
          throw fetchErr;
        }
      } else {
        // Local file
        if (!fs.existsSync(audioUrl)) {
          throw new Error(`Local audio file does not exist: ${audioUrl}`);
        }
        buffer = await fs.promises.readFile(audioUrl);
        if (audioUrl.endsWith('.mp3')) mimeType = 'audio/mp3';
        else if (audioUrl.endsWith('.m4a') || audioUrl.endsWith('.mp4')) mimeType = 'audio/mp4';
        else if (audioUrl.endsWith('.wav')) mimeType = 'audio/wav';
      }

      const prompt =
        'Listen to this audio snippet. Identify the song name and the artist. Return ONLY a JSON object in this exact format: {"title": "Song Name", "artist": "Artist Name"}. If you cannot identify it at all, return {"error": "Unknown"}. Do not return markdown.';

      // Attempt with gemini-2.0-flash first, fallback to gemini-1.5-flash
      const modelsToTry = ['gemini-2.0-flash', 'gemini-1.5-flash'];
      let aiResponseText: string | undefined;

      for (const model of modelsToTry) {
        try {
          const aiResponse = await ai.models.generateContent({
            model,
            contents: [
              { text: prompt },
              { inlineData: { data: buffer.toString('base64'), mimeType } },
            ],
          });
          aiResponseText = aiResponse.text;
          if (aiResponseText) break;
        } catch (modelErr) {
          this.logger.warn(`Gemini model ${model} failed: ${modelErr instanceof Error ? modelErr.message : modelErr}`);
        }
      }

      if (!aiResponseText) return null;

      const cleaned = aiResponseText.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleaned);
      if (data.title && data.artist && data.title !== 'Song Name' && !data.error) {
        this.logger.log(`Gemini identified song: "${data.title}" by ${data.artist}`);
        const songs = await this.songsService.search(`${data.title} ${data.artist}`).catch(() => []);
        return {
          title: data.title,
          artist: data.artist,
          confidence: 85,
          songId: songs.length > 0 ? songs[0].id : undefined,
        };
      }
      return null;
    } catch (e) {
      this.logger.error(`AI Recognition failed: ${e instanceof Error ? e.message : 'Unknown'}`);
      return null;
    }
  }

  async recognizeAudio(audioUrl: string): Promise<RecognitionResult> {
    if (!this.auddApiKey) {
      this.logger.warn('AUDD_API_KEY is not set. Attempting AI recognition fallback...');
      const aiResult = await this.recognizeWithAI(audioUrl);
      if (aiResult) return aiResult;
      throw new Error('Song recognition is unavailable: AudD API key is not configured and AI fallback failed.');
    }

    try {
      const params = new URLSearchParams();
      params.append('api_token', this.auddApiKey);
      params.append('url', audioUrl);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let response: Response;
      try {
        response = await fetch('https://api.audd.io/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: params.toString(),
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response.ok) {
        throw new Error(`Failed to reach AudD API (status ${response.status})`);
      }

      const result = await response.json();

      // Check for AudD error object (e.g. invalid api_token error 900)
      if (result.status === 'error') {
        const errorMsg = result.error?.error_message || 'AudD service error';
        this.logger.warn(`AudD returned error code ${result.error?.error_code}: ${errorMsg}. Attempting AI fallback...`);
        const aiResult = await this.recognizeWithAI(audioUrl);
        if (aiResult) return aiResult;
        throw new Error(`Music recognition provider error: ${errorMsg}`);
      }

      if (result.status === 'success' && result.result) {
        const title = result.result.title;
        const artist = result.result.artist;
        const songs = await this.songsService.search(`${title} ${artist}`).catch(() => []);

        return {
          title,
          artist,
          confidence: 100,
          songId: songs.length > 0 ? songs[0].id : undefined,
        };
      }

      // No match found in AudD, attempt Gemini AI fallback
      this.logger.log('AudD returned no match. Attempting Gemini AI recognition fallback...');
      const aiResult = await this.recognizeWithAI(audioUrl);
      if (aiResult) return aiResult;

      throw new Error('No matching song could be identified from this audio.');
    } catch (error: unknown) {
      this.logger.error(`Recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Try AI fallback if not already tried
      if (error instanceof Error && !error.message.includes('AI fallback failed')) {
        const aiResult = await this.recognizeWithAI(audioUrl);
        if (aiResult) return aiResult;
      }

      throw error;
    }
  }

  async recognizeFromReel(reelUrl: string) {
    this.logger.log(`Extracting media from Reel: ${reelUrl}`);

    try {
      const rawInfo = await youtubedl(reelUrl, {
        dumpSingleJson: true,
        noWarnings: true,
        noCheckCertificates: true,
        preferFreeFormats: true,
        referer: 'https://www.instagram.com/',
      });

      const mediaInfo = rawInfo as Record<string, unknown>;
      let audioUrl = mediaInfo.url as string | undefined;
      const formats = mediaInfo.formats as Array<{ acodec?: string; url: string }> | undefined;

      if (!audioUrl && formats && formats.length > 0) {
        const audioFormat = formats.find((f) => f.acodec && f.acodec !== 'none');
        if (audioFormat) {
          audioUrl = audioFormat.url;
        } else {
          audioUrl = formats[0].url;
        }
      }

      if (!audioUrl) {
        return {
          success: false,
          message: 'Could not extract direct media stream from this Reel.',
          candidates: [],
        };
      }

      this.logger.log('Direct media URL extracted, recognizing audio...');
      const result = await this.recognizeAudio(audioUrl);
      return { success: true, ...result };
    } catch (error: unknown) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      this.logger.error(`Reel extraction or recognition failed: ${errorMsg}`);

      // Distinguish specific failure modes for actionable user feedback
      let userMessage = "We couldn't identify the song from this Reel.";

      if (
        errorMsg.includes('empty media response') ||
        errorMsg.includes('API is not granting access') ||
        errorMsg.includes('cookies') ||
        errorMsg.includes('login')
      ) {
        userMessage =
          'This Instagram Reel is private, login-protected, or temporarily restricted by Instagram.';
      } else if (
        errorMsg.includes('404') ||
        errorMsg.includes('not found') ||
        errorMsg.includes('does not exist')
      ) {
        userMessage = 'This Instagram Reel could not be found or has been deleted.';
      } else if (errorMsg.includes('No matching song')) {
        userMessage = 'No matching music could be detected in this Reel.';
      } else if (errorMsg.includes('provider error') || errorMsg.includes('authorization failed')) {
        userMessage = 'Music recognition service is temporarily unavailable. Please try searching manually.';
      }

      return {
        success: false,
        message: userMessage,
        candidates: [],
      };
    }
  }
}
