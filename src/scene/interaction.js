import * as THREE from 'three'

export function createInteraction(camera, screenGlow) {
  const target = new THREE.Vector3(0, 0, 0)

  // Spherical coords for camera orbit
  let targetAzimuth = 0    // horizontal angle offset
  let targetPolar = 0      // vertical angle offset
  let currentAzimuth = 0
  let currentPolar = 0

  let pulseIntensity = 0
  let glowBase = 0.37

  function onMouseMove(e) {
    const mx = (e.clientX / window.innerWidth) * 2 - 1
    const my = (e.clientY / window.innerHeight) * 2 - 1

    // Subtle orbit: ±12° horizontal, ±6° vertical
    targetAzimuth = mx * 0.21   // ~12°
    targetPolar = -my * 0.10    // ~6°
  }

  window.addEventListener('mousemove', onMouseMove)

  function triggerPulse() {
    pulseIntensity = 1.0
  }

  function update(dt, baseDistance) {
    const lerpFactor = 1 - Math.pow(0.001, dt)
    currentAzimuth += (targetAzimuth - currentAzimuth) * lerpFactor
    currentPolar += (targetPolar - currentPolar) * lerpFactor

    // Orbit camera around the target at the given distance
    const dist = baseDistance
    const x = dist * Math.sin(currentAzimuth) * Math.cos(currentPolar)
    const y = 1 + dist * Math.sin(currentPolar)
    const z = dist * Math.cos(currentAzimuth) * Math.cos(currentPolar)

    camera.position.set(x, y, z)
    camera.lookAt(target)

    // Screen pulse decay
    if (pulseIntensity > 0) {
      pulseIntensity *= Math.pow(0.01, dt)
      if (pulseIntensity < 0.01) pulseIntensity = 0
    }

    if (screenGlow) {
      screenGlow.intensity = glowBase + pulseIntensity * 0.3
    }
  }

  function setGlowBase(v) {
    glowBase = v
  }

  return { update, triggerPulse, setGlowBase }
}
