'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowUpRight, Music2 } from 'lucide-react';

function SpotifyCallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (code) {
      const deepLink = `reeltune://settings/spotify?code=${encodeURIComponent(code)}`;
      window.location.href = deepLink;
      setRedirected(true);
    }
  }, [code]);

  const deepLink = code
    ? `reeltune://settings/spotify?code=${encodeURIComponent(code)}`
    : 'reeltune://settings/spotify';

  return (
    <div className="flex flex-col items-center max-w-md w-full p-8 rounded-card glass-panel text-center glow-card">
      <div className="w-16 h-16 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center mb-6">
        <Music2 className="w-8 h-8 text-[#1DB954]" />
      </div>

      {error ? (
        <>
          <div className="inline-flex items-center gap-2 text-error text-sm font-semibold mb-2">
            <AlertCircle className="w-4 h-4" /> Spotify Authorization Failed
          </div>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">Connection Cancelled</h1>
          <p className="text-textSecondary text-sm mb-6">
            Spotify authorization could not be completed. You can return to ReelTune and try again.
          </p>
          <a
            href="reeltune://settings"
            className="w-full py-3.5 px-6 rounded-btn bg-cardElevated hover:bg-accent hover:text-bgPrimary text-textPrimary font-semibold transition-all inline-flex items-center justify-center gap-2"
          >
            Return to ReelTune
          </a>
        </>
      ) : (
        <>
          <div className="inline-flex items-center gap-2 text-success text-sm font-semibold mb-2">
            <CheckCircle2 className="w-4 h-4" /> Spotify Connected
          </div>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">Returning to ReelTune</h1>
          <p className="text-textSecondary text-sm mb-6">
            We are redirecting you back to the mobile app to complete your Spotify sync setup.
          </p>

          <a
            href={deepLink}
            className="w-full py-3.5 px-6 rounded-btn bg-accent text-bgPrimary font-bold hover:bg-accentLight transition-all inline-flex items-center justify-center gap-2 shadow-lg shadow-accent/20"
          >
            Open ReelTune App
            <ArrowUpRight className="w-4 h-4" />
          </a>

          {redirected && (
            <p className="text-xs text-textMuted mt-4">
              If the app didn&apos;t open automatically, tap the button above.
            </p>
          )}
        </>
      )}
    </div>
  );
}

export default function SpotifyCallbackPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-bgPrimary">
      <Suspense
        fallback={
          <div className="flex flex-col items-center p-8 rounded-card glass-panel">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-textSecondary text-sm">Processing Spotify connection...</p>
          </div>
        }
      >
        <SpotifyCallbackContent />
      </Suspense>
    </main>
  );
}
