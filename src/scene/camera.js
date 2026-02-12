import * as THREE from 'three'

export function createCameraController(camera) {
  const cameraStart = camera.position.clone()
  const cameraEnd = new THREE.Vector3(0, 1, 8)
  const introDuration = 2.5 // seconds
  let introElapsed = 0
  let introComplete = false

  // Smooth ease-out cubic: decelerates into final position
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }

  // Scroll zoom
  let targetZoom = cameraEnd.z
  const zoomMin = 4
  const zoomMax = 14
  let currentZoom = cameraEnd.z

  window.addEventListener('wheel', (e) => {
    e.preventDefault()
    targetZoom += e.deltaY * 0.005
    targetZoom = Math.max(zoomMin, Math.min(zoomMax, targetZoom))
  }, { passive: false })

  function update(dt) {
    // Camera intro pan
    if (!introComplete) {
      introElapsed += dt
      const t = Math.min(introElapsed / introDuration, 1)
      const eased = easeOutCubic(t)
      camera.position.lerpVectors(cameraStart, cameraEnd, eased)
      camera.lookAt(0, 0, 0)
      if (t >= 1) introComplete = true
    } else {
      // Smooth scroll zoom
      const zoomLerp = 1 - Math.pow(0.001, dt)
      currentZoom += (targetZoom - currentZoom) * zoomLerp
    }
  }

  return {
    update,
    isIntroComplete() { return introComplete },
    getCurrentZoom() { return currentZoom },
  }
}
