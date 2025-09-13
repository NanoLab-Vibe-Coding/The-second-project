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
const FAV_FILE = path.join(DATA_DIR, 'favorites.json')

function readFavs() {
  try {
    if (!fs.existsSync(FAV_FILE)) return {}
    const raw = fs.readFileSync(FAV_FILE, 'utf-8')
    return JSON.parse(raw)
  } catch (e) {
    console.error('readFavs error', e)
    return {}
  }
}

function writeFavs(obj: any) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(FAV_FILE, JSON.stringify(obj, null, 2))
  } catch (e) {
    console.error('writeFavs error', e)
    throw e
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const userId = url.searchParams.get('userId')
  if (!userId) return NextResponse.json({ error: 'missing userId' }, { status: 400 })
  const favs = readFavs()
  return NextResponse.json({ items: favs[userId] || [] })
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { userId, track } = body
  if (!userId || !track) return NextResponse.json({ error: 'missing' }, { status: 400 })
  const favs = readFavs()
  favs[userId] = favs[userId] || []
  // avoid duplicates
  if (!favs[userId].find((t: any) => t.id === track.id)) favs[userId].push(track)
  writeFavs(favs)
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: Request) {
  const body = await req.json().catch(() => ({}))
  const { userId, trackId } = body
  if (!userId || !trackId) return NextResponse.json({ error: 'missing' }, { status: 400 })
  const favs = readFavs()
  favs[userId] = (favs[userId] || []).filter((t: any) => t.id !== trackId)
  writeFavs(favs)
  return NextResponse.json({ ok: true })
}
