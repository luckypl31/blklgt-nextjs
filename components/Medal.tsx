// A minimal award mark — two rings and a four-point sparkle, rendered in
// currentColor so it inherits bone by default and violet on hover via CSS.
// Deliberately not a literal gold-trophy clip-art icon: this site's whole
// visual language is spare and editorial, and an ornate laurel wreath would
// read as a stock-icon insert rather than something that belongs here.

export default function Medal() {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="32" cy="32" r="27" stroke="currentColor" strokeWidth="1.2" opacity="0.55" />
      <circle cx="32" cy="32" r="20" stroke="currentColor" strokeWidth="1" opacity="0.35" />
      <path
        d="M32 17 L35.5 29 L47 32 L35.5 35 L32 47 L28.5 35 L17 32 L28.5 29 Z"
        fill="currentColor"
      />
    </svg>
  );
}
