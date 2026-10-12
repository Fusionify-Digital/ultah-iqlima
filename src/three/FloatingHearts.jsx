import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getHeartGeometry } from './heartGeometry.js'

const PALETTE = ['#ff6f91', '#ffb3c7', '#ffffff', '#ff8fab', '#ffd6e0']

export default function FloatingHearts({ count = 20, width = 14, height = 10, depth = 6, z = -3, speed = 1 }) {
  const ref = useRef()
  const geometry = useMemo(getHeartGeometry, [])
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const hearts = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: z + (Math.random() - 0.5) * depth,
        rise: 0.15 + Math.random() * 0.35,
        spin: (Math.random() - 0.5) * 1.2,
        angle: Math.random() * Math.PI * 2,
        phase: Math.random() * Math.PI * 2,
        scale: 0.22 + Math.random() * 0.4,
      })),
    [count, width, height, depth, z],
  )

  useLayoutEffect(() => {
    const colors = PALETTE.map((c) => new THREE.Color(c))
    hearts.forEach((_, i) => ref.current.setColorAt(i, colors[i % colors.length]))
    ref.current.instanceColor.needsUpdate = true
  }, [hearts])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const top = height / 2
    hearts.forEach((h, i) => {
      h.y += h.rise * delta * speed
      if (h.y > top + 1) h.y = -top - 1
      h.angle += h.spin * delta
      dummy.position.set(h.x + Math.sin(t * 0.6 + h.phase) * 0.35, h.y, h.z)
      dummy.rotation.set(0, h.angle, Math.sin(t + h.phase) * 0.25)
      dummy.scale.setScalar(h.scale)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]}>
      <meshPhysicalMaterial roughness={0.3} clearcoat={0.8} clearcoatRoughness={0.2} />
    </instancedMesh>
  )
}
