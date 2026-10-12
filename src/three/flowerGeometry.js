import * as THREE from 'three'

const cache = new Map()

function memo(key, create) {
  if (!cache.has(key)) cache.set(key, create())
  return cache.get(key)
}

// Unit-sized petal (1 x 1) whose base sits at the origin and faces +z.
// `cup` curls the side edges inward, `curl` bends the tip outward.
function bentPetal({ profile, cup, curl, colorAt }) {
  const g = new THREE.PlaneGeometry(1, 1, 10, 12)
  g.translate(0, 0.5, 0)
  const pos = g.attributes.position
  const colors = colorAt ? new Float32Array(pos.count * 3) : null
  const c = new THREE.Color()

  for (let i = 0; i < pos.count; i++) {
    const t = pos.getY(i)
    const u = pos.getX(i) * 2
    const x = u * 0.5 * profile(t)
    const z = -cup * u * u * 0.5 + curl * t * t
    pos.setXYZ(i, x, t, z)
    if (colors) {
      colorAt(u, t, c)
      c.toArray(colors, i * 3)
    }
  }
  if (colors) g.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  g.computeVertexNormals()
  return g
}

const ROSE_SHAPES = {
  inner: { cup: 0.55, curl: -0.08 },
  mid: { cup: 0.45, curl: 0.15 },
  outer: { cup: 0.3, curl: 0.42 },
}

export function getRosePetal(kind) {
  return memo(`rose-${kind}`, () =>
    bentPetal({
      ...ROSE_SHAPES[kind],
      profile: (t) => 0.35 + 0.65 * Math.sin(t * Math.PI * 0.75),
    }),
  )
}

const LILY_TINTS = {
  pink: { edge: '#fffaf5', center: '#e8457a' },
  white: { edge: '#ffffff', center: '#ffd6e0' },
}

export function getLilyPetal(tint = 'pink') {
  return memo(`lily-${tint}`, () => {
    const edge = new THREE.Color(LILY_TINTS[tint].edge)
    const center = new THREE.Color(LILY_TINTS[tint].center)
    const throat = new THREE.Color('#e9f2a6')
    return bentPetal({
      cup: 0.22,
      curl: 0.5,
      profile: (t) => Math.pow(Math.sin(Math.PI * (0.06 + 0.94 * t)), 0.7),
      colorAt: (u, t, out) => {
        const stripe = Math.max(0, 1 - Math.abs(u) * 1.4) * (1 - t * 0.55)
        out.copy(edge).lerp(center, stripe)
        if (t < 0.15) out.lerp(throat, 1 - t / 0.15)
      },
    })
  })
}

export function getLeaf() {
  return memo('leaf', () =>
    bentPetal({
      cup: 0.3,
      curl: 0.25,
      profile: (t) => Math.pow(Math.sin(Math.PI * (0.04 + 0.96 * t)), 0.8),
    }),
  )
}
