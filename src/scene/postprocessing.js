import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { SMAAPass } from 'three/addons/postprocessing/SMAAPass.js'

// Color grading shader — math-based LUT presets
const ColorGradeShader = {
  uniforms: {
    tDiffuse: { value: null },
    intensity: { value: 0.0 },
    preset: { value: 0 },     // 0=none, 1=cinematic warm, 2=cool blue, 3=vintage, 4=noir, 5=teal-orange, 6=cross-process, 7=faded film
    saturation: { value: 1.0 },
    temperature: { value: 0.0 },  // -1 cool, +1 warm
    tint: { value: 0.0 },         // -1 green, +1 magenta
    gamma: { value: 1.0 },
    shadows: { value: 0.0 },      // lift shadows
    highlights: { value: 0.0 },   // push highlights
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float intensity;
    uniform float preset;
    uniform float saturation;
    uniform float temperature;
    uniform float tint;
    uniform float gamma;
    uniform float shadows;
    uniform float highlights;
    varying vec2 vUv;

    vec3 adjustSaturation(vec3 c, float s) {
      float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      return mix(vec3(luma), c, s);
    }

    vec3 adjustTemp(vec3 c, float temp, float tnt) {
      c.r += temp * 0.05;
      c.b -= temp * 0.05;
      c.g += tnt * 0.03;
      return c;
    }

    vec3 liftGammaGain(vec3 c, float sh, float gm, float hi) {
      c = c + sh * 0.1;
      c = pow(max(c, 0.0), vec3(1.0 / max(gm, 0.01)));
      c = c * (1.0 + hi * 0.2);
      return c;
    }

    // Preset color grades
    vec3 cinematicWarm(vec3 c) {
      c = adjustSaturation(c, 0.85);
      c.r *= 1.08; c.g *= 1.02; c.b *= 0.88;
      c = pow(max(c, 0.0), vec3(0.95));
      return c;
    }
    vec3 coolBlue(vec3 c) {
      c = adjustSaturation(c, 0.9);
      c.r *= 0.9; c.g *= 0.97; c.b *= 1.15;
      c = pow(max(c, 0.0), vec3(1.05));
      return c;
    }
    vec3 vintage(vec3 c) {
      c = adjustSaturation(c, 0.7);
      c.r *= 1.1; c.g *= 1.0; c.b *= 0.85;
      c = c + vec3(0.02, 0.01, 0.0);
      c = pow(max(c, 0.0), vec3(0.92));
      return c;
    }
    vec3 noir(vec3 c) {
      float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      c = mix(vec3(luma), c, 0.15);
      c = pow(max(c, 0.0), vec3(1.15));
      c *= 1.1;
      return c;
    }
    vec3 tealOrange(vec3 c) {
      float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
      vec3 shadow = vec3(0.0, 0.12, 0.14);
      vec3 highlight = vec3(0.16, 0.10, 0.0);
      c = c + shadow * (1.0 - luma) + highlight * luma;
      c = adjustSaturation(c, 1.1);
      return c;
    }
    vec3 crossProcess(vec3 c) {
      c.r = smoothstep(0.0, 1.0, c.r * 1.1);
      c.g = smoothstep(-0.05, 1.05, c.g);
      c.b = smoothstep(0.1, 0.9, c.b);
      c = adjustSaturation(c, 1.2);
      return c;
    }
    vec3 fadedFilm(vec3 c) {
      c = adjustSaturation(c, 0.75);
      c = mix(vec3(0.06, 0.05, 0.07), c, 0.92);
      c.r *= 1.03;
      c = pow(max(c, 0.0), vec3(0.93));
      return c;
    }

    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec3 original = texel.rgb;
      vec3 c = texel.rgb;

      // Global adjustments
      c = adjustSaturation(c, saturation);
      c = adjustTemp(c, temperature, tint);
      c = liftGammaGain(c, shadows, gamma, highlights);

      // Apply preset
      int p = int(preset + 0.5);
      vec3 graded = c;
      if (p == 1) graded = cinematicWarm(c);
      else if (p == 2) graded = coolBlue(c);
      else if (p == 3) graded = vintage(c);
      else if (p == 4) graded = noir(c);
      else if (p == 5) graded = tealOrange(c);
      else if (p == 6) graded = crossProcess(c);
      else if (p == 7) graded = fadedFilm(c);

      if (p > 0) {
        c = mix(c, graded, intensity);
      }

      gl_FragColor = vec4(clamp(c, 0.0, 1.0), texel.a);
    }
  `,
}

// Vignette shader
const VignetteShader = {
  uniforms: {
    tDiffuse: { value: null },
    offset: { value: 1.0 },
    darkness: { value: 1.2 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float offset;
    uniform float darkness;
    varying vec2 vUv;
    void main() {
      vec4 texel = texture2D(tDiffuse, vUv);
      vec2 uv = (vUv - vec2(0.5)) * vec2(offset);
      float vignette = 1.0 - dot(uv, uv);
      texel.rgb *= mix(1.0 - darkness, 1.0, vignette);
      gl_FragColor = texel;
    }
  `,
}

export function createPostProcessing(renderer, scene, camera) {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    0.06, // strength
    0.3,  // radius
    0.92  // threshold
  )
  composer.addPass(bloomPass)

  const colorGradePass = new ShaderPass(ColorGradeShader)
  colorGradePass.uniforms.preset.value = 0       // None
  colorGradePass.uniforms.intensity.value = 0.3
  colorGradePass.uniforms.saturation.value = 0.97
  colorGradePass.uniforms.temperature.value = -0.05
  colorGradePass.uniforms.tint.value = 0
  colorGradePass.uniforms.gamma.value = 1.14
  colorGradePass.uniforms.shadows.value = -0.04
  colorGradePass.uniforms.highlights.value = 0.23
  composer.addPass(colorGradePass)

  const vignettePass = new ShaderPass(VignetteShader)
  vignettePass.uniforms.offset.value = 1.0
  vignettePass.uniforms.darkness.value = 1.2
  composer.addPass(vignettePass)

  const smaaPass = new SMAAPass(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio())
  composer.addPass(smaaPass)

  return { composer, bloomPass, vignettePass, colorGradePass }
}
