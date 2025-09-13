import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

// Resolve a data directory robustly: prefer ./data under the app cwd, but
// also accept repository-root path for different startup cwd.
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
  // default to first candidate and ensure it exists
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

function writeUsers(users: any[]) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2))
  } catch (e) {
    console.error('writeUsers error', e)
    throw e
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email, password, name } = body
  if (!email || !password) return NextResponse.json({ error: 'email/password required' }, { status: 400 })

  const users = readUsers()
  if (users.find((u: any) => u.email === email)) {
    return NextResponse.json({ error: 'user_exists' }, { status: 409 })
  }

  // Simple hash for demo purposes
  const salt = crypto.randomBytes(8).toString('hex')
  const hash = crypto.createHmac('sha256', salt).update(password).digest('hex')
  const user = { id: `u_${Date.now()}`, email, name: name || '', salt, hash }
  users.push(user)
  writeUsers(users)

  // create a simple session token cookie (not secure; demo only)
  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set('pl_auth', token, { httpOnly: true })
  return res
}
