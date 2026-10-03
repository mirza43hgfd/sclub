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
      <div className="modal loginbox">
        <h3>🔐 Admin Login</h3>
        <p className="sub">Only the site owner can log in here.</p>
        <form onSubmit={submit}>
          <div className="field"><label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field"><label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          {err && <div className="note" style={{ borderColor: 'var(--danger)', background: 'rgba(229,72,77,.08)', color: '#ffb4b6' }}>{err}</div>}
          <div className="mrow">
            <a className="btn btn-ghost" href="/">← Back to site</a>
            <button className="btn btn-gold" disabled={busy}>{busy ? 'Logging in…' : 'Login'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
