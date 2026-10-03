// /api/videos — public list (GET) + admin create (POST)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  const db = sql();
  const { searchParams } = new URL(req.url);
  // admins can list everything (including hidden); public sees published only
  const rows = currentAdmin() && searchParams.get('all') === '1'
    ? await db`select v.*, c.name as category_name, c.color as category_color from videos v left join categories c on c.id = v.category_id order by v.created_at desc`
    : await db`select v.*, c.name as category_name, c.color as category_color from videos v left join categories c on c.id = v.category_id where v.published = true order by v.created_at desc`;
  return Response.json({ videos: rows });
}

export async function POST(req) {
  if (!currentAdmin()) return unauthorized();
  const b = await req.json().catch(() => ({}));
  if (!b.title || !b.video_url) {
    return Response.json({ error: 'title and video_url are required' }, { status: 400 });
  }
  const db = sql();
  const rows = await db`
    insert into videos (title, category_id, thumbnail_url, video_url, video_type, description, duration, featured, published)
    values (${b.title}, ${b.category_id || null}, ${b.thumbnail_url || ''}, ${b.video_url},
            ${b.video_type || 'drive'}, ${b.description || ''}, ${b.duration || ''},
            ${!!b.featured}, ${b.published !== false})
    returning *`;
  return Response.json({ video: rows[0] }, { status: 201 });
}
