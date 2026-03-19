'use client'
import { motion } from 'framer-motion'

export default function Info() {
  return (
    <motion.div
      key="info"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="w-full h-screen top-0 pt-30 px-9 md:px-12.75 font-serif normal-case text-pretty max-w-[35em]"
    >
      <div className="flex flex-col h-full justify-between pb-4">
        <article className="tracking-normal text-md">
          <p>
            Creative developer based in San Diego with over 10 years of
            experience designing and building for the web.
          </p>
          <p>
            Focus on creating impactful, engaging and memorable digital
            experiences that are both delightful and functional.
          </p>
          <p>This website was designed in browser with code.</p>
          <p>Experimental spirit, pragmatic heart.</p>
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
        <ul className="py-4 pb-10 font-mono uppercase">
          <li>Craft CMS</li>
          <li>Hydrogen</li>
          <li>Next.js</li>
          <li>React</li>
          <li>Sanity CMS</li>
          <li>Shopify</li>
          <li>Sveltekit</li>
          <li>Tailwind CSS</li>
          <li>Three.js</li>
        </ul>
      </div>
    </motion.div>
  )
}
