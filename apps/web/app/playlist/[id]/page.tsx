import React from 'react'

type Props = { params: { id: string } }

export default function PlaylistPage({ params }: Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold">플레이리스트: {params.id}</h2>
      <p className="mt-2 text-sm text-gray-400">트랙 리스트, 유사 플레이리스트 추천, 공유/복제 기능 샘플</p>
    </div>
  )
}

