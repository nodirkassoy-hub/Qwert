import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { DEVICE, slabGeometry } from './geometry.js';
import { FINISHES, isLowPower } from '../lib/store.js';
import {
  makeBrushedTexture,
  makeDisplayTexture,
  makeIrisTexture,
  makeSpeckleTexture,
  makeVentTexture,
  makeWordmarkTexture,
} from './textures.js';

const { w: W, h: H, d: D, r: R, bevel: B } = DEVICE;

const GLASS_T = 0.12;
const BAND_X = W / 2 + B; // widest silhouette (extrude bevel bulges outward)
const BAND_Y = H / 2 + B;
const GLASS_Z = D / 2 + GLASS_T / 2 - 0.05; // glass sits slightly above the ceramic shoulder
const FACE = GLASS_Z + GLASS_T / 2 + 0.005; // surface every decal element rests on

/**
 * POCKEY — pocket smart scanner.
 * Ceramic shell · milled titanium rail · sapphire lens stack · always-on strip display.
 * Fully procedural: no texture or model downloads.
 */
export function PockeyDevice({ finishId = 'obsidian', quality, ...props }) {
  const finish = FINISHES[finishId] || FINISHES.obsidian;
  const hi = (quality || (isLowPower() ? 'low' : 'high')) === 'high';

  const geo = useMemo(
    () => ({
      body: slabGeometry({ w: W, h: H, r: R, depth: D, bevel: B, curveSegments: hi ? 22 : 12 }),
      glass: slabGeometry({ w: W - 0.62, h: H - 0.62, r: R - 0.31, depth: GLASS_T, bevel: 0.025, curveSegments: hi ? 18 : 10 }),
      recess: slabGeometry({ w: DEVICE.display.w + 0.3, h: DEVICE.display.h + 0.28, r: 0.2, depth: 0.05, bevel: 0.015, curveSegments: 8 }),
      keyLong: slabGeometry({ w: 0.92, h: 0.34, r: 0.15, depth: 0.13, bevel: 0.03, curveSegments: 10 }),
      keyMid: slabGeometry({ w: 0.6, h: 0.3, r: 0.13, depth: 0.13, bevel: 0.03, curveSegments: 10 }),
      keyDot: slabGeometry({ w: 0.34, h: 0.26, r: 0.12, depth: 0.13, bevel: 0.03, curveSegments: 10 }),
      port: slabGeometry({ w: 1.0, h: 0.2, r: 0.09, depth: 0.06, bevel: 0.02, curveSegments: 6 }),
    }),
    [hi]
  );

  const tex = useMemo(
    () => ({
      display: makeDisplayTexture(),
      wordmark: makeWordmarkTexture(),
      iris: makeIrisTexture(),
      brushed: makeBrushedTexture(),
      speckle: makeSpeckleTexture(3),
      vent: makeVentTexture(12, 3),
    }),
    []
  );

  const mats = useMemo(() => {
    const shell = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.shell),
      name: 'pockey-shell',
      metalness: finish.shellMetal,
      roughness: finish.shellRough,
      clearcoat: 0.78,
      clearcoatRoughness: 0.34,
      envMapIntensity: 0.92,
    });
    if (tex.speckle) {
      shell.bumpMap = tex.speckle;
      shell.bumpScale = 0.004;
    }

    const band = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.band),
      metalness: 1,
      roughness: 0.78,
      envMapIntensity: 1.06,
      anisotropy: 0.5,
      anisotropyRotation: Math.PI / 2,
    });
    if (tex.brushed) {
      band.roughnessMap = tex.brushed;
      band.metalnessMap = tex.brushed;
    }

    const glassPanel = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#05070c'),
      metalness: 0.28,
      roughness: 0.115,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.2,
      sheen: hi ? 0.45 : 0,
      sheenColor: new THREE.Color('#8fd8ff'),
    });

    const dark = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#080b12'),
      metalness: 0.5,
      roughness: 0.36,
      envMapIntensity: 1,
      // the lens barrel is an open tube — both faces must render
      side: THREE.DoubleSide,
    });

    const lensRing = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#9aa1ac'),
      metalness: 1,
      roughness: 0.3,
      envMapIntensity: 1.25,
    });

    // A semi-transparent polished dome reads as coated lens glass and costs no
    // extra render pass: the iris plate underneath supplies the depth.
    const lensGlass = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0b1420'),
      metalness: 0.12,
      roughness: 0.035,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      ior: 1.52,
      envMapIntensity: 2.6,
      transparent: true,
      opacity: hi ? 0.52 : 0.68,
      depthWrite: false,
    });

    const screen = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#05070b'),
      map: tex.display,
      emissiveMap: tex.display,
      emissive: new THREE.Color('#ffffff'),
      emissiveIntensity: hi ? 1.2 : 1.45,
      roughness: 0.32,
      metalness: 0,
    });

    const engrave = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#eef2f8'),
      metalness: 0.85,
      roughness: 0.28,
      emissive: new THREE.Color('#5c636f'),
      emissiveIntensity: 0.35,
      alphaMap: tex.wordmark,
      transparent: true,
      depthWrite: false,
      envMapIntensity: 1.5,
    });

    const amber = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2b1204'),
      emissive: new THREE.Color('#ff8a3d'),
      emissiveIntensity: 2.4,
      roughness: 0.35,
      metalness: 0.2,
    });

    const ice = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#04121c'),
      emissive: new THREE.Color('#7fd8ff'),
      emissiveIntensity: 1.1,
      roughness: 0.4,
      metalness: 0.1,
    });

    const vent = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#03050a'),
      metalness: 0.6,
      roughness: 0.5,
      alphaMap: tex.vent,
      transparent: true,
      depthWrite: false,
    });

    const iris = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#05070c'),
      map: tex.iris,
      emissiveMap: tex.iris,
      emissive: new THREE.Color('#5c93cf'),
      emissiveIntensity: 0.85,
      roughness: 0.22,
      metalness: 0.8,
    });

    return { shell, band, glassPanel, dark, lensRing, lensGlass, screen, engrave, amber, ice, vent, iris };
    // deliberately NOT keyed on `finish` — the shell morphs instead of re-compiling materials
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tex, hi]);

  const target = useMemo(
    () => ({
      shell: new THREE.Color(finish.shell),
      band: new THREE.Color(finish.band),
      rough: finish.shellRough,
      metal: finish.shellMetal,
    }),
    [finish]
  );

  useFrame((_, delta) => {
    const k = 1 - Math.exp(-7 * Math.min(delta, 0.05));
    const { shell, band } = mats;
    shell.color.lerp(target.shell, k);
    band.color.lerp(target.band, k);
    shell.roughness += (target.rough - shell.roughness) * k;
    shell.metalness += (target.metal - shell.metalness) * k;
  });

  // dispose GPU resources once, on unmount only
  const bag = useMemo(() => ({ ...geo, ...tex, ...mats }), [geo, tex, mats]);
  useEffect(() => () => Object.values(bag).forEach((r) => r && r.dispose && r.dispose()), [bag]);

  return (
    <group {...props}>
      {/* shell — ceramic faces (group 0) + milled metal band (group 1) */}
      <mesh geometry={geo.body}>
        <primitive object={mats.shell} attach="material-0" />
        <primitive object={mats.band} attach="material-1" />
      </mesh>

      {/* glass fields, front + back */}
      <mesh geometry={geo.glass} position={[0, 0, GLASS_Z]} material={mats.glassPanel} />
      <mesh geometry={geo.glass} position={[0, 0, -GLASS_Z]} rotation={[0, Math.PI, 0]} material={mats.glassPanel} />

      <LensAssembly mats={mats} hi={hi} x={DEVICE.lens.x} y={DEVICE.lens.y} z={FACE} />

      {/* always-on strip display */}
      <mesh geometry={geo.recess} position={[DEVICE.display.x, DEVICE.display.y, FACE]} material={mats.dark} />
      <mesh position={[DEVICE.display.x, DEVICE.display.y, FACE + 0.032]} material={mats.screen}>
        <planeGeometry args={[DEVICE.display.w, DEVICE.display.h]} />
      </mesh>

      {/* mic / exhaust vents */}
      <mesh position={[DEVICE.display.x, -1.55, FACE + 0.008]} material={mats.vent}>
        <planeGeometry args={[2.3, 0.34]} />
      </mesh>

      {/* status lights */}
      <mesh position={[W / 2 - 0.72, -H / 2 + 0.8, FACE + 0.02]} material={mats.amber}>
        <sphereGeometry args={[0.042, 14, 10]} />
      </mesh>

      {/* milled side keys: scan trigger, slider, shutter — local x→y, y→z, z→x */}
      <mesh geometry={geo.keyLong} position={[BAND_X - 0.006, 1.2, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]} material={mats.band} />
      <mesh geometry={geo.keyMid} position={[BAND_X - 0.006, -0.1, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]} material={mats.band} />
      <mesh geometry={geo.keyDot} position={[BAND_X - 0.006, -1.3, 0]} rotation={[0, Math.PI / 2, Math.PI / 2]} material={mats.amber} />

      {/* USB-C slot on the bottom rail */}
      <mesh geometry={geo.port} position={[0, -(BAND_Y + 0.006), 0]} rotation={[Math.PI / 2, 0, 0]} material={mats.dark} />

      {/* engraved back panel */}
      <group position={[0, 0.06, -(GLASS_Z + GLASS_T / 2 + 0.012)]} rotation={[0, Math.PI, 0]}>
        <mesh material={mats.engrave}>
          <planeGeometry args={[3.7, 1.85]} />
        </mesh>
      </group>
    </group>
  );
}

