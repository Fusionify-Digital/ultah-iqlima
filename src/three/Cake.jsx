import { useMemo, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { LilyHead, RoseHead } from './Flowers.jsx'
import { Flame } from './Flame.jsx'
import { getDigit } from './digits.js'
import { getMaterial, unitCylinder, unitSphere } from './shared.js'

const { damp } = THREE.MathUtils

const TOP_TIER_TOP = 1.92
const WHITE = '#fffafb'
const PINK = '#ffb8ca'
const CANDLE_COLORS = ['#ffffff', '#ffc2d1']

const PLATE_FLOWERS = Array.from({ length: 8 }, (_, i) => {
  const a = (i / 8) * Math.PI * 2 + Math.PI / 8
  return {
    position: [Math.cos(a) * 1.9, 0.16, Math.sin(a) * 1.9],
    rotation: [Math.sin(a) * 0.35, i * 1.3, -Math.cos(a) * 0.35],
    kind: i % 2 === 0 ? 'rose' : 'lily',
    color: ['#ff7096', '#fff3f5', '#ffb3c7', '#e8457a'][(i / 2) % 4],
    tint: i % 4 === 1 ? 'pink' : 'white',
  }
})

function ring(count, radius, y, offset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const a = (i / count) * Math.PI * 2 + offset
    return [Math.cos(a) * radius, y, Math.sin(a) * radius]
  })
}

const HITBOX = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false })
const _flame = new THREE.Vector3()

// One invisible zone over all candles; a click blows out the lit flame closest to the pointer ray,
// so candles standing in front of each other never steal or block clicks.
function BlowZone({ lit, anchors, onBlow }) {
  const [hovered, setHovered] = useState(false)
  const anyLit = lit.some(Boolean)
  useCursor(hovered && anyLit)

  const blowNearest = (e) => {
    let best = -1
    let bestDist = Infinity
    lit.forEach((on, i) => {
      const anchor = anchors.current[i]
      if (!on || !anchor) return
      const d = e.ray.distanceSqToPoint(anchor.getWorldPosition(_flame))
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    if (best < 0) return
    e.stopPropagation()
    onBlow(best)
  }

  return (
    <mesh
      material={HITBOX}
      position={[0, TOP_TIER_TOP + 0.75, 0]}
      onClick={blowNearest}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <cylinderGeometry args={[1.2, 1.2, 1.5, 24]} />
    </mesh>
  )
}

function Candle({ position, lit, color, anchorRef }) {
  const wax = getMaterial(color, { roughness: 0.45, clearcoat: 0.3 })
  const stripe = getMaterial('#ff8fab', { roughness: 0.45 })
  return (
    <group position={position}>
      <group ref={anchorRef} position={[0, 0.7, 0]} />
      <mesh geometry={unitCylinder} material={wax} position={[0, 0.27, 0]} scale={[0.05, 0.54, 0.05]} />
      {[0.12, 0.27, 0.42].map((y) => (
        <mesh key={y} geometry={unitCylinder} material={stripe} position={[0, y, 0]} scale={[0.052, 0.035, 0.052]} />
      ))}
      <mesh geometry={unitCylinder} material={getMaterial('#2b1a1a')} position={[0, 0.575, 0]} scale={[0.008, 0.05, 0.008]} />
      <Flame lit={lit} position={[0, 0.6, 0]} scale={0.85} />
    </group>
  )
}

function NumberCandle({ char, position, lit, anchorRef }) {
  const digit = getDigit(char)
  const wax = getMaterial('#ff8fab', { roughness: 0.3, metalness: 0.15, clearcoat: 0.8, clearcoatRoughness: 0.15 })
  const wick = getMaterial('#2b1a1a')
  return (
    <group position={position}>
      <group position={[0, digit.radius, 0]}>
        <group ref={anchorRef} position={[digit.wick.x, digit.wick.y + 0.17, 0]} />
        {digit.tubes.map((g, i) => (
          <mesh key={i} geometry={g} material={wax} />
        ))}
        {digit.caps.map((p, i) => (
          <mesh key={i} geometry={unitSphere} material={wax} position={p} scale={digit.radius} />
        ))}
        <mesh geometry={unitCylinder} material={wick} position={[digit.wick.x, digit.wick.y + 0.025, 0]} scale={[0.008, 0.05, 0.008]} />
        <Flame lit={lit} position={[digit.wick.x, digit.wick.y + 0.05, 0]} />
      </group>
    </group>
  )
}

function CandleGlow({ ratio }) {
  const light = useRef()
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const target = ratio * (3 + Math.sin(t * 17) * 0.25 + Math.sin(t * 29) * 0.15)
    light.current.intensity = damp(light.current.intensity, target, 6, delta)
  })
  return <pointLight ref={light} position={[0, TOP_TIER_TOP + 1.1, 0.3]} color="#ffb35c" distance={6} decay={2} />
}

