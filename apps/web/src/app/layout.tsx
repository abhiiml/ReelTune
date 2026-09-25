import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ReelTune — Save Songs from Instagram Reels to Spotify & YouTube',
  description:
    'Identify songs from Instagram Reels with one tap, organize your personal library into playlists, and seamlessly sync them to Spotify and YouTube Music.',
  openGraph: {
    title: 'ReelTune — Music Discovery Reimagined',
    description:
      'Never lose a track you heard in a Reel. Instantly identify, organize, and sync music across streaming platforms.',
    type: 'website',
    url: 'https://reeltune.app',
    siteName: 'ReelTune',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'ReelTune — Reels to Playlists in Seconds',
    description:
      'Identify songs from Instagram Reels, save to your library, and auto-sync to Spotify & YouTube Music.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={manrope.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <meta name="theme-color" content="#080706" />
      </head>
      <body className="bg-bgPrimary text-textPrimary min-h-screen selection:bg-accent selection:text-bgPrimary antialiased">
        {children}
      </body>
    </html>
  );
}
