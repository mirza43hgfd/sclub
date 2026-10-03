'use client';
import { downloadLink, playerSource } from '@/lib/format.js';

export default function PlayerModal({ video, onClose }) {
  if (!video) return null;
  const src = playerSource(video);
  const dl = downloadLink(video);

  const share = () => {
    const url = window.location.origin + window.location.pathname + '#v=' + video.id;
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url), '_blank');
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h3 style={{ marginBottom: 12 }}>{video.title}</h3>
        <div className="playerbox">
          {src.kind === 'mp4' && <video src={src.src} controls autoPlay playsInline />}
          {(src.kind === 'youtube' || src.kind === 'drive') && (
            <iframe src={src.src} allowFullScreen allow="autoplay; encrypted-media" title={video.title} />
          )}
          {src.kind === 'none' && (
            <div className="center" style={{ minHeight: 200 }}>Video link not added yet.</div>
          )}
        </div>
        <div className="mrow" style={{ justifyContent: 'space-between' }}>
          <button className="btn btn-ghost btn-sm" onClick={share}>📘 Share on Facebook</button>
          <div style={{ display: 'flex', gap: 10 }}>
            {dl ? (
              <a className="btn btn-gold btn-sm" href={dl} target="_blank" rel="noopener noreferrer">⬇ Download</a>
            ) : null}
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
}
