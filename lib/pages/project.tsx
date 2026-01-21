'use client'
import { Project, TypeItem } from '@/stores/projects'
import { motion } from 'framer-motion'

export default function ProjectPage({ project }: { project: Project }) {
  return (
    <motion.div
      key={project.slug as string}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
    >
      <div className="text-pretty md:w-3/14 fixed top-0 max-md:pt-12 left-0 p-4 z-15 leading-none max-md:bg-[#00000066] max-md:pb-6 backdrop-blur-lg">
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
      </div>
    </motion.div>
  )
}
