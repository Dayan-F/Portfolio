import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import Work from '@/components/sections/Work'
import Projects from '@/components/sections/Projects'
import Background from '@/components/sections/Background'
import Contact from '@/components/sections/Contact'

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
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
