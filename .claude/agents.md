# Nokia Snake — Custom Agents

## game-tuning

Specialist for adjusting Snake II game parameters — speed curves, scoring formulas, maze layouts, spawn timing, and difficulty balancing.

### Instructions

You are tuning the Snake II game logic in `src/game/`. Read `src/game/CLAUDE.md` for module context.

Key files:
- `src/game/constants.js` — SPEED_TABLE, grid dimensions, sprite indices
- `src/game/snake.js` — tick logic, scoring, bonus spawn timing, collision
- `src/game/mazes.js` — wall layouts and starting positions

When adjusting difficulty:
- Speed is controlled by `SPEED_TABLE` (15 levels, 658ms down to 8ms) and `LEVEL_TO_SPEED` mapping
- Score formula for nibbles: `LEVEL_TO_SPEED[gameLevel] + 1` per nibble
- Bonus score: `5 * (LEVEL_TO_SPEED[gameLevel] + 10) - 2 * (20 - bonus.timer)` (time-sensitive)
- Bonus spawns every 5-7 nibbles, lasts 20 ticks
- After changing values, test by running `npm run dev` and playing through several levels

## lcd-artist

Specialist for pixel art and LCD rendering — modifying sprites, fonts, screen layout, and visual effects on the Nokia LCD.

### Instructions

You are working on the Nokia 3310 LCD display system in `src/game/`. Read `src/game/CLAUDE.md` for module context.

Key files:
- `src/game/sprites.js` — 8×8 and 16×8 bitmap sprite data as byte arrays
- `src/game/lcd.js` — Canvas 2D rendering, layout, fonts, screen state drawing
- `src/game/constants.js` — LCD dimensions (200×134), cell size (8px), colors

Sprite format:
- 8×8 sprites: array of 8 bytes, MSB = leftmost pixel
- 16×8 sprites: array of 8 uint16 values, MSB = leftmost pixel
- Draw by bit-testing: `if (byte & (0x80 >> col))` for 8-wide, `if (word & (0x8000 >> col))` for 16-wide

LCD layout (canvas pixel coords):
- Outer padding: 6px (BORDER) on all sides
- Header: y=6..19 (14px) — score left, bonus countdown right
- Field border: 2px frame
- Game cells: 23×8=184px wide, 13×8=104px tall
- Nokia font glyphs are rasterized from .woff2, thresholded to 1-bit, and cached

Colors must stay within the Nokia green LCD palette: BG=#c7cfa1, FG=#67743c.

## scene-lighting

Specialist for Three.js 3D scene — camera, lighting, materials, post-processing, and phone model adjustments.

### Instructions

You are working on the Three.js 3D scene in `src/scene/`. Read `src/scene/CLAUDE.md` for module context.

Key files:
- `src/scene/setup.js` — lighting rig (key, fill, rim, soft key, ambient)
- `src/scene/phone.js` — FBX model, PBR material, custom shader, screen mesh placement
- `src/scene/interaction.js` — camera orbit, glow pulse
- `src/scene/themes.js` — HDRI environments, UI elements
- `src/main.js` — post-processing pipeline (bloom, vignette)

The debug panel (backtick key) has tweakable controls for all visual parameters with "Copy values" buttons. Use this workflow:
1. Adjust values in the debug panel
2. Copy the values
3. Update the corresponding source code

Important constraints:
- Phone shader uses `onBeforeCompile` — changes to vertex/fragment injection require careful string matching
- Screen mesh is on layer 1 with a dedicated PointLight so the glow doesn't blow out the phone bezel
- Phone material is transparent with alpha=0.08 in the screen window area
- Tone mapping is NeutralToneMapping — bloom and exposure interact

## audio-engineer

Specialist for Web Audio synthesis — game sounds, ambient soundscapes, and radio streaming.

### Instructions

You are working on the audio systems in `src/audio/`. Read `src/audio/CLAUDE.md` for module context.

Key files:
- `src/audio/sounds.js` — game SFX synth chain
- `src/audio/ambient.js` — theme-based ambient soundscapes (currently disabled)
- `src/audio/radio.js` — Finnish radio streaming with EQ

The Nokia speaker simulation chain: oscillator → gain → highpass(400Hz) → lowpass(3800Hz) → master(0.35) → dry/reverb split.

When creating new sounds:
- Use `playTone(freq, startTime, duration, gain)` or `playSequence(tones)` for simple sounds
- Use `playSweep(startFreq, endFreq, startTime, duration, gain)` for frequency sweeps
- Keep gains low (0.02-0.12) — the speaker sim amplifies midrange significantly
- Respect the 6-voice polyphony limit and per-sound throttle intervals
- All frequencies should feel authentic to a piezo buzzer (avoid sub-bass or high harmonics)
