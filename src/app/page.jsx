import { sql } from '@/lib/db.js';
import { getSettings } from '@/lib/auth.js';
import HomeClient from '@/components/HomeClient.jsx';




export const dynamic = 'force-dynamic';




export async function generateMetadata() {
  try {
    const s = await getSettings();
    return {
      title: `${s.site_name} — Movies`,
      description: s.meta_description,
      openGraph: {
        title: `${s.site_name} — Movies`,
        description: s.meta_description,
        type: 'website'
      }
    };
  } catch {
    return { title: 'SClub — Movies' };
  }
}




async function getData() {
  const db = sql();
  const settings = await getSettings();
  const cats = await db`select * from categories order by name`;
  const videos = await db`
    select v.*, c.name as category_name, c.color as category_color
    from videos v left join categories c on c.id = v.category_id
    where v.published = true
    order by v.created_at desc limit 48`;
  const tot = await db`select count(*)::int as n from videos where published = true`;
  const cc = await db`select c.name, count(v.id)::int as n from categories c left join videos v on v.category_id = c.id and v.published = true group by c.name`;
  const catCounts = {}; cc.forEach((r) => { catCounts[r.name] = r.n; });
  return { settings, cats, videos, total: tot[0].n, catCounts };
}




export default async function HomePage() {
  let data;
  try {
    data = await getData();
  } catch (e) {
    return (
      <div className="center" style={{ flexDirection: 'column', gap: 12, padding: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 44 }}>🔌</div>
        <div>Database connected nahi hai.</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', maxWidth: 520 }}>
          Vercel dashboard → Project → Settings → Environment Variables mein <b>DATABASE_URL</b>,
          <b>JWT_SECRET</b>, <b>ADMIN_EMAIL</b>, <b>ADMIN_PASSWORD</b> add karo, phir redeploy karo.
          Tareeqa README-URDU.md mein hai.
        </div>
      </div>
    );
  }
  return <HomeClient initial={data} />;
}
