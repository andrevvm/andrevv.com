import type { Metadata } from 'next'
import './globals.css'
import { getAllProjects } from '@/lib/api'
import AllProjects from '@/lib/components/AllProjects'
import FadeChildren from '@/lib/components/FadeChildren'
import LayoutTop from '@/lib/components/LayoutTop'
import LayoutBottom from '@/lib/components/LayoutBottom'

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
        <LayoutTop></LayoutTop>
        <div className="fixed z-15 top-0 max-md:bg-[#00000066] backdrop-blur-lg left-0 pt-12 md:w-3/14">
          <FadeChildren>{children}</FadeChildren>
        </div>
        <AllProjects projects={allProjects} />
        <LayoutBottom projects={allProjects} />
      </body>
    </html>
  )
}
