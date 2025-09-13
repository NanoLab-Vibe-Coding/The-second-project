import { NextResponse } from 'next/server'
import { mockNewsForGenre } from '../../../lib/news'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || ''
  const genre = url.searchParams.get('genre') || ''

  // If NEWSAPI_KEY is set in environment, proxy a request to NewsAPI.org
  const key = process.env.NEWSAPI_KEY
  if (key) {
    try {
      // prefer explicit query `q`, fallback to genre or 'music'
      const query = q || genre || 'music'
      const params = new URLSearchParams({ q: query, language: 'ko', pageSize: '6' })
      const res = await fetch(`https://newsapi.org/v2/everything?${params.toString()}`, {
        headers: { 'X-Api-Key': key }
      })
      if (!res.ok) throw new Error('newsapi error')
      const data = await res.json()
      // map to our frontend shape
      const items = (data.articles || []).map((a: any, i: number) => ({
        id: `news-${i}-${Date.parse(a.publishedAt || '')}`,
        title: a.title,
        summary: a.description || a.content || '',
        url: a.url,
        date: a.publishedAt,
        image: a.urlToImage || null,
        source: a.source?.name || null,
      }))
      return NextResponse.json({ items })
    } catch (e) {
      // fallthrough to mock
      console.error('NewsAPI fetch failed', e)
    }
  }

  const items = mockNewsForGenre(q || genre)
  return NextResponse.json({ items })
}
