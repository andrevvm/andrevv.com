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
      className="fixed bottom-0 pointer-events-none left-0 w-full z-20 p-4 leading-none max-md:bg-linear-to-t from-background to-transparent from-30% h-50 flex items-end justify-end gap-y-2"
    >
      <motion.div
        animate={{ width: `${slug ? (3 / 14) * 100 : 0}%` }}
        transition={{ duration: 0.5, ease: 'anticipate' }}
        className="max-md:hidden"
      ></motion.div>
      <div className="flex-1 flex flex-col items-center md:items-end justify-end max-md:gap-y-1">
        {projects[selectedIndex] && (
          <>
            <div className="flex-1 flex justify-center items-end">
              <Link
                href={`/${projects[selectedIndex]?.slug}`}
                className="pointer-events-auto"
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
              className="pointer-events-auto"
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
