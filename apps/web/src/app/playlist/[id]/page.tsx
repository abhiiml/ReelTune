import { Music, Play, ExternalLink, Share2, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface PlaylistPageProps {
  params: Promise<{ id: string }>;
}

export default async function PlaylistPreviewPage({ params }: PlaylistPageProps) {
  const { id } = await params;

  // Mock initial preview data (will connect to backend API /api/v1/playlists/:id when available)
  const playlist = {
    id,
    name: 'Late Night Reels Vibes',
    description: 'Tracks discovered directly from Instagram Reels, auto-identified by ReelTune.',
    songCount: 8,
    creator: 'ReelTune Curator',
    songs: [
      {
        id: '1',
        title: 'Die With A Smile',
        artist: 'Lady Gaga & Bruno Mars',
        album: 'Die With A Smile',
        duration: 251,
        spotifyUrl: 'https://open.spotify.com/track/2plbrEY59IikOBgB57599W',
        youtubeUrl: 'https://www.youtube.com/watch?v=kPa7bsKwL-8',
      },
      {
        id: '2',
        title: 'Birds of a Feather',
        artist: 'Billie Eilish',
        album: 'HIT ME HARD AND SOFT',
        duration: 196,
        spotifyUrl: 'https://open.spotify.com/track/6dOtVTDmmpLyWRIQ99W',
        youtubeUrl: 'https://www.youtube.com/watch?v=d5gf9dXb49o',
      },
      {
        id: '3',
        title: 'Espresso',
        artist: 'Sabrina Carpenter',
        album: 'Short n’ Sweet',
        duration: 175,
        spotifyUrl: 'https://open.spotify.com/track/2qSk1kLHGIZb9r',
        youtubeUrl: 'https://www.youtube.com/watch?v=eVli-tstM5E',
      },
    ],
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col justify-between">
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
        {/* Playlist Header Card */}
        <div className="p-8 rounded-card glass-panel mb-8 flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-40 h-40 rounded-artwork bg-gradient-to-br from-accent/30 to-cardElevated border border-accent/20 flex items-center justify-center shadow-2xl flex-shrink-0">
            <Music className="w-16 h-16 text-accent" />
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> ReelTune Playlist
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-textPrimary tracking-tight mb-2">
              {playlist.name}
            </h1>
            <p className="text-textSecondary text-sm mb-4 leading-relaxed max-w-xl">
              {playlist.description}
            </p>
            <div className="flex items-center gap-4 text-xs text-textMuted">
              <span>Curated by <strong className="text-textSecondary">{playlist.creator}</strong></span>
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
              <button
                type="button"
                className="py-3 px-5 rounded-btn bg-cardElevated hover:bg-card text-textPrimary text-sm font-semibold transition-all border border-cardElevated flex items-center gap-2"
              >
                <Share2 className="w-4 h-4" />
                Share
              </button>
            </div>
          </div>
        </div>

        {/* Tracks List */}
        <div className="rounded-card glass-panel p-6">
          <h2 className="text-lg font-bold text-textPrimary mb-4">Tracks</h2>
          <div className="space-y-2">
            {playlist.songs.map((song, index) => (
              <div
                key={song.id}
                className="flex items-center justify-between p-3.5 rounded-xl hover:bg-cardElevated/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-semibold text-textMuted w-5 text-center">
                    {index + 1}
                  </span>
                  <div className="w-11 h-11 rounded-lg bg-cardElevated flex items-center justify-center flex-shrink-0 border border-cardElevated">
                    <Music className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-textPrimary group-hover:text-accent transition-colors">
                      {song.title}
                    </h3>
                    <p className="text-xs text-textSecondary">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-textMuted hidden sm:inline">
                    {formatDuration(song.duration)}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={song.spotifyUrl}
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
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-cardElevated/80 py-8 text-center text-xs text-textMuted">
        <p>© {new Date().getFullYear()} ReelTune. All rights reserved.</p>
      </footer>
    </div>
  );
}
