'use client'
import { useRouter } from 'next/navigation'
import { useMemo, useRef } from 'react'
import { motion, AnimatePresence, animate } from 'framer-motion'
import { type Project, useProjectsStore } from '@/stores/projects'

import { scrollTo } from '../utils'

export default function ScrollIndicator() {
  const { projectList, selectedIndex } = useProjectsStore()
  const height = useMemo(
    () =>
      `${((100 - 100 / projectList.length) / projectList.length) * (selectedIndex + 1)}svh`,
    [projectList, selectedIndex]
  )
  const router = useRouter()
  return (
    <div className="w-3 fixed top-0 bottom-0 right-0 bg-background z-100">
      <div className="fixed z-120 top-0 right-0 bottom-0 flex justify-end mix-blend-difference">
        <motion.div
          initial={{ height: 0 }}
          animate={{
            height: height,
          }}
          transition={{ ease: 'circOut' }}
          className="bg-light w-1.5"
        ></motion.div>
      </div>
      <AnimatePresence initial={true}>
        {projectList.map((p, i) => {
          return (
            <motion.a
              href={projectList[i].slug}
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ delay: 0.05 * i }}
              key={`notch-${i}`}
              style={{
                top: `${((100 - 100 / projectList.length) / projectList.length) * (i + 1)}svh`,
              }}
              className="fixed group z-110 w-3 h-3 right-0 bg-light flex justify-center items-center hover:bg-accent cursor-pointer -translate-y-full"
              onClick={(e) => {
                e.preventDefault()
                scrollTo(i)
                router.push(projectList[i].slug)
              }}
            >
              <span className="flex-none block w-20 h-20"></span>

              <span className="text-sm bg-light text-background px-2 whitespace-nowrap absolute right-6 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto">
                {projectList[i].title}
              </span>
            </motion.a>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
