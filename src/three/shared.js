import * as THREE from 'three'

const materials = new Map()

// Any `sheen` or `clearcoat` option switches to MeshPhysicalMaterial (velvet petals, fur, glossy icing).
export function getMaterial(color, options = {}) {
  const {
    roughness = 0.5,
    metalness = 0,
    side = THREE.FrontSide,
    vertexColors = false,
    sheen = 0,
    sheenColor = color,
    sheenRoughness = 0.6,
    clearcoat = 0,
    clearcoatRoughness = 0.2,
  } = options
  const key = [color, roughness, metalness, side, vertexColors, sheen, sheenColor, sheenRoughness, clearcoat, clearcoatRoughness].join('|')

  if (!materials.has(key)) {
    const base = { color, roughness, metalness, side, vertexColors }
    const physical = sheen > 0 || clearcoat > 0
    materials.set(
      key,
      physical
        ? new THREE.MeshPhysicalMaterial({ ...base, sheen, sheenColor, sheenRoughness, clearcoat, clearcoatRoughness })
        : new THREE.MeshStandardMaterial(base),
    )
  }
  return materials.get(key)
}

export const unitSphere = new THREE.SphereGeometry(1, 32, 24)
export const unitCylinder = new THREE.CylinderGeometry(1, 1, 1, 12)
export const unitCone = new THREE.ConeGeometry(1, 1, 24)

// Critically-damped-ish spring step; returns the new value and mutates `state.v`.
export function springStep(x, target, state, delta, stiffness = 120, damping = 14) {
  const dt = Math.min(delta, 1 / 30)
  state.v += (target - x) * stiffness * dt
  state.v *= Math.exp(-damping * dt)
  return x + state.v * dt
}
