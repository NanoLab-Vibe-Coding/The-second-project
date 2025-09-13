"use client"
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export function NewsFeed({ genre, q }: { genre?: string; q?: string | null }) {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    else if (genre) params.set('genre', genre)
    fetch(`/api/news?${params.toString()}`)
      .then(r => r.json())
      .then(j => setItems(j.items || []))
      .finally(() => setLoading(false))
  }, [genre, q])

  return (
    <div className="p-4 bg-gray-900 rounded space-y-2">
      <h4 className="font-semibold">관련 뉴스</h4>
      {loading && <div className="text-sm text-gray-400">로딩...</div>}
      <motion.ul layout className="space-y-3">
        {items.map((it, idx) => (
          <motion.li
            key={it.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            whileHover={{ scale: 1.02 }}
            className="flex gap-3 items-start bg-gray-800 p-3 rounded hover:shadow-lg"
          >
            {it.image ? (
              <img src={it.image} loading="lazy" alt="thumb" className="w-24 h-14 object-cover rounded" />
            ) : (
              <div className="w-24 h-14 bg-gray-700 rounded" />
            )}
            <div className="flex-1">
              <a href={it.url} target="_blank" rel="noreferrer" className="text-sm text-gray-200 font-semibold hover:underline">{it.title}</a>
              <div className="text-xs text-gray-400">{it.source} • {new Date(it.date).toLocaleDateString('ko-KR')}</div>
              <div className="text-sm text-gray-500 mt-1">{it.summary}</div>
            </div>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
