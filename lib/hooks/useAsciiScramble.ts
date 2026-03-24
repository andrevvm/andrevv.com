import { useEffect, useRef, useState } from 'react'

const ASCII_CHARS = '◦✫✧❀✿❁'

export function useAsciiScramble(text: string, duration = 600) {
  const [display, setDisplay] = useState(text)
  const rafRef = useRef<number>(0)
  const prevTextRef = useRef(text)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      setDisplay(text)
      prevTextRef.current = text
      return
    }

    if (!text && !prevTextRef.current) {
      setDisplay(text)
      return
    }

    const prev = prevTextRef.current
    const target = text
    const halfDuration = duration / 2
    const start = performance.now()

    const fps = 24
    const interval = 1000 / fps
    let lastFrame = 0

    const animate = (now: number) => {
      if (now - lastFrame < interval) {
        rafRef.current = requestAnimationFrame(animate)
        return
      }
      lastFrame = now

      const elapsed = now - start
      const totalProgress = Math.min(elapsed / duration, 1)

      let result = ''

      if (elapsed < halfDuration) {
        // Phase 1: scramble out the old text
        const outProgress = Math.min(elapsed / halfDuration, 1)
        const scrambledCount = Math.floor(outProgress * prev.length)

        for (let i = 0; i < prev.length; i++) {
          if (prev[i] === ' ') {
            result += ' '
          } else if (i < scrambledCount) {
            result +=
              ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
          } else {
            result += prev[i]
          }
        }
      } else {
        // Phase 2: scramble in the new text
        const inProgress = Math.min((elapsed - halfDuration) / halfDuration, 1)
        const resolvedCount = Math.floor(inProgress * target.length)

        for (let i = 0; i < target.length; i++) {
          if (target[i] === ' ') {
            result += ' '
          } else if (i < resolvedCount) {
            result += target[i]
          } else {
            result +=
              ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
          }
        }
      }

      setDisplay(result)

      if (totalProgress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(target)
        prevTextRef.current = target
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafRef.current)
  }, [text, duration])

  return display
}
