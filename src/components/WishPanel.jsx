import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'motion/react'

const ease = [0.22, 1, 0.36, 1]
const FLIGHT = 5.2

function Lantern({ wish, onFinish }) {
  return createPortal(
    <motion.div
      className="lantern-flight"
      aria-hidden="true"
      initial={{ y: '0vh', x: 0, scale: 0.6, opacity: 0 }}
      animate={{
        y: ['0vh', '-20vh', '-50vh', '-88vh'],
        x: [0, 18, -14, 8],
        scale: [0.6, 1, 0.8, 0.4],
        opacity: [0, 1, 1, 0],
      }}
      transition={{ duration: FLIGHT, ease: 'easeInOut', times: [0, 0.25, 0.65, 1] }}
      onAnimationComplete={onFinish}
    >
      <motion.p
        className="lantern-flight__wish"
        initial={{ opacity: 1, y: 0 }}
        animate={{ opacity: 0, y: 30, scale: 0.6 }}
        transition={{ duration: 1.4, delay: 0.4, ease }}
      >
        {wish}
      </motion.p>
      <div className="lantern" />
    </motion.div>,
    document.body,
  )
}

// Ask for a birthday wish, then release it as a floating paper lantern. Wishes are never stored.
export default function WishPanel({ copy, children }) {
  const [phase, setPhase] = useState('ask')
  const [wish, setWish] = useState('')
  const [lantern, setLantern] = useState(null)
  const input = useRef(null)

  useEffect(() => {
    const id = setTimeout(() => input.current?.focus({ preventScroll: true }), 2400)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (phase !== 'flying') return
    const id = setTimeout(() => setPhase('done'), FLIGHT * 1000 - 900)
    return () => clearTimeout(id)
  }, [phase])

  const release = (e) => {
    e.preventDefault()
    if (!wish.trim()) return
    input.current?.blur()
    setLantern(wish.trim())
    setPhase('flying')
  }

  return (
    <>
      <AnimatePresence mode="wait">
        {phase === 'ask' && (
          <motion.form
            key="ask"
            className="wish"
            onSubmit={release}
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { delay: 2, duration: 1, ease } }}
            exit={{ opacity: 0, y: -10, filter: 'blur(6px)', transition: { duration: 0.5 } }}
          >
            <p className="lede">{copy.prompt}</p>
            <div className="wish__field">
              <input
                ref={input}
                className="wish__input"
                value={wish}
                onChange={(e) => setWish(e.target.value)}
                maxLength={90}
                placeholder={copy.placeholder}
                aria-label="Permohonan ulang tahun"
              />
              <motion.button type="submit" className="btn btn--sm" disabled={!wish.trim()} whileTap={{ scale: 0.95 }}>
                {copy.button}
              </motion.button>
            </div>
            <button type="button" className="link-btn link-btn--light" onClick={() => setPhase('done')}>
              {copy.skip}
            </button>
          </motion.form>
        )}
        {phase === 'flying' && (
          <motion.p
            key="flying"
            className="lede"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.2, duration: 1 } }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {copy.flying}
          </motion.p>
        )}
        {phase === 'done' && (
          <motion.div
            key="done"
            className="stage__bottom"
            initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1, ease } }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      {lantern && <Lantern wish={lantern} onFinish={() => setLantern(null)} />}
    </>
  )
}
