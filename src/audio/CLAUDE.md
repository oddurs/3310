# audio/ — Sound Systems

All audio uses the Web Audio API. No audio files — everything is synthesized or streamed.

Audio context is lazily initialized on first user interaction (click or keydown) to comply with browser autoplay policies.

## Modules

### sounds.js — Game Sound Effects
- `createSounds()` returns 11 sound methods + `initContext()` / `getContext()`
- **Voice pool**: 12 concurrent gain nodes, time-based slot tracking with voice stealing (oldest slot reused when full)
- **Speaker simulation chain**: HP(400Hz, Q=0.5) -> LP(3800Hz, Q=1) -> master(0.35) -> dry(0.85) / reverb(0.12) split
- **Reverb**: Lightweight 40ms delay with 0.15 feedback (not a convolver)
- **All tones**: Square wave oscillators with scheduled gain envelopes
- Sound catalog:
  - `move()` — 700Hz 15ms blip (0.02 gain, 60ms throttle)
  - `eat()` — B4->D5 two-note ascending
  - `eatBonus()` — D5->F#5->A5 three-note fanfare
  - `die()` — F#5->D5->A4->E4 four-note descending
  - `start()` — three-note ascending fanfare
  - `levelUp()` — B4->A5 frequency sweep
  - `menuSelect()`, `menuNav()`, `pause()`, `unpause()`, `navPress()`, `buttonPress()`

### radio.js — Finnish Radio Streaming
- `createRadio()` returns play/stop/next/prev/toggle + volume/station getters
- **7 YLE stations**: Radio Suomi, Radio 1, YleX, Klassinen, Vega, Sami Radio, YleX3M
- **Primary EQ chain**: HP(300Hz) -> Peaking(1800Hz, +6dB) -> LP(6000Hz) -> gain -> destination
- **CORS fallback**: If `createMediaElementSource` fails, switches to plain `<Audio>` with direct volume control
- **FM-scrub effects** on station change (4 randomized variations):
  1. Dial sweep — bandpass frequency sweep through speaker chain
  2. Hiss — wideband white noise
  3. Flutter — bandpass + LFO gain modulation
  4. Crackle — white noise with random pops
- **Volume**: Default 0.04 (very quiet), range 0-0.8, controlled by 8-bar UI slider
- Exponential fade-in on play (tau=0.12, ~95% in 360ms)
