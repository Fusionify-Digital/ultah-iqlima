import confetti from 'canvas-confetti'

const COLORS = ['#ff6f91', '#ffc2d1', '#ffffff', '#ff8fab', '#e8457a', '#f3c26b']
const FIREWORK_COLORS = ['#ff6f91', '#ffffff', '#ffc2d1', '#e8457a', '#fff0f4']
const PETAL_COLORS = ['#ff8fab', '#ffd1dc', '#ffffff', '#ff6f91']

let heart = null
let petal = null

function shapes() {
  heart ??= confetti.shapeFromPath({
    path: 'M167 72c19,-38 37,-56 75,-56 42,0 76,33 76,75 0,76 -76,151 -151,227 -76,-76 -151,-151 -151,-227 0,-42 33,-75 75,-75 38,0 57,18 76,56z',
  })
  petal ??= confetti.shapeFromPath({ path: 'M0 0 C 30 -20, 60 10, 50 40 C 40 60, 10 60, 0 0 z' })
  return { heart, petal }
}

const base = { disableForReducedMotion: true, zIndex: 30 }

export function celebrate() {
  const { heart } = shapes()
  const opts = { ...base, colors: COLORS }

  confetti({ ...opts, particleCount: 140, spread: 110, startVelocity: 45, origin: { y: 0.6 }, shapes: [heart, 'circle'], scalar: 1.3 })

  const end = Date.now() + 2200
  const frame = () => {
    confetti({ ...opts, particleCount: 3, angle: 60, spread: 60, origin: { x: 0, y: 0.75 }, shapes: [heart], scalar: 1.2 })
    confetti({ ...opts, particleCount: 3, angle: 120, spread: 60, origin: { x: 1, y: 0.75 }, shapes: [heart], scalar: 1.2 })
    if (Date.now() < end) requestAnimationFrame(frame)
  }
  frame()
}

// A firework burst at a screen point (0..1 coordinates), followed by drifting petals.
export function firework(x, y) {
  const { heart, petal } = shapes()
  const origin = { x, y }
  confetti({
    ...base,
    origin,
    colors: FIREWORK_COLORS,
    particleCount: 45,
    spread: 360,
    startVelocity: 26,
    gravity: 0.55,
    decay: 0.91,
    ticks: 140,
    scalar: 0.8,
    shapes: ['circle', 'star'],
  })
  setTimeout(() => {
    confetti({
      ...base,
      origin,
      colors: FIREWORK_COLORS,
      particleCount: 14,
      spread: 360,
      startVelocity: 12,
      gravity: 0.4,
      decay: 0.9,
      ticks: 110,
      scalar: 1.1,
      shapes: [heart],
    })
  }, 140)
  confetti({
    ...base,
    origin,
    colors: PETAL_COLORS,
    particleCount: 9,
    spread: 160,
    angle: 90,
    startVelocity: 14,
    gravity: 0.35,
    drift: (Math.random() - 0.5) * 1.5,
    ticks: 260,
    scalar: 1.4,
    flat: false,
    shapes: [petal],
  })
}
