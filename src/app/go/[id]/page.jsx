'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot.jsx';
export default function GoPage({ params, searchParams }) {
  const quality = (searchParams.q || '720p').toLowerCase();
  const [video, setVideo] = useState(null);
  const [settings, setSettings] = useState({});
  const [secs, setSecs] = useState(10);
  const [done, setDone] = useState(false);
  useEffect(() => {
    fetch('/api/videos/' + params.id).then(r => r.json()).then(v => setVideo(v && v.id ? v : null));
    fetch('/api/settings').then(r => r.json()).then(s => {
      setSettings(s || {});
      const t = parseInt((s && s.link_timer_seconds) || '10', 10);
      setSecs(isNaN(t) ? 10 : Math.max(3, Math.min(60, t)));
    });
  }, [params.id]);
  useEffect(() => {
    if (secs <= 0) { setDone(true); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const ql = (video && video.quality_links) || {};
  const target = ql[quality] || (quality === 'main' ? video && video.video_url : '') || '';
  const qLabel = quality === '480p' ? '480p' : quality === '1080p' ? '1080p' : quality === 'main' ? 'Download' : '720p';
  return (
    <>
      <header className="hdr"><div className="hdr-in">
        <Link href="/" className="logo">{(settings && settings.logo_emoji) || '🎬'} <b>S</b>CLUB</Link>
        <nav className="nav"><Link href="/">Home</Link><Link href="/how-to-download">How to Download</Link></nav>
      </div></header>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'center', paddingTop: 40, paddingBottom: 40 }}>
        <div className="card" style={{ maxWidth: 520, width: '100%', padding: 28, textAlign: 'center' }}>
          {!video ? (<p style={{ color: 'var(--muted)' }}>Loading…</p>) : !target ? (
            <><h1 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>Link not available</h1>
            <p style={{ color: 'var(--muted)', marginBottom: 18 }}>Is quality ka link abhi add nahi hua.</p>
            <Link href={'/movie/' + video.id} className="btn ghost">← Back to movie</Link></>
          ) : (
            <><div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--muted)', marginBottom: 6 }}>SCLUB DOWNLOAD</div>
              <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>{video.title}</h1>
              <div style={{ marginBottom: 14 }}><span className="quality-tag">{qLabel}</span></div>
              <AdSlot code={settings.ad_header_code} />
              {!done ? (
                <div style={{ margin: '22px 0' }}>
                  <div style={{ fontSize: 52, fontWeight: 900, color: 'var(--red)' }}>{secs}</div>
                  <p style={{ color: 'var(--muted)', fontSize: 14 }}>Tumhara link {secs} second mein ready ho jayega…<br />Page band mat karna.</p>
                </div>
              ) : (
                <div style={{ margin: '22px 0' }}>
                  <a href={target} target="_blank" rel="noopener noreferrer sponsored" className="btn" style={{ fontSize: 18, padding: '14px 34px' }}>⬇ Download {qLabel}</a>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>Link naye tab mein khulega. Agar na khule to dobara click karo.</p>
                </div>
              )}
              <div style={{ marginTop: 18, paddingTop: 16, borderTop: '1px solid var(--border)', textAlign: 'left' }}>
                <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>Download ka tareeqa:</div>
                <ol style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 16, lineHeight: 1.7 }}>
                  <li>Timer khatam hone ka wait karo</li><li>Download button dabao</li><li>Google Drive page pe apne account se download karo</li>
                </ol>
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="ftr"><div>© {new Date().getFullYear()} {(settings && settings.site_name) || 'SClub'}</div></footer>
      <AdSlot code={settings.ad_popunder_code} />
    </>
  );
}
