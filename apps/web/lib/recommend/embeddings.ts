/*
  embeddings.ts
  - Mock vector embedding utilities for content-based reranking.
  - This file provides a small helper to compute cosine similarity between
    toy vectors for demonstration (no external vector DB required).
*/

export function cosineSimilarity(a: number[], b: number[]) {
  const dot = a.reduce((s, v, i) => s + v * (b[i] ?? 0), 0)
  const magA = Math.sqrt(a.reduce((s, v) => s + v * v, 0))
  const magB = Math.sqrt(b.reduce((s, v) => s + v * v, 0))
  if (magA === 0 || magB === 0) return 0
  return dot / (magA * magB)
}

export function mockEmbedTrack(i: number) {
  // simple deterministic mock vector based on index
  return [Math.sin(i), Math.cos(i), (i % 10) / 10, ((i * 37) % 100) / 100]
}

