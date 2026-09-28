/**
 * Extracts and normalizes an Instagram Reel or post URL from arbitrary shared text.
 */
export function extractAndNormalizeInstagramUrl(rawText: string): {
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
  // https://www.instagram.com/reel/C12345/
  // https://instagram.com/reels/C12345/?igsh=...
  // https://www.instagram.com/p/C12345/
  // https://www.instagram.com/share/reel/C12345/
  // https://instagr.am/reel/C12345
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
