'use client'
import { Project, TypeItem } from '@/stores/projects'
import { motion } from 'framer-motion'

export default function ProjectPage({ project }: { project: Project }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="text-pretty p-4 leading-none max-md:pb-6"
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
