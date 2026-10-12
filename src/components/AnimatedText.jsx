import { Fragment } from 'react'
import { motion } from 'motion/react'

export default function AnimatedText({ text, as: Tag = 'span', by = 'word', delay = 0, stagger = 0.07, className }) {
  const parts = by === 'char' ? Array.from(text) : text.split(' ')

  return (
    <Tag className={className} aria-label={text}>
      {parts.map((part, i) => {
        const d = delay + i * stagger
        return (
          <Fragment key={i}>
            <motion.span
              aria-hidden="true"
              className="split"
              initial={{ opacity: 0, y: '0.55em', rotate: by === 'char' ? -14 : 0, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, rotate: 0, filter: 'blur(0px)' }}
              transition={{
                default: { type: 'spring', stiffness: 170, damping: 14, delay: d },
                opacity: { duration: 0.5, delay: d },
                filter: { duration: 0.6, delay: d },
              }}
            >
              {part === ' ' ? '\u00A0' : part}
            </motion.span>
            {by === 'word' && i < parts.length - 1 && ' '}
          </Fragment>
        )
      })}
    </Tag>
  )
}
