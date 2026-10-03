import { sql } from '@/lib/db.js';
import { getSettings } from '@/lib/auth.js';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome.jsx';
import { PosterCard } from '@/components/HomeClient.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }) {
  const q = searchParams.q || '';
  const s = await getSettings().catch(() => ({}));
  return { title: q ? `Search: ${q} — ${s.site_name || 'SClub'}` : 'Search — SClub' };
}

export default async function SearchPage({ searchParams }) {
  const q = (searchParams.q || '').trim();
  const db = sql();
  const settings = await getSettings();
  let videos = [];
  if (q) {
    videos = await db`
      select v.*, c.name as category_name
      from videos v left join categories c on c.id = v.category_id
      where v.published = true and (v.title ilike ${'%' + q + '%'} or v.description ilike ${'%' + q + '%'})
      order by v.created_at desc limit 60`;
  }
  return (
    <>
      <SiteHeader settings={settings} />
      <div className="wrap" style={{ paddingTop: 26, paddingBottom: 40 }}>
        <div className="secttl"><h2>🔍 {q ? `Results for "${q}"` : 'Search'}</h2><div className="line" /></div>
        {q ? (
          videos.length ? (
            <div className="grid">
              {videos.map((v) => <PosterCard key={v.id} v={v} logo={settings.logo_emoji} />)}
            </div>
          ) : (
            <div className="empty"><div style={{ fontSize: 46, marginBottom: 12 }}>😕</div><div>Nothing found for "{q}". Try another name.</div></div>
          )
        ) : (
          <div className="empty">Type a movie name in the search box above.</div>
        )}
      </div>
      <SiteFooter settings={settings} />
    </>
  );
}
