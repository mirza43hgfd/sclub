// Auth helpers: bcrypt passwords, JWT sessions in an httpOnly cookie.
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { sql } from './db.js';

const COOKIE_NAME = 'sclub_token';

function secret() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET is not set');
  return s;
}

export async function hashPassword(plain) {
  return bcrypt.hash(plain, 10);
}

export async function checkPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export function signToken(admin) {
  return jwt.sign({ id: admin.id, email: admin.email }, secret(), { expiresIn: '7d' });
}

/** Returns the logged-in admin ({id,email}) or null. */
export function currentAdmin() {
  try {
    const token = cookies().get(COOKIE_NAME)?.value;
    if (!token) return null;
    return jwt.verify(token, secret());
  } catch {
    return null;
  }
}

export function setAuthCookie(token) {
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAuthCookie() {
  cookies().set(COOKIE_NAME, '', { path: '/', maxAge: 0 });
}

export function unauthorized() {
  return Response.json({ error: 'Unauthorized — admin login required' }, { status: 401 });
}

export const DEFAULT_SETTINGS = {
  site_name: 'SClub',
  tagline: 'Latest movie trailers, teasers & entertainment',
  logo_emoji: '🎬',
  primary_color: '#e5484d',
  hero_title: 'Watch. <span>Enjoy.</span> Share.',
  hero_subtitle: 'The hottest movie trailers and entertainment picks, all in one place. New trailers added regularly — join our community!',
  hero_banner_url: '',
  footer_text: 'Made for movie lovers.',
  facebook_url: '',
  instagram_url: '',
  telegram_url: '',
  howto_text: `HOW TO DOWNLOAD FROM SCLUB

1. Open the movie page and scroll to the download buttons.
2. Pick your quality: 480p (small size), 720p (good), or 1080p (best).
3. Tap the download button — the file will start downloading to your phone.
4. Google Drive links: tap Download, then choose "Download anyway" if asked.

TROUBLE?
- Link not working? Use the "Report" button on the movie page and we will fix it.
- Want a movie we don't have? Send a request on the Request page!`,
  ad_header_code: '',
  ad_infeed_code: '',
  ad_popunder_code: '',
  meta_description: 'SClub — latest Hollywood & Bollywood movie trailers, teasers and entertainment. Watch and download.'
};

export async function getSettings() {
  const db = sql();
  const rows = await db`select data from settings where id = 1`;
  return { ...DEFAULT_SETTINGS, ...((rows[0] && rows[0].data) || {}) };
}
