// POST /api/auth/login — admin login. First-ever login bootstraps the admin
// from ADMIN_EMAIL / ADMIN_PASSWORD env vars (password stored bcrypt-hashed).
import { sql } from '@/lib/db.js';
import { hashPassword, checkPassword, signToken, setAuthCookie } from '@/lib/auth.js';

export const dynamic = 'force-dynamic';

export async function POST(req) {
  const { email, password } = await req.json().catch(() => ({}));
  if (!email || !password) {
    return Response.json({ error: 'Email and password required' }, { status: 400 });
  }
  const db = sql();
  const rows = await db`select * from admins where email = ${email} limit 1`;
  let admin = rows[0] || null;

  if (admin) {
    const ok = await checkPassword(password, admin.password_hash);
    if (!ok) return Response.json({ error: 'Invalid credentials' }, { status: 401 });
  } else {
    // bootstrap: no admin exists yet — must match env credentials
    if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    const hash = await hashPassword(password);
    const ins = await db`insert into admins (email, password_hash) values (${email}, ${hash}) returning id, email`;
    admin = ins[0];
  }

  setAuthCookie(signToken(admin));
  return Response.json({ ok: true, email: admin.email });
}
