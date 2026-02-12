import * as THREE from 'three'

export function createDustParticles(scene, camera) {
  const COUNT = 18
  const SPREAD = 14
  const SPEED = 0.04

  const geo = new THREE.BufferGeometry()
  const positions = new Float32Array(COUNT * 3)
  const opacities = new Float32Array(COUNT)
  const sizes = new Float32Array(COUNT)
  const velocities = []

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * SPREAD
    positions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD
    positions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD + camera.position.z * 0.5
    opacities[i] = Math.random() * 0.06 + 0.01
    sizes[i] = Math.random() * 0.8 + 0.3
    velocities.push(new THREE.Vector3(
      (Math.random() - 0.5) * SPEED,
      (Math.random() - 0.3) * SPEED * 0.4,
      (Math.random() - 0.5) * SPEED * 0.3,
    ))
  }

  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1))
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1))

  const mat = new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    uniforms: {
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    },
    vertexShader: `
      attribute float aOpacity;
      attribute float aSize;
      varying float vOpacity;
      uniform float uPixelRatio;
      void main() {
        vOpacity = aOpacity;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio * (80.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: `
      varying float vOpacity;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = vOpacity * smoothstep(0.5, 0.15, d);
        gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
      }
    `,
  })

  const points = new THREE.Points(geo, mat)
  points.renderOrder = 10
  scene.add(points)

  function update(dt) {
    const pos = geo.attributes.position
    for (let i = 0; i < COUNT; i++) {
      const v = velocities[i]
      pos.array[i * 3] += v.x * dt
      pos.array[i * 3 + 1] += v.y * dt
      pos.array[i * 3 + 2] += v.z * dt

      // Wrap around camera
      const dx = pos.array[i * 3] - camera.position.x
      const dy = pos.array[i * 3 + 1] - camera.position.y
      const dz = pos.array[i * 3 + 2] - camera.position.z
      if (Math.abs(dx) > SPREAD * 0.5) pos.array[i * 3] -= Math.sign(dx) * SPREAD
      if (Math.abs(dy) > SPREAD * 0.5) pos.array[i * 3 + 1] -= Math.sign(dy) * SPREAD
      if (Math.abs(dz) > SPREAD * 0.5) pos.array[i * 3 + 2] -= Math.sign(dz) * SPREAD
    }
    pos.needsUpdate = true
  }

  return { points, update }
}
