import { useEffect, useState } from 'react'

/** Returns the id of the section currently closest to the top of the viewport. */
export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null)

  useEffect(() => {
    const elements = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null)

    if (elements.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)

        if (visible[0]) setActive(visible[0].target.id)
      },
      { rootMargin: '-20% 0px -70% 0px' },
    )

    elements.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return active
}
