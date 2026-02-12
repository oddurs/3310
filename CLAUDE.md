# Nokia 3310 Snake — Project Guide

## Overview

A faithful Nokia 3310 Snake II replica running in the browser. A 3D Nokia 3310 phone model rendered with Three.js displays a pixel-accurate Snake II game on its LCD screen. The phone floats in HDRI-lit environments with Finnish radio streaming through a piezo-speaker EQ simulation.

## Tech Stack

- **Runtime**: Vanilla JavaScript (ES modules, no framework)
- **3D Engine**: Three.js (r182) with post-processing (bloom, vignette)
- **Build**: Vite 7, dev server on port 3310
- **Audio**: Web Audio API (square-wave synth for game sounds, streaming radio)
- **Model**: Nokia 3310 FBX with PBR textures (albedo, normal, metalness, roughness)
- **No TypeScript, no tests, no linter**

## Commands

```bash
npm run dev      # Start dev server (localhost:3310)
npm run build    # Production build to dist/
npm run preview  # Preview production build
```

## Architecture

```
src/
├── main.js              # App entry — wires all systems, runs game loop
├── game/                # Snake II game logic (pure state, no DOM/3D)
│   ├── snake.js         # Game state machine & tick logic
│   ├── lcd.js           # Canvas 2D renderer → Three.js CanvasTexture
│   ├── constants.js     # Grid dimensions, LCD colors, sprite indices, speeds
│   ├── sprites.js       # 8x8 and 16x8 bitmap sprite data + draw helpers
│   ├── mazes.js         # 8 maze layouts for campaign mode
│   └── splash.js        # Splash screen bitmap loader
├── scene/               # Three.js 3D scene
│   ├── setup.js         # Scene, camera, renderer, product lighting rig
│   ├── phone.js         # FBX loader, PBR material, LCD screen plane, shader
│   ├── environment.js   # Environment stub (HDRI-based via themes)
│   ├── interaction.js   # Mouse-follow camera orbit + screen glow pulse
│   ├── buttons.js       # Raycasted click zones on phone model → game actions
│   └── themes.js        # HDRI/backplate theme switcher + About popup (Win98 style)
├── audio/               # Sound systems
│   ├── sounds.js        # Game SFX — square-wave synth through speaker EQ chain
│   ├── ambient.js       # Per-theme ambient soundscapes (currently disabled)
│   └── radio.js         # Finnish YLE radio streams with FM-scrub tuning effect
└── utils/               # Shared utilities
    ├── input.js         # Keyboard handler with direction buffering
    └── debug.js         # lil-gui debug panel (toggle with backtick key)
```

## Key Patterns

### Game State Machine
States flow: `splash → menu → menuLevel | playing → paused | dying → gameover → menu`
All game state is in `createGame()` closure. State is read-only via `getState()`.

### LCD Rendering
The game renders to a 200x134 offscreen canvas (matching Nokia 3310 LCD proportions) that's mapped as a `CanvasTexture` onto the screen mesh. Uses a custom 3x5 pixel font and Nokia `.woff2` font for menus. All sprites are hand-coded byte arrays.

### Phone Shader
The phone body uses `MeshPhysicalMaterial` with `onBeforeCompile` to cut a transparent window where the LCD sits and darken raised bezel elements based on z-depth.

### Direction Buffering
Input uses a 2-deep buffer so rapid direction changes (e.g. quick U-turns) aren't lost between game ticks.

### Audio Architecture
All game sounds go through: oscillator → gain → highpass(400Hz) → lowpass(3800Hz) → master gain → dry/reverb split. This simulates the Nokia's small speaker. Radio streams go through a separate EQ chain with an FM-scrub noise burst on station change.

## Conventions

- Factory functions (`createX()`) returning plain objects — no classes
- No external state management — closures hold all state
- Sprite data stored as raw byte arrays, not image files
- All coordinates in game/ modules use grid units (COLS=23, ROWS=13, CELL=8px)
- Scene coordinates are Three.js world units, phone is ~5 units tall
- Debug panel values can be copied to clipboard for calibration
