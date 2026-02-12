import * as THREE from 'three'
import { FBXLoader } from 'three/addons/loaders/FBXLoader.js'

export function loadPhone(scene, lcdTexture) {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader()
    const textureLoader = new THREE.TextureLoader()

    const base = import.meta.env.BASE_URL
    const albedo = textureLoader.load(base + 'textures/nokia_3310_Albedo_1k.png')
    const normal = textureLoader.load(base + 'textures/nokia_3310_Normal_1k.png')
    const metalness = textureLoader.load(base + 'textures/nokia_3310_Metalness_1k.png')
    const roughness = textureLoader.load(base + 'textures/nokia_3310_Roughness_1k.png')

    albedo.colorSpace = THREE.SRGBColorSpace
    normal.colorSpace = THREE.LinearSRGBColorSpace
    metalness.colorSpace = THREE.LinearSRGBColorSpace
    roughness.colorSpace = THREE.LinearSRGBColorSpace

    loader.load(
      base + 'models/nokia3310.fbx',
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

        // Transparency window (calibrated)
        const scrMin = new THREE.Vector2(-0.743, 0.122)
        const scrMax = new THREE.Vector2(0.743, 1.120)

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
          envMapIntensity: 1.1,
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

          // Button press deformation
          shader.uniforms.pressMin = { value: new THREE.Vector2(0, 0) }
          shader.uniforms.pressMax = { value: new THREE.Vector2(0, 0) }
          shader.uniforms.pressAmount = { value: 0.0 }

          // Bezel frame zone (raised area around screen)
          shader.uniforms.topZoneDarken = { value: 0.45 }
          shader.uniforms.topZoneTint = { value: new THREE.Vector3(1, 1, 1) }
          shader.uniforms.topZoneAlpha = { value: 1.0 }

          // Pass group-local position to fragment shader
          shader.vertexShader = shader.vertexShader.replace(
            'void main() {',
            'uniform mat4 invGroupMatrix;\nuniform vec2 pressMin;\nuniform vec2 pressMax;\nuniform float pressAmount;\nvarying vec3 vGroupPos;\nvoid main() {'
          )
          shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            `#include <worldpos_vertex>
            vGroupPos = (invGroupMatrix * modelMatrix * vec4(transformed, 1.0)).xyz;
            if (pressAmount > 0.001) {
              bool inPress = vGroupPos.x > pressMin.x && vGroupPos.x < pressMax.x &&
                             vGroupPos.y > pressMin.y && vGroupPos.y < pressMax.y;
              if (inPress) {
                transformed -= normal * pressAmount * 0.025;
              }
            }`
          )

          // Make screen area transparent + darken raised bezel elements
          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            'varying vec3 vGroupPos;\nuniform vec2 scrMin;\nuniform vec2 scrMax;\nuniform float bezelDarken;\nuniform float bezelZThreshold;\nuniform float debugZones;\nuniform float topZoneDarken;\nuniform vec3 topZoneTint;\nuniform float topZoneAlpha;\nvoid main() {'
          )
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            if (!gl_FrontFacing) discard;
            bool inScreen = vGroupPos.x > scrMin.x && vGroupPos.x < scrMax.x &&
                            vGroupPos.y > scrMin.y && vGroupPos.y < scrMax.y;
            bool isRaised = vGroupPos.z > bezelZThreshold;
            bool inBezelFrame = isRaised && !inScreen;
            if (debugZones > 0.5) {
              float zNorm = clamp(vGroupPos.z / 0.5, 0.0, 1.0);
              gl_FragColor.rgb = vec3(zNorm * 0.3, zNorm * 0.5, zNorm * 0.2);
              gl_FragColor.a = 1.0;
              if (inScreen) {
                gl_FragColor.rgb = vec3(1.0, 0.1, 0.1);
              } else if (inBezelFrame) {
                gl_FragColor.rgb = vec3(0.9, 0.2, 0.9);
              }
              float edgeDist = min(
                min(abs(vGroupPos.x - scrMin.x), abs(vGroupPos.x - scrMax.x)),
                min(abs(vGroupPos.y - scrMin.y), abs(vGroupPos.y - scrMax.y))
              );
              if (edgeDist < 0.015) {
                gl_FragColor.rgb = vec3(1.0, 1.0, 0.0);
              }
            } else {
              if (inScreen) {
                // Clear plastic cover — keep PBR reflections, see through to LCD
                gl_FragColor.rgb = min(gl_FragColor.rgb, vec3(0.6));
                gl_FragColor.a = 0.09;
              } else if (inBezelFrame) {
                gl_FragColor.rgb *= topZoneDarken * topZoneTint;
                gl_FragColor.a *= topZoneAlpha;
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
          }
        })

        phoneGroup.add(object)

        // LCD screen plane
        const screenPlane = new THREE.PlaneGeometry(screenWidth, screenHeight)
        let screenShaderRef = null
        const screenMaterial = new THREE.MeshPhysicalMaterial({
          color: 0x000000,
          emissive: 0xffffff,
          emissiveMap: lcdTexture,
          emissiveIntensity: 0.88,
          roughness: 0.12,
          metalness: 0.0,
          clearcoat: 0.53,
          clearcoatRoughness: 0.1,
          envMapIntensity: 0.6,
          toneMapped: false,
          depthWrite: false,
        })
        screenMaterial.onBeforeCompile = (shader) => {
          screenShaderRef = shader
          shader.uniforms.dotCols = { value: 84 }
          shader.uniforms.dotRows = { value: 48 }
          shader.uniforms.dotSize = { value: 0.42 }
          shader.uniforms.dotSoftness = { value: 0.15 }
          shader.uniforms.dotOpacity = { value: 0.04 }
          shader.uniforms.lcdContrast = { value: 0.55 }
          shader.uniforms.lcdBrightness = { value: -0.54 }

          shader.fragmentShader = shader.fragmentShader.replace(
            'void main() {',
            'uniform float dotCols;\nuniform float dotRows;\nuniform float dotSize;\nuniform float dotSoftness;\nuniform float dotOpacity;\nuniform float lcdContrast;\nuniform float lcdBrightness;\nvoid main() {'
          )
          shader.fragmentShader = shader.fragmentShader.replace(
            '#include <dithering_fragment>',
            `#include <dithering_fragment>
            // LCD contrast & brightness
            gl_FragColor.rgb = (gl_FragColor.rgb - 0.5) * lcdContrast + 0.5 + lcdBrightness;
            // Dot matrix overlay
            if (dotOpacity > 0.001) {
              vec2 cell = vec2(fract(vEmissiveMapUv.x * dotCols) - 0.5, fract(vEmissiveMapUv.y * dotRows) - 0.5);
              float dist = length(cell);
              float mask = smoothstep(dotSize, dotSize + dotSoftness, dist);
              gl_FragColor.rgb *= 1.0 - mask * dotOpacity;
            }`
          )
        }
        const screenMesh = new THREE.Mesh(screenPlane, screenMaterial)
        screenMesh.renderOrder = 1
        screenMesh.position.set(0, 0.612, 0.312)
        screenMesh.scale.set(1.02, 0.975, 1)
        screenMesh.layers.enable(0)
        phoneGroup.add(screenMesh)

        // Dark backing plane — sits just behind the screen mesh to block all interior geometry
        const backingW = (scrMax.x - scrMin.x) + 0.4
        const backingH = (scrMax.y - scrMin.y) + 0.4
        const backingCX = (scrMin.x + scrMax.x) / 2
        const backingCY = (scrMin.y + scrMax.y) / 2
        const backingGeo = new THREE.PlaneGeometry(backingW, backingH)
        const backingMat = new THREE.MeshBasicMaterial({ color: 0x000000, toneMapped: false })
        const backingMesh = new THREE.Mesh(backingGeo, backingMat)
        backingMesh.position.set(backingCX, backingCY, 0.28)
        backingMesh.renderOrder = 0
        phoneGroup.add(backingMesh)

        // Screen glow light removed — was causing interior brightness issues

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
          backingMesh,
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
