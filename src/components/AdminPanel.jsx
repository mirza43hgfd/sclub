'use client';
// SClub admin panel: videos, categories, full website customization, ad codes.
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const THEME_COLORS = ['#d4a437', '#e5484d', '#3fb68b', '#4f8ef7', '#a855f7', '#f76fb1', '#22c1a3', '#f0f0f0'];
const CUSTOM_FIELDS = [
  ['site_name', 'Website name', 'text'],
  ['tagline', 'Tagline (under logo)', 'text'],
  ['logo_emoji', 'Logo emoji', 'text'],
  ['hero_title', 'Hero title (HTML allowed)', 'text'],
  ['hero_subtitle', 'Hero subtitle', 'textarea'],
  ['hero_banner_url', 'Hero banner image URL', 'text'],
  ['footer_text', 'Footer text', 'text'],
  ['meta_description', 'SEO description (Google/Facebook preview)', 'textarea'],
  ['facebook_url', 'Facebook page URL', 'text'],
  ['instagram_url', 'Instagram URL', 'text']
];
const EMPTY_VIDEO = { title: '', category_id: '', video_type: 'drive', video_url: '', thumbnail_url: '', duration: '', description: '' };

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
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState('');

  async function load() {
    const [v, c, s] = await Promise.all([
      api('/api/videos?all=1'),
      api('/api/categories'),
      api('/api/settings')
    ]);
    setVideos(v.videos);
    setCats(c.categories);
    setSettings(s.settings);
  }

  useEffect(() => { load().catch((e) => setMsg('Load error: ' + e.message)); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 2600); };
  async function logout() { await fetch('/api/auth/logout', { method: 'POST' }); router.push('/'); }
  const catName = (v) => v.category_name || 'General';

  /* ---------- videos ---------- */
  async function saveVideo(e) {
    e.preventDefault();
    try {
      if (editing.id) await api(`/api/videos/${editing.id}`, { method: 'PATCH', body: JSON.stringify(editing) });
      else await api('/api/videos', { method: 'POST', body: JSON.stringify(editing) });
      setEditing(null); await load(); flash(editing.id ? 'Video updated ✓' : 'Video added ✓');
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
  const [newCatColor, setNewCatColor] = useState('#d4a437');
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

  /* ---------- settings / ads ---------- */
  async function saveSettings(patch) {
    try { const j = await api('/api/settings', { method: 'PUT', body: JSON.stringify(patch) }); setSettings(j.settings); flash('Saved ✓ — website pe foran live'); }
    catch (ex) { flash('Error: ' + ex.message); }
  }
  const set = (k, v) => setSettings((s) => ({ ...s, [k]: v }));

  const TABS = [['videos', '🎬 Videos'], ['cats', '🗂 Categories'], ['custom', '🎨 Customize Website'], ['ads', '💰 Ads (Adsterra)']];

  return (
    <div className="wrap adminpage">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
        <h2 style={{ flex: 1 }}>🔧 SClub Admin Panel</h2>
        <a className="btn btn-ghost btn-sm" href="/" target="_blank" rel="noreferrer">View site ↗</a>
        <button className="btn btn-ghost btn-sm" onClick={logout}>Logout</button>
      </div>
      <p className="sub" style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 18 }}>Jo bhi badlo ge, website pe foran live ho jayega.</p>
      {msg && <div className="note" style={{ marginTop: 0 }}>{msg}</div>}

      <div className="tabs">
        {TABS.map(([k, label]) => (
          <button key={k} className={'tab' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>{label}</button>
        ))}
      </div>

      {tab === 'videos' && (
        <div>
          {!editing ? (
            <>
              <button className="btn btn-gold btn-sm" onClick={() => setEditing({ ...EMPTY_VIDEO })}>＋ Add New Video</button>
              <div style={{ height: 14 }} />
              {videos.map((v) => (
                <div className="vrow" key={v.id}>
                  <div className="vt"><b>{v.title}</b>
                    <span>{catName(v)} · {v.video_type} · 👁 {v.views || 0}{v.published ? '' : ' · Hidden'}</span>
                  </div>
                  <button className={'tgl star' + (v.featured ? ' on' : '')} onClick={() => toggle(v.id, 'featured', !v.featured)}>★</button>
                  <button className={'tgl' + (v.published ? ' on' : '')} onClick={() => toggle(v.id, 'published', !v.published)}>{v.published ? 'Live' : 'Hidden'}</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditing({ ...EMPTY_VIDEO, ...v, category_id: v.category_id || '' })}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => delVideo(v.id, v.title)}>Del</button>
                </div>
              ))}
              {!videos.length && <p style={{ color: 'var(--muted)' }}>Koi video nahi — Add New Video dabao.</p>}
            </>
          ) : (
            <form onSubmit={saveVideo}>
              <h3 style={{ marginBottom: 14 }}>{editing.id ? 'Edit Video' : 'Add Video'}</h3>
              <div className="field"><label>Title *</label>
                <input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} required />
              </div>
              <div className="row2">
                <div className="field"><label>Category *</label>
                  <select value={editing.category_id} onChange={(e) => setEditing({ ...editing, category_id: e.target.value })}>
                    <option value="">General</option>
                    {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="field"><label>Video type *</label>
                  <select value={editing.video_type} onChange={(e) => setEditing({ ...editing, video_type: e.target.value })}>
                    <option value="drive">Google Drive link</option>
                    <option value="mp4">Direct MP4 link</option>
                    <option value="youtube">Trailer link (YouTube)</option>
                  </select>
                </div>
              </div>
              <div className="field"><label>Video Link *</label>
                <input value={editing.video_url} onChange={(e) => setEditing({ ...editing, video_url: e.target.value })} required placeholder="Paste link here" />
                <div className="hint">Drive ka share link paste karo — preview & download auto handle ho jayega.</div>
              </div>
              <div className="row2">
                <div className="field"><label>Thumbnail image URL</label>
                  <input value={editing.thumbnail_url} onChange={(e) => setEditing({ ...editing, thumbnail_url: e.target.value })} placeholder="https://…" />
                </div>
                <div className="field"><label>Duration</label>
                  <input value={editing.duration} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} placeholder="e.g. 12:45" />
                </div>
              </div>
              <div className="field"><label>Description</label>
                <textarea value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="mrow">
                <button type="button" className="btn btn-ghost" onClick={() => setEditing(null)}>Cancel</button>
                <button type="submit" className="btn btn-gold">Save Video</button>
              </div>
            </form>
          )}
        </div>
      )}

      {tab === 'cats' && (
        <div>
          <div className="field"><label>New category</label>
            <div style={{ display: 'flex', gap: 10 }}>
              <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="e.g. Comedy" style={{ flex: 1 }} />
              <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} style={{ width: 52, flex: 'none', padding: 4 }} />
              <button className="btn btn-gold btn-sm" onClick={addCat}>Add</button>
            </div>
          </div>
          {cats.map((c) => (
            <div className="vrow" key={c.id}>
              <div className="vt"><b>
                <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: '50%', background: c.color, marginRight: 8 }} />
                {c.name}</b>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={() => renameCat(c)}>Rename</button>
              <button className="btn btn-danger btn-sm" onClick={() => delCat(c)}>Del</button>
            </div>
          ))}
        </div>
      )}

      {tab === 'custom' && (
        <div>
          <div className="field"><label>Theme color</label>
            <div className="colorpick">
              {THEME_COLORS.map((c) => (
                <div key={c} className={'swatch' + ((settings.primary_color || '').toLowerCase() === c ? ' sel' : '')}
                  style={{ background: c }} onClick={() => set('primary_color', c)} />
              ))}
            </div>
            <input type="color" value={settings.primary_color || '#d4a437'} onChange={(e) => set('primary_color', e.target.value)} style={{ width: 52, padding: 3 }} />
          </div>
          {CUSTOM_FIELDS.map(([k, label, type]) => (
            <div className="field" key={k}><label>{label}</label>
              {type === 'textarea'
                ? <textarea value={settings[k] || ''} onChange={(e) => set(k, e.target.value)} />
                : <input value={settings[k] || ''} onChange={(e) => set(k, e.target.value)} />}
            </div>
          ))}
          <div className="mrow" style={{ justifyContent: 'flex-start' }}>
            <button className="btn btn-gold" onClick={() => saveSettings(settings)}>💾 Save Website Design</button>
          </div>
        </div>
      )}

      {tab === 'ads' && (
        <div>
          <div className="note"><b>💰 Adsterra:</b> Adsterra dashboard se ad code copy karo aur neeche paste kar do. Khali chhoro to koi ad nahi dikhega.</div>
          {[
            ['ad_header_code', 'Header banner ad code', 'Website ke top pe dikhega.'],
            ['ad_infeed_code', 'In-feed ad code (videos ke beech mein)', 'Har 6 videos ke baad ek ad card dikhega.'],
            ['ad_popunder_code', 'Popunder / Social bar code', 'Poori site pe chalega. Zyada ads visitors ko bhaga sakte hain.']
          ].map(([k, label, hint]) => (
            <div className="field" key={k}><label>{label}</label>
              <textarea value={settings[k] || ''} onChange={(e) => set(k, e.target.value)} placeholder="Paste Adsterra code…" style={{ fontFamily: 'monospace', fontSize: 12 }} />
              <div className="hint">{hint}</div>
            </div>
          ))}
          <div className="mrow" style={{ justifyContent: 'flex-start' }}>
            <button className="btn btn-gold" onClick={() => saveSettings({
              ad_header_code: settings.ad_header_code || '',
              ad_infeed_code: settings.ad_infeed_code || '',
              ad_popunder_code: settings.ad_popunder_code || ''
            })}>💾 Save Ad Codes</button>
          </div>
        </div>
      )}
    </div>
  );
}
