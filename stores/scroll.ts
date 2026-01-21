import { create } from 'zustand'

export type ScrollState = {
  y: number
  per: number
  perNext: number
}

export const useScrollState = create<ScrollState>((set) => ({
  y: 0,
  per: 0,
  perNext: 0,
}))
