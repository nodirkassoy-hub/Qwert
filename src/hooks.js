import { useEffect, useRef, useState } from 'react';
import { store } from './lib/store.js';

/** Pointer-reactive spotlight + 3D tilt for glass cards. */
export function useCardGlow(ref) {
  const inner = useRef(null);
  useEffect(() => {
    const el = ref?.current;
    if (!el || store.reduced || !matchMedia('(hover: hover)').matches) return;

    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
      el.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
      const stack = el.querySelector('.icon3d__stack');
      if (stack) {
        stack.style.setProperty('--ry', `${(-26 + x * 34).toFixed(1)}deg`);
        stack.style.setProperty('--rx', `${(18 - y * 26).toFixed(1)}deg`);
      }
    };
    const onLeave = () => {
      const stack = el.querySelector('.icon3d__stack');
      if (stack) {
        stack.style.setProperty('--ry', '-22deg');
        stack.style.setProperty('--rx', '14deg');
      }
    };
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    return () => {
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
    };
  }, [ref]);
  return inner;
}

/**
 * Magnetic hover for premium buttons — owns the transform entirely (lift + press)
 * so it never fights the CSS hover rules.
 */
export function useMagnetic(strength = 0.28) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || store.reduced || !matchMedia('(hover: hover)').matches) return;
    let raf = 0;
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    let hover = 0;
    let press = 0;
    let hs = 0;
    let ps = 0;

    const loop = () => {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      hs += (hover - hs) * 0.18;
      ps += (press - ps) * 0.25;
      const lift = -3 * hs;
      const scale = 1 - 0.02 * ps;
      el.style.transform = `translate3d(${cx.toFixed(2)}px, ${(cy + lift).toFixed(2)}px, 0) scale(${scale.toFixed(3)})`;
      raf = requestAnimationFrame(loop);
    };
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) * strength;
      ty = (e.clientY - (r.top + r.height / 2)) * strength * 0.6;
    };
    const onEnter = () => { hover = 1; };
    const onLeave = () => { hover = 0; press = 0; tx = 0; ty = 0; };
    const onDown = () => { press = 1; };
    const onUp = () => { press = 0; };

    el.addEventListener('pointerenter', onEnter);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerleave', onLeave);
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointerup', onUp);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener('pointerenter', onEnter);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerleave', onLeave);
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointerup', onUp);
      el.style.transform = '';
    };
  }, [strength]);
  return ref;
}

export function useActiveSection(ids = []) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { threshold: [0.18, 0.5, 0.75] }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ids.join('|')]);
  return active;
}

/** rAF-throttled scroll subscription. */
function onScrollFrame(fn) {
  let raf = 0;
  const run = () => {
    raf = 0;
    fn();
  };
  const request = () => {
    if (!raf) raf = requestAnimationFrame(run);
  };
  request();
  window.addEventListener('scroll', request, { passive: true });
  window.addEventListener('resize', request);
  return () => {
    window.removeEventListener('scroll', request);
    window.removeEventListener('resize', request);
    if (raf) cancelAnimationFrame(raf);
  };
}

/** 0..1 — how far the page has scrolled past an element's top edge. */
export function useViewProgress(targetRef, onProgress) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const node = targetRef?.current;
    if (!node) return;
    return onScrollFrame(() => {
      const r = node.getBoundingClientRect();
      const h = Math.max(1, r.height || 1);
      cb.current?.(Math.min(1, Math.max(0, -r.top / h)));
    });
  }, [targetRef]);
}

/** 0..1 — progress while a tall wrapper keeps a sticky child pinned. */
export function useStickyProgress(targetRef, onProgress) {
  const cb = useRef(onProgress);
  cb.current = onProgress;
  useEffect(() => {
    const node = targetRef?.current;
    if (!node) return;
    return onScrollFrame(() => {
      const r = node.getBoundingClientRect();
      const vh = window.innerHeight || 1;
      const span = Math.max(1, r.height - vh);
      cb.current?.(Math.min(1, Math.max(0, -r.top / span)));
    });
  }, [targetRef]);
}


