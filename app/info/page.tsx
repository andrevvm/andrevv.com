'use client'
import { motion } from 'framer-motion'
import { useProjectsStore } from '@/stores/projects'

export default function Info() {
  const { projectList } = useProjectsStore((state) => state)

  return (
    <motion.div
      key="info"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.5, ease: 'easeInOut' } }}
      className="w-full h-screen top-0 p-4 font-serif normal-case text-pretty max-w-[30em]"
    >
      <div className="flex flex-col h-full justify-between pb-4">
        <article>
          <p>
            Design technologist based in San Diego with over 15 years of
            experience designing and building for the web.
          </p>
          <p>Experimental spirit, pragmatist at heart.</p>
          <p className="italic">
            <a
              href="mailto:hi@andrevv.com"
              onClick={(e) => {
                e.stopPropagation()
              }}
            >
              hi@andrevv.com
            </a>
          </p>
        </article>
        <ul className="py-4 font-mono lowercase">
          <li>Sveltekit</li>
          <li>Tailwind CSS</li>
          <li>Shopify</li>
          <li>React</li>
          <li>Three.js</li>
          <li>Next.js</li>
          <li>Craft CMS</li>
          <li>Sanity CMS</li>
        </ul>
      </div>
    </motion.div>
  )
}
