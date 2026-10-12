import { useMemo } from 'react'
import * as THREE from 'three'
import { getLeaf, getLilyPetal, getRosePetal } from './flowerGeometry.js'
import { getMaterial, unitCylinder, unitSphere } from './shared.js'

const DOUBLE = { side: THREE.DoubleSide }
const GREEN = '#4f8a3c'
const GOLDEN_ANGLE = 2.39996

const ROSE_PETALS = Array.from({ length: 14 }, (_, i) => {
  const f = i / 13
  return {
    angle: i * GOLDEN_ANGLE,
    dist: 0.015 + f * 0.07,
    w: 0.14 + f * 0.2,
    h: 0.2 + f * 0.13,
    tilt: 0.05 + f * f * 1.05,
    y: -f * 0.06,
    kind: f < 0.35 ? 'inner' : f < 0.7 ? 'mid' : 'outer',
  }
})

export function RoseHead({ color = '#ff7096', ...props }) {
  const petal = getMaterial(color, { ...DOUBLE, roughness: 0.6, sheen: 1, sheenColor: '#ffffff', sheenRoughness: 0.45 })
  const green = getMaterial(GREEN, { ...DOUBLE, roughness: 0.6 })
  return (
    <group {...props}>
      {ROSE_PETALS.map((p, i) => (
        <group key={i} rotation={[0, p.angle, 0]}>
          <mesh
            geometry={getRosePetal(p.kind)}
            material={petal}
            position={[0, p.y, p.dist]}
            rotation={[p.tilt, 0, 0]}
            scale={[p.w, p.h, p.h]}
          />
        </group>
      ))}
      <mesh geometry={unitSphere} material={green} position={[0, -0.05, 0]} scale={[0.07, 0.05, 0.07]} />
      {[0, 1, 2, 3, 4].map((i) => (
        <group key={i} rotation={[0, (i / 5) * Math.PI * 2, 0]}>
          <mesh geometry={getLeaf()} material={green} position={[0, -0.05, 0.04]} rotation={[2.1, 0, 0]} scale={[0.06, 0.14, 0.14]} />
        </group>
      ))}
    </group>
  )
}

export function LilyHead({ tint = 'pink', ...props }) {
  const petal = getMaterial('#ffffff', { ...DOUBLE, roughness: 0.5, vertexColors: true, sheen: 0.6, sheenColor: '#ffffff', sheenRoughness: 0.5 })
  const filament = getMaterial('#e6efb0')
  const anther = getMaterial('#9c3d12', { roughness: 0.8 })
  const pistil = getMaterial('#cfe28a')
  const green = getMaterial(GREEN, { roughness: 0.6 })
  return (
    <group {...props}>
      {Array.from({ length: 6 }, (_, i) => {
        const outer = i % 2 === 0
        return (
          <group key={i} rotation={[0, (i / 6) * Math.PI * 2, 0]}>
            <mesh
              geometry={getLilyPetal(tint)}
              material={petal}
              position={[0, 0, 0.02]}
              rotation={[outer ? 1.05 : 0.92, 0, 0]}
              scale={outer ? [0.17, 0.55, 0.55] : [0.21, 0.5, 0.5]}
            />
          </group>
        )
      })}
      {Array.from({ length: 6 }, (_, i) => (
        <group key={i} rotation={[0, (i / 6) * Math.PI * 2 + Math.PI / 6, 0]}>
          <group rotation={[0.38, 0, 0]}>
            <mesh geometry={unitCylinder} material={filament} position={[0, 0.17, 0]} scale={[0.006, 0.34, 0.006]} />
            <mesh geometry={unitSphere} material={anther} position={[0, 0.34, 0]} scale={[0.04, 0.014, 0.014]} />
          </group>
        </group>
      ))}
      <mesh geometry={unitCylinder} material={pistil} position={[0, 0.2, 0]} scale={[0.009, 0.4, 0.009]} />
      <mesh geometry={unitSphere} material={pistil} position={[0, 0.4, 0]} scale={0.022} />
      <mesh geometry={unitSphere} material={green} position={[0, -0.02, 0]} scale={[0.05, 0.06, 0.05]} />
    </group>
  )
}

const UP = new THREE.Vector3(0, 1, 0)

const BOUQUET = [
  { type: 'rose', color: '#ff7096', head: [0, 1.25, 0.02] },
  { type: 'lily', tint: 'pink', head: [-0.34, 1.12, 0.1] },
  { type: 'lily', tint: 'white', head: [0.36, 1.1, -0.06] },
  { type: 'rose', color: '#fff3f5', head: [-0.16, 1.02, 0.32] },
  { type: 'rose', color: '#e8457a', head: [0.22, 0.99, 0.3] },
  { type: 'rose', color: '#ffb3c7', head: [0.04, 1.08, -0.3] },
  { type: 'lily', tint: 'white', head: [-0.3, 1.0, -0.28] },
  { type: 'rose', color: '#fff3f5', head: [0.34, 0.95, 0.1] },
]

export function Bouquet(props) {
  const stems = useMemo(
    () =>
      BOUQUET.map((f) => {
        const end = new THREE.Vector3(...f.head)
        const dir = end.clone().normalize()
        return {
          ...f,
          length: end.length(),
          mid: end.clone().multiplyScalar(0.5),
          quaternion: new THREE.Quaternion().setFromUnitVectors(UP, dir),
        }
      }),
    [],
  )
  const stem = getMaterial(GREEN, { roughness: 0.6 })
  const leaf = getMaterial('#5c9a47', { side: THREE.DoubleSide, roughness: 0.55 })
  const paper = getMaterial('#ffffff', { side: THREE.DoubleSide, roughness: 0.7, sheen: 0.5, sheenColor: '#ffe3ea' })
  const ribbon = getMaterial('#ff7096', { roughness: 0.3, sheen: 1, sheenColor: '#ffffff', sheenRoughness: 0.3 })

  return (
    <group {...props}>
      {stems.map((s, i) => (
        <group key={i}>
          <mesh geometry={unitCylinder} material={stem} position={s.mid} quaternion={s.quaternion} scale={[0.018, s.length, 0.018]} />
          <group position={s.head} quaternion={s.quaternion}>
            {s.type === 'rose' ? <RoseHead color={s.color} scale={0.95} /> : <LilyHead tint={s.tint} scale={0.85} />}
          </group>
        </group>
      ))}
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <group key={i} rotation={[0, (i / 6) * Math.PI * 2 + 0.3, 0]}>
          <mesh geometry={getLeaf()} material={leaf} position={[0, 0.72, 0.18]} rotation={[0.75, 0, 0]} scale={[0.16, 0.42, 0.42]} />
        </group>
      ))}
      <mesh position={[0, 0.42, 0]} material={paper}>
        <cylinderGeometry args={[0.46, 0.07, 0.86, 24, 1, true]} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation={[Math.PI / 2, 0, 0]} material={ribbon}>
        <torusGeometry args={[0.18, 0.03, 12, 32]} />
      </mesh>
      <mesh position={[-0.1, 0.22, 0.2]} rotation={[0, 0, 0.5]} material={ribbon}>
        <torusGeometry args={[0.08, 0.025, 10, 24]} />
      </mesh>
      <mesh position={[0.1, 0.22, 0.2]} rotation={[0, 0, -0.5]} material={ribbon}>
        <torusGeometry args={[0.08, 0.025, 10, 24]} />
      </mesh>
    </group>
  )
}
