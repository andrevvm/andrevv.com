'use client'
import {useEffect} from 'react'
import { Project, useProjectsStore } from '@/stores/projects'

export default function ProjectPage({ project }: { project: Project }) {
  const { singleProject } = useProjectsStore(state => state);
  useEffect(() => {
    useProjectsStore.setState({ singleProject: project })
    return () => {
      useProjectsStore.setState({ singleProject: null })
    }
  }, [singleProject])
  return <></>
}