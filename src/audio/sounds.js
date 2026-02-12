// Nokia 3310 sound recreation — small speaker character with room ambiance
//
// Voice pool uses time-based slot tracking instead of async onended callbacks.
// Each slot records when it will be free (endTime), so acquisition is instant
// and deterministic. If all slots are busy, the one finishing soonest is stolen.

export function createSounds() {
  let ctx = null
  let bus = null       // shared filter bus: hp → lp → master → dry/wet

  // Voice pool — each slot holds a gain node and its scheduled end time
  const pool = []
  const POOL_SIZE = 12

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

      // Pre-allocate gain nodes — endTime 0 means free
      for (let i = 0; i < POOL_SIZE; i++) {
        const g = ctx.createGain()
        g.gain.value = 0
        g.connect(bus)
        pool.push({ gain: g, endTime: 0 })
      }
    }
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  }

  function ready() {
    return ctx && ctx.state === 'running'
  }

  // Acquire a gain node slot. Free slots (endTime <= now) are preferred.
  // If none free, steal the slot finishing soonest (voice stealing).
  function acquireSlot(now) {
    let bestFree = null
    let bestSteal = null
    let earliestEnd = Infinity

    for (let i = 0; i < pool.length; i++) {
      const slot = pool[i]
      if (slot.endTime <= now) {
        // Free slot — take the first one
        if (!bestFree) bestFree = slot
      } else if (slot.endTime < earliestEnd) {
        // Busy slot — track the one ending soonest for stealing
        earliestEnd = slot.endTime
        bestSteal = slot
      }
    }

    return bestFree || bestSteal
  }

  function playTone(freq, startTime, duration, gain = 0.1) {
    const now = ctx.currentTime
    const slot = acquireSlot(now)
    if (!slot) return

    const endTime = startTime + duration

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.value = freq

    const g = slot.gain
    g.gain.cancelScheduledValues(now)
    g.gain.setValueAtTime(0, now)           // silence immediately (kills stolen voice)
    g.gain.setValueAtTime(gain, startTime)
    g.gain.setValueAtTime(gain, startTime + duration * 0.75)
    g.gain.linearRampToValueAtTime(0, endTime)

    osc.connect(g)
    osc.start(startTime)
    osc.stop(endTime + 0.01)
    osc.onended = () => osc.disconnect()

    slot.endTime = endTime
  }

  function playSweep(startFreq, endFreq, startTime, duration, gain = 0.12) {
    const now = ctx.currentTime
    const slot = acquireSlot(now)
    if (!slot) return

    const endTime = startTime + duration

    const osc = ctx.createOscillator()
    osc.type = 'square'
    osc.frequency.setValueAtTime(startFreq, startTime)
    osc.frequency.exponentialRampToValueAtTime(endFreq, endTime)

    const g = slot.gain
    g.gain.cancelScheduledValues(now)
    g.gain.setValueAtTime(0, now)
    g.gain.setValueAtTime(gain, startTime)
    g.gain.linearRampToValueAtTime(0, endTime)

    osc.connect(g)
    osc.start(startTime)
    osc.stop(endTime + 0.01)
    osc.onended = () => osc.disconnect()

    slot.endTime = endTime
  }

  function play(tones) {
    if (!ready()) return
    const t = ctx.currentTime
    for (const [freq, offset, dur, gain] of tones) {
      playTone(freq, t + offset, dur, gain)
    }
  }

  return {
    buttonPress() {
      play([[880, 0, 0.035, 0.05]])
    },

    navPress() {
      play([[740, 0, 0.03, 0.04]])
    },

    move() {
      play([[700, 0, 0.015, 0.02]])
    },

    eat() {
      play([
        [494, 0, 0.05, 0.07],
        [587, 0.05, 0.05, 0.07],
      ])
    },

    eatBonus() {
      play([
        [587, 0, 0.04, 0.07],
        [740, 0.04, 0.04, 0.07],
        [880, 0.08, 0.06, 0.08],
      ])
    },

    die() {
      play([
        [740, 0, 0.1, 0.09],
        [587, 0.1, 0.1, 0.08],
        [440, 0.2, 0.1, 0.07],
        [330, 0.3, 0.15, 0.05],
      ])
    },

    start() {
      play([
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
      play([
        [880, 0, 0.04, 0.05],
        [988, 0.05, 0.06, 0.06],
      ])
    },

    menuNav() {
      play([[740, 0, 0.025, 0.04]])
    },

    pause() {
      play([
        [587, 0, 0.05, 0.05],
        [494, 0.06, 0.05, 0.05],
      ])
    },

    unpause() {
      play([
        [494, 0, 0.05, 0.05],
        [587, 0.06, 0.05, 0.05],
      ])
    },

    initContext,
    getContext() { return ctx },
  }
}
