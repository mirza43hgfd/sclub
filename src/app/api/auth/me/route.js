// GET /api/auth/me — who is logged in (admin panel guard uses this)
import { currentAdmin, unauthorized } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = currentAdmin();
  if (!admin) return unauthorized();
  return Response.json({ admin: { id: admin.id, email: admin.email } });
}
