import type { Metadata } from 'next'
import './globals.css'
import ProjectScroller from '@/lib/components/ProjectScroller'
import { getAllProjects } from '@/lib/api'
import { Project } from '@/stores/projects'

export const metadata: Metadata = {
  title: 'Andrew McCarthy',
  description: 'Creative Technologist in San Diego, CA',
}

// export async function generateStaticParams() {
//   const allProjects = await getAllProjects(false)
//   return allProjects?.map((project: Project) => ({
//     slug: project.slug,
//   }))
// }

// export const revalidate = 60

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const allProjects = await getAllProjects(false)
  
  return (
    <html lang="en">
      <body>
        {children}
        <ProjectScroller projects={allProjects} />
      </body>
    </html>
  )
}
