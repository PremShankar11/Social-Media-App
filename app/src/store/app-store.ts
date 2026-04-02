import { create } from 'zustand'

type AppState = {
  isFoundationMode: boolean
  setFoundationMode: (value: boolean) => void
}

export const useAppStore = create<AppState>((set) => ({
  isFoundationMode: true,
  setFoundationMode: (value) => set({ isFoundationMode: value }),
}))
