'use client'
import { useState } from 'react'
export default function Home() {
  const items = Array.from({ length: 30 })
  const [scrollPer, setScrollPer] = useState(0)
  const [scrollPerNext, setScrollPerNext] = useState(0)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPer(e.currentTarget.scrollLeft / e.currentTarget.scrollWidth)
    setScrollPerNext(
      (e.currentTarget.scrollLeft + window.innerWidth) /
        e.currentTarget.scrollWidth
    )
  }
  return (
    <>
      <div className="w-screen h-screen flex gap-1 relative z-10 pointer-events-none items-center">
        <div className="flex-1 flex gap-1 overflow-hidden">
          <div
            className="flex gap-1 relative left-[25vw]"
            style={{ transform: `translateX(-${scrollPer * 100}%)` }}
          >
            {items.map((_, index) => (
              <div
                key={index}
                className="aspect-video h-10 w-auto flex-none bg-blue-500"
              >
                {index}
              </div>
            ))}
          </div>
        </div>
        <div className="basis-1/2">
          <div className="aspect-video w-full h-auto bg-green-500">
            {Math.round(30 * scrollPer)}
          </div>
        </div>
        <div className="flex-1 flex gap-1 overflow-hidden">
          <div
            className="flex gap-1 relative"
            style={{ transform: `translateX(-${scrollPerNext * 100}%)` }}
          >
            {items.map((_, index) => (
              <div
                key={index}
                className="aspect-video h-10 w-auto flex-none bg-blue-500"
              >
                {index}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div
        className="fixed z-5 top-0 left-1/2 -translate-x-1/2 overflow-x-auto w-screen h-screen snap-x snap-mandatory flex gap-1"
        onScroll={handleScroll}
      >
        {items.map((_, index) => (
          <div
            key={index}
            className="w-full h-full flex-none bg-red-500 snap-start"
          >
            {index}
          </div>
        ))}
      </div>
    </>
  )
}
