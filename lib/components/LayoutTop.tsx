'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function LayoutTop() {
  const pathname = usePathname()
  return (
    <div className="fixed top-0 left-0 z-20 p-4 leading-none flex justify-between w-full pointer-events-none max-md:bg-linear-to-b from-background to-transparent from-40% h-30">
      <Link href="/" className="pointer-events-auto">
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
