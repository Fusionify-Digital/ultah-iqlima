import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Billboard } from '@react-three/drei'
import * as THREE from 'three'

const { damp } = THREE.MathUtils

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uWind;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vec3 p = position;
    float h = uv.y * uv.y;
    float sway = sin(uTime * 6.0 + uSeed) * 0.010 + sin(uTime * 13.7 + uSeed * 2.3) * 0.006;
    p.x += (sway + uWind * 0.11) * h;
    p.y *= 1.0 + uWind * 0.25;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
  }
`

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;
  uniform float uSeed;
  varying vec2 vUv;

  void main() {
    float flicker = 1.0 + sin(uTime * 10.0 + uSeed) * 0.05 + sin(uTime * 23.0 + uSeed * 3.1) * 0.035;
    float y = vUv.y / flicker;
    float x = (vUv.x - 0.5) * 2.0;

    // Teardrop: round bottom, long tapering tip.
    float base = 0.24;
    float r = y < base
      ? sqrt(max(0.0, 1.0 - pow((y - base) / base, 2.0)))
      : pow(max(0.0, 1.0 - (y - base) / (1.0 - base)), 1.35);
    r *= 0.92;

    float d = abs(x) / max(r, 1e-3);
    float shape = (1.0 - smoothstep(0.45, 1.0, d)) * step(0.0, y) * (1.0 - step(1.0, y));
    float core = (1.0 - smoothstep(0.0, 0.65, d)) * (1.0 - smoothstep(0.12, 0.7, y));

    // Kept saturated (not HDR-white) so the flame still reads against a light pink background.
    vec3 outer = mix(vec3(1.0, 0.55, 0.1), vec3(0.95, 0.22, 0.04), smoothstep(0.3, 1.0, y));
    vec3 col = mix(outer, vec3(1.0, 0.93, 0.62), core);
    float rim = smoothstep(0.55, 0.95, d);
    col = mix(col, vec3(0.82, 0.16, 0.03), rim * 0.75);
    float blue = (1.0 - smoothstep(0.0, 0.14, y)) * smoothstep(0.15, 0.85, d);
    col = mix(col, vec3(0.25, 0.4, 1.0), blue * 0.85);

    gl_FragColor = vec4(col * (1.0 + core * 0.9), shape * uIntensity);
  }
`

let smokeTexture = null
function getSmokeTexture() {
  if (smokeTexture) return smokeTexture
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.45, 'rgba(255,255,255,0.45)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  smokeTexture = new THREE.CanvasTexture(canvas)
  return smokeTexture
}

let haloTexture = null
function getHaloTexture() {
  if (haloTexture) return haloTexture
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,170,60,0.9)')
  g.addColorStop(0.35, 'rgba(255,120,40,0.35)')
  g.addColorStop(1, 'rgba(255,120,40,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  haloTexture = new THREE.CanvasTexture(canvas)
  haloTexture.colorSpace = THREE.SRGBColorSpace
  return haloTexture
}

function Smoke({ active }) {
  const group = useRef()
  const start = useRef(null)
  const puffs = useMemo(
    () =>
      Array.from({ length: 10 }, (_, i) => ({
        delay: 0.12 + i * 0.09,
        life: 1.8 + Math.random() * 0.9,
        drift: (Math.random() - 0.5) * 0.12,
        phase: Math.random() * Math.PI * 2,
        material: new THREE.SpriteMaterial({
          map: getSmokeTexture(),
          color: '#9b8a92',
          transparent: true,
          opacity: 0,
          depthWrite: false,
        }),
      })),
    [],
  )
  useEffect(() => () => puffs.forEach((p) => p.material.dispose()), [puffs])

  useFrame((state) => {
    const g = group.current
    if (!active) {
      start.current = null
      g.visible = false
      return
    }
    start.current ??= state.clock.elapsedTime
    const t = state.clock.elapsedTime - start.current
    g.visible = t < 4
    g.children.forEach((sprite, i) => {
      const p = puffs[i]
      const age = t - p.delay
      if (age < 0 || age > p.life) {
        p.material.opacity = 0
        return
      }
      const k = age / p.life
      sprite.position.set(Math.sin(age * 2.4 + p.phase) * 0.06 * k + p.drift * k, 0.04 + age * 0.3, 0)
      const s = 0.05 + k * 0.34
      sprite.scale.set(s, s * 1.35, 1)
      p.material.opacity = 0.45 * Math.min(1, age * 5) * (1 - k) * (1 - k)
    })
  })

  return (
    <group ref={group} visible={false}>
      {puffs.map((p, i) => (
        <sprite key={i} material={p.material} raycast={() => null} />
      ))}
    </group>
  )
}

export function Flame({ lit, scale = 1, ...props }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 1 },
          uWind: { value: 0 },
          uSeed: { value: Math.random() * 100 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthWrite: false,
      }),
    [],
  )
  const haloMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        map: getHaloTexture(),
        transparent: true,
        depthWrite: false,
        toneMapped: false,
      }),
    [],
  )
  useEffect(
    () => () => {
      material.dispose()
      haloMaterial.dispose()
    },
    [material, haloMaterial],
  )

  const halo = useRef()
  useFrame((state, delta) => {
    const u = material.uniforms
    const t = state.clock.elapsedTime
    u.uTime.value = t
    u.uWind.value = damp(u.uWind.value, lit ? 0 : 1, lit ? 3 : 16, delta)
    u.uIntensity.value = damp(u.uIntensity.value, lit ? 1 : 0, lit ? 3 : 6, delta)
    const pulse = 1 + Math.sin(t * 9 + u.uSeed.value) * 0.06 + Math.sin(t * 21 + u.uSeed.value) * 0.04
    haloMaterial.opacity = u.uIntensity.value * 0.75
    halo.current.scale.setScalar(scale * pulse)
  })

  return (
    <group {...props}>
      <Billboard lockX lockZ>
        <mesh ref={halo} material={haloMaterial} position={[0, 0.12 * scale, -0.01]} raycast={() => null}>
          <planeGeometry args={[0.42, 0.5]} />
        </mesh>
        <mesh material={material} position={[0, 0.16 * scale, 0]} scale={scale} raycast={() => null}>
          <planeGeometry args={[0.14, 0.32, 1, 10]} />
        </mesh>
      </Billboard>
      <Smoke active={!lit} />
    </group>
  )
}
