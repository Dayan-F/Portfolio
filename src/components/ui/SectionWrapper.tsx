import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Props = {
  id: string
  children: ReactNode
  className?: string
}

export default function SectionWrapper({ id, children, className }: Props) {
  return (
    <section id={id} className={cn('mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 sm:py-28', className)}>
      {children}
    </section>
  )
}
