'use client'
import { motion } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'

const ProjectThumbnail = ({
  project,
  index,
  onThumbClick,
}: {
  project: any
  index: number
  onThumbClick: (index: number) => void
}) => {
  return (
    <div
      className="aspect-video h-12 w-auto flex-none  pointer-events-auto cursor-pointer"
      onClick={() => onThumbClick(index)}
    >
      {project.mediaCollection.items.map((media: any) => (
        <video
          className="rounded-sm object-cover w-full h-full"
          key={media.url}
          src={media.url}
          muted
          loop
          playsInline
        />
      ))}
    </div>
  )
}

const ProjectVideo = ({
  project,
  index,
  scrollIndex,
}: {
  project: any
  index: number
  scrollIndex: number
}) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  useEffect(() => {
    if (index === scrollIndex) {
      videoRef.current
        ?.play()
        .catch((error) => {
          console.error('Error playing video:', error)
        })
        .then(() => {
          console.log('video playing')
        })
      console.log('play video', index)
    } else {
      videoRef.current?.pause()
    }
  }, [videoRef, index, scrollIndex])
  return (
    <video
      ref={videoRef}
      style={{
        opacity: index == scrollIndex ? 1 : 0,
      }}
      key={project.mediaCollection.items[0].url}
      className="absolute left-0 w-full h-auto max-h-[90vh] object-contain rounded-sm"
      src={project.mediaCollection.items[0].url}
      muted
      loop
      playsInline
    />
  )
}

export default function ProjectScroller({ projects }: { projects: any[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const leftTransformRef = useRef<HTMLDivElement>(null)
  const rightTransformRef = useRef<HTMLDivElement>(null)
  const [scrollIndex, setScrollIndex] = useState(0)
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current
    if (!container) return
    const scrollPer =
      (container.scrollLeft + projects.length * 2) / container.scrollWidth
    const scrollPerNext =
      (container.scrollLeft + window.innerWidth + 20) / container.scrollWidth

    // Update transforms directly via refs to avoid re-renders
    if (leftTransformRef.current) {
      leftTransformRef.current.style.transform = `translateX(-${scrollPer * 100}%)`
    }
    if (rightTransformRef.current) {
      rightTransformRef.current.style.transform = `translateX(-${scrollPerNext * 100}%)`
    }

    setScrollIndex(Math.round(projects.length * scrollPer))
  }, [projects])

  useEffect(() => {
    handleScroll()
  }, [handleScroll])

  const handleClick = useCallback(() => {
    const nextItem = scrollContainerRef.current?.querySelector(
      `#item-${scrollIndex + 1}`
    )
    if (nextItem) {
      nextItem.scrollIntoView({ behavior: 'smooth' })
    } else {
      scrollContainerRef.current?.scrollTo({
        left: 0,
        behavior: 'smooth',
      })
    }
  }, [scrollIndex])
  const handleThumbClick = useCallback((index: number) => {
    const item = scrollContainerRef.current?.querySelector(`#item-${index}`)
    if (item) {
      item.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  return (
    <>
      <div
        className="w-screen h-screen flex gap-1 relative z-10 pointer-events-none items-center"
        style={{
          backgroundColor: projects[scrollIndex].lightDark
            ? '#0c0c0c'
            : '#e3e3e3',
        }}
      >
        <div className="flex-1 flex gap-1 overflow-hidden">
          <div
            ref={leftTransformRef}
            className="flex gap-1 relative left-[25vw] translate-x-0"
          >
            {projects.map((project: any, index: number) => (
              <ProjectThumbnail
                key={project.title}
                project={project}
                index={index}
                onThumbClick={handleThumbClick}
              />
            ))}
          </div>
        </div>
        <div className="basis-2/3 md:basis-1/2 flex flex-col gap-2 justify-center h-full text-white">
          <div className="w-full flex-1 relative flex items-start justify-start">
            <h2 className="mix-blend-difference leading-none pt-4">
              Andrew McCarthy
            </h2>
          </div>
          <div className="aspect-video w-full relative flex items-center justify-center">
            {projects.map((project: any, index: number) => (
              <ProjectVideo
                key={project.title}
                project={project}
                index={index}
                scrollIndex={scrollIndex}
              />
            ))}
          </div>
          <div className="w-full relative flex flex-1 items-end md:items-end justify-center md:justify-start py-0">
            <h1 className="mix-blend-difference leading-none py-20 md:py-4">
              {projects[scrollIndex].title}
            </h1>
          </div>
        </div>
        <div className="flex-1 flex gap-1 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            ref={rightTransformRef}
            className="flex gap-1 relative"
          >
            {projects.map((project: any, index: number) => (
              <ProjectThumbnail
                key={project.title}
                project={project}
                index={index}
                onThumbClick={handleThumbClick}
              />
            ))}
          </motion.div>
        </div>
      </div>
      <div
        className="fixed z-5 top-0 left-1/2 -translate-x-1/2 overflow-x-auto w-screen h-screen snap-x snap-mandatory flex gap-1 cursor-e-resize"
        onScroll={handleScroll}
        onClick={handleClick}
        ref={scrollContainerRef}
      >
        {projects.map((_, index) => (
          <div
            id={`item-${index}`}
            key={index}
            className="w-full h-full flex-none snap-center"
          ></div>
        ))}
      </div>
      <div className="fixed bottom-4 left-0 px-4 mix-blend-difference text-white leading-none z-10 w-full flex justify-between items-end">
        <div className="text-xs whitespace-nowrap">
          {scrollIndex + 1} / {projects.length}
        </div>
        <div className="flex w-full gap-4 items-end leading-none justify-center text-center md:justify-end md:text-right">
          <span className="w-full">
            {projects[scrollIndex].roleCollection.items
              .map((role: any) => role.title)
              .join(', ')}
          </span>
          <button className="text-xs">[&hellip;]</button>
        </div>
      </div>
      <button className="fixed top-4 right-4 z-10 mix-blend-difference text-white leading-none">
        info
      </button>
    </>
  )
}
