'use client'
import { Project, TypeItem } from '@/stores/projects'

export default function ProjectPage({ project }: { project: Project }) {

  return (<><ul className="mb-4">
        {project?.typeCollection?.items.map((type: TypeItem) => (
          <li key={type.title}>{type.title}</li>
        ))}
      </ul>
      
      {Array.isArray(project?.description?.json?.content) && project.description.json.content.map((content: { content: Array<{ value: string }> }, index: number) => (
        <p className="leading-[1.2] normal-case" key={index}>{content.content.map((item: { value: string }) => item.value)}</p>
      ))}
</>
  )
}