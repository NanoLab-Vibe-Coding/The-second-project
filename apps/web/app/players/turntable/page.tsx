import dynamic from 'next/dynamic'
const Turntable = dynamic(() => import('../../../components/players/Turntable').then(m => m.Turntable), { ssr: false })

export default function TurntablePage() {
  return (
    <div>
      <h2 className="text-2xl font-bold">턴테이블 플레이어</h2>
      <div className="mt-6">
        <Turntable />
      </div>
    </div>
  )
}

/*
 - Client-only turntable page. The heavy gesture/animation logic lives in the
   `Turntable` component under components/players.
*/

