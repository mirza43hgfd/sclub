// POST /api/videos/[id]/view — public view counter (+1)
import { sql } from '@/lib/db.js';

export const dynamic = 'force-dynamic';

export async function POST(req, { params }) {
  const db = sql();
  await db`update videos set views = views + 1 where id = ${params.id}`;
  return Response.json({ ok: true });
}
