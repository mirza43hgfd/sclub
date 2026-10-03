// /api/categories — public list (GET) + admin create (POST)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const db = sql();
  const rows = await db`select * from categories order by name`;
  return Response.json({ categories: rows });
}

export async function POST(req) {
  if (!currentAdmin()) return unauthorized();
  const b = await req.json().catch(() => ({}));
  if (!b.name) return Response.json({ error: 'name is required' }, { status: 400 });
  const db = sql();
  try {
    const rows = await db`insert into categories (name, color) values (${b.name}, ${b.color || '#d4a437'}) returning *`;
    return Response.json({ category: rows[0] }, { status: 201 });
  } catch {
    return Response.json({ error: 'Category already exists' }, { status: 409 });
  }
}
