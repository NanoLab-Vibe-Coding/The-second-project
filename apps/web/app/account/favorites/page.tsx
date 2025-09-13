"use client"
import React, { useEffect, useState } from 'react'
import { usePlayerStore } from '../../../lib/store/playerStore'

export default function FavoritesPage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const play = usePlayerStore(s => s.playTrack)

  useEffect(() => {
    // ask server who the current user is (pl_auth is httpOnly)
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(j => {
        if (j.user?.id) setUserId(j.user.id)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!userId) return
    setLoading(true)
    fetch(`/api/favorites?userId=${encodeURIComponent(userId)}`)
      .then(r => r.json())
      .then(j => setItems(j.items || []))
      .finally(() => setLoading(false))
  }, [userId])

  if (!userId) return <div className="text-sm text-gray-400">로그인 후 즐겨찾기를 확인하세요.</div>

  return (
    <div>
      <h2 className="text-2xl font-bold">내 즐겨찾기</h2>
      {loading && <div className="text-sm text-gray-400">로딩...</div>}
      <div className="mt-4 space-y-2">
        {items.map(it => (
          <div key={it.id} className="p-2 bg-gray-900 rounded flex items-center justify-between">
            <div>
              <div className="font-semibold">{it.title}</div>
              <div className="text-sm text-gray-400">{it.artist}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => play(it)} className="px-3 py-1 bg-green-600 rounded">재생</button>
              <button
                onClick={async () => {
                  if (!userId) return
                  await fetch('/api/favorites', { method: 'DELETE', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, trackId: it.id }) })
                  setItems(items.filter(x => x.id !== it.id))
                }}
                className="px-3 py-1 bg-red-600 rounded"
              >삭제</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
