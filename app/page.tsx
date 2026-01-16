import { getAllProjects } from '@/lib/api'
import ProjectScroller from '@/lib/components/ProjectScroller'

export default async function Home() {
  const allProjects = await getAllProjects(false)
  return <ProjectScroller projects={allProjects} />
}
