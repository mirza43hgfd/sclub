// /api/settings — public read (GET) + admin update (PUT, merged)
import { sql } from '@/lib/db.js';
import { currentAdmin, unauthorized, getSettings } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const settings = await getSettings();
  return Response.json({ settings });
}

export async function PUT(req) {
  if (!currentAdmin()) return unauthorized();
  const b = await req.json().catch(() => ({}));
  const db = sql();
  await db`update settings set data = data || ${JSON.stringify(b)}::jsonb, updated_at = now() where id = 1`;
  const settings = await getSettings();
  return Response.json({ settings });
}
