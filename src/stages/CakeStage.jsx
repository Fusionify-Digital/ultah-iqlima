import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Canvas } from '@react-three/fiber'
import { ContactShadows, PresentationControls, Sparkles } from '@react-three/drei'
import Cake from '../three/Cake.jsx'
import FloatingHearts from '../three/FloatingHearts.jsx'
import FallingPetals from '../three/FallingPetals.jsx'
import { Critter } from '../three/Critters.jsx'
import AnimatedText from '../components/AnimatedText.jsx'
import { stageMotion } from '../components/stageMotion.js'
import { CameraRig, Fit, SceneEffects, SceneLights, canvasProps } from '../three/SceneBase.jsx'
import { useBlowDetector } from '../hooks/useBlowDetector.js'
import { celebrate, firework } from '../lib/celebrate.js'
import WishPanel from '../components/WishPanel.jsx'
import { birthday, config } from '../config.js'

const ease = [0.22, 1, 0.36, 1]
const GROUND = -0.95
const CAMERA = [0, 2.6, 8.4]
const CAMERA_WIDE = [0, 3, 10.6]
const digits = String(birthday.age)

function MicPanel({ mic, litCount }) {
  if (mic.status === 'listening') {
    return (
      <div className="mic-panel">
        <div className="mic-meter" aria-hidden="true">
          <div className="mic-meter__fill" style={{ transform: `scaleX(${mic.level})` }} />
        </div>
        <p className="hint">Tiup ke arah mikrofon... {litCount} lilin masih menyala</p>
      </div>
    )
  }

  return (
    <div className="mic-panel">
      <motion.button
        type="button"
        className="btn"
        onClick={mic.start}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
      >
        Tiup pakai mikrofon
      </motion.button>
      <p className="hint">
        {mic.status === 'denied' && 'Akses mikrofon ditolak. '}
        {mic.status === 'unsupported' && 'Mikrofon tidak didukung di browser ini. '}
        Atau ketuk lilinnya satu per satu.
      </p>
    </div>
  )
}

export default function CakeStage({ onNext }) {
  const [lit, setLit] = useState(() => Array(digits.length + config.candles).fill(true))
  const litCount = lit.filter(Boolean).length
  const allOut = litCount === 0

  const blowAt = useCallback((i) => {
    setLit((prev) => prev.map((v, j) => (j === i ? false : v)))
  }, [])

  const blowRandom = useCallback(() => {
    setLit((prev) => {
      const remaining = prev.flatMap((v, i) => (v ? [i] : []))
      if (!remaining.length) return prev
      const pick = remaining[Math.floor(Math.random() * remaining.length)]
      return prev.map((v, i) => (i === pick ? false : v))
    })
  }, [])

  const mic = useBlowDetector(blowRandom)
  const { stop } = mic

  useEffect(() => {
    if (!allOut) return
    stop()
    const timers = [
      setTimeout(celebrate, 450),
      setTimeout(() => firework(0.22, 0.3), 2600),
      setTimeout(() => firework(0.78, 0.25), 3300),
      setTimeout(() => firework(0.5, 0.18), 4100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [allOut, stop])

  const lastFirework = useRef(0)
  const tapFirework = (e) => {
    if (!allOut || e.target.closest('button, input, form, .bubble')) return
    const now = performance.now()
    if (now - lastFirework.current < 450) return
    lastFirework.current = now
    firework(e.clientX / window.innerWidth, e.clientY / window.innerHeight)
  }

  return (
    <motion.section className="stage" {...stageMotion} onPointerDown={tapFirework}>
      <div className="stage__canvas">
        <Canvas camera={{ position: CAMERA, fov: 38 }} {...canvasProps}>
          <CameraRig position={allOut ? CAMERA_WIDE : CAMERA} target={[0, 0.2, 0]} strength={0.3} />
          <SceneLights />
          <Fit width={5.9}>
            <PresentationControls
              global={false}
              snap
              polar={[-0.15, 0.25]}
              azimuth={[-Math.PI / 3, Math.PI / 3]}
              config={{ mass: 1, tension: 170, friction: 26 }}
            >
              <Cake digits={digits} lit={lit} onBlow={blowAt} position={[0, GROUND, 0]} />
            </PresentationControls>
            <Critter
              kind="cat"
              lines={config.critters.cat}
              secret={config.critters.secret.cat}
              onSecret={firework}
              excited={allOut}
              lookAt={0.35}
              position={[-2.15, GROUND, 1.35]}
              rotation={[0, 0.4, 0]}
              scale={0.78}
            />
            <Critter
              kind="bunny"
              lines={config.critters.bunny}
              secret={config.critters.secret.bunny}
              onSecret={firework}
              excited={allOut}
              lookAt={-0.35}
              position={[2.15, GROUND, 1.35]}
              rotation={[0, -0.4, 0]}
              scale={0.78}
            />
            <ContactShadows position={[0, GROUND - 0.01, 0]} opacity={0.35} scale={9} blur={2.6} far={3} color="#c2185b" />
          </Fit>
          <Sparkles count={70} scale={[12, 7, 8]} size={2} speed={0.3} color="#ff8fab" opacity={0.7} />
          {allOut && <Sparkles count={90} scale={[10, 6, 6]} size={3.5} speed={0.45} color="#f3c26b" />}
          {allOut && <FloatingHearts count={18} z={-4} speed={1.4} />}
          {allOut && <FallingPetals count={45} width={12} height={9} z={-0.5} />}
          <SceneEffects bloom={1.1} />
        </Canvas>
      </div>

      <div className="stage__overlay">
        <AnimatePresence mode="wait">
          {!allOut ? (
            <motion.div
              key="blow-copy"
              className="stage__top"
              initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.1, delay: 0.5, ease } }}
              exit={{ opacity: 0, y: -16, filter: 'blur(6px)', transition: { duration: 0.6, ease } }}
            >
              <p className="eyebrow">{config.cake.eyebrow}</p>
              <h2 className="display display--md">
                {config.cake.title}, <em>{config.name}</em>
              </h2>
            </motion.div>
          ) : (
            <motion.div
              key="done-copy"
              className="stage__top"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.6, delay: 0.5 } }}
            >
              <p className="eyebrow">{config.cake.doneTitle}</p>
              <AnimatedText as="h1" className="display display--xl" text={config.name} by="char" delay={0.8} stagger={0.06} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {!allOut ? (
            <motion.div
              key="mic"
              className="stage__bottom"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.9 } }}
              exit={{ opacity: 0 }}
            >
              <MicPanel mic={mic} litCount={litCount} />
            </motion.div>
          ) : (
            <motion.div key="next" className="stage__bottom">
              <WishPanel copy={config.wish}>
                <p className="lede">{config.cake.doneMessage}</p>
                <motion.button
                  type="button"
                  className="btn"
                  onClick={onNext}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {config.cake.next}
                </motion.button>
                <p className="hint">Ketuk di mana saja untuk kembang api</p>
              </WishPanel>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
