import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Précommande · Pâte à tartiner matcha — Bakea',
  description: 'Précommandez la pâte à tartiner matcha de Bakea, à retirer au 3 rue de Lancry, Paris 10e, du 1er au 21 décembre.',
};
export const viewport: Viewport = { themeColor: '#f6efe1' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,400..900,0..100,0..1;1,9..144,400..900,0..100,0..1&family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <div className="glow" />
        <header className="topbar">
          <Link href="/" className="logo">bakea</Link>
          <nav className="topbar-right">
            <a href="https://www.instagram.com/bakea.coffee" target="_blank" rel="noopener noreferrer" aria-label="Instagram de Bakea (nouvel onglet)" title="@bakea.coffee">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
              </svg>
            </a>
          </nav>
        </header>
        {children}
        <footer className="footer">
          <span>© Bakea · Coffee shop à impact positif</span>
          <Link href="/cgv">CGV</Link>
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </footer>
      </body>
    </html>
  );
}
