// Nokia 3310 sound recreation — small speaker character with room ambiance

export function createSounds() {
  let ctx = null
  let bus = null       // shared filter bus: hp → lp → master → dry/wet
  let activeVoices = 0
  const MAX_VOICES = 4
  const throttles = {} // per-sound minimum interval tracking

  // Pre-allocated node pool to avoid GC pressure
  const pool = []
  const POOL_SIZE = 6

  function initContext() {
    if (!ctx) {
      ctx = new AudioContext({ latencyHint: 'interactive' })

      // Permanent filter chain — shared by all voices
      const hp = ctx.createBiquadFilter()
      hp.type = 'highpass'
      hp.frequency.value = 400
      hp.Q.value = 0.5

      const lp = ctx.createBiquadFilter()
      lp.type = 'lowpass'
      lp.frequency.value = 3800
      lp.Q.value = 1.0

      const masterGain = ctx.createGain()
      masterGain.gain.value = 0.35

      const dryGain = ctx.createGain()
      dryGain.gain.value = 0.85

      // Lightweight delay-based "reverb" instead of convolver
      const delay = ctx.createDelay(0.15)
      delay.delayTime.value = 0.04
      const fbGain = ctx.createGain()
      fbGain.gain.value = 0.15
      const wetGain = ctx.createGain()
      wetGain.gain.value = 0.12

      hp.connect(lp)
      lp.connect(masterGain)
      masterGain.connect(dryGain)
      dryGain.connect(ctx.destination)
      masterGain.connect(delay)
      delay.connect(fbGain)
      fbGain.connect(delay)
      delay.connect(wetGain)
      wetGain.connect(ctx.destination)

      bus = hp

      // Pre-allocate gain nodes
      for (let i = 0; i < POOL_SIZE; i++) {
        const g = ctx.createGain()
        g.gain.value = 0
        g.connect(bus)
        pool.push({ gain: g, inUse: false })
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  }

  function ready() {
    return ctx && ctx.state === 'running'
  }

  function canPlay(id, minInterval) {
    const now = performance.now()
    if (throttles[id] && now - throttles[id] < minInterval) return false
    throttles[id] = now
    return true
  }

  function acquireGain() {
    for (let i = 0; i < pool.length; i++) {
      if (!pool[i].inUse) {
        pool[i].inUse = true
        return pool[i]
      }
    }
    return null
  }

  function playTone(freq, startTime, duration, gain = 0.1) {
    if (activeVoices >= MAX_VOICES) return

    const slot = acquireGain()
    if (!slot) return

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = freq

    const g = slot.gain
    g.gain.cancelScheduledValues(startTime)
    g.gain.setValueAtTime(gain, startTime)
    g.gain.setValueAtTime(gain, startTime + duration * 0.75)
    g.gain.linearRampToValueAtTime(0, startTime + duration)

    osc.connect(g)

    activeVoices++
    osc.start(startTime)
    osc.stop(startTime + duration + 0.005)

    osc.onended = () => {
      osc.disconnect()
      slot.inUse = false
      activeVoices--
    }
  }

  function playSweep(startFreq, endFreq, startTime, duration, gain = 0.12) {
    if (activeVoices >= MAX_VOICES) return

    const slot = acquireGain()
    if (!slot) return

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(startFreq, startTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration)

    const g = slot.gain
    g.gain.cancelScheduledValues(startTime)
    g.gain.setValueAtTime(gain, startTime)
    g.gain.linearRampToValueAtTime(0, startTime + duration)

    osc.connect(g)

    activeVoices++
    osc.start(startTime)
    osc.stop(startTime + duration + 0.005)

    osc.onended = () => {
      osc.disconnect()
      slot.inUse = false
      activeVoices--
    }
  }

  function playSequence(tones) {
    if (!ready()) return
    const t = ctx.currentTime
    for (const [freq, offset, dur, gain] of tones) {
      playTone(freq, t + offset, dur, gain)
    }
  }

  return {
    buttonPress() {
      if (!canPlay('btn', 30)) return
      playSequence([[880, 0, 0.035, 0.05]])
    },

    navPress() {
      if (!canPlay('nav', 30)) return
      playSequence([[740, 0, 0.03, 0.04]])
    },

    move() {
      if (!canPlay('move', 60)) return
      playSequence([[700, 0, 0.015, 0.02]])
    },

    eat() {
      if (!canPlay('eat', 50)) return
      playSequence([
        [494, 0, 0.05, 0.07],
        [587, 0.05, 0.05, 0.07],
      ])
    },

    eatBonus() {
      if (!canPlay('eatB', 50)) return
      playSequence([
        [587, 0, 0.04, 0.07],
        [740, 0.04, 0.04, 0.07],
        [880, 0.08, 0.06, 0.08],
      ])
    },

    die() {
      playSequence([
        [740, 0, 0.1, 0.09],
        [587, 0.1, 0.1, 0.08],
        [440, 0.2, 0.1, 0.07],
        [330, 0.3, 0.15, 0.05],
      ])
    },

    start() {
      playSequence([
        [494, 0, 0.06, 0.06],
        [587, 0.07, 0.06, 0.06],
        [740, 0.14, 0.08, 0.07],
      ])
    },

    levelUp() {
      if (!ready()) return
      playSweep(494, 880, ctx.currentTime, 0.12, 0.06)
    },

    menuSelect() {
      playSequence([
        [880, 0, 0.04, 0.05],
        [988, 0.05, 0.06, 0.06],
      ])
    },

    menuNav() {
      if (!canPlay('mnav', 30)) return
      playSequence([[740, 0, 0.025, 0.04]])
    },

    pause() {
      playSequence([
        [587, 0, 0.05, 0.05],
        [494, 0.06, 0.05, 0.05],
      ])
    },

    unpause() {
      playSequence([
        [494, 0, 0.05, 0.05],
        [587, 0.06, 0.05, 0.05],
      ])
    },

    initContext,
    getContext() { return ctx },
  }
}
