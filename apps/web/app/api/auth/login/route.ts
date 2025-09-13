import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'

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

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { email, password } = body
  if (!email || !password) return NextResponse.json({ error: 'email/password required' }, { status: 400 })

  const users = readUsers()
  const user = users.find((u: any) => u.email === email)
  if (!user) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // verify
  const hash = crypto.createHmac('sha256', user.salt).update(password).digest('hex')
  if (hash !== user.hash) return NextResponse.json({ error: 'invalid' }, { status: 401 })

  const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64')
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set('pl_auth', token, { httpOnly: true })
  return res
}
