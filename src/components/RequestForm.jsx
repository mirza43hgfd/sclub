'use client';
// Public movie request form.
import { useState } from 'react';
import Link from 'next/link';

export default function RequestForm({ telegram }) {
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (title.trim().length < 2) { setErr('Please write a movie or series name.'); return; }
    setBusy(true);
    try {
      const r = await fetch('/api/requests', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, details })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      setDone(true);
    } catch (e2) {
      setErr(e2.message);
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="notice" style={{ borderColor: 'rgba(63,182,139,.5)', background: 'rgba(63,182,139,.08)' }}>
        ✅ Request received! We'll try to add <b>{title}</b> soon. Thank you!
      </div>
    );
  }

  return (
    <form className="form" onSubmit={submit}>
      {err && <div className="notice">{err}</div>}
      <div className="field">
        <label>Movie / Series name *</label>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Avengers Doomsday" maxLength={200} />
      </div>
      <div className="field">
        <label>Details (optional)</label>
        <textarea value={details} onChange={(e) => setDetails(e.target.value)} placeholder="Language, quality, year... (e.g. Hindi dubbed, 720p)" maxLength={1000} />
      </div>
      <div>
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Sending...' : '🙏 Send Request'}</button>
      </div>
      {telegram && (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Faster? <a href={telegram} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red)', fontWeight: 700 }}>Ask on Telegram ✈</a>
        </p>
      )}
    </form>
  );
}
