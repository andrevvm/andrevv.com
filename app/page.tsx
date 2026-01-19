import Index from '@/lib/pages/index'
export const revalidate = 60
export default async function Home() {
  return <Index />
}
