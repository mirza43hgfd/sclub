// /sitemap.xml — dynamic sitemap for all published movies (SEO)
import { sql } from '@/lib/db.js';
export const dynamic = 'force-dynamic';
export async function GET() {
  const db = sql();
  const site = 'https://sclub-zeta.vercel.app';
  let videos = [];
  try {
    videos = await db`select id, created_at from videos where published = true order by created_at desc`;
  } catch {}
  const urls = [
    `<url><loc>${site}/</loc><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${site}/categories</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>`,
    `<url><loc>${site}/how-to-download</loc><changefreq>monthly</changefreq><priority>0.5</priority></url>`,
    ...videos.map((v) => {
      const d = v.created_at ? new Date(v.created_at).toISOString().split('T')[0] : '';
      return `<url><loc>${site}/movie/${v.id}</loc>${d ? `<lastmod>${d}</lastmod>` : ''}<changefreq>monthly</changefreq><priority>0.7</priority></url>`;
    })
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml; charset=utf-8' } });
}
