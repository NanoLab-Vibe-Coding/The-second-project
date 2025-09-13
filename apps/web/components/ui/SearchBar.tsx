"use client"
import React, { useState } from 'react'

export function SearchBar({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState('')
  return (
    <div className="flex gap-2">
      <input
        aria-label="검색"
        value={q}
        onChange={e => setQ(e.target.value)}
        onKeyDown={e => {
          if (e.key === 'Enter') onSearch(q)
        }}
        className="flex-1 px-3 py-2 bg-gray-800 rounded"
        placeholder="트랙/아티스트 검색 (YouTube, Spotify, Melon)"
      />
      <button
        onClick={() => onSearch(q)}
        className="px-3 py-2 bg-indigo-600 rounded"
      >
        검색
      </button>
    </div>
  )
}

/*
 - Simple search input used in Explore. Triggers `onSearch` on Enter or button.
*/

