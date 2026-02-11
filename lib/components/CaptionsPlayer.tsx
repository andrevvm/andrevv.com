'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion, stagger } from 'framer-motion'
import { useProjectsStore } from '@/stores/projects'
import { useParams } from 'next/navigation'
import { useAsciiScramble } from '@/lib/hooks/useAsciiScramble'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)

export default function CaptionsPlayer() {
  const { video } = useProjectsStore((state) => state)
  const { slug } = useParams()

  const [track, setTrack] = useState('')
  const [progress, setProgress] = useState(0)
  const [currentCueIndex, setCurrentCueIndex] = useState(-1)
  const seekingRef = useRef(false)

  const cc = useAsciiScramble(track)

  const cuesArray = useMemo(() => {
    const arr = []
    const length = video?.textTracks[0]?.cues?.length || 0
    for (let i = 0; i < length; i++) {
      arr.push(video?.textTracks?.[0]?.cues?.[i])
    }
    return arr
  }, [video])

  const handleTimeUpdate = useCallback(() => {
    if (video) setProgress(video.currentTime / video.duration)
    const selectedIndex = cuesArray.findIndex((cue) => {
      if (cue && video) {
        return (
          video?.currentTime >= cue.startTime &&
          video.currentTime <= cue?.endTime
        )
      } else {
        return -1
      }
    })
    setCurrentCueIndex(selectedIndex)
  }, [cuesArray, setCurrentCueIndex, video])

  useEffect(() => {
    if (currentCueIndex === -1) return

    setTrack((cuesArray[currentCueIndex] as VTTCue)?.text || '')
  }, [cuesArray, currentCueIndex])

  useEffect(() => {
    if (!video) return
    const tracks = video.textTracks[0]
    if (tracks) {
      // eslint-disable-next-line react-hooks/immutability -- DOM API, not state mutation
      tracks.mode = 'hidden'
    }
    const onSeeked = () => {
      seekingRef.current = false
    }
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('seeked', onSeeked)
    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('seeked', onSeeked)
    }
  }, [video, handleTimeUpdate])

  const seekTo = useCallback(
    (index: number) => {
      if (!video || !cuesArray[index]) return false
      // eslint-disable-next-line react-hooks/immutability -- DOM API, not state mutation
      video.currentTime = (cuesArray[index] as VTTCue).startTime
      return true
    },
    [cuesArray, video]
  )

  const nextCue = useCallback(() => {
    if (currentCueIndex < 0) return

    if (!seekTo(currentCueIndex + 1)) {
      gsap.to(window, {
        scrollTo: window.scrollY + window.innerHeight,
        overwrite: true,
        duration: 1,
        ease: 'power2.out',
        onStart: () => {
          window.document.documentElement.style.scrollSnapType = 'none'
        },
        onComplete: () => {
          setTimeout(() => {
            window.document.documentElement.style.scrollSnapType = ''
          }, 100)
        },
      })
    }
  }, [currentCueIndex, seekTo])

  const previousCue = useCallback(() => {
    if (currentCueIndex <= 0) {
      seekTo(0)
      return
    }
    seekTo(currentCueIndex - 1)
  }, [currentCueIndex, seekTo])

  return (
    <AnimatePresence initial={true} mode="wait">
      {slug && track !== '' && cc.length > 0 && (
        <motion.div
          key={`cc`}
          initial={{ height: 0 }}
          animate={{
            height: 'auto',
          }}
          exit={{ height: 0 }}
          className="overflow-hidden flex flex-col origin-bottom"
        >
          <div className="flex gap-x-3 items-stretch pointer-events-auto select-none">
            <div
              key="player"
              className="flex relative overflow-hidden justify-center text-center text-black py-1.5 pb-3.5 bg-light rounded-sm md:w-220 cursor-default"
            >
              <button
                className="flex items-center text-accent text-[18px] px-5 flex-1 leading-none cursor-pointer hover:text-background active:text-white"
                onClick={previousCue}
              >
                ◀
              </button>
              {cc}
              <button
                className="flex items-center text-accent text-[18px] px-5 flex-1 leading-none cursor-pointer hover:text-background active:text-white"
                onClick={nextCue}
              >
                ▶
              </button>
              <motion.div
                animate={{
                  width: `${progress * 100}%`,
                }}
                transition={{ duration: 0.25, ease: 'linear' }}
                className="absolute bottom-[0.5px] left-0 h-1.5 bg-accent rounded-none pr-4 box-content"
              ></motion.div>
              <AnimatePresence mode="wait">
                {cuesArray.map((cue, i) => {
                  return (
                    <motion.div
                      key={`cue-${i}`}
                      className="w-4 h-1.5 hover:h-4 transition-[height] duration-150 ease-out absolute bottom-[0.5px] bg-light mix-blend-difference rounded-none origin-bottom cursor-pointer"
                      initial={{
                        scaleY: 0,
                        left: video?.duration
                          ? `${((cue?.startTime || 0) / video?.duration) * 100}%`
                          : 0,
                      }}
                      animate={{
                        scaleY: 1,
                        left: video?.duration
                          ? `${((cue?.startTime || 0) / video?.duration) * 100}%`
                          : 0,
                      }}
                      exit={{
                        scaleY: 0,
                      }}
                      transition={{
                        delay: i * 0.1,
                        duration: 0.5,
                        ease: 'anticipate',
                      }}
                      onClick={() => seekTo(i)}
                    ></motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
