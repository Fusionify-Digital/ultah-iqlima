import { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { getHeartGeometry } from './heartGeometry.js'
import { getMaterial, unitCone, unitCylinder, unitSphere } from './shared.js'

const { damp } = THREE.MathUtils

const INK = '#3a1f2b'
const BOW = '#ff6f91'
const HITBOX = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
const BLUSH = new THREE.MeshBasicMaterial({ color: '#ff8fab', transparent: true, opacity: 0.6, depthWrite: false })
const smile = new THREE.TorusGeometry(0.032, 0.008, 8, 16, Math.PI)
const tooth = new THREE.BoxGeometry(1, 1, 1)
const catTail = new THREE.TubeGeometry(
  new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(0.12, 0.12, -0.06),
    new THREE.Vector3(0.26, 0.32, -0.04),
    new THREE.Vector3(0.2, 0.52, 0.02),
  ]),
  32,
  0.05,
  12,
)

const fur = (color, sheenColor = '#ffffff') =>
  getMaterial(color, { roughness: 0.85, sheen: 1, sheenColor, sheenRoughness: 0.75 })

function Eyes({ spread, y, z, size = 0.056 }) {
  const ref = useRef()
  const seed = useMemo(() => Math.random() * 10, [])
  useFrame((state) => {
    const cycle = (state.clock.elapsedTime + seed) % 3.8
    const open = cycle < 0.18 ? 1 - Math.sin((cycle / 0.18) * Math.PI) * 0.9 : 1
    ref.current.children.forEach((eye) => (eye.scale.y = open))
  })
  const black = getMaterial(INK, { roughness: 0.15, clearcoat: 1 })
  const white = getMaterial('#ffffff', { roughness: 0.1 })
  return (
    <group ref={ref}>
      {[-1, 1].map((side) => (
        <group key={side} position={[side * spread, y, z]}>
          <mesh geometry={unitSphere} material={black} scale={[size, size * 1.18, size * 0.6]} />
          <mesh geometry={unitSphere} material={white} position={[size * 0.35, size * 0.42, size * 0.45]} scale={size * 0.33} />
        </group>
      ))}
    </group>
  )
}

function Face({ eyeSpread, eyeY, eyeZ, blushX, blushY, blushZ, mouthY, mouthZ }) {
  const ink = getMaterial(INK)
  return (
    <>
      <Eyes spread={eyeSpread} y={eyeY} z={eyeZ} />
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          geometry={unitSphere}
          material={BLUSH}
          position={[side * blushX, blushY, blushZ]}
          rotation={[0, side * 0.55, 0]}
          scale={[0.065, 0.04, 0.012]}
        />
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={smile} material={ink} position={[side * 0.032, mouthY, mouthZ]} rotation={[0, 0, Math.PI]} />
      ))}
    </>
  )
}

function Bow({ color = BOW, ...props }) {
  const satin = getMaterial(color, { roughness: 0.35, sheen: 1, sheenColor: '#ffffff', sheenRoughness: 0.3 })
  return (
    <group {...props}>
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={unitSphere} material={satin} position={[side * 0.07, 0, 0]} rotation={[0, 0, side * 0.45]} scale={[0.08, 0.055, 0.035]} />
      ))}
      <mesh geometry={unitSphere} material={satin} scale={0.032} />
    </group>
  )
}

function Twitch({ base = [0, 0, 0], amount = 0.18, children, ...props }) {
  const ref = useRef()
  const seed = useMemo(() => Math.random() * 20, [])
  useFrame((state) => {
    const cycle = (state.clock.elapsedTime + seed) % 4.5
    const flick = cycle < 0.35 ? Math.sin((cycle / 0.35) * Math.PI * 2) * amount * (1 - cycle / 0.35) : 0
    ref.current.rotation.set(base[0] + flick * 0.4, base[1], base[2] + flick)
  })
  return (
    <group ref={ref} {...props}>
      {children}
    </group>
  )
}

