"use client"
import React, { useState } from 'react'

type Track = {
  id: string
  title: string
  artist?: string
  provider?: string
  providerId?: string
  preview?: string
  thumbnail?: string
}

export function TrackEditor({ track, onClose, onSave }: { track: Track | null; onClose: () => void; onSave: (t: Track) => void }) {
  const [title, setTitle] = useState(track?.title || '')
  const [artist, setArtist] = useState(track?.artist || '')

  if (!track) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60">
      <div className="bg-gray-900 p-6 rounded w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">트랙 수정</h3>
        <label className="block text-sm text-gray-400">제목</label>
        <input value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-gray-800 rounded mb-2" />
        <label className="block text-sm text-gray-400">아티스트</label>
        <input value={artist} onChange={e => setArtist(e.target.value)} className="w-full p-2 bg-gray-800 rounded mb-4" />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-3 py-2 bg-gray-700 rounded">취소</button>
          <button onClick={() => onSave({ ...track, title, artist })} className="px-3 py-2 bg-indigo-600 rounded">저장</button>
        </div>
      </div>
    </div>
  )
}

/*
 - Simple modal editor that edits track metadata locally. In production
   this would PATCH the backend and update DB; for the demo we persist
   edits to localStorage (handled in the page that calls `onSave`).
*/
