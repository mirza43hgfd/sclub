import Link from 'next/link';
import { sql } from '@/lib/db.js';
import { getSettings } from '@/lib/auth.js';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome.jsx';
import { PosterCard } from '@/components/HomeClient.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings().catch(() => ({}));
  return { title: `Categories — ${s.site_name || 'SClub'}` };
}

export default async function CategoriesPage() {
  const db = sql();
  const settings = await getSettings();
  const cats = await db`
    select c.*, (select count(*)::int from videos v where v.category_id = c.id and v.published = true) as n
    from categories c order by c.name`;
  const videos = await db`
    select v.*, c.name as category_name
    from videos v left join categories c on c.id = v.category_id
    where v.published = true order by v.created_at desc limit 12`;
  return (
    <>
      <SiteHeader settings={settings} active="cats" />
      <div className="wrap" style={{ paddingTop: 26, paddingBottom: 40 }}>
        <div className="secttl"><h2>📁 All Categories</h2><div className="line" /></div>
        <div className="pills" style={{ justifyContent: 'flex-start', padding: '8px 0 4px' }}>
          {cats.map((c) => (
            <a key={c.id} className="pill" href={'#cat-' + c.id}>
              {c.name.toUpperCase()} ({c.n})
            </a>
          ))}
        </div>
        {cats.map((c) => (
          <div key={c.id} id={'cat-' + c.id}><CatRow cat={c} settings={settings} /></div>
        ))}
      </div>
      <SiteFooter settings={settings} />
    </>
  );
}

async function CatRow({ cat, settings }) {
  const db = sql();
  const vs = await db`
    select v.*, c.name as category_name
    from videos v left join categories c on c.id = v.category_id
    where v.published = true and v.category_id = ${cat.id}
    order by v.created_at desc limit 6`;
  if (!vs.length) return null;
  return (
    <>
      <div className="secttl"><h2>{cat.name}</h2><div className="line" /></div>
      <div className="grid">
        {vs.map((v) => <PosterCard key={v.id} v={v} logo={settings.logo_emoji} />)}
      </div>
    </>
  );
}
