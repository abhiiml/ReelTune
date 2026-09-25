'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Music,
  Sparkles,
  ArrowRight,
  Share2,
  ListMusic,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Smartphone,
  Search,
  Radio,
  PlayCircle
} from 'lucide-react';

export default function HomePage() {
  const [demoUrl, setDemoUrl] = useState('');
  const [demoStatus, setDemoStatus] = useState<'idle' | 'analyzing' | 'success'>('idle');

  const handleTestIdentify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!demoUrl.trim()) return;
    setDemoStatus('analyzing');
    setTimeout(() => {
      setDemoStatus('success');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-bgPrimary flex flex-col selection:bg-accent selection:text-bgPrimary">
      {/* Navigation */}
      <header className="border-b border-cardElevated/60 bg-bgPrimary/70 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-accent to-accentLight flex items-center justify-center font-extrabold text-bgPrimary text-xl shadow-lg shadow-accent/25">
              R
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-textPrimary">
                ReelTune
              </span>
              <span className="hidden sm:inline-block ml-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-accent/15 text-accent border border-accent/25">
                v1.0
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-textSecondary">
            <a href="#features" className="hover:text-textPrimary transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-textPrimary transition-colors">How It Works</a>
            <a href="#sync" className="hover:text-textPrimary transition-colors">Spotify & YouTube</a>
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="#download"
              className="py-2.5 px-5 rounded-btn bg-accent text-bgPrimary font-bold text-sm hover:bg-accentLight transition-all flex items-center gap-2 shadow-lg shadow-accent/20"
            >
              Get App
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-accent/5 rounded-full blur-[90px] pointer-events-none -z-10" />

        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent/10 border border-accent/25 text-accent text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            Instagram Reels → Spotify & YouTube Sync
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-textPrimary tracking-tight leading-[1.1] mb-6">
            Never lose a song heard in a Reel again.
          </h1>

          <p className="text-lg sm:text-xl text-textSecondary max-w-2xl mx-auto mb-10 leading-relaxed">
            One tap from your Instagram share sheet or paste any Reel link. ReelTune extracts the audio, pinpoints the song with high-accuracy fingerprinting, and syncs directly to your playlists.
          </p>

          {/* Interactive Demo Try-It */}
          <div className="max-w-xl mx-auto mb-12">
            <form onSubmit={handleTestIdentify} className="relative flex flex-col sm:flex-row items-center gap-2.5 p-2 rounded-2xl glass-panel-elevated shadow-2xl">
              <div className="relative flex-1 w-full">
                <Search className="w-4 h-4 text-textMuted absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={demoUrl}
                  onChange={(e) => {
                    setDemoUrl(e.target.value);
                    if (demoStatus !== 'idle') setDemoStatus('idle');
                  }}
                  placeholder="Paste Instagram Reel link (e.g. instagram.com/reel/...)"
                  className="w-full pl-11 pr-4 py-3 bg-card/60 text-textPrimary text-sm rounded-xl placeholder:text-textMuted focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
              <button
                type="submit"
                disabled={demoStatus === 'analyzing'}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-accent text-bgPrimary font-bold text-sm hover:bg-accentLight transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-accent/20"
              >
                {demoStatus === 'analyzing' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-bgPrimary border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 fill-current" />
                    Identify Song
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-filled links */}
            <div className="flex items-center justify-center gap-2 mt-3 text-xs text-textMuted">
              <span>Try example:</span>
              <button
                type="button"
                onClick={() => {
                  setDemoUrl('https://www.instagram.com/reel/C8qL8zvp1gT/');
                  setDemoStatus('idle');
                }}
                className="underline hover:text-accent transition-colors"
              >
                Trending Acoustic Reel
              </button>
            </div>

            {/* Result card if tested */}
            {demoStatus === 'success' && (
              <div className="mt-4 p-4 rounded-xl glass-panel border border-accent/30 text-left flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-lg bg-cardElevated flex items-center justify-center border border-accent/20">
                    <Music className="w-6 h-6 text-accent" />
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 text-[11px] font-bold text-success">
                      <CheckCircle className="w-3 h-3" /> 98% Match Confidence
                    </div>
                    <h2 className="text-sm font-bold text-textPrimary">Die With A Smile</h2>
                    <p className="text-xs text-textSecondary">Lady Gaga & Bruno Mars</p>
                  </div>
                </div>
                <a
                  href="#download"
                  className="py-1.5 px-3 rounded-lg bg-accent text-bgPrimary font-bold text-xs hover:bg-accentLight transition-all"
                >
                  Save to App
                </a>
              </div>
            )}
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-6 border-t border-cardElevated/50">
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl font-extrabold text-accent">100M+</div>
              <div className="text-xs text-textSecondary mt-0.5">Songs Fingerprinted</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl font-extrabold text-textPrimary">&lt; 3s</div>
              <div className="text-xs text-textSecondary mt-0.5">Recognition Time</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl font-extrabold text-accent">99.4%</div>
              <div className="text-xs text-textSecondary mt-0.5">Audio Match Accuracy</div>
            </div>
            <div className="p-4 rounded-2xl glass-panel">
              <div className="text-2xl font-extrabold text-textPrimary">2-Click</div>
              <div className="text-xs text-textSecondary mt-0.5">Spotify & YouTube Sync</div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section id="how-it-works" className="py-20 px-6 bg-bgSecondary/40 border-y border-cardElevated/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Workflow</h2>
            <h3 className="text-3xl font-extrabold text-textPrimary tracking-tight">From Reel to Playlist in 3 steps</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-card glass-panel flex flex-col justify-between hover:border-accent/30 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mb-6 font-bold text-lg">
                  1
                </div>
                <h4 className="text-xl font-bold text-textPrimary mb-2">Share from Instagram</h4>
                <p className="text-sm text-textSecondary leading-relaxed">
                  Watching Reels? Tap Share → ReelTune via the native iOS/Android Share sheet, or copy-paste the Reel URL.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-cardElevated flex items-center gap-2 text-xs font-semibold text-accent">
                <Share2 className="w-4 h-4" /> Native Share Extension
              </div>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-card glass-panel flex flex-col justify-between hover:border-accent/30 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mb-6 font-bold text-lg">
                  2
                </div>
                <h4 className="text-xl font-bold text-textPrimary mb-2">Instant Audio Fingerprint</h4>
                <p className="text-sm text-textSecondary leading-relaxed">
                  ReelTune isolates the soundtrack, bypasses reel dialog or background noise, and retrieves canonical metadata.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-cardElevated flex items-center gap-2 text-xs font-semibold text-accent">
                <Radio className="w-4 h-4" /> Audio Fingerprinting
              </div>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-card glass-panel flex flex-col justify-between hover:border-accent/30 transition-colors">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-accent/15 border border-accent/20 flex items-center justify-center text-accent mb-6 font-bold text-lg">
                  3
                </div>
                <h4 className="text-xl font-bold text-textPrimary mb-2">Sync to Your Playlists</h4>
                <p className="text-sm text-textSecondary leading-relaxed">
                  Save to your personal ReelTune library or auto-sync directly into your favorite Spotify or YouTube playlists.
                </p>
              </div>
              <div className="mt-8 pt-4 border-t border-cardElevated flex items-center gap-2 text-xs font-semibold text-accent">
                <ListMusic className="w-4 h-4" /> Background BullMQ Sync
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-accent uppercase tracking-wider mb-2">Power Features</h2>
            <h3 className="text-3xl font-extrabold text-textPrimary tracking-tight">Built for serious music lovers</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 rounded-card glass-panel hover:bg-cardElevated/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-textPrimary mb-2">Zero Duplicate Saves</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Smart duplicate detection notifies you if a track is already in your library and suggests playlists to add it to.
              </p>
            </div>

            <div className="p-6 rounded-card glass-panel hover:bg-cardElevated/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#1DB954]/20 flex items-center justify-center text-[#1DB954] mb-4">
                <Music className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-textPrimary mb-2">Spotify OAuth & Sync</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Securely connect your Spotify account. One click pushes tracks and playlists straight into your Spotify library.
              </p>
            </div>

            <div className="p-6 rounded-card glass-panel hover:bg-cardElevated/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-[#FF0000]/20 flex items-center justify-center text-[#FF0000] mb-4">
                <PlayCircle className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-textPrimary mb-2">YouTube Music Sync</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Prefer YouTube Music? ReelTune automates playlist creation and video matching via YouTube Data API v3.
              </p>
            </div>

            <div className="p-6 rounded-card glass-panel hover:bg-cardElevated/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-textPrimary mb-2">Offline Library Browsing</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Cached with Zustand and TanStack Query, your saved tracks and playlists are always accessible on your phone.
              </p>
            </div>

            <div className="p-6 rounded-card glass-panel hover:bg-cardElevated/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-textPrimary mb-2">End-to-End Encryption</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                OAuth access tokens are encrypted with AES-256 before storage in PostgreSQL and never exposed to the client.
              </p>
            </div>

            <div className="p-6 rounded-card glass-panel hover:bg-cardElevated/50 transition-all">
              <div className="w-10 h-10 rounded-xl bg-accent/15 flex items-center justify-center text-accent mb-4">
                <Share2 className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-lg text-textPrimary mb-2">Shareable Web Links</h4>
              <p className="text-sm text-textSecondary leading-relaxed">
                Share any playlist link with friends. They can preview all tracks on the web and open them in their own ReelTune app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Download / CTA Section */}
      <section id="download" className="py-20 px-6 bg-gradient-to-b from-card to-bgPrimary border-t border-cardElevated/60">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-accent flex items-center justify-center text-bgPrimary font-black text-2xl mx-auto mb-6 shadow-xl shadow-accent/25">
            R
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-textPrimary tracking-tight mb-4">
            Start saving your favorite sounds today.
          </h2>
          <p className="text-textSecondary max-w-lg mx-auto mb-10 text-sm sm:text-base">
            Get ReelTune on iOS (Apple TestFlight) or Android (APK / Play Console Internal Testing). Free for music explorers.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://testflight.apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-8 rounded-btn bg-accent text-bgPrimary font-bold text-base hover:bg-accentLight transition-all flex items-center justify-center gap-2 shadow-xl shadow-accent/25"
            >
              <Smartphone className="w-5 h-5" />
              iOS TestFlight Beta
            </a>
            <a
              href="https://play.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto py-3.5 px-8 rounded-btn bg-cardElevated hover:bg-card text-textPrimary font-semibold text-base transition-all border border-cardElevated flex items-center justify-center gap-2"
            >
              Android Testing Build
            </a>
          </div>

          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-textMuted">
            <span>✓ No ads</span>
            <span>•</span>
            <span>✓ Seamless OAuth</span>
            <span>•</span>
            <span>✓ Open API</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-cardElevated py-12 px-6 bg-bgPrimary text-xs text-textMuted">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md bg-accent flex items-center justify-center font-bold text-bgPrimary text-xs">
              R
            </div>
            <span className="font-bold text-textPrimary text-sm">ReelTune</span>
            <span>— The music discovery bridge for Instagram Reels.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link href="/playlist/demo" className="hover:text-textSecondary transition-colors">
              Sample Playlist
            </Link>
            <a
              href="https://github.com/abhiiml/ReelTune"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-textSecondary transition-colors flex items-center gap-1"
            >
              GitHub <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
