import Link from 'next/link';
import { sql } from '@/lib/db.js';
import { getSettings } from '@/lib/auth.js';
import MovieDetailClient from '@/components/MovieDetailClient.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  try {
    const db = sql();
    const rows = await db`select title, description from videos where id = ${params.id} and published = true limit 1`;
    const s = await getSettings();
    if (!rows.length) return { title: 'Not found — ' + s.site_name };
    return {
      title: `${rows[0].title} — ${s.site_name}`,
      description: (rows[0].description || s.meta_description).slice(0, 160),
      openGraph: { title: rows[0].title, description: (rows[0].description || '').slice(0, 160), type: 'website' }
    };
  } catch {
    return { title: 'SClub' };
  }
}

export default async function MoviePage({ params }) {
  const db = sql();
  const settings = await getSettings();
  const rows = await db`
    select v.*, c.name as category_name, c.color as category_color
    from videos v left join categories c on c.id = v.category_id
    where v.id = ${params.id} and v.published = true limit 1`;
  if (!rows.length) {
    return (
      <div className="page"><div className="empty">
        <div style={{ fontSize: 46, marginBottom: 12 }}>🔍</div>
        <div>Movie not found.</div>
        <p><Link href="/" style={{ color: 'var(--red)' }}>← Back to home</Link></p>
      </div></div>
    );
  }
  const video = rows[0];
  const related = video.category_id
    ? await db`
        select v.*, c.name as category_name
        from videos v left join categories c on c.id = v.category_id
        where v.published = true and v.id != ${params.id} and v.category_id = ${video.category_id}
        order by v.created_at desc limit 6`
    : await db`
        select v.*, c.name as category_name
        from videos v left join categories c on c.id = v.category_id
        where v.published = true and v.id != ${params.id}
        order by v.created_at desc limit 6`;
  return <MovieDetailClient video={video} related={related} settings={settings} />;
}
