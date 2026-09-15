import * as THREE from 'three';

/**
 * Procedural geometry for the POCKEY device.
 * Pure `three` (no DOM, no React) so it can be unit-tested in node.
 *
 * Units: 1 = 1 cm. The device is a 8.9 × 5.7 × 1.05 cm pocket slab.
 */

export const DEVICE = {
  w: 8.9,
  h: 5.7,
  d: 1.05,
  r: 0.92,
  bevel: 0.075,
  lens: { x: -2.62, y: 0.06, r: 0.88 },
  display: { x: 1.52, y: 1.32, w: 3.34, h: 0.68 },
};

export function roundedRectShape(w, h, r) {
  const radius = Math.min(r, Math.min(w, h) / 2 - 0.001);
  const x = -w / 2;
  const y = -h / 2;
  const s = new THREE.Shape();
  s.moveTo(x + radius, y);
  s.lineTo(x + w - radius, y);
  s.absarc(x + w - radius, y + radius, radius, -Math.PI / 2, 0, false);
  s.lineTo(x + w, y + h - radius);
  s.absarc(x + w - radius, y + h - radius, radius, 0, Math.PI / 2, false);
  s.lineTo(x + radius, y + h);
  s.absarc(x + radius, y + h - radius, radius, Math.PI / 2, Math.PI, false);
  s.lineTo(x, y + radius);
  s.absarc(x + radius, y + radius, radius, Math.PI, Math.PI * 1.5, false);
  return s;
}

/**
 * A rounded, chamfered slab with `w × h × depth` as its TRUE outer dimensions.
 * ExtrudeGeometry adds bevel thickness on both faces, so we shrink the core extrusion.
 * Material groups: 0 = the two large faces (cap), 1 = side wall + chamfer (band).
 */
export function slabGeometry({ w = 4, h = 4, r = 0.6, depth = 1, bevel = 0.08, curveSegments = 14 } = {}) {
  const b = Math.min(bevel, depth / 4);
  const shape = roundedRectShape(w, h, r);
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: Math.max(0.001, depth - b * 2),
    bevelEnabled: b > 0.0001,
    bevelThickness: b,
    bevelSize: b,
    bevelOffset: 0,
    bevelSegments: b > 0.0001 ? 3 : 0,
    curveSegments,
  });
  geo.computeVertexNormals();
  geo.computeBoundingBox();
  // centre on z so the front face sits exactly at +depth / 2
  const box = geo.boundingBox;
  geo.translate(0, 0, -(box.max.z + box.min.z) / 2);
  geo.computeBoundingBox();
  return geo;
}

/** Inset face plate used for the glass front / ceramic back. */
export function plateGeometry({ w, h, r, depth = 0.06, bevel = 0.02, curveSegments = 12 } = {}) {
  return slabGeometry({ w, h, r, depth, bevel, curveSegments });
}

/** Concentric aperture / iris pattern drawn as a lathe-free ring stack. */
export function ringStack(count = 3, base = 0.5, gap = 0.07, tube = 0.016) {
  const rings = [];
  for (let i = 0; i < count; i++) {
    rings.push({ radius: base + i * gap, tube, key: `ring-${i}` });
  }
  return rings;
}

/** Grid of micro-vents (instanced positions on a plane). */
export function ventPositions(cols = 10, rows = 2, step = 0.16) {
  const out = [];
  for (let c = 0; c < cols; c++) {
    for (let r2 = 0; r2 < rows; r2++) {
      out.push(new THREE.Vector3((c - (cols - 1) / 2) * step, (r2 - (rows - 1) / 2) * step, 0));
    }
  }
  return out;
}
