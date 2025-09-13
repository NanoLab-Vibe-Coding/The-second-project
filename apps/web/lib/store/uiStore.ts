import create from 'zustand'

type UIState = {
  showSettings: boolean
  toggleSettings: () => void
}

export const useUIStore = create<UIState>(set => ({
  showSettings: false,
  toggleSettings: () => set(s => ({ showSettings: !s.showSettings })),
}))

