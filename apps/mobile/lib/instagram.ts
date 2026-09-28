/**
 * Extracts and normalizes an Instagram Reel or post URL from arbitrary text or share intent.
 */
export function extractAndNormalizeInstagramUrl(rawText: string | null | undefined): {
  isValid: boolean;
  cleanUrl: string | null;
  reelId: string | null;
} {
  if (!rawText || typeof rawText !== 'string') {
    return { isValid: false, cleanUrl: null, reelId: null };
  }

  const trimmed = rawText.trim();

  // Match Instagram Reel, TV, Post or Share links
  // Examples:
  // https://www.instagram.com/reel/DDh2O3pv8mQ/
  // https://instagram.com/reels/DDh2O3pv8mQ/?igsh=...
  // https://www.instagram.com/p/DDh2O3pv8mQ/
  // https://www.instagram.com/share/reel/DDh2O3pv8mQ/
  // https://instagr.am/reel/DDh2O3pv8mQ
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:instagram\.com|instagr\.am)\/(?:reel|reels|p|tv|share\/reel)\/([A-Za-z0-9_-]+)/i;
  const match = trimmed.match(regex);

  if (!match || !match[1]) {
    return { isValid: false, cleanUrl: null, reelId: null };
  }

  const reelId = match[1];
  const cleanUrl = `https://www.instagram.com/reel/${reelId}/`;

  return {
    isValid: true,
    cleanUrl,
    reelId,
  };
}

export function isInstagramUrl(url: string | null | undefined): boolean {
  return extractAndNormalizeInstagramUrl(url).isValid;
}
