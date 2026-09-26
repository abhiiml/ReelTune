import { Music, Play, ExternalLink, Share2, Sparkles, Lock, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

interface ApiSong {
  id: string;
  title: string;
  artists?: string[];
  artist?: string;
  album: string;
  artwork?: string;
  duration: number;
  spotifyId?: string;
  youtubeId?: string;
}

interface PublicPlaylistData {
  id: string;
  name: string;
  description?: string;
  creator?: string;
  isPrivate?: boolean;
  songs: ApiSong[];
}

// Fallback preview data for offline SSR / demo IDs
const MOCK_PLAYLIST: PublicPlaylistData = {
  id: 'demo',
  name: 'Late Night Reels Vibes',
  description: 'Tracks discovered directly from Instagram Reels, auto-identified by ReelTune.',
  creator: 'ReelTune Curator',
  songs: [
    {
      id: '1',
      title: 'Die With A Smile',
      artist: 'Lady Gaga & Bruno Mars',
      album: 'Die With A Smile',
      duration: 251000,
      spotifyId: '2plbrEY59IikOBgB57599W',
    },
    {
      id: '2',
      title: 'Birds of a Feather',
      artist: 'Billie Eilish',
      album: 'HIT ME HARD AND SOFT',
      duration: 196000,
      spotifyId: '6dOtVTDmmpLyWRIQ99W',
    },
    {
      id: '3',
      title: 'Espresso',
      artist: 'Sabrina Carpenter',
      album: 'Short n’ Sweet',
      duration: 175000,
      spotifyId: '2qSk1kLHGIZb9r',
    },
  ],
};

async function getPlaylist(id: string): Promise<{ data: PublicPlaylistData | null; isPrivate?: boolean }> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  try {
    const res = await fetch(`${apiUrl}/api/v1/playlists/public/${id}`, {
      next: { revalidate: 30 },
    });

    if (res.status === 403) {
      return { data: null, isPrivate: true };
    }

    if (!res.ok) {
      if (id === 'demo' || id === '1') {
        return { data: MOCK_PLAYLIST };
      }
      return { data: null };
    }

    const data = await res.json();
    return { data };
  } catch {
    // If backend is unreachable, fallback for demo or null
    if (id === 'demo' || id === '1') {
      return { data: MOCK_PLAYLIST };
    }
    return { data: null };
  }
}

