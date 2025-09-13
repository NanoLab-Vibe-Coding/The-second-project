"use client"
import React from 'react'
import { motion } from 'framer-motion'

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

export function TrackItem({ track, onPlay, onEdit }: { track: Track; onPlay: () => void; onEdit: () => void }) {
  const [liked, setLiked] = React.useState(false)
  const [checkingLike, setCheckingLike] = React.useState(true)
  async function saveFav() {
    // toggle favorite: POST when not liked, DELETE when liked
    const me = await fetch('/api/auth/me', { credentials: 'include' })
    if (!me.ok) return alert('로그인 필요')
    const j = await me.json()
    const userId = j.user?.id
    if (!userId) return alert('로그인 필요')

    if (!liked) {
      await fetch('/api/favorites', { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, track }) })
      setLiked(true)
    } else {
      await fetch('/api/favorites', { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, trackId: track.id }) })
      setLiked(false)
    }
  }

  React.useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const me = await fetch('/api/auth/me', { credentials: 'include' })
        if (!me.ok) return setCheckingLike(false)
        const j = await me.json()
        const userId = j.user?.id
        if (!userId) return setCheckingLike(false)
        const res = await fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
        if (!res.ok) return setCheckingLike(false)
        const data = await res.json()
        if (!mounted) return
        const exists = (data.items || []).some((t: any) => t.id === track.id)
        setLiked(Boolean(exists))
      } catch (e) {
        // ignore
      } finally {
        setCheckingLike(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [track.id])

  return (
    <motion.div whileHover={{ scale: 1.01 }} className="flex items-center gap-3 p-3 bg-gray-900 rounded">
      <img src={track.thumbnail} alt="cover" className="w-16 h-16 object-cover rounded shadow" />
      <div className="flex-1">
        <div className="font-semibold text-white">{track.title}</div>
        <div className="text-sm text-gray-400">{track.artist} • {track.provider} • <span className="text-xs ml-1 text-gray-500">{track.genre}</span></div>
      </div>
      <div className="flex gap-2 items-center">
        <button onClick={onPlay} className="px-3 py-1 bg-green-600 rounded">재생</button>
        <button onClick={onEdit} className="px-3 py-1 bg-gray-700 rounded">편집</button>
        <button onClick={saveFav} className={`px-3 py-1 rounded ${liked ? 'bg-red-600 text-white' : 'bg-yellow-600'}`} title={liked ? '즐겨찾기 해제' : '즐겨찾기'}>
          {checkingLike ? '...' : liked ? '♥' : '♡'}
        </button>
      </div>
    </motion.div>
  )
}