function CatParts({ headRef }) {
  const coat = fur('#fffaf7', '#ffe3ea')
  const cream = fur('#ffeef2')
  const pink = getMaterial('#ff9ab3', { roughness: 0.5 })
  const ink = getMaterial(INK)
  const tail = useRef()
  useFrame((state) => {
    const t = state.clock.elapsedTime
    tail.current.rotation.z = Math.sin(t * 1.8) * 0.28 + Math.sin(t * 3.1) * 0.06
    tail.current.rotation.x = Math.sin(t * 1.2) * 0.08
  })

  return (
    <>
      <mesh geometry={unitSphere} material={coat} position={[0, 0.4, 0]} scale={[0.42, 0.4, 0.38]} />
      <mesh geometry={unitSphere} material={cream} position={[0, 0.36, 0.2]} scale={[0.27, 0.28, 0.2]} />
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={unitSphere} material={coat} position={[side * 0.15, 0.07, 0.28]} scale={[0.1, 0.08, 0.12]} />
      ))}
      <group ref={tail} position={[0.2, 0.18, -0.3]}>
        <mesh geometry={catTail} material={coat} />
      </group>

      <group ref={headRef} position={[0, 0.98, 0]}>
        <mesh geometry={unitSphere} material={coat} scale={[0.42, 0.36, 0.36]} />
        <mesh geometry={unitSphere} material={cream} position={[0, -0.09, 0.27]} scale={[0.16, 0.1, 0.1]} />
        <mesh geometry={unitSphere} material={pink} position={[0, -0.05, 0.37]} scale={[0.03, 0.022, 0.02]} />
        <Face eyeSpread={0.14} eyeY={0.03} eyeZ={0.315} blushX={0.24} blushY={-0.07} blushZ={0.29} mouthY={-0.115} mouthZ={0.365} />
        {[-1, 1].map((side) => (
          <group key={side}>
            <mesh geometry={unitCylinder} material={ink} position={[side * 0.3, -0.06, 0.25]} rotation={[0, 0, Math.PI / 2 + side * 0.12]} scale={[0.004, 0.2, 0.004]} />
            <mesh geometry={unitCylinder} material={ink} position={[side * 0.3, -0.1, 0.25]} rotation={[0, 0, Math.PI / 2 - side * 0.08]} scale={[0.004, 0.2, 0.004]} />
          </group>
        ))}
        {[-1, 1].map((side) => (
          <Twitch key={side} position={[side * 0.24, 0.27, 0]} base={[0, 0, -side * 0.38]} amount={side * 0.2}>
            <mesh geometry={unitCone} material={coat} position={[0, 0.08, 0]} scale={[0.12, 0.22, 0.08]} />
            <mesh geometry={unitCone} material={pink} position={[0, 0.06, 0.035]} scale={[0.07, 0.14, 0.03]} />
          </Twitch>
        ))}
        <Bow position={[0.13, 0.3, 0.12]} rotation={[0.2, 0, -0.35]} />
      </group>
    </>
  )
}

function BunnyParts({ headRef }) {
  const coat = fur('#ffd1dc')
  const belly = fur('#fffafb')
  const inner = getMaterial('#ff9ab3', { roughness: 0.6 })
  const nose = getMaterial('#ff6f91', { roughness: 0.4 })
  const white = getMaterial('#ffffff', { roughness: 0.3 })

  return (
    <>
      <mesh geometry={unitSphere} material={coat} position={[0, 0.4, 0]} scale={[0.4, 0.4, 0.37]} />
      <mesh geometry={unitSphere} material={belly} position={[0, 0.36, 0.19]} scale={[0.25, 0.27, 0.2]} />
      {[-1, 1].map((side) => (
        <mesh key={`f${side}`} geometry={unitSphere} material={belly} position={[side * 0.17, 0.05, 0.22]} scale={[0.12, 0.06, 0.17]} />
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`p${side}`} geometry={unitSphere} material={coat} position={[side * 0.12, 0.22, 0.31]} scale={[0.08, 0.08, 0.09]} />
      ))}
      <mesh geometry={unitSphere} material={belly} position={[0, 0.25, -0.36]} scale={0.12} />

      <group ref={headRef} position={[0, 0.98, 0]}>
        <mesh geometry={unitSphere} material={coat} scale={[0.38, 0.34, 0.34]} />
        {[-1, 1].map((side) => (
          <mesh key={side} geometry={unitSphere} material={belly} position={[side * 0.055, -0.09, 0.27]} scale={[0.08, 0.065, 0.06]} />
        ))}
        <mesh geometry={unitSphere} material={nose} position={[0, -0.04, 0.335]} scale={[0.03, 0.022, 0.02]} />
        {[-1, 1].map((side) => (
          <mesh key={side} geometry={tooth} material={white} position={[side * 0.017, -0.16, 0.31]} scale={[0.03, 0.04, 0.01]} />
        ))}
        <Face eyeSpread={0.14} eyeY={0.04} eyeZ={0.295} blushX={0.22} blushY={-0.06} blushZ={0.27} mouthY={-0.115} mouthZ={0.325} />
        {[-1, 1].map((side) => (
          <Twitch
            key={side}
            position={[side * 0.11, 0.26, -0.02]}
            base={side < 0 ? [0, 0, 0.18] : [0.25, 0, -0.95]}
            amount={side * 0.15}
          >
            <mesh geometry={unitSphere} material={coat} position={[0, 0.24, 0]} scale={[0.075, 0.26, 0.05]} />
            <mesh geometry={unitSphere} material={inner} position={[0, 0.24, 0.035]} scale={[0.042, 0.2, 0.02]} />
          </Twitch>
        ))}
        <Bow color="#ffffff" position={[-0.11, 0.3, 0.06]} rotation={[0.2, 0, 0.3]} />
      </group>
    </>
  )
}

