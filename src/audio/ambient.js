// Ambient background sounds for each theme
// Generated with Web Audio API — filtered noise + subtle oscillators

export function createAmbient() {
  let ctx = null
  let masterGain = null
  let currentNodes = []
  let currentTheme = null

  function init(audioContext) {
    ctx = audioContext
    masterGain = ctx.createGain()
    masterGain.gain.value = 0
    masterGain.connect(ctx.destination)
  }

  function fadeIn(duration = 2) {
    if (!ctx) return
    masterGain.gain.cancelScheduledValues(ctx.currentTime)
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + duration)
  }

  function fadeOut(duration = 1) {
    if (!ctx) return
    masterGain.gain.cancelScheduledValues(ctx.currentTime)
    masterGain.gain.setValueAtTime(masterGain.gain.value, ctx.currentTime)
    masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + duration)
  }

  function stopAll() {
    currentNodes.forEach(node => {
      try { node.stop() } catch {}
    })
    currentNodes = []
  }

  // Utility: create filtered noise
  function createNoise(gain, filterType, filterFreq, filterQ) {
    const bufferSize = ctx.sampleRate * 2
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const filter = ctx.createBiquadFilter()
    filter.type = filterType
    filter.frequency.value = filterFreq
    filter.Q.value = filterQ

    const g = ctx.createGain()
    g.gain.value = gain

    source.connect(filter)
    filter.connect(g)
    g.connect(masterGain)
    source.start()
    currentNodes.push(source)
    return { source, filter, gain: g }
  }

  // Utility: create a slow LFO-modulated tone
  function createDrone(freq, gain, detune = 0) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = freq
    osc.detune.value = detune

    // Slow volume wobble
    const lfo = ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.1 + Math.random() * 0.15
    const lfoGain = ctx.createGain()
    lfoGain.gain.value = gain * 0.3
    lfo.connect(lfoGain)

    const g = ctx.createGain()
    g.gain.value = gain
    lfoGain.connect(g.gain)

    osc.connect(g)
    g.connect(masterGain)
    osc.start()
    lfo.start()
    currentNodes.push(osc, lfo)
    return { osc, gain: g }
  }

  // Shanghai: city hum, distant traffic, water lapping
  function playShanghai() {
    // Low city hum
    createDrone(60, 0.04)
    createDrone(90, 0.02, 5)
    // Traffic rumble (low-passed noise)
    createNoise(0.025, 'lowpass', 200, 0.5)
    // Higher city ambiance (band-passed noise, like distant chatter/activity)
    createNoise(0.008, 'bandpass', 800, 1)
    // Water-like shimmer (high-passed gentle noise)
    createNoise(0.006, 'highpass', 3000, 0.3)
  }

  // Autumn Park: birdsong, gentle breeze, rustling leaves
  function playAutumnPark() {
    // Gentle breeze (band-passed noise)
    createNoise(0.03, 'lowpass', 400, 0.3)
    // Rustling leaves (higher band noise, modulated)
    const rustle = createNoise(0.012, 'bandpass', 2500, 2)
    // Bird-like chirps using oscillators
    function scheduleBird() {
      if (!ctx || currentTheme !== 'autumn_park') return
      const delay = 2 + Math.random() * 6
      setTimeout(() => {
        if (!ctx || currentTheme !== 'autumn_park') return
        const t = ctx.currentTime
        const freq = 2000 + Math.random() * 2000
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(freq, t)
        osc.frequency.exponentialRampToValueAtTime(freq * 1.3, t + 0.05)
        osc.frequency.exponentialRampToValueAtTime(freq * 0.9, t + 0.1)
        const g = ctx.createGain()
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.015, t + 0.01)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15)
        osc.connect(g)
        g.connect(masterGain)
        osc.start(t)
        osc.stop(t + 0.2)
        scheduleBird()
      }, delay * 1000)
    }
    scheduleBird()
    // Warm low drone (sunny afternoon)
    createDrone(80, 0.015)
  }

  // Dark Forest: wind, creaking, deep ambiance
  function playDarkForest() {
    // Deep wind (low frequency noise)
    createNoise(0.035, 'lowpass', 250, 0.5)
    // Mid wind gusts
    createNoise(0.015, 'bandpass', 600, 1.5)
    // Deep forest drone
    createDrone(50, 0.03)
    createDrone(75, 0.015, -8)
    // High atmospheric whisper
    createNoise(0.005, 'highpass', 4000, 0.5)
    // Occasional creaking
    function scheduleCreak() {
      if (!ctx || currentTheme !== 'dark_forest') return
      const delay = 4 + Math.random() * 10
      setTimeout(() => {
        if (!ctx || currentTheme !== 'dark_forest') return
        const t = ctx.currentTime
        const osc = ctx.createOscillator()
        osc.type = 'sawtooth'
        osc.frequency.setValueAtTime(80 + Math.random() * 40, t)
        osc.frequency.linearRampToValueAtTime(60 + Math.random() * 30, t + 0.3)
        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.value = 300
        filter.Q.value = 5
        const g = ctx.createGain()
        g.gain.setValueAtTime(0, t)
        g.gain.linearRampToValueAtTime(0.01, t + 0.05)
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.4)
        osc.connect(filter)
        filter.connect(g)
        g.connect(masterGain)
        osc.start(t)
        osc.stop(t + 0.5)
        scheduleCreak()
      }, delay * 1000)
    }
    scheduleCreak()
  }

  function setTheme(themeId) {
    if (themeId === currentTheme) return
    fadeOut(0.8)

    setTimeout(() => {
      stopAll()
      currentTheme = themeId

      if (!ctx) return

      switch (themeId) {
        case 'shanghai': playShanghai(); break
        case 'autumn_park': playAutumnPark(); break
        case 'dark_forest': playDarkForest(); break
      }

      fadeIn(1.5)
    }, 800)
  }

  return {
    init,
    setTheme,
    fadeIn,
    fadeOut,
  }
}