const DRIP_LENGTH = 0.25

export default function Cake({ digits, lit, onBlow, ...props }) {
  const shared = useMemo(
    () => ({
      icing: getMaterial(WHITE, { roughness: 0.35, clearcoat: 0.4, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: '#ffffff' }),
      pearl: getMaterial('#ffe3ea', { roughness: 0.2, metalness: 0.35, clearcoat: 1 }),
      cherry: getMaterial('#d7263d', { roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05 }),
      dripGeo: new THREE.CapsuleGeometry(0.07, DRIP_LENGTH, 6, 12),
    }),
    [],
  )
  const pearls = useMemo(() => ring(28, 1.62, 0.22), [])
  const cherries = useMemo(() => ring(6, 0.97, TOP_TIER_TOP + 0.11, Math.PI / 6), [])
  const drips = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2
        const len = 0.12 + ((i * 37) % 10) / 30
        return { pos: [Math.cos(a) * 1.1, TOP_TIER_TOP - len / 2 - 0.02, Math.sin(a) * 1.1], len }
      }),
    [],
  )
  const smallCount = lit.length - digits.length
  const smallCandles = useMemo(() => ring(smallCount, 0.8, TOP_TIER_TOP, 0), [smallCount])
  const litRatio = lit.filter(Boolean).length / lit.length
  const anchors = useRef([])

  return (
    <group {...props}>
      <CandleGlow ratio={litRatio} />

      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[2.2, 2.05, 0.12, 64]} />
        <meshPhysicalMaterial color="#ffffff" roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>

      <mesh position={[0, 0.62, 0]}>
        <cylinderGeometry args={[1.6, 1.6, 1, 64]} />
        <meshPhysicalMaterial color={WHITE} roughness={0.6} sheen={0.6} sheenColor="#ffe3ea" />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]} material={getMaterial(PINK, { roughness: 0.4, clearcoat: 0.3 })}>
        <torusGeometry args={[1.55, 0.1, 16, 80]} />
      </mesh>
      {pearls.map((p, i) => (
        <mesh key={i} position={p} geometry={unitSphere} material={shared.pearl} scale={0.09} />
      ))}

      <mesh position={[0, 1.52, 0]}>
        <cylinderGeometry args={[1.1, 1.1, 0.8, 64]} />
        <meshPhysicalMaterial color={PINK} roughness={0.55} sheen={0.6} sheenColor="#ffffff" />
      </mesh>
      <mesh position={[0, TOP_TIER_TOP + 0.01, 0]} material={shared.icing}>
        <cylinderGeometry args={[1.13, 1.13, 0.06, 64]} />
      </mesh>
      {drips.map((d, i) => (
        <mesh key={i} position={d.pos} scale={[1, d.len / DRIP_LENGTH, 1]} geometry={shared.dripGeo} material={shared.icing} />
      ))}
      {cherries.map((p, i) => (
        <mesh key={i} position={p} geometry={unitSphere} material={shared.cherry} scale={0.11} />
      ))}

      {PLATE_FLOWERS.map((f, i) =>
        f.kind === 'rose' ? (
          <RoseHead key={i} color={f.color} position={f.position} rotation={f.rotation} scale={0.75} />
        ) : (
          <LilyHead key={i} tint={f.tint} position={f.position} rotation={f.rotation} scale={0.6} />
        ),
      )}

      {Array.from(digits).map((char, i) => (
        <NumberCandle
          key={`d${i}`}
          char={char}
          position={[(i - (digits.length - 1) / 2) * 0.6, TOP_TIER_TOP + 0.04, -0.12]}
          lit={lit[i]}
          anchorRef={(el) => (anchors.current[i] = el)}
        />
      ))}
      {smallCandles.map((p, i) => {
        const index = digits.length + i
        return (
          <Candle
            key={`c${i}`}
            position={p}
            lit={lit[index]}
            color={CANDLE_COLORS[i % CANDLE_COLORS.length]}
            anchorRef={(el) => (anchors.current[index] = el)}
          />
        )
      })}
      <BlowZone lit={lit} anchors={anchors} onBlow={onBlow} />
    </group>
  )
}
