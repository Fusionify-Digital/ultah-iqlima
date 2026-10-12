import { useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import OpeningStage from './stages/OpeningStage.jsx'
import CakeStage from './stages/CakeStage.jsx'
import LetterStage from './stages/LetterStage.jsx'
import GateStage from './stages/GateStage.jsx'
import MemoriesStage from './stages/MemoriesStage.jsx'
import ReasonsStage from './stages/ReasonsStage.jsx'
import MusicToggle from './components/MusicToggle.jsx'
import { config } from './config.js'

export default function App() {
  const [stage, setStage] = useState(() =>
    import.meta.env.DEV ? new URLSearchParams(location.search).get('stage') || 'gate' : 'gate',
  )
  const audioRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  const [audioAvailable, setAudioAvailable] = useState(true)

  // Must be called directly inside a user gesture, otherwise browsers block autoplay.
  const startMusic = () => {
    const audio = audioRef.current
    if (!audio || !audioAvailable) return
    audio.volume = 0.6
    audio.play().catch(() => {})
  }

  const toggleMusic = () => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) audio.play().catch(() => {})
    else audio.pause()
  }

  return (
    <main className="app">
      <audio
        ref={audioRef}
        src={config.music}
        loop
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => setAudioAvailable(false)}
      />

      <AnimatePresence mode="wait">
        {stage === 'gate' && <GateStage key="gate" onStart={startMusic} onUnlock={() => setStage('opening')} />}
        {stage === 'opening' && (
          <OpeningStage key="opening" onStart={startMusic} onDone={() => setStage('cake')} />
        )}
        {stage === 'cake' && <CakeStage key="cake" onNext={() => setStage('memories')} />}
        {stage === 'memories' && <MemoriesStage key="memories" onNext={() => setStage('reasons')} />}
        {stage === 'reasons' && <ReasonsStage key="reasons" onNext={() => setStage('letter')} />}
        {stage === 'letter' && <LetterStage key="letter" onRestart={() => setStage('opening')} />}
      </AnimatePresence>

      {stage !== 'gate' && stage !== 'opening' && audioAvailable && (
        <MusicToggle playing={playing} onToggle={toggleMusic} />
      )}
    </main>
  )
}
