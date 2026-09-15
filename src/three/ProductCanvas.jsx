import React, { Suspense, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { ProductPoster } from '../components/Poster.jsx';
import { isLowPower } from '../lib/store.js';

class GLBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(err) {
    if (typeof console !== 'undefined') console.warn('[pockey] WebGL layer unavailable:', err?.message);
  }
  render() {
    if (this.state.failed) return <div className="stage stage--poster">{this.props.fallback}</div>;
    return this.props.children;
  }
}

/**
 * Host for a product canvas:
 * · fades the WebGL layer in over the CSS poster once the first frame is up
 * · stops rendering entirely when scrolled out of view (battery + thermals)
 * · falls back to the poster if WebGL cannot be created
 */
export function ProductCanvas({ children, camera, dpr, exposure = 1.06, className = '', posterScale = 1 }) {
  const hostRef = useRef(null);
  const [live, setLive] = useState(false);
  const [inView, setInView] = useState(true);
  const low = useRef(isLowPower());

  useEffect(() => {
    const el = hostRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: '12% 0px', threshold: 0 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <GLBoundary fallback={<ProductPoster scale={posterScale} />}>
      <div ref={hostRef} className={`stage ${live ? 'is-live' : ''} ${className}`}>
        <ProductPoster scale={posterScale} />
        <Canvas
          frameloop={inView ? 'always' : 'never'}
          camera={camera}
          dpr={dpr || (low.current ? [1, 1.35] : [1, 1.75])}
          gl={{
            antialias: !low.current,
            alpha: true,
            powerPreference: 'high-performance',
            failIfMajorPerformanceCaveat: false,
          }}
          onCreated={({ gl }) => {
            gl.toneMappingExposure = exposure;
            setLive(true);
          }}
        >
          <Suspense fallback={null}>{children}</Suspense>
        </Canvas>
      </div>
    </GLBoundary>
  );
}

export default ProductCanvas;
