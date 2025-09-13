import dynamic from 'next/dynamic'

const HomeMain = dynamic(() => import('../components/HomeMain').then(m => m.default), { ssr: false })

export default function HomePage() {
  return (
    <div>
      <HomeMain />
    </div>
  )
}

/* Notes:
 - This page imports a dynamic client-side Visualizer component to avoid
   server-side rendering issues with Web Audio / Canvas.
*/
