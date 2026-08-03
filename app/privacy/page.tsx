import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Privacy' };

const PARAGRAPHS = [
  'At BLKLGT, we respect your privacy and are committed to protecting any personal information you share with us when visiting our website, blklgt.com. This policy explains how we collect, use, and safeguard your information, and what choices you have regarding your data.',
  'When you visit our site, we may collect personal information such as your name or email address\u2014especially if you sign up for our newsletter, contact us directly, or participate in any interactive features like giveaways or surveys. We also automatically gather non-personal details such as your browser type, device, IP address, and how you navigate the site. This helps us understand how people are engaging with our content so we can improve the overall experience.',
  'We use this information to respond to inquiries, send updates about our films and projects, improve site performance, and track basic analytics. We do not sell or rent your information to anyone. Occasionally, we may work with trusted third-party services\u2014like email platforms or analytics tools\u2014but only under strict confidentiality and only as necessary to operate our website effectively.',
  'Our site may use cookies and similar technologies to enhance user experience. You can control or disable cookies through your browser settings, but please note that some features of the site may not function properly without them.',
  'If you subscribe to our newsletter, you can opt out at any time by clicking \u201cunsubscribe\u201d in the email. If you ever want to access, update, or delete your personal information, just contact us and we\u2019ll be happy to help.',
  'BLKLGT may contain links to other websites. Please be aware that we are not responsible for the privacy practices of those external sites, and we recommend reviewing their policies before sharing any information.',
  'We take reasonable measures to keep your data secure, though no online platform can guarantee 100% security. By using this site, you accept this risk.',
  'Our website is intended for users over the age of 13, and we do not knowingly collect information from children. If we learn that a child has submitted personal information, we will take steps to remove it.',
  'We may occasionally update this Privacy Policy to reflect changes in our practices. Any updates will be posted here with a revised effective date, and by continuing to use the site, you agree to the updated policy.',
  'If you have any questions about this Privacy Policy or how we handle your data, please reach out to us at info@blklgt.com.',
];

export default function Privacy() {
  return (
    <section style={{ paddingTop: 'clamp(120px,16vh,180px)', maxWidth: '68ch' }}>
      <span className="label">Privacy</span>
      <h1 className="display" style={{ fontSize: 'clamp(32px,5vw,64px)', margin: '18px 0 30px' }}>
        Privacy Policy.
      </h1>

      <div style={{ color: '#B6B2AB', display: 'grid', gap: 20, fontSize: 15, lineHeight: 1.7 }}>
        {PARAGRAPHS.map((p, i) => <p key={i}>{p}</p>)}
        <p style={{ color: '#57555F', fontSize: 13, marginTop: 18 }}>
          Last updated {new Date().getFullYear()}.
        </p>
      </div>
    </section>
  );
}
