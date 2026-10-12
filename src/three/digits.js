import * as THREE from 'three'

// Strokes for number candles, in a ~0.5 x 0.75 box with the baseline at y = 0.
// `line: true` strokes keep sharp corners, the rest are smoothed curves.
const STROKES = {
  0: [{ pts: [[0, 0.75], [0.2, 0.63], [0.23, 0.38], [0.2, 0.12], [0, 0], [-0.2, 0.12], [-0.23, 0.38], [-0.2, 0.63], [0, 0.75]] }],
  1: [{ pts: [[-0.13, 0.57], [0.03, 0.75], [0.03, 0]], line: true }],
  2: [
    { pts: [[-0.2, 0.56], [-0.08, 0.72], [0.1, 0.73], [0.21, 0.58], [0.17, 0.41], [-0.02, 0.22], [-0.21, 0.02]] },
    { pts: [[-0.21, 0], [0.23, 0]], line: true },
  ],
  3: [
    { pts: [[-0.2, 0.64], [-0.04, 0.75], [0.15, 0.72], [0.2, 0.56], [0.08, 0.42], [-0.05, 0.4]] },
    { pts: [[-0.05, 0.4], [0.13, 0.37], [0.23, 0.22], [0.18, 0.05], [0, -0.01], [-0.2, 0.08]] },
  ],
  4: [{ pts: [[0.1, 0], [0.1, 0.75], [-0.22, 0.22], [0.24, 0.22]], line: true }],
  5: [
    { pts: [[0.2, 0.75], [-0.15, 0.75], [-0.18, 0.42]], line: true },
    { pts: [[-0.18, 0.42], [0.05, 0.47], [0.21, 0.33], [0.19, 0.1], [0, 0], [-0.2, 0.08]] },
  ],
  6: [{ pts: [[0.17, 0.7], [0, 0.75], [-0.18, 0.6], [-0.22, 0.3], [-0.15, 0.06], [0.04, 0], [0.2, 0.12], [0.2, 0.32], [0.03, 0.43], [-0.15, 0.35], [-0.21, 0.25]] }],
  7: [{ pts: [[-0.21, 0.75], [0.22, 0.75], [-0.05, 0]], line: true }],
  8: [{ pts: [[0, 0.4], [0.17, 0.5], [0.17, 0.68], [0, 0.76], [-0.17, 0.68], [-0.17, 0.5], [0, 0.4], [0.21, 0.27], [0.19, 0.07], [0, 0], [-0.19, 0.07], [-0.21, 0.27], [0, 0.4]] }],
  9: [{ pts: [[0.21, 0.5], [0.15, 0.4], [-0.03, 0.33], [-0.2, 0.45], [-0.19, 0.66], [0, 0.76], [0.18, 0.68], [0.22, 0.45], [0.15, 0.15], [-0.02, 0], [-0.17, 0.05]] }],
}

const RADIUS = 0.065
const cache = new Map()

function strokeCurve({ pts, line }) {
  const v = pts.map(([x, y]) => new THREE.Vector3(x, y, 0))
  if (!line) return new THREE.CatmullRomCurve3(v, false, 'centripetal')
  const path = new THREE.CurvePath()
  for (let i = 0; i < v.length - 1; i++) path.add(new THREE.LineCurve3(v[i], v[i + 1]))
  return path
}

export function getDigit(char) {
  if (cache.has(char)) return cache.get(char)
  const strokes = STROKES[char] ?? STROKES[0]
  const tubes = []
  const caps = []
  let top = new THREE.Vector3(0, -Infinity, 0)

  strokes.forEach((stroke) => {
    const curve = strokeCurve(stroke)
    tubes.push(new THREE.TubeGeometry(curve, stroke.line ? 24 * stroke.pts.length : 64, RADIUS, 14, false))
    stroke.pts.forEach(([x, y]) => {
      if (y > top.y) top = new THREE.Vector3(x, y, 0)
    })
    caps.push(curve.getPoint(0), curve.getPoint(1))
    if (stroke.line) stroke.pts.forEach(([x, y]) => caps.push(new THREE.Vector3(x, y, 0)))
  })

  const digit = { tubes, caps, wick: new THREE.Vector3(top.x, top.y + RADIUS, 0), radius: RADIUS }
  cache.set(char, digit)
  return digit
}
