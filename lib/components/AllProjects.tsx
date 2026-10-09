'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { type Project, useProjectsStore } from '@/stores/projects'
import { useScrollState } from '@/stores/scroll'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getVideoAndThumbnail } from '@/lib/videoHelper'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

import { useMediaQuery } from 'usehooks-ts'
import Renderer from './Renderer'
import ScrollIndicator from './ScrollIndicator'
import { scrollTo } from '../utils'

const getDimensions = (project: Project) => {
  const { video, poster } = getVideoAndThumbnail(
    project.videosCollection.items[0]?.taskData || null
  ) ?? {}
  const width = video?.width || poster?.width
  const height = video?.height || poster?.height
  return width && height ? { width, height } : { width: 16, height: 9 }
}

function Scroller({ projects }: { projects: Project[] }) {
  const divider = 1
  const [scrollY, setScrollY] = useState(0)
  const [scrollPer, setScrollPer] = useState(0)
  const [scrollPerNext, setScrollPerNext] = useState(0)
  const [scrollIndex, setScrollIndex] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)
  const isMobile = useMediaQuery('(max-width: 768px)', {
    defaultValue: false,
    initializeWithValue: false,
  })
  const { slug } = useParams()
  const router = useRouter()

  // update scroll y state
  const updateScrollY = () =>
    window.requestAnimationFrame(() => {
      setScrollY(window.scrollY)
    })

  //initiate on mount
  useEffect(() => {
    // call updateScrollPos on mount
    window.addEventListener('scroll', updateScrollY)
    updateScrollY()

    window.addEventListener(
      'click',
      () => {
        setHasInteracted(true)
      },
      { once: true }
    )
    window.addEventListener(
      'scroll',
      () => {
        setHasInteracted(true)
      },
      { once: true }
    )
  }, [])

  useEffect(() => {
    if (slug && !hasInteracted) {
      const index = projects.findIndex((project) => project.slug === slug)
      const element = document.getElementById(`scroller-${index}`)
      if (element) {
        element.scrollIntoView({ behavior: 'instant' })
      }
    }
  }, [projects])
  // scrollY updates
  useEffect(() => {
    const updateScrollState = () => {
      const scrollHeight = document.documentElement.scrollHeight
      const docHeight = document.documentElement.offsetHeight
      setScrollIndex(Math.round(scrollY / (docHeight / divider)))
      setScrollPer(scrollY / scrollHeight)
      setScrollPerNext((scrollY + docHeight / divider) / scrollHeight)
    }
    window.requestAnimationFrame(updateScrollState)
  }, [scrollY, divider])

  // update selected index on scroll index change
  useEffect(() => {
    useProjectsStore.setState({ selectedIndex: scrollIndex })
    if (!hasInteracted) return
    if (slug) {
      router.replace(`/${projects[scrollIndex].slug}`)
    }
  }, [scrollIndex, router, hasInteracted])

  // update store
  useEffect(() => {
    useScrollState.setState({
      y: scrollY,
      per: scrollPer,
      perNext: scrollPerNext,
    })
  }, [scrollY, scrollPer, scrollPerNext])

  return (
    <div className="flex flex-col gap-0 h-screen">
      {projects.map((project, idx: number) => {
        const { width, height } = getDimensions(project)
        const isVertical = height > width
        return (
          <div
            key={project.slug}
            id={`scroller-${idx}`}
            className="relative z-10 w-screen pointer-events-none flex-none flex flex-col items-center justify-center snap-start leading-none gap-0.5 overflow-hidden"
            style={{
              height: `${100 / divider}%`,
            }}
          >
            <motion.div
              initial={{
                scale: isMobile ? 0.66 : 0.33,
                opacity: 0,
              }}
              animate={{
                scale: slug
                  ? isMobile
                    ? 1
                    : 0.75
                  : isMobile
                    ? isVertical
                      ? 0.5
                      : 0.25
                    : isVertical ? 0.5 : 0.33,
                opacity: 1,
                transition: {
                  duration: 0.75,
                  ease: 'anticipate',
                },
              }}
              className="h-screen w-auto md:w-auto flex justify-center items-center"
              style={{ aspectRatio: `${width} / ${height}` }}
            >
              <Video project={project} idx={idx} />
            </motion.div>
          </div>
        )
      })}
      {Array.from({ length: divider - 1 }).map((_, index) => (
        <div
          key={index}
          className="w-screen flex-none snap-start bg-blue-500"
          style={{
            height: `${100 / divider}%`,
          }}
        ></div>
      ))}
    </div>
  )
}

const ProjectThumbnail = ({
  project,
  index,
}: {
  project: Project
  index: number
}) => {
  const videoAndThumbnail = getVideoAndThumbnail(
    project.videosCollection.items[0]?.taskData || null
  )
  const { slug } = useParams()
  const router = useRouter()

  const handleThumbClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      scrollTo(index)
    },
    [slug, router, index]
  )
  return (
    <Link
      href={`/${project.slug}`}
      className="aspect-video h-[12.4vh] w-auto flex-none pointer-events-auto cursor-pointer relative z-20"
      draggable={false}
      scroll={false}
      onClick={handleThumbClick}
    >
      {project.videosCollection.items.map((video: any) => (
        <img
          className="rounded-lg object-cover w-full h-full border-2 border-transparent hover:border-accent"
          key={videoAndThumbnail?.thumbnail?.url}
          src={videoAndThumbnail?.thumbnail?.url}
          draggable={false}
        />
      ))}
    </Link>
  )
}

