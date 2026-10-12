import { useEffect, useRef, useState } from 'react'
import { motion, useAnimate } from 'motion/react'
import SoftBackdrop from '../three/SoftBackdrop.jsx'
import { stageMotion } from '../components/stageMotion.js'
import { config } from '../config.js'

const ease = [0.22, 1, 0.36, 1]
const fadeUp = (delay) => ({
  initial: { opacity: 0, y: 20, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 1.1, delay, ease },
})

function HeartLock({ open }) {
  return (
    <svg className="heart-lock" viewBox="0 0 64 72" aria-hidden="true">
      <motion.path
        d="M20 30 V20 a12 12 0 0 1 24 0 V30"
        fill="none"
        stroke="#e8457a"
        strokeWidth="5"
        strokeLinecap="round"
        style={{ originX: 1, originY: 1 }}
        animate={open ? { y: -7, rotate: 28 } : { y: 0, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
      />
      <path
        d="M32 68 C 14 55, 4 46, 4 36 C 4 28, 10 24, 16 24 C 22 24, 27 27, 32 33 C 37 27, 42 24, 48 24 C 54 24, 60 28, 60 36 C 60 46, 50 55, 32 68 Z"
        fill="url(#lockFill)"
      />
      <circle cx="32" cy="42" r="4" fill="#fff" opacity="0.9" />
      <defs>
        <linearGradient id="lockFill" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#ff9ab3" />
          <stop offset="1" stopColor="#e8457a" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export default function GateStage({ onStart, onUnlock }) {
  const { gate } = config
  const [value, setValue] = useState('')
  const [status, setStatus] = useState('idle')
  const input = useRef(null)
  const timer = useRef(null)
  const [scope, animate] = useAnimate()

  useEffect(() => {
    const id = setTimeout(() => input.current?.focus({ preventScroll: true }), 1600)
    return () => {
      clearTimeout(id)
      clearTimeout(timer.current)
    }
  }, [])

  const check = (code) => {
    if (code === gate.code) {
      setStatus('open')
      onStart()
      input.current?.blur()
      timer.current = setTimeout(onUnlock, 1500)
      return
    }
    setStatus('wrong')
    animate(scope.current, { x: [0, -14, 12, -9, 6, -3, 0] }, { duration: 0.5 })
    timer.current = setTimeout(() => setValue(''), 450)
  }

  const onChange = (e) => {
    if (status === 'open') return
    const next = e.target.value.replace(/\D/g, '').slice(0, gate.code.length)
    setValue(next)
    if (status === 'wrong') setStatus('idle')
    if (next.length === gate.code.length) check(next)
  }

  const submit = (e) => {
    e.preventDefault()
    if (value.length === gate.code.length) check(value)
  }

  return (
    <motion.section className="stage" {...stageMotion}>
      <SoftBackdrop hearts={14} petals={36} />

      <div className="gate">
        <motion.div {...fadeUp(0.2)}>
          <motion.div
            animate={status === 'open' ? { scale: [1, 1.15, 1] } : { y: [0, -6, 0] }}
            transition={status === 'open' ? { duration: 0.6 } : { duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <HeartLock open={status === 'open'} />
          </motion.div>
        </motion.div>
        <motion.p className="eyebrow" {...fadeUp(0.4)}>
          {gate.eyebrow}
        </motion.p>
        <motion.h1 className="display display--md" {...fadeUp(0.55)}>
          {gate.title}
        </motion.h1>

        <motion.form className="gate__form" onSubmit={submit} {...fadeUp(0.8)}>
          <label className="gate__label" htmlFor="gate-code">
            {gate.question}
          </label>
          <div ref={scope} className={`gate__digits gate__digits--${status}`}>
            {Array.from(gate.code, (_, i) => (
              <span
                key={i}
                className={`gate__digit${i === value.length && status !== 'open' ? ' is-active' : ''}`}
              >
                {value[i] ?? ''}
              </span>
            ))}
            <input
              id="gate-code"
              ref={input}
              className="gate__input"
              value={value}
              onChange={onChange}
              inputMode="numeric"
              autoComplete="off"
              maxLength={gate.code.length}
              aria-invalid={status === 'wrong'}
            />
          </div>
          <p className={`gate__msg${status === 'wrong' ? ' is-wrong' : ''}`} role="status">
            {status === 'wrong' ? gate.wrong : status === 'open' ? 'Yeay, itu kamu!' : gate.hint}
          </p>
          <motion.button
            type="submit"
            className="btn"
            disabled={value.length < gate.code.length || status === 'open'}
            whileTap={{ scale: 0.96 }}
          >
            {gate.button}
          </motion.button>
        </motion.form>
      </div>
    </motion.section>
  )
}
