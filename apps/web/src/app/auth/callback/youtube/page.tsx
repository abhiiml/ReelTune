'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, AlertCircle, ArrowUpRight, Youtube } from 'lucide-react';

function YouTubeCallbackContent() {
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const [redirected, setRedirected] = useState(false);

  useEffect(() => {
    if (code) {
      const deepLink = `reeltune://settings/youtube?code=${encodeURIComponent(code)}`;
      window.location.href = deepLink;
      setRedirected(true);
    }
  }, [code]);

  const deepLink = code
    ? `reeltune://settings/youtube?code=${encodeURIComponent(code)}`
    : 'reeltune://settings/youtube';

  return (
    <div className="flex flex-col items-center max-w-md w-full p-8 rounded-card glass-panel text-center glow-card">
      <div className="w-16 h-16 rounded-full bg-[#FF0000]/20 border border-[#FF0000]/40 flex items-center justify-center mb-6">
        <Youtube className="w-8 h-8 text-[#FF0000]" />
      </div>

      {error ? (
        <>
          <div className="inline-flex items-center gap-2 text-error text-sm font-semibold mb-2">
            <AlertCircle className="w-4 h-4" /> YouTube Authorization Failed
          </div>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">Connection Cancelled</h1>
          <p className="text-textSecondary text-sm mb-6">
            Google / YouTube authorization could not be completed. You can return to ReelTune and try again.
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
            <CheckCircle2 className="w-4 h-4" /> YouTube Connected
          </div>
          <h1 className="text-2xl font-bold text-textPrimary mb-2">Returning to ReelTune</h1>
          <p className="text-textSecondary text-sm mb-6">
            We are redirecting you back to the mobile app to complete your YouTube Music playlist sync setup.
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

export default function YouTubeCallbackPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-bgPrimary">
      <Suspense
        fallback={
          <div className="flex flex-col items-center p-8 rounded-card glass-panel">
            <div className="w-10 h-10 border-2 border-accent border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-textSecondary text-sm">Processing YouTube connection...</p>
          </div>
        }
      >
        <YouTubeCallbackContent />
      </Suspense>
    </main>
  );
}
