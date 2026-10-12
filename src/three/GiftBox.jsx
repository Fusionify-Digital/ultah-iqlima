import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sparkles, useCursor } from '@react-three/drei'
import * as THREE from 'three'
import { Bouquet } from './Flowers.jsx'
import { getMaterial, springStep } from './shared.js'

const { damp } = THREE.MathUtils

const GRAVITY = 9.8
const LID_REST_Y = -0.65 + 0.175
const LAUNCH_AT = 0.2
const BOUQUET_AT = 0.4

function Ribbon({ children, ...props }) {
  return (
    <mesh {...props} material={getMaterial('#ffffff', { roughness: 0.3, sheen: 1, sheenColor: '#ffd6e0', sheenRoughness: 0.25, clearcoat: 0.4 })}>
      {children}
    </mesh>
  )
}

export default function GiftBox({ opened, onOpen }) {
  const group = useRef()
  const body = useRef()
  const lid = useRef()
  const glow = useRef()
  const innerLight = useRef()
  const bouquet = useRef()
  const openedAt = useRef(null)
  const lidState = useRef({ launched: false, resting: false, vel: new THREE.Vector3(), spin: new THREE.Vector3() })
  const bouquetSpring = useRef({ y: { v: 0 }, s: { v: 0 } })
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && !opened)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const g = group.current
    const dt = Math.min(delta, 1 / 30)

    if (!opened) {
      g.position.y = Math.sin(t * 1.4) * 0.08
      g.rotation.y += dt * 0.3
      // Occasional wiggle, as if something inside is moving.
      const c = t % 4.2
      g.rotation.z = c < 0.6 ? Math.sin(c * 30) * 0.04 * (1 - c / 0.6) : 0
      g.scale.setScalar(damp(g.scale.x, hovered ? 1.06 : 1, 8, dt))
      return
    }

    openedAt.current ??= t
    const since = t - openedAt.current

    g.position.y = damp(g.position.y, 0, 6, dt)
    g.rotation.z = damp(g.rotation.z, 0, 8, dt)
    const facing = Math.round(g.rotation.y / (Math.PI / 2)) * (Math.PI / 2)
    g.rotation.y = damp(g.rotation.y, facing, 5, dt)
    g.scale.setScalar(damp(g.scale.x, 1, 8, dt))

    // Anticipation squash before the lid pops.
    const squash = since < LAUNCH_AT ? Math.sin((since / LAUNCH_AT) * Math.PI) * 0.1 : 0
    body.current.scale.set(1 + squash * 0.5, 1 - squash, 1 + squash * 0.5)

    const s = lidState.current
    const l = lid.current
    if (since >= LAUNCH_AT && !s.launched) {
      s.launched = true
      s.vel.set(-0.95, 4.6, -1.15)
      s.spin.set(0, 0.8, 5.7)
    }
    if (s.launched && !s.resting) {
      s.vel.y -= GRAVITY * dt
      l.position.addScaledVector(s.vel, dt)
      l.rotation.x += s.spin.x * dt
      l.rotation.y += s.spin.y * dt
      l.rotation.z += s.spin.z * dt
      if (l.position.y < LID_REST_Y && s.vel.y < 0) {
        l.position.y = LID_REST_Y
        s.vel.y *= -0.3
        s.vel.x *= 0.5
        s.vel.z *= 0.5
        s.spin.multiplyScalar(0.3)
        if (Math.abs(s.vel.y) < 0.5) s.resting = true
      }
    } else if (s.resting) {
      l.rotation.x = damp(l.rotation.x, Math.round(l.rotation.x / Math.PI) * Math.PI, 10, dt)
      l.rotation.z = damp(l.rotation.z, Math.round(l.rotation.z / (Math.PI * 2)) * Math.PI * 2, 10, dt)
    }

    glow.current.scale.setScalar(damp(glow.current.scale.x, since > LAUNCH_AT ? 0.5 : 0.001, 3, dt))
    innerLight.current.intensity = damp(innerLight.current.intensity, since > LAUNCH_AT ? 6 : 0, 2, dt)

    const b = bouquet.current
    const sp = bouquetSpring.current
    const active = since > BOUQUET_AT
    b.position.y = springStep(b.position.y, active ? 0.3 : -0.5, sp.y, dt, 90, 9)
    b.scale.setScalar(Math.max(0.001, springStep(b.scale.x, active ? 1.3 : 0.001, sp.s, dt, 110, 10)))
    b.rotation.y = Math.sin(t * 0.7) * 0.12
  })

  return (
    <group
      ref={group}
      onClick={(e) => {
        e.stopPropagation()
        onOpen()
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        setHovered(true)
      }}
      onPointerOut={() => setHovered(false)}
    >
      <group ref={body}>
        <mesh>
          <boxGeometry args={[1.6, 1.3, 1.6]} />
          <meshPhysicalMaterial color="#ff8fab" roughness={0.45} sheen={0.6} sheenColor="#ffffff" clearcoat={0.25} />
        </mesh>
        <Ribbon>
          <boxGeometry args={[0.28, 1.31, 1.62]} />
        </Ribbon>
        <Ribbon>
          <boxGeometry args={[1.62, 1.31, 0.28]} />
        </Ribbon>
      </group>

      <mesh ref={glow} position={[0, 0.4, 0]} scale={0.001}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshBasicMaterial color={[2.6, 1.9, 1.9]} toneMapped={false} />
      </mesh>
      <pointLight ref={innerLight} position={[0, 2, 1.6]} intensity={0} color="#ffe0e8" distance={6} />
      <group ref={bouquet} position={[0, -0.5, 0]} scale={0.001}>
        <Bouquet />
      </group>
      {opened && <Sparkles count={50} scale={[2.4, 4, 2.4]} position={[0, 2, 0]} size={5} speed={0.7} color="#ff8fab" />}

      <group ref={lid} position={[0, 0.825, 0]}>
        <mesh>
          <boxGeometry args={[1.72, 0.35, 1.72]} />
          <meshPhysicalMaterial color="#ffa3bb" roughness={0.42} sheen={0.6} sheenColor="#ffffff" clearcoat={0.25} />
        </mesh>
        <Ribbon>
          <boxGeometry args={[0.3, 0.36, 1.74]} />
        </Ribbon>
        <Ribbon>
          <boxGeometry args={[1.74, 0.36, 0.3]} />
        </Ribbon>
        <Ribbon position={[-0.3, 0.42, 0]} rotation={[0, 0, 0.55]}>
          <torusGeometry args={[0.28, 0.08, 16, 40]} />
        </Ribbon>
        <Ribbon position={[0.3, 0.42, 0]} rotation={[0, 0, -0.55]}>
          <torusGeometry args={[0.28, 0.08, 16, 40]} />
        </Ribbon>
        <Ribbon position={[0, 0.26, 0]}>
          <sphereGeometry args={[0.13, 24, 24]} />
        </Ribbon>
      </group>
    </group>
  )
}
