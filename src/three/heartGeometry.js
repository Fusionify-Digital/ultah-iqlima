import * as THREE from 'three'

let cached = null

export function getHeartGeometry() {
  if (cached) return cached

  const s = new THREE.Shape()
  s.moveTo(0.25, 0.25)
  s.bezierCurveTo(0.25, 0.25, 0.2, 0, 0, 0)
  s.bezierCurveTo(-0.3, 0, -0.3, 0.35, -0.3, 0.35)
  s.bezierCurveTo(-0.3, 0.55, -0.1, 0.77, 0.25, 0.95)
  s.bezierCurveTo(0.6, 0.77, 0.8, 0.55, 0.8, 0.35)
  s.bezierCurveTo(0.8, 0.35, 0.8, 0, 0.5, 0)
  s.bezierCurveTo(0.35, 0, 0.25, 0.25, 0.25, 0.25)

  const geometry = new THREE.ExtrudeGeometry(s, {
    depth: 0.18,
    bevelEnabled: true,
    bevelSegments: 5,
    bevelSize: 0.07,
    bevelThickness: 0.07,
    curveSegments: 24,
  })
  geometry.center()
  geometry.rotateZ(Math.PI)
  geometry.computeVertexNormals()

  cached = geometry
  return geometry
}
