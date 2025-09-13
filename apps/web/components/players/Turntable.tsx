"use client"
import React, { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { VisualizerCanvas } from '../audio/VisualizerCanvas'
import { AudioEngine } from '../audio/AudioEngine'
import { usePlayerStore } from '../../lib/store/playerStore'

/*
  Turntable.tsx
  - Demonstrates tonearm drag, record rotation inertia, scratch preview and pitch slider.
  - This is a focused interactive component; heavy physics are simplified for clarity.
*/

export function Turntable() {
  const platterRef = useRef<HTMLDivElement | null>(null)
  const playing = usePlayerStore(s => s.playing)
  const current = usePlayerStore(s => s.current)
  const playTrack = usePlayerStore(s => s.playTrack)
  const togglePlay = usePlayerStore(s => s.togglePlay)
  const rotation = useMotionValue(0)
  const pitch = useMotionValue(1)
  const rpm = useTransform(pitch, v => v * 33)

  // Simple AudioEngine instance for demo
  const engineRef = useRef<AudioEngine | null>(null)

  useEffect(() => {
    engineRef.current = new AudioEngine()
    // For demo, attach analyser globally for the VisualizerCanvas in other places
    const analyser = engineRef.current.getAnalyser()
    if (analyser) (window as any).__APP_ANALYSER__ = analyser
    return () => {
      engineRef.current?.destroy()
      engineRef.current = null
    }
  }, [])

  // when the global/current track changes, load into engine
  useEffect(() => {
    if (!engineRef.current) return
    if (!current) return
    const src = current.preview || current.providerId || ''
    engineRef.current.load({ id: current.id, src, title: current.title, artist: current.artist, provider: current.provider })
    if (playing && engineRef.current.canPlayLast()) {
      engineRef.current.play()
    }
  }, [current])

  // Simulate inertia: when user 'throws' the platter, it continues rotating
  function applyFlick(velocity: number) {
    const initial = rotation.get()
    const decay = 0.98
    let current = initial
    let v = velocity
    const id = setInterval(() => {
      v *= decay
      current += v
      rotation.set(current)
      if (Math.abs(v) < 0.01) clearInterval(id)
    }, 16)
  }

  return (
    <div className="w-full sm:w-2/3">
      <div className="bg-gray-900 p-6 rounded-md">
        <div className="flex gap-6 items-center">
          <motion.div
            ref={platterRef}
            className="w-48 h-48 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center"
            style={{ rotate: rotation }}
            drag="x"
            dragConstraints={{ left: -100, right: 100 }}
            onDragEnd={(e, info) => {
              applyFlick(info.velocity.x / 10)
            }}
          >
            <div className="w-10 h-10 bg-gray-700 rounded-full" />
          </motion.div>

          <div className="flex-1">
            <div className="mb-4">
              <label className="block text-sm text-gray-400">피치</label>
              <input
                type="range"
                min="0.85"
                max="1.16"
                step="0.001"
                defaultValue={1}
                onInput={e => pitch.set(Number((e.target as HTMLInputElement).value))}
                className="w-full"
              />
            </div>

            <div className="flex gap-2">
              <button
                className="px-4 py-2 bg-green-600 rounded"
                onClick={() => {
                  // if no current track, do nothing
                  if (!current) return
                  // if engine cannot play (e.g., YouTube link), open provider page
                  if (!engineRef.current?.canPlayLast()) {
                    const url = current.preview
                    if (url) window.open(url, '_blank')
                    return
                  }

                  togglePlay()
                  if (!playing) engineRef.current?.play()
                  else engineRef.current?.pause()
                }}
              >
                {playing ? '일시정지' : '재생'}
              </button>
              <button
                className="px-4 py-2 bg-gray-700 rounded"
                onClick={() => {
                  // scratch preview: nudge rotation and play tiny buffer (demo)
                  rotation.set(rotation.get() + 30)
                }}
              >
                스크래치
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6">
          <VisualizerCanvas />
        </div>
      </div>
    </div>
  )
}
