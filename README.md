# 3310.love

A faithful Nokia 3310 Snake II replica running in the browser. A 3D Nokia 3310 phone rendered with Three.js displays a pixel-accurate Snake II game on its LCD screen. The phone floats in HDRI-lit environments with Finnish radio streaming through a piezo-speaker EQ simulation.

**[Play it live →](https://3310.love)**

## About

In the autumn of 2000, Nokia released the 3310. Within two years, 126 million units had shipped. For many people it was their first mobile phone — and Snake II was the game that made every bus ride, every boring lecture, every sauna break into a high-score attempt.

The 3310 can't connect to modern networks anymore, but the feeling of playing Snake at 2am under the covers is universal. **3310.love** is a faithful recreation of that experience — the original game logic, the authentic Nokia LCD green, rendered in 3D, playable in your browser, free forever.

Built with love in Brooklyn, NY.

## Features

- Pixel-accurate Snake II game logic (grid, speed table, bonus food, death animation)
- 3D Nokia 3310 model with PBR materials and custom LCD shader
- Clickable phone buttons with press animation
- 5 HDRI environments (Sunflowers, Shanghai Night, Autumn Park, Beach Day, Golden Sunset)
- Finnish radio streams with FM-scrub tuning effect and piezo-speaker EQ
- Keyboard + phone button + touch controls
- Win98-style About popup with guestbook and leaderboard

## Controls

| Input | Action |
|-------|--------|
| Arrow keys / WASD | Move snake |
| Enter / Space | Select / Start |
| Escape / P | Pause |
| Click phone buttons | All of the above |
| Scroll wheel | Zoom |

## Tech

- Vanilla JavaScript (ES modules, no framework)
- Three.js with post-processing (bloom, vignette, SMAA, color grading)
- Web Audio API (square-wave synth + streaming radio)
- Vite

## Run locally

```bash
npm install
npm run dev      # localhost:3310
npm run build    # production build
```

## License

MIT
