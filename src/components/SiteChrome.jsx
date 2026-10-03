import Link from 'next/link';

export function SiteHeader({ settings, active }) {
  return (
    <header className="hdr">
      <div className="hdr-in">
        <Link href="/" className="logo">{settings.logo_url ? <img src={settings.logo_url} alt="SClub" className="site-logo" /> : <>{settings.logo_emoji} <b>S</b>CLUB</>}</Link>
        <nav className="nav">
          <Link href="/" className={active === 'home' ? 'on' : ''}>Home</Link>
          <Link href="/categories" className={active === 'cats' ? 'on' : ''}>Categories</Link>
          <Link href="/how-to-download" className={active === 'howto' ? 'on' : ''}>How to Download</Link>
          <Link href="/request" className={active === 'req' ? 'on' : ''}>Request Movie</Link>
        </nav>
        <form className="hdr-search" action="/search">
          <input name="q" placeholder="Search..." />
        </form>
      </div>
    </header>
  );
}

export function SiteFooter({ settings }) {
  const socials = [];
  if (settings.facebook_url) socials.push(['📘', settings.facebook_url, 'Facebook']);
  if (settings.telegram_url) socials.push(['✈', settings.telegram_url, 'Telegram']);
  if (settings.instagram_url) socials.push(['📸', settings.instagram_url, 'Instagram']);
  return (
    <footer className="ftr">
      <div className="socials">
        {socials.map(([icon, url, name]) => (
          <a key={name} href={url} target="_blank" rel="noopener noreferrer">{icon} {name}</a>
        ))}
      </div>
      <div>© {new Date().getFullYear()} {settings.site_name} · {settings.footer_text}</div>
    </footer>
  );
}
