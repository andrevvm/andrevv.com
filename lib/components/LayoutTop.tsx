'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import { useEffect } from 'react'

gsap.registerPlugin(ScrollToPlugin)

export default function LayoutTop() {
  const pathname = usePathname()

  return (
    <div className="fixed top-0 left-0 z-20 p-4 leading-none flex justify-between w-full pointer-events-none max-md:bg-linear-to-b from-background to-transparent from-40% h-30">
      <Link
        href="/"
        className="pointer-events-auto"
        onClick={() => {
          if (pathname === '/') {
            console.log('scroll to 0')
            gsap.to(window, {
              scrollTo: 0,
              duration: 1,
              ease: 'power2.out',
            })
          }
        }}
      >
        Andrew McCarthy
      </Link>
      <Link
        href={pathname === '/info' ? '/' : '/info'}
        className="pointer-events-auto"
      >
        {pathname === '/info' ? 'Close' : 'Info'}
      </Link>
    </div>
  )
}
