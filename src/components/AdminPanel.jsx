'use client';
// SClub v2 admin panel: videos (+poster/language/quality), categories, requests, customize, ads.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const THEME_COLORS = ['#e5484d', '#d4a437', '#3fb68b', '#4f8ef7', '#a855f7', '#f76fb1', '#22c1a3', '#f0f0f0'];
const CUSTOM_FIELDS = [
  ['site_name', 'Website name', 'text'],
  ['tagline', 'Tagline', 'text'],
  ['logo_emoji', 'Logo emoji', 'text'],
  ['hero_title', 'Hero title (HTML allowed)', 'text'],
  ['hero_subtitle', 'Hero subtitle', 'textarea'],
  ['footer_text', 'Footer text', 'text'],
  ['meta_description', 'SEO description (Google/Facebook preview)', 'textarea'],
  ['facebook_url', 'Facebook page URL', 'text'],
  ['telegram_url', 'Telegram channel/group URL', 'text'],
  ['instagram_url', 'Instagram URL', 'text'],
  ['howto_text', 'How-to-Download guide text', 'textarea']
];
const EMPTY_VIDEO = { title: '', category_id: '', video_type: 'drive', video_url: '', thumbnail_url: '', duration: '', description: '', language: '', year: '', q480: '', q720: '', q1080: '', featured: false, published: true };

function toForm(v) {
  let ql = {};
  try { ql = typeof v.quality_links === 'string' ? JSON.parse(v.quality_links) : (v.quality_links || {}); } catch {}
  return { ...EMPTY_VIDEO, ...v, category_id: v.category_id || '', q480: ql['480p'] || '', q720: ql['720p'] || '', q1080: ql['1080p'] || '' };
}
function toPayload(f) {
  const { q480, q720, q1080, ...rest } = f;
  const quality_links = {};
  if (q480.trim()) quality_links['480p'] = q480.trim();
  if (q720.trim()) quality_links['720p'] = q720.trim();
  if (q1080.trim()) quality_links['1080p'] = q1080.trim();
  return { ...rest, quality_links };
}

async function api(path, opts = {}) {
  const r = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...opts });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(j.error || 'Request failed');
  return j;
}

