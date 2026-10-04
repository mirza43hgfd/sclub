import { redirect, notFound } from 'next/navigation';
import { decodeShortLink } from '@/lib/shortlink';

// SClub short links: /s/<code> where <code> is base64url("videoId:quality").
// Decodes and redirects to the ad-monetized /go interstitial.
export default function ShortLinkPage({ params }) {
  const decoded = decodeShortLink(params.code);
  if (!decoded) notFound();
  redirect(`/go/${decoded.videoId}?q=${decoded.quality}`);
}
