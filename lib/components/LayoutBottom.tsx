'use client'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Project, RoleItem, useProjectsStore } from '@/stores/projects'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useAsciiScramble } from '@/lib/hooks/useAsciiScramble'

export default function LayoutBottom({ projects }: { projects: Project[] }) {
  const { selectedIndex, video } = useProjectsStore((state) => state)
  const { slug } = useParams()
  const pathname = usePathname()

  const [track, setTrack] = useState('')

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
  const rolesDisplay = useAsciiScramble(roles)

  const handleTextTracks = useCallback(() => {
    const cue = video?.textTracks[0]?.activeCues?.[0] as VTTCue
    setTrack(cue?.text || '')
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

  useEffect(() => {
    console.log(track === '')
  }, [track])

  return (
    <motion.div
      animate={{ opacity: pathname === '/info' ? 0 : 1 }}
      className="fixed bottom-0 pointer-events-none left-0 w-full z-35 p-5 md:p-13.25 leading-none bg-none flex items-end justify-end gap-y-2"
    >
      <div className="flex-1 flex flex-col items-center justify-end">
        <AnimatePresence initial={true} mode="wait">
          {((project && track === '') || !slug) && (
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
                  className="pointer-events-auto bg-background rounded-t-sm rounded-b-0 py-1.5 px-3"
                >
                  {title}
                </Link>
              </div>
              <div className="flex justify-center text-center">
                <div className="pointer-events-auto bg-background rounded-sm py-1.5 px-3">
                  {rolesDisplay}
                </div>
              </div>
            </motion.div>
          )}

          {slug && track !== '' && (
            <motion.div
              key={`cc-${project.slug}`}
              initial={{ height: 0 }}
              animate={{ height: track === '' ? '0px' : 'auto' }}
              exit={{ height: 0 }}
              className="overflow-hidden bg-accent rounded-sm"
            >
              <div className="flex justify-center text-center text-black rounded-sm py-1.5 px-3 lowercase">
                {cc}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
