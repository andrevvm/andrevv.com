'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { usePathname, useRouter } from 'next/navigation'

export default function ChildrenWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const router = useRouter()
  return (
    <motion.div
      style={{ pointerEvents: pathname === '/info' ? 'auto' : 'none' }}
      initial={{
        backgroundColor: 'transparent',
      }}
      animate={{
        backdropFilter: pathname === '/info' ? 'blur(20px)' : 'blur(0px)',
        backgroundColor:
          pathname === '/info' ? 'var(--color-overlay)' : 'transparent',
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
      }}
      className="fixed z-20 inset-0"
      onClick={() => {
        if (pathname === '/info') {
          router.push('/')
        }
      }}
    >
      <AnimatePresence initial={true} mode="wait">
        {children}
      </AnimatePresence>
    </motion.div>
  )
}
