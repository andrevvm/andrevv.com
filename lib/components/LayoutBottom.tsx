'use client'
import { motion } from 'framer-motion'
import { Project, RoleItem, useProjectsStore } from '@/stores/projects'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function LayoutBottom({ projects }: { projects: Project[] }) {
  const { selectedIndex } = useProjectsStore((state) => state)
  const { slug } = useParams()
  return (
    <div className="fixed bottom-0 items-end pointer-events-none left-0 w-full z-20 p-4 leading-none bg-linear-to-t from-background to-transparent from-40% h-30 flex max-md:flex-col max-md:items-center max-md:justify-end md:justify-between gap-y-2">
      <motion.div
        animate={{ width: `${slug ? (3 / 14) * 100 : 0}%` }}
        transition={{ duration: 0.5, ease: 'anticipate' }}
      ></motion.div>
      {projects[selectedIndex] && (
        <>
          <div className="md:basis-1/4"></div>
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
      <div className="md:basis-1/4 flex justify-end text-right">
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
  )
}