/**
 * Raised optical module. Everything lives in front of the (opaque) glass field so the
 * aperture is actually visible: pedestal → inner liner → iris plate → glow ring → dome.
 */
function LensAssembly({ mats, hi, x, y, z }) {
  const r = DEVICE.lens.r;
  const seg = hi ? 72 : 30;
  return (
    <group position={[x, y, z]}>
      {/* seat ring shadowed onto the glass */}
      <mesh material={mats.dark} position={[0, 0, 0.003]}>
        <ringGeometry args={[r + 0.02, r + 0.3, seg]} />
      </mesh>
      {/* machined pedestal */}
      <mesh material={mats.lensRing} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.085]}>
        <cylinderGeometry args={[r + 0.08, r + 0.1, 0.17, seg, 1, true]} />
      </mesh>
      {/* polished top bezel */}
      <mesh material={mats.lensRing} position={[0, 0, 0.17]}>
        <torusGeometry args={[r + 0.04, 0.07, hi ? 20 : 10, seg]} />
      </mesh>
      {/* dark liner you look down into */}
      <mesh material={mats.dark} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.06]}>
        <cylinderGeometry args={[r - 0.05, r + 0.02, 0.22, seg, 1, true]} />
      </mesh>
      {/* aperture plate */}
      <mesh material={mats.iris} position={[0, 0, 0.03]}>
        <circleGeometry args={[r - 0.05, seg]} />
      </mesh>
      {/* amber lock ring */}
      <mesh material={mats.amber} position={[0, 0, 0.042]}>
        <torusGeometry args={[r - 0.31, 0.013, 8, seg]} />
      </mesh>
      {/* coated dome */}
      <mesh material={mats.lensGlass} scale={[1, 1, 0.3]} position={[0, 0, 0.1]}>
        <sphereGeometry args={[r - 0.04, seg, hi ? 32 : 14]} />
      </mesh>
      {/* lens glint */}
      <mesh material={mats.ice} position={[-r * 0.42, r * 0.46, 0.2]} rotation={[0, 0, -0.5]}>
        <circleGeometry args={[0.075, 16]} />
      </mesh>
    </group>
  );
}

export default PockeyDevice;
