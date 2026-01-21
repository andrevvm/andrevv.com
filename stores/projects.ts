// src/stores/counter-store.ts
import { create } from 'zustand'
import { TaskData } from '@/lib/videoHelper'

export interface ProjectDescription {
  json: Record<string, unknown>
}

export interface MediaItem {
  url: string
  width: number
  height: number
  contentType: string
}

export interface RoleItem {
  title: string
}

export interface RoleCollection {
  items: RoleItem[]
}

export interface TypeItem {
  title: string
}

export interface TypeCollection {
  items: TypeItem[]
}

export interface VideoItem {
  taskData: TaskData
}

export interface VideosCollection {
  items: VideoItem[]
}

export interface Project {
  title: string
  slug: string
  description: ProjectDescription
  roleCollection: RoleCollection
  typeCollection: TypeCollection
  videosCollection: VideosCollection
  color: string | null
  lightDark: boolean | null
}

export type ProjectsState = {
  selectedIndex: number
  projectList: Project[]
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  selectedIndex: 0,
  projectList: [],
}))
