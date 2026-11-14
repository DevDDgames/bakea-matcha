import './globals.css';
import type { Metadata, Viewport } from 'next';
import Link from 'next/link';

import { SITE_URL as SITE } from '@/lib/site';
const TITLE = 'Pâte à tartiner matcha en précommande · Bakea, Paris 10e';
const DESCRIPTION =
  'Précommandez la pâte à tartiner au matcha de Bakea, coffee shop à impact positif du 10e : 19 € le pot de 200 ml, à retirer au 3 rue de Lancry, Paris, du 1er au 20 décembre.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: { default: TITLE, template: '%s · Bakea' },
  description: DESCRIPTION,
  applicationName: 'Bakea',
  keywords: ['pâte à tartiner matcha', 'matcha Paris', 'Bakea', 'coffee shop Paris 10', 'rue de Lancry', 'cadeau Noël Paris', 'précommande'],
  alternates: { canonical: '/' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: '/',
    siteName: 'Bakea',
    title: TITLE,
    description: DESCRIPTION,
    images: [{ url: '/og.jpg', width: 1200, height: 630, alt: 'Pâte à tartiner matcha Bakea' }],
  },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESCRIPTION, images: ['/og.jpg'] },
  formatDetection: { telephone: false, address: false, email: false },
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
          <Link href="/" className="logo" aria-label="Bakea — accueil">
            <img src="/logo.png" alt="bakea" width={110} height={41} />
          </Link>
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
