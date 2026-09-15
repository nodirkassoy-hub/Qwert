import React from 'react';
import { createRoot } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import App from '../src/App.jsx';

export async function run() {
  const dom = new JSDOM('<!doctype html><html><body><div id="boot"></div><div id="root"></div></body></html>', {
    pretendToBeVisual: true,
    url: 'http://localhost/',
  });
  const g = globalThis;
  g.window = dom.window;
  g.document = dom.window.document;
  try { Object.defineProperty(g, 'navigator', { value: dom.window.navigator, configurable: true }); } catch { /* node 22 keeps its own */ }
  g.Window = dom.window.Window;
  g.HTMLElement = dom.window.HTMLElement;
  g.Element = dom.window.Element;
  g.Node = dom.window.Node;
  g.getComputedStyle = dom.window.getComputedStyle;
  g.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 16);
  g.cancelAnimationFrame = (id) => clearTimeout(id);
  g.IntersectionObserver = class {
    constructor(cb) { this.cb = cb; }
    observe(el) { setTimeout(() => this.cb([{ isIntersecting: true, target: el, intersectionRatio: 1 }], this), 0); }
    unobserve() {}
    disconnect() {}
  };
  g.matchMedia = g.matchMedia || ((q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }));
  dom.window.matchMedia = g.matchMedia;
  dom.window.requestAnimationFrame = g.requestAnimationFrame;
  dom.window.cancelAnimationFrame = g.cancelAnimationFrame;
  dom.window.IntersectionObserver = g.IntersectionObserver;
  dom.window.addEventListener = dom.window.addEventListener.bind(dom.window);

  g.IS_REACT_ACT_ENVIRONMENT = true;
  const errors = [];
  const origError = console.error;
  console.error = (...a) => { errors.push(a.map(String).join(' ')); origError(...a); };

  const root = createRoot(document.getElementById('root'));
  await React.act(async () => {
    root.render(<App />);
  });
  await new Promise((r) => setTimeout(r, 80));

  const html = document.body.innerHTML;
  console.error = origError;
  root.unmount?.();

  return { html, errors, length: html.length };
}
