import Lenis from 'lenis';
import { store } from './store.js';

let lenis = null;

/** Momentum scrolling. Skipped for reduced-motion users and non-browser envs. */
export function initSmoothScroll() {
  if (lenis || store.reduced || typeof window === 'undefined') return lenis;

  lenis = new Lenis({
    duration: 1.15,
    lerp: 0.095,
    wheelMultiplier: 1,
    touchMultiplier: 1.7,
    smoothWheel: true,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  const raf = (time) => {
    lenis.raf(time);
    requestAnimationFrame(raf);
  };
  requestAnimationFrame(raf);
  return lenis;
}

export function scrollToSection(target) {
  if (typeof window === 'undefined') return;
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -30, duration: 1.25 });
  else el.scrollIntoView({ behavior: store.reduced ? 'auto' : 'smooth', block: 'start' });
}

export function lockScroll(locked) {
  document.body.classList.toggle('is-locked', !!locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/**
 * Scroll-triggered entrances.
 *
 * The hidden states are armed by the `js-reveal` class and released by an
 * `.is-lit` class, so the actual motion is a compositor-driven CSS transition:
 * it survives a backgrounded tab, a crawler, or any frame budget. A safety net
 * forces everything visible shortly after load so nothing can ever stay hidden.
 */
export function setupReveals(root = document) {
  if (typeof document === 'undefined' || store.reduced) return () => {};
  document.documentElement.classList.add('js-reveal');

  const items = [...root.querySelectorAll('[data-reveal], [data-reveal-lines]')];
  items.forEach((el) => {
    const d = parseFloat(el.dataset.delay || '0');
    if (d) el.style.setProperty('--d', String(d));
  });

  /**
   * Light an element, then hand it back to CSS: once the transition has run we drop
   * the reveal attributes so hover/active transforms on the same element work again.
   */
  const light = (el) => {
    el.classList.add('is-lit');
    let cleaned = false;
    const done = () => {
      if (cleaned) return;
      cleaned = true;
      el.removeAttribute('data-reveal');
      el.removeAttribute('data-reveal-lines');
      el.classList.remove('is-lit');
      el.removeEventListener('transitionend', done);
    };
    el.addEventListener('transitionend', done);
    setTimeout(done, 2400);
  };

  let lit = 0;
  let io = null;
  if (typeof IntersectionObserver !== 'undefined') {
    io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            light(entry.target);
            lit += 1;
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }
    );
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach(light);
  }

  // Safety net: if the observer never delivered anything (throttled frames,
  // headless capture, exotic embedders) reveal the page instead of leaving it blank.
  const force = () => document.documentElement.classList.add('reveal-force');
  const guard = setTimeout(() => {
    if (lit === 0) force();
  }, 1400);

  return () => {
    clearTimeout(guard);
    if (io) io.disconnect();
  };
}

/** Sticky nav shrink/hide + top progress rail. */
export function initChrome() {
  const nav = document.querySelector('.nav');
  const bar = document.querySelector('.progress__bar');
  let raf = 0;
  let last = 0;

  const update = () => {
    raf = 0;
    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (bar) bar.style.setProperty('--p', (y / max).toFixed(4));
    if (nav) {
      nav.classList.toggle('is-stuck', y > 24);
      nav.classList.toggle('is-hidden', y > 360 && y > last + 2);
    }
    last = y;
  };

  const onScroll = () => {
    if (!raf) raf = requestAnimationFrame(update);
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
  return () => {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
    if (raf) cancelAnimationFrame(raf);
  };
}
