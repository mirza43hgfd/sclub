'use client';
import { downloadLink, playerSource } from '@/lib/format.js';

export default function PlayerModal({ video, onClose }) {
  if (!video) return null;
  const src = playerSource(video);
  const dl = downloadLink(video);

  const share = () => {
    const url = window.location.href.split('#')[0];
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
  };

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <b>{video.title}</b>
          <button className="x" onClick={onClose}>✕</button>
        </div>
        <div className="player-wrap">
          {src.kind === 'mp4' && <video src={src.src} controls autoPlay playsInline />}
          {(src.kind === 'youtube' || src.kind === 'drive') && (
            <iframe src={src.src} allowFullScreen allow="autoplay; encrypted-media" title={video.title} />
          )}
          {src.kind === 'none' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--muted)' }}>
              Video link not added yet.
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10, padding: 14, flexWrap: 'wrap' }}>
          <button className="btn ghost sm" onClick={share}>📘 Share</button>
          {dl && <a className="btn sm" href={dl} target="_blank" rel="noopener noreferrer">⬇ Download</a>}
        </div>
      </div>
    </div>
  );
}
