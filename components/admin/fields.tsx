'use client';

// Small shared field components so the three admin screens don't each
// reinvent label+input styling.

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: 6, fontSize: 13 }}>
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

const base: React.CSSProperties = {
  padding: '10px 12px', background: 'transparent', border: '1px solid var(--hairline)',
  color: 'var(--bone)', borderRadius: 2, font: 'inherit', fontSize: 14, width: '100%',
};

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...base, ...props.style }} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...base, resize: 'vertical', fontFamily: 'inherit', ...props.style }} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...base, ...props.style }} />;
}

export function ErrorNote({ children }: { children: React.ReactNode }) {
  if (!children) return null;
  return <p role="alert" style={{ color: '#E9857A', fontSize: 13, margin: 0 }}>{children}</p>;
}

/**
 * Firestore rejects `undefined` field values outright. Admin forms leave
 * plenty of optional fields blank, and a naive save throws on the first one.
 * Strip them before every write instead of remembering to do it everywhere.
 */
export function stripUndefined<T extends object>(obj: T): T {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T;
}
