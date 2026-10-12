import { motion } from 'motion/react'

export default function MusicToggle({ playing, onToggle }) {
  return (
    <motion.button
      type="button"
      className={`music-toggle ${playing ? 'is-playing' : ''}`}
      onClick={onToggle}
      aria-label={playing ? 'Matikan musik' : 'Nyalakan musik'}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
    >
      <span className="music-toggle__bars" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </span>
    </motion.button>
  )
}
