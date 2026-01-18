import type { Metadata } from 'next'
import './globals.css'
import ProjectScroller from '@/lib/components/ProjectScroller'
import { getAllProjects } from '@/lib/api'

export const metadata: Metadata = {
  title: 'Andrew McCarthy',
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
      <body className="max-md:overflow-hidden">
        {children}
        <ProjectScroller projects={allProjects} />
      </body>
    </html>
  )
}
