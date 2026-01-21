'use client'
import { Project, TypeItem } from '@/stores/projects'
import { motion } from 'framer-motion'
import { useMediaQuery } from 'usehooks-ts'

export default function ProjectPage({ project }: { project: Project }) {
  const isMobile = useMediaQuery('(max-width: 768px)')
  return (
    <motion.div
      className="text-pretty md:w-3/14 fixed top-0 pt-12 left-0 p-4 z-15 leading-none max-md:bg-[#00000066] max-md:pb-6 backdrop-blur-lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: isMobile ? 0 : 0.75, ease: 'anticipate' }}
    >
      <ul className="mb-4">
        {project?.typeCollection?.items.map((type: TypeItem) => (
          <li key={type.title}>{type.title}</li>
        ))}
      </ul>

      {Array.isArray(project?.description?.json?.content) &&
        project.description.json.content.map(
          (content: { content: Array<{ value: string }> }, index: number) => (
            <p className="leading-[1.2] normal-case" key={index}>
              {content.content.map((item: { value: string }) => item.value)}
            </p>
          ),
        )}
    </motion.div>
  )
}
