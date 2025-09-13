import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

function resolveDataDir() {
  const cwd = process.cwd()
  const candidates = [
    path.join(cwd, 'data'),
    path.join(cwd, 'playlist', 'apps', 'web', 'data'),
    path.join(cwd, 'apps', 'web', 'data'),
  ]
  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) return c
    } catch (e) {}
  }
  const dest = candidates[0]
  fs.mkdirSync(dest, { recursive: true })
  return dest
}

const DATA_DIR = resolveDataDir()
const USERS_FILE = path.join(DATA_DIR, 'users.json')

function readUsers() {
  try {
    if (!fs.existsSync(USERS_FILE)) return []
    const raw = fs.readFileSync(USERS_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('readUsers error', e)
    return []
  }
}

export async function GET(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const m = cookie.match(/pl_auth=([^;]+)/)
  if (!m) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  try {
    const token = m[1]
    const decoded = Buffer.from(token, 'base64').toString('utf-8')
    const userId = decoded.split(':')[0]
    const users = readUsers()
    const user = users.find((u: any) => u.id === userId)
    if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
    return NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  } catch (e) {
    return NextResponse.json({ error: 'unauthenticated' }, { status: 401 })
  }
}

