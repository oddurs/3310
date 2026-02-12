# Nokia 3310 Snake — Project Guide

## Overview

A faithful Nokia 3310 Snake II replica running in the browser at [3310.love](https://3310.love). A 3D Nokia 3310 phone model rendered with Three.js displays a pixel-accurate Snake II game on its LCD screen. The phone floats in HDRI-lit environments with Finnish YLE radio streaming through a piezo-speaker EQ simulation.

## Tech Stack

- **Runtime**: Vanilla JavaScript (ES modules, no framework)
- **3D Engine**: Three.js with post-processing (bloom, color grading, vignette, SMAA)
- **Build**: Vite 7, dev server on port 3310
- **Audio**: Web Audio API (square-wave synth for game sounds, streaming radio with FM-scrub effects)
- **Model**: Nokia 3310 FBX with 1K PBR textures (albedo, normal, metalness, roughness)
- **Hosting**: GitHub Pages with custom domain (3310.love)
- **No TypeScript, no linter**

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
│   ├── fonts.js         # 3x5 pixel font + Nokia .woff2 rasterizer
│   ├── dispatch.js      # State-based action router (keyboard + button → game)
│   ├── events.js        # Game event → sound effect dispatcher
│   ├── leaderboard.js   # Top 5 scores in localStorage
│   ├── mazes.js         # 8 maze layouts for campaign mode
│   └── splash.js        # Splash screen bitmap loader
├── scene/               # Three.js 3D scene
│   ├── setup.js         # Scene, camera, renderer, product lighting rig
│   ├── phone.js         # FBX loader, PBR material, LCD screen plane, custom shader
│   ├── interaction.js   # Mouse/touch camera orbit
│   ├── buttons.js       # Raycasted click zones on phone model → game actions
│   ├── themes.js        # HDRI/backplate theme switcher (5 environments)
│   ├── camera.js        # Intro dolly animation + scroll wheel zoom
│   ├── postprocessing.js # Bloom, color grading, vignette, SMAA
│   ├── particles.js     # Ambient floating dust motes
│   ├── ui.js            # Bottom bar (env/radio controls) + top bar (title/share/github)
│   ├── about.js         # Win98-style About popup (re-exports from about/)
│   ├── about/           # About popup window + multi-page content
│   └── share.js         # Win98-style retro Share popup
├── audio/               # Sound systems
│   ├── sounds.js        # Game SFX — square-wave synth through speaker EQ chain
│   └── radio.js         # Finnish YLE radio streams with FM-scrub tuning effect
└── utils/               # Shared utilities
    ├── input.js         # Keyboard handler with direction buffering
    ├── debug.js         # lil-gui debug panel (toggle with backtick key, dev only)
    └── light-debug.js   # 2D lighting diagram + 3D helpers for light calibration
```

## Key Patterns

### Game State Machine
States flow: `splash → menu → menuLevel | leaderboard | playing → paused | dying → gameover → menu`
All game state lives in `createGame()` closure. State is read-only via `getState()`.

### Input → Dispatch → Events
Keyboard input (`input.js`) and phone button clicks (`buttons.js`) both route through `dispatch.js` which maps actions to game state methods. Game events (`events.js`) bridge state changes to sound effects.

### LCD Rendering
The game renders to a 200x134 offscreen canvas (matching Nokia 3310 LCD proportions) that's mapped as a `CanvasTexture` onto the screen mesh. Two font systems: a hand-coded 3x5 pixel font for gameplay and a rasterized Nokia `.woff2` font (alpha-thresholded to 1-bit) for menus. All sprites are hand-coded byte arrays.

### Phone Shader
The phone body uses `MeshPhysicalMaterial` with `onBeforeCompile` to cut a transparent window where the LCD sits, darken raised bezel elements based on z-depth, and animate button press deformation.

### Direction Buffering
Input uses a 2-deep buffer so rapid direction changes (e.g. quick U-turns) aren't lost between game ticks.

### Audio Architecture
All game sounds go through: oscillator → gain → highpass(400Hz) → lowpass(3800Hz) → master gain → dry/reverb split. This simulates the Nokia's piezo speaker. Radio streams go through a separate EQ chain with FM-scrub noise bursts on station change.

### Loading Strategy
Phone model, splash image, and initial HDRI load in parallel. Remaining 4 environments preload sequentially 2 seconds after scene is interactive. Debug panel is dynamically imported only in dev mode (tree-shaken from production).

## Conventions

- Factory functions (`createX()`) returning plain objects — no classes
- No external state management — closures hold all state
- Sprite data stored as raw byte arrays, not image files
- All coordinates in game/ modules use grid units (COLS=23, ROWS=13, CELL=8px)
- Scene coordinates are Three.js world units, phone is ~5 units tall
- Debug panel values can be copied to clipboard for calibration
- Win98/IE aesthetic for all popup UI (About, Share)
- Asset paths use `import.meta.env.BASE_URL` prefix for deployment flexibility
