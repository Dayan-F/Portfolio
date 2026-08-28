/**
 * Resolves a file in `public/` against the deployed base path.
 *
 * On GitHub Pages the site is served from a subdirectory, so a bare `/photo.jpg`
 * points at the domain root and 404s. Vite rewrites asset URLs it can see in the
 * bundle, but not paths written as plain strings in the data files, which is
 * where these live.
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
}
