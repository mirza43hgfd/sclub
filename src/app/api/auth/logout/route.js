// POST /api/auth/logout
import { clearAuthCookie } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function POST() {
  clearAuthCookie();
  return Response.json({ ok: true });
}
