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

  function playFMScrub() {
    if (!ctx) return Promise.resolve()
    scrubbing = true

    return new Promise((resolve) => {
      const duration = 0.4
      const t = ctx.currentTime
      const scrubVolume = Math.min(volume * 3, 0.15)

      // White noise burst through bandpass
      const bufferSize = ctx.sampleRate * duration
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }

      const noiseSource = ctx.createBufferSource()
      noiseSource.buffer = noiseBuffer

      const bandpass = ctx.createBiquadFilter()
      bandpass.type = 'bandpass'
      bandpass.frequency.value = 2500
      bandpass.Q.value = 0.5

      const noiseGain = ctx.createGain()
      noiseGain.gain.setValueAtTime(scrubVolume, t)
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t + duration)

      noiseSource.connect(bandpass)
      bandpass.connect(noiseGain)
      noiseGain.connect(ctx.destination)
      noiseSource.start(t)
      noiseSource.stop(t + duration)

      // Sine sweep for "tuning" feel
      const sweep = ctx.createOscillator()
      sweep.type = 'sine'
      sweep.frequency.setValueAtTime(800, t)
      sweep.frequency.exponentialRampToValueAtTime(2000, t + 0.15)

      const sweepGain = ctx.createGain()
      sweepGain.gain.setValueAtTime(scrubVolume * 0.5, t)
      sweepGain.gain.exponentialRampToValueAtTime(0.001, t + 0.15)

      sweep.connect(sweepGain)
      sweepGain.connect(ctx.destination)
      sweep.start(t)
      sweep.stop(t + 0.15)

      setTimeout(() => {
        scrubbing = false
        resolve()
      }, duration * 1000)
    })
  }

  function loadAndPlay(index) {
    const el = getActiveEl()
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
