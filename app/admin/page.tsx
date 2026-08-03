import Link from 'next/link';

const CARDS = [
  { href: '/admin/films', title: 'Films', body: 'Add, edit, or remove titles from the slate. Controls what shows on both blklgt.com and iamwesmiller.com.' },
  { href: '/admin/tour', title: 'Tour', body: 'Manage tour stops. When the list is empty, the site shows a designed fallback instead of a blank section — edit that here too.' },
  { href: '/admin/bios', title: 'Bios', body: 'Short and full bios for Wes and Andrew. The short version shows by default; the full one expands in place.' },
];

export default function AdminHome() {
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <h1 className="display" style={{ fontSize: 36, margin: '0 0 8px' }}>Admin</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 16 }}>
        {CARDS.map((c) => (
          <Link key={c.href} href={c.href} style={{ border: '1px solid var(--hairline)', padding: 22, display: 'block' }}>
            <h2 style={{ fontFamily: 'var(--font-display),serif', fontSize: 22, margin: '0 0 8px' }}>{c.title}</h2>
            <p style={{ color: 'var(--ash)', fontSize: 14, margin: 0 }}>{c.body}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
