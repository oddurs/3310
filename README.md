<p align="center">
  <img src="public/snake.gif" alt="snake.gif (1KB)" width="128" style="image-rendering: pixelated;" />
</p>

<h1 align="center">3310.love</h1>

<p align="center">
  <img src="public/finland.gif" alt="flag.gif" width="36" style="image-rendering: pixelated;" />
  &nbsp;
  <em>The indestructible phone is back.</em>
  &nbsp;
  <img src="public/finland.gif" alt="flag.gif" width="36" style="image-rendering: pixelated;" />
</p>

<p align="center">
  <a href="https://3310.love"><strong>&#9654; PLAY NOW &#9664;</strong></a>
  <br />
  <sub>No SIM card required. No 56K modem needed. Works on Internet Explorer 5— just kidding.</sub>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/phone-indestructible-brightgreen" />
  <img src="https://img.shields.io/badge/battery-7%20days-blue" />
  <img src="https://img.shields.io/badge/snake-100%25%20accurate-yellow" />
  <img src="https://img.shields.io/badge/price-free%20(ilmainen)-red" />
  <img src="https://img.shields.io/github/license/oddurs/3310" />
</p>

---

```
        __    __    __    __
       /  \  /  \  /  \  /  \
______/    \/    \/    \/    \___
| 0  0                           |
|   <>    ssso long, and thanks  |
|_____    for all the nibbles!   |
      \____/\____/\____/\____/
```

## What Is This

A pixel-accurate **Snake II** running on a 3D Nokia 3310 in your browser. The real game logic. The real LCD green. Finnish radio. The whole experience.

In the autumn of 2000, Nokia released the 3310. It cost 189 markka. Within two years, 126 million units had shipped. For many people it was their first phone — and Snake II was the reason they wore out the 5 key.

The 3310 can't connect to modern networks anymore, but the feeling of playing Snake at 2am under the covers is universal. This is a love letter to that feeling.

Built in Brooklyn, NY by someone who wore out the 5 key.

## Features

- **Pixel-accurate Snake II** — original grid, speed table, bonus food, "full" bulge animation, death blink
- **3D Nokia 3310** — FBX model with PBR textures, custom LCD shader with dot-matrix overlay, transparent plastic screen cover
- **Clickable phone buttons** — raycast hit detection on the 3D model, press animation
- **5 HDRI environments** — Sunflowers, Shanghai Night, Autumn Park, Beach Day, Golden Sunset
- **Finnish radio** — live YLE streams with FM-scrub tuning noise and piezo-speaker EQ chain
- **Post-processing** — bloom, vignette, SMAA, color grading
- **Leaderboard** — local top 5 high scores in localStorage
- **Win98 About popup** — draggable, resizable, with a guestbook. Just like 2001.
- **Ambient dust particles** — because atmosphere
- **Camera intro dolly** — smooth zoom-in on load

## Controls

```
  Keyboard          Phone Buttons
  --------          -------------
  Arrow keys        D-pad
  WASD              D-pad
  Numpad 2/4/6/8    Numpad on phone
  Enter / Space     Menu button / Numpad 5
  Escape / P        C button (pause)
  Scroll wheel      Zoom in/out
```

## Tech Stack

| What | How |
|------|-----|
| Runtime | Vanilla JS (ES modules, no framework) |
| 3D | Three.js r182 |
| Build | Vite 7 |
| Audio | Web Audio API (square-wave synth + streaming) |
| Model | Nokia 3310 FBX + PBR textures |
| Shaders | Custom `onBeforeCompile` for LCD window + bezel darkening |
| Post-FX | Bloom, Vignette, SMAA, Color Grading |
| Tests | Vitest |
| Deploy | GitHub Pages |

## Run Locally

```bash
npm install
npm run dev        # localhost:3310
npm run build      # production build to dist/
npm run preview    # preview production build
npm test           # run tests
```

## Architecture

```
src/
├── main.js              # Wires all systems, runs game loop
├── game/                # Pure game logic (no DOM/3D)
│   ├── snake.js         # State machine & tick logic
│   ├── lcd.js           # Canvas 2D renderer → CanvasTexture
│   ├── dispatch.js      # Shared input action router
│   ├── constants.js     # Grid, LCD, sprites, speeds
│   ├── sprites.js       # 8×8 bitmap sprite data
│   ├── fonts.js         # 3×5 pixel font + Nokia font rasterizer
│   ├── mazes.js         # 8 maze layouts
│   ├── leaderboard.js   # localStorage high scores
│   └── splash.js        # Splash screen bitmap
├── scene/               # Three.js 3D scene
│   ├── setup.js         # Scene, camera, renderer, lighting rig
│   ├── phone.js         # FBX loader, PBR material, LCD shader
│   ├── themes.js        # HDRI environment switcher
│   ├── interaction.js   # Mouse/touch camera orbit
│   ├── buttons.js       # Raycasted phone button clicks
│   ├── camera.js        # Intro animation + scroll zoom
│   ├── postprocessing.js
│   ├── particles.js     # Ambient dust motes
│   ├── ui.js            # Bottom bar + controls
│   ├── about/           # Win98 IE popup
│   └── share.js         # Share popup
├── audio/               # Sound systems
│   ├── sounds.js        # Square-wave SFX through speaker EQ
│   └── radio.js         # Finnish YLE radio streams
└── utils/               # Keyboard input, debug panel
```

## Specifications

| Spec | Value |
|------|-------|
| Display | 84 × 48 pixels, monochrome |
| LCD Color | `#c7cfa1` (Nokia Green™) |
| Grid | 23 × 13 cells at 8px |
| Speed Range | 658ms/tick (level 1) → 8ms/tick (level 9) |
| Battery Life | ███████ Unlimited |
| Durability | Indestructible |
| Price | Free / Ilmainen |

<p align="center">
  <img src="public/construction.gif" alt="under_construction.gif" width="20" style="image-rendering: pixelated;" />
  <img src="public/construction.gif" alt="under_construction.gif" width="20" style="image-rendering: pixelated;" />
  <img src="public/construction.gif" alt="under_construction.gif" width="20" style="image-rendering: pixelated;" />
  &nbsp;
  <sub>This README is permanently under construction</sub>
  &nbsp;
  <img src="public/construction.gif" alt="under_construction.gif" width="20" style="image-rendering: pixelated;" />
  <img src="public/construction.gif" alt="under_construction.gif" width="20" style="image-rendering: pixelated;" />
  <img src="public/construction.gif" alt="under_construction.gif" width="20" style="image-rendering: pixelated;" />
</p>

## License

[MIT](LICENSE) — free as in Nokia ringtone.

---

<p align="center">
  <sub>
    You are visitor No. <strong>003&thinsp;847</strong>
    &nbsp;·&nbsp;
    Best viewed at 800×600
    &nbsp;·&nbsp;
    Made with ♥ in Brooklyn
  </sub>
  <br />
  <sub>
    <img src="public/finland.gif" alt="fi" width="18" style="image-rendering: pixelated;" />
    &nbsp;Kiitos&nbsp;
    <img src="public/finland.gif" alt="fi" width="18" style="image-rendering: pixelated;" />
  </sub>
</p>
