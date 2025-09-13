/*
  news.ts
  - Mock news/article provider. Returns recent items related to a genre.
  - In production this could call a news API (e.g., NewsAPI.org) or a music blog feed.
*/

export function mockNewsForGenre(genreOrQuery: string) {
  const base = genreOrQuery || 'general'
  // If the input looks like a short query, include it in titles/summaries
  return Array.from({ length: 6 }).map((_, i) => ({
    id: `${base}-n-${i + 1}`,
    title: `${base} 관련 뉴스 헤드라인 ${i + 1}`,
    summary: `${base}에 대한 최근 소식 및 분석 요약입니다. 연관 키워드: ${base}`,
    url: `https://example.com/${encodeURIComponent(base)}/article-${i + 1}`,
    date: new Date(Date.now() - i * 86400000).toISOString(),
    image: null,
    source: 'MockNews',
  }))
}
