import { useEffect, useMemo, useState } from 'react'

export function useTypewriter(segments, { speed = 34, startDelay = 600, enabled = true } = {}) {
  const { text, boundaries } = useMemo(() => {
    let offset = 0
    const ends = new Set()
    segments.forEach((s) => {
      offset += s.length
      ends.add(offset)
    })
    return { text: segments.join(''), boundaries: ends }
  }, [segments])

  const total = text.length
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!enabled || count >= total) return
    const prev = text[count - 1]
    let delay = speed
    if (count === 0) delay = startDelay
    else if (boundaries.has(count)) delay = speed * 18
    else if (/[.!?]/.test(prev)) delay = speed * 9
    else if (prev === ',') delay = speed * 5

    const id = setTimeout(() => setCount((c) => c + 1), delay)
    return () => clearTimeout(id)
  }, [count, total, text, boundaries, speed, startDelay, enabled])

  return { count, done: count >= total, skip: () => setCount(total) }
}
