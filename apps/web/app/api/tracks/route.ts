import { NextResponse } from 'next/server'
import { makePreviewUrl, makeThumbnailUrl } from '../../../lib/externalProviders'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = url.searchParams.get('q') || ''
  const page = Number(url.searchParams.get('page') || '1')
  // if no provider specified, return across all providers (don't default to youtube)
  const provider = (url.searchParams.get('provider') || '') as string

  // Mock track data with provider-preview/thumbnail fields.
  const providers = ['youtube', 'spotify', 'melon']
  const genres = ['Hip-Hop', 'Dance', 'R&B', 'Ballad', 'Pop', 'Indie']
  const all = Array.from({ length: 50 }).map((_, i) => {
    const p = providers[i % providers.length]
    const providerId = `id${i + 1}`
    const thumbnail = makeThumbnailUrl(p as any, providerId)
    // For demo: some items include a local playable preview
    const preview = i % 5 === 0 ? '/assets/sfx/vinyl-noise.mp3' : makePreviewUrl(p as any, providerId)
    const genre = genres[i % genres.length]
    return {
      id: `t-${i + 1}`,
      title: `Demo Track ${i + 1}`,
      artist: `Artist ${((i % 7) + 1)}`,
      genre,
      provider: p,
      providerId,
      thumbnail,
      preview,
    }
  })

  const pageSize = 10
  const start = (page - 1) * pageSize
  const items = all
    .filter(t => (q ? (t.title.toLowerCase().includes(q.toLowerCase()) || t.artist.toLowerCase().includes(q.toLowerCase())) : true))
    .filter(t => (provider ? t.provider === provider : true))
    .filter(t => (url.searchParams.get('genre') ? t.genre === url.searchParams.get('genre') : true))
    .slice(start, start + pageSize)
  // If a YouTube API key is configured and the request prefers YouTube
  // (provider === 'youtube' or no provider but a query exists), try a
  // live YouTube search and map results to our track shape.
  const ytKey = process.env.YOUTUBE_API_KEY
  if (ytKey && q && (!provider || provider === 'youtube')) {
    try {
      const params = new URLSearchParams({ part: 'snippet', q, type: 'video', maxResults: String(pageSize), key: ytKey })
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        const itemsYt = (data.items || []).map((it: any) => {
          const vid = it.id?.videoId
          const sn = it.snippet || {}
          return {
            id: `yt-${vid}`,
            title: sn.title,
            artist: sn.channelTitle,
            genre: genres[Math.floor(Math.random() * genres.length)],
            provider: 'youtube',
            providerId: vid,
            thumbnail: sn.thumbnails?.high?.url || sn.thumbnails?.default?.url || null,
            preview: vid ? `https://www.youtube.com/watch?v=${vid}` : null,
          }
        })
        if ((itemsYt || []).length > 0) return NextResponse.json({ items: itemsYt, page, total: itemsYt.length })
      }
    } catch (e) {
      // fallthrough to mocks if YouTube fetch fails
      console.error('YouTube fetch failed', e)
    }
  }

  // If no results and a query was provided, synthesize demo items that
  // include the query so frontend shows something relevant for the user.
  if ((items || []).length === 0 && q) {
    const synthesized = Array.from({ length: Math.min(6, pageSize) }).map((_, idx) => ({
      id: `synth-${q}-${idx + 1}`,
      title: `${q} - 추천 트랙 ${idx + 1}`,
      artist: `${q} 추천 아티스트 ${idx + 1}`,
      genre: genres[idx % genres.length],
      provider: providers[idx % providers.length],
      providerId: `synth-${idx + 1}`,
      thumbnail: makeThumbnailUrl(providers[idx % providers.length] as any, `synth-${idx + 1}`),
      preview: idx % 2 === 0 ? '/assets/sfx/vinyl-noise.mp3' : makePreviewUrl(providers[idx % providers.length] as any, `synth-${idx + 1}`),
    }))
    return NextResponse.json({ items: synthesized, page, total: synthesized.length })
  }

  return NextResponse.json({ items, page, total: all.length })
}
