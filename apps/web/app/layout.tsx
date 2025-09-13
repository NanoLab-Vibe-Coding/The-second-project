import '../styles/globals.css'
import dynamic from 'next/dynamic'

const UserMenu = dynamic(() => import('../components/UserMenu').then(m => m.UserMenu), { ssr: false })

export const metadata = {
  title: 'Playlist - 사용자 취향 기반 플레이리스트 추천',
  description: '턴테이블, CD, 테이프, 바이닐 플레이어와 추천 API 데모 (ko-KR)'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body className="bg-gray-950 text-gray-100 antialiased">
        <header className="p-4 border-b border-gray-800">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-semibold">Playlist</h1>
              <nav className="space-x-4 text-sm opacity-90 hidden sm:block">
                <a href="/" className="hover:underline">홈</a>
                <a href="/players/turntable" className="hover:underline">턴테이블</a>
                <a href="/explore" className="hover:underline">탐색</a>
              </nav>
            </div>

            <div className="flex items-center gap-3">
              <a href="/account/favorites" className="text-sm hover:underline">즐겨찾기</a>
              <UserMenu />
            </div>
          </div>
        </header>
        <main className="max-w-6xl mx-auto p-6">{children}</main>
      </body>
    </html>
  )
}

/*
 Notes:
 - This is the global layout. Client-only interactive parts should be placed
   in components with "use client" to avoid mixing server/client concerns.
 - Tailwind via `styles/globals.css` is applied here.
*/
