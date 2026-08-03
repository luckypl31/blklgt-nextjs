import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with BLacklight.',
};

export default function ContactPage() {
  return (
    <section style={{ paddingTop: 'clamp(120px,16vh,180px)', maxWidth: '64ch' }}>
      <span className="label">Contact</span>
      <h1 className="display" style={{ fontSize: 'clamp(34px,5.5vw,68px)', margin: '18px 0 14px' }}>
        Talk to us.
      </h1>
      <p style={{ color: '#9C98A6', marginBottom: 40, maxWidth: '48ch' }}>
        Press, programming, partnerships, or just want to say something — this goes straight to
        the team.
      </p>
      <ContactForm />
    </section>
  );
}
