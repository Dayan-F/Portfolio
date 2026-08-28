import { useId, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import DetectionFrame from '@/components/ui/DetectionFrame'
import StatTile from '@/components/ui/StatTile'
import type { Role } from '@/data/experiences'
import { useLang } from '@/hooks/useLang'
import { cn } from '@/lib/cn'

type Props = {
  role: Role
  index: number
}

export default function CaseStudy({ role, index }: Props) {
  const { lang, t } = useLang()
  const [open, setOpen] = useState(false)
  const panelId = useId()

  const content = role[lang]
  const isCurrent = role.end === null

  return (
    <article className="grid gap-8 lg:grid-cols-12 lg:gap-12">
      {/* Identity column — sticks while the case study scrolls past */}
      <aside className="lg:col-span-4 lg:sticky lg:top-24 lg:self-start">
        <div className="flex items-start gap-4">
          {role.logo && (
            <DetectionFrame className="shrink-0 p-1.5" active={isCurrent}>
              <img
                src={role.logo}
                alt=""
                loading="lazy"
                className="size-12 rounded-md bg-white object-contain p-1"
              />
            </DetectionFrame>
          )}
          <div className="min-w-0">
            <span className="font-mono text-xs text-faint">
              {String(index + 1).padStart(2, '0')}
            </span>
            <h3 className="font-display text-xl leading-tight font-semibold">
              {role.orgUrl ? (
                <a
                  href={role.orgUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group inline-flex items-center gap-1 transition-colors hover:text-accent"
                >
                  {role.org}
                  <ArrowUpRight
                    size={14}
                    className="text-faint transition-transform group-hover:-translate-y-0.5 group-hover:text-accent"
                  />
                </a>
              ) : (
                role.org
              )}
            </h3>
          </div>
        </div>

        <dl className="mt-5 space-y-2.5 border-l border-border pl-4 text-sm">
          <div>
            <dt className="sr-only">Role</dt>
            <dd className="text-ink">{content.role}</dd>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <dt className="sr-only">Period</dt>
            <dd className="font-mono text-xs text-muted">{content.period}</dd>
            {isCurrent && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 font-mono text-[10px] text-accent">
                {t.work.current}
              </span>
            )}
          </div>
          <div>
            <dt className="sr-only">Location</dt>
            <dd className="font-mono text-xs text-faint">{role.location}</dd>
          </div>
        </dl>

        <div className="mt-5">
          <h4 className="mb-2 font-mono text-[10px] tracking-wider text-faint uppercase">
            {t.work.stack}
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {role.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] text-muted"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </aside>

      {/* Narrative column */}
      <div className="lg:col-span-8">
        <p className="font-display text-[clamp(1.5rem,3vw,2rem)] leading-[1.2] font-semibold tracking-[-0.015em] text-balance">
          {content.headline}
        </p>

        <p className="mt-5 max-w-2xl leading-relaxed text-muted">{content.narrative}</p>

        {/* Columns follow the number of stats, so a role with two does not sit
            in a three-column grid with a hole where the third would be. */}
        <div
          className={cn(
            'mt-8 grid gap-5',
            content.stats.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-3',
          )}
        >
          {content.stats.map((stat) => (
            <StatTile key={stat.label} value={stat.value} label={stat.label} />
          ))}
        </div>

        <div className="mt-8">
          <h4 className="mb-3 font-mono text-[10px] tracking-wider text-faint uppercase">
            {t.work.focus}
          </h4>
          <ul className="flex flex-wrap gap-2">
            {content.focus.map((item) => (
              <li
                key={item}
                className="rounded-lg bg-bg-alt px-3 py-1.5 text-[13px] text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="mt-8 inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-accent"
        >
          {open ? t.work.hideDetails : t.work.details}
          <ChevronDown
            size={13}
            className={cn('transition-transform duration-200', open && 'rotate-180')}
          />
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              id={panelId}
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <ul className="mt-5 space-y-3 border-t border-border pt-5">
                {content.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-3 text-sm text-muted">
                    <span
                      className="mt-2 size-1 shrink-0 rounded-full bg-accent"
                      aria-hidden="true"
                    />
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </article>
  )
}
