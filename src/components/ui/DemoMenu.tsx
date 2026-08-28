import { useEffect, useId, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown, Play } from 'lucide-react'
import { useLang } from '@/hooks/useLang'
import { projects } from '@/data/projects'
import { cn } from '@/lib/cn'

type Props = {
  /** `nav` is the compact pill in the header, `hero` the larger one above the fold. */
  variant?: 'nav' | 'hero'
}

/**
 * There is more than one live demo now, so both entry points offer the choice
 * instead of silently favouring whichever project happens to be listed first.
 * One menu, two triggers, so the two can never drift apart.
 */
export default function DemoMenu({ variant = 'nav' }: Props) {
  const { t } = useLang()
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const menuId = useId()
  const isHero = variant === 'hero'

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  // Whatever is runnable, in the order the projects list gives them. Adding a
  // project with a `demo` or a `route` puts it in here with no extra wiring.
  const runnable = projects.filter((project) => project.route || project.demo)

  const itemClass =
    'flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-alt focus-visible:bg-bg-alt'

  return (
    <div ref={container} className={cn('relative', !isHero && 'hidden sm:block')}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-controls={open ? menuId : undefined}
        className={cn(
          'group inline-flex items-center rounded-full border border-accent font-medium text-accent transition-colors hover:bg-accent-soft',
          isHero ? 'gap-2 px-5 py-2.5 text-sm' : 'gap-1.5 px-3 py-1.5 text-xs',
        )}
      >
        {isHero ? (
          <Play size={13} className="fill-current" />
        ) : (
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
        )}
        {isHero ? t.hero.demo : t.nav.demo}
        <ChevronDown
          size={isHero ? 14 : 12}
          className={cn('transition-transform', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              'absolute z-50 mt-2 w-72 overflow-hidden rounded-xl border border-border bg-surface shadow-[var(--shadow)]',
              // The hero button sits at the left edge; the navbar one at the right.
              isHero ? 'left-0' : 'right-0',
            )}
          >
            {runnable.map((project, index) => {
              const rowClass = cn(
                itemClass,
                'group/item',
                index < runnable.length - 1 && 'border-b border-border',
              )

              const body = (
                <>
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-sm font-medium text-ink">
                      {project.name}
                      {!project.route && (
                        <ArrowUpRight
                          size={12}
                          className="text-faint transition-transform group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5"
                        />
                      )}
                    </span>
                    <span className="mt-0.5 block text-xs text-faint">
                      {project.route ? t.demos.menu.here : t.demos.menu.hosted}
                    </span>
                  </span>
                </>
              )

              return project.route ? (
                <Link
                  key={project.id}
                  to={project.route}
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={rowClass}
                >
                  {body}
                </Link>
              ) : (
                <a
                  key={project.id}
                  href={project.demo}
                  target="_blank"
                  rel="noreferrer noopener"
                  role="menuitem"
                  onClick={() => setOpen(false)}
                  className={rowClass}
                >
                  {body}
                </a>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
