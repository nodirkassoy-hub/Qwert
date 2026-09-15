import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { PockeyDevice } from './Device.jsx';
import { LightPool, LightRig, Motes, SoftShadow, Stage, StudioEnv } from './Stage.jsx';
import { DEVICE } from './geometry.js';
import { damp, fitDistance } from './fit.js';
import { store } from '../lib/store.js';

/** Full-screen-ish hero product: pointer parallax, idle float, scroll drift. */
export function HeroScene({ finishId = 'obsidian' }) {
  const hi = store.quality === 'high';
  return (
    <>
      <StudioEnv />
      <LightRig />
      <LightPool scale={26} opacity={0.45} position={[0, -0.6, -9]} />
      <HeroRig>
        <Float enabled={hi && !store.reduced} speed={1.05} rotationIntensity={0.14} floatIntensity={0.5} floatingRange={[-0.16, 0.16]}>
          <PockeyDevice finishId={finishId} rotation={[0.04, 0.42, 0.02]} />
        </Float>
      </HeroRig>
      <Stage hi={hi} y={-4.05} />
      <SoftShadow y={-3.98} opacity={0.7} scale={24} frames={hi ? Infinity : 1} />
      {!store.reduced && <Motes dense={hi} />}
    </>
  );
}

function HeroRig({ children }) {
  const group = useRef(null);

  useFrame(({ camera, size, clock }, delta) => {
    const dt = Math.min(delta, 0.05);
    const t = clock.elapsedTime;
    const p = store.heroP;
    const allowPointer = store.quality === 'high' && !store.reduced;
    const px = allowPointer ? store.pointer.x : 0;
    const py = allowPointer ? store.pointer.y : 0;

    const dist = fitDistance(camera, size, { width: DEVICE.w * 1.08, height: DEVICE.h * 1.18, fill: 0.78 });

    camera.position.x = damp(camera.position.x, px * 1.15, 2.6, dt);
    camera.position.y = damp(camera.position.y, 0.75 + py * 0.7 - p * 1.6, 2.6, dt);
    camera.position.z = damp(camera.position.z, dist + p * 3.4, 2.2, dt);
    camera.lookAt(0, 0.1 - p * 0.5, 0);

    const g = group.current;
    if (g) {
      const idle = store.reduced ? 0 : 1;
      g.rotation.y = damp(g.rotation.y, -0.04 + Math.sin(t * 0.24) * 0.14 * idle + px * 0.3 + p * 0.85, 3.4, dt);
      g.rotation.x = damp(g.rotation.x, 0.02 - py * 0.12 + p * 0.14, 3.4, dt);
      g.position.z = damp(g.position.z, -p * 1.4, 3, dt);
    }
  });

  return <group ref={group}>{children}</group>;
}

/**
 * Scroll-driven showcase: the slab spins, tips and travels while the camera
 * dollies from a high three-quarter view down to an eye-level hero shot.
 */
export function ShowcaseScene({ finishId = 'obsidian' }) {
  const hi = store.quality === 'high';
  return (
    <>
      <StudioEnv intensity={1.05} />
      <LightRig />
      <LightPool scale={34} opacity={0.34} position={[0, -1.4, -11]} />
      <ShowcaseRig>
        <PockeyDevice finishId={finishId} />
      </ShowcaseRig>
      <OrbitRings />
      <Stage hi={hi} y={-4.25} />
      <SoftShadow y={-4.18} opacity={0.64} scale={28} frames={hi ? Infinity : 1} />
      {!store.reduced && <Motes dense={hi} />}
    </>
  );
}

function ShowcaseRig({ children }) {
  const group = useRef(null);
  const first = useRef(true);

  useFrame(({ camera, size }, delta) => {
    const dt = Math.min(delta, 0.05);
    const p = store.showP;
    const g = group.current;

    const spin = -0.45 + p * Math.PI * 2.25;
    const tilt = 0.1 + Math.sin(p * Math.PI) * 0.28;
    const roll = Math.sin(p * Math.PI * 2) * 0.05;

    if (g) {
      if (first.current) {
        g.rotation.y = spin;
        first.current = false;
      } else {
        g.rotation.y = damp(g.rotation.y, spin, 5.5, dt);
      }
      g.rotation.x = damp(g.rotation.x, tilt, 5, dt);
      g.rotation.z = damp(g.rotation.z, roll, 5, dt);
      g.position.y = damp(g.position.y, 0.25 + Math.sin(p * Math.PI) * 0.62, 4, dt);
      g.position.x = damp(g.position.x, Math.sin(p * Math.PI * 2) * 0.5, 4, dt);
    }

    const mobile = size.width < 900;
    const dist = fitDistance(camera, size, {
      width: DEVICE.w * (mobile ? 1.14 : 1.12),
      height: DEVICE.h * (mobile ? 1.12 : 1.18),
      fill: mobile ? 0.86 : 0.68,
    });

    camera.position.x = damp(camera.position.x, Math.sin(p * Math.PI) * 1.5 + store.pointer.x * 0.5, 3, dt);
    camera.position.y = damp(camera.position.y, 2.3 - p * 3.6 + store.pointer.y * 0.35, 3, dt);
    camera.position.z = damp(camera.position.z, dist - Math.sin(p * Math.PI) * dist * 0.07, 3, dt);
    camera.lookAt(0, mobile ? -0.85 : -0.05, 0);
  });

  return <group ref={group}>{children}</group>;
}

/** Emissive guide rings on the stage floor. */
function OrbitRings() {
  return (
    <group position={[0, -4.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[4.1, 4.16, 96]} />
        <meshBasicMaterial color="#ffb168" transparent opacity={0.4} toneMapped={false} side={2} />
      </mesh>
      <mesh>
        <ringGeometry args={[5.6, 5.63, 96]} />
        <meshBasicMaterial color="#8fd8ff" transparent opacity={0.16} toneMapped={false} side={2} />
      </mesh>
      <mesh>
        <ringGeometry args={[7.4, 7.42, 96]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.07} toneMapped={false} side={2} />
      </mesh>
    </group>
  );
}

export { fitDistance };
