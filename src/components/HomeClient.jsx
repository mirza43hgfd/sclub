'use client';
// SClub v2 homepage — movieclub-style: hero search, CTA row, pills, poster grid.
import { useMemo, useState } from 'react';
import Link from 'next/link';
import AdSlot from './AdSlot.jsx';

function catOf(v) { return v.category_name || 'General'; }

function dateBadge(iso) {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).toUpperCase();
  } catch { return ''; }
}

function qualityOf(v) {
  try {
    const ql = typeof v.quality_links === 'string' ? JSON.parse(v.quality_links) : (v.quality_links || {});
    const ks = Object.keys(ql).filter(k => ql[k]);
    if (ks.includes('1080p')) return '1080p';
    if (ks.includes('720p')) return '720p';
    if (ks.includes('480p')) return '480p';
    return '';
  } catch { return ''; }
}

export function PosterCard({ v, logo }) {
  const qtag = qualityOf(v);
  return (
    <Link href={'/movie/' + v.id} className="card">
      <div className="poster">
        {v.thumbnail_url ? (
          <img src={v.thumbnail_url} loading="lazy" alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="ph">{logo}</div>
        )}
        {v.created_at && <span className="date-badge">{dateBadge(v.created_at)}</span>}
        {qtag && <span className="quality-tag">{qtag.toUpperCase()}</span>}
      </div>
      <div className="card-body">
        <h3>{v.title}</h3>
        <div className="card-meta">
          <span className="chip">{catOf(v)}</span>
          {v.year && <span className="chip">{v.year}</span>}
          <span className="views">👁 {v.views || 0}</span>
        </div>
      </div>
    </Link>
  );
}

export default function HomeClient({ initial }) {
  const [settings] = useState(initial.settings);
  const [cats] = useState(initial.cats);
  const [videos] = useState(initial.videos);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');

  const counts = useMemo(() => {
    const c = {};
    videos.forEach((v) => { const n = catOf(v); c[n] = (c[n] || 0) + 1; });
    return c;
  }, [videos]);

  const filtered = videos.filter((v) => {
    if (cat !== 'All' && catOf(v) !== cat) return false;
    if (q && !(v.title + ' ' + (v.description || '')).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const featured = videos.filter((v) => v.featured).slice(0, 6);

  const socials = [];
  if (settings.facebook_url) socials.push(['📘', settings.facebook_url, 'Facebook']);
  if (settings.telegram_url) socials.push(['✈', settings.telegram_url, 'Telegram']);
  if (settings.instagram_url) socials.push(['📸', settings.instagram_url, 'Instagram']);

  const gridItems = [];
  filtered.forEach((v, i) => {
    gridItems.push(<PosterCard key={v.id} v={v} logo={settings.logo_emoji} />);
    if (settings.ad_infeed_code && settings.ad_infeed_code.trim() && (i + 1) % 8 === 0) {
      gridItems.push(
        <div key={'ad-' + i} className="card" style={{ cursor: 'default' }}>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>ADVERTISEMENT</div>
            <AdSlot code={settings.ad_infeed_code} />
          </div>
        </div>
      );
    }
  });

  const goSearch = (e) => {
    e.preventDefault();
    if (q.trim()) window.location.href = '/search?q=' + encodeURIComponent(q.trim());
  };

  return (
    <>
      <header className="hdr">
        <div className="hdr-in">
          <Link href="/" className="logo">{settings.logo_emoji} <b>S</b>CLUB</Link>
          <nav className="nav">
            <Link href="/" className="on">Home</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/how-to-download">How to Download</Link>
            <Link href="/request">Request Movie</Link>
          </nav>
          <form className="hdr-search" onSubmit={goSearch}>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." />
          </form>
        </div>
      </header>

      <div className="hero">
        <h1 dangerouslySetInnerHTML={{ __html: settings.hero_title }} />
        <p>{settings.hero_subtitle}</p>
        <form className="hero-search" onSubmit={goSearch}>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search Movies or Web Series here...." />
          <button type="submit">Search</button>
        </form>
        <div className="cta-row">
          <Link href="/categories" className="btn ghost sm">📁 Categories</Link>
          {settings.telegram_url && <a href={settings.telegram_url} target="_blank" rel="noopener noreferrer" className="btn ghost sm">✈ Join Telegram</a>}
          <Link href="/how-to-download" className="btn ghost sm">❓ How to Download</Link>
          <Link href="/request" className="btn ghost sm">🙏 Request Movie</Link>
        </div>
      </div>

      <div className="wrap">
        <AdSlot code={settings.ad_header_code} />

        <div className="pills">
          <button className={'pill' + (cat === 'All' ? ' on' : '')} onClick={() => setCat('All')}>ALL ({videos.length})</button>
          {Object.keys(counts).sort().map((n) => (
            <button key={n} className={'pill' + (cat === n ? ' on' : '')} onClick={() => setCat(n)}>
              {n.toUpperCase()} ({counts[n]})
            </button>
          ))}
        </div>

        {featured.length > 0 && (
          <>
            <div className="secttl"><h2>⭐ Featured</h2><div className="line" /></div>
            <div className="grid">
              {featured.map((v) => <PosterCard key={v.id} v={v} logo={settings.logo_emoji} />)}
            </div>
          </>
        )}

        <div className="secttl"><h2>🎬 Latest Uploads</h2><div className="line" /></div>
        <div className="grid">
          {gridItems.length ? gridItems : (
            <div className="empty"><div style={{ fontSize: 46, marginBottom: 12 }}>🎬</div><div>No movies here yet.</div></div>
          )}
        </div>

        <div className="notice" style={{ marginTop: 34 }}>
          🔔 Found a broken link? Open the movie page and use the Report button — we fix broken links fast.
          Can't find a movie? <Link href="/request" style={{ color: 'var(--red)', fontWeight: 700 }}>Request it here</Link>.
        </div>
      </div>

      <footer className="ftr">
        <div className="socials">
          {socials.map(([icon, url, name]) => (
            <a key={name} href={url} target="_blank" rel="noopener noreferrer">{icon} {name}</a>
          ))}
        </div>
        <div>© {new Date().getFullYear()} {settings.site_name} · {settings.footer_text}</div>
      </footer>

      <AdSlot code={settings.ad_popunder_code} />
    </>
  );
}
