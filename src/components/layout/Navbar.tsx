import { motion, useScroll, useSpring } from 'framer-motion'
import { ArrowUpRight } from 'lucide-react'
import ThemeToggle from '@/components/ui/ThemeToggle'
import LangToggle from '@/components/ui/LangToggle'
import { useLang } from '@/hooks/useLang'
import { useActiveSection } from '@/hooks/useActiveSection'
import { profile } from '@/data/profile'
import { featuredDemo } from '@/data/projects'
import { cn } from '@/lib/cn'

/** Sections that exist today. Add entries here as new ones land. */
const NAV_ITEMS = ['work', 'projects', 'background', 'contact'] as const

export default function Navbar() {
  const { t } = useLang()
  const active = useActiveSection(NAV_ITEMS)
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 })

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-5 sm:px-8">
        <a href="#top" className="font-display text-sm font-semibold tracking-tight">
          {profile.name}
          <span className="text-accent">.</span>
        </a>

        <div className="flex items-center gap-3 sm:gap-5">
          <ul className="hidden items-center gap-5 md:flex">
            {NAV_ITEMS.map((item) => (
              <li key={item}>
                <a
                  href={`#${item}`}
                  aria-current={active === item ? 'true' : undefined}
                  className={cn(
                    'relative text-sm transition-colors hover:text-accent',
                    active === item ? 'text-ink' : 'text-muted',
                  )}
                >
                  {t.nav[item]}
                  {active === item && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-1.5 left-0 h-px w-full bg-accent"
                    />
                  )}
                </a>
              </li>
            ))}
          </ul>

          {featuredDemo?.demo && (
            <a
              href={featuredDemo.demo}
              target="_blank"
              rel="noreferrer noopener"
              className="group hidden items-center gap-1.5 rounded-full border border-accent px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent-soft sm:inline-flex"
            >
              <span className="relative flex size-1.5">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
              </span>
              {t.nav.demo}
              <ArrowUpRight
                size={12}
                className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
          )}

          <LangToggle />
          <ThemeToggle />
        </div>
      </nav>

      <motion.div
        style={{ scaleX: progress }}
        className="absolute right-0 bottom-0 left-0 h-px origin-left bg-accent"
        aria-hidden="true"
      />
    </header>
  )
}
