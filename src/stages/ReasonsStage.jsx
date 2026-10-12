import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import SoftBackdrop from '../three/SoftBackdrop.jsx'
import { stageMotion } from '../components/stageMotion.js'
import { config } from '../config.js'

const ease = [0.22, 1, 0.36, 1]
const VISIBLE = 3

const variants = {
  enter: ({ dir } = {}) => (dir < 0 ? { x: -420, opacity: 0 } : { opacity: 0, y: 70, scale: 0.82 }),
  exit: ({ dir, side } = {}) =>
    dir > 0
      ? { x: side * 640, opacity: 0, transition: { duration: 0.5, ease: [0.4, 0, 1, 1] } }
      : { opacity: 0, y: 70, scale: 0.82, transition: { duration: 0.3 } },
}

function ReasonCard({ text, number, depth, motionCustom, onSwipe }) {
  const x = useMotionValue(0)
  const rotate = useTransform(x, [-240, 240], [-16, 16])
  const top = depth === 0

  return (
    <motion.article
      className={`reason-card${number % 2 ? ' reason-card--pink' : ''}`}
      style={{ x, rotate, zIndex: VISIBLE - depth }}
      variants={variants}
      custom={motionCustom}
      initial="enter"
      animate={{ x: 0, y: depth * 16, scale: 1 - depth * 0.05, opacity: 1, transition: { type: 'spring', stiffness: 220, damping: 26 } }}
      exit="exit"
      drag={top ? 'x' : false}
      dragSnapToOrigin
      dragElastic={0.7}
      onDragEnd={(_, info) => {
        const dx = info.offset.x
        if (Math.abs(dx) > 110 || Math.abs(info.velocity.x) > 600) onSwipe(Math.sign(dx || info.velocity.x))
      }}
      whileDrag={{ scale: 1.03, cursor: 'grabbing' }}
      aria-hidden={!top}
    >
      <span className="reason-card__number">{String(number).padStart(2, '0')}</span>
      <p className="reason-card__text">{text}</p>
      <span className="reason-card__heart" aria-hidden="true">
        ♡
      </span>
    </motion.article>
  )
}

export default function ReasonsStage({ onNext }) {
  const { reasons } = config
  const total = reasons.items.length
  const [{ index, dir, side }, setState] = useState({ index: 0, dir: 1, side: -1 })
  const finished = index >= total

  const go = useCallback(
    (step, swipeSide = -1) =>
      setState((s) => {
        const next = Math.min(total, Math.max(0, s.index + step))
        return next === s.index ? s : { index: next, dir: step, side: swipeSide }
      }),
    [total],
  )

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') go(1, 1)
      if (e.key === 'ArrowLeft') go(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [go])

  const cards = reasons.items
    .map((text, i) => ({ text, i }))
    .slice(index, index + VISIBLE)

  return (
    <motion.section className="stage" {...stageMotion}>
      <SoftBackdrop hearts={14} petals={40} />

      <div className="reasons">
        <motion.header
          className="reasons__head"
          initial={{ opacity: 0, y: 20, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 1.1, delay: 0.3, ease } }}
        >
          <p className="eyebrow">{reasons.eyebrow}</p>
          <h2 className="display display--md">{reasons.title}</h2>
        </motion.header>

        <div className="reasons__deck">
          <AnimatePresence custom={{ dir, side }} initial={false}>
            {!finished &&
              cards
                .slice()
                .reverse()
                .map(({ text, i }) => (
                  <ReasonCard
                    key={i}
                    text={text}
                    number={i + 1}
                    depth={i - index}
                    motionCustom={{ dir, side }}
                    onSwipe={(s) => go(1, s)}
                  />
                ))}
          </AnimatePresence>
          <AnimatePresence>
            {finished && (
              <motion.div
                key="end"
                className="reasons__end"
                initial={{ opacity: 0, scale: 0.9, filter: 'blur(8px)' }}
                animate={{ opacity: 1, scale: 1, filter: 'blur(0px)', transition: { duration: 0.9, delay: 0.25, ease } }}
              >
                <p className="display display--xl">{reasons.end}</p>
                <motion.button
                  type="button"
                  className="btn"
                  onClick={onNext}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                >
                  {reasons.next}
                </motion.button>
                <button type="button" className="link-btn link-btn--light" onClick={() => go(-1)}>
                  Lihat lagi dari belakang
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <motion.div
          className="reasons__controls"
          style={{ visibility: finished ? 'hidden' : 'visible' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, transition: { delay: 1, duration: 0.8 } }}
        >
          <div className="reasons__nav">
            <button type="button" className="round-btn" onClick={() => go(-1)} disabled={index === 0} aria-label="Sebelumnya">
              ‹
            </button>
            <div className="reasons__progress" aria-label={`${Math.min(index + 1, total)} dari ${total}`}>
              <span>
                {Math.min(index + 1, total)} / {total}
              </span>
              <div className="reasons__bar">
                <motion.div className="reasons__bar-fill" animate={{ scaleX: Math.min(index + 1, total) / total }} transition={{ ease }} />
              </div>
            </div>
            <button type="button" className="round-btn" onClick={() => go(1, -1)} aria-label="Berikutnya">
              ›
            </button>
          </div>
          <p className="hint">{reasons.hint}</p>
        </motion.div>
      </div>
    </motion.section>
  )
}
