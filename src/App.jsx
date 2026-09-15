import React, { useCallback, useEffect, useState } from 'react';
import { Atmos, ScrollProgress } from './components/Atmos.jsx';
import { Footer, Nav, Ticker } from './components/Chrome.jsx';
import { Hero } from './components/Hero.jsx';
import { Purpose } from './components/Purpose.jsx';
import { Showcase } from './components/Showcase.jsx';
import { Price } from './components/Price.jsx';
import { BuyModal } from './components/BuyModal.jsx';
import { initStore, store } from './lib/store.js';
import { initChrome, initSmoothScroll, playHeroIntro, setupReveals } from './lib/motion.js';

initStore();

const PRICE = '$189';
const CENTS = '.00';
const PRICE_NOTE = 'or $16.00 / mo for 12 months';
const BLURB =
  'A pocket-sized smart scanner that turns paper, screens and objects into clean, searchable files. One button, about two seconds, no cable in sight.';
const SPECS = ['Free 2-day shipping', '2-year warranty', '30-day returns'];
const TICKER = [
  'Pocket smart scanner',
  '84 g',
  '2s object to file',
  '300 dpi',
  'Offline OCR',
  '128 GB local',
  'Milled titanium band',
  'Matte ceramic shell',
  'USB-C 35 W',
  'One-time price',
];

export default function App() {
  const [finishId, setFinishId] = useState(store.finish);
  const [buyOpen, setBuyOpen] = useState(false);

  const setFinish = useCallback((id) => {
    store.finish = id;
    setFinishId(id);
  }, []);

  const openBuy = useCallback(() => setBuyOpen(true), []);
  const closeBuy = useCallback(() => setBuyOpen(false), []);

  useEffect(() => {
    // motion is an enhancement — never let it take the page down with it
    const safe = (fn) => {
      try {
        return fn();
      } catch (err) {
        if (typeof console !== 'undefined') console.warn('[pockey] motion layer:', err?.message);
        return null;
      }
    };
    safe(initSmoothScroll);
    const ctx = safe(setupReveals);
    const offChrome = safe(initChrome) || (() => {});

    let lifted = false;
    const lift = () => {
      if (lifted) return;
      lifted = true;
      const boot = document.getElementById('boot');
      if (boot) {
        boot.classList.add('is-done');
        setTimeout(() => boot.remove(), 1100);
      }
      safe(playHeroIntro);
      requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    };

    const fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    const t0 = performance.now();
    Promise.race([fonts, new Promise((r) => setTimeout(r, 1500))]).then(() => {
      const wait = Math.max(180, 640 - (performance.now() - t0));
      setTimeout(lift, wait);
    });
    const hard = setTimeout(lift, 3000);

    return () => {
      clearTimeout(hard);
      offChrome();
      if (ctx && typeof ctx.revert === 'function') ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <ScrollProgress />
      <Atmos />

      <div className="page">
        <Nav price={`${PRICE}${CENTS}`} onBuy={openBuy} />

        <main>
          <Hero
            price={PRICE}
            cents={CENTS}
            priceNote={PRICE_NOTE}
            blurb={BLURB}
            specs={SPECS}
            finishId={finishId}
            onBuy={openBuy}
          />

          <Ticker items={TICKER} />

          <Purpose />

          <Showcase finishId={finishId} />

          <Price
            price={PRICE}
            cents={CENTS}
            priceNote={PRICE_NOTE}
            finishId={finishId}
            onFinish={setFinish}
            onBuy={openBuy}
          />
        </main>

        <Footer price={`${PRICE}${CENTS}`} />
      </div>

      <BuyModal open={buyOpen} onClose={closeBuy} price={PRICE} cents={CENTS} finishId={finishId} />
    </>
  );
}
