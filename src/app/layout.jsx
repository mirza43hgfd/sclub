import './globals.css';

export const metadata = {
  title: 'SClub — Movies & Trailers',
  description: 'SClub — latest Hollywood & Bollywood movies, trailers, teasers and entertainment. Watch and download.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
