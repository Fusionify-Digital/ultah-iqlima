import { useCallback, useEffect, useRef, useState } from 'react'

const THRESHOLD = 115
const SUSTAIN_FRAMES = 6
const COOLDOWN_MS = 260

// iOS keeps audio in "call" mode (quiet, muffled) after the mic is released unless the
// session type is reset explicitly. Unsupported browsers simply ignore this.
function setAudioSession(type) {
  try {
    if (navigator.audioSession) navigator.audioSession.type = type
  } catch {
    // ignore
  }
}

// Blowing into a mic produces loud broadband noise concentrated in the low bins.
export function useBlowDetector(onBlow) {
  const [status, setStatus] = useState('idle')
  const [level, setLevel] = useState(0)
  const onBlowRef = useRef(onBlow)
  const cleanupRef = useRef(null)
  const startingRef = useRef(false)
  const aliveRef = useRef(true)

  useEffect(() => {
    onBlowRef.current = onBlow
  }, [onBlow])

  const release = useCallback(() => {
    const cleanup = cleanupRef.current
    cleanupRef.current = null
    if (!cleanup) return
    cleanup()
    setAudioSession('playback')
  }, [])

  const stop = useCallback(() => {
    release()
    setStatus('idle')
    setLevel(0)
  }, [release])

  const start = useCallback(async () => {
    if (cleanupRef.current || startingRef.current) return
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('unsupported')
      return
    }
    startingRef.current = true
    setAudioSession('play-and-record')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      if (!aliveRef.current) {
        stream.getTracks().forEach((t) => t.stop())
        setAudioSession('playback')
        return
      }
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 512
      ctx.createMediaStreamSource(stream).connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const bins = Math.floor(data.length * 0.25)

      let raf = 0
      let loud = 0
      let lastBlow = 0
      let lastLevelUpdate = 0

      const loop = (now) => {
        analyser.getByteFrequencyData(data)
        let sum = 0
        for (let i = 0; i < bins; i++) sum += data[i]
        const avg = sum / bins

        loud = avg > THRESHOLD ? loud + 1 : Math.max(0, loud - 1)
        if (loud >= SUSTAIN_FRAMES && now - lastBlow > COOLDOWN_MS) {
          lastBlow = now
          onBlowRef.current?.()
        }
        if (now - lastLevelUpdate > 80) {
          lastLevelUpdate = now
          setLevel(Math.min(1, avg / (THRESHOLD * 1.3)))
        }
        raf = requestAnimationFrame(loop)
      }
      raf = requestAnimationFrame(loop)

      cleanupRef.current = () => {
        cancelAnimationFrame(raf)
        stream.getTracks().forEach((t) => t.stop())
        ctx.close().catch(() => {})
      }
      setStatus('listening')
    } catch {
      setAudioSession('playback')
      setStatus('denied')
    } finally {
      startingRef.current = false
    }
  }, [])

  useEffect(() => {
    aliveRef.current = true
    return () => {
      aliveRef.current = false
      release()
    }
  }, [release])

  return { status, level, start, stop }
}
