import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SyncService {
  constructor(
    @InjectQueue('sync-queue') private syncQueue: Queue,
    private prisma: PrismaService,
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

    const job = await this.syncQueue.add('spotify-sync', {
      userId,
      playlistId,
    });

    return job.id as string;
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

    const job = await this.syncQueue.add('youtube-sync', {
      userId,
      playlistId,
    });

    return job.id as string;
  }

  async getJobStatus(jobId: string, userId: string) {
    const job = await this.syncQueue.getJob(jobId);
    if (!job) {
      throw new NotFoundException('Job not found');
    }
    
    if (job.data.userId !== userId) {
      throw new ForbiddenException('Not your job');
    }

    const state = await job.getState();
    const progress = job.progress;
    const result = job.returnvalue;

    return {
      id: job.id,
      state,
      progress,
      result,
      failedReason: job.failedReason,
    };
  }
}
