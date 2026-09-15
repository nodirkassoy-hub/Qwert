import React, { useRef } from 'react';
import { ProductStage } from './ProductStage.jsx';
import { Arrow } from './Icons.jsx';
import { useMagnetic, useViewProgress } from '../hooks.js';
import { store } from '../lib/store.js';
import { scrollToSection } from '../lib/motion.js';

export function Hero({ price, cents, priceNote, blurb, specs, finishId, onBuy }) {
  const heroRef = useRef(null);
  const buyRef = useMagnetic(0.22);

  useViewProgress(heroRef, (p) => {
    store.heroP = p;
  });

  return (
    <section className="hero" id="hero" ref={heroRef}>
      <div className="hero__grid">
        <div className="hero__copy">
          <span className="eyebrow hero__eyebrow">POCKEY 01 · Pocket smart scanner</span>

          <h1 className="hero__title" data-hero data-reveal-lines>
            <span className="line-mask">
              <span>
                <i className="dash" aria-hidden="true" />
                POCKEY&nbsp;—
              </span>
            </span>
            <span className="line-mask">
              <span className="l2">
                SIMPLE<span className="dot">.</span>
              </span>
            </span>
            <span className="line-mask">
              <span className="l2">
                SMART<span className="dot">.</span>
              </span>
            </span>
            <span className="line-mask">
              <span className="l2">
                BEAUTIFUL<span className="dot">.</span>
              </span>
            </span>
          </h1>

          <p className="hero__sub">{blurb}</p>

          <div className="hero__actions">
            <button ref={buyRef} type="button" className="btn btn--primary btn--lg" onClick={onBuy}>
              <span>Buy now</span>
              <Arrow />
            </button>

            <div className="price-tag">
              <span className="price-tag__label">Price</span>
              <span className="price-tag__value" aria-hidden="true">
                {price}
                <span style={{ opacity: 0.55, fontSize: '0.55em' }}>{cents}</span>
              </span>
              <span className="sr-only">{`${price}${cents}`}</span>
              <span className="price-tag__note">{priceNote}</span>
            </div>
          </div>

          <ul className="hero__meta">
            {specs.map((s) => (
              <li key={s}>
                <i aria-hidden="true" />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div className="hero__stage">
          <div className="stage-glow" aria-hidden="true" />
          <div className="stage-halo" aria-hidden="true" />
          <div className="stage-frame" aria-hidden="true" />
          <ProductStage mode="hero" finishId={finishId} />
          <span className="stage-badge stage-badge--tl">
            <b>2.0s</b> object to file
          </span>
          <span className="stage-badge stage-badge--br">
            84 g · <b>11 mm</b>
          </span>
        </div>
      </div>

      <button
        type="button"
        className="scroll-cue"
        onClick={() => scrollToSection('#product')}
        aria-label="Scroll to what POCKEY is for"
      >
        <span>Scroll</span>
        <span className="scroll-cue__track" aria-hidden="true" />
      </button>
    </section>
  );
}

export default Hero;
