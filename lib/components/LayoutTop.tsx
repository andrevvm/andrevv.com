import Link from 'next/link'

export default function LayoutTop() {
  return (
    <div className="fixed top-0 left-0 z-20 p-4 leading-none flex justify-between w-full">
      <Link href="/">Andrew McCarthy</Link>
      <Link href="/info">Info</Link>
    </div>
  )
}
