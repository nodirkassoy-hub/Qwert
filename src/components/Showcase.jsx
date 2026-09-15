import React, { useRef, useState } from 'react';
import { ProductStage } from './ProductStage.jsx';
import { store } from '../lib/store.js';
import { useStickyProgress } from '../hooks.js';

const HOTSPOTS = [
  {
    k: 'Optics',
    t: 'Sapphire lens array',
    d: 'Six elements, focus locked in 0.1 s.',
    side: 'left',
    style: { left: '5%', top: '30%' },
    from: 0.03,
    to: 0.28,
  },
  {
    k: 'Structure',
    t: 'Milled titanium band',
    d: 'One billet, 0.4 µm tolerance, no seams.',
    side: 'right',
    style: { right: '5%', top: '21%' },
    from: 0.24,
    to: 0.48,
  },
  {
    k: 'Surface',
    t: 'Matte ceramic shell',
    d: 'Cool to the touch. Zero fingerprints.',
    side: 'left',
    style: { left: '5%', bottom: '24%' },
    from: 0.46,
    to: 0.7,
  },
  {
    k: 'Endurance',
    t: 'All-day cell, 35 W refill',
    d: '1,900 mAh — 400 scans, then charge in 40 min.',
    side: 'right',
    style: { right: '5%', bottom: '30%' },
    from: 0.66,
    to: 0.95,
  },
];

function Hotspot({ spot, inView }) {
  return (
    <div
      className={`hotspot hotspot--${spot.side}${inView ? ' is-in' : ''}`}
      style={{ ...spot.style, '--dx': spot.side === 'left' ? '-14px' : '14px' }}
    >
      <div className="hotspot__connector">
        <span className="hotspot__dot" aria-hidden="true" />
        <span className="hotspot__line" aria-hidden="true" />
      </div>
      <div className="hotspot__body">
        <div className="hotspot__k">{spot.k}</div>
        <div className="hotspot__t">{spot.t}</div>
        <div className="hotspot__d">{spot.d}</div>
      </div>
    </div>
  );
}

export function Showcase({ finishId }) {
  const wrapRef = useRef(null);
  const pinRef = useRef(null);
  const dialRef = useRef(null);
  const degRef = useRef(null);
  const visRef = useRef(HOTSPOTS.map(() => false));
  const [vis, setVis] = useState(visRef.current);

  useStickyProgress(wrapRef, (p) => {
    store.showP = p;
    if (dialRef.current) dialRef.current.style.setProperty('--w', `${(p * 100).toFixed(1)}%`);
    if (degRef.current) degRef.current.textContent = `${Math.round((p * 2.25 * 360) % 360)}`.padStart(3, '0');

    if (pinRef.current) {
      const out = Math.min(1, Math.max(0, (1 - p) / 0.09));
      pinRef.current.style.opacity = (0.32 + 0.68 * out).toFixed(3);
    }

    const next = HOTSPOTS.map((h) => p >= h.from && p <= h.to);
    if (next.some((v, i) => v !== visRef.current[i])) {
      visRef.current = next;
      setVis(next);
    }
  });

  return (
    <section className="showcase" id="showcase" ref={wrapRef} aria-label="POCKEY product showcase">
      <div className="showcase__pin" ref={pinRef}>
        <ProductStage mode="showcase" finishId={finishId} />

        <div className="showcase__floor" aria-hidden="true" />
        <div className="viewfinder" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <span className="viewfinder__scan" />
        </div>

        <div className="showcase__label">
          <div>
            <span className="eyebrow">02 — Showcase</span>
            <div className="showcase__title" style={{ marginTop: 12 }}>
              DESIGN, FROM <b>EVERY ANGLE</b>
            </div>
          </div>
          <span className="showcase__hint">
            <i aria-hidden="true" /> Scroll to rotate
          </span>
        </div>

        <div className="hotspots">
          {HOTSPOTS.map((spot, i) => (
            <Hotspot key={spot.t} spot={spot} inView={vis[i]} />
          ))}
        </div>

        <div className="showcase__dial">
          <span>
            <b ref={degRef}>000</b>°
          </span>
          <span className="dial-track" ref={dialRef} aria-hidden="true">
            <i />
          </span>
          <span>360° view</span>
        </div>
      </div>
    </section>
  );
}

export default Showcase;
