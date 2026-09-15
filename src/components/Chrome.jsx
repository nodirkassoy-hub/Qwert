import React from 'react';
import { scrollToSection } from '../lib/motion.js';
import { useActiveSection } from '../hooks.js';
import { Arrow, Wordmark } from './Icons.jsx';

const LINKS = [
  { id: 'product', label: 'Product' },
  { id: 'showcase', label: 'Showcase' },
  { id: 'buy', label: 'Price' },
];

export function Nav({ price, onBuy }) {
  const active = useActiveSection(['hero', 'product', 'showcase', 'buy']);

  return (
    <header className="nav">
      <div className="nav__inner">
        <a
          href="#hero"
          className="logo"
          onClick={(e) => {
            e.preventDefault();
            scrollToSection('#hero');
          }}
        >
          <Wordmark />
        </a>

        <nav className="nav__links" aria-label="Sections">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              className={`nav__link${active === l.id ? ' is-active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                scrollToSection(`#${l.id}`);
              }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav__cta">
          <span className="nav__price">{price}</span>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onBuy}>
            <span>Buy now</span>
            <Arrow className="btn__arrow" />
          </button>
        </div>
      </div>
    </header>
  );
}

export function Ticker({ items }) {
  const row = (
    <div className="ticker__row" style={{ display: 'flex' }}>
      {items.map((t, i) => (
        <span className="ticker__item" key={`${t}-${i}`}>
          {t}
          <em>·</em>
        </span>
      ))}
    </div>
  );
  return (
    <div className="ticker" aria-hidden="true">
      <div className="ticker__track">
        {row}
        {row}
      </div>
    </div>
  );
}

export function Footer({ price }) {
  return (
    <footer className="footer">
      <div className="shell footer__inner">
        <Wordmark />
        <p>POCKEY 01 · Simple. Smart. Beautiful.</p>
        <p>{price} · © 2026 Pockey Industries</p>
      </div>
    </footer>
  );
}
