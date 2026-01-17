'use client'
import { motion, AnimatePresence } from 'framer-motion'

import { useRef, useEffect, useCallback, useMemo } from 'react'
import { getVideoAndThumbnail } from '../videoHelper'
import Link from 'next/link'
import { Project, RoleItem, TypeItem, useProjectsStore } from '@/stores/projects'

const ProjectThumbnail = ({
  project,
  index,
  onThumbClick,
}: {
  project: Project
  index: number
  onThumbClick: (index: number) => void
}) => {
  const videoAndThumbnail = getVideoAndThumbnail(
    project.videosCollection.items[0]?.taskData || null
  )
  return (
    <div
      className="aspect-video h-12 w-auto flex-none  pointer-events-auto cursor-pointer "
      onClick={() => onThumbClick(index)}
    >
      {project.videosCollection.items.map((video: any) => (
        <img
          className="rounded-sm object-cover w-full h-full border-2 border-transparent hover:border-accent"
          key={video.taskData.videoSrc}
          src={videoAndThumbnail?.thumbnail?.url}
        />
      ))}
    </div>
  )
}

const ProjectVideo = ({
  project,
  index,
}: {
  project: Project
  index: number
}) => {
  const { selectedIndex, singleProject } = useProjectsStore(state => state);
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
    project.videosCollection.items[0]?.taskData || null
  )
  return (
    <Link
      href={`/${!singleProject ? project.slug : ''}`}
      className="absolute left-0 pointer-events-none"
      style={{
        visibility: index == selectedIndex ? 'visible' : 'hidden',
        pointerEvents: singleProject ? 'auto' : 'none',
      }}
    >
      <video
        ref={videoRef}
        key={videoAndThumbnail?.video?.url}
        className="w-full h-auto object-contain rounded-sm"
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
  const { projectList, selectedIndex, singleProject } = useProjectsStore(state => state);
  useEffect(() => {
    useProjectsStore.setState({ projectList: projects })
  }, [projects])

  const Projects = useMemo(() => {
    return projectList.length > 0 ? projectList : projects;
  }, [projectList, projects]);

  useEffect(() => {
    if(singleProject) {
      const index = Projects.findIndex(project => project.slug === singleProject.slug)
      if(index !== -1 && index !== selectedIndex) {
        const item = scrollContainerRef.current?.querySelector(`#item-${index}`)
        if (item) {
          item.scrollIntoView({ behavior: 'smooth' })
        }
      }
    }
    console.log(singleProject)
  }, [Projects, singleProject])

  const selectedProject = useMemo(() => {
    return Projects[selectedIndex];
  }, [Projects, selectedIndex]);

  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const leftTransformRef = useRef<HTMLDivElement>(null)
  const rightTransformRef = useRef<HTMLDivElement>(null)

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const scrollPer = (container.scrollLeft + 0) / container.scrollWidth
    const scrollPerNext =
      (container.scrollLeft + window.innerWidth + 10) / container.scrollWidth

    // Update transforms directly via refs to avoid re-renders
    if (leftTransformRef.current) {
      leftTransformRef.current.style.transform = `translateX(-${scrollPer * 100}%)`
    }
    if (rightTransformRef.current) {
      rightTransformRef.current.style.transform = `translateX(-${scrollPerNext * 100}%)`
    }

    useProjectsStore.setState({ selectedIndex: Math.round(Projects.length * scrollPer) })
  }, [Projects])

  useEffect(() => {
    if(projectList.length > 0) 
      handleScroll()
  }, [handleScroll, projectList])

  const handleClick = useCallback(() => {
    const nextItem = scrollContainerRef.current?.querySelector(
      `#item-${selectedIndex + 1}`
    )
    if (nextItem) {
      nextItem.scrollIntoView({ behavior: 'smooth' })
    } else {
      scrollContainerRef.current?.scrollTo({
        left: 0,
        behavior: 'smooth',
      })
    }
  }, [selectedIndex])
  const handleThumbClick = useCallback((index: number) => {
    const item = scrollContainerRef.current?.querySelector(`#item-${index}`)
    if (item) {
      item.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const textColor = useMemo(
    () => (selectedProject?.lightDark ? '#e3e3e3' : '#e3e3e3'),
    [selectedProject]
  )

  return (
    <>
      <div
        className="w-screen h-screen flex gap-1 relative z-10 pointer-events-none items-center"
        
      >
        <motion.div animate={{ opacity: singleProject ? 0 : 1 }} transition={{ duration: 0.75, ease: 'anticipate' }} className="basis-1/6 md:basis-1/4 flex gap-1 overflow-hidden">
          <div
            ref={leftTransformRef}
            className="flex gap-0 relative left-[16.665vw] md:left-[25vw] translate-x-0"
          >
            {Projects.map((project: Project, index: number) => (
              <ProjectThumbnail
                key={project.title}
                project={project}
                index={index}
                onThumbClick={handleThumbClick}
              />
            ))}
          </div>
        </motion.div>
        <div className="flex-1 flex flex-col gap-2 justify-center h-full">
          <div className="w-full flex-1 relative flex items-start justify-start max-md:justify-center">
            <h2 className=" leading-none pt-4 pointer-events-auto"><Link href="/">Andrew McCarthy</Link></h2>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.75, ease: 'anticipate' }} className="aspect-video w-full relative flex items-center justify-center">
            {Projects.map((project: Project, index: number) => (
              <ProjectVideo
                key={project.title}
                project={project}
                index={index}
              />
            ))}
          </motion.div>
          <div className="w-full relative flex flex-1 items-center md:items-end justify-center md:justify-start py-0 gap-4 leading-none ">
            <h1 className="max-md:pb-8 md:py-4 text-center">
              <Link href={`/${selectedProject?.slug || ''}`} className="pointer-events-auto">
                {selectedProject?.title}
              </Link>
            </h1>
          </div>
        </div>
        <motion.div
          initial={{ maxWidth: singleProject ? '0%' : '25%', opacity: 0 }}
          animate={{ maxWidth: singleProject ? '0%' : '25%', opacity: 1 }}
          transition={{ duration: 0.75, ease: 'anticipate' }}
          className="basis-1/6 md:basis-1/4 flex gap-0 overflow-hidden">
          
          <div
            ref={rightTransformRef}
            className="flex gap-0 relative"
          >
            {projectList.map((project: Project, index: number) => (
              <ProjectThumbnail
                key={project.title}
                project={project}
                index={index}
                onThumbClick={handleThumbClick}
              />
            ))}
          </div>
          
        </motion.div>
      </div>
      <div
        className="fixed z-5 top-0 left-1/2 -translate-x-1/2 overflow-x-auto w-screen h-screen snap-x snap-mandatory flex gap-1"
        style={{ cursor: !singleProject ? 'e-resize' : 'default' }}
        onScroll={handleScroll}
        onClick={handleClick}
        ref={scrollContainerRef}

      >
        {projectList.map((_, index) => (
          <div
            id={`item-${index}`}
            key={index}
            className="w-full h-full flex-none snap-center"
          ></div>
        ))}
      </div>
      <div
        className="fixed bottom-4 left-0 px-4 leading-none z-10 w-full flex justify-between items-baseline-last pointer-events-none"
      >
        <div className="text-xs whitespace-nowrap max-md:w-21">
          {selectedIndex + 1} / {projectList.length}
        </div>
        <div className="flex w-full gap-4 items-end leading-none justify-center text-center md:justify-end md:text-right">
          <Link
            href={`/${singleProject ? '' : selectedProject?.slug || ''}`}
            className="flex gap-4 pointer-events-auto group items-end"
          >
            <span className="w-full">
              {selectedProject?.roleCollection.items
                .map((role: RoleItem) => role.title)
                .join(', ')}
            </span>
            <span className="text-xs group-hover:text-accent max-md:hidden" dangerouslySetInnerHTML={{ __html: `[${singleProject ? '<span class="relative top-px">×</span>' : '<span class="relative -top-0.75">&hellip;</span>'}]` }}>
              
            </span>
          </Link>
        </div>
        <div className="md:hidden max-md:w-21 flex items-end justify-end">
          <span className="text-xs group-hover:text-accent" dangerouslySetInnerHTML={{ __html: `[${singleProject ? '<span class="relative top-px">×</span>' : '&hellip;'}]` }}></span>
        </div>
      </div>
      <button
        className="fixed top-4 right-4 z-10  leading-none link cursor-pointer"
      >
        info
      </button>
      <AnimatePresence>
      {singleProject && (
        <motion.div key={singleProject.slug} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.75, ease: 'anticipate' }} className="text-pretty md:w-3/14 fixed top-4 left-4 z-10 leading-none">
          <ul className="mb-8">
            {singleProject?.typeCollection?.items.map((type: TypeItem) => (
              <li key={type.title}>{type.title}</li>
            ))}
          </ul>
          
          {Array.isArray(singleProject?.description?.json?.content) && singleProject.description.json.content.map((content: any) => (
            <p className="leading-[1.2] normal-case" key={content.content[0].value}>{content.content.map((content: any) => content.value)}</p>
          ))}
        </motion.div>
      )}
      </AnimatePresence>
    </>
  )
}
