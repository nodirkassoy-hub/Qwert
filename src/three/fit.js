/**
 * Keeps the product perfectly framed on every screen:
 * solves for the camera distance that fits a target bounding size.
 */
export function fitDistance(camera, size, { width = 10, height = 8, fill = 0.8 } = {}) {
  const vfov = ((camera.fov || 32) * Math.PI) / 180 / 2;
  const vt = Math.tan(vfov);
  const aspect = size.width / Math.max(1, size.height);
  const ht = vt * aspect;
  const dW = width / (fill * 2 * ht);
  const dH = height / (fill * 2 * vt);
  const d = Math.max(dW, dH);
  return Math.max(5, Math.min(60, d));
}

export const damp = (a, b, lambda, dt) => a + (b - a) * (1 - Math.exp(-lambda * dt));
