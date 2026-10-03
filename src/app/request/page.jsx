import { getSettings } from '@/lib/auth.js';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome.jsx';
import RequestForm from '@/components/RequestForm.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings().catch(() => ({}));
  return { title: `Request a Movie — ${s.site_name || 'SClub'}` };
}

export default async function RequestPage() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader settings={settings} active="req" />
      <div className="page">
        <h1>🙏 Request a Movie</h1>
        <p className="lede">Can't find the movie you want? Tell us — we add requested movies regularly.</p>
        <RequestForm telegram={settings.telegram_url} />
      </div>
      <SiteFooter settings={settings} />
    </>
  );
}
