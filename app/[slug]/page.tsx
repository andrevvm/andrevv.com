import { getProjectBySlug } from '@/lib/api'
import ProjectPage from '@/lib/pages/project'
import { Project } from '@/stores/projects'

export const revalidate = 60

export default async function Work({ params }: { params: { slug: string } }) {  
  const {slug} = await params
  const project: Project = await getProjectBySlug(slug, false)
  return <ProjectPage key={project.slug} project={project} />
}
