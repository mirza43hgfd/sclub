// SClub short links — own URL shortener for download links.
// Encodes "videoId:quality" as base64url, e.g. "efd98704-...:480p" -> "ZWZkOTcwNC0uLi4uOjQ4MHA".
// Short URLs look like: https://sclub-zeta.vercel.app/s/<code>

const ALLOWED_QUALITIES = new Set(['480p', '720p', '1080p', 'main']);

/**
 * Encode a video id + quality into a short URL-safe code.
 * @param {string} videoId
 * @param {string} quality - 480p | 720p | 1080p | main (defaults to 720p)
 * @returns {string} base64url code
 */
export function encodeShortLink(videoId, quality) {
  const q = String(quality || '720p').toLowerCase();
  const safeQuality = ALLOWED_QUALITIES.has(q) ? q : '720p';
  return Buffer.from(`${videoId}:${safeQuality}`, 'utf8').toString('base64url');
}

/**
 * Decode a short-link code back into { videoId, quality }.
 * @param {string} code
 * @returns {{videoId:string, quality:string} | null}
 */
export function decodeShortLink(code) {
  try {
    if (!code || typeof code !== 'string') return null;
    const raw = Buffer.from(code, 'base64url').toString('utf8');
    const idx = raw.indexOf(':');
    if (idx <= 0) return null;
    const videoId = raw.slice(0, idx).trim();
    const quality = raw.slice(idx + 1).trim().toLowerCase();
    if (!videoId) return null;
    if (!ALLOWED_QUALITIES.has(quality)) return null;
    return { videoId, quality };
  } catch {
    return null;
  }
}

/**
 * Build the full short URL for a video download link.
 * @param {string} baseUrl e.g. "https://sclub-zeta.vercel.app"
 */
export function shortLinkUrl(baseUrl, videoId, quality) {
  const base = String(baseUrl || '').replace(/\/+$/, '');
  return `${base}/s/${encodeShortLink(videoId, quality)}`;
}
