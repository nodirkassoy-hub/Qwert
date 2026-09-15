# POCKEY — 3D product landing

A single-page, production-style product site for **POCKEY**, a pocket smart scanner.
The product is the hero: a fully procedural, physically-lit 3D model that you can spin by
scrolling, framed by an obsidian + amber studio treatment.

```
npm install
npm run dev        # http://localhost:5173
npm run build      # production bundle in dist/
npm run preview    # serve the build
npm test           # headless DOM smoke test (jsdom)
```

## What's on the page

| Section | Contents |
| --- | --- |
| Hero | Logo, `POCKEY — SIMPLE. SMART. BEAUTIFUL.`, one-line purpose, price, `BUY NOW`, live 3D product |
| What is POCKEY for? | Three benefit cards with layered 3D icons |
| Showcase | 320vh scroll-pinned stage: the product rotates while the camera dollies, with material callouts |
| Get your POCKEY | Price, finishes (they re-skin the 3D model live), `BUY NOW` |

No blog, no testimonials, no FAQ, no auth, no newsletter — deliberately.

## How it works

- **3D**: `three` + `@react-three/fiber` + `@react-three/drei`. The device is built at runtime
  from an extruded rounded-rect shell (ceramic caps + a milled metal band from the two
  `ExtrudeGeometry` material groups), a sapphire lens stack, an emissive strip display and
  engraved back plate. Nothing is downloaded: geometry is procedural and every texture
  (screen, iris, brushed metal, ceramic speckle, wordmark, vent mask) is painted to a
  `<canvas>` at runtime.
- **Lighting**: a local studio environment baked from drei `<Lightformer>` panels (soft box,
  warm key, cool rim, specular strip) — no HDR files. Softness comes from `ContactShadows`;
  the showcase adds a feathered `MeshReflectorMaterial` stage floor whose radial alpha map
  dissolves into the page so no plane edge is ever visible, and a light that tracks the camera
  so no face of the shell goes black mid-spin.
- **Framing**: `src/three/fit.js` solves the camera distance from the container's aspect ratio
  and from the shell *diagonal*, so the product keeps the same visual size from a 360px phone to
  a 5K desktop and never clips at the moment it turns edge-on.
- **Motion**: Lenis for momentum scrolling; scroll-triggered reveals are IntersectionObserver +
  CSS transitions, deliberately not a JS tween, so content can never be stranded in a hidden
  state by a stalled animation frame. The pinned showcase and its annotation card are driven by
  scroll progress writing straight to the DOM. Scroll and pointer values live in a mutable store
  (`src/lib/store.js`) read inside `useFrame`, so 60fps animation never triggers React renders.
- **Perf & resilience**: three/drei ship in an async chunk, so first paint is the CSS studio
  render; the real scene cross-fades in over it. The 3D layer is wrapped in an error boundary
  that keeps the poster if WebGL is missing, rendering pauses when a canvas leaves the
  viewport, and low-power devices drop reflections, shadow samples and particle density.
  `prefers-reduced-motion` disables parallax, float, particles, smooth scroll and the
  scan-line.

## Layout

```
src/
  App.jsx                 page composition, finish + modal state, intro curtain
  lib/store.js            finish presets + high-frequency scroll/pointer store
  lib/motion.js           lenis, ScrollTrigger reveals, hero intro, nav/progress chrome
  hooks.js                card spotlight, magnetic buttons, sticky progress, section spy
  three/geometry.js       rounded-rect slab primitives (pure three, unit-tested in node)
  three/textures.js       procedural canvas textures
  three/Device.jsx        the POCKEY model + materials
  three/Stage.jsx         environment, lights, mirror floor, shadows, motes
  three/Scenes.jsx        hero + showcase rigs (camera, spin, parallax)
  three/fit.js            aspect-aware camera framing
  three/ProductCanvas.jsx canvas host: visibility gating + WebGL fallback
  three/Stage3D.jsx       async boundary for the whole WebGL layer
  components/*            nav, hero, purpose, showcase, price, modal, poster
  styles/global.css       design system + all sections
tests/                    jsdom render smoke test
```
