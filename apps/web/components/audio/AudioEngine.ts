/*
  AudioEngine.ts

  What changed / Why:
  - Provides a thin wrapper around Howler.js + Tone.js to manage playback,
    crossfading, seeking, and exposing an AnalyserNode for visualizers.
  - This is intentionally minimal and written as an isolated class so the
    UI can interact with it without being coupled to third-party APIs.

  Notes/References:
  - Howler.js: https://github.com/goldfire/howler.js
  - Tone.js: https://tonejs.github.io/ (used optionally for effects)
*/

import { Howl, Howler } from 'howler'

type Track = {
  id: string
  src: string
  title?: string
  artist?: string
  provider?: string
}

export class AudioEngine {
  private howl?: Howl
  private analyser?: AnalyserNode
  private gainNode?: GainNode
  private lastTrack?: Track
  private playable = true

  constructor() {
    // Guard against server-side construction
    if (typeof window === 'undefined') return

    // Prefer Howler's audio context if available, otherwise create one
    const ctx = ((Howler as any).ctx as AudioContext) || new (window.AudioContext || (window as any).webkitAudioContext)()
    if (ctx) {
      this.gainNode = ctx.createGain()
      this.analyser = ctx.createAnalyser()
      // Wire: gain -> analyser -> destination
      this.gainNode.connect(this.analyser)
      this.analyser.connect(ctx.destination)
      this.analyser.fftSize = 2048
    }
  }

  load(track: Track) {
    // Dispose old instance
    if (this.howl) {
      this.howl.unload()
    }
    // Basic provider handling: if a track src is a YouTube/watch URL or an
    // external provider that can't be played directly via Howler, mark as
    // non-playable. In such cases the UI should open the provider page.
    const isYoutube = typeof track.src === 'string' && track.src.includes('youtube.com/watch')
    this.lastTrack = track
    this.playable = !isYoutube

    if (!this.playable) return

    this.howl = new Howl({
      src: [track.src],
      html5: true,
      volume: 1.0,
      onplay: () => {
        // Try to connect Howler's context/master gain to our analyser.
        try {
          const hctx = (Howler as any).ctx as AudioContext | undefined
          const master = (Howler as any)._masterGain || (Howler as any)._gain || undefined
          if (hctx && this.analyser && this.gainNode) {
            // If Howler exposes a master gain node, connect it to our analyser.
            if (master && typeof master.connect === 'function') {
              master.connect(this.gainNode)
            }
            // ensure our analyser is connected to destination
            this.gainNode.connect(this.analyser)
            this.analyser.connect(hctx.destination)
          }
        } catch (e) {
          // ignore - visualization remains best-effort
        }
      },
    })
  }

  canPlayLast() {
    return this.playable
  }

  play() {
    this.howl?.play()
  }

  pause() {
    this.howl?.pause()
  }

  seek(sec: number) {
    this.howl?.seek(sec)
  }

  setVolume(v: number) {
    Howler.volume(v)
  }

  crossfadeTo(other: AudioEngine, duration = 3000) {
    // Simple linear crossfade: fade this down and the other up.
    const steps = 30
    const stepDur = duration / steps
    const startVol = Howler.volume()
    other.setVolume(0)
    other.play()
    for (let i = 0; i <= steps; i++) {
      const t = i / steps
      setTimeout(() => {
        this.setVolume(1 - t)
        other.setVolume(t)
      }, i * stepDur)
    }
    setTimeout(() => {
      this.pause()
    }, duration + 100)
  }

  getAnalyser(): AnalyserNode | undefined {
    return this.analyser
  }

  // Cleanup
  destroy() {
    this.howl?.unload()
    this.howl = undefined
  }
}
