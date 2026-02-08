'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useMediaQuery } from 'usehooks-ts'

export default function ChildrenWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { slug } = useParams()
  const pathname = usePathname()
  const isMobile = useMediaQuery('(max-width: 768px)', {
    defaultValue: false,
    initializeWithValue: false,
  })
  const router = useRouter()
  return (
    <motion.div
      style={{ pointerEvents: pathname === '/info' ? 'auto' : 'none' }}
      initial={{
        backgroundColor: 'rgba(12, 12, 12, 0)',
      }}
      animate={{
        backdropFilter: pathname === '/info' ? 'blur(20px)' : 'blur(0px)',
        backgroundColor:
          pathname === '/info'
            ? 'rgba(12, 12, 12, 0.8)'
            : 'rgba(12, 12, 12, 0)',
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
