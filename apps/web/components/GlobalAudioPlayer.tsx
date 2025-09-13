"use client"
import React, { useEffect, useRef } from 'react'
import { AudioEngine } from './audio/AudioEngine'
import { usePlayerStore } from '../lib/store/playerStore'
import { YouTubePlayer } from './players/YouTubePlayer'

export function GlobalAudioPlayer() {
  const current = usePlayerStore(s => s.current)
  const playing = usePlayerStore(s => s.playing)
  const engineRef = useRef<AudioEngine | null>(null)

  // lazy init on client
  useEffect(() => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine()
      const analyser = engineRef.current.getAnalyser()
      if (analyser) (window as any).__APP_ANALYSER__ = analyser
    }
    return () => {
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!current || !engineRef.current) return
    const src = current.preview || current.providerId || ''
    engineRef.current.load({ id: current.id, src, title: current.title, artist: current.artist, provider: current.provider })
    if (engineRef.current.canPlayLast()) {
      if (playing) engineRef.current.play()
      else engineRef.current.pause()
    } else {
      // For providers like YouTube, we now render an embedded player instead
      // of opening a new tab. Global YouTubePlayer component will pick it up.
    }
  }, [current, playing])

  return <YouTubePlayer />
}
