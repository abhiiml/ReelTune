import { Injectable, Logger } from '@nestjs/common';
import { RecognitionResult } from '@reeltune/types';
import youtubedl from 'youtube-dl-exec';
import { SongsService } from '../songs/songs.service.js';

@Injectable()
export class RecognitionService {
  private readonly logger = new Logger(RecognitionService.name);
  private readonly auddApiKey = process.env.AUDD_API_KEY;
  private readonly geminiApiKey = process.env.GEMINI_API_KEY;

  constructor(private readonly songsService: SongsService) {}

  private async recognizeWithAI(audioUrl: string): Promise<RecognitionResult | null> {
    if (!this.geminiApiKey) {
      this.logger.warn('GEMINI_API_KEY not set. Skipping AI fallback.');
      return null;
    }
    
    try {
       this.logger.log('Attempting AI recognition fallback with Gemini...');
       const { GoogleGenAI } = await import('@google/genai');
       const ai = new GoogleGenAI({ apiKey: this.geminiApiKey });
       
       const response = await fetch(audioUrl);
       if (!response.ok) throw new Error('Could not fetch audio for AI');
       const arrayBuffer = await response.arrayBuffer();
       const buffer = Buffer.from(arrayBuffer);
       const mimeType = response.headers.get('content-type') || 'audio/mp4';
       
       const prompt = "Listen to this audio snippet. Identify the song name and the artist. Return ONLY a JSON object in this exact format: {\"title\": \"Song Name\", \"artist\": \"Artist Name\"}. If you cannot identify it at all, return {\"error\": \"Unknown\"}. Do not return markdown.";
       
       const aiResponse = await ai.models.generateContent({
           model: 'gemini-2.5-flash',
           contents: [
               { text: prompt },
               { inlineData: { data: buffer.toString('base64'), mimeType } }
           ]
       });
       
       const text = aiResponse.text;
       if (!text) return null;
       
       const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
       const data = JSON.parse(cleaned);
       if (data.title && data.artist) {
          this.logger.log(`Gemini identified song: ${data.title} by ${data.artist}`);
          const songs = await this.songsService.search(`${data.title} ${data.artist}`);
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
      this.logger.warn('AUDD_API_KEY is not set. Skipping AudD and trying AI fallback.');
      const aiResult = await this.recognizeWithAI(audioUrl);
      if (aiResult) return aiResult;
      throw new Error('Could not identify the song. Both AudD and AI are unavailable or failed.');
    }

    try {
      const params = new URLSearchParams();
      params.append('api_token', this.auddApiKey);
      params.append('url', audioUrl);

      const response = await fetch('https://api.audd.io/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
      });

      if (!response.ok) {
        throw new Error('Failed to reach AudD API');
      }

      const result = await response.json();

      if (result.status === 'success' && result.result) {
        const title = result.result.title;
        const artist = result.result.artist;
        const songs = await this.songsService.search(`${title} ${artist}`);

        return {
          title,
          artist,
          confidence: 100, // AudD basic returns exact match or null
          songId: songs.length > 0 ? songs[0].id : undefined,
        };
      }

      throw new Error('Could not identify the song.');
    } catch (error: unknown) {
      this.logger.error(`Recognition failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      const aiResult = await this.recognizeWithAI(audioUrl);
      if (aiResult) return aiResult;

      throw error;
    }
  }

  async recognizeFromReel(reelUrl: string) {
    this.logger.log(`Extracting audio from Reel: ${reelUrl}`);

    try {
      const rawInfo = await youtubedl(reelUrl, {
        dumpSingleJson: true,
        noWarnings: true,
        callHome: false,
        noCheckCertificates: true,
        preferFreeFormats: true,
        youtubeSkipDashManifest: true,
        referer: 'https://www.instagram.com/',
      });

      const mediaInfo = rawInfo as Record<string, unknown>;
      let audioUrl = mediaInfo.url as string | undefined;
      const formats = mediaInfo.formats as Array<{ acodec?: string; url: string }> | undefined;
      
      if (!audioUrl && formats && formats.length > 0) {
         const audioFormat = formats.find((f) => f.acodec !== 'none');
         if (audioFormat) {
           audioUrl = audioFormat.url;
         } else {
           audioUrl = formats[0].url;
         }
      }

      if (!audioUrl) {
        throw new Error('Could not extract direct media URL from Reel');
      }

      this.logger.log(`Successfully extracted direct media URL, sending to AudD...`);
      const result = await this.recognizeAudio(audioUrl);
      return { success: true, ...result };

    } catch (error: unknown) {
      this.logger.error(`Reel extraction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { success: false, message: 'Could not identify the song.', candidates: [] };
    }
  }
}
