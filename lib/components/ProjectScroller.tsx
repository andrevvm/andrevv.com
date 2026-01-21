'use client'
import { motion } from 'framer-motion'

import { useRef, useEffect, useCallback, useMemo, useState } from 'react'
import { useMediaQuery } from 'usehooks-ts'
import { getVideoAndThumbnail } from '../videoHelper'
import Link from 'next/link'
import { Project, RoleItem, useProjectsStore } from '@/stores/projects'
import { useRouter, usePathname, useParams } from 'next/navigation'

const ProjectThumbnail = ({
  project,
  index,
  onThumbClick,
}: {
  project: Project
  index: number
  onThumbClick: (e: React.MouseEvent, index: number) => void
}) => {
  const videoAndThumbnail = getVideoAndThumbnail(
    project.videosCollection.items[0]?.taskData || null,
  )
  return (
    <Link
      href={`/${project.slug}`}
      className="aspect-video h-12 w-auto flex-none pointer-events-auto cursor-pointer relative z-20"
      onClick={(e) => onThumbClick(e, index)}
      draggable={false}
    >
      {project.videosCollection.items.map((video: any) => (
        <img
          className="rounded-sm object-cover w-full h-full border-2 border-transparent hover:border-accent"
          key={video.taskData.videoSrc}
          src={videoAndThumbnail?.thumbnail?.url}
          draggable={false}
        />
      ))}
    </Link>
  )
}

const ProjectVideo = ({
  project,
  index,
}: {
  project: Project
  index: number
}) => {
  const { selectedIndex } = useProjectsStore((state) => state)
  const { slug } = useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (index === selectedIndex) {
      videoRef.current?.play().catch((error) => {
        console.error('Error playing video:', error)
      })
    } else {
      videoRef.current?.pause()
    }
  }, [videoRef, index, selectedIndex])

  const videoAndThumbnail = getVideoAndThumbnail(
    project.videosCollection.items[0]?.taskData || null,
  )
  return (
    <Link
      href={`/${!slug ? project.slug : ''}`}
      className="absolute left-0 pointer-events-auto max-md:h-full max-md:w-full flex justify-center"
      style={{
        visibility: index == selectedIndex ? 'visible' : 'hidden',
      }}
    >
      <video
        ref={videoRef}
        key={videoAndThumbnail?.video?.url}
        className="max-md:h-full max-md:w-auto object-top w-full h-auto object-cover md:object-contain rounded-sm relative max-h-[calc(100vh-100px)]"
        src={videoAndThumbnail?.video?.url}
        muted
        loop
        playsInline
        preload="auto"
      />
    </Link>
  )
}

