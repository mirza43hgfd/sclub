// /api/requests/[id] — admin: mark done (PATCH) + delete (DELETE)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  if (!currentAdmin()) return unauthorized();
  const b = await req.json().catch(() => ({}));
  const status = b.status === 'done' ? 'done' : 'pending';
  const db = sql();
  await db`update movie_requests set status = ${status} where id = ${params.id}`;
  return Response.json({ ok: true });
}

export async function DELETE(req, { params }) {
  if (!currentAdmin()) return unauthorized();
  const db = sql();
  await db`delete from movie_requests where id = ${params.id}`;
  return Response.json({ ok: true });
}
