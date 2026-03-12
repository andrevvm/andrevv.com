import gsap from 'gsap'
import ScrollToPlugin from 'gsap/ScrollToPlugin'
gsap.registerPlugin(ScrollToPlugin)
export const scrollTo = (index: number) => {
  window.document.documentElement.style.scrollSnapType = 'none'
  gsap.to(window, {
    scrollTo: `#scroller-${index}`,
    overwrite: true,
    duration: 1,
    ease: 'power2.out',
    onComplete: () => {
      setTimeout(() => {
        window.document.documentElement.style.scrollSnapType = ''
      }, 100)
    },
  })
}