export default async function PlaylistPreviewPage({ params }: PlaylistPageProps) {
  const { id } = await params;
  const { data: playlist, isPrivate } = await getPlaylist(id);

  const formatDuration = (msOrSecs: number) => {
    const totalSeconds = msOrSecs > 1000 ? Math.floor(msOrSecs / 1000) : msOrSecs;
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between selection:bg-accent selection:text-bgPrimary">
      {/* Top Bar */}
      <header className="border-b border-cardElevated/80 bg-bgSecondary/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center font-bold text-bgPrimary text-lg shadow-md shadow-accent/20">
              R
            </div>
            <span className="font-bold text-xl tracking-tight text-textPrimary">ReelTune</span>
          </Link>
          <a
            href={`reeltune://playlist/${id}`}
            className="py-2 px-4 rounded-btn bg-accent text-bgPrimary font-semibold text-sm hover:bg-accentLight transition-all flex items-center gap-2 shadow-sm"
          >
            Open in App
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 py-12 w-full flex-1">
        {isPrivate ? (
          <div className="max-w-md mx-auto text-center p-12 rounded-card glass-panel my-12">
            <div className="w-16 h-16 rounded-full bg-accent/15 border border-accent/30 flex items-center justify-center text-accent mx-auto mb-6">
              <Lock className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-textPrimary mb-2">Private Playlist</h1>
            <p className="text-textSecondary text-sm mb-6 leading-relaxed">
              This playlist has been set to private by its creator and cannot be viewed publicly.
            </p>
            <Link
              href="/"
              className="py-3 px-6 rounded-btn bg-accent text-bgPrimary font-bold text-sm hover:bg-accentLight transition-all inline-flex items-center gap-2 shadow-md shadow-accent/20"
            >
              Explore ReelTune Home
            </Link>
          </div>
        ) : !playlist ? (
          <div className="max-w-md mx-auto text-center p-12 rounded-card glass-panel my-12">
            <div className="w-16 h-16 rounded-full bg-error/15 border border-error/30 flex items-center justify-center text-error mx-auto mb-6">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold text-textPrimary mb-2">Playlist Not Found</h1>
            <p className="text-textSecondary text-sm mb-6 leading-relaxed">
              The requested playlist could not be located or may have been deleted.
            </p>
            <Link
              href="/"
              className="py-3 px-6 rounded-btn bg-accent text-bgPrimary font-bold text-sm hover:bg-accentLight transition-all inline-flex items-center gap-2 shadow-md shadow-accent/20"
            >
              Back to Home
            </Link>
          </div>
        ) : (
          <>
            {/* Playlist Header Card */}
            <div className="p-8 rounded-card glass-panel mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
              <div className="w-40 h-40 rounded-artwork bg-gradient-to-br from-accent/30 to-cardElevated border border-accent/20 flex items-center justify-center shadow-2xl flex-shrink-0 overflow-hidden">
                {playlist.songs[0]?.artwork ? (
                  <img
                    src={playlist.songs[0].artwork}
                    alt={playlist.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Music className="w-16 h-16 text-accent" />
                )}
              </div>

              <div className="flex-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles className="w-3.5 h-3.5" /> ReelTune Playlist
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight mb-2">
                  {playlist.name}
                </h1>
                {playlist.description && (
                  <p className="text-textSecondary text-sm mb-4 leading-relaxed max-w-xl">
                    {playlist.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-textMuted">
                  <span>
                    Curated by <strong className="text-textSecondary">{playlist.creator || 'ReelTune User'}</strong>
                  </span>
                  <span>•</span>
                  <span>{playlist.songs.length} tracks</span>
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-6">
                  <a
                    href={`reeltune://playlist/${id}`}
                    className="py-3 px-6 rounded-btn bg-accent text-bgPrimary font-bold text-sm hover:bg-accentLight transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Listen in ReelTune
                  </a>
                  <a
                    href={`https://reeltune.app/playlist/${id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3 px-5 rounded-btn bg-cardElevated hover:bg-card text-textPrimary text-sm font-semibold transition-all border border-cardElevated flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Link
                  </a>
                </div>
              </div>
            </div>

            {/* Tracks List */}
            <div className="rounded-card glass-panel p-6">
              <h2 className="text-lg font-bold text-textPrimary mb-4">Tracks</h2>
              {playlist.songs.length === 0 ? (
                <p className="text-textMuted text-sm py-6 text-center">No songs in this playlist yet.</p>
              ) : (
                <div className="space-y-2">
                  {playlist.songs.map((song, index) => {
                    const artistName =
                      song.artist || (Array.isArray(song.artists) ? song.artists.join(', ') : 'Unknown Artist');
                    const spotifyUrl = song.spotifyId
                      ? `https://open.spotify.com/track/${song.spotifyId}`
                      : `https://open.spotify.com/search/${encodeURIComponent(`${song.title} ${artistName}`)}`;

                    return (
                      <div
                        key={song.id || index}
                        className="flex items-center justify-between p-3.5 rounded-xl hover:bg-cardElevated/50 transition-colors group"
                      >
                        <div className="flex items-center gap-4">
                          <span className="text-sm font-semibold text-textMuted w-5 text-center">
                            {index + 1}
                          </span>
                          <div className="w-11 h-11 rounded-lg bg-cardElevated flex items-center justify-center flex-shrink-0 border border-cardElevated overflow-hidden">
                            {song.artwork ? (
                              <img src={song.artwork} alt={song.title} className="w-full h-full object-cover" />
                            ) : (
                              <Music className="w-5 h-5 text-accent" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-textPrimary group-hover:text-accent transition-colors">
                              {song.title}
                            </h3>
                            <p className="text-xs text-textSecondary">{artistName}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {song.duration && (
                            <span className="text-xs text-textMuted hidden sm:inline">
                              {formatDuration(song.duration)}
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <a
                              href={spotifyUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-lg bg-card hover:bg-[#1DB954]/20 text-[#1DB954] transition-colors"
                              title="Play on Spotify"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-cardElevated/80 py-8 text-center text-xs text-textMuted">
        <p>© {new Date().getFullYear()} ReelTune. All rights reserved.</p>
      </footer>
    </div>
  );
}
