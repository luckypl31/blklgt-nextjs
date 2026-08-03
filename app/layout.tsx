import type { Metadata } from 'next';
import { Bodoni_Moda, Instrument_Sans } from 'next/font/google';
import Blacklight from '@/components/Blacklight';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import RevealRoot from '@/components/RevealRoot';
import { SITE } from '@/lib/site';
import './globals.css';

// Bodoni carries the poster voice; Instrument Sans is the house UI face
// already used across BLACKBOX, so the two properties feel related.
const display = Bodoni_Moda({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  style: ['normal', 'italic'],
  variable: '--font-display',
  display: 'swap',
});

const sans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: 'BLacklight — Elevated genre cinema', template: '%s — BLacklight' },
  description: SITE.description,
  openGraph: {
    type: 'website',
    siteName: SITE.name,
    title: 'BLacklight — Elevated genre cinema',
    description: SITE.description,
    url: SITE.url,
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <head>
        {/* Set before first paint so scroll-reveal content starts hidden with
            no flash. Gating it this way means that if JS fails to load, .rv
            content stays visible instead of the page rendering blank. */}
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body>
        <Blacklight />
        <RevealRoot />
        <Nav />
        <main id="top">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
