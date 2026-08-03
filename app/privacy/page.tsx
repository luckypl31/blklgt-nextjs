import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy' };

export default function Privacy() {
  return (
    <section style={{ paddingTop: 'clamp(120px,16vh,180px)', maxWidth: '68ch' }}>
      <span className="label">Privacy</span>
      <h1 className="display" style={{ fontSize: 'clamp(32px,5vw,64px)', margin: '18px 0 30px' }}>
        What we collect, and why.
      </h1>

      <div style={{ color: '#B6B2AB', display: 'grid', gap: 20 }}>
        <p>
          If you join the BLKLGT we store your email address and the referral code
          issued to you. That&rsquo;s it. We use it to send screening invites, trailers, and
          release news.
        </p>
        <p>
          We don&rsquo;t sell your information and we don&rsquo;t share it with advertisers. Every
          email we send has an unsubscribe link, and unsubscribing removes your record.
        </p>
        <p>
          Ticketing is handled by our partners at each venue. When you buy a ticket you&rsquo;re
          on their systems and their policies, not ours.
        </p>
        <p>
          To see what we hold on you or to have it deleted, email us and we&rsquo;ll take care of
          it.
        </p>
        <p style={{ color: '#57555F', fontSize: 13, marginTop: 18 }}>
          {/* Replace with the reviewed policy before launch — this is a plain-language
              placeholder, not legal copy. */}
          Last updated {new Date().getFullYear()}.
        </p>
      </div>
    </section>
  );
}
