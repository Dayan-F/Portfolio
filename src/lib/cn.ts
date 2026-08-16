/** Tiny classname joiner — falsy values are dropped. */
export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}
