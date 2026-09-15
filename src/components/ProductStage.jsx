import React, { Suspense, lazy } from 'react';
import { ProductPoster } from '../components/Poster.jsx';

const Stage3D = lazy(() => import('../three/Stage3D.jsx'));

/**
 * Renders the CSS studio render immediately, then hydrates the real 3D scene
 * in a background chunk. If WebGL never arrives, the poster simply stays.
 */
export function ProductStage({ mode = 'hero', finishId }) {
  return (
    <Suspense
      fallback={
        <div className="stage">
          <ProductPoster scale={mode === 'hero' ? 0.82 : 0.95} />
        </div>
      }
    >
      <Stage3D mode={mode} finishId={finishId} />
    </Suspense>
  );
}

export default ProductStage;
