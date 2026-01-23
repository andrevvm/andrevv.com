import { getProjectBySlug } from '@/lib/api'
import ProjectPage from '@/lib/pages/project'
import type { Project } from '@/stores/projects'
import { Metadata } from 'next'
export const revalidate = 1000000

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const { slug } = await params
  const project: Project = await getProjectBySlug(slug, false)

  return {
    title: `${project.title} — Andrew McCarthy`,
    description: Array.isArray(project.description?.json?.content)
      ? project.description?.json?.content
          .flatMap((content: { content: Array<{ value: string }> }) =>
            content.content.map((item: { value: string }) => item.value),
          )
          .join(' ')
      : null,
  }
}

export default async function Project({
  params,
}: {
  params: { slug: string }
}) {
  const { slug } = await params
  const project: Project = await getProjectBySlug(slug, false)
  return <ProjectPage key={project.slug} project={project} />
}
