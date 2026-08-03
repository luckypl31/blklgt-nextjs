import Link from 'next/link';

export default function NotFound() {
  return (
    <section style={{ paddingTop: 'clamp(160px,24vh,260px)', textAlign: 'center' }}>
      <span className="label">404</span>
      <h1 className="display" style={{ fontSize: 'clamp(38px,7vw,90px)', margin: '18px 0 14px' }}>
        Nothing here to light up.
      </h1>
      <p style={{ color: '#9C98A6', marginBottom: 34 }}>
        That page moved or never existed.
      </p>
      <Link className="btn" href="/" style={{ display: 'inline-block' }}>
        Back to the slate
      </Link>
    </section>
  );
}
