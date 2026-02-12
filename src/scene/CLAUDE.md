# scene/ — Three.js 3D Scene

All Three.js scene setup, phone model, camera, lighting, interaction, and UI.

## Modules

### setup.js — Scene Bootstrap
- Creates scene, PerspectiveCamera (46° FOV), WebGLRenderer (PCFSoftShadowMap, NeutralToneMapping)
- Product photography lighting rig:
  - **Key**: RectAreaLight (16×16, warm white) at 45° right + directional shadow caster (2048px shadowmap)
  - **Fill**: RectAreaLight (10×10, cool white) at camera left, half key intensity (2:1 ratio)
  - **Rim**: DirectionalLight from top-left behind for edge separation
  - **Soft key**: SpotLight with wide cone and full penumbra
  - **Ambient**: Low-intensity AmbientLight to lift deep shadows
- Returns `{ scene, camera, renderer, softKey }`

### phone.js — Nokia 3310 Model
- Loads `/models/nokia3310.fbx` via FBXLoader, normalizes to ~5 world units tall
- Applies PBR textures (albedo, normal, metalness, roughness) via `MeshPhysicalMaterial`
- **Custom shader** (`onBeforeCompile`): transforms vertices to group-local space, makes the screen rectangle transparent (alpha=0.08), darkens raised bezel elements by z-depth
- Screen plane: `PlaneGeometry` with the LCD `CanvasTexture`, positioned at calibrated offset (scale 1.045×0.975, y=0.605, z=0.281)
- Screen glow: `PointLight` on layer 1 (only illuminates screen mesh, not phone body)
- `updateShader()` must be called each frame to sync the inverse group matrix

### environment.js — Environment Stub
- Currently empty — HDRI environments are loaded by the theme manager

### interaction.js — Camera Orbit + Effects
- Mouse position drives subtle camera orbit: ±12° horizontal, ±6° vertical
- `update(dt, baseDistance)` smoothly interpolates camera to target orbit position
- Screen glow pulse: `triggerPulse()` spikes glow intensity, decays exponentially

### buttons.js — Phone Click Zones
- Raycasts mouse clicks against the phone model
- `hitTest(localPos)` checks against calibrated rectangular zones (nav pad, numpad, menu, C button)
- Maps zones to actions (`up/down/left/right/ok/back`) and dispatches to game state
- Debug mode logs click coordinates and zone info to the lil-gui panel

### themes.js — HDRI Themes + UI
- 3 themes: Shanghai Night, Autumn Park, Dark Forest
- Each has a 2K HDRI (environment/reflections) + 8K JPEG backplate (background)
- Loaded via RGBELoader + TextureLoader, cached after first load
- Bottom bar UI: environment arrows + radio controls (station picker, volume popup, mute toggle)
- Top-right: "3310.fi" title + "About" link that opens a Win98-style draggable/resizable IE browser popup
- Volume popup: 8-bar Nokia-style vertical slider with pointer drag support