export default function AdminPanel() {
  const router = useRouter();
  const [tab, setTab] = useState('videos');
  const [videos, setVideos] = useState([]);
  const [cats, setCats] = useState([]);
  const [settings, setSettings] = useState({});
  const [requests, setRequests] = useState([]);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const [v, c, s, rq] = await Promise.all([
      api('/api/videos?all=1'),
      api('/api/categories'),
      api('/api/settings'),
      api('/api/requests').catch(() => ({ requests: [] }))
    ]);
    setVideos(v.videos);
    setCats(c.categories);
    setSettings(s.settings);
    setRequests(rq.requests || []);
  }

  useEffect(() => { load().catch((e) => setMsg('Load error: ' + e.message)); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2600); };
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }
  const catName = (v) => v.category_name || 'General';
  const pendingCount = requests.filter(r => r.status !== 'done').length;

  /* ---------- videos ---------- */
  async function saveVideo(e) {
    e.preventDefault();
    const wasNew = !editing.id;
    try {
      const payload = toPayload(editing);
      if (editing.id) await api(`/api/videos/${editing.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      else await api('/api/videos', { method: 'POST', body: JSON.stringify(payload) });
      setEditing(null); await load(); flash(wasNew ? 'Added ✓' : 'Updated ✓');
    } catch (ex) { flash('Error: ' + ex.message); }
  }
  async function delVideo(id, title) {
    if (!confirm(`Delete "${title}"?`)) return;
    try { await api(`/api/videos/${id}`, { method: 'DELETE' }); await load(); flash('Deleted'); }
    catch (ex) { flash('Error: ' + ex.message); }
  }
  async function toggle(id, field, val) {
    try { await api(`/api/videos/${id}`, { method: 'PATCH', body: JSON.stringify({ [field]: val }) }); await load(); }
    catch (ex) { flash('Error: ' + ex.message); }
  }

  /* ---------- categories ---------- */
  const [newCat, setNewCat] = useState('');
  const [newCatColor, setNewCatColor] = useState('#e5484d');
  async function addCat() {
    if (!newCat.trim()) { flash('Naam likho'); return; }
    try { await api('/api/categories', { method: 'POST', body: JSON.stringify({ name: newCat.trim(), color: newCatColor }) }); setNewCat(''); await load(); flash('Category added ✓'); }
    catch (ex) { flash('Error: ' + ex.message); }
  }
  async function renameCat(c) {
    const n = prompt('Rename category:', c.name);
    if (!n || !n.trim() || n.trim() === c.name) return;
    try { await api(`/api/categories/${c.id}`, { method: 'PATCH', body: JSON.stringify({ name: n.trim() }) }); await load(); flash('Renamed ✓'); }
    catch (ex) { flash('Error: ' + ex.message); }
  }
  async function delCat(c) {
    if (!confirm(`Delete "${c.name}"? Its videos move to General.`)) return;
    try { await api(`/api/categories/${c.id}`, { method: 'DELETE' }); await load(); flash('Deleted'); }
    catch (ex) { flash('Error: ' + ex.message); }
  }

  /* ---------- requests ---------- */
  async function reqDone(r) {
    try { await api(`/api/requests/${r.id}`, { method: 'PATCH', body: JSON.stringify({ status: r.status === 'done' ? 'pending' : 'done' }) }); await load(); }
    catch (ex) { flash('Error: ' + ex.message); }
  }
  async function reqDel(r) {
    if (!confirm(`Delete request "${r.title}"?`)) return;
    try { await api(`/api/requests/${r.id}`, { method: 'DELETE' }); await load(); flash('Deleted'); }
    catch (ex) { flash('Error: ' + ex.message); }
  }

  /* ---------- settings / ads ---------- */
  async function saveSettings(patch) {
    try { const j = await api('/api/settings', { method: 'PUT', body: JSON.stringify(patch) }); setSettings(j.settings); flash('Saved ✓ — website pe foran live'); }
    catch (ex) { flash('Error: ' + ex.message); }
  }
  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const TABS = [
    ['videos', '🎬 Videos'],
    ['cats', '🗂 Categories'],
    ['requests', `🙏 Requests${pendingCount ? ` (${pendingCount})` : ''}`],
    ['custom', '🎨 Customize'],
    ['ads', '💰 Ads']
  ];

  return (
    <div className="adm">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
        <h2 style={{ flex: 1, margin: 0 }}>🔧 SClub Admin Panel</h2>
        <a className="btn ghost sm" href="/" target="_blank" rel="noreferrer">View site ↗</a>
        <button className="btn ghost sm" onClick={logout}>Logout</button>
      </div>
      <p style={{ color: 'var(--muted)', fontSize: 13, margin: '0 0 6px' }}>Jo bhi badlo ge, website pe foran live ho jayega.</p>
      {msg && <div className="notice" style={{ marginTop: 10 }}>{msg}</div>}

      <div className="adm-tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === 'videos' && (
        <div>
          {!editing ? (
            <>
              <button className="btn sm" onClick={() => setEditing({ ...EMPTY_VIDEO })}>＋ Add New Movie</button>
              <div style={{ height: 14 }} />
              {videos.map((v) => (
                <div className="vform" style={{ padding: 12, marginBottom: 10 }} key={v.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <b style={{ fontSize: 14 }}>{v.title}</b>
                      <div style={{ fontSize: 12, color: 'var(--muted)' }}>{catName(v)} · {v.video_type} · 👁 {v.views || 0}{v.published ? '' : ' · Hidden'}{v.language ? ` · ${v.language}` : ''}</div>
                    </div>
                    <div className="rowbtns">
                      <button className={'iconbtn' + (v.featured ? ' ok' : '')} onClick={() => toggle(v.id, 'featured', !v.featured)}>★ Featured</button>
                      <button className={'iconbtn' + (v.published ? ' ok' : '')} onClick={() => toggle(v.id, 'published', !v.published)}>{v.published ? 'Live' : 'Hidden'}</button>
                      <button className="iconbtn" onClick={() => setEditing(toForm(v))}>Edit</button>
                      <button className="iconbtn danger" onClick={() => delVideo(v.id, v.title)}>Del</button>
                    </div>
                  </div>
                </div>
              ))}
              {!videos.length && <p style={{ color: 'var(--muted)' }}>Koi movie nahi — Add New Movie dabao.</p>}
            </>
          ) : (
            <form className="vform" onSubmit={saveVideo}>
              <h3 style={{ margin: 0 }}>{editing.id ? 'Edit Movie' : 'Add Movie'}</h3>
              <div className="field"><label>Title *</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required placeholder="e.g. Avengers Doomsday (2026) Hindi Dubbed" />
              </div>
              <div className="frow">
                <div className="field"><label>Category *</label>
                  <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                    <option value="">General</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field"><label>Main link type *</label>
                  <select value={editing.video_type} onChange={(e) => setEditing({ ...editing, video_type: e.target.value })}>
                    <option value="drive">Google Drive link</option>
                    <option value="mp4">Direct MP4 link</option>
                    <option value="youtube">Trailer link (YouTube)</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Main Video/Trailer Link *</label>
                <input value={editing.video_url} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} required placeholder="Paste link here" />
                <div className="hint">Watch Now button isi link se chalega.</div>
              </div>
              <div className="field"><label>Download links by quality (optional)</label>
                <div className="hint" style={{ marginBottom: 8 }}>Khali chhoro to sirf main link ka download button dikhega.</div>
              </div>
              <div className="frow3" style={{ marginTop: -8 }}>
                <div className="field"><label>480p link</label>
                  <input value={editing.q480} onChange={(e) => setEditing({ ...editing, q480: e.target.value })} placeholder="https://…" />
                </div>
                <div className="field"><label>720p link</label>
                  <input value={editing.q720} onChange={(e) => setEditing({ ...editing, q720: e.target.value })} placeholder="https://…" />
                </div>
                <div className="field"><label>1080p link</label>
                  <input value={editing.q1080} onChange={(e) => setEditing({ ...editing, q1080: e.target.value })} placeholder="https://…" />
                </div>
              </div>
              <div className="frow">
                <div className="field"><label>Poster image URL</label>
                  <input value={editing.thumbnail_url} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} placeholder="https://… (portrait poster best hai)" />
                </div>
                <div className="field"><label>Duration</label>
                  <input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="e.g. 2:31" />
                </div>
              </div>
              <div className="frow3">
                <div className="field"><label>Language</label>
                  <input value={editing.language} onChange={(e) => setEditing({ ...editing, language: e.target.value })} placeholder="e.g. Hindi Dubbed" />
                </div>
                <div className="field"><label>Year</label>
                  <input value={editing.year} onChange={(e) => setEditing({ ...editing, year: e.target.value })} placeholder="e.g. 2026" />
                </div>
                <div className="field"><label style={{ visibility: 'hidden' }}>_</label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <label className="chk"><input type="checkbox" checked={!!editing.featured} onChange={(e) => setEditing({ ...editing, featured: e.target.checked })} /> ⭐ Featured</label>
                    <label className="chk"><input type="checkbox" checked={!!editing.published} onChange={(e) => setEditing({ ...editing, published: e.target.checked })} /> Live</label>
                  </div>
                </div>
              </div>
              <div className="field"><label>Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" className="btn ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn">💾 Save</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'cats' && (
        <div>
          <div className="field"><label>New category</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. KDrama" style={{ flex: 1 }} />
              <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} style={{ width: 52, flex: 'none', padding: 4 }} />
              <button className="btn sm" onClick={addCat}>Add</button>
            </div>
          </div>
          {cats.map((c) => (
            <div className="vform" style={{ padding: 12, marginBottom: 10 }} key={c.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <b style={{ flex: 1 }}>
                  <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c.color, marginRight: 8 }} />
                  {c.name}</b>
                <div className="rowbtns">
                  <button className="iconbtn" onClick={() => renameCat(c)}>Rename</button>
                  <button className="iconbtn danger" onClick={() => delCat(c)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'requests' && (
        <div>
          {!requests.length && <p style={{ color: 'var(--muted)' }}>Koi request nahi ayi abhi.</p>}
          {requests.map((r) => (
            <div className="vform" style={{ padding: 12, marginBottom: 10, opacity: r.status === 'done' ? .55 : 1 }} key={r.id}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <b style={{ fontSize: 14 }}>{r.status === 'done' ? '✅ ' : '🙏 '}{r.title}</b>
                  {r.details && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{r.details}</div>}
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4 }}>{new Date(r.created_at).toLocaleString()}</div>
                </div>
                <div className="rowbtns">
                  <button className={'iconbtn' + (r.status === 'done' ? '' : ' ok')} onClick={() => reqDone(r)}>
                    {r.status === 'done' ? 'Reopen' : 'Mark done'}
                  </button>
                  <button className="iconbtn danger" onClick={() => reqDel(r)}>Del</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'custom' && (
        <div>
          <div className="field"><label>Theme color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
              {THEME_COLORS.map((c) => (
                <div key={c} onClick={() => set('primary_color', c)}
                  style={{ width: 38, height: 38, borderRadius: 10, cursor: 'pointer', background: c, border: (settings.primary_color || '').toLowerCase() === c ? '2px solid #fff' : '2px solid transparent' }} />
              ))}
            </div>
            <input type="color" value={settings.primary_color || '#e5484d'} onChange={(e) => set('primary_color', e.target.value)} style={{ width: 52, padding: 3 }} />
          </div>
          {CUSTOM_FIELDS.map(([k, label, type]) => (
            <div className="field" key={k}><label>{label}</label>
              {type === 'textarea'
                ? <textarea value={settings[k] || ''} onChange={(e) => set(k, e.target.value)} style={k === 'howto_text' ? { minHeight: 220, fontFamily: 'monospace', fontSize: 13 } : {}} />
                : <input value={settings[k] || ''} onChange={(e) => set(k, e.target.value)} />}
            </div>
          ))}
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" onClick={() => saveSettings(settings)}>💾 Save Website Design</button>
          </div>
        </div>
      )}

      {tab === 'ads' && (
        <div>
          <div className="notice"><b>💰 Adsterra:</b> Adsterra dashboard se ad code copy karo aur neeche paste kar do. Khali chhoro to koi ad nahi dikhega.</div>
          {[
            ['ad_header_code', 'Header banner ad code', 'Website ke top pe dikhega.'],
            ['ad_infeed_code', 'In-feed ad code (movies ke beech mein)', 'Har 8 movies ke baad ek ad card dikhega.'],
            ['ad_popunder_code', 'Popunder / Social bar code', 'Poori site pe chalega. Zyada ads visitors ko bhaga sakte hain.']
          ].map(([k, label, hint]) => (
            <div className="field" key={k}><label>{label}</label>
              <textarea value={settings[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder="Paste Adsterra code…" style={{ fontFamily: 'monospace', fontSize: 12 }} />
              <div className="hint">{hint}</div>
            </div>
          ))}
          <button className="btn" onClick={() => saveSettings({
            ad_header_code: settings.ad_header_code || '',
            ad_infeed_code: settings.ad_infeed_code || '',
            ad_popunder_code: settings.ad_popunder_code || ''
          })}>💾 Save Ad Codes</button>
        </div>
      )}
    </div>
  );
}
