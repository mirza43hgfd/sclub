'use client';
// SClub link-wall v2: improved design — poster, quality switcher, progress ring timer.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdSlot from '@/components/AdSlot.jsx';
const QUALITIES = ['480p', '720p', '1080p'];
export default function GoPage({ params, searchParams }) {
  const initQ = (searchParams.q || '720p').toLowerCase();
  const [quality, setQuality] = useState(QUALITIES.includes(initQ) ? initQ : '720p');
  const [video, setVideo] = useState(null);
  const [settings, setSettings] = useState({});
  const [secs, setSecs] = useState(10);
  const [totalSecs, setTotalSecs] = useState(10);
  const [done, setDone] = useState(false);
  useEffect(() => {
    fetch('/api/videos/' + params.id).then(r => r.json()).then(v => setVideo(v && v.id ? v : null));
    fetch('/api/settings').then(r => r.json()).then(s => {
      const st = s || {}; setSettings(st);
      const t = parseInt(st.link_timer_seconds || '10', 10);
      const tt = isNaN(t) ? 10 : Math.max(3, Math.min(60, t));
      setSecs(tt); setTotalSecs(tt);
    });
  }, [params.id]);
  useEffect(() => {
    if (secs <= 0) { setDone(true); return; }
    const t = setTimeout(() => setSecs(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secs]);
  const switchQ = (q) => { setQuality(q); setDone(false); setSecs(totalSecs); };
  const ql = (video && video.quality_links) || {};
  const target = ql[quality] || '';
  const pct = totalSecs > 0 ? Math.round(((totalSecs - secs) / totalSecs) * 100) : 100;
  const ring = 2 * Math.PI * 54;
  return (
    <>
      <header className="hdr"><div className="hdr-in">
        <Link href="/" className="logo">{settings.logo_url ? <img src={settings.logo_url} alt="SClub" className="site-logo" /> : <>{settings.logo_emoji || '🎬'} <b>S</b>CLUB</>}</Link>
        <nav className="nav"><Link href="/">Home</Link><Link href="/how-to-download">How to Download</Link></nav>
      </div></header>
      <div className="wrap" style={{ display: 'flex', justifyContent: 'center', paddingTop: 32, paddingBottom: 40 }}>
        <div className="card" style={{ maxWidth: 560, width: '100%', padding: 0, overflow: 'hidden' }}>
          {!video ? (<p style={{ color: 'var(--muted)', padding: 40, textAlign: 'center' }}>Loading…</p>) : (
            <>
              <div style={{ display: 'flex', gap: 16, padding: 22, alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                {video.thumbnail_url && (<img src={video.thumbnail_url} alt="" loading="lazy" style={{ width: 84, height: 120, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }} onError={(e) => { e.currentTarget.style.display = 'none'; }} />)}
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: 11, letterSpacing: 2, color: 'var(--red)', fontWeight: 700, marginBottom: 4 }}>SCLUB DOWNLOAD</div>
                  <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.3 }}>{video.title}</h1>
                  <div style={{ marginTop: 8, fontSize: 12, color: 'var(--muted)' }}>{[video.year, video.language].filter(Boolean).join(' • ')}</div>
                </div>
              </div>
              <div style={{ padding: 22 }}>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, textAlign: 'left' }}>Select Quality:</div>
                <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                  {QUALITIES.map((qq) => (<button key={qq} onClick={() => switchQ(qq)} className={'btn sm' + (quality === qq ? '' : ' ghost')} disabled={!ql[qq]} style={{ opacity: ql[qq] ? 1 : 0.35, flex: 1 }}>{qq}</button>))}
                </div>
                <AdSlot code={settings.ad_header_code} />
                {!target ? (<div style={{ margin: '20px 0', textAlign: 'center' }}><div style={{ fontSize: 40, marginBottom: 8 }}>😕</div><p style={{ color: 'var(--muted)' }}>Is quality ka link abhi add nahi hua. Doosri quality try karo.</p></div>)
                : !done ? (<div style={{ margin: '24px 0', textAlign: 'center' }}>
                  <div style={{ position: 'relative', width: 130, height: 130, margin: '0 auto 14px' }}>
                    <svg width="130" height="130" viewBox="0 0 130 130"><circle cx="65" cy="65" r="54" fill="none" stroke="var(--border)" strokeWidth="10" /><circle cx="65" cy="65" r="54" fill="none" stroke="var(--red)" strokeWidth="10" strokeLinecap="round" strokeDasharray={ring} strokeDashoffset={ring - (ring * pct) / 100} style={{ transition: 'stroke-dashoffset 1s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }} /></svg>
                    <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, fontWeight: 900, color: 'var(--red)' }}>{secs}</div>
                  </div>
                  <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6 }}>Tumhara <b>{quality}</b> link <b>{secs} second</b> mein ready ho jayega…<br />Page band mat karna 🙏</p>
                </div>)
                : (<div style={{ margin: '24px 0', textAlign: 'center' }}>
                  <div style={{ fontSize: 44, marginBottom: 10 }}>✅</div>
                  <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 14, color: '#4ade80' }}>Link Ready!</div>
                  <a href={target} target="_blank" rel="noopener noreferrer sponsored" className="btn" style={{ fontSize: 18, padding: '15px 40px', display: 'inline-block' }}>⬇ Download {quality}</a>
                  <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 12 }}>Link naye tab mein khulega. Na khule to dobara click karo.</p>
                </div>)}
                <div style={{ marginTop: 18, padding: 16, background: 'rgba(255,255,255,0.03)', borderRadius: 10, textAlign: 'left' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>📥 Download ka tareeqa:</div>
                  <ol style={{ fontSize: 13, color: 'var(--muted)', margin: 0, paddingLeft: 18, lineHeight: 1.8 }}><li>Apni pasand ki <b>quality</b> select karo</li><li>Timer khatam hone ka <b>wait</b> karo</li><li><b>Download button</b> dabao — link naye tab mein khulega</li></ol>
                </div>
                <div style={{ marginTop: 16, textAlign: 'center' }}><Link href={'/movie/' + video.id} style={{ fontSize: 13, color: 'var(--muted)' }}>← Back to movie page</Link></div>
              </div>
            </>
          )}
        </div>
      </div>
      <footer className="ftr"><div>© {new Date().getFullYear()} {settings.site_name || 'SClub'}</div></footer>
      <AdSlot code={settings.ad_popunder_code} />
    </>
  );
}
