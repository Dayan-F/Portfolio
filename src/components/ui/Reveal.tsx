import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'li' | 'article' | 'header' | 'section'
}

/** Scroll-triggered fade-and-rise. One place to tune the page's motion feel. */
export default function Reveal({ children, delay = 0, className, as = 'div' }: Props) {
  const Component = motion[as]

  return (
    <Component
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-70px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1], delay }}
      className={className}
    >
      {children}
    </Component>
  )
}
