'use client'
import { Project, RoleItem, useProjectsStore } from '@/stores/projects'
import Link from 'next/link'

export default function LayoutBottom({ projects }: { projects: Project[] }) {
  const { selectedIndex } = useProjectsStore((state) => state)
  return (
    <div className="fixed bottom-0 items-end pointer-events-none left-0 w-full z-20 p-4 leading-none bg-linear-to-t from-background to-transparent from-30% h-40 flex max-md:flex-col max-md:items-center max-md:justify-end md:justify-between gap-y-2">
      <div className="basis-1/3"></div>
      {projects[selectedIndex] && (
        <Link
          href={`/${projects[selectedIndex]?.slug}`}
          className="pointer-events-auto"
        >
          {projects[selectedIndex]?.title}
        </Link>
      )}
      <div className="md:basis-1/3 flex justify-end text-right">
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
