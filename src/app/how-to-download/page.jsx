import { getSettings } from '@/lib/auth.js';
import { SiteHeader, SiteFooter } from '@/components/SiteChrome.jsx';

export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const s = await getSettings().catch(() => ({}));
  return { title: `How to Download — ${s.site_name || 'SClub'}` };
}

export default async function HowToPage() {
  const settings = await getSettings();
  return (
    <>
      <SiteHeader settings={settings} active="howto" />
      <div className="page">
        <h1>❓ How to Download</h1>
        <p className="lede">Downloading from {settings.site_name} is easy — follow these steps.</p>
        <div className="howto">{settings.howto_text || 'Guide coming soon.'}</div>
      </div>
      <SiteFooter settings={settings} />
    </>
  );
}
