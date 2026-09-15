import React from 'react';

/** Layered ambient light, grain and vignette behind everything. */
export function Atmos() {
  return (
    <div className="atmos" aria-hidden="true">
      <div className="atmos__glow atmos__glow--warm" />
      <div className="atmos__glow atmos__glow--cool" />
      <div className="atmos__glow atmos__glow--low" />
      <div className="atmos__grain" />
      <div className="atmos__vignette" />
    </div>
  );
}

export function ScrollProgress() {
  return (
    <div className="progress" aria-hidden="true">
      <div className="progress__bar" />
    </div>
  );
}
