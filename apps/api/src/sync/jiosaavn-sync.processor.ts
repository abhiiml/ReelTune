import { Injectable, Logger } from '@nestjs/common';
import { JobQueueService } from './job-queue.service.js';

@Injectable()
export class JioSaavnSyncProcessor {
  private readonly logger = new Logger(JioSaavnSyncProcessor.name);

  constructor(
    private jobQueue: JobQueueService,
  ) {}

  async process(jobId: string, data: { userId: string; playlistId: string }): Promise<void> {
    const { playlistId } = data;
    this.logger.log(`Processing sync for playlist ${playlistId} to JioSaavn (Job: ${jobId})`);
    
    this.jobQueue.markActive(jobId);

    try {
      // JioSaavn does not have a public API
      throw new Error('JioSaavn sync is unavailable. JioSaavn does not provide a public developer API.');
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      const stack = error instanceof Error ? error.stack : undefined;
      this.logger.error(`Sync failed: ${msg}`, stack);
      this.jobQueue.markFailed(jobId, error);
    }
  }
}
