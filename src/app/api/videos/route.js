// /api/videos — public list (GET) + admin create (POST)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized } from '@/lib/auth.js';




export const dynamic = 'force-dynamic';




export async function GET(req) {
  const db = sql();
  const { searchParams } = new URL(req.url);
  const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '48', 10) || 48, 100));
  const offset = Math.max(0, parseInt(searchParams.get('offset') || '0', 10) || 0);
  const cat = searchParams.get('category') || '';
  const sq = (searchParams.get('search') || '').trim();
  const isAdmin = currentAdmin() && searchParams.get('all') === '1';
  let rows, total;
  if (isAdmin) {
    rows = await db`select v.*, c.name as category_name, c.color as category_color from videos v left join categories c on c.id = v.category_id order by v.created_at desc limit ${limit} offset ${offset}`;
    total = await db`select count(*)::int as n from videos`;
  } else if (sq) {
    const pat = '%' + sq + '%';
    rows = await db`select v.*, c.name as category_name, c.color as category_color from videos v left join categories c on c.id = v.category_id where v.published = true and (v.title ilike ${pat} or v.description ilike ${pat}) order by v.created_at desc limit ${limit} offset ${offset}`;
    total = await db`select count(*)::int as n from videos v where v.published = true and (v.title ilike ${pat} or v.description ilike ${pat})`;
  } else if (cat) {
    rows = await db`select v.*, c.name as category_name, c.color as category_color from videos v left join categories c on c.id = v.category_id where v.published = true and c.name = ${cat} order by v.created_at desc limit ${limit} offset ${offset}`;
    total = await db`select count(*)::int as n from videos v left join categories c on c.id = v.category_id where v.published = true and c.name = ${cat}`;
  } else {
    rows = await db`select v.*, c.name as category_name, c.color as category_color from videos v left join categories c on c.id = v.category_id where v.published = true order by v.created_at desc limit ${limit} offset ${offset}`;
    total = await db`select count(*)::int as n from videos where published = true`;
  }
  return Response.json({ videos: rows, total: total[0].n, limit, offset });
}




export async function POST(req) {
  if (!currentAdmin()) return unauthorized();
  const b = await req.json().catch(() => ({}));
  if (!b.title || !b.video_url) {
    return Response.json({ error: 'title and video_url are required' }, { status: 400 });
  }
  const db = sql();
  const ql = b.quality_links && typeof b.quality_links === 'object' ? b.quality_links : {};
  const rows = await db`
    insert into videos (title, category_id, thumbnail_url, video_url, video_type, description, duration, featured, published, language, year, quality_links)
    values (${b.title}, ${b.category_id || null}, ${b.thumbnail_url || ''}, ${b.video_url},
            ${b.video_type || 'drive'}, ${b.description || ''}, ${b.duration || ''},
            ${!!b.featured}, ${b.published !== false}, ${b.language || ''}, ${b.year || ''}, ${JSON.stringify(ql)})
    returning *`;
  return Response.json({ video: rows[0] }, { status: 201 });
}
