# utils/ — Shared Utilities

## Modules

### input.js — Keyboard Input Handler
- `createInput(game)` binds a `keydown` listener and routes keys based on game state
- Supported keys: Arrow keys, WASD, Numpad (2/4/5/6/8), Enter, Space, Escape, Backspace, P, C
- Direction buffering: up to 2 queued direction changes, flushed once per game tick via `flush()`
- This prevents lost inputs when the player makes rapid direction changes between ticks
- Non-direction actions route through `dispatchAction()` from `game/dispatch.js`
- `drainEvents()` returns pending events (e.g. game start) for the main loop to process

### debug.js — Debug Panel (Dev Only)
- `createDebug(opts)` builds a lil-gui panel with tweakable parameters
- Dynamically imported only in dev mode — tree-shaken from production build
- Toggle visibility with the backtick key — hidden by default
- Sections (each with "Copy values" button for calibration):
  - **Click Debug**: Raycast hit coordinates and button zone matches
  - **Screen**: LCD mesh position and scale
  - **LCD Surface**: Emissive intensity, roughness, clearcoat, contrast, brightness, tone mapping
  - **Post-processing**: Bloom strength/radius/threshold, vignette offset/darkness, exposure
  - **Color Grading**: 8 presets + saturation, temperature, tint, gamma, shadows, highlights
  - **Phone Material**: Metalness, roughness, clearcoat, envMapIntensity, bezel darken/z-threshold
  - **Screen Window**: Debug zone visualization, center/scale/padding calibration
  - **Bezel Frame**: Darken factor, tint (RGB), alpha, z-threshold
  - **Backing Plane**: Z position, scale, color, visibility
  - **Dot Matrix**: Columns, rows, dot size/softness/opacity
  - **HDRI Environment**: Intensity, rotation, blurriness, exposure
  - **Lighting**: Full light debug suite (delegates to light-debug.js)
  - **Camera**: FOV
  - **Meshes**: Per-mesh visibility toggles
  - **Copy All**: Export all calibration values at once

### light-debug.js — Lighting Visualization
- `createLightDebug(gui, scene, lights, screenGlow, camera)` returns `{ update(), diagram, helpers }`
- **2D diagram**: Canvas overlay showing top/side/front views of the lighting rig with camera FOV cone, light positions/intensities, phone silhouette, grid + axis labels
- **3D helpers**: RectAreaLightHelper, DirectionalLightHelper, SpotLightHelper, CameraHelper — toggled via GUI
- **Per-light controls**: Visibility, color, intensity, position (x/y/z), type-specific params (width/height, angle/penumbra/decay, shadow radius/bias)
- Intensity rings show light falloff visually in the 2D diagram
- Draggable panel with tab navigation between views
