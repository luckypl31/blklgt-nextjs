import Link from 'next/link';
import AuthGate from '@/components/admin/AuthGate';

export const metadata = { title: 'Admin', robots: { index: false, follow: false } };

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div style={{ padding: '0 var(--pad)', maxWidth: 1100, margin: '0 auto' }}>
        <nav style={{ display: 'flex', gap: 24, padding: '28px 0 20px', borderBottom: '1px solid var(--hairline)' }}>
          <Link href="/admin/films" className="label">Films</Link>
          <Link href="/admin/tour" className="label">Tour</Link>
          <Link href="/admin/bios" className="label">Bios</Link>
          <Link href="/" className="label" style={{ marginLeft: 'auto' }}>View site →</Link>
        </nav>
        <div style={{ padding: '32px 0 80px' }}>{children}</div>
      </div>
    </AuthGate>
  );
}
