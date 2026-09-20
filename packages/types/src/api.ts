export interface ApiResponse<T> {
  statusCode: number;
  message?: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  };
}

export interface RecognitionResult {
  title: string;
  artist: string;
  confidence: number;
  songId?: string; // If matched to existing DB song
}

export interface SyncJob {
  id: string;
  playlistId: string;
  provider: 'spotify' | 'youtube';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncResult {
  jobId: string;
  matched: number;
  skipped: number;
  unavailable: number;
  errors?: string[];
}
