import type { Metadata } from 'next'
import './globals.css'
import { getAllProjects } from '@/lib/api'
import AllProjects from '@/lib/components/AllProjects'
import FadeChildren from '@/lib/components/FadeChildren'
import LayoutTop from '@/lib/components/LayoutTop'
import LayoutBottom from '@/lib/components/LayoutBottom'
export const metadata: Metadata = {
  title: 'Andrew McCarthy — Creative Developer, San Diego, CA',
  description: 'Creative Developer in San Diego, CA',
}

export const revalidate = 60 * 60 * 24 * 30

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const allProjects = await getAllProjects(false)
  return (
    <html lang="en">
      <body>
        <LayoutTop></LayoutTop>
        <FadeChildren>{children}</FadeChildren>
        <AllProjects projects={allProjects} />
        <LayoutBottom projects={allProjects} />
      </body>
    </html>
  )
}
