// /api/videos/[id] — admin update (PATCH) + delete (DELETE)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

const FIELDS = ['title', 'category_id', 'thumbnail_url', 'video_url', 'video_type', 'description', 'duration', 'featured', 'published', 'language', 'year'];

export async function PATCH(req, { params }) {
  if (!currentAdmin()) return unauthorized();
  const b = await req.json().catch(() => ({}));
  const sets = [];
  const values = [];
  let i = 1;
  for (const f of FIELDS) {
    if (b[f] !== undefined) {
      let v = b[f];
      if (f === 'category_id' && !v) v = null;
      if (f === 'featured' || f === 'published') v = !!v;
      sets.push(`${f} = $${i++}`);
      values.push(v);
    }
  }
  if (b.quality_links !== undefined && b.quality_links && typeof b.quality_links === 'object') {
    sets.push(`quality_links = $${i++}`);
    values.push(JSON.stringify(b.quality_links));
  }
  if (!sets.length) return Response.json({ error: 'Nothing to update' }, { status: 400 });
  values.push(params.id);
  const db = sql();
  const rows = await db(`update videos set ${sets.join(', ')} where id = $${i} returning *`, values);
  if (!rows.length) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ video: rows[0] });
}

export async function DELETE(req, { params }) {
  if (!currentAdmin()) return unauthorized();
  const db = sql();
  await db`delete from videos where id = ${params.id}`;
  return Response.json({ ok: true });
}
