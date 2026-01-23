'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useParams } from 'next/navigation'

export default function ChildrenWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const { slug } = useParams()
  return (
    <motion.div
      animate={{
        backdropFilter: slug ? 'blur(20px)' : 'blur(0px)',
        backgroundColor: slug ? '#131313cc' : 'transparent',
      }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed z-20 top-8 md:bottom-0 left-0 md:w-6/14 lg:w-4/14 xl:w-3/14"
    >
      <AnimatePresence initial={true} mode="wait">
        {children}
      </AnimatePresence>
    </motion.div>
  )
}
