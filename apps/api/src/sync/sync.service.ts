import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { JobQueueService } from './job-queue.service.js';
import { SpotifySyncProcessor } from './spotify-sync.processor.js';
import { YoutubeSyncProcessor } from './youtube-sync.processor.js';

@Injectable()
export class SyncService {
  constructor(
    private jobQueue: JobQueueService,
    private prisma: PrismaService,
    private spotifyProcessor: SpotifySyncProcessor,
    private youtubeProcessor: YoutubeSyncProcessor,
  ) {}

  async enqueueSpotifySync(userId: string, playlistId: string): Promise<string> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Not your playlist');
    }

    const connectedAccount = await this.prisma.connectedAccount.findUnique({
      where: { userId_provider: { userId, provider: 'spotify' } },
    });

    if (!connectedAccount) {
      throw new BadRequestException('Spotify is not connected');
    }

    const jobId = this.jobQueue.createJob('spotify-sync', { userId, playlistId });
    
    // Fire and forget
    this.spotifyProcessor.process(jobId, { userId, playlistId }).catch(() => {});

    return jobId;
  }

  async enqueueYouTubeSync(userId: string, playlistId: string): Promise<string> {
    const playlist = await this.prisma.playlist.findUnique({
      where: { id: playlistId },
    });

    if (!playlist) {
      throw new NotFoundException('Playlist not found');
    }

    if (playlist.userId !== userId) {
      throw new ForbiddenException('Not your playlist');
    }

    const connectedAccount = await this.prisma.connectedAccount.findUnique({
      where: { userId_provider: { userId, provider: 'youtube' } },
    });

    if (!connectedAccount) {
      throw new BadRequestException('YouTube is not connected');
    }

    const jobId = this.jobQueue.createJob('youtube-sync', { userId, playlistId });

    // Fire and forget
    this.youtubeProcessor.process(jobId, { userId, playlistId }).catch(() => {});

    return jobId;
  }

  async getJobStatus(jobId: string, userId: string) {
    const job = this.jobQueue.getJob<{ userId: string }>(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    
    if (job.data.userId !== userId) {
      throw new ForbiddenException('Not your job');
    }

    return {
      id: job.id,
      state: job.state,
      progress: job.progress,
      result: job.returnvalue,
      failedReason: job.failedReason,
    };
  }
}
