import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { ContactShadows, Environment, Lightformer, MeshReflectorMaterial, Sparkles } from '@react-three/drei';
import { makeFadeTexture } from './textures.js';

/**
 * Studio lighting, baked into a local environment map (no HDR downloads):
 * a big soft top box, a warm key strip, a cool rim strip and a dark floor bounce.
 */
export function StudioEnv({ intensity = 1 }) {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={intensity}>
      <color attach="background" args={['#06070b']} />
      {/* overhead softbox */}
      <Lightformer form="rect" intensity={2.6} color="#fff6ec" scale={[16, 7, 1]} position={[0, 8, 1]} rotation={[Math.PI / 2, 0, 0]} />
      {/* warm key from the left */}
      <Lightformer form="rect" intensity={3.1} color="#ffbb7a" scale={[9, 4, 1]} position={[-8, 2.4, 5]} rotation={[0, Math.PI / 2.4, 0]} />
      {/* cool rim from the right */}
      <Lightformer form="rect" intensity={2.4} color="#a9d9ff" scale={[9, 5, 1]} position={[8, 1.4, -3]} rotation={[0, -Math.PI / 2.2, 0]} />
      {/* thin specular strip that rakes across the metal band */}
      <Lightformer form="rect" intensity={3.1} color="#fff3e4" scale={[0.6, 9, 1]} position={[2.6, 3, 7]} rotation={[0, 0, 0.25]} />
      {/* amber pool below for warmth */}
      <Lightformer form="circle" intensity={1.5} color="#ff7a2f" scale={7} position={[0, -6, 2]} rotation={[-Math.PI / 2, 0, 0]} />
      {/* dark bounce keeps contrast high */}
      <Lightformer form="rect" intensity={0.35} color="#0b0e15" scale={[24, 24, 1]} position={[0, 0, -14]} rotation={[0, 0, 0]} />
    </Environment>
  );
}

export function LightRig({ shadows = false }) {
  return (
    <>
      <ambientLight intensity={0.22} color="#c9d6ff" />
      <directionalLight
        position={[6.5, 9, 7]}
        intensity={0.85}
        color="#fff1e0"
        castShadow={shadows}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.0008}
      />
      <directionalLight position={[-7, 3, -4]} intensity={0.55} color="#7fb8ff" />
      <pointLight position={[-2.6, 0.2, 2.6]} intensity={6} distance={10} decay={2} color="#ffb168" />
      <spotLight position={[0, 9, 5]} angle={0.6} penumbra={1} intensity={30} distance={28} decay={2} color="#ffffff" />
    </>
  );
}

/**
 * Mirror stage — a real reflector on desktop, a cheap glossy plate elsewhere.
 * Both are feathered with a radial alpha map so the plane dissolves into the
 * page background instead of showing a hard rectangular edge.
 */
export function Stage({ hi = true, y = -2.75 }) {
  const fade = useMemo(() => makeFadeTexture(0.04, 0.3), []);
  useEffect(() => () => fade && fade.dispose(), [fade]);
  if (!hi) {
    return (
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
        <planeGeometry args={[42, 42]} />
        <meshPhysicalMaterial
          color="#0a0d14"
          metalness={0.72}
          roughness={0.38}
          envMapIntensity={0.75}
          alphaMap={fade}
          transparent
          depthWrite={false}
        />
      </mesh>
    );
  }
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[26, 26]} />
      <MeshReflectorMaterial
        resolution={512}
        blur={[420, 110]}
        mixBlur={9}
        mixStrength={0.85}
        mirror={0.12}
        depthScale={1.1}
        minDepthThreshold={0.35}
        maxDepthThreshold={1.35}
        roughness={0.92}
        metalness={0.55}
        color="#0a0d14"
        alphaMap={fade}
        transparent
        depthWrite={false}
      />
    </mesh>
  );
}

export function SoftShadow({ y = -2.7, opacity = 0.8, scale = 20, frames = Infinity }) {
  return (
    <ContactShadows
      position={[0, y, 0]}
      scale={scale}
      resolution={512}
      blur={2.9}
      far={7}
      opacity={opacity}
      frames={frames}
      color="#000000"
    />
  );
}

/** Slow drifting motes caught in the key light. */
export function Motes({ dense = true }) {
  return (
    <>
      <Sparkles
        count={dense ? 90 : 34}
        scale={[20, 12, 12]}
        size={2.4}
        speed={0.28}
        opacity={0.5}
        color="#ffd9ae"
        noise={0.5}
      />
      <Sparkles
        count={dense ? 46 : 18}
        scale={[14, 9, 8]}
        size={5.2}
        speed={0.16}
        opacity={0.22}
        color="#8fd8ff"
        noise={0.3}
      />
    </>
  );
}

export function dampNum(current, target, lambda, delta) {
  return THREE.MathUtils.damp(current, target, lambda, delta);
}
