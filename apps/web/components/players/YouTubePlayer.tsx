"use client"
import React, { useEffect, useRef, useState } from 'react'
import { usePlayerStore } from '../../lib/store/playerStore'

// Uses YouTube IFrame API to control playback and publish currentTime/state
// to window.__YT_TIME__ / window.__YT_PLAYING__ so VisualizerCanvas can
// render a time-synced visualization (mocked waveform since raw audio
// access is not available from cross-origin iframe).
export function YouTubePlayer() {
  const current = usePlayerStore(s => s.current)
  const playing = usePlayerStore(s => s.playing)
  const playerRef = useRef<any | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    // load YouTube API if needed
    if (!(window as any).YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.body.appendChild(tag)
    }
  }, [])

  useEffect(() => {
    if (!current || current.provider !== 'youtube') {
      // cleanup
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy()
      playerRef.current = null
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      window.__YT_TIME__ = undefined
      window.__YT_PLAYING__ = false
      return
    }

    const vid = current.providerId || (current.preview && (current.preview.match(/v=([^&]+)/) || [])[1])
    if (!vid) return

    function createPlayer() {
      if (!(window as any).YT || !containerRef.current) return
      // create player
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        height: '100%',
        width: '100%',
        videoId: vid,
        playerVars: { autoplay: playing ? 1 : 0, controls: 1, modestbranding: 1, enablejsapi: 1 },
        events: {
          onStateChange: (e: any) => {
            window.__YT_PLAYING__ = e.data === (window as any).YT.PlayerState.PLAYING
          },
        },
      })

      // update time periodically
      if (intervalRef.current) clearInterval(intervalRef.current)
      intervalRef.current = window.setInterval(() => {
        try {
          const t = playerRef.current && playerRef.current.getCurrentTime ? playerRef.current.getCurrentTime() : 0
          window.__YT_TIME__ = t
          window.__YT_PLAYING__ = playerRef.current && playerRef.current.getPlayerState && playerRef.current.getPlayerState() === (window as any).YT.PlayerState.PLAYING
        } catch (e) {}
      }, 100)
    }

    // wait for YT to be ready
    if ((window as any).YT && (window as any).YT.Player) createPlayer()
    else (window as any).onYouTubeIframeAPIReady = createPlayer

    return () => {
      if (playerRef.current && playerRef.current.destroy) playerRef.current.destroy()
      playerRef.current = null
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
      window.__YT_TIME__ = undefined
      window.__YT_PLAYING__ = false
    }
  }, [current?.providerId, current?.preview, current?.provider, playing])

  if (!current || current.provider !== 'youtube') return null

  return (
    <div className="fixed bottom-4 right-4 w-80 h-44 shadow-lg rounded overflow-hidden bg-black z-50">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  )
}