function HeartPop({ onDone }) {
  const ref = useRef()
  const start = useRef(null)
  const finished = useRef(false)
  const drift = useMemo(() => (Math.random() - 0.5) * 0.7, [])
  const material = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#ff6f91', emissive: '#ff2d6f', emissiveIntensity: 0.4, transparent: true, roughness: 0.3 }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])

  useFrame((state) => {
    if (finished.current) return
    start.current ??= state.clock.elapsedTime
    const p = (state.clock.elapsedTime - start.current) / 1.4
    if (p >= 1) {
      finished.current = true
      onDone()
      return
    }
    const ease = 1 - Math.pow(1 - p, 3)
    ref.current.position.set(drift * ease + Math.sin(p * 9) * 0.04, 1.45 + ease * 0.95, 0.15)
    ref.current.scale.setScalar(0.13 * Math.sin(Math.min(1, p * 3) * Math.PI * 0.5))
    ref.current.rotation.y = Math.sin(p * 6) * 0.6
    material.opacity = 1 - p * p
  })

  return <mesh ref={ref} geometry={getHeartGeometry()} material={material} scale={0.001} />
}

const BALLOON_TIME = 5.5

function HeartBalloon({ onDone }) {
  const ref = useRef()
  const start = useRef(null)
  const finished = useRef(false)
  const material = useMemo(
    () => new THREE.MeshPhysicalMaterial({ color: '#ff6f91', roughness: 0.25, clearcoat: 1, transparent: true }),
    [],
  )
  const string = getMaterial('#ffffff', { roughness: 0.6 })
  useEffect(() => () => material.dispose(), [material])

  useFrame((state) => {
    if (finished.current) return
    start.current ??= state.clock.elapsedTime
    const p = (state.clock.elapsedTime - start.current) / BALLOON_TIME
    if (p >= 1) {
      finished.current = true
      onDone()
      return
    }
    const t = state.clock.elapsedTime
    ref.current.position.set(Math.sin(t * 1.4) * 0.15 * p, 1.4 + p * p * 4.5, 0.1)
    ref.current.rotation.z = Math.sin(t * 1.7) * 0.12
    ref.current.scale.setScalar(Math.min(1, p * 8))
    material.opacity = p > 0.8 ? (1 - p) / 0.2 : 1
  })

  return (
    <group ref={ref} scale={0.001}>
      <mesh geometry={getHeartGeometry()} material={material} position={[0, 0.35, 0]} scale={0.32} />
      <mesh geometry={unitCylinder} material={string} position={[0, -0.05, 0]} scale={[0.006, 0.6, 0.006]} />
    </group>
  )
}

const easeInOutCubic = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)
const PARTY_TIME = 2.4
const SECRET_CLICKS = 5
const _screen = new THREE.Vector3()

// Hop profile: crouch (anticipation) -> airborne arc -> landing squash.
function hopPose(p) {
  if (p < 0.16) return { lift: 0, squash: 0.16 * Math.sin((p / 0.16) * Math.PI * 0.5) }
  if (p < 0.76) {
    const q = (p - 0.16) / 0.6
    return { lift: Math.sin(q * Math.PI) * 0.42, squash: -0.12 * Math.cos(q * Math.PI) ** 2 }
  }
  const q = (p - 0.76) / 0.24
  return { lift: 0, squash: 0.14 * Math.sin(q * Math.PI) }
}

const HOP_TIME = 0.8
const PARTS = { cat: CatParts, bunny: BunnyParts }

