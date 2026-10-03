'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function submit(e) {
    e.preventDefault();
    setErr('');
    setBusy(true);
    try {
      const r = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Login failed');
      router.push('/admin');
    } catch (ex) {
      setErr(ex.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="wrap">
      <div className="loginbox">
        <h3 style={{ margin: '0 0 4px' }}>🔐 Admin Login</h3>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 18px' }}>Only the site owner can log in here.</p>
        <form className="form" onSubmit={submit}>
          <div className="field"><label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field"><label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div className="notice">{err}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <a className="btn ghost" href="/">← Back</a>
            <button className="btn" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
