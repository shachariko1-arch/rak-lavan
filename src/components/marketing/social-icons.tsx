export function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.4z" strokeLinejoin="round" />
      <path d="M9 8.6c0 3.3 2.9 6.3 6.3 6.4l1.1-1.4-1.8-.9-.8.9c-1.2-.4-2.6-1.7-3-2.9l.9-.8-.8-1.8-1.5 1z" fill="currentColor" stroke="none" />
    </svg>
  );
}
