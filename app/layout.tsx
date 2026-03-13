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

export const revalidate = 1000000

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const allProjects = await getAllProjects(false)
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Spectral:ital@0;1&display=swap"
          as="style"
        />
        <script
          defer
          src="https://cloud.umami.is/script.js"
          data-website-id="de136c0c-9bf9-4353-8ef0-930760175cd0"
        ></script>
      </head>
      <body>
        <LayoutTop></LayoutTop>
        <FadeChildren>{children}</FadeChildren>
        <AllProjects projects={allProjects} />
        <LayoutBottom projects={allProjects} />
      </body>
    </html>
  )
}
