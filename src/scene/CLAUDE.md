# scene/ — Three.js 3D Scene

All Three.js scene setup, phone model, camera, lighting, interaction, and UI.

## Modules

### setup.js — Scene Bootstrap
- Creates scene, PerspectiveCamera (46 FOV), WebGLRenderer (PCFSoftShadowMap, NeutralToneMapping, 2x max pixel ratio)
- Scene defaults: environmentIntensity=1.91, backgroundIntensity=1.01
- Product photography lighting rig:
  - **Key**: RectAreaLight (16x16, warm white) at 45 deg right + directional shadow caster (2048px shadowmap)
  - **Fill**: RectAreaLight (10x10, cool white) at camera left, 0.5x key intensity
  - **Rim**: DirectionalLight from top-left behind for edge separation
  - **Soft key**: SpotLight with wide cone (0.98 angle) and full penumbra (0.9)
  - **Ambient**: Low-intensity AmbientLight to lift deep shadows
- Returns `{ scene, camera, renderer, softKey, lights }`

### phone.js — Nokia 3310 Model
- Loads FBX model via FBXLoader, normalizes to ~5 world units tall
- Applies 1K PBR textures (albedo, normal, metalness, roughness) via `MeshPhysicalMaterial`
- **Custom shader** (`onBeforeCompile`):
  - Vertex: transforms to group-local space, deforms vertices for button press animation
  - Fragment: makes screen rectangle transparent (alpha=0.09), darkens raised bezel by z-depth
  - Uniforms: `scrMin/scrMax` (screen window), `pressMin/pressMax/pressAmount` (button deformation), `bezelDarken`, `topZoneDarken/Tint/Alpha`
- Screen plane: `PlaneGeometry` with LCD `CanvasTexture`, emissive material with dot-matrix overlay shader
- Dark backing plane behind screen to block interior geometry
- `updateShader()` must be called each frame to sync the inverse group matrix
- All asset paths use `import.meta.env.BASE_URL`

### interaction.js — Camera Orbit
- Mouse/touch position drives subtle camera orbit around the phone
- Desktop: +/-12 deg horizontal, +/-6 deg vertical
- Mobile (<768px): +/-4 deg horizontal, +/-2 deg vertical
- Smooth interpolation via exponential decay lerp

### buttons.js — Phone Click Zones
- Raycasts mouse/touch against the phone model
- Calibrated rectangular zones: nav pad (up/down/left/right/ok), soft keys (menu/C), numpad digits
- Routes hits through `dispatchAction()` to game state
- Button press animation: zone bounds + decay amount passed to phone shader for vertex deformation
- `drainEvents()` returns pending events for the main loop

### themes.js — HDRI Themes
- 5 themes: Sunflowers (default), Shanghai Night, Autumn Park, Beach Day, Golden Sunset
- Each has a 2K HDR (environment/reflections) + 4K JPEG backplate (background)
- Loaded via RGBELoader + TextureLoader, cached after first load
- `loadInitial()` returns a Promise for the first theme (used in parallel with phone/splash loading)
- `preloadRest()` sequentially loads remaining themes after scene is interactive
- `next()` / `prev()` cycle through themes, return label string

### camera.js — Camera Controller
- 2.5-second intro dolly animation (ease-out cubic) from initial position to (0, 1, 8)
- Scroll wheel zoom: exponential lerp between min=4 and max=14
- `start()` begins intro, `isIntroComplete()` gates interaction updates
- `getCurrentZoom()` returns base distance for camera orbit

### postprocessing.js — Post-Processing Pipeline
- EffectComposer chain: RenderPass -> UnrealBloomPass -> ColorGradeShader -> VignetteShader -> SMAAPass
- **Bloom**: strength=0.06, radius=0.3, threshold=0.92
- **Color grading**: Custom shader with 8 presets (none, cinematic warm, cool blue, vintage, noir, teal-orange, cross-process, faded film) + tweakable saturation, temperature, tint, gamma, shadows, highlights
- **Vignette**: offset=1.0, darkness=1.2
- **SMAA**: Edge antialiasing as final pass

### particles.js — Ambient Dust
- 18 floating dust motes with custom ShaderMaterial (soft circular dots)
- Random velocities, wrap around camera position (toroidal)
- Per-particle opacity (0.01-0.07) and size (0.3-1.1)

### ui.js — Bottom Bar + Title
- **Bottom bar** (fixed, z-index 10):
  - Left: environment theme arrows + label
  - Right: radio station arrows + label + speaker icon + volume popup
- **Volume popup**: 8-bar vertical slider, pointer drag support, Nokia green (#8b9a5b) fill, hover show/hide with 400ms delay
- **Top-left**: "3310.love" title + About icon button
- **Top-right**: Share + GitHub icon buttons
- All icons from pixelarticons (24x24 SVG), Nokia font throughout

### about.js + about/ — About Popup
- Re-exports `createAboutPopup()` from `about/window.js`
- **Window**: Win98-style draggable/resizable IE5 browser chrome (520x420px default)
- **4 pages** (defined in `about/pages.js`): Home, Leaderboard, Guestbook, Credits
- Y2K aesthetic: table layouts, pixel art SVGs (Finnish flag, Nokia 3310, snake), blinking badges, marquee text
- Address bar updates per page, scroll isolated to popup

### share.js — Share Popup
- Win98-style IE6 browser window with title bar, menu bar, address bar, status bar
- Share methods: Email (mailto:), Copy Link (clipboard), AIM/Messenger, ICQ, Print, Floppy (humorous fallbacks)
- "Link To Us" HTML snippet, retro banner, Webring section
- All pixel art icons as inline SVG data URIs
