"use client"
import React, { useEffect, useState } from 'react'

export function UserMenu() {
  const [user, setUser] = useState<any | null>(null)

  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(j => {
        if (j.user) setUser(j.user)
      })
      .catch(() => {})
  }, [])

  async function doLogout() {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    setUser(null)
    location.reload()
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a href="/login" className="text-sm hover:underline">로그인</a>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <div className="text-sm">{user.name || user.email}</div>
      <button onClick={doLogout} className="px-3 py-1 bg-gray-800 rounded text-sm">로그아웃</button>
    </div>
  )
}

