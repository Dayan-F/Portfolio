import { useId, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

type Props = {
  title: string
  children: ReactNode
}

/**
 * A collapsed section that opens on click. Same motion and disclosure shape as
 * the responsibilities toggle on the case studies, so the two behave alike.
 */
export default function Disclosure({ title, children }: Props) {
  const [open, setOpen] = useState(false)
  const panelId = useId()

  return (
    <section className="border-t border-border">
      <h2>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls={panelId}
          className="group flex w-full items-center gap-3 py-5 text-left transition-colors hover:text-accent"
        >
          <span className="font-display text-xl font-semibold tracking-tight">{title}</span>
          <ChevronDown
            size={16}
            className={cn(
              'ml-auto shrink-0 text-faint transition-transform duration-200 group-hover:text-accent',
              open && 'rotate-180',
            )}
          />
        </button>
      </h2>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            key="panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-6">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
