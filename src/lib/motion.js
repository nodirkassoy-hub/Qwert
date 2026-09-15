import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { store } from './store.js';

gsap.registerPlugin(ScrollTrigger);

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

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

export function scrollToSection(target) {
  if (typeof window === 'undefined') return;
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  if (lenis) {
    lenis.scrollTo(el, { offset: -30, duration: 1.25 });
  } else {
    el.scrollIntoView({ behavior: store.reduced ? 'auto' : 'smooth', block: 'start' });
  }
}

export function lockScroll(locked) {
  document.body.classList.toggle('is-locked', !!locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

/**
 * Scroll-triggered entrance choreography.
 *
 * Hidden states are armed by the `js-reveal` class only, so if GSAP ever fails to
 * boot the page is still fully readable. On completion each element sheds its
 * reveal attribute and inline transform so CSS hover states stay in charge.
 */
export function setupReveals() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.add('js-reveal');
  if (store.reduced) return;

  const ctx = gsap.context(() => {
    // masked headline lines
    gsap.utils.toArray('[data-reveal-lines]:not([data-hero])').forEach((wrap) => {
      const lines = gsap.utils.toArray('.line-mask > span', wrap);
      if (!lines.length) return;
      gsap.fromTo(
        lines,
        { yPercent: 118 },
        {
          yPercent: 0,
          duration: 1.2,
          ease: 'power4.out',
          stagger: 0.1,
          scrollTrigger: { trigger: wrap, start: 'top 88%', once: true },
        }
      );
    });

    // generic reveals
    gsap.utils.toArray('[data-reveal]').forEach((el) => {
      const kind = el.dataset.reveal || 'up';
      const delay = parseFloat(el.dataset.delay || '0') || 0;
      const from = { opacity: 0 };
      if (kind === 'up') from.y = 32;
      if (kind === 'down') from.y = -18;
      if (kind === 'scale') from.scale = 0.94;
      if (kind === 'mask') from.clipPath = 'inset(0 0 100% 0)';

      const to = {
        opacity: 1,
        y: 0,
        scale: 1,
        clipPath: 'inset(0 0 0% 0)',
        duration: 1.05,
        ease: 'power3.out',
        delay,
        onComplete: () => {
          el.removeAttribute('data-reveal');
          gsap.set(el, { clearProps: 'all' });
        },
      };

      gsap.fromTo(el, from, {
        ...to,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  });

  requestAnimationFrame(() => ScrollTrigger.refresh());
  return ctx;
}

/** Hero entrance, fired when the intro curtain lifts. */
export function playHeroIntro() {
  if (typeof document === 'undefined' || store.reduced) return;
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.from('.hero__eyebrow', { y: 14, opacity: 0, duration: 0.8 }, 0)
    .fromTo(
      '.hero__title .line-mask > span',
      { yPercent: 118 },
      { yPercent: 0, duration: 1.3, stagger: 0.12 },
      0.05
    )
    .from('.hero__sub', { y: 22, opacity: 0, duration: 1 }, 0.42)
    .from('.hero__actions', { y: 22, opacity: 0, duration: 1 }, 0.54)
    .from('.hero__meta li', { y: 12, opacity: 0, duration: 0.7, stagger: 0.07 }, 0.64)
    .from('.hero__stage', { opacity: 0, scale: 0.92, duration: 1.7 }, 0.1)
    .from('.stage-badge', { opacity: 0, y: 10, duration: 0.8, stagger: 0.12 }, 0.95)
    .from('.scroll-cue', { opacity: 0, duration: 0.9 }, 1.15)
    .from('.nav__inner', { yPercent: -150, opacity: 0, duration: 1 }, 0.2);
  return tl;
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

export { gsap, ScrollTrigger };
