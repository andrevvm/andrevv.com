// src/stores/counter-store.ts
import { create } from 'zustand'
import { TaskData } from '@/lib/videoHelper'

export interface ProjectDescription {
  json: Record<string, unknown>
}

export interface ProjectCredits {
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

export interface SubtitlesItem {
  url: string
}

export interface VideoItem {
  id: string
  taskData: TaskData
  subtitles: SubtitlesItem
}

export interface VideosCollection {
  items: VideoItem[]
}

export interface Project {
  title: string
  slug: string
  description: ProjectDescription
  credits: ProjectCredits
  roleCollection: RoleCollection
  typeCollection: TypeCollection
  videosCollection: VideosCollection
  color: string | null
  lightDark: boolean | null
}

export type ProjectsState = {
  selectedIndex: number
  projectList: Project[]
  video: HTMLVideoElement | null
}

export const useProjectsStore = create<ProjectsState>((set) => ({
  selectedIndex: 0,
  projectList: [],
  video: null,
}))
