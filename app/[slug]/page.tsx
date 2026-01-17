import { getProjectBySlug } from '@/lib/api'
import ProjectPage from '@/lib/pages/project'

export default async function Work({ params }: { params: { slug: string } }) {
  const {slug} = await params
  const project = await getProjectBySlug(slug, false)
  
  return <ProjectPage project={project} />
}
