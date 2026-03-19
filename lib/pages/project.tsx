'use client'
import { Project, TypeItem } from '@/stores/projects'
import { motion } from 'framer-motion'
import { renderContentfulRichText } from '@/lib/contentfulRichText'

export default function ProjectPage({ project }: { project: Project }) {
  return (
    <>
      {/* <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="text-pretty p-4 leading-none max-md:pb-8"
      >
        <ul className="mb-4">
          {project?.typeCollection?.items.map((type: TypeItem) => (
            <li key={type.title}>{type.title}</li>
          ))}
        </ul>

        {renderContentfulRichText(project?.description?.json)}
      </motion.div> */}
    </>
  )
}
