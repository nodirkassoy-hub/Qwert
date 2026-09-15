import React from 'react';
import { ProductCanvas } from './ProductCanvas.jsx';
import { HeroScene, ShowcaseScene } from './Scenes.jsx';

const CAMERAS = {
  hero: { position: [0, 0.8, 16], fov: 32, near: 0.1, far: 120 },
  showcase: { position: [0, 2.2, 17], fov: 30, near: 0.1, far: 140 },
};

/**
 * Async boundary for the whole WebGL layer (three + drei live in this chunk),
 * so the page paints with the CSS studio render and upgrades in place.
 */
export default function Stage3D({ mode = 'hero', finishId }) {
  return (
    <ProductCanvas
      className={`stage--${mode}`}
      camera={CAMERAS[mode] || CAMERAS.hero}
      exposure={mode === 'showcase' ? 1.1 : 1.06}
      posterScale={mode === 'hero' ? 0.82 : 0.95}
    >
      {mode === 'showcase' ? <ShowcaseScene finishId={finishId} /> : <HeroScene finishId={finishId} />}
    </ProductCanvas>
  );
}
