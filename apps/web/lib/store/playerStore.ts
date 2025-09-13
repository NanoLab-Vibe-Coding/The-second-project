import create from 'zustand'

type Track = {
  id: string
  title: string
  artist?: string
  preview?: string
  thumbnail?: string
  provider?: string
}

type State = {
  current?: Track | null
  playing: boolean
  volume: number
  queue: Track[]
  playTrack: (t: Track) => void
  togglePlay: () => void
  setVolume: (v: number) => void
  pushQueue: (t: Track) => void
}

export const usePlayerStore = create<State>(set => ({
  current: null,
  playing: false,
  volume: 1,
  queue: [],
  playTrack: t => set({ current: t, playing: true }),
  togglePlay: () => set(s => ({ playing: !s.playing })),
  setVolume: v => set({ volume: v }),
  pushQueue: t => set(s => ({ queue: [...s.queue, t] })),
}))

/* Simple Zustand store to hold player/global audio state. */
