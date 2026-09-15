import React, { useRef } from 'react';
import { FINISHES } from '../lib/store.js';
import { useMagnetic } from '../hooks.js';
import { Arrow, Shield } from './Icons.jsx';

const ROWS = [
  ['In the box', 'POCKEY · USB-C · sleeve'],
  ['Storage', '128 GB local'],
  ['Battery', '1,900 mAh · 400 scans'],
  ['Warranty', '2 years'],
  ['Shipping', 'Free · 2 days'],
];

export function Price({ price, cents, priceNote, finishId, onFinish, onBuy }) {
  const buyRef = useMagnetic(0.16);
  const ids = Object.keys(FINISHES);
  const finish = FINISHES[finishId] || FINISHES[ids[0]];

  return (
    <section className="section price" id="buy">
      <div className="rule" aria-hidden="true" />
      <div className="shell">
        <div className="price__card" data-reveal="scale">
          <div className="price__glow" aria-hidden="true" />

          <div className="price__grid">
            <div>
              <span className="eyebrow">03 — Order</span>
              <h2 className="h2" data-reveal-lines>
                <span className="line-mask">
                  <span>GET YOUR</span>
                </span>
                <span className="line-mask">
                  <span className="grad-text">POCKEY</span>
                </span>
              </h2>

              <div className="price__amount" data-reveal="up">
                <span className="price__cur" aria-hidden="true">
                  $
                </span>
                <span className="price__num" aria-hidden="true">
                  {price.replace('$', '')}
                </span>
                <span className="price__cents" aria-hidden="true">
                  {cents}
                </span>
                <span className="sr-only">{`${price}${cents}`}</span>
              </div>

              <p className="price__tag" data-reveal="up" data-delay="0.05">
                <b>Simple. Practical. Made for you.</b>
                <br />
                {priceNote}
              </p>

              <div className="finish">
                <span className="finish__label">Finish</span>
                <div className="swatches" role="radiogroup" aria-label="Choose a finish">
                  {ids.map((id) => (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={id === finishId}
                      className={`swatch${id === finishId ? ' is-active' : ''}`}
                      style={{ '--sw': FINISHES[id].swatch }}
                      onClick={() => onFinish(id)}
                    >
                      <span className="sr-only">{FINISHES[id].name}</span>
                    </button>
                  ))}
                </div>
                <span className="finish__name">
                  {finish.name}
                  <em>{finish.note}</em>
                </span>
              </div>
            </div>

            <div>
              <ul className="price__list" data-reveal="up" data-delay="0.1">
                {ROWS.map(([k, v]) => (
                  <li key={k}>
                    <span>{k}</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>

              <div className="price__actions" data-reveal="up" data-delay="0.16">
                <button ref={buyRef} type="button" className="btn btn--primary btn--lg" onClick={onBuy}>
                  <span>Buy now</span>
                  <Arrow />
                </button>
                <span className="price__secure">
                  <Shield />
                  One-time price · no subscription
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Price;
