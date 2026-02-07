'use client'
import { motion } from 'framer-motion'
import { Project, RoleItem, useProjectsStore } from '@/stores/projects'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

export default function LayoutBottom({ projects }: { projects: Project[] }) {
  const { selectedIndex } = useProjectsStore((state) => state)
  const { slug } = useParams()
  const pathname = usePathname()
  return (
    <motion.div
      animate={{ opacity: pathname === '/info' ? 0 : 1 }}
      className="fixed bottom-0 pointer-events-none left-0 w-full z-35 p-5 md:p-13.25 leading-none bg-none flex items-end justify-end gap-y-2"
    >
      <div className="flex-1 flex flex-col items-center justify-end">
        {projects[selectedIndex] && (
          <>
            <div className="flex-1 flex justify-center items-end">
              <Link
                href={`/${projects[selectedIndex]?.slug}`}
                className="pointer-events-auto bg-background rounded-sm py-1.5 px-3"
              >
                {projects[selectedIndex]?.title}
              </Link>
            </div>
          </>
        )}
        <div className="flex justify-end text-right">
          {projects[selectedIndex] && (
            <Link
              href={`/${projects[selectedIndex]?.slug}`}
              className="pointer-events-auto bg-background rounded-sm py-1.5 px-3"
            >
              {projects[selectedIndex]?.roleCollection.items
                .map((role: RoleItem) => role.title)
                .join(', ')}
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  )
}
