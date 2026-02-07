import { useEffect, useRef, useState } from 'react'

const ASCII_CHARS = '❍✫✧❀✿'

export function useAsciiScramble(text: string, duration = 600) {
  const [display, setDisplay] = useState(text)
  const rafRef = useRef<number>(0)
  const isFirstRender = useRef(true)

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      setDisplay(text)
    }

    if (!text) {
      setDisplay(text)
      return
    }

    const target = text
    const start = performance.now()

    const animate = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const resolvedCount = Math.floor(progress * target.length)

      let result = ''
      for (let i = 0; i < target.length; i++) {
        if (target[i] === ' ') {
          result += ' '
        } else if (i < resolvedCount) {
          result += target[i]
        } else {
          result += ASCII_CHARS[Math.floor(Math.random() * ASCII_CHARS.length)]
        }
      }

      setDisplay(result)

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      } else {
        setDisplay(target)
      }
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(rafRef.current)
  }, [text, duration])

  return display
}
