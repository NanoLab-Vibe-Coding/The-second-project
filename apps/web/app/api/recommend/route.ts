import { NextResponse } from 'next/server'
import { recommendTracks } from '../../../lib/recommend/rules'

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))
  // body: { mood, genre, era, activity }
  const tracks = recommendTracks(body || {})
  return NextResponse.json({ tracks })
}

/*
 - Simple, light-weight recommendation endpoint.
 - Uses `lib/recommend/rules.ts` for rule-based logic. This is intentionally
   simple and synchronous so it can run without external services.
 - Next.js App Router: route handlers export functions like `POST` and return
   a NextResponse.
*/
