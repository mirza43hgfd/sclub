'use client';
// Public homepage: header, hero, categories, video grids, ads, community, footer.
import { useEffect, useMemo, useState } from 'react';
import AdSlot from './AdSlot.jsx';
import PlayerModal from './PlayerModal.jsx';

function catOf(v) {
  return v.category_name || 'General';
}

function VideoCard({ v, logo, onPlay }) {
  const has = (v.video_url || '').trim() !== '';
  return (
    <div className={'card' + (v.featured ? ' feat' : '')} onClick={() => onPlay(v)}>
      <div className="thumb">
        {v.thumbnail_url ? (
          <img src={v.thumbnail_url} loading="lazy" alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        ) : (
          <div className="ph">{logo}</div>
        )}
        {v.featured && <span className="fbadge">FEATURED</span>}
        {v.duration && <span className="dur">{v.duration}</span>}
        <span className="views">👁 {v.views || 0}</span>
        {has && <div className="playov"><div className="pc">▶</div></div>}
      </div>
      <div className="cbody">
        <div className="ctitle">{v.title}</div>
        <div className="cmeta">
          <span className="chip" style={{ borderColor: (v.category_color || '#d4a437') + '55', color: v.category_color || '#d4a437' }}>
            {catOf(v)}
          </span>
        </div>
        {v.description && <div className="cdesc">{v.description}</div>}
      </div>
    </div>
  );
}

export default function HomeClient({ initial }) {
  const [settings] = useState(initial.settings);
  const [cats] = useState(initial.cats);
  const [videos, setVideos] = useState(initial.videos);
  const [cat, setCat] = useState('All');
  const [q, setQ] = useState('');
  const [playing, setPlaying] = useState(null);

  // theme color + #v= deep link (runs once)
  useEffect(() => {
    document.documentElement.style.setProperty('--gold', settings.primary_color || '#d4a437');
    const m = window.location.hash.match(/#v=([0-9a-f-]{36})/i);
    if (m) {
      const v = initial.videos.find((x) => x.id === m[1]);
      if (v) openPlayer(v);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function openPlayer(v) {
    setPlaying(v);
    window.location.hash = 'v=' + v.id;
    try {
      await fetch(`/api/videos/${v.id}/view`, { method: 'POST' });
      setVideos((vs) => vs.map((x) => (x.id === v.id ? { ...x, views: (x.views || 0) + 1 } : x)));
    } catch { /* view count is best-effort */ }
  }

  function closePlayer() {
    setPlaying(null);
    history.replaceState(null, '', window.location.pathname);
  }

  const counts = useMemo(() => {
    const c = {};
    videos.forEach((v) => { const n = catOf(v); c[n] = (c[n] || 0) + 1; });
    return c;
  }, [videos]);

  const catColor = (name) => {
    const c = cats.find((x) => x.name === name);
    return (c && c.color) || '#d4a437';
  };

  const filtered = videos.filter((v) => {
    if (cat !== 'All' && catOf(v) !== cat) return false;
    if (q && !(v.title + ' ' + (v.description || '')).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const featured = videos.filter((v) => v.featured).slice(0, 3);

  const socials = [];
  if (settings.facebook_url) socials.push(['📘', settings.facebook_url, 'Facebook']);
  if (settings.instagram_url) socials.push(['📸', settings.instagram_url, 'Instagram']);

  // in-feed ad card every 6 videos
  const gridItems = [];
  filtered.forEach((v, i) => {
    gridItems.push(<VideoCard key={v.id} v={v} logo={settings.logo_emoji} onPlay={openPlayer} />);
    if (settings.ad_infeed_code && settings.ad_infeed_code.trim() && (i + 1) % 6 === 0) {
      gridItems.push(
        <div key={'ad-' + i} className="card" style={{ cursor: 'default', minHeight: 200, background: 'var(--bg2)' }}>
          <div style={{ padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 8, textAlign: 'center' }}>ADVERTISEMENT</div>
            <AdSlot code={settings.ad_infeed_code} />
          </div>
        </div>
      );
    }
  });

  return (
    <>
      <header className="site">
        <div className="wrap topbar">
          <div className="logo">{settings.logo_emoji}</div>
          <div className="brand">
            <h1>{settings.site_name}</h1>
            <p>{settings.tagline}</p>
          </div>
          <div className="spacer" />
          <div className="socials">
            {socials.map(([icon, url, name]) => (
              <a key={name} href={url} target="_blank" rel="noopener noreferrer" title={name}>{icon}</a>
            ))}
          </div>
          <div className="search">
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.5" y2="16.5" /></svg>
            <input type="text" placeholder="Search videos..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <a className="btn btn-ghost btn-sm" href="/admin">🔧 Manage</a>
        </div>
      </header>

      <div className="wrap">
        <AdSlot code={settings.ad_header_code} />

        <div className="hero">
          {settings.hero_banner_url && <div className="bgimg" style={{ backgroundImage: `url("${settings.hero_banner_url}")` }} />}
          <div className="shade" />
          <div className="hin">
            <h2 dangerouslySetInnerHTML={{ __html: settings.hero_title }} />
            <p>{settings.hero_subtitle}</p>
            <a className="btn btn-gold" href="#latest">▶ Browse Videos</a>
          </div>
        </div>

        {featured.length > 0 && (
          <>
            <div className="secttl"><h3>⭐ Featured</h3><div className="line" /></div>
            <div className="grid">
              {featured.map((v) => <VideoCard key={v.id} v={v} logo={settings.logo_emoji} onPlay={openPlayer} />)}
            </div>
          </>
        )}

        <div className="secttl" id="latest"><h3>🎬 Latest Trailers</h3><div className="line" /></div>
        <div className="cats">
          <button className={'cat' + (cat === 'All' ? ' active' : '')} onClick={() => setCat('All')}>
            All<span className="n">{videos.length}</span>
          </button>
          {Object.keys(counts).sort().map((n) => (
            <button key={n} className={'cat' + (cat === n ? ' active' : '')} onClick={() => setCat(n)}>
              <span className="dot" style={{ background: catColor(n) }} />{n}<span className="n">{counts[n]}</span>
            </button>
          ))}
        </div>
        <div className="grid">
          {gridItems.length ? gridItems : (
            <div className="empty"><div className="big">🎬</div><div>No videos here yet.</div></div>
          )}
        </div>

        {settings.facebook_url && (
          <div className="comm">
            <h3>Join our <span>Facebook</span> community</h3>
            <p>Daily entertainment posts, polls and premieres — be part of the family.</p>
            <a className="btn btn-gold" href={settings.facebook_url} target="_blank" rel="noopener noreferrer">📘 Follow on Facebook</a>
          </div>
        )}
      </div>

      <footer className="site">
        <div className="wrap">© {new Date().getFullYear()} {settings.site_name} · {settings.footer_text}</div>
      </footer>

      <AdSlot code={settings.ad_popunder_code} />
      <PlayerModal video={playing} onClose={closePlayer} />
    </>
  );
}
