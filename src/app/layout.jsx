import './globals.css';

export const metadata = {
  title: 'SClub — Movies',
  description: 'SClub — latest Hollywood & Bollywood movies and web series. Watch and download.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
