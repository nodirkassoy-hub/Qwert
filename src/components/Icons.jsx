import React from 'react';

export function Arrow({ className = 'btn__arrow' }) {
  return (
    <svg className={className} viewBox="0 0 22 12" fill="none" aria-hidden="true">
      <path d="M1 6h18M13.5 1 20 6l-6.5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Press() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M16 3.2v9.6" />
      <path d="M24.6 7.4a11 11 0 1 1-17.2 0" />
      <circle cx="16" cy="21.5" r="2.1" strokeDasharray="0.1 4.2" strokeWidth="4" />
    </svg>
  );
}

export function Smart() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M4 11V6.5A2.5 2.5 0 0 1 6.5 4H11M21 4h4.5A2.5 2.5 0 0 1 28 6.5V11M28 21v4.5a2.5 2.5 0 0 1-2.5 2.5H21M11 28H6.5A2.5 2.5 0 0 1 4 25.5V21" />
      <path d="M9.5 16h13" />
      <path d="M19.5 10.5 21 13l2.5 1.5L21 16l-1.5 2.5L18 16l-1.5-1.5L18 13z" strokeWidth="1.05" />
    </svg>
  );
}

export function Pocket() {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true">
      <path d="M7 8.5A4.5 4.5 0 0 1 11.5 4h9A4.5 4.5 0 0 1 25 8.5v11.7c0 4.3-3.4 7.8-7.7 7.8h-2.6A7.7 7.7 0 0 1 7 20.2z" />
      <path d="M11.5 4v6.2c0 2.7 2.1 4.8 4.8 4.8h6.7" />
    </svg>
  );
}

export function Shield() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.6 4.8 5.6v6.1c0 4.6 3 8.1 7.2 9.7 4.2-1.6 7.2-5.1 7.2-9.7V5.6z" />
      <path d="m9 12 2.2 2.2L15.4 10" />
    </svg>
  );
}

export function Close() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function Check() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m5 12.5 4.4 4.4L19 7" />
    </svg>
  );
}

export function Wordmark() {
  return (
    <span className="logo" aria-label="POCKEY home">
      <span className="logo__mark">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <rect x="2" y="6.5" width="20" height="11" rx="3.6" stroke="#ffb168" strokeWidth="1.5" />
          <circle cx="8" cy="12" r="2.6" fill="#ff7a2f" />
          <rect x="13" y="10.7" width="6" height="2.6" rx="1.3" fill="#f6f7f9" opacity="0.9" />
        </svg>
      </span>
      <span className="logo__word">POCKEY</span>
    </span>
  );
}
