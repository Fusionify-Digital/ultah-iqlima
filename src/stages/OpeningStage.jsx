import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, PresentationControls, Sparkles } from '@react-three/drei'
import GiftBox from '../three/GiftBox.jsx'
import FloatingHearts from '../three/FloatingHearts.jsx'
import { Critter } from '../three/Critters.jsx'
import { CameraRig, Fit, SceneEffects, SceneLights, canvasProps } from '../three/SceneBase.jsx'
import AnimatedText from '../components/AnimatedText.jsx'
import { stageMotion } from '../components/stageMotion.js'
import { firework } from '../lib/celebrate.js'
import { config } from '../config.js'

const ease = [0.22, 1, 0.36, 1]
const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 24, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1.2, delay, ease },
})

const GROUND = -1.1
const CAMERA = [0, 1.4, 7.4]

export default function OpeningStage({ onStart, onDone }) {
  const [opened, setOpened] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const open = () => {
    if (opened) return
    setOpened(true)
    onStart()
    timer.current = setTimeout(onDone, 3800)
  }

  return (
    <motion.section className="stage" {...stageMotion}>
      <div className="stage__canvas">
        <Canvas camera={{ position: CAMERA, fov: 40 }} {...canvasProps}>
          <CameraRig position={CAMERA} />
          <SceneLights />
          <Fit width={4.3}>
            <PresentationControls
              global={false}
              snap
              polar={[-0.2, 0.3]}
              azimuth={[-0.8, 0.8]}
              config={{ mass: 1, tension: 170, friction: 26 }}
            >
              <group position={[0, -0.45, 0]}>
                <GiftBox opened={opened} onOpen={open} />
              </group>
            </PresentationControls>
            <Critter
              kind="cat"
              lines={config.critters.cat}
              secret={config.critters.secret.cat}
              onSecret={firework}
              excited={opened}
              lookAt={0.45}
              position={[-1.6, GROUND, 0.5]}
              rotation={[0, 0.35, 0]}
              scale={0.7}
            />
            <Critter
              kind="bunny"
              lines={config.critters.bunny}
              secret={config.critters.secret.bunny}
              onSecret={firework}
              excited={opened}
              lookAt={-0.45}
              position={[1.6, GROUND, 0.5]}
              rotation={[0, -0.35, 0]}
              scale={0.7}
            />
            <ContactShadows position={[0, GROUND, 0]} opacity={0.35} scale={7} blur={2.6} far={2} color="#c2185b" />
          </Fit>
          <FloatingHearts count={22} z={-4} speed={opened ? 3.5 : 1} />
          <Sparkles count={110} scale={[14, 8, 8]} size={2.4} speed={0.3} color="#ff8fab" opacity={0.8} />
          <SceneEffects />
        </Canvas>
      </div>

      <div className="stage__overlay stage__overlay--opening">
        <motion.div
          className="opening__copy"
          animate={{ opacity: opened ? 0 : 1, y: opened ? -24 : 0, filter: opened ? 'blur(6px)' : 'blur(0px)' }}
          transition={{ duration: 0.7, ease }}
        >
          <motion.p className="eyebrow" {...fadeUp(0.3)}>
            {config.opening.eyebrow}
          </motion.p>
          <AnimatedText as="h1" className="display" text={config.opening.title} delay={0.6} />
        </motion.div>

        <motion.div className="opening__cta" animate={{ opacity: opened ? 0 : 1 }} transition={{ duration: 0.5 }}>
          <motion.button
            type="button"
            className="btn"
            onClick={open}
            disabled={opened}
            {...fadeUp(1.6)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            {config.opening.button}
          </motion.button>
          <motion.p className="hint" {...fadeUp(1.9)}>
            atau ketuk kadonya langsung. Kucing &amp; kelincinya juga bisa diajak main
          </motion.p>
        </motion.div>
      </div>

      {opened && (
        <motion.div
          className="flash"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.3, delay: 2.4, ease: 'easeIn' }}
        />
      )}
    </motion.section>
  )
}