export default function ProjectScroller({ projects }: { projects: Project[] }) {
  const router = useRouter()
  const { slug } = useParams()

  const { projectList, selectedIndex } = useProjectsStore((state) => state)

  useEffect(() => {
    useProjectsStore.setState({ projectList: projects })
  }, [projects])

  const Projects = useMemo(() => {
    return projectList.length > 0 ? projectList : projects
  }, [projectList, projects])
  const isMobile = useMediaQuery('(max-width: 768px)')

  const selectedProject = slug
    ? projects.find((project) => project.slug === slug)
    : Projects[selectedIndex]

  useEffect(() => {
    const gotoSlug = projectList[selectedIndex]?.slug
    if (slug && gotoSlug !== slug && gotoSlug) {
      router.replace(`/${gotoSlug}`)
    }
  }, [selectedIndex, router])

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const leftTransformRef = useRef<HTMLDivElement>(null)
  const rightTransformRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const index = Projects.findIndex((project) => project.slug === slug)
    const item = scrollContainerRef.current?.querySelector(`#item-${index}`)
    console.log(index, item)
    if (item) {
      const rect = item.getBoundingClientRect()
      const scrollX = isMobile ? 0 : window.scrollX + rect.left
      const scrollY = isMobile ? window.scrollY + rect.top : 0
      window.scrollTo({ left: scrollX, top: scrollY, behavior: 'instant' })
    }
  }, [Projects, slug, isMobile])

  const [scrollPer, setScrollPer] = useState(0)
  const [scrollPerNext, setScrollPerNext] = useState(0)

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return

    const totalScrollable = isMobile
      ? container.offsetHeight
      : container.offsetWidth
    const viewportSize = isMobile ? window.innerHeight : window.innerWidth
    const scrollPos = isMobile ? window.scrollY : window.scrollX

    const scrollPer = totalScrollable > 0 ? scrollPos / totalScrollable : 0
    const scrollPerNext =
      totalScrollable > 0 ? (scrollPos + viewportSize) / totalScrollable : 0
    window.requestAnimationFrame(() => {
      setScrollPer(scrollPer)
      setScrollPerNext(scrollPerNext)
      // if (leftTransformRef.current) {
      //   if (isMobile) {
      //     leftTransformRef.current.style.transform = `translateY(-${scrollPer * 100}%)`
      //   } else {
      //     leftTransformRef.current.style.transform = `translateX(-${scrollPer * 100}%)`
      //   }
      // }
      // if (rightTransformRef.current) {
      //   if (isMobile) {
      //     rightTransformRef.current.style.transform = `translateY(-${scrollPerNext * 100}%)`
      //   } else {
      //     rightTransformRef.current.style.transform = `translateX(-${scrollPerNext * 100}%)`
      //   }
      // }

      useProjectsStore.setState({
        selectedIndex: Math.round(Projects.length * scrollPer),
      })
    })
  }, [Projects, isMobile])

  useEffect(() => {
    if (projectList.length > 0) handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll, projectList])

  const handleThumbClick = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.preventDefault()
      const item = scrollContainerRef.current?.querySelector(`#item-${index}`)
      if (item) {
        const rect = item.getBoundingClientRect()
        const scrollX = isMobile ? 0 : window.scrollX + rect.left
        const scrollY = isMobile ? window.scrollY + rect.top : 0
        window.scrollTo({ left: scrollX, top: scrollY, behavior: 'smooth' })
      }
    },
    [isMobile],
  )

  return (
    <>
      <div className="md:hidden fixed top-0 left-0 z-20 p-4 leading-none">
        <Link href="/">Andrew McCarthy</Link>
      </div>
      <div className="fixed top-0 left-0 w-screen h-screen flex max-md:flex-col gap-1 z-10 items-center max-md:px-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: slug && !isMobile ? 0 : 1 }}
          transition={{ duration: 0.75, ease: 'anticipate' }}
          className="max-md:h-1/3 md:basis-1/4 md:flex gap-1 overflow-hidden"
        >
          <motion.div
            animate={{
              x: `-${isMobile ? 0 : scrollPer * 100}%`,
              y: `-${isMobile ? scrollPer * 100 : 0}%`,
            }}
            transition={{ duration: 0.0, ease: 'circOut' }}
            className="flex max-md:flex-col gap-0 relative max-md:top-[33.33vh] md:left-[25vw] translate-x-0"
          >
            {Projects.map((project: Project, index: number) => (
              <ProjectThumbnail
                key={project.title}
                project={project}
                index={index}
                onThumbClick={handleThumbClick}
              />
            ))}
          </motion.div>
        </motion.div>
        <div className="flex-1 flex flex-col gap-2 justify-center h-full max-md:w-full">
          <div className="max-md:hidden w-full flex-1 relative flex items-start justify-start max-md:justify-center">
            <h2 className="leading-none pt-4 pointer-events-auto">
              <Link href={`/${slug ? '' : selectedProject?.slug || '/'}`}>
                {selectedProject?.title}
              </Link>
            </h2>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.75, ease: 'anticipate' }}
            className="md:aspect-video max-md:h-full w-full relative flex items-center justify-center"
          >
            {Projects.map((project: Project, index: number) => (
              <ProjectVideo
                key={project.title}
                project={project}
                index={index}
              />
            ))}
          </motion.div>
          <div className="max-md:hidden w-full relative flex flex-1 items-center md:items-end justify-center md:justify-start py-0 gap-4 leading-none "></div>
        </div>
        <motion.div
          initial={{ maxWidth: slug && !isMobile ? '8%' : '25%', opacity: 0 }}
          animate={{ maxWidth: slug && !isMobile ? '8%' : '25%', opacity: 1 }}
          transition={{ duration: 1, ease: 'anticipate' }}
          className="basis-1/3 md:basis-1/4 flex max-md:flex-col gap-0 overflow-hidden"
        >
          <motion.div
            animate={{
              x: `-${isMobile ? 0 : scrollPerNext * 100}%`,
              y: `-${isMobile ? scrollPerNext * 100 : 0}%`,
            }}
            transition={{ duration: 0.1, ease: 'circOut' }}
            className="flex max-md:flex-col gap-0 relative"
          >
            {projectList.map((project: Project, index: number) => (
              <ProjectThumbnail
                key={project.title}
                project={project}
                index={index}
                onThumbClick={handleThumbClick}
              />
            ))}
          </motion.div>
        </motion.div>
      </div>
      <div
        className="absolute z-5 top-0 left-0 max-md:w-screen md:h-screen flex max-md:flex-col md:flex-row"
        ref={scrollContainerRef}
      >
        {projectList.map((_, index) => (
          <div
            id={`item-${index}`}
            key={index}
            className="w-screen h-screen flex-none snap-start flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          ></div>
        ))}
      </div>
      <div className="fixed bottom-0 max-md:h-30 pb-1 md:pb-4 max-md:bg-linear-to-b from-transparent to-60% to-background left-0 px-4 leading-none z-10 w-full flex gap-2 justify-between items-baseline-last pointer-events-none">
        <div className="basis-1/3 max-md:hidden">
          <Link href="/">Andrew McCarthy</Link>
        </div>
        {projectList.length > 0 && (
          <div className="text-xs whitespace-nowrap max-md:w-21 max-md:hidden">
            {selectedIndex + 1} / {projectList.length}
          </div>
        )}
        <div className="flex w-full gap-4 items-end leading-none justify-center text-center md:justify-end md:text-right">
          <Link
            href={`/${slug ? '' : selectedProject?.slug || ''}`}
            className="flex max-md:flex-col gap-x-4 gap-y-2 pointer-events-auto group items-end max-md:items-center"
          >
            <span className="pb-0 md:hidden">{selectedProject?.title}</span>
            <span className="w-full">
              {selectedProject?.roleCollection.items
                .map((role: RoleItem) => role.title)
                .join(', ')}
            </span>
          </Link>
        </div>
      </div>
      <div className="fixed top-0 left-0 w-full z-10 pointer-events-none md:hidden bg-linear-to-b from-background to-transparent h-30 from-30%"></div>

      <button className="fixed top-4 right-4 z-10  leading-none link cursor-pointer">
        info
      </button>
    </>
  )
}
