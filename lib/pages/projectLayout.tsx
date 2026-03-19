'use client'
import { motion } from 'framer-motion'
import { Project } from '@/stores/projects'

export default function ProjectLayout({
  project,
  children,
}: {
  project: Project
  children: React.ReactNode
}) {
  return (
    <motion.div
      key={project.slug}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-pretty md:w-3/13 fixed top-0 pt-12 left-0 p-4 z-50 leading-none max-md:bg-[#00000066] max-md:pb-6 backdrop-blur-lg"
    >
      {children}
    </motion.div>
  )
}
