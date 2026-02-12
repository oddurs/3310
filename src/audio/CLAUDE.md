# audio/ — Sound Systems

All audio uses the Web Audio API. No audio files — everything is synthesized or streamed.

## Modules

### sounds.js — Game Sound Effects
- `createSounds()` sets up a shared filter bus: highpass(400Hz) → lowpass(3800Hz) → master gain(0.35) → dry(0.82)/reverb(0.18) split
- This chain simulates the Nokia 3310's small piezo speaker
- Voices are lightweight: oscillator → gain → shared bus. Max 6 concurrent voices
- Per-sound throttling prevents rapid-fire audio spam (e.g. move sound limited to 60ms intervals)
- Sound catalog:
  - `move()` — 15ms 700Hz blip
  - `eat()` — two-note ascending (B4→D5)
  - `eatBonus()` — three-note ascending (D5→F#5→A5)
  - `die()` — four-note descending (F#5→D5→A4→E4)
  - `start()` — three-note ascending fanfare
  - `levelUp()` — frequency sweep B4→A5
  - `buttonPress()`, `navPress()`, `menuSelect()`, `menuNav()`, `pause()`, `unpause()`

### ambient.js — Theme Ambient Soundscapes (Currently Disabled)
- Generates per-theme background audio using filtered noise + LFO-modulated drones
- Shanghai: city hum (60/90Hz drones), traffic rumble, band-passed "chatter", water shimmer
- Autumn Park: gentle breeze, rustling leaves, randomized bird chirps, warm drone
- Dark Forest: deep wind, forest drones, high atmospheric whisper, random creaking
- Currently disabled in main.js (commented out)

### radio.js — Finnish Radio Streaming
- Streams 7 YLE radio stations via HTML `<Audio>` elements
- Primary path: `createMediaElementSource` → highpass(300Hz) → peaking(1800Hz, +6dB) → lowpass(6000Hz) → gain → destination
- CORS fallback: if Web Audio decoding fails, switches to a plain `<Audio>` element with direct volume control
- FM-scrub effect on station change: white noise burst through bandpass + sine frequency sweep
- Volume: default 0.04 (very quiet), range controlled by 8-bar UI in themes.js