export const Thumbnails = ({
  per,
  projects,
  top = false,
}: {
  per: number
  projects: Project[]
  top?: boolean
}) => {
  const isMobile = useMediaQuery('(max-width: 768px)', {
    defaultValue: false,
    initializeWithValue: false,
  })
  const { slug } = useParams()
  const topOffset = useMemo(() => {
    return top ? (isMobile ? `37.5vh` : slug ? `12.5vh` : `25vh`) : '0'
  }, [top, isMobile, slug])

  return (
    <div className="flex-1 block overflow-hidden items-center">
      <motion.div
        initial={{ opacity: 0, top: topOffset }}
        className="relative flex flex-col overflow-hidden items-center"
        animate={{ y: `-${per * 100}%`, top: topOffset, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'circOut' }}
      >
        {projects.map((project, idx) => (
          <ProjectThumbnail key={project.slug} project={project} index={idx} />
        ))}
      </motion.div>
    </div>
  )
}

const Video = ({ project, idx }: { project: Project; idx: number }) => {
  const selectedIndex = useProjectsStore((state) => state.selectedIndex)
  const videoRef = useRef<HTMLVideoElement>(null)
  const videoAndThumbnail = getVideoAndThumbnail(
    project.videosCollection.items[0]?.taskData || null
  )
  const { lowPower } = useProjectsStore((state) => state)

  useEffect(() => {
    if (selectedIndex === idx && lowPower !== true) {
      videoRef.current
        ?.play()
        .catch((error) => {
          if (error.toString().includes('NotAllowedError')) {
            useProjectsStore.setState({ lowPower: true })
          }
          console.warn('Error playing video:', error)
        })
        .then(() => {
          useProjectsStore.setState({ video: videoRef.current })
        })
    } else {
      if (!videoRef.current?.paused) {
        videoRef.current?.pause()
      }
    }
  }, [selectedIndex, idx, lowPower])
  const { slug } = useParams()
  const [waiting, setWaiting] = useState(false)

  const handleWait = () => {
    setWaiting(true)
  }
  const handlePlay = () => {
    setWaiting(false)
  }

  return (
    <>
      <Link
        href={`/${slug ? '/' : project.slug}`}
        className="pointer-events-auto w-full max-md:h-full flex items-center justify-center rounded-lg relative"
      >
        <AnimatePresence initial={true}>
          {(waiting || lowPower) && (
            <motion.div
              key="loading-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ in: { delay: 0.25 }, duration: 0.5 }}
              className="absolute z-10 inset-0 flex justify-center bg-[url(/halftone.png)] bg-repeat bg-size-[8px] md:bg-size-[16px] items-center"
            >
              <div className="absolute inset-0 animate-loading bg-linear-0 from-background from-5% via-transparent to-95% to-background"></div>
            </motion.div>
          )}
        </AnimatePresence>

        <video
          ref={videoRef}
          src={
            videoAndThumbnail?.video?.url1080 || videoAndThumbnail?.video?.url
          }
          poster={
            videoAndThumbnail?.poster?.url || videoAndThumbnail?.thumbnail?.url
          }
          crossOrigin="anonymous"
          className="max-md:h-full h-auto w-full m-auto object-cover bg-black object-center rounded-4xl transition-[height]"
          muted
          playsInline
          loop
          onWaiting={handleWait}
          onStalled={handleWait}
          onPlaying={handlePlay}
          onTimeUpdate={handlePlay}
          data-duration={videoAndThumbnail?.video.duration}
        >
          {project?.videosCollection.items.map((vid) => (
            <track
              key={`subtitles-${vid.id}`}
              default
              kind="captions"
              srcLang="en"
              src={vid.subtitles?.url || `/vtt/${project.slug}.vtt`}
            />
          ))}
        </video>
      </Link>
    </>
  )
}

export default function AllProjects({ projects }: { projects: Project[] }) {
  const { lowPower } = useProjectsStore((state) => state)
  // Initialize store with projects on client side
  useEffect(() => {
    useProjectsStore.setState({ projectList: projects })
  }, [projects])

  return (
    <>
      {lowPower && (
        <div className="flex fixed z-20 top-0 w-screen h-svh items-center justify-center">
          <button
            className="uppercase px-3 py-3 relative max-md:top-7 rounded-lg flex border-px text-center bg-background border-accent-trans cursor-pointer hover:text-accent leading-none"
            onClick={() => useProjectsStore.setState({ lowPower: false })}
          >
            ▶ Play
          </button>
        </div>
      )}

      <Scroller projects={projects} />
      <Renderer />
      <ScrollIndicator />
    </>
  )
}
