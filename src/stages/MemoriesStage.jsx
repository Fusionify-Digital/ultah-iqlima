import { motion } from 'motion/react'
import { Canvas } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import Polaroids from '../three/Polaroids.jsx'
import FallingPetals from '../three/FallingPetals.jsx'
import { CameraRig, SceneEffects, SceneLights } from '../three/SceneBase.jsx'
import { stageMotion } from '../components/stageMotion.js'
import { config } from '../config.js'

const ease = [0.22, 1, 0.36, 1]
const CAMERA = [0, 0, 9]

export default function MemoriesStage({ onNext }) {
  const { memories } = config
  return (
    <motion.section className="stage" {...stageMotion}>
      <div className="stage__canvas">
        <Canvas camera={{ position: CAMERA, fov: 40 }} dpr={[1, 2]}>
          <CameraRig position={CAMERA} strength={0.25} introDistance={2} />
          <SceneLights />
          <Polaroids photos={memories.photos} />
          <FallingPetals count={30} width={14} height={9} z={-2} speed={0.6} />
          <Sparkles count={70} scale={[14, 8, 6]} size={2.2} speed={0.3} color="#ff8fab" opacity={0.7} />
          <SceneEffects bloom={0.8} />
        </Canvas>
      </div>

      <div className="stage__overlay">
        <motion.div
          className="stage__top"
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.1, delay: 0.4, ease } }}
        >
          <p className="eyebrow">{memories.eyebrow}</p>
          <h2 className="display display--md">{memories.title}</h2>
        </motion.div>

        <motion.div
          className="stage__bottom"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 1, delay: 1.6, ease } }}
        >
          <motion.button type="button" className="btn" onClick={onNext} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
            {memories.next}
          </motion.button>
          <p className="hint">{memories.hint}</p>
        </motion.div>
      </div>
    </motion.section>
  )
}
