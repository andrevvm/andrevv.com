'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
import { useAsciiScramble } from '../hooks/useAsciiScramble'
import { useEffect, useState } from 'react'

gsap.registerPlugin(ScrollToPlugin)

export default function LayoutTop() {
  const pathname = usePathname()

  const asciiName = useAsciiScramble('Andrew McCarthy')
  const asciiButton = useAsciiScramble(pathname === '/info' ? 'Close' : 'Info')

  return (
    <div className="fixed top-0 left-0 z-35 py-6 px-6 md:py-12 md:px-9.75 leading-none flex justify-between w-full pointer-events-none">
      <Link
        href="/"
        className="pointer-events-auto py-0.5 px-3 bg-background rounded-sm"
        onClick={() => {
          if (pathname === '/') {
            window.document.documentElement.style.scrollSnapType = 'none'
            gsap.to(window, {
              scrollTo: 0,
              duration: 1,
              ease: 'power2.out',
              onComplete: () => {
                setTimeout(() => {
                  window.document.documentElement.style.scrollSnapType = ''
                }, 100)
              },
            })
          }
        }}
      >
        {asciiName}
      </Link>
      <Link
        href={pathname === '/info' ? '/' : '/info'}
        className="pointer-events-auto py-0.5 px-3 bg-background"
      >
        {asciiButton}
      </Link>
    </div>
  )
}
