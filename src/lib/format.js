// Shared video-link helpers (used by frontend components).

export function driveId(u) {
  if (!u) return null;
  const m =
    u.match(/drive\.google\.com\/file\/d\/([^\/&?#]+)/) ||
    u.match(/drive\.google\.com\/open\?id=([^&]+)/) ||
    u.match(/[?&]id=([-\w]{10,})/);
  return m ? m[1] : null;
}

export function youtubeId(u) {
  if (!u) return null;
  const m = u.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([-\w]{6,})/);
  return m ? m[1] : null;
}

/** Direct-download URL for a video record (Drive share links converted). */
export function downloadLink(v) {
  const u = (v.video_url || '').trim();
  if (!u) return '';
  if (v.video_type === 'drive') {
    const id = driveId(u);
    return id ? `https://drive.google.com/uc?export=download&id=${id}` : u;
  }
  return u;
}

/** Player embed info: {kind:'youtube'|'mp4'|'drive', src} or {kind:'none'}. */
export function playerSource(v) {
  const u = (v.video_url || '').trim();
  if (!u) return { kind: 'none' };
  if (v.video_type === 'youtube') {
    const id = youtubeId(u);
    return id ? { kind: 'youtube', src: `https://www.youtube.com/embed/${id}` } : { kind: 'none' };
  }
  if (v.video_type === 'mp4') return { kind: 'mp4', src: u };
  const did = driveId(u);
  return did ? { kind: 'drive', src: `https://drive.google.com/file/d/${did}/preview` } : { kind: 'none' };
}
