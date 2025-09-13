"use client"
import React, { useEffect, useRef } from 'react'

type Props = { analyser?: AnalyserNode | null }

export function VisualizerCanvas({ analyser }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')!

    let localAnalyser = analyser

    // If no analyser provided, try to pick up a global one (demo hook)
    if (!localAnalyser && (window as any).__APP_ANALYSER__) {
      localAnalyser = (window as any).__APP_ANALYSER__ as AnalyserNode
    }

    const bufferLength = localAnalyser ? localAnalyser.frequencyBinCount : 512
    const dataArray = new Uint8Array(bufferLength)

    function resize() {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.scale(dpr, dpr)
    }

    function draw() {
      if (!ctx) return
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, w, h)

      if (localAnalyser) {
        localAnalyser.getByteTimeDomainData(dataArray)
        ctx.lineWidth = 2
        ctx.strokeStyle = '#22c55e'
        ctx.beginPath()
        const sliceWidth = w / dataArray.length
        let x = 0
        for (let i = 0; i < dataArray.length; i++) {
          const v = dataArray[i] / 128.0
          const y = (v * h) / 2
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
          x += sliceWidth
        }
        ctx.lineTo(w, h / 2)
        ctx.stroke()
      } else if ((window as any).__YT_TIME__ !== undefined) {
        // Mocked visualization synced to YouTube current time. Since we
        // cannot access cross-origin audio, we generate a pleasing waveform
        // that depends deterministically on time so it feels synced.
        const t = (window as any).__YT_TIME__ || 0
        const playing = Boolean((window as any).__YT_PLAYING__)
        const amp = playing ? 1 : 0.2
        ctx.lineWidth = 2
        ctx.strokeStyle = '#60a5fa'
        ctx.beginPath()
        const points = 120
        for (let i = 0; i < points; i++) {
          const u = i / points
          const tt = t * (0.5 + u * 2)
          const v = Math.sin(tt * 2.0 + u * 10) * 0.5 + Math.sin(tt * 7.0 + u * 2) * 0.25
          const y = (h / 2) + v * (h / 2) * amp
          const x = u * w
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      } else {
        // idle visualization
        ctx.fillStyle = '#334155'
        ctx.fillRect(0, 0, w, h)
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    rafRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [analyser])

  return <canvas ref={canvasRef} className="w-full h-48 rounded-md" />
}

/* Notes:
 - Uses an optional `AnalyserNode`. If omitted, the component will attempt
   to read `window.__APP_ANALYSER__` which can be set by the host app for
   demo purposes.
 - Respects resize and draws a time-domain waveform.
*/
