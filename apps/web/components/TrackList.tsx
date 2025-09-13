"use client"
import React from 'react'
import { TrackItem } from './TrackItem'

type Track = {
  id: string
  title: string
  artist?: string
  provider?: string
  providerId?: string
  preview?: string
  thumbnail?: string
  genre?: string
}

export function TrackList({ tracks, onPlay, onEdit }: { tracks: Track[]; onPlay: (t: Track) => void; onEdit: (t: Track) => void }) {
  return (
    <div className="space-y-2">
      {tracks.map(t => (
        <TrackItem key={t.id} track={t} onPlay={() => onPlay(t)} onEdit={() => onEdit(t)} />
      ))}
    </div>
  )
}
