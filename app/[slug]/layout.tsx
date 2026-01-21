import { getAllProjects, getProjectBySlug } from '@/lib/api'
import { type Project } from '@/stores/projects'
import ProjectLayout from '@/lib/pages/projectLayout'

export async function generateStaticParams() {
  const allProjects = await getAllProjects(false)

  return allProjects.map((project: Project) => ({
    slug: project.slug,
  }))
}

export default async function Project({
  children,
  params,
}: {
  children: React.ReactNode
  params: { slug: string }
}) {
  const { slug } = await params
  const project: Project = await getProjectBySlug(slug, false)
  return <ProjectLayout project={project}>{children}</ProjectLayout>
}
