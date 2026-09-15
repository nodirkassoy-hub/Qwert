/**
 * Procedural canvas textures — no network requests, crisp at any dpr.
 * Everything is guarded for SSR/node so the 3D layer can be tested headlessly.
 */
import * as THREE from 'three';

const hasDOM = typeof document !== 'undefined';

function surface(w, h) {
  if (!hasDOM) return null;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  return { canvas, ctx, w, h };
}

function finish({ canvas }, opts = {}) {
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = opts.srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** The always-on strip display: wordmark, status, scan meter. */
export function makeDisplayTexture() {
  const s = surface(1024, 220);
  if (!s) return null;
  const { ctx, w, h } = s;
  ctx.fillStyle = '#04060b';
  ctx.fillRect(0, 0, w, h);

  // subtle screen glow
  const grad = ctx.createLinearGradient(0, 0, w, h);
  grad.addColorStop(0, 'rgba(255,150,70,0.10)');
  grad.addColorStop(0.5, 'rgba(255,255,255,0.02)');
  grad.addColorStop(1, 'rgba(90,170,255,0.10)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  ctx.font = '600 74px "Sora Variable", system-ui, sans-serif';
  ctx.fillStyle = '#ffe7cd';
  ctx.textBaseline = 'middle';
  ctx.letterSpacing = '14px';
  ctx.fillText('POCKEY', 46, h / 2 - 4);

  ctx.font = '500 34px "JetBrains Mono Variable", monospace';
  ctx.letterSpacing = '8px';
  ctx.fillStyle = 'rgba(255,177,104,0.92)';
  ctx.fillText('READY', w - 46 - 210, h / 2 - 6);

  // scan meter
  ctx.letterSpacing = '0px';
  const bx = 46;
  const by = h - 42;
  const bw = w - 92;
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(bx, by, bw, 3);
  ctx.fillStyle = '#ffb168';
  ctx.fillRect(bx, by, bw * 0.66, 3);
  for (let i = 0; i < 26; i++) {
    ctx.fillStyle = i < 17 ? 'rgba(255,231,205,0.85)' : 'rgba(255,255,255,0.16)';
    ctx.fillRect(bx + (bw / 26) * i, by - 12, 2, 9);
  }

  // scanlines
  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ffffff';
  for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 1);
  ctx.globalAlpha = 1;

  return finish(s, { srgb: true });
}

/** Engraved back-panel wordmark (used as an alphaMap on a polished decal). */
export function makeWordmarkTexture() {
  const s = surface(1024, 512);
  if (!s) return null;
  const { ctx, w, h } = s;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  ctx.font = '650 128px "Sora Variable", system-ui, sans-serif';
  ctx.letterSpacing = '34px';
  ctx.fillText('POCKEY', w / 2, h / 2 - 34);

  ctx.font = '500 34px "JetBrains Mono Variable", monospace';
  ctx.letterSpacing = '12px';
  ctx.fillStyle = 'rgba(255,255,255,0.75)';
  ctx.fillText('01 · POCKET SMART SCANNER', w / 2, h / 2 + 76);

  ctx.fillStyle = 'rgba(255,255,255,0.5)';
  roundRect(ctx, w / 2 - 90, h / 2 + 128, 180, 4, 2);
  ctx.fill();

  return finish(s);
}

/** Fine anisotropic streaks for the milled band (roughness map). */
export function makeBrushedTexture() {
  const s = surface(512, 512);
  if (!s) return null;
  const { ctx, w, h } = s;
  ctx.fillStyle = '#8a8a8a';
  ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < 2600; i++) {
    const y = Math.random() * h;
    const len = 30 + Math.random() * 240;
    const x = Math.random() * w;
    const v = Math.random();
    ctx.strokeStyle = `rgba(${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},${v > 0.5 ? 255 : 0},0.055)`;
    ctx.lineWidth = v > 0.85 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  return finish(s);
}

/** Micro-speckle for the ceramic shell (bump map). */
export function makeSpeckleTexture(repeat = 3) {
  const s = surface(512, 512);
  if (!s) return null;
  const { ctx, w, h } = s;
  const img = ctx.createImageData(w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 118 + Math.random() * 40 + (Math.random() > 0.986 ? 60 : 0);
    img.data[i] = n;
    img.data[i + 1] = n;
    img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  const tex = finish(s);
  tex.repeat.set(repeat, repeat);
  return tex;
}

/** Aperture / iris graphic sitting behind the lens glass. */
export function makeIrisTexture() {
  const s = surface(512, 512);
  if (!s) return null;
  const { ctx, w, h } = s;
  const cx = w / 2;
  const cy = h / 2;

  ctx.fillStyle = '#05070c';
  ctx.fillRect(0, 0, w, h);

  const grad = ctx.createRadialGradient(cx, cy, 4, cx, cy, w * 0.48);
  grad.addColorStop(0, 'rgba(255,255,255,0.05)');
  grad.addColorStop(0.45, 'rgba(30,42,64,0.9)');
  grad.addColorStop(0.78, 'rgba(8,11,18,1)');
  grad.addColorStop(1, 'rgba(0,0,0,1)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.48, 0, Math.PI * 2);
  ctx.fill();

  // iris blades
  const blades = 9;
  for (let i = 0; i < blades; i++) {
    const a0 = (i / blades) * Math.PI * 2;
    const a1 = a0 + Math.PI * 2 / blades;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a0) * w * 0.44, cy + Math.sin(a0) * w * 0.44);
    ctx.lineTo(cx + Math.cos(a0 + 0.26) * w * 0.16, cy + Math.sin(a0 + 0.26) * w * 0.16);
    ctx.lineTo(cx + Math.cos(a1 + 0.1) * w * 0.44, cy + Math.sin(a1 + 0.1) * w * 0.44);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? 'rgba(255,255,255,0.045)' : 'rgba(255,255,255,0.015)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.55)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // inner reflections
  ctx.strokeStyle = 'rgba(160,215,255,0.5)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.15, Math.PI * 0.9, Math.PI * 1.55);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(255,177,104,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, w * 0.2, Math.PI * 0.05, Math.PI * 0.5);
  ctx.stroke();

  return finish(s, { srgb: true });
}

/** Dot grid used as an alphaMap for the mic / exhaust vents. */
export function makeVentTexture(cols = 12, rows = 3) {
  const s = surface(512, 148);
  if (!s) return null;
  const { ctx, w, h } = s;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, w, h);
  const padX = 14;
  const padY = 14;
  const dx = (w - padX * 2) / (cols - 1);
  const dy = (h - padY * 2) / Math.max(1, rows - 1);
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows; r++) {
      ctx.beginPath();
      ctx.arc(padX + c * dx, rows === 1 ? h / 2 : padY + r * dy, Math.min(dx, dy) * 0.28, 0, Math.PI * 2);
      ctx.fillStyle = '#fff';
      ctx.fill();
    }
  }
  return finish(s);
}

/** Radial falloff used to feather the studio floor so it has no hard edge. */
export function makeFadeTexture(inner = 0.18, mid = 0.55) {
  const s = surface(256, 256);
  if (!s) return null;
  const { ctx, w, h } = s;
  const g = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
  g.addColorStop(0, '#ffffff');
  g.addColorStop(inner, '#ffffff');
  g.addColorStop(mid, 'rgba(255,255,255,0.55)');
  g.addColorStop(0.86, 'rgba(255,255,255,0.08)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
  const tex = finish(s);
  tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
  return tex;
}

