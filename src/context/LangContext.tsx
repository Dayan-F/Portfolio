import { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ui, type Lang, type UI } from '@/i18n/ui'

type LangValue = {
  lang: Lang
  setLang: (lang: Lang) => void
  toggleLang: () => void
  /** Namespaced UI strings for the active language. */
  t: UI
}

// eslint-disable-next-line react-refresh/only-export-components
export const LangContext = createContext<LangValue | null>(null)

function initialLang(): Lang {
  const stored = localStorage.getItem('lang')
  if (stored === 'fr' || stored === 'en') return stored
  return navigator.language.toLowerCase().startsWith('fr') ? 'fr' : 'en'
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(initialLang)

  useEffect(() => {
    localStorage.setItem('lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'fr' ? 'en' : 'fr'))
  }, [])

  const value = useMemo<LangValue>(
    () => ({ lang, setLang, toggleLang, t: ui[lang] as UI }),
    [lang, toggleLang],
  )

  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}
