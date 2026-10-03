// /robots.txt — allow indexing, block admin/api
export const dynamic = 'force-dynamic';
export async function GET() {
  const site = 'https://sclub-zeta.vercel.app';
  const txt = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api/\n\nSitemap: ${site}/sitemap.xml\n`;
  return new Response(txt, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
