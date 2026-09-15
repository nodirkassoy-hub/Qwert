/**
 * Shared runtime store.
 * High-frequency values (scroll progress, pointer) live here so the WebGL loop can
 * read them every frame without pushing React re-renders down the tree.
 */
export const FINISHES = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Ceramic',
    note: 'Matte · fingerprint-free',
    swatch: 'linear-gradient(150deg,#2a2e37,#0b0d11 62%)',
    shell: '#151a24',
    shellRough: 0.5,
    shellMetal: 0.28,
    band: '#ccd1d9',
  },
  titanium: {
    id: 'titanium',
    name: 'Natural Titanium',
    note: 'Blasted · bead-milled',
    swatch: 'linear-gradient(150deg,#e4e7ec,#8f959f 62%)',
    shell: '#9aa0ab',
    shellRough: 0.42,
    shellMetal: 0.92,
    band: '#e6e9ee',
  },
  ember: {
    id: 'ember',
    name: 'Ember Edition',
    note: 'Anodised · 500 units',
    swatch: 'linear-gradient(150deg,#ffb168,#7a2c07 64%)',
    shell: '#3a1606',
    shellRough: 0.34,
    shellMetal: 0.55,
    band: '#ffca94',
  },
};

export const store = {
  heroP: 0, // hero scroll progress 0..1
  showP: 0, // showcase scroll progress 0..1
  pointer: { x: 0, y: 0 }, // normalised -1..1
  finish: 'obsidian',
  quality: 'high',
  reduced: false,
};

export function isLowPower() {
  if (typeof navigator === 'undefined') return true;
  const small = typeof matchMedia === 'function' && matchMedia('(max-width: 900px)').matches;
  const weakCpu = (navigator.hardwareConcurrency || 8) <= 4;
  const saveData = navigator.connection && navigator.connection.saveData;
  return small || weakCpu || !!saveData;
}

export function initStore() {
  store.quality = isLowPower() ? 'low' : 'high';
  store.reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  return store;
}

if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointermove',
    (e) => {
      store.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      store.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
    },
    { passive: true }
  );
}
