'use client'

import { motion } from 'framer-motion'
import { type Project, RoleItem, useProjectsStore } from '@/stores/projects'
import { useScrollState } from '@/stores/scroll'
import { useEffect, useRef, useState } from 'react'
import { getVideoAndThumbnail } from '@/lib/videoHelper'
import Link from 'next/link'

function Scroller({ projects }: { projects: Project[] }) {
  const divider = 1
  const [scrollY, setScrollY] = useState(0)
  const [scrollPer, setScrollPer] = useState(0)
  const [scrollPerNext, setScrollPerNext] = useState(0)
  const [scrollIndex, setScrollIndex] = useState(0)

  // update scroll y state
  const updateScrollY = () =>
    window.requestAnimationFrame(() => {
      setScrollY(window.scrollY)
    })

  useEffect(() => {
    // call updateScrollPos on mount
    window.addEventListener('scroll', updateScrollY)
    updateScrollY()
  }, [])

  // scrollY updates
  useEffect(() => {
    const updateScrollState = () => {
      const scrollHeight = document.documentElement.scrollHeight
      setScrollIndex(Math.round(scrollY / (window.innerHeight / divider)))
      setScrollPer(scrollY / scrollHeight)
      setScrollPerNext((scrollY + window.innerHeight / divider) / scrollHeight)
    }
    window.requestAnimationFrame(updateScrollState)
  }, [scrollY, divider])

  // update selected index on scroll index change
  useEffect(() => {
    useProjectsStore.setState({ selectedIndex: scrollIndex })
  }, [scrollIndex])

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
      {projects.map((project) => (
        <div
          key={project.slug}
          className="w-screen flex-none flex items-end px-4 snap-start "
          style={{
            height: `${100 / divider}%`,
          }}
        ></div>
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
  return (
    <Link
      href={`/${project.slug}`}
      className="aspect-video h-[12.4vh] w-auto flex-none pointer-events-auto cursor-pointer relative z-20"
      draggable={false}
      scroll={false}
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

export const Thumbnails = ({
  per,
  projects,
  top = false,
}: {
  per: number
  projects: Project[]
  top?: boolean
}) => {
  return (
    <div className="h-1/4 block overflow-hidden items-center">
      <motion.div
        className="relative flex flex-col overflow-hidden items-center"
        animate={{ y: `-${per * 100}%` }}
        transition={{ duration: 0 }}
        style={{
          top: top ? `25vh` : '0',
        }}
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
  useEffect(() => {
    if (selectedIndex === idx) {
      videoRef.current?.play()
    } else {
      videoRef.current?.pause()
    }
  }, [selectedIndex, idx])
  return (
    <video
      ref={videoRef}
      style={{
        visibility: selectedIndex === idx ? 'visible' : 'hidden',
      }}
      src={project.videosCollection.items[0]?.taskData?.videoSrc}
      className="absolute left-1/2 -translate-x-1/2 h-full w-auto object-cover rounded-sm"
      muted
      playsInline
      loop
    />
  )
}

export default function AllProjects({ projects }: { projects: Project[] }) {
  const { per, perNext } = useScrollState((state) => state)
  const { selectedIndex } = useProjectsStore((state) => state)
  return (
    <>
      <div className="fixed w-screen h-screen flex flex-col">
        <Thumbnails top={true} per={per} projects={projects} />
        <div className="h-1/2 flex justify-center py-1">
          <div className="aspect-video h-full w-auto  relative">
            {projects.map((project, idx) => (
              <Video key={project.slug} project={project} idx={idx} />
            ))}
          </div>
        </div>
        <Thumbnails per={perNext} projects={projects} />
      </div>
      <Scroller projects={projects} />
    </>
  )
}
