'use client'
import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { renderContentfulRichText } from '@/lib/contentfulRichText'
import {
  Project,
  RoleItem,
  TypeItem,
  useProjectsStore,
} from '@/stores/projects'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'
import { useAsciiScramble } from '@/lib/hooks/useAsciiScramble'
import CaptionsPlayer from '@/lib/components/CaptionsPlayer'

function TitleDisplay({ project }: { project: Project }) {
  const title = useAsciiScramble(project?.title ?? '')
  const roles = useMemo(
    () =>
      project?.roleCollection.items
        .map((role: RoleItem) => role.title)
        .join(', ') ?? '',
    [project]
  )
  const rolesDisplay = useAsciiScramble(roles)

  return (
    <>
      <div className="flex justify-center items-end" key="title-display">
        <Link
          href={`/${project.slug}`}
          className="pointer-events-auto bg-background rounded-sm py-mono-gap px-3"
        >
          {title}
        </Link>
      </div>
      <div className="flex justify-center text-center">
        <div className="pointer-events-auto bg-background rounded-sm py-mono-gap px-3">
          {rolesDisplay}
        </div>
      </div>
    </>
  )
}

export default function LayoutBottom({ projects }: { projects: Project[] }) {
  const { selectedIndex } = useProjectsStore((state) => state)
  const { slug } = useParams()
  const pathname = usePathname()

  const [showCredits, setShowCredits] = useState(false)

  const project = projects[selectedIndex]
  const types = useMemo(
    () =>
      project?.typeCollection.items
        .map((type: TypeItem) => type.title)
        .join(', ') ?? '',
    [project]
  )
  const typesDisplay = useAsciiScramble(types)

  return (
    <motion.div
      animate={{ opacity: pathname === '/info' ? 0 : 1 }}
      className="fixed bottom-0 pointer-events-none left-0 w-full z-35 p-5 md:p-11 leading-none bg-none flex items-end justify-end gap-y-2"
    >
      <div className="flex-1 flex flex-col items-center justify-end max-md:pb-12 gap-y-2">
        <AnimatePresence initial={true} mode="wait">
          {!slug && (
            <motion.div
              key={`type-text`}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              transition={{ ease: 'circOut' }}
              exit={{ height: 0 }}
              className="overflow-hidden flex-col gap-y-0"
            >
              <TitleDisplay project={project} />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {slug && showCredits && (
            <motion.div
              key={`type-text-credit`}
              initial={{ height: 0 }}
              animate={{ height: 'auto' }}
              exit={{ height: 0 }}
              transition={{ ease: 'circOut' }}
              className="overflow-hidden flex-col gap-y-0 text-sm leading-relaxed"
            >
              <TitleDisplay project={project} />
              <div className="flex flex-col justify-center items-center text-center gap-y-4">
                <div className="inline-flex pointer-events-auto bg-background rounded-sm px-3  py-mono-gap">
                  {typesDisplay}
                </div>
                <div className="credits flex flex-col">
                  {renderContentfulRichText(project?.credits?.json)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <CaptionsPlayer />
      </div>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: slug ? 1 : 0 }}
          className="absolute bottom-0 right-0 p-5 md:p-8 max-md:px-10"
        >
          <button
            className="pointer-events-auto bg-background rounded-sm py-1.5 md:px-3 uppercase cursor-pointer hover:text-accent"
            onClick={() => {
              setShowCredits(!showCredits)
            }}
          >
            {useAsciiScramble(showCredits ? 'Hide' : 'Credits')}
          </button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
