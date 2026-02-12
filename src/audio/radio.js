// Finnish Radio Player
// Streams Finnish radio stations through Web Audio API with tinny EQ
// to simulate the Nokia 3310's piezo speaker

const STATIONS = [
  { name: 'YLE Radio Suomi', url: 'https://icecast.live.yle.fi/radio/YleRS/icecast.audio' },
  { name: 'YLE Radio 1', url: 'https://icecast.live.yle.fi/radio/YleRadio1/icecast.audio' },
  { name: 'YleX', url: 'https://icecast.live.yle.fi/radio/YleX/icecast.audio' },
  { name: 'YLE Klassinen', url: 'https://icecast.live.yle.fi/radio/YleKlassinen/icecast.audio' },
  { name: 'YLE Vega', url: 'https://icecast.live.yle.fi/radio/YleVega/icecast.audio' },
  { name: 'YLE Sámi', url: 'https://icecast.live.yle.fi/radio/YleSami/icecast.audio' },
  { name: 'YleX3M', url: 'https://icecast.live.yle.fi/radio/YleX3M/icecast.audio' },
]

const DEFAULT_VOLUME = 0.04
const FADE_IN_TAU = 0.12 // exponential time constant — reaches ~95% in 360ms

export function createRadio() {
  let ctx = null
  let gainNode = null
  let eqConnected = false
  let currentIndex = 0
  let playing = false
  let scrubbing = false
  let volume = DEFAULT_VOLUME

  // Two audio elements: one for Web Audio EQ route, one as CORS fallback
  let audioEl = null
  let fallbackEl = null
  let usingFallback = false

  function initContext(audioContext) {
    ctx = audioContext

    // Primary element — routed through Web Audio EQ chain
    audioEl = new Audio()
    audioEl.crossOrigin = 'anonymous'

    // Fallback element — direct playback if CORS blocks Web Audio decoding
    fallbackEl = new Audio()
    fallbackEl.volume = volume

    try {
      const source = ctx.createMediaElementSource(audioEl)

      const highpass = ctx.createBiquadFilter()
      highpass.type = 'highpass'
      highpass.frequency.value = 300

      const peaking = ctx.createBiquadFilter()
      peaking.type = 'peaking'
      peaking.frequency.value = 1800
      peaking.Q.value = 1
      peaking.gain.value = 6

      const lowpass = ctx.createBiquadFilter()
      lowpass.type = 'lowpass'
      lowpass.frequency.value = 6000

      gainNode = ctx.createGain()
      gainNode.gain.value = volume

      source.connect(highpass)
      highpass.connect(peaking)
      peaking.connect(lowpass)
      lowpass.connect(gainNode)
      gainNode.connect(ctx.destination)
      eqConnected = true
    } catch (e) {
      eqConnected = false
    }

    // If primary element errors (CORS), switch to fallback
    audioEl.addEventListener('error', () => {
      if (playing && !usingFallback) {
        usingFallback = true
        fallbackEl.src = STATIONS[currentIndex].url
        fallbackEl.play().catch(() => {})
      }
    })
  }

  function getActiveEl() {
    return usingFallback ? fallbackEl : audioEl
  }

  // --- FM scrub sounds ---
  // All noise-based (no oscillators) — filtered through a small-speaker sim
  // so it sounds like real radio static, not a video game

  function makeNoise(duration) {
    const len = Math.ceil(ctx.sampleRate * duration)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
    return buf
  }

  function makeCrackleNoise(duration) {
    const len = Math.ceil(ctx.sampleRate * duration)
    const buf = ctx.createBuffer(1, len, ctx.sampleRate)
    const d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) {
      // Base hiss with random pops/crackle
      d[i] = (Math.random() * 2 - 1) * (Math.random() > 0.995 ? 3 : 1)
    }
    return buf
  }

  // Small-speaker filter: hp 400 → peaking 1.8k → lp 4k
  // Makes raw noise sound like it's coming through a phone speaker
  function speakerChain() {
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 400
    const pk = ctx.createBiquadFilter()
    pk.type = 'peaking'
    pk.frequency.value = 1800
    pk.Q.value = 1.5
    pk.gain.value = 4
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4000
    hp.connect(pk)
    pk.connect(lp)
    return { input: hp, output: lp }
  }

  // 1) Dial sweep — bandpass frequency sweeps across the band like turning a knob
  function scrubDialSweep(t, scrubVol, duration) {
    const src = ctx.createBufferSource()
    src.buffer = makeNoise(duration)

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 2 + Math.random() * 3
    const f0 = 800 + Math.random() * 1200
    const dir = Math.random() > 0.5 ? 1 : -1
    const f1 = Math.max(300, f0 + dir * (600 + Math.random() * 1500))
    bp.frequency.setValueAtTime(f0, t)
    bp.frequency.exponentialRampToValueAtTime(f1, t + duration * 0.8)

    const spk = speakerChain()
    const g = ctx.createGain()
    g.gain.setValueAtTime(scrubVol, t)
    g.gain.setValueAtTime(scrubVol * 0.7, t + duration * 0.6)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)

    src.connect(bp)
    bp.connect(spk.input)
    spk.output.connect(g)
    g.connect(ctx.destination)
    src.start(t)
    src.stop(t + duration)
  }

  // 2) Interstation hiss — broad wideband static, like landing between stations
  function scrubHiss(t, scrubVol, duration) {
    const src = ctx.createBufferSource()
    src.buffer = makeNoise(duration)

    const spk = speakerChain()
    const g = ctx.createGain()
    g.gain.setValueAtTime(scrubVol * 1.2, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)

    src.connect(spk.input)
    spk.output.connect(g)
    g.connect(ctx.destination)
    src.start(t)
    src.stop(t + duration)
  }

  // 3) Flutter — noise with LFO amplitude modulation, like a weak signal fading
  function scrubFlutter(t, scrubVol, duration) {
    const src = ctx.createBufferSource()
    src.buffer = makeNoise(duration)

    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1200 + Math.random() * 1800
    bp.Q.value = 0.8 + Math.random() * 1.2

    // LFO modulates the gain for that wavering-signal feel
    const lfo = ctx.createOscillator()
    lfo.frequency.value = 5 + Math.random() * 12
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = scrubVol * 0.4

    const g = ctx.createGain()
    g.gain.setValueAtTime(scrubVol * 0.6, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)

    lfo.connect(lfoGain)
    lfoGain.connect(g.gain)

    const spk = speakerChain()
    src.connect(bp)
    bp.connect(spk.input)
    spk.output.connect(g)
    g.connect(ctx.destination)

    src.start(t)
    lfo.start(t)
    src.stop(t + duration)
    lfo.stop(t + duration)
  }

  // 4) Crackle — static with prominent pops, like an old analog radio
  function scrubCrackle(t, scrubVol, duration) {
    const src = ctx.createBufferSource()
    src.buffer = makeCrackleNoise(duration)

    const spk = speakerChain()
    const g = ctx.createGain()
    g.gain.setValueAtTime(scrubVol, t)
    g.gain.exponentialRampToValueAtTime(0.001, t + duration)

    src.connect(spk.input)
    spk.output.connect(g)
    g.connect(ctx.destination)
    src.start(t)
    src.stop(t + duration)
  }

  const scrubVariations = [scrubDialSweep, scrubHiss, scrubFlutter, scrubCrackle]
  let lastScrubIndex = -1

  function playFMScrub() {
    if (!ctx) return Promise.resolve()
    scrubbing = true

    return new Promise((resolve) => {
      const t = ctx.currentTime
      const scrubVol = Math.min(volume * 3, 0.15)
      const duration = 0.35 + Math.random() * 0.3

      // Pick a variation different from last time
      let idx = Math.floor(Math.random() * scrubVariations.length)
      if (idx === lastScrubIndex) idx = (idx + 1) % scrubVariations.length
      lastScrubIndex = idx

      scrubVariations[idx](t, scrubVol, duration)

      setTimeout(() => {
        scrubbing = false
        resolve()
      }, duration * 1000)
    })
  }

  // --- Fade-in on stream playback ---

  function fadeInGain() {
    if (eqConnected && gainNode && !usingFallback) {
      // Web Audio path: exponential ease toward target volume
      const t = ctx.currentTime
      gainNode.gain.cancelScheduledValues(t)
      gainNode.gain.setValueAtTime(0.001, t)
      gainNode.gain.setTargetAtTime(volume, t, FADE_IN_TAU)
    }
  }

  function fadeInFallback() {
    // Fallback path: manual ease-out ramp
    fallbackEl.volume = 0
    let start = null
    const dur = FADE_IN_TAU * 3 * 1000 // ~360ms to reach ~95%
    function tick(ts) {
      if (!start) start = ts
      const p = Math.min((ts - start) / dur, 1)
      fallbackEl.volume = volume * (1 - Math.pow(1 - p, 3)) // ease-out cubic
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }

  function loadAndPlay(index) {
    const el = getActiveEl()

    // Mute before loading so the stream doesn't pop in
    if (eqConnected && gainNode && !usingFallback) {
      gainNode.gain.setValueAtTime(0.001, ctx.currentTime)
    } else if (usingFallback && fallbackEl) {
      fallbackEl.volume = 0
    }

    // Fade in once the stream starts playing
    const onPlaying = () => {
      el.removeEventListener('playing', onPlaying)
      if (usingFallback) {
        fadeInFallback()
      } else {
        fadeInGain()
      }
    }
    el.addEventListener('playing', onPlaying)

    el.src = STATIONS[index].url
    el.load()
    el.play().catch(() => {})
  }

  async function switchStation(newIndex) {
    if (scrubbing) return
    currentIndex = newIndex
    usingFallback = false

    if (playing) {
      audioEl.pause()
      fallbackEl.pause()
      await playFMScrub()
      loadAndPlay(currentIndex)
    }
  }

  return {
    initContext,

    play() {
      if (!audioEl || playing) return
      playing = true
      usingFallback = false
      loadAndPlay(currentIndex)
    },

    stop() {
      if (!playing) return
      playing = false
      audioEl.pause()
      fallbackEl.pause()
    },

    async next() {
      await switchStation((currentIndex + 1) % STATIONS.length)
    },

    async prev() {
      await switchStation((currentIndex - 1 + STATIONS.length) % STATIONS.length)
    },

    toggle() {
      if (playing) {
        this.stop()
      } else {
        this.play()
      }
    },

    isPlaying() {
      return playing
    },

    getStation() {
      return STATIONS[currentIndex]
    },

    getStationIndex() {
      return currentIndex
    },

    getStationCount() {
      return STATIONS.length
    },

    getVolume() {
      return volume
    },

    setVolume(v) {
      volume = v
      if (gainNode && eqConnected) {
        gainNode.gain.value = v
      }
      if (fallbackEl) {
        fallbackEl.volume = v
      }
    },
  }
}
