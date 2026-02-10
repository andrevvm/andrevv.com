'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Project,
  RoleItem,
  TypeItem,
  useProjectsStore,
} from '@/stores/projects'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useAsciiScramble } from '@/lib/hooks/useAsciiScramble'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)

export default function LayoutBottom({ projects }: { projects: Project[] }) {
  const { selectedIndex, video } = useProjectsStore((state) => state)
  const { slug } = useParams()
  const pathname = usePathname()

  const [track, setTrack] = useState('')
  const [progress, setProgress] = useState(0)
  const [showCredits, setShowCredits] = useState(false)

  const project = projects[selectedIndex]
  const title = useAsciiScramble(project?.title ?? '')
  const cc = useAsciiScramble(track)
  const roles = useMemo(
    () =>
      project?.roleCollection.items
        .map((role: RoleItem) => role.title)
        .join(', ') ?? '',
    [project]
  )
  const types = useMemo(
    () =>
      project?.typeCollection.items
        .map((type: TypeItem) => type.title)
        .join(', ') ?? '',
    [project]
  )
  const rolesDisplay = useAsciiScramble(roles)
  const typesDisplay = useAsciiScramble(types)

  const handleTextTracks = useCallback(() => {
    const cue = video?.textTracks[0]?.activeCues?.[0] as VTTCue
    console.log(video?.textTracks[0])
    setTrack(cue?.text || '')
    if (video) setProgress(video.currentTime / video.duration)
  }, [video])

  useEffect(() => {
    if (!video) return
    const tracks = video.textTracks[0]
    if (tracks) {
      // eslint-disable-next-line react-hooks/immutability -- DOM API, not state mutation
      tracks.mode = 'hidden'
    }
    video.addEventListener('timeupdate', handleTextTracks)
    return () => {
      video.removeEventListener('timeupdate', handleTextTracks)
    }
  }, [video, handleTextTracks])

  const nextCue = () => {
    const track = video?.textTracks[0]
    const activeCue = track?.activeCues?.[0] as VTTCue
    if (!track?.cues || !activeCue) return

    for (let i = 0; i < track.cues.length; i++) {
      if (track.cues[i] === activeCue) {
        const next = track.cues[i + 1] as VTTCue
        if (next && video) {
          video.currentTime = next.startTime
        } else {
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
        break
      }
    }
  }

  const previousCue = () => {
    const track = video?.textTracks[0]
    const activeCue = track?.activeCues?.[0] as VTTCue
    if (!track?.cues || !activeCue) return

    for (let i = 0; i < track.cues.length; i++) {
      if (track.cues[i] === activeCue) {
        const prev = track.cues[i - 1] as VTTCue
        if (prev) video!.currentTime = prev.startTime
        break
      }
    }
  }

  const cuesArray = useMemo(() => {
    const arr = []
    const length = video?.textTracks[0]?.cues?.length || 0
    for (let i = 0; i < length; i++) {
      arr.push(video?.textTracks?.[0]?.cues?.[i])
    }
    return arr
  }, [video])

  return (
    <motion.div
      animate={{ opacity: pathname === '/info' ? 0 : 1 }}
      className="fixed bottom-0 pointer-events-none left-0 w-full z-35 p-5 md:p-13.25 leading-none bg-none flex items-end justify-end gap-y-2"
    >
      <div className="flex-1 flex flex-col items-center justify-end">
        <AnimatePresence initial={true} mode="wait">
          {(project || !slug) && (
            <motion.div
              key={`title-text`}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden flex-col gap-y-0"
            >
              <div className="flex-1 flex justify-center items-end">
                <Link
                  href={`/${project.slug}`}
                  className="pointer-events-auto bg-background rounded-sm py-1.5 px-3"
                >
                  {title}
                </Link>
              </div>
              <div className="flex justify-center text-center">
                <div className="pointer-events-auto bg-background rounded-sm py-1.5 px-3">
                  {rolesDisplay}
                </div>
              </div>
              <AnimatePresence>
                {slug && showCredits && (
                  <motion.div
                    key={`type-text`}
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden flex-col gap-y-0"
                  >
                    <div className="flex flex-col justify-center items-center text-center">
                      <div className="inline-flex pointer-events-auto bg-background rounded-sm py-1.5 px-3">
                        Tech: {typesDisplay}
                      </div>
                      <div className="inline-flex pointer-events-auto bg-background rounded-sm py-1.5 px-3">
                        Design: Daniel Baer
                      </div>
                      <div className="inline-flex pointer-events-auto bg-background rounded-sm py-1.5 px-3">
                        In partnership with No Plans
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence initial={true} mode="wait">
          {slug && track !== '' && cc.length > 0 && (
            <motion.div
              key={`cc-${project.slug}`}
              initial={{ height: 0 }}
              animate={{
                height: track === '' ? '0px' : 'auto',
              }}
              exit={{ height: 0 }}
              className="overflow-hidden flex flex-col"
            >
              <div className="flex gap-x-3 items-center pointer-events-auto select-none">
                <button
                  className="flex text-accent text-[18px] flex-1 leading-none cursor-pointer hover:text-accent-trans active:text-white"
                  onClick={previousCue}
                >
                  ◀
                </button>
                <div className="flex relative overflow-hidden justify-center text-center text-black py-1.5 pb-2 px-3 bg-light rounded-sm md:w-200 cursor-default">
                  {cc}
                  <motion.div
                    animate={{
                      width: `${progress * 100}%`,
                    }}
                    transition={{ duration: 0.25, ease: 'linear' }}
                    className="absolute bottom-0 left-0 h-[2px] bg-accent"
                  ></motion.div>
                  {cuesArray.map((cue, i) => {
                    console.log(cue?.startTime, video?.duration)
                    return (
                      <div
                        key={`cue-${i}`}
                        className="w-[6px] h-[2px] absolute bottom-0 bg-accent"
                        style={{
                          left: video?.duration
                            ? `${((cue?.startTime || 0) / video?.duration) * 100}%`
                            : 0,
                        }}
                      ></div>
                    )
                  })}
                </div>
                <button
                  className="flex text-accent text-[18px] flex-1 leading-none cursor-pointer hover:text-accent-trans active:text-white"
                  onClick={nextCue}
                >
                  ▶
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: slug ? 1 : 0 }}
          className="absolute bottom-0 right-0 p-5 md:p-13.25"
        >
          <button
            className="pointer-events-auto bg-background rounded-sm py-1.5 px-3 lowercase cursor-pointer hover:text-accent"
            onClick={() => {
              setShowCredits(!showCredits)
            }}
          >
            {useAsciiScramble(showCredits ? 'Hide' : 'Credits')}
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
