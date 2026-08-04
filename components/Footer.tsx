import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function Footer() {
  return (
    <footer>
      <div className="fgrid">
        <div>
          <div className="wordmark" style={{ fontSize: 26 }}>
            <b>BL</b>
            <span>acklight</span>
          </div>
          <p style={{ margin: '12px 0 0', color: '#57555F', fontSize: 13, maxWidth: '34ch' }}>
            Elevated genre cinema. Distribution in partnership with Dark Star Pictures.
          </p>
        </div>
        <nav>
          <Link href="/films">Films</Link>
          <Link href="/#tour">Tour</Link>
          <a href={SITE.onDemand} target="_blank" rel="noopener noreferrer">Watch</a>
          <Link href="/#about">About</Link>
          <Link href="/#insider">Newsletter</Link>
          <a href={SITE.society} target="_blank" rel="noopener noreferrer">Society</a>
          <Link href="/contact">Contact</Link>
          <a href={SITE.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
        </nav>
      </div>
      <div className="legal">
        <span>© {new Date().getFullYear()} BLacklight. All rights reserved.</span>
        <Link href="/privacy">Privacy</Link>
      </div>
    </footer>
  );
}
