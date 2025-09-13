/*
  externalProviders.ts
  - Mock helpers to construct preview and thumbnail URLs for various
    providers (YouTube, Spotify, Melon). Real API integrations require
    OAuth/API keys and are outside the scope of this demo; these helpers
    provide embeddable preview/thumbnail URLs or fallbacks.

  References:
  - YouTube thumbnail format: https://img.youtube.com/vi/<VIDEO_ID>/hqdefault.jpg
  - Spotify images typically require API; here we return placeholder URLs.
*/

export type Provider = 'youtube' | 'spotify' | 'melon' | 'local'

export function makePreviewUrl(provider: Provider, idOrUrl: string) {
  switch (provider) {
    case 'youtube':
      // Use embedded YouTube preview (watch URL). For audio preview we can
      // use the m.youtube.com/watch?v=... or a youtube-nocookie embed. In demo
      // we'll point to a watch URL — the AudioEngine can play a direct audio
      // stream if available; otherwise use placeholder preview.
      return `https://www.youtube.com/watch?v=${idOrUrl}`
    case 'spotify':
      // Spotify streaming requires auth; return a placeholder or open web link
      return `https://open.spotify.com/track/${idOrUrl}`
    case 'melon':
      return `https://www.melon.com/song/detail.htm?songId=${idOrUrl}`
    case 'local':
    default:
      return idOrUrl
  }
}

export function makeThumbnailUrl(provider: Provider, idOrUrl: string) {
  switch (provider) {
    case 'youtube':
      return `https://img.youtube.com/vi/${idOrUrl}/hqdefault.jpg`
    case 'spotify':
      // Spotify thumbnails normally require API; return a generic CDN-style URL
      return `https://i.scdn.co/image/${idOrUrl}`
    case 'melon':
      // No public thumbnail pattern; return a neutral placeholder (external)
      return 'https://via.placeholder.com/320x180?text=Melon+Cover'
    case 'local':
    default:
      return '/assets/covers/placeholder.jpg'
  }
}

