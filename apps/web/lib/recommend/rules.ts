/*
  rules.ts
  - Simple rule-based recommender which assigns scores based on input
    attributes and returns top N mock tracks.
  - Keep this pure and deterministic for easy unit testing.
*/

type Input = { mood?: string; genre?: string; era?: string; activity?: string }

export function recommendTracks(input: Input, limit = 10) {
  const seed = `${input.mood || 'any'}|${input.genre || 'any'}|${input.era || 'any'}|${input.activity || 'any'}`
  // generate deterministic mock tracks based on seed
  const tracks = Array.from({ length: 50 }).map((_, i) => {
    const score = scoreForTrack(i, seed)
    return {
      id: `t-${i + 1}`,
      title: `Sample Track ${i + 1}`,
      artist: `Artist ${(i % 8) + 1}`,
      tempo: 80 + (i % 80),
      score,
      preview: `/assets/sfx/vinyl-noise.mp3`,
    }
  })

  tracks.sort((a, b) => b.score - a.score)
  return tracks.slice(0, limit)
}

function scoreForTrack(i: number, seed: string) {
  // deterministic pseudo-random scoring influenced by seed and index
  let s = 0
  if (seed.includes('calm')) s += 10 - (i % 10)
  if (seed.includes('energetic')) s += (i % 20)
  if (seed.includes('rock')) s += (i % 7)
  s += (100 - (i % 100)) / 100
  return Math.round(s * 10) / 10
}

