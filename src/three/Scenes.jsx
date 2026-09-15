import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float } from '@react-three/drei';
import { PockeyDevice } from './Device.jsx';
import { LightRig, Motes, SoftShadow, Stage, StudioEnv } from './Stage.jsx';
import { damp, fitDistance } from './fit.js';

/**
 * A key light that keeps pace with the camera so the shell never goes fully dark
 * while it spins — the difference between a render and a product photograph.
 */
function TravelKey({ intensity = 0.55, height = 2.4, back = 7.5 }) {
  const light = useRef();
  useFrame((state) => {
    const l = light.current;
    if (!l) return;
    const c = state.camera;
    l.position.set(c.position.x * 0.6 + 1.6, c.position.y + height, c.position.z * 0.3 + back);
    l.target.position.set(0, 0.1, 0);
    l.target.updateMatrixWorld();
  });
  return (
    <directionalLight ref={light} intensity={intensity} color="#fff2e2" />
  );
}
import { store } from '../lib/store.js';

/** Full-screen-ish hero product: pointer parallax, idle float, scroll drift. */
export function HeroScene({ finishId = 'obsidian' }) {
  const hi = store.quality === 'high';
  return (
    <>
      <StudioEnv />
      <LightRig />
      <TravelKey intensity={0.4} />
      <HeroRig>
        <Float enabled={hi && !store.reduced} speed={1.05} rotationIntensity={0.14} floatIntensity={0.5} floatingRange={[-0.16, 0.16]}>
          <PockeyDevice finishId={finishId} rotation={[0.04, 0.42, 0.02]} />
        </Float>
      </HeroRig>
      <SoftShadow y={-3.62} opacity={0.58} scale={19} frames={hi ? Infinity : 1} />
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

    // 11.2 ≈ the shell diagonal, so the product never clips mid-rotation
    const fill = size.width < 900 ? 0.86 : 0.8;
    const dist = fitDistance(camera, size, { width: 11.4, height: 9.4, fill });

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
      <TravelKey intensity={0.72} height={2.1} back={6.5} />
      <ShowcaseRig>
        <PockeyDevice finishId={finishId} />
      </ShowcaseRig>
      <OrbitRings />
      <Stage hi={hi} y={-5.6} />
      <SoftShadow y={-5.5} opacity={0.66} scale={26} frames={hi ? Infinity : 1} />
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

    // fit the shell diagonal (11.4) on both axes, so the slab never clips mid-spin
    const mobile = size.width < 900;
    const dist = fitDistance(camera, size, {
      width: 11.4,
      height: 10.4,
      fill: mobile ? 0.74 : 0.6,
    });

    camera.position.x = damp(camera.position.x, Math.sin(p * Math.PI) * 1.5 + store.pointer.x * 0.5, 3, dt);
    camera.position.y = damp(camera.position.y, 2.3 - p * 3.6 + store.pointer.y * 0.35, 3, dt);
    camera.position.z = damp(camera.position.z, dist - Math.sin(p * Math.PI) * dist * 0.07, 3, dt);
    camera.lookAt(0, mobile ? 0.55 : 0.42, 0);
  });

  return <group ref={group}>{children}</group>;
}

/** Emissive guide rings on the stage floor. */
function OrbitRings() {
  return (
    <group position={[0, -5.52, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <mesh>
        <ringGeometry args={[3.5, 3.56, 128]} />
        <meshBasicMaterial color="#ffb168" transparent opacity={0.34} toneMapped={false} side={2} depthWrite={false} />
      </mesh>
      <mesh>
        <ringGeometry args={[4.9, 4.93, 128]} />
        <meshBasicMaterial color="#8fd8ff" transparent opacity={0.13} toneMapped={false} side={2} depthWrite={false} />
      </mesh>
    </group>
  );
}

export { fitDistance };
