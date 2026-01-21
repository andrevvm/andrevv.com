'use client'

import { AnimatePresence } from 'framer-motion'

export default function ChildrenWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return <AnimatePresence initial={true}>{children}</AnimatePresence>
}
