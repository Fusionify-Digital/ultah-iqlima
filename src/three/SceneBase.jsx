import { useLayoutEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import * as THREE from 'three'

const { damp } = THREE.MathUtils

export const BACKGROUND = '#ffe8ef'

// Phone GPUs flicker with the postprocessing render targets, so touch devices skip them.
export const LOW_POWER =
  typeof window !== 'undefined' && window.matchMedia('(pointer: coarse), (max-width: 768px)').matches

// offsetSize ignores the CSS scale of stage transitions, which would otherwise
// resize the canvas (and its render targets) on every animation frame.
export const canvasProps = {
  dpr: LOW_POWER ? [1, 1.5] : [1, 2],
  resize: { offsetSize: true },
}

export function SceneLights() {
  return (
    <>
      <color attach="background" args={[BACKGROUND]} />
      <fog attach="fog" args={[BACKGROUND, 10, 24]} />
      <ambientLight intensity={0.55} color="#fff0f4" />
      <spotLight position={[4, 8, 6]} angle={0.45} penumbra={1} intensity={70} color="#fff6f0" />
      <pointLight position={[-5, 2, -2]} intensity={18} color="#ff9ab3" />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, -6]} scale={[10, 4, 1]} color="#ffffff" />
        <Lightformer form="circle" intensity={2.6} position={[-6, 1, 2]} scale={3} color="#ffc2d1" />
        <Lightformer form="rect" intensity={1.8} position={[6, 2, 2]} scale={[3, 7, 1]} color="#fff4ea" />
        <Lightformer form="rect" intensity={1} position={[0, -4, 3]} scale={[10, 2, 1]} color="#ffd6e0" />
      </Environment>
    </>
  )
}

// Shrinks content on narrow (portrait) screens so `width` world units always fit.
export function Fit({ width, children }) {
  const viewportWidth = useThree((s) => s.viewport.width)
  return <group scale={Math.min(1, viewportWidth / width)}>{children}</group>
}

// Eases the camera in from further away, then drifts it gently with the pointer for parallax.
export function CameraRig({ position, target = [0, 0, 0], strength = 0.35, introDistance = 2.5 }) {
  const camera = useThree((s) => s.camera)
  const look = useMemo(() => new THREE.Vector3(...target), [])
  useLayoutEffect(() => {
    camera.position.set(position[0], position[1] + introDistance * 0.3, position[2] + introDistance)
  }, [camera])
  useFrame((state, delta) => {
    const cam = state.camera
    cam.position.x = damp(cam.position.x, position[0] + state.pointer.x * strength, 2, delta)
    cam.position.y = damp(cam.position.y, position[1] + state.pointer.y * strength * 0.5, 1.6, delta)
    cam.position.z = damp(cam.position.z, position[2], 1.2, delta)
    look.set(damp(look.x, target[0], 1.6, delta), damp(look.y, target[1], 1.6, delta), damp(look.z, target[2], 1.6, delta))
    cam.lookAt(look)
  })
  return null
}

export function SceneEffects({ bloom = 0.9 }) {
  if (LOW_POWER) return null
  return (
    <EffectComposer>
      <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.15} intensity={bloom} />
      <Vignette offset={0.35} darkness={0.28} />
    </EffectComposer>
  )
}
