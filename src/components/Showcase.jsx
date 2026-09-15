import React, { useRef, useState } from 'react';
import { ProductStage } from './ProductStage.jsx';
import { store } from '../lib/store.js';
import { useStickyProgress } from '../hooks.js';

const HOTSPOTS = [
  {
    k: 'Optics',
    t: 'Sapphire lens array',
    d: 'Six elements, focus locked in 0.1 s.',
    from: 0.03,
    to: 0.28,
  },
  {
    k: 'Structure',
    t: 'Milled titanium band',
    d: 'One billet, 0.4 µm tolerance, no seams.',
    from: 0.24,
    to: 0.48,
  },
  {
    k: 'Surface',
    t: 'Matte ceramic shell',
    d: 'Cool to the touch. Zero fingerprints.',
    from: 0.46,
    to: 0.7,
  },
  {
    k: 'Endurance',
    t: 'All-day cell, 35 W refill',
    d: '1,900 mAh — 400 scans, then charge in 40 min.',
    from: 0.66,
    to: 0.95,
  },
];

/**
 * One annotation at a time: the card swaps as the spin crosses each band, so the
 * stage never gets crowded and nothing collides with the product on small screens.
 */
function activeIndex(p) {
  let best = 0;
  let score = -Infinity;
  for (let i = 0; i < HOTSPOTS.length; i += 1) {
    const h = HOTSPOTS[i];
    const mid = (h.from + h.to) / 2;
    const half = (h.to - h.from) / 2;
    const inside = p >= h.from && p <= h.to;
    const s = inside ? 1 - Math.abs(p - mid) / half : -Math.abs(p - mid);
    if (s > score) {
      score = s;
      best = i;
    }
  }
  return best;
}

export function Showcase({ finishId }) {
  const wrapRef = useRef(null);
  const pinRef = useRef(null);
  const dialRef = useRef(null);
  const degRef = useRef(null);
  const idxRef = useRef(-1);
  const [idx, setIdx] = useState(0);

  useStickyProgress(wrapRef, (p) => {
    store.showP = p;
    if (dialRef.current) dialRef.current.style.setProperty('--w', `${(p * 100).toFixed(1)}%`);
    if (degRef.current) degRef.current.textContent = `${Math.round((p * 2.25 * 360) % 360)}`.padStart(3, '0');

    // only the chrome dims on exit — the product stays lit until the section hands over
    if (pinRef.current) {
      const out = Math.min(1, Math.max(0, (1 - p) / 0.07));
      pinRef.current.style.opacity = (0.55 + 0.45 * out).toFixed(3);
    }

    const next = activeIndex(p);
    if (next !== idxRef.current) {
      idxRef.current = next;
      setIdx(next);
    }
  });

  const spot = HOTSPOTS[Math.max(0, idx)];

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
          {/* the copy swaps with the spin, so it stays out of the live region */}
          <div className="hotspot is-in">
            <div className="hotspot__connector" aria-hidden="true">
              <span className="hotspot__dot" />
              <span className="hotspot__line" />
            </div>
            <div className="hotspot__body" key={spot.k}>
              <div className="hotspot__k">
                {spot.k}
                <i>
                  0{idx + 1} / 0{HOTSPOTS.length}
                </i>
              </div>
              <div className="hotspot__t">{spot.t}</div>
              <div className="hotspot__d">{spot.d}</div>
            </div>
          </div>
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
