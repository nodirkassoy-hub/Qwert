import React, { useEffect, useMemo } from 'react';
import * as THREE from 'three';
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
      metalness: finish.shellMetal,
      roughness: finish.shellRough,
      clearcoat: 1,
      clearcoatRoughness: 0.32,
      envMapIntensity: 1.2,
    });
    if (tex.speckle) {
      shell.bumpMap = tex.speckle;
      shell.bumpScale = 0.004;
    }

    const band = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(finish.band),
      metalness: 1,
      roughness: 0.72,
      envMapIntensity: 1.55,
      anisotropy: 0.55,
      anisotropyRotation: Math.PI / 2,
    });
    if (tex.brushed) {
      band.roughnessMap = tex.brushed;
      band.metalnessMap = tex.brushed;
    }

    const glassPanel = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#05070c'),
      metalness: 0.28,
      roughness: 0.07,
      clearcoat: 1,
      clearcoatRoughness: 0.03,
      envMapIntensity: 1.8,
      sheen: hi ? 0.45 : 0,
      sheenColor: new THREE.Color('#8fd8ff'),
    });

    const dark = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#070a10'),
      metalness: 0.45,
      roughness: 0.34,
      envMapIntensity: 1.1,
    });

    const lensGlass = hi
      ? new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#dfeeff'),
          metalness: 0,
          roughness: 0.03,
          transmission: 0.92,
          thickness: 0.5,
          ior: 1.72,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
          attenuationColor: new THREE.Color('#2b4a7a'),
          attenuationDistance: 1.4,
          envMapIntensity: 2.1,
          specularIntensity: 1,
        })
      : new THREE.MeshPhysicalMaterial({
          color: new THREE.Color('#0a1220'),
          metalness: 0.35,
          roughness: 0.05,
          clearcoat: 1,
          clearcoatRoughness: 0.02,
          envMapIntensity: 2.4,
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
      color: new THREE.Color('#e3e8f0'),
      metalness: 1,
      roughness: 0.14,
      alphaMap: tex.wordmark,
      transparent: true,
      depthWrite: false,
      envMapIntensity: 1.8,
    });

    const amber = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2b1204'),
      emissive: new THREE.Color('#ff8a3d'),
      emissiveIntensity: 3.6,
      roughness: 0.35,
      metalness: 0.2,
    });

    const ice = new THREE.MeshStandardMaterial({
      color: new THREE.Color('#04121c'),
      emissive: new THREE.Color('#7fd8ff'),
      emissiveIntensity: 1.8,
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
      color: new THREE.Color('#0a0e16'),
      map: tex.iris,
      emissiveMap: tex.iris,
      emissive: new THREE.Color('#4a7fb5'),
      emissiveIntensity: 0.4,
      roughness: 0.25,
      metalness: 0.7,
    });

    return { shell, band, glassPanel, dark, lensGlass, screen, engrave, amber, ice, vent, iris };
  }, [finish, tex, hi]);

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
      <mesh position={[W / 2 - 0.75, -H / 2 + 0.86, FACE + 0.02]} material={mats.amber}>
        <sphereGeometry args={[0.05, 16, 12]} />
      </mesh>
      <mesh position={[W / 2 - 1.14, -H / 2 + 0.86, FACE + 0.02]} material={mats.ice}>
        <sphereGeometry args={[0.038, 12, 10]} />
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
        <ringGeometry args={[r + 0.02, r + 0.34, seg]} />
      </mesh>
      {/* machined pedestal wall */}
      <mesh material={mats.band} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.085]}>
        <cylinderGeometry args={[r + 0.08, r + 0.1, 0.17, seg, 1, true]} />
      </mesh>
      {/* top bezel */}
      <mesh material={mats.band} position={[0, 0, 0.17]}>
        <torusGeometry args={[r + 0.04, 0.075, hi ? 20 : 10, seg]} />
      </mesh>
      {/* dark liner you look down into */}
      <mesh material={mats.dark} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.055]}>
        <cylinderGeometry args={[r - 0.04, r + 0.02, 0.24, seg, 1, true]} />
      </mesh>
      {/* aperture */}
      <mesh material={mats.iris} position={[0, 0, 0.014]}>
        <circleGeometry args={[r - 0.03, seg]} />
      </mesh>
      {/* amber lock ring */}
      <mesh material={mats.amber} position={[0, 0, 0.028]}>
        <torusGeometry args={[r - 0.3, 0.014, 8, seg]} />
      </mesh>
      {/* sapphire dome, recessed inside the bezel */}
      <mesh material={mats.lensGlass} scale={[1, 1, 0.2]} position={[0, 0, 0.12]}>
        <sphereGeometry args={[r - 0.02, seg, hi ? 32 : 14]} />
      </mesh>
      {/* sensor pip + focus laser */}
      <mesh material={mats.ice} position={[r + 0.34, -r - 0.02, 0.02]}>
        <sphereGeometry args={[0.075, 14, 10]} />
      </mesh>
      <mesh material={mats.amber} position={[r + 0.34, r - 0.16, 0.02]}>
        <sphereGeometry args={[0.05, 12, 10]} />
      </mesh>
    </group>
  );
}

export default PockeyDevice;
