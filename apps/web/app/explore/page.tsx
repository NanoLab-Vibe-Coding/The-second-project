"use client"
import React, { useState } from 'react'
import { SearchBar } from '../../components/ui/SearchBar'
import { NewsFeed } from '../../components/NewsFeed'
import { TrackList } from '../../components/TrackList'
import { TrackEditor } from '../../components/TrackEditor'
import { usePlayerStore } from '../../lib/store/playerStore'

type Track = {
  id: string
  title: string
  artist?: string
  provider?: string
  providerId?: string
  preview?: string
  thumbnail?: string
}

export default function ExplorePage() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [editing, setEditing] = useState<Track | null>(null)
  const [genre, setGenre] = useState<string | undefined>(undefined)
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const [lastQuery, setLastQuery] = useState<string>('')
  const play = usePlayerStore(s => s.playTrack)

  async function doSearch(q: string, p = 1) {
    const url = `/api/tracks?q=${encodeURIComponent(q)}&page=${p}${genre ? `&genre=${encodeURIComponent(genre)}` : ''}`
    const res = await fetch(url)
    const json = await res.json()
    setTracks(json.items || [])
    setPage(json.page || p)
    setTotal(json.total || (json.items ? json.items.length : 0))
    setLastQuery(q)
  }

  async function loadByGenre(g: string) {
    setGenre(g)
    const res = await fetch(`/api/tracks?genre=${encodeURIComponent(g)}`)
    const json = await res.json()
    setTracks(json.items || [])
    setPage(json.page || 1)
    setTotal(json.total || (json.items ? json.items.length : 0))
  }

  function handleSave(edited: Track) {
    const key = `track-edit-${edited.id}`
    localStorage.setItem(key, JSON.stringify(edited))
    setTracks(t => t.map(x => (x.id === edited.id ? edited : x)))
    setEditing(null)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold">탐색 (Explore)</h2>
      <p className="mt-2 text-sm text-gray-400">검색해서 트랙을 재생하고 메타데이터를 편집할 수 있습니다.</p>

      <div className="mt-4 flex items-center gap-3">
        <SearchBar onSearch={doSearch} />
        <div className="flex gap-2">
          {['Hip-Hop', 'Dance', 'R&B', 'Ballad', 'Pop', 'Indie'].map(g => (
            <button key={g} onClick={() => loadByGenre(g)} className="px-3 py-1 bg-gray-800 rounded text-sm">{g}</button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <TrackList tracks={tracks} onPlay={t => play(t)} onEdit={t => setEditing(t)} />

          {total > 10 && (
            <div className="mt-4 flex items-center gap-2">
              <button onClick={() => { if (page > 1 && lastQuery) doSearch(lastQuery, page - 1) ; }} className="px-2 py-1 bg-gray-800 rounded">이전</button>
              <div className="flex gap-1 overflow-x-auto px-2">
                {Array.from({ length: Math.ceil(total / 10) }).map((_, idx) => {
                  const n = idx + 1
                  return (
                    <button key={n} onClick={() => doSearch((document.querySelector('input[aria-label="검색"]') as HTMLInputElement)?.value || '', n)} className={`px-3 py-1 rounded ${n === page ? 'bg-indigo-600 text-white' : 'bg-gray-800'}`}>{n}</button>
                  )
                })}
              </div>
              <button onClick={() => { const max = Math.ceil(total / 10); if (page < max && lastQuery) doSearch(lastQuery, page + 1) }} className="px-2 py-1 bg-gray-800 rounded">다음</button>
            </div>
          )}
        </div>
        <aside>
          <h4 className="text-sm text-gray-400 mb-2">관련 뉴스</h4>
          <div>
            <NewsFeed genre={genre} />
          </div>
        </aside>
      </div>

      <TrackEditor track={editing} onClose={() => setEditing(null)} onSave={handleSave} />
    </div>
  )
}
