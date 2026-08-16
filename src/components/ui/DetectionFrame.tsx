import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  children: ReactNode
  className?: string
  /** Small monospace tag in the corner, like a detection class label. */
  label?: string
  /** Corner ticks stay accent-coloured instead of waiting for hover. */
  active?: boolean
}

const CORNERS = [
  'left-0 top-0 border-l-2 border-t-2',
  'right-0 top-0 border-r-2 border-t-2',
  'left-0 bottom-0 border-l-2 border-b-2',
  'right-0 bottom-0 border-r-2 border-b-2',
]

/**
 * Bounding-box corner ticks — the visual signature of the site, borrowed
 * from the object-detection overlays this work is actually made of.
 */
export default function DetectionFrame({ children, className, label, active = false }: Props) {
  return (
    <div className={cn('group/frame relative', className)}>
      {CORNERS.map((corner) => (
        <span
          key={corner}
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute z-20 size-4 transition-colors duration-300',
            active
              ? 'border-accent'
              : 'border-border-strong group-hover/frame:border-accent',
            corner,
          )}
        />
      ))}

      {label && (
        <span
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute -top-2.5 left-5 z-20 bg-bg px-1.5 font-mono text-[10px] tracking-wide transition-colors duration-300',
            active ? 'text-accent' : 'text-faint group-hover/frame:text-accent',
          )}
        >
          {label}
        </span>
      )}

      {children}
    </div>
  )
}
