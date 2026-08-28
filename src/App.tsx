import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import Projects from '@/components/sections/Projects'
import Background from '@/components/sections/Background'
import Contact from '@/components/sections/Contact'

// The playground pulls in the Anthropic SDK and the graph runtime, so it stays
// out of the landing page bundle and loads only when someone opens it.
const AgentPlayground = lazy(() => import('@/demos/agents/AgentPlayground'))

function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main id="top" className="flex-1">
        <Hero />
        <Work />
        <Projects />
        <Background />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

function LoadingFallback() {
  return (
    <div className="grid min-h-screen place-items-center">
      <div className="size-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/demo/agents" element={<AgentPlayground />} />
      </Routes>
    </Suspense>
  )
}
