import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';

export interface JobState<T = unknown> {
  id: string;
  name: string;
  data: T;
  state: 'waiting' | 'active' | 'completed' | 'failed';
  progress: number;
  returnvalue?: unknown;
  failedReason?: string;
  createdAt: Date;
}

@Injectable()
export class JobQueueService {
  private jobs = new Map<string, JobState>();

  createJob<T>(name: string, data: T): string {
    const id = randomUUID();
    this.jobs.set(id, {
      id,
      name,
      data,
      state: 'waiting',
      progress: 0,
      createdAt: new Date(),
    });
    return id;
  }

  getJob<T = unknown>(id: string): JobState<T> | undefined {
    return this.jobs.get(id) as JobState<T> | undefined;
  }

  updateProgress(id: string, progress: number) {
    const job = this.jobs.get(id);
    if (job) job.progress = progress;
  }

  markActive(id: string) {
    const job = this.jobs.get(id);
    if (job) job.state = 'active';
  }

  markCompleted(id: string, result: unknown) {
    const job = this.jobs.get(id);
    if (job) {
      job.state = 'completed';
      job.returnvalue = result;
      job.progress = 100;
    }
  }

  markFailed(id: string, error: unknown) {
    const job = this.jobs.get(id);
    if (job) {
      job.state = 'failed';
      job.failedReason = error instanceof Error ? error.message : String(error);
    }
  }
}
