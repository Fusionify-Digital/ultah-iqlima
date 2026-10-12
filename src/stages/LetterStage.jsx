import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useThree } from '@react-three/fiber'
import SoftBackdrop from '../three/SoftBackdrop.jsx'
import { Critter } from '../three/Critters.jsx'
import { useTypewriter } from '../hooks/useTypewriter.js'
import { stageMotion } from '../components/stageMotion.js'
import { config } from '../config.js'

const ease = [0.22, 1, 0.36, 1]

function PeekingCritters() {
  const { width, height, aspect } = useThree((s) => s.viewport)
  if (aspect < 0.9) return null
  const x = width / 2 - 1.1
  const y = -height / 2 - 0.25
  return (
    <>
      <Critter kind="cat" interactive={false} lookAt={0.5} position={[-x, y, 1]} rotation={[0.15, 0.45, 0]} scale={1.15} />
      <Critter kind="bunny" interactive={false} lookAt={-0.5} position={[x, y, 1]} rotation={[0.15, -0.45, 0]} scale={1.15} />
    </>
  )
}

function Envelope({ open, onOpen }) {
  return (
    <motion.button
      type="button"
      className="envelope"
      onClick={onOpen}
      disabled={open}
      aria-label="Buka surat"
      initial={{ opacity: 0, y: 40, scale: 0.9 }}
      animate={open ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1, y: [0, -10, 0], scale: 1 }}
      exit={{ opacity: 0, y: 60, scale: 0.9, transition: { duration: 0.6, ease } }}
      transition={
        open
          ? { duration: 0.4 }
          : { y: { duration: 3.2, repeat: Infinity, ease: 'easeInOut' }, default: { duration: 0.9, ease } }
      }
      whileHover={open ? undefined : { scale: 1.03 }}
    >
      <span className="envelope__back" />
      <motion.span
        className="envelope__paper"
        animate={{ y: open ? '-48%' : '0%' }}
        transition={{ duration: 0.9, delay: open ? 0.55 : 0, ease }}
      >
        <span className="envelope__paper-line" />
        <span className="envelope__paper-line" />
        <span className="envelope__paper-line envelope__paper-line--short" />
      </motion.span>
      <span className="envelope__front" />
      <motion.span
        className="envelope__flap"
        animate={{ rotateX: open ? 180 : 0, zIndex: open ? 1 : 4 }}
        transition={{ duration: 0.7, ease, zIndex: { delay: open ? 0.3 : 0, duration: 0 } }}
      />
      <motion.span className="envelope__seal" animate={{ opacity: open ? 0 : 1, scale: open ? 0.6 : 1 }}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.6 4.5c2.1 0 3.6 1.1 4.4 2.6.8-1.5 2.3-2.6 4.4-2.6 3.6 0 5.7 3.9 4.2 7.3C19.5 16.4 12 21 12 21z" />
        </svg>
      </motion.span>
    </motion.button>
  )
}

function Letter({ onRestart }) {
  const { greeting, paragraphs, quote, closing, signature } = config.letter
  const segments = useMemo(() => [greeting, ...paragraphs], [greeting, paragraphs])
  const { count, done, skip } = useTypewriter(segments)
  const bodyRef = useRef(null)

  useEffect(() => {
    const el = bodyRef.current
    if (el && el.scrollHeight > el.clientHeight) el.scrollTop = el.scrollHeight
  }, [count, done])

  let offset = 0
  const visible = segments.map((s) => {
    const shown = Math.max(0, Math.min(s.length, count - offset))
    const typing = count > offset && count < offset + s.length
    offset += s.length
    return { text: s.slice(0, shown), typing, started: shown > 0 }
  })
  const [greet, ...paras] = visible

  return (
    <motion.article
      className="letter"
      initial={{ opacity: 0, y: 50, scale: 0.94, rotateX: 12 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
      transition={{ duration: 1.1, ease }}
    >
      <div className="letter__body" ref={bodyRef} onClick={done ? undefined : skip}>
        <p className="letter__greeting">
          {greet.text}
          {greet.typing && <span className="caret" />}
        </p>
        {paras.map(
          (p, i) =>
            p.started && (
              <p key={i} className="letter__para">
                {p.text}
                {p.typing && <span className="caret" />}
              </p>
            ),
        )}

        {done && quote?.length > 0 && (
          <blockquote className="letter__quote">
            {quote.map((line, i) => (
              <motion.span
                key={i}
                className="letter__quote-line"
                initial={{ opacity: 0, y: 14, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 1.4, delay: 0.4 + i * 1.1, ease }}
              >
                {line}
              </motion.span>
            ))}
          </blockquote>
        )}

        <AnimatePresence>
          {done && (
            <motion.div
              className="letter__sign"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.6 + (quote?.length ?? 0) * 1.1, ease }}
            >
              <p className="letter__closing">{closing}</p>
              <p className="letter__signature">{signature}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="letter__actions">
        {done ? (
          <motion.button
            type="button"
            className="btn btn--ghost"
            onClick={onRestart}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1.4 } }}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
          >
            Ulangi dari awal
          </motion.button>
        ) : (
          <button type="button" className="link-btn" onClick={skip}>
            Tampilkan semua
          </button>
        )}
      </div>
    </motion.article>
  )
}

export default function LetterStage({ onRestart }) {
  const [phase, setPhase] = useState('sealed')
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const openEnvelope = () => {
    if (phase !== 'sealed') return
    setPhase('opening')
    timer.current = setTimeout(() => setPhase('reading'), 1700)
  }

  return (
    <motion.section className="stage stage--letter" {...stageMotion}>
      <SoftBackdrop>
        <PeekingCritters />
      </SoftBackdrop>

      <div className="letter-wrap">
        <AnimatePresence mode="wait">
          {phase !== 'reading' ? (
            <motion.div key="envelope" className="envelope-wrap" exit={{ opacity: 0, transition: { duration: 0.5 } }}>
              <Envelope open={phase === 'opening'} onOpen={openEnvelope} />
              <motion.p
                className="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: phase === 'sealed' ? 1 : 0, transition: { delay: phase === 'sealed' ? 1 : 0 } }}
              >
                Ketuk amplopnya untuk membuka
              </motion.p>
            </motion.div>
          ) : (
            <Letter key="letter" onRestart={onRestart} />
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  )
}
