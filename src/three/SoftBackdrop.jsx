import { Canvas } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import FloatingHearts from './FloatingHearts.jsx'
import FallingPetals from './FallingPetals.jsx'
import { canvasProps } from './SceneBase.jsx'

// Non-interactive ambient 3D layer (hearts, petals, sparkles) behind DOM-driven stages.
export default function SoftBackdrop({ hearts = 18, petals = 50, children }) {
  return (
    <div className="stage__canvas stage__canvas--soft" aria-hidden="true">
      <Canvas camera={{ position: [0, 0, 8], fov: 45 }} dpr={[1, 1.5]} resize={canvasProps.resize}>
        <ambientLight intensity={1.1} color="#fff0f4" />
        <directionalLight position={[3, 5, 4]} intensity={2.2} color="#fff6f0" />
        <pointLight position={[-4, -2, 2]} intensity={14} color="#ff9ab3" />
        <FloatingHearts count={hearts} width={18} height={12} z={-3} speed={0.8} />
        <FallingPetals count={petals} width={16} height={10} z={-1} speed={0.8} />
        <Sparkles count={90} scale={[16, 10, 6]} size={2.4} speed={0.3} color="#ff8fab" opacity={0.7} />
        {children}
      </Canvas>
    </div>
  )
}
