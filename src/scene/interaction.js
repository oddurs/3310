import * as THREE from 'three'

export function createInteraction(camera) {
  const target = new THREE.Vector3(0, 0, 0)

  // Spherical coords for camera orbit
  let targetAzimuth = 0    // horizontal angle offset
  let targetPolar = 0      // vertical angle offset
  let currentAzimuth = 0
  let currentPolar = 0

  const isMobile = window.innerWidth < 768

  function setTarget(mx, my) {
    if (isMobile) {
      // Mobile: ±4° horizontal, ±2° vertical
      targetAzimuth = mx * 0.07
      targetPolar = -my * 0.035
    } else {
      // Desktop: ±12° horizontal, ±6° vertical
      targetAzimuth = mx * 0.21
      targetPolar = -my * 0.10
    }
  }

  function onMouseMove(e) {
    const mx = (e.clientX / window.innerWidth) * 2 - 1
    const my = (e.clientY / window.innerHeight) * 2 - 1
    setTarget(mx, my)
  }

  function onTouchMove(e) {
    const t = e.touches[0]
    const mx = (t.clientX / window.innerWidth) * 2 - 1
    const my = (t.clientY / window.innerHeight) * 2 - 1
    setTarget(mx, my)
  }

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('touchmove', onTouchMove, { passive: true })

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
  }

  return { update }
}
