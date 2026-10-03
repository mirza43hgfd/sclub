// /api/categories/[id] — admin rename (PATCH) + delete (DELETE)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function PATCH(req, { params }) {
  if (!currentAdmin()) return unauthorized();
  const b = await req.json().catch(() => ({}));
  const sets = [];
  const values = [];
  let i = 1;
  for (const f of ['name', 'color']) {
    if (b[f] !== undefined) {
      sets.push(`${f} = $${i++}`);
      values.push(b[f]);
    }
  }
  if (!sets.length) return Response.json({ error: 'Nothing to update' }, { status: 400 });
  values.push(params.id);
  const db = sql();
  const rows = await db(`update categories set ${sets.join(', ')} where id = $${i} returning *`, values);
  if (!rows.length) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json({ category: rows[0] });
}

export async function DELETE(req, { params }) {
  if (!currentAdmin()) return unauthorized();
  const db = sql();
  await db`delete from categories where id = ${params.id}`;
  return Response.json({ ok: true });
}
