# utils/ — Shared Utilities

### input.js — Keyboard Input Handler
- `createInput(game)` binds a `keydown` listener and routes keys based on game state
- Supported keys: Arrow keys, WASD, Numpad (2/4/5/6/8), Enter, Space, Escape, Backspace, P, C
- Direction buffering: up to 2 queued direction changes, flushed once per game tick via `flush()`
- This prevents lost inputs when the player makes rapid direction changes between ticks
- `drainEvents()` returns pending events (e.g. game start) for the main loop to process

### debug.js — Debug Panel
- `createDebug(opts)` builds a lil-gui panel with tweakable parameters
- Toggle visibility with the backtick (`` ` ``) key — hidden by default
- Sections:
  - **Click Debug**: logs raycast hit coordinates and button zone matches
  - **Screen**: LCD mesh position, scale, glow intensity/distance
  - **Post-processing**: bloom strength/radius/threshold, vignette offset/darkness, tone mapping exposure
  - **Phone Material**: metalness, roughness, clearcoat, envMapIntensity, bezel darken/z-threshold
  - **Soft Key Light**: intensity, distance, angle, penumbra, decay, position
  - **Camera**: FOV
  - **Meshes**: per-mesh visibility toggles
- Each section has a "Copy values" button for calibration workflow
