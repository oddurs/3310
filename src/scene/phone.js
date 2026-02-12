import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

export function loadPhone(scene, lcdTexture) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader()
    const textureLoader = new THREE.TextureLoader()

    const albedo = textureLoader.load('/textures/nokia_3310_Albedo.png')
    const normal = textureLoader.load('/textures/nokia_3310_Normal.png')
    const metalness = textureLoader.load('/textures/nokia_3310_Metalness.png')
    const roughness = textureLoader.load('/textures/nokia_3310_Roughness.png')

    albedo.colorSpace = THREE.SRGBColorSpace
    normal.colorSpace = THREE.LinearSRGBColorSpace
    metalness.colorSpace = THREE.LinearSRGBColorSpace
    roughness.colorSpace = THREE.LinearSRGBColorSpace

    loader.load(
      '/models/nokia3310.fbx',
      (object) => {
        const phoneGroup = new THREE.Group()

        // Normalize scale
        const box = new THREE.Box3().setFromObject(object)
        const size = box.getSize(new THREE.Vector3())
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 5 / maxDim
        object.scale.multiplyScalar(scale)

        // Stand upright, screen facing camera
        object.rotation.x = Math.PI / 2

        // Re-center
        box.setFromObject(object)
        const center = box.getCenter(new THREE.Vector3())
        object.position.sub(center)

        // Final bounds
        box.setFromObject(object)
        const phoneSize = box.getSize(new THREE.Vector3())

        // Screen dimensions and position (calibrated)
        const screenWidth = phoneSize.x * 0.6897
        const screenHeight = phoneSize.y * 0.2114
        const screenPos = new THREE.Vector3(0, 0.582, 0.141)

        // Transparency window — trimmed at bottom to keep bezel text visible
        const scrHalfW = screenWidth / 2
        const scrHalfH = screenHeight / 2
        const scrMin = new THREE.Vector2(screenPos.x - scrHalfW, screenPos.y - scrHalfH * 0.88)
        const scrMax = new THREE.Vector2(screenPos.x + scrHalfW, screenPos.y + scrHalfH)

        // Phone body material — transparent in screen area
        let phoneShaderRef = null

        const phoneMaterial = new THREE.MeshPhysicalMaterial({
          map: albedo,
          normalMap: normal,
          metalnessMap: metalness,
          roughnessMap: roughness,
          metalness: 0.04,
          roughness: 0.75,
          clearcoat: 0.05,
          clearcoatRoughness: 1,
          envMapIntensity: 0.85,
          transparent: true,
          side: THREE.DoubleSide,
        })

        phoneMaterial.onBeforeCompile = (shader) => {
          phoneShaderRef = shader

          shader.uniforms.invGroupMatrix = { value: new THREE.Matrix4() }
          shader.uniforms.scrMin = { value: scrMin }
          shader.uniforms.scrMax = { value: scrMax }
          shader.uniforms.bezelDarken = { value: 0.45 }
          shader.uniforms.bezelZThreshold = { value: 0.30 }
          shader.uniforms.debugZones = { value: 0 }

          // Pass group-local position to fragment shader
          shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            'uniform mat4 invGroupMatrix;\nvarying vec3 vGroupPos;\nvoid main() {'
          )
          shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            '#include <worldpos_vertex>\nvGroupPos = (invGroupMatrix * modelMatrix * vec4(transformed, 1.0)).xyz;'
          )

          // Make screen area transparent + darken raised bezel elements
          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            'varying vec3 vGroupPos;\nuniform vec2 scrMin;\nuniform vec2 scrMax;\nuniform float bezelDarken;\nuniform float bezelZThreshold;\nuniform float debugZones;\nvoid main() {'
          )
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            bool inScreen = vGroupPos.x > scrMin.x && vGroupPos.x < scrMax.x &&
                            vGroupPos.y > scrMin.y && vGroupPos.y < scrMax.y &&
                            vGroupPos.z > 0.1;
            bool isRaised = vGroupPos.z > bezelZThreshold;
            if (debugZones > 0.5) {
              // Debug: color-code zones
              // Red = screen transparency window
              // Blue = raised bezel (z > threshold)
              // Green = Z depth heatmap (brighter = closer to camera)
              float zNorm = clamp(vGroupPos.z / 0.5, 0.0, 1.0);
              gl_FragColor.rgb = vec3(zNorm * 0.3, zNorm * 0.5, zNorm * 0.2);
              gl_FragColor.a = 1.0;
              if (inScreen) {
                gl_FragColor.rgb = vec3(1.0, 0.1, 0.1);
              } else if (isRaised) {
                gl_FragColor.rgb = vec3(0.1, 0.2, 1.0) * (0.5 + zNorm * 0.5);
              }
              // Outline the screen rect edges
              float edgeDist = min(
                min(abs(vGroupPos.x - scrMin.x), abs(vGroupPos.x - scrMax.x)),
                min(abs(vGroupPos.y - scrMin.y), abs(vGroupPos.y - scrMax.y))
              );
              if (edgeDist < 0.015) {
                gl_FragColor.rgb = vec3(1.0, 1.0, 0.0);
              }
            } else {
              if (inScreen) {
                gl_FragColor.rgb = vec3(0.0);
                gl_FragColor.a = 0.08;
              } else if (isRaised) {
                gl_FragColor.rgb *= bezelDarken;
              }
            }`
          )
        }

        const meshList = []
        object.traverse((child) => {
          if (child.isMesh) {
            child.material = phoneMaterial
            child.castShadow = true
            child.receiveShadow = true
            child.renderOrder = 2
            meshList.push(child)
            console.log(`[Phone] mesh: "${child.name}"`, child)
          }
        })

        phoneGroup.add(object)

        // LCD screen plane
        const screenPlane = new THREE.PlaneGeometry(screenWidth, screenHeight)
        let screenShaderRef = null
        const screenMaterial = new THREE.MeshBasicMaterial({
          map: lcdTexture,
          toneMapped: false,
        })
        screenMaterial.onBeforeCompile = (shader) => {
          screenShaderRef = shader
          shader.uniforms.dotCols = { value: 84 }
          shader.uniforms.dotRows = { value: 48 }
          shader.uniforms.dotSize = { value: 0.42 }
          shader.uniforms.dotSoftness = { value: 0.15 }
          shader.uniforms.dotOpacity = { value: 0.04 }

          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            'uniform float dotCols;\nuniform float dotRows;\nuniform float dotSize;\nuniform float dotSoftness;\nuniform float dotOpacity;\nvoid main() {'
          )
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            if (dotOpacity > 0.001) {
              vec2 cell = vec2(fract(vMapUv.x * dotCols) - 0.5, fract(vMapUv.y * dotRows) - 0.5);
              float dist = length(cell);
              float mask = smoothstep(dotSize, dotSize + dotSoftness, dist);
              gl_FragColor.rgb *= 1.0 - mask * dotOpacity;
            }`
          )
        }
        const screenMesh = new THREE.Mesh(screenPlane, screenMaterial)
        screenMesh.renderOrder = 1
        screenMesh.position.copy(screenPos)
        screenMesh.scale.set(1.045, 0.975, 1)
        screenMesh.position.y = 0.605
        screenMesh.position.z = 0.281
        screenMesh.layers.enable(1) // receive screenGlow light (on layer 1)
        phoneGroup.add(screenMesh)

        // Screen glow light — layer 1 so it only illuminates the screen mesh,
        // not the phone body (bezel elements very close to the light would blow out)
        const screenGlow = new THREE.PointLight(0xaabb88, 0.4, 3)
        screenGlow.position.set(screenPos.x, screenPos.y, screenPos.z + 0.3)
        screenGlow.layers.set(1)
        phoneGroup.add(screenGlow)

        // Center the phone in the scene
        phoneGroup.position.y = 0

        scene.add(phoneGroup)

        // Update inverse group matrix each frame (called from main loop)
        function updateShader() {
          if (phoneShaderRef) {
            phoneShaderRef.uniforms.invGroupMatrix.value.copy(phoneGroup.matrixWorld).invert()
          }
        }

        resolve({
          phone: phoneGroup,
          meshList,
          screenMesh,
          screenMaterial,
          screenGlow,
          phoneMaterial,
          phoneBounds: box,
          updateShader,
          getShaderRef() { return phoneShaderRef },
          getScreenShaderRef() { return screenShaderRef },
        })
      },
      undefined,
      (error) => {
        console.error('Error loading FBX:', error)
        reject(error)
      }
    )
  })
}
