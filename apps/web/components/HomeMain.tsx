"use client"
import React, { useState } from 'react'
import { SearchBar } from './ui/SearchBar'
import { TrackList } from './TrackList'
import { TrackEditor } from './TrackEditor'
import { VisualizerCanvas } from './audio/VisualizerCanvas'
import { NewsFeed } from './NewsFeed'
import { usePlayerStore } from '../lib/store/playerStore'
import { GlobalAudioPlayer } from './GlobalAudioPlayer'

type Track = {
  id: string
  title: string
  artist?: string
  provider?: string
  providerId?: string
  preview?: string
  thumbnail?: string
}

export default function HomeMain() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [editing, setEditing] = useState<Track | null>(null)
  const [loading, setLoading] = useState(false)
  const [mood, setMood] = useState('any')
  const [genre, setGenre] = useState<string | undefined>(undefined)
  const [mode, setMode] = useState('default')
  const [lastQuery, setLastQuery] = useState<string | undefined>(undefined)
  const [page, setPage] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)
  const play = usePlayerStore(s => s.playTrack)

  async function doSearch(q: string, p = 1) {
    setLoading(true)
    try {
      const res = await fetch(`/api/tracks?q=${encodeURIComponent(q)}&page=${p}`)
      const json = await res.json()
      setTracks(json.items || [])
      setLastQuery(q)
      setPage(json.page || p)
      setTotal(json.total || (json.items ? json.items.length : 0))
    } finally {
      setLoading(false)
    }
  }

  async function doRecommend() {
    setLoading(true)
    try {
      const body = { mood, genre: 'any', era: 'any', activity: 'any' }
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      setTracks(json.tracks || [])
    } finally {
      setLoading(false)
    }
  }

  function handleSave(t: Track) {
    localStorage.setItem(`track-edit-${t.id}`, JSON.stringify(t))
    setTracks(s => s.map(x => (x.id === t.id ? t : x)))
    setEditing(null)
  }

  return (
    <div className="space-y-6">
      <GlobalAudioPlayer />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 bg-gradient-to-br from-indigo-800 via-gray-900 to-black rounded-lg shadow-md">
            <h2 className="text-4xl font-extrabold">모두를 위한 음악 발견</h2>
            <p className="text-gray-300 mt-2">검색하고, 감정/모드 기반 추천을 받고 즐겨찾기에 저장하세요.</p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <SearchBar onSearch={doSearch} />
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select value={mood} onChange={e => setMood(e.target.value)} className="bg-gray-800 p-2 rounded text-sm">
                  <option value="any">감정: 전체</option>
                  <option value="calm">차분한</option>
                  <option value="energetic">활기찬</option>
                  <option value="happy">기쁜</option>
                  <option value="sad">슬픈</option>
                  <option value="nostalgic">향수</option>
                  <option value="romantic">로맨틱</option>
                </select>

                <select value={mode} onChange={e => setMode(e.target.value)} className="bg-gray-800 p-2 rounded text-sm">
                  <option value="default">모드: 일반</option>
                  <option value="party">파티</option>
                  <option value="study">공부/집중</option>
                  <option value="workout">운동</option>
                  <option value="relax">휴식</option>
                  <option value="sleep">수면</option>
                  <option value="commute">출퇴근</option>
                </select>

                <select value={genre ?? ''} onChange={e => setGenre(e.target.value || undefined)} className="bg-gray-800 p-2 rounded text-sm">
                  <option value="">장르: 전체</option>
                  <option value="K-Pop">K-Pop</option>
                  <option value="Hip-Hop">Hip-Hop</option>
                  <option value="Dance">Dance</option>
                  <option value="R&B">R&amp;B</option>
                  <option value="Ballad">Ballad</option>
                  <option value="Pop">Pop</option>
                  <option value="Indie">Indie</option>
                  <option value="Jazz">Jazz</option>
                  <option value="Classical">Classical</option>
                  <option value="Electronic">Electronic</option>
                  <option value="Rock">Rock</option>
                </select>

                <button onClick={doRecommend} className="px-4 py-2 bg-white/10 text-white rounded">추천 받기</button>
                {loading && <div className="text-sm text-gray-200">로딩 중...</div>}
              </div>
            </div>
          </div>

          <div className="mt-4">
            <TrackList tracks={tracks} onPlay={t => play(t)} onEdit={t => setEditing(t)} />

            {/* Pagination controls */}
            {total > 10 && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <button
                  onClick={() => {
                    if (page > 1 && lastQuery) doSearch(lastQuery, page - 1)
                  }}
                  className="px-2 py-1 bg-gray-800 rounded"
                >이전</button>
                <div className="flex gap-1 overflow-x-auto px-2">
                  {Array.from({ length: Math.ceil(total / 10) }).map((_, idx) => {
                    const n = idx + 1
                    return (
                      <button
                        key={n}
                        onClick={() => lastQuery && doSearch(lastQuery, n)}
                        className={`px-3 py-1 rounded ${n === page ? 'bg-indigo-600 text-white' : 'bg-gray-800'}`}
                      >{n}</button>
                    )
                  })}
                </div>
                <button
                  onClick={() => {
                    const max = Math.ceil(total / 10)
                    if (page < max && lastQuery) doSearch(lastQuery, page + 1)
                  }}
                  className="px-2 py-1 bg-gray-800 rounded"
                >다음</button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="p-4 bg-gradient-to-b from-gray-900 to-gray-800 rounded shadow">
            <h3 className="font-semibold">시각화</h3>
            <div className="mt-3">
              <VisualizerCanvas />
            </div>
          </div>
          <div className="p-4 bg-gray-900 rounded shadow">
            <h3 className="font-semibold">현재 재생</h3>
            <PlayerSummary />
          </div>

          <div>
            {/* News feed for selected genre */}
            <div className="mt-2">
              <h4 className="text-sm text-gray-400 mb-2">관련 뉴스: {lastQuery ?? genre ?? 'Music'}</h4>
              <div>
                {/* NewsFeed는 검색어(q) 또는 장르(genre)를 사용합니다 */}
                <NewsFeed genre={genre} q={lastQuery} />
              </div>
            </div>
          </div>
        </aside>
      </div>

      <TrackEditor track={editing} onClose={() => setEditing(null)} onSave={handleSave} />
    </div>
  )
}

function PlayerSummary() {
  const current = usePlayerStore(s => s.current)
  const playing = usePlayerStore(s => s.playing)
  return (
    <div>
      {current ? (
        <div className="flex items-center gap-3">
          <img src={current.thumbnail} className="w-12 h-12 object-cover rounded" />
          <div>
            <div className="font-semibold">{current.title}</div>
            <div className="text-sm text-gray-400">{current.artist}</div>
            <div className="text-sm text-green-400">{playing ? '재생 중' : '일시정지'}</div>
          </div>
        </div>
      ) : (
        <div className="text-sm text-gray-400">재생 중인 트랙 없음</div>
      )}
    </div>
  )
}
