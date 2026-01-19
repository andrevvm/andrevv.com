'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useParams } from 'next/navigation'

export default function ProjectTemplate({
  children
}: {
  children: React.ReactNode
}) {
  const {slug} = useParams()
  return <AnimatePresence initial={true}><motion.div
  key={slug as string}
  initial={{ opacity: 0 }} 
  animate={{ opacity: 1 }} 
  exit={{ opacity: 0 }} 
  transition={{ duration: 0.75, ease: 'anticipate' }} 
  className="text-pretty md:w-3/14 fixed top-0 max-md:pt-12 left-0 p-4 z-10 leading-none max-md:bg-[#00000066] max-md:pb-6 backdrop-blur-lg"
>{children}</motion.div></AnimatePresence>
}
