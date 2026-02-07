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
      initial={{
        backdropFilter: 'blur(0px)',
      }}
      animate={{
        backdropFilter: 'blur(20px)',
        backgroundColor: '#131313cc',
        width: pathname === '/info' && !isMobile ? '100%' : '',
      }}
      transition={{
        duration: 0.5,
        ease: 'easeInOut',
        width: { duration: 0 },
      }}
      className="fixed z-20 md:bottom-0 left-0 md:w-6/14 lg:w-4/14 xl:w-3/14"
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