export function Critter({ kind, excited = false, lines = [], secret, onSecret, lookAt = 0, interactive = true, ...props }) {
  const Parts = PARTS[kind]
  const bounce = useRef()
  const head = useRef()
  const clock = useThree((s) => s.clock)
  const camera = useThree((s) => s.camera)
  const seed = useMemo(() => Math.random() * 10, [])
  const hopAt = useRef(-10)
  const excitedAt = useRef(null)
  const partyAt = useRef(-10)
  const clicks = useRef([])
  const pose = useRef({ lift: 0, squash: 0 })
  const [pops, setPops] = useState([])
  const [balloons, setBalloons] = useState([])
  const [line, setLine] = useState(null)
  const [secretShown, setSecretShown] = useState(false)
  const lineTimer = useRef(null)
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && interactive)

  useEffect(() => () => clearTimeout(lineTimer.current), [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    if (excited && excitedAt.current === null) excitedAt.current = t + seed * 0.03
    if (!excited) excitedAt.current = null

    let target = { lift: 0, squash: 0 }
    const sinceHop = t - hopAt.current
    const sinceParty = t - partyAt.current
    if (sinceParty < PARTY_TIME) {
      target = hopPose((sinceParty % (PARTY_TIME / 3)) / (PARTY_TIME / 3))
      bounce.current.rotation.y = easeInOutCubic(sinceParty / PARTY_TIME) * Math.PI * 4
    } else if (sinceHop < HOP_TIME) {
      target = hopPose(sinceHop / HOP_TIME)
    } else if (excitedAt.current !== null) {
      const e = t - excitedAt.current
      if (e > 0 && e < HOP_TIME * 4) target = hopPose((e % HOP_TIME) / HOP_TIME)
    }

    const p = pose.current
    p.lift = damp(p.lift, target.lift, 22, delta)
    p.squash = damp(p.squash, target.squash, 16, delta)

    const breathe = Math.sin(t * 2.1 + seed) * 0.018
    const sy = 1 - p.squash + breathe
    const sxz = 1 + p.squash * 0.55 - breathe * 0.4
    bounce.current.position.y = p.lift
    bounce.current.scale.set(sxz, sy, sxz)
    bounce.current.rotation.z = Math.sin(t * 0.9 + seed) * 0.025

    const h = head.current
    h.rotation.y = damp(h.rotation.y, lookAt + state.pointer.x * 0.55, 3.5, delta)
    h.rotation.x = damp(h.rotation.x, -state.pointer.y * 0.25 - p.lift * 0.3, 3.5, delta)
    h.rotation.z = Math.sin(t * 1.3 + seed) * 0.07
  })

  const say = (text, ms) => {
    setLine(text)
    clearTimeout(lineTimer.current)
    lineTimer.current = setTimeout(() => {
      setLine(null)
      setSecretShown(false)
    }, ms)
  }

  const poke = (e) => {
    if (!interactive) return
    e.stopPropagation()
    const t = clock.elapsedTime
    if (t - partyAt.current < PARTY_TIME) return

    const at = e.nativeEvent.timeStamp
    clicks.current = [...clicks.current.filter((c) => at - c < 4000), at]
    if (secret && clicks.current.length >= SECRET_CLICKS) {
      clicks.current = []
      partyAt.current = t
      setPops((p) => [...p, ...Array.from({ length: 6 }, () => Math.random())])
      setBalloons((b) => [...b, Math.random()])
      setSecretShown(true)
      say(secret, 5200)
      bounce.current.getWorldPosition(_screen).project(camera)
      onSecret?.((_screen.x + 1) / 2, (1 - _screen.y) / 2 - 0.12)
      return
    }

    if (t - hopAt.current > HOP_TIME * 0.7) hopAt.current = t
    setPops((p) => [...p, Math.random()])
    if (lines.length) say(lines[Math.floor(Math.random() * lines.length)], 2600)
  }

  return (
    <group {...props}>
      <group
        onClick={poke}
        onPointerOver={(e) => {
          if (!interactive) return
          e.stopPropagation()
          setHovered(true)
        }}
        onPointerOut={() => setHovered(false)}
      >
        {interactive && (
          <mesh material={HITBOX} position={[0, 1.05, 0]}>
            <cylinderGeometry args={[0.55, 0.55, 2.1, 12]} />
          </mesh>
        )}
        <group ref={bounce}>
          <Parts headRef={head} />
        </group>
      </group>
      {pops.map((id) => (
        <HeartPop key={id} onDone={() => setPops((p) => p.filter((x) => x !== id))} />
      ))}
      {balloons.map((id) => (
        <HeartBalloon key={id} onDone={() => setBalloons((b) => b.filter((x) => x !== id))} />
      ))}
      {line && (
        <Html position={[0, 1.75, 0]} center zIndexRange={[20, 10]} style={{ pointerEvents: 'none' }}>
          <div key={line} className={secretShown ? 'bubble bubble--secret' : 'bubble'}>
            {line}
          </div>
        </Html>
      )}
    </group>
  )
}
