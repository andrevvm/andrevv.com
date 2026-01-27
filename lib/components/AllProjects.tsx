'use client'

import { motion } from 'framer-motion'
import { type Project, useProjectsStore } from '@/stores/projects'
import { useScrollState } from '@/stores/scroll'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getVideoAndThumbnail } from '@/lib/videoHelper'
import { useParams, usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import { useMediaQuery } from 'usehooks-ts'

gsap.registerPlugin(useGSAP)
gsap.registerPlugin(ScrollToPlugin)

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
      { once: true },
    )
    window.addEventListener(
      'scroll',
      () => {
        setHasInteracted(true)
      },
      { once: true },
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
      router.replace(isMobile ? `/` : `/${projects[scrollIndex].slug}`)
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
      {projects.map((project, idx) => (
        <div
          key={project.slug}
          id={`scroller-${idx}`}
          className="relative w-screen flex-none flex flex-col items-end justify-end p-4 snap-start leading-none gap-0.5"
          style={{
            height: `${100 / divider}%`,
          }}
        >
          <h1 className="max-md:hidden m-0">
            <Link href={project.slug}>{project.title}</Link>
          </h1>
          <h2 className="max-md:hidden m-0">
            <Link href={project.slug}>
              {project.roleCollection.items
                .map((role) => role.title)
                .join(', ')}
            </Link>
          </h2>
        </div>
      ))}
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
    project.videosCollection.items[0]?.taskData || null,
  )
  const { slug } = useParams()
  const router = useRouter()

  const handleThumbClick = useCallback(
    (e: React.MouseEvent) => {
      window.document.documentElement.style.scrollSnapType = 'none'

      e.preventDefault()
      gsap.to(window, {
        scrollTo: `#scroller-${index}`,
        overwrite: true,
        duration: 1,
        ease: 'power2.out',
        onComplete: () => {
          setTimeout(() => {
            window.document.documentElement.style.scrollSnapType = ''
          }, 100)
        },
      })
    },
    [slug, router, index],
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
          className="rounded-sm object-cover w-full h-full border-2 border-transparent hover:border-accent"
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
    project.videosCollection.items[0]?.taskData || null,
  )
  useEffect(() => {
    if (selectedIndex === idx) {
      videoRef.current?.play().catch((error) => {
        console.warn('Error playing video:', error)
      })
    } else {
      videoRef.current?.pause()
    }
  }, [selectedIndex, idx])
  const { slug } = useParams()
  return (
    <Link href={`/${slug ? '/' : project.slug}`}>
      <video
        ref={videoRef}
        style={{
          visibility: selectedIndex === idx ? 'visible' : 'hidden',
        }}
        src={videoAndThumbnail?.video?.url1080 || videoAndThumbnail?.video?.url}
        poster={
          videoAndThumbnail?.poster?.url || videoAndThumbnail?.thumbnail?.url
        }
        className="absolute left-1/2 -translate-x-1/2 h-full w-auto max-w-full object-cover rounded-sm"
        muted
        playsInline
        loop
      />
    </Link>
  )
}

export default function AllProjects({ projects }: { projects: Project[] }) {
  const { per, perNext } = useScrollState((state) => state)
  const { slug } = useParams()
  const isMobile = useMediaQuery('(max-width: 768px)', {
    defaultValue: false,
    initializeWithValue: false,
  })
  const pathname = usePathname()
  const router = useRouter()

  // Initialize store with projects on client side
  useEffect(() => {
    useProjectsStore.setState({ projectList: projects })
  }, [projects])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{
          width: `${slug && !isMobile ? (11 / 14) * 100 : (8 / 14) * 100}%`,
          filter:
            (slug && isMobile) || pathname === '/info' ? 'blur(10px)' : 'none',
          opacity: (slug && isMobile) || pathname === '/info' ? 0.8 : 1,
        }}
        transition={{
          duration: 0.5,
          ease: 'anticipate',
          filter: { duration: 0.5, ease: 'easeInOut' },
        }}
        className="fixed left-3/14 lg:left-3/14 h-screen w-8/14 flex flex-col items-center"
      >
        <Thumbnails top={true} per={per} projects={projects} />
        <motion.div
          initial={{ height: '50%' }}
          transition={{ duration: 0.5, ease: 'anticipate' }}
          animate={{ height: slug ? '75%' : '50%' }}
          className="max-md:basis-3/11 flex justify-center py-1 max-w-full"
        >
          <div className="aspect-video h-full w-auto relative">
            {projects.map((project, idx) => (
              <Video key={project.slug} project={project} idx={idx} />
            ))}
          </div>
        </motion.div>
        <Thumbnails per={perNext} projects={projects} />
      </motion.div>
      <Scroller projects={projects} />
    </>
  )
}
