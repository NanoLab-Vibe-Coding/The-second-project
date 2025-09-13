"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const res = await fetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }), headers: { 'Content-Type': 'application/json' } })
    const json = await res.json()
    if (!res.ok) setError(json.error || '로그인 실패')
    else router.push('/')
  }

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded">
      <h2 className="text-xl font-bold mb-4">로그인</h2>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <form onSubmit={submit} className="space-y-3">
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 bg-gray-800 rounded" />
        <input value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full p-2 bg-gray-800 rounded" />
        <div className="flex gap-2">
          <button type="submit" className="px-3 py-2 bg-indigo-600 rounded">로그인</button>
          <a href="/register" className="px-3 py-2 bg-gray-700 rounded">회원가입</a>
        </div>
      </form>
    </div>
  )
}

