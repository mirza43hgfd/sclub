import './globals.css';

export const metadata = {
  title: 'SClub — Movie Trailers',
  description: 'SClub — latest Hollywood & Bollywood movie trailers, teasers and entertainment.'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
