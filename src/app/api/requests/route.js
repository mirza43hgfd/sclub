// /api/requests — public movie requests (POST) + admin inbox (GET)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  if (!currentAdmin()) return unauthorized();
  const db = sql();
  const rows = await db`select * from movie_requests order by created_at desc limit 200`;
  return Response.json({ requests: rows });
}

export async function POST(req) {
  const b = await req.json().catch(() => ({}));
  if (!b.title || String(b.title).trim().length < 2) {
    return Response.json({ error: 'Please write a movie/series name' }, { status: 400 });
  }
  const db = sql();
  const rows = await db`
    insert into movie_requests (title, details)
    values (${String(b.title).trim().slice(0, 200)}, ${String(b.details || '').trim().slice(0, 1000)})
    returning id, created_at`;
  return Response.json({ ok: true, id: rows[0].id }, { status: 201 });
}
