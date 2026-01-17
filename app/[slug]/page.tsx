import { getProjectBySlug } from '@/lib/api'
import ProjectScroller from '@/lib/components/ProjectScroller'

export default async function Work({ params }: { params: { slug: string } }) {
  const {slug} = await params
  const project = await getProjectBySlug(slug, false)
  return <ProjectScroller projects={[project]} />
}
