'use client';
// Movie detail page: breadcrumb, poster, INFO block, quality downloads, related.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdSlot from './AdSlot.jsx';
import PlayerModal from './PlayerModal.jsx';
import { PosterCard } from './HomeClient.jsx';
import { rawDownloadLink } from '@/lib/format.js';

function parseQL(v) {
  try {
    const ql = typeof v.quality_links === 'string' ? JSON.parse(v.quality_links) : (v.quality_links || {});
    return ['480p', '720p', '1080p'].filter(k => ql[k] && String(ql[k]).trim()).map(k => [k, ql[k]]);
  } catch { return []; }
}

export default function MovieDetailClient({ video, related, settings }) {
  const [watching, setWatching] = useState(false);
  const [reported, setReported] = useState(false);
  const quals = parseQL(video);

  useEffect(() => {
    fetch(`/api/videos/${video.id}/view`, { method: 'POST' }).catch(() => {});
  }, [video.id]);

  const share = () => {
    const url = window.location.href;
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
  };

  const mainDl = (video.video_url || '').trim();

  return (
    <>
      <header className="hdr">
        <div className="hdr-in">
          <Link href="/" className="logo">{settings.logo_emoji} <b>S</b>CLUB</Link>
          <nav className="nav">
            <Link href="/">Home</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/how-to-download">How to Download</Link>
            <Link href="/request">Request Movie</Link>
          </nav>
          <form className="hdr-search" action="/search">
            <input name="q" placeholder="Search..." />
          </form>
        </div>
      </header>

      <div className="wrap">
        <AdSlot code={settings.ad_header_code} />
        <div className="crumb">
          <Link href="/">Home</Link>
          {video.category_name && <> &nbsp;›&nbsp; <span>{video.category_name}</span></>}
          &nbsp;›&nbsp; <span>{video.title}</span>
        </div>

        <div className="detail">
          <div>
            <div className="detail-poster">
              {video.thumbnail_url ? (
                <img src={video.thumbnail_url} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64 }}>{settings.logo_emoji}</div>
              )}
            </div>
          </div>
          <div>
            <h1>{video.title}</h1>
            <div className="sub">👁 {(video.views || 0).toLocaleString()} views</div>

            <div className="info-box">
              <h4>INFO</h4>
              <div className="info-row"><span className="k">Name</span><span>{video.title}</span></div>
              {video.category_name && <div className="info-row"><span className="k">Category</span><span>{video.category_name}</span></div>}
              {video.language && <div className="info-row"><span className="k">Language</span><span>{video.language}</span></div>}
              {video.year && <div className="info-row"><span className="k">Year</span><span>{video.year}</span></div>}
              {video.duration && <div className="info-row"><span className="k">Duration</span><span>{video.duration}</span></div>}
              <div className="info-row"><span className="k">Quality</span><span>{quals.length ? quals.map(([k]) => k).join(' / ') : '—'}</span></div>
            </div>

            {mainDl && (
              <div className="dl-btns">
                <button className="btn" onClick={() => setWatching(true)}>▶ Watch Now</button>
              </div>
            )}

            {quals.length > 0 ? (
              <>
                <div className="secttl" style={{ marginTop: 6 }}><h2>⬇ Download</h2><div className="line" /></div>
                <div className="dl-btns">
                  {quals.map(([k, url]) => (
                    <a key={k} className="btn ghost" href={rawDownloadLink(url)} target="_blank" rel="noopener noreferrer">
                      ⬇ {k.toUpperCase()}
                    </a>
                  ))}
                </div>
              </>
            ) : mainDl ? (
              <div className="dl-btns">
                <a className="btn ghost" href={mainDl} target="_blank" rel="noopener noreferrer">⬇ Download</a>
              </div>
            ) : null}

            {video.description && (
              <>
                <div className="secttl"><h2>📝 Description</h2><div className="line" /></div>
                <div className="desc">{video.description}</div>
              </>
            )}

            <div className="share-row">
              <button className="btn ghost sm" onClick={share}>📘 Share on Facebook</button>
              {!reported ? (
                <button className="btn ghost sm" onClick={() => setReported(true)}>⚠ Report broken link</button>
              ) : (
                <span style={{ fontSize: 13, color: 'var(--muted)', alignSelf: 'center' }}>Thanks — we'll check this link.</span>
              )}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <>
            <div className="secttl"><h2>🎬 You may also like</h2><div className="line" /></div>
            <div className="grid">
              {related.map((v) => <PosterCard key={v.id} v={v} logo={settings.logo_emoji} />)}
            </div>
          </>
        )}
      </div>

      <footer className="ftr">
        <div>© {new Date().getFullYear()} {settings.site_name} · {settings.footer_text}</div>
      </footer>

      <AdSlot code={settings.ad_popunder_code} />
      <PlayerModal video={watching ? video : null} onClose={() => setWatching(false)} />
    </>
  );
}
