import type { Metadata } from 'next'
import './globals.css'
import ProjectScroller from '@/lib/components/ProjectScroller'
import { getAllProjects } from '@/lib/api'
import FadeChildren from '@/lib/components/FadeChildren'

export const metadata: Metadata = {
  title: 'Andrew McCarthy — Creative Developer, San Diego, CA',
  description: 'Creative Technologist in San Diego, CA',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const allProjects = await getAllProjects(false)
  return (
    <html lang="en">
      <body>
        <FadeChildren>{children}</FadeChildren>
        <ProjectScroller projects={allProjects} />
      </body>
    </html>
  )
}
