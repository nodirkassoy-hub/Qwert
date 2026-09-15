import React from 'react';

/**
 * A CSS/SVG "studio render" of the device.
 * Doubles as the poster that fades out when WebGL is ready and as the permanent
 * fallback if WebGL is unavailable — the product is never missing from the page.
 */
export function ProductPoster({ scale = 1, glow = true }) {
  return (
    <div className="poster" aria-hidden="true">
      <div className="poster__inner" style={{ transform: `scale(${scale})` }}>
        {glow && <div className="poster__glow" />}
        <div className="poster__device">
          <div className="poster__glass">
            <div className="poster__lens">
              <div className="poster__lensIn">
                <span className="poster__flare" />
              </div>
            </div>
            <div className="poster__strip">
              <b>POCKEY</b>
              <i />
              <em>READY</em>
            </div>
            <div className="poster__vents" />
            <div className="poster__led" />
          </div>
          <div className="poster__sheen" />
        </div>
        <div className="poster__shadow" />
      </div>
    </div>
  );
}

export default ProductPoster;
