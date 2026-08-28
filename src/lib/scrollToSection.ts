import type { MouseEvent } from 'react'

/**
 * In-page navigation.
 *
 * The app routes with `HashRouter`, so the URL hash *is* the router's path.
 * Letting a plain `<a href="#work">` change it would be read as a route, not an
 * anchor, and blank the page. So we scroll directly and leave the hash alone.
 * The `href` stays on the element for keyboard focus and link affordances.
 */
export function scrollToSection(id: string) {
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function sectionLinkHandler(id: string) {
  return (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault()
    scrollToSection(id)
  }
}
