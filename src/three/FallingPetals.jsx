import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getRosePetal } from './flowerGeometry.js'

const PALETTE = ['#ff7096', '#ffb3c7', '#ffffff', '#ffd6e0', '#e8457a', '#fff3f5']

// Petals rock side to side and glide rather than spinning at a constant rate,
// and fall slower while lying flat (more air resistance).
export default function FallingPetals({ count = 40, width = 14, height = 10, depth = 6, z = -1, speed = 1 }) {
  const ref = useRef()
  const geometry = getRosePetal('outer')
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const petals = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        x: (Math.random() - 0.5) * width,
        y: (Math.random() - 0.5) * height,
        z: z + (Math.random() - 0.5) * depth,
        fall: 0.3 + Math.random() * 0.35,
        rock: 1.2 + Math.random() * 1.4,
        yaw: Math.random() * Math.PI * 2,
        yawSpeed: (Math.random() - 0.5) * 0.8,
        phase: Math.random() * Math.PI * 2,
        scale: 0.1 + Math.random() * 0.1,
      })),
    [count, width, height, depth, z],
  )

  useLayoutEffect(() => {
    const colors = PALETTE.map((c) => new THREE.Color(c))
    petals.forEach((_, i) => ref.current.setColorAt(i, colors[i % colors.length]))
    ref.current.instanceColor.needsUpdate = true
  }, [petals])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime
    const half = height / 2
    petals.forEach((p, i) => {
      const swing = Math.sin(t * p.rock + p.phase)
      const flatness = 1 - Math.abs(swing)
      p.y -= p.fall * (0.55 + 0.45 * (1 - flatness)) * delta * speed
      if (p.y < -half - 1) p.y = half + 1
      p.yaw += p.yawSpeed * delta

      dummy.position.set(p.x + Math.cos(t * p.rock + p.phase) * 0.35, p.y, p.z)
      dummy.rotation.set(1.2 + swing * 0.8, p.yaw, Math.sin(t * p.rock * 0.7 + p.phase) * 0.6)
      dummy.scale.set(p.scale, p.scale * 1.1, p.scale)
      dummy.updateMatrix()
      ref.current.setMatrixAt(i, dummy.matrix)
    })
    ref.current.instanceMatrix.needsUpdate = true
  })

  return (
    <instancedMesh ref={ref} args={[geometry, undefined, count]}>
      <meshPhysicalMaterial roughness={0.6} side={THREE.DoubleSide} sheen={1} sheenColor="#ffffff" sheenRoughness={0.5} />
    </instancedMesh>
  )
}
